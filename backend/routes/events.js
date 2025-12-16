const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const UserStats = require('../models/UserStats');
const calendarService = require('../services/calendarService');
const badgeService = require('../services/badgeService');
const logger = require('../utils/logger');

// Register new meeting (called from Google Add-on)
router.post('/register', async (req, res) => {
  try {
    const { eventId, agenda, mandatoryAttendees, creator } = req.body;

    if (!eventId || !agenda || !creator) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already registered
    const existing = await Meeting.findOne({ eventId });
    if (existing) {
      return res.json({ success: true, message: 'Already registered', meeting: existing });
    }

    // Fetch event details from Google Calendar
    const event = await calendarService.getEvent(eventId);

    // Parse agenda
    const agendaParsed = {
      raw: agenda,
      purpose: this.extractSection(agenda, '📍 Purpose:', '🎯'),
      outcomes: this.extractSection(agenda, '🎯 Expected Outcomes:', '⚡'),
      decisions: this.extractSection(agenda, '⚡ Decisions Needed:', '📌'),
      prereads: this.extractSection(agenda, '📌 Pre-reads')
    };

    // Calculate agenda quality score
    const agendaScore = this.calculateAgendaScore(agendaParsed);

    // Create meeting record
    const meeting = new Meeting({
      eventId,
      calendarId: event.organizer.email,
      summary: event.summary,
      agenda: agendaParsed,
      creator,
      creatorName: event.organizer.displayName || creator,
      mandatoryAttendees: mandatoryAttendees || [],
      attendees: (event.attendees || []).map(a => ({
        email: a.email,
        name: a.displayName || a.email,
        responseStatus: a.responseStatus || 'needsAction'
      })),
      startTime: new Date(event.start.dateTime || event.start.date),
      endTime: new Date(event.end.dateTime || event.end.date),
      location: event.location,
      meetingLink: event.hangoutLink,
      agendaQualityScore: agendaScore,
      status: 'scheduled'
    });

    await meeting.save();

    // Update creator stats
    await UserStats.findOneAndUpdate(
      { email: creator },
      {
        $inc: {
          meetingsOrganized: 1,
          meetingsWithAgenda: 1,
          agendaScore: agendaScore >= 70 ? 1 : 0
        }
      },
      { upsert: true }
    );

    // Evaluate badges
    await badgeService.evaluateAndAwardBadges(creator);

    logger.info(`Meeting registered: ${eventId} by ${creator}`);

    res.json({
      success: true,
      message: 'Meeting registered successfully',
      meeting: {
        id: meeting._id,
        eventId: meeting.eventId,
        summary: meeting.summary,
        agendaScore
      }
    });
  } catch (error) {
    logger.error('Error registering meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper: Extract section from agenda
function extractSection(agenda, startMarker, endMarker = null) {
  const startIdx = agenda.indexOf(startMarker);
  if (startIdx === -1) return '';

  const contentStart = startIdx + startMarker.length;
  const endIdx = endMarker ? agenda.indexOf(endMarker, contentStart) : agenda.length;

  return agenda.substring(contentStart, endIdx > -1 ? endIdx : agenda.length).trim();
}

// Helper: Calculate agenda quality score
function calculateAgendaScore(agendaParsed) {
  let score = 0;

  // Purpose (30 points)
  if (agendaParsed.purpose && agendaParsed.purpose.length > 20) score += 30;
  else if (agendaParsed.purpose && agendaParsed.purpose.length > 10) score += 15;

  // Outcomes (30 points)
  if (agendaParsed.outcomes && agendaParsed.outcomes.length > 20) score += 30;
  else if (agendaParsed.outcomes && agendaParsed.outcomes.length > 10) score += 15;

  // Decisions (25 points)
  if (agendaParsed.decisions && agendaParsed.decisions.length > 20) score += 25;
  else if (agendaParsed.decisions && agendaParsed.decisions.length > 10) score += 12;

  // Pre-reads (15 points)
  if (agendaParsed.prereads && agendaParsed.prereads.length > 10) score += 15;

  return score;
}

// Update RSVP
router.post('/rsvp', async (req, res) => {
  try {
    const { eventId, userEmail, responseStatus } = req.body;

    if (!eventId || !userEmail || !responseStatus) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update in Google Calendar and DB
    await calendarService.updateRSVP(eventId, userEmail, responseStatus);

    // Update user stats
    const meeting = await Meeting.findOne({ eventId });
    const attendee = meeting?.attendees.find(a => a.email === userEmail);

    if (attendee && attendee.reminderCount <= 1) {
      // Responded on time
      await UserStats.findOneAndUpdate(
        { email: userEmail },
        {
          $inc: {
            rsvpScore: 1,
            rsvpsOnTime: 1,
            currentRSVPStreak: 1
          },
          $set: { lastRSVPDate: new Date() }
        },
        { upsert: true }
      );
    }

    // Evaluate badges
    await badgeService.evaluateAndAwardBadges(userEmail);

    logger.info(`RSVP updated: ${userEmail} ${responseStatus} for ${eventId}`);

    res.json({ success: true, message: 'RSVP updated' });
  } catch (error) {
    logger.error('Error updating RSVP:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get meeting details
router.get('/:eventId', async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ eventId: req.params.eventId });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ success: true, meeting });
  } catch (error) {
    logger.error('Error fetching meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;