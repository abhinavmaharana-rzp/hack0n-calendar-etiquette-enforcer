const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const UserStats = require('../models/UserStats');
const calendarService = require('../services/calendarService');
const badgeService = require('../services/badgeService');
const logger = require('../utils/logger');
const agendaAnalyzer = require('../services/agendaAnalyser')
const meetingValidator = require('../services/meetingValidator');

router.post('/register', async (req, res) => {
  try {
    const { eventId, agenda, mandatoryAttendees, creator } = req.body;

    if (!eventId || !creator) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already registered
    const existing = await Meeting.findOne({ eventId });
    if (existing) {
      return res.json({ success: true, message: 'Already registered', meeting: existing });
    }

    // Fetch event from Google
    let event;
    try {
      event = await calendarService.getEvent(eventId);
    } catch (err) {
      logger.warn('Could not fetch from Google Calendar:', err.message);
      event = {
        organizer: { email: creator },
        summary: 'Meeting',
        attendees: [],
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
      };
    }

    // Parse and score agenda
    const { parseAgenda, calculateAgendaScore } = require('../utils/helpers');
    const agendaParsed = parseAgenda(agenda || '');
    agendaParsed.raw = agenda || '';
    
    const agendaScore = calculateAgendaScore(agendaParsed);

    // Create meeting
    const meeting = new Meeting({
      eventId,
      calendarId: event.organizer?.email || creator,
      summary: event.summary || 'Meeting',
      agenda: agendaParsed,
      creator,
      creatorName: event.organizer?.displayName || creator,
      mandatoryAttendees: mandatoryAttendees || [],
      attendees: (event.attendees || []).map(a => ({
        email: a.email,
        name: a.displayName || a.email,
        responseStatus: a.responseStatus || 'needsAction'
      })),
      startTime: new Date(event.start?.dateTime || event.start?.date),
      endTime: new Date(event.end?.dateTime || event.end?.date),
      location: event.location,
      agendaQualityScore: agendaScore,
      status: 'scheduled'
    });

    await meeting.save();

    // ⭐ VALIDATE AND ENFORCE ⭐
    const validation = await meetingValidator.validateAndEnforce(meeting);
    
    if (!validation.valid) {
      logger.warn(`Meeting ${eventId} was auto-cancelled: ${validation.reason}`);
      
      return res.json({
        success: false,
        message: 'Meeting cancelled due to policy violation',
        reason: validation.reason,
        meeting: null
      });
    }

    // Update creator stats
    await UserStats.findOneAndUpdate(
      { email: creator },
      {
        $inc: {
          meetingsOrganized: 1,
          meetingsWithAgenda: agendaScore >= 70 ? 1 : 0,
          agendaScore: agendaScore >= 70 ? 1 : 0
        }
      },
      { upsert: true }
    );

    await badgeService.evaluateAndAwardBadges(creator);

    logger.info(`Meeting registered and validated: ${eventId}`);

    res.json({
      success: true,
      message: 'Meeting approved',
      meeting: {
        id: meeting._id,
        eventId: meeting.eventId,
        agendaScore,
        validation
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

router.post('/validate-agenda', async (req, res) => {
  try {
    const { agenda } = req.body;
    
    if (!agenda) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Agenda is required' 
      });
    }
    
    // Analyze agenda quality
    const analysis = agendaAnalyzer.analyzeAgenda(agenda);
    
    res.json({
      valid: analysis.passed,
      score: analysis.score,
      breakdown: analysis.breakdown,
      feedback: analysis.feedback,
      suggestions: agendaAnalyzer.suggestImprovements(agenda)
    });
  } catch (error) {
    logger.error('Error validating agenda:', error);
    res.status(500).json({ error: error.message });
  }
});

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

// Suggest agenda
router.post('/suggest-agenda', async (req, res) => {
  try {
    const { meetingTitle, attendeeCount, duration, meetingType } = req.body;

    if (!meetingTitle) {
      return res.status(400).json({ error: 'Meeting title is required' });
    }

    const suggestions = agendaAnalyzer.suggestAgenda(
      meetingTitle,
      attendeeCount || 5,
      duration || 30,
      meetingType
    );

    res.json({ success: true, suggestions });
  } catch (error) {
    logger.error('Error suggesting agenda:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;