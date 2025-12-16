const { google } = require('googleapis');
const { oauth2Client, serviceAccountAuth } = require('../config/google');
const Meeting = require('../models/Meeting');
const logger = require('../utils/logger');

class CalendarService {
  constructor() {
    this.calendar = google.calendar({ version: 'v3' });
  }

  // Get event details
  async getEvent(eventId, calendarId = 'primary', userEmail = null) {
    try {
      const auth = userEmail ? this.getAuthForUser(userEmail) : oauth2Client;
      
      const response = await this.calendar.events.get({
        auth,
        calendarId,
        eventId
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching event:', error);
      throw error;
    }
  }

  // Update event
  async updateEvent(eventId, updates, calendarId = 'primary', userEmail = null) {
    try {
      const auth = userEmail ? this.getAuthForUser(userEmail) : oauth2Client;
      
      const response = await this.calendar.events.patch({
        auth,
        calendarId,
        eventId,
        requestBody: updates,
        sendUpdates: 'all'
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error updating event:', error);
      throw error;
    }
  }

  // Cancel event
  async cancelEvent(eventId, calendarId, reason, userEmail = null) {
    try {
      const auth = userEmail ? this.getAuthForUser(userEmail) : oauth2Client;
      
      await this.calendar.events.delete({
        auth,
        calendarId,
        eventId,
        sendUpdates: 'all'
      });
      
      // Update in DB
      await Meeting.findOneAndUpdate(
        { eventId },
        { 
          status: 'auto-cancelled',
          cancellationReason: reason
        }
      );
      
      logger.info(`Event ${eventId} cancelled: ${reason}`);
      return true;
    } catch (error) {
      logger.error('Error cancelling event:', error);
      throw error;
    }
  }

  // Update RSVP status
  async updateRSVP(eventId, userEmail, responseStatus) {
    try {
      const meeting = await Meeting.findOne({ eventId });
      if (!meeting) throw new Error('Meeting not found');
      
      // Get event from Google
      const event = await this.getEvent(eventId, meeting.calendarId);
      
      // Update attendee status
      const attendees = event.attendees || [];
      const attendee = attendees.find(a => a.email === userEmail);
      
      if (attendee) {
        attendee.responseStatus = responseStatus;
        
        // Update in Google Calendar
        await this.updateEvent(
          eventId,
          { attendees },
          meeting.calendarId
        );
        
        // Update in DB
        await Meeting.updateOne(
          { eventId, 'attendees.email': userEmail },
          { 
            $set: { 'attendees.$.responseStatus': responseStatus },
            $push: { 'attendees.$.remindedAt': new Date() }
          }
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error updating RSVP:', error);
      throw error;
    }
  }

  // Setup calendar watch (webhook)
  async setupCalendarWatch(calendarId = 'primary') {
    try {
      const response = await this.calendar.events.watch({
        auth: oauth2Client,
        calendarId,
        requestBody: {
          id: `calendar-watch-${Date.now()}`,
          type: 'web_hook',
          address: `${process.env.BACKEND_URL}/api/webhooks/calendar`,
          expiration: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });
      
      logger.info('Calendar watch setup:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error setting up calendar watch:', error);
      throw error;
    }
  }

  // Get auth for specific user (requires domain-wide delegation)
  getAuthForUser(userEmail) {
    const auth = new google.auth.JWT({
      email: serviceAccountAuth.email,
      key: serviceAccountAuth.key,
      scopes: serviceAccountAuth.scopes,
      subject: userEmail
    });
    return auth;
  }

  // Sync all events
  async syncEvents(calendarId = 'primary', timeMin = null, timeMax = null) {
    try {
      const response = await this.calendar.events.list({
        auth: oauth2Client,
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250
      });
      
      return response.data.items || [];
    } catch (error) {
      logger.error('Error syncing events:', error);
      throw error;
    }
  }
}

module.exports = new CalendarService();