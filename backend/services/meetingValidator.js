// backend/services/meetingValidator.js

const Meeting = require('../models/Meeting');
const calendarService = require('./calendarService');
const slackService = require('./slackService');
const logger = require('../utils/logger');

class MeetingValidatorService {
  
  /**
   * Validate meeting and enforce rules
   */
  async validateAndEnforce(meeting) {
    logger.info(`🔍 Validating meeting: ${meeting.eventId}`);
    
    const isSoloMeeting = !meeting.attendees || meeting.attendees.length === 0;
    const agendaLength = meeting.agenda?.raw?.trim().length || 0;
    
    logger.info(`Solo meeting: ${isSoloMeeting}, Agenda length: ${agendaLength}`);
    
    // RULE 1: Solo meetings - auto-approve with SELF agenda
    if (isSoloMeeting) {
      logger.info('✅ Solo meeting - auto-approving');
      
      if (agendaLength < 10) {
        // Auto-add SELF agenda
        meeting.agenda = {
          raw: '📍 SELF (reminder)\n\nPersonal task - no detailed agenda required',
          purpose: 'Personal reminder',
          outcomes: 'Complete task',
          decisions: 'None'
        };
        meeting.agendaQualityScore = 50;
        await meeting.save();
        
        logger.info('Auto-added SELF agenda for solo meeting');
      }
      
      return { 
        valid: true, 
        reason: 'Solo meeting auto-approved',
        action: 'auto_approved'
      };
    }
    
    // RULE 2: Has attendees - MUST have meaningful agenda
    if (agendaLength < 50) {
      logger.warn(`⛔ Meeting BLOCKED: Insufficient agenda (${agendaLength} chars, need 50+)`);
      
      // AUTO-CANCEL the meeting
      await this.cancelMeetingWithNotification(
        meeting,
        `Meeting cancelled by ChronoKeeper: Agenda required (minimum 50 characters). Your agenda had only ${agendaLength} characters.`
      );
      
      return { 
        valid: false, 
        reason: 'Insufficient agenda for meeting with attendees',
        agendaLength,
        action: 'cancelled'
      };
    }
    
    // RULE 3: Check agenda quality
    if (meeting.agendaQualityScore < 40) {
      logger.info('⚠️ Low quality agenda - sending warning');
      
      await this.sendQualityWarning(meeting);
      
      return {
        valid: true,
        reason: 'Approved with quality warning',
        action: 'approved_with_warning'
      };
    }
    
    // All checks passed
    logger.info('✅ Meeting approved - good agenda');
    
    return { 
      valid: true, 
      reason: 'Meeting approved',
      action: 'approved'
    };
  }
  
  /**
   * Cancel meeting and notify organizer
   */
  async cancelMeetingWithNotification(meeting, reason) {
    try {
      logger.info(`Cancelling meeting ${meeting.eventId}: ${reason}`);
      
      // Try to cancel in Google Calendar
      try {
        await calendarService.cancelEvent(
          meeting.eventId,
          meeting.calendarId,
          reason
        );
        logger.info('✅ Meeting cancelled in Google Calendar');
      } catch (calError) {
        logger.error('Could not cancel in Google Calendar:', calError.message);
        // Continue - at least mark in DB
      }
      
      // Update in database
      meeting.status = 'auto-cancelled';
      meeting.cancellationReason = reason;
      await meeting.save();
      
      // Notify organizer on Slack
      await this.notifyOrganizer(meeting, reason);
      
      logger.info('✅ Meeting cancelled and organizer notified');
      
    } catch (error) {
      logger.error('Error cancelling meeting:', error);
      throw error;
    }
  }
  
  /**
   * Notify organizer via Slack
   */
  async notifyOrganizer(meeting, reason) {
    try {
      const organizerSlackId = await slackService.getSlackUserId(meeting.creator);
      
      if (!organizerSlackId) {
        logger.warn(`No Slack ID for ${meeting.creator}`);
        return;
      }
      
      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⛔ Meeting Cancelled by ChronoKeeper',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Your meeting *"${meeting.summary}"* was automatically cancelled.`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Reason:*\n${reason}`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*📋 How to fix:*\n\n1. Create the meeting again\n2. Add a proper agenda with:\n   • 📍 Purpose (Why are we meeting?)\n   • 🎯 Expected Outcomes (What should we achieve?)\n   • ⚡ Decisions Needed (What needs to be decided?)\n\n*Minimum 50 characters of meaningful content required!*'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '💡 *Quick Template:*\n```📍 Purpose:\n\n🎯 Expected Outcomes:\n\n⚡ Decisions Needed:\n\n📌 Pre-reads:```'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '🤖 ChronoKeeper ensures productive meetings at Razorpay'
            }
          ]
        }
      ];
      
      await slackService.sendDM(
        organizerSlackId,
        blocks,
        'Meeting cancelled - agenda required'
      );
      
      logger.info(`Notified ${meeting.creator} about cancellation`);
      
    } catch (error) {
      logger.error('Error notifying organizer:', error);
    }
  }
  
  /**
   * Send quality warning (not cancelling)
   */
  async sendQualityWarning(meeting) {
    try {
      const organizerSlackId = await slackService.getSlackUserId(meeting.creator);
      
      if (!organizerSlackId) return;
      
      await slackService.sendDM(
        organizerSlackId,
        [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `⚠️ Your meeting *"${meeting.summary}"* has a low-quality agenda (score: ${meeting.agendaQualityScore}/100).\n\nConsider improving it:\n• Be more specific about the purpose\n• Define clear expected outcomes\n• List concrete decisions needed`
            }
          }
        ],
        'Low quality agenda warning'
      );
      
    } catch (error) {
      logger.error('Error sending quality warning:', error);
    }
  }
}

module.exports = new MeetingValidatorService();