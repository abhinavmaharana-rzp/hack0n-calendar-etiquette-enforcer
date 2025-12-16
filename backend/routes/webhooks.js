const express = require('express');
const router = express.Router();
const calendarService = require('../services/calendarService');
const Meeting = require('../models/Meeting');
const UserStats = require('../models/UserStats');
const logger = require('../utils/logger');

/**
 * Google Calendar Webhook Handler
 * Receives notifications when calendar events change
 */
router.post('/calendar', async (req, res) => {
  try {
    const channelId = req.headers['x-goog-channel-id'];
    const resourceState = req.headers['x-goog-resource-state'];
    const resourceId = req.headers['x-goog-resource-id'];
    const channelToken = req.headers['x-goog-channel-token'];

    logger.info('Calendar webhook received', {
      channelId,
      resourceState,
      resourceId,
      channelToken
    });

    // Handle different resource states
    switch (resourceState) {
      case 'sync':
        // Initial sync notification - acknowledge
        logger.info('Calendar sync acknowledged');
        break;

      case 'exists':
      case 'update':
        // Event was updated - sync RSVP statuses
        logger.info('Calendar update detected - syncing RSVPs');
        await syncAllMeetingRSVPs();
        break;

      case 'not_exists':
        // Event was deleted
        logger.info('Calendar event deleted');
        break;

      default:
        logger.warn('Unknown resource state:', resourceState);
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error handling calendar webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

/**
 * Sync RSVP statuses from Google Calendar
 */
async function syncAllMeetingRSVPs() {
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days ahead

    // Get all scheduled meetings
    const meetings = await Meeting.find({
      status: 'scheduled',
      startTime: { 
        $gte: now,
        $lte: futureDate
      }
    }).limit(100); // Process in batches

    logger.info(`Syncing ${meetings.length} meetings`);

    for (const meeting of meetings) {
      try {
        // Fetch latest event data from Google Calendar
        const event = await calendarService.getEvent(
          meeting.eventId,
          meeting.calendarId
        );

        if (!event || !event.attendees) {
          continue;
        }

        // Track if any changes were made
        let hasChanges = false;

        // Update each attendee's status
        for (const gcalAttendee of event.attendees) {
          const attendeeIndex = meeting.attendees.findIndex(
            a => a.email === gcalAttendee.email
          );

          if (attendeeIndex !== -1) {
            const currentStatus = meeting.attendees[attendeeIndex].responseStatus;
            const newStatus = gcalAttendee.responseStatus;

            if (currentStatus !== newStatus) {
              meeting.attendees[attendeeIndex].responseStatus = newStatus;
              hasChanges = true;

              // Update user stats if they responded
              if (newStatus !== 'needsAction' && currentStatus === 'needsAction') {
                await UserStats.findOneAndUpdate(
                  { email: gcalAttendee.email },
                  { 
                    $inc: { 
                      rsvpScore: 1,
                      rsvpsOnTime: 1 
                    } 
                  },
                  { upsert: true }
                );
              }
            }
          }
        }

        // Save if changes were made
        if (hasChanges) {
          meeting.calculateRSVPRate();
          await meeting.save();
          logger.info(`Updated RSVPs for meeting: ${meeting.summary}`);
        }

      } catch (err) {
        logger.error(`Error syncing meeting ${meeting.eventId}:`, err.message);
        continue;
      }
    }

    logger.info('RSVP sync completed');
  } catch (error) {
    logger.error('Error in syncAllMeetingRSVPs:', error);
    throw error;
  }
}

/**
 * Manual trigger endpoint for testing
 */
router.post('/trigger-sync', async (req, res) => {
  try {
    await syncAllMeetingRSVPs();
    res.json({ success: true, message: 'RSVP sync triggered' });
  } catch (error) {
    logger.error('Error triggering sync:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook verification endpoint
 */
router.get('/calendar', (req, res) => {
  res.status(200).send('Webhook endpoint is active');
});

module.exports = router;