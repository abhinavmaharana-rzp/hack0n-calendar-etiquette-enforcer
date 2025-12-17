// backend/services/calendarMonitor.js

const Meeting = require('../models/Meeting');
const meetingValidator = require('./meetingValidator');
const logger = require('../utils/logger');

class CalendarMonitorService {
  
  /**
   * Scan for newly created meetings
   * Called every 5 minutes by cron
   */
  async scanForNewMeetings() {
    try {
      logger.info('📡 Scanning for new calendar events...');
      
      // For now, we'll check meetings registered via add-on
      // that haven't been validated yet
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const newMeetings = await Meeting.find({
        createdAt: { $gte: fiveMinutesAgo },
        status: 'scheduled',
        validatedAt: { $exists: false } // Not yet validated
      });
      
      logger.info(`Found ${newMeetings.length} new meetings to validate`);
      
      for (const meeting of newMeetings) {
        await this.validateMeeting(meeting);
      }
      
      logger.info('✅ Calendar scan completed');
      
    } catch (error) {
      logger.error('Error scanning calendar:', error);
    }
  }
  
  /**
   * Validate individual meeting
   */
  async validateMeeting(meeting) {
    try {
      logger.info(`Validating meeting: ${meeting.summary}`);
      
      const validation = await meetingValidator.validateAndEnforce(meeting);
      
      // Mark as validated
      meeting.validatedAt = new Date();
      await meeting.save();
      
      if (!validation.valid) {
        logger.warn(`Meeting ${meeting.eventId} was cancelled: ${validation.reason}`);
      } else {
        logger.info(`Meeting ${meeting.eventId} approved`);
      }
      
      return validation;
      
    } catch (error) {
      logger.error(`Error validating meeting ${meeting.eventId}:`, error);
      return { valid: true, reason: 'Validation error - defaulting to allow' };
    }
  }
}

module.exports = new CalendarMonitorService();