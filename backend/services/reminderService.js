const cron = require('node-cron');
const Meeting = require('../models/Meeting');
const UserStats = require('../models/UserStats');
const slackService = require('./slackService');
const logger = require('../utils/logger');

class ReminderService {
  constructor() {
    this.isRunning = false;
  }

  // Start reminder cron jobs
  start() {
    if (this.isRunning) return;
    
    // Run every 4 hours
    cron.schedule('0 */4 * * *', () => {
      this.sendReminderBatch();
    });
    
    // Check for mandatory attendee compliance every hour
    cron.schedule('0 * * * *', () => {
      this.checkMandatoryAttendees();
    });
    
    // Auto-release rooms 15 min before meeting
    cron.schedule('*/15 * * * *', () => {
      this.autoReleaseRooms();
    });
    
    // ⭐ ADD THIS: Scan for new meetings every 5 minutes ⭐
    cron.schedule('*/5 * * * *', async () => {
      try {
        logger.info('Running calendar scan for new meetings...');
        const calendarMonitor = require('./calendarMonitor');
        await calendarMonitor.scanForNewMeetings();
      } catch (error) {
        logger.error('Calendar monitor error:', error);
      }
    });
    
    this.isRunning = true;
    logger.info('Reminder service started');
    logger.info('Calendar monitor enabled - scanning every 5 minutes');
  }

  // Send RSVP reminders
  async sendReminderBatch() {
    try {
      const now = new Date();
      const in72Hours = new Date(now.getTime() + (72 * 60 * 60 * 1000));
      
      // Get all scheduled meetings within next 72 hours
      const meetings = await Meeting.find({
        status: 'scheduled',
        startTime: {
          $gte: now,
          $lte: in72Hours
        }
      });
      
      logger.info(`Processing ${meetings.length} meetings for reminders`);
      
      for (const meeting of meetings) {
        await this.processRemindersForMeeting(meeting);
      }
      
      logger.info('Reminder batch completed');
    } catch (error) {
      logger.error('Error in reminder batch:', error);
    }
  }

  async processRemindersForMeeting(meeting) {
    const now = new Date();
    const hoursUntilMeeting = (meeting.startTime - now) / (1000 * 60 * 60);
    
    for (const attendee of meeting.attendees) {
      // Skip if already responded
      if (attendee.responseStatus !== 'needsAction') continue;
      
      // Calculate time since last reminder
      const hoursSinceLastReminder = attendee.lastReminded
        ? (now - attendee.lastReminded) / (1000 * 60 * 60)
        : 999;
      
      // Determine if we should send reminder
      const shouldSend = this.shouldSendReminder(
        attendee.reminderCount,
        hoursUntilMeeting,
        hoursSinceLastReminder
      );
      
      if (shouldSend.send) {
        await this.sendReminder(meeting, attendee, shouldSend.type);
      }
    }
  }

  shouldSendReminder(reminderCount, hoursUntilMeeting, hoursSinceLastReminder) {
    // First reminder: 48 hours before
    if (reminderCount === 0 && hoursUntilMeeting <= 48 && hoursUntilMeeting > 24) {
      return { send: true, type: 'gentle' };
    }
    
    // Second reminder: 24 hours before (if first was sent)
    if (reminderCount === 1 && hoursUntilMeeting <= 24 && hoursUntilMeeting > 12 && hoursSinceLastReminder >= 6) {
      return { send: true, type: 'firm' };
    }
    
    // Third+ reminder: 12 hours before (escalate to cheeky)
    if (reminderCount >= 2 && hoursUntilMeeting <= 12 && hoursSinceLastReminder >= 4) {
      return { send: true, type: 'cheeky' };
    }
    
    return { send: false };
  }

  async sendReminder(meeting, attendee, reminderType) {
    try {
      const slackUserId = await slackService.getSlackUserId(attendee.email);
      
      if (!slackUserId) {
        logger.warn(`No Slack user found for ${attendee.email}`);
        return;
      }
      
      // Send reminder
      const sent = await slackService.sendRSVPReminder(
        slackUserId,
        meeting,
        reminderType
      );
      
      if (sent) {
        // Update meeting record
        await Meeting.updateOne(
          { eventId: meeting.eventId, 'attendees.email': attendee.email },
          {
            $set: { 'attendees.$.lastReminded': new Date() },
            $inc: { 'attendees.$.reminderCount': 1 }
          }
        );
        
        // Update ghost score if cheeky reminder
        if (reminderType === 'cheeky') {
          await UserStats.findOneAndUpdate(
            { email: attendee.email },
            { $inc: { ghostScore: 1, rsvpsIgnored: 1 } },
            { upsert: true }
          );
        }
        
        logger.info(`Sent ${reminderType} reminder to ${attendee.email} for ${meeting.summary}`);
      }
    } catch (error) {
      logger.error(`Error sending reminder to ${attendee.email}:`, error);
    }
  }

  // Check mandatory attendees and auto-cancel if needed
  async checkMandatoryAttendees() {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      
      const meetings = await Meeting.find({
        status: 'scheduled',
        mandatoryAttendees: { $exists: true, $ne: [] },
        startTime: {
          $gte: now,
          $lte: in24Hours
        }
      });
      
      for (const meeting of meetings) {
        const mandatoryAttendees = meeting.attendees.filter(a =>
          meeting.mandatoryAttendees.includes(a.email)
        );
        
        // Check if any mandatory attendee declined
        const hasDeclined = mandatoryAttendees.some(a => 
          a.responseStatus === 'declined'
        );
        
        if (hasDeclined) {
          // Auto-cancel meeting
          const calendarService = require('./calendarService');
          await calendarService.cancelEvent(
            meeting.eventId,
            meeting.calendarId,
            'Mandatory attendee declined'
          );
          
          // Notify organizer
          const organizerSlackId = await slackService.getSlackUserId(meeting.creator);
          if (organizerSlackId) {
            await slackService.sendDM(
              organizerSlackId,
              [{
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `❌ Your meeting *"${meeting.summary}"* was auto-cancelled because a mandatory attendee declined.`
                }
              }],
              'Meeting auto-cancelled'
            );
          }
          
          logger.info(`Auto-cancelled meeting ${meeting.eventId} due to mandatory attendee decline`);
        }
      }
    } catch (error) {
      logger.error('Error checking mandatory attendees:', error);
    }
  }

  // Auto-release rooms with no RSVPs
  async autoReleaseRooms() {
    try {
      const now = new Date();
      const in15Minutes = new Date(now.getTime() + (15 * 60 * 1000));
      
      const meetings = await Meeting.find({
        status: 'scheduled',
        location: { $exists: true, $ne: '' },
        startTime: {
          $gte: now,
          $lte: in15Minutes
        },
        wasRoomReleased: false
      });
      
      for (const meeting of meetings) {
        const acceptedCount = meeting.attendees.filter(a =>
          a.responseStatus === 'accepted'
        ).length;
        
        // If no one accepted, release room
        if (acceptedCount === 0) {
          const calendarService = require('./calendarService');
          await calendarService.cancelEvent(
            meeting.eventId,
            meeting.calendarId,
            'Auto-released: No RSVPs'
          );
          
          meeting.wasRoomReleased = true;
          await meeting.save();
          
          // Notify organizer
          const organizerSlackId = await slackService.getSlackUserId(meeting.creator);
          if (organizerSlackId) {
            await slackService.sendDM(
              organizerSlackId,
              [{
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `🏢 Meeting room auto-released for *"${meeting.summary}"* - no RSVPs received.`
                }
              }],
              'Room auto-released'
            );
          }
          
          logger.info(`Auto-released room for meeting ${meeting.eventId}`);
        }
      }
    } catch (error) {
      logger.error('Error auto-releasing rooms:', error);
    }
  }
}

module.exports = new ReminderService();