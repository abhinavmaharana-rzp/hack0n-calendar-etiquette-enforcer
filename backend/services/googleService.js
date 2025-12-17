const { google } = require('googleapis');
const { serviceAccountAuth } = require('../config/google');
const Meeting = require('../models/Meeting');
const logger = require('../utils/logger');
const slackService = require('./slackService');

class GoogleService {
  constructor() {
    this.calendar = null;
    this.isPolling = false;
    this.minAgendaLength = parseInt(process.env.MIN_AGENDA_LENGTH) || 20;
    this.lookbackMinutes = parseInt(process.env.POLL_LOOKBACK_MINUTES) || 1;

    if (serviceAccountAuth) {
      this.calendar = google.calendar({ version: 'v3', auth: serviceAccountAuth });
      logger.info('Google Calendar service initialized');
    } else {
      logger.warn('Google Calendar service not initialized - Service Account not configured');
    }
  }

  async pollNewEvents() {
    if (!this.calendar) {
      logger.warn('Calendar polling skipped - Google Calendar not configured');
      return;
    }

    if (this.isPolling) {
      logger.debug('Polling already in progress, skipping this cycle');
      return;
    }

    try {
      this.isPolling = true;
      logger.debug('Starting calendar polling cycle...');

      const timeMin = new Date(Date.now() - this.lookbackMinutes * 60 * 1000);
      const timeMax = new Date();

      const response = await this.calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        timeMin: timeMin.toISOString(),
        updatedMin: timeMin.toISOString(),
        singleEvents: true,
        orderBy: 'updated',
        maxResults: 50
      });

      const events = response.data.items || [];
      logger.debug(`Found ${events.length} events updated in last ${this.lookbackMinutes} minute(s)`);

      for (const event of events) {
        await this.processEvent(event);
      }

      logger.debug('Polling cycle completed');
    } catch (error) {
      logger.error('Error polling calendar events:', error.message);
      if (error.response) {
        logger.error('API Response:', error.response.data);
      }
    } finally {
      this.isPolling = false;
    }
  }

  async processEvent(event) {
    try {
      if (!event.id || !event.creator || !event.creator.email) {
        logger.debug(`Skipping event without required fields: ${event.id}`);
        return;
      }

      const existingMeeting = await Meeting.findOne({ googleEventId: event.id });

      if (existingMeeting && existingMeeting.isProcessed) {
        logger.debug(`Event ${event.id} already processed, skipping`);
        return;
      }

      const description = event.description || '';
      const hasAgenda = description.length >= this.minAgendaLength;

      if (existingMeeting) {
        const previousHadAgenda = existingMeeting.hasAgenda;
        existingMeeting.hasAgenda = hasAgenda;
        existingMeeting.description = description;

        if (hasAgenda && !previousHadAgenda) {
          existingMeeting.isProcessed = true;
          existingMeeting.agendaAddedAt = new Date();
          await existingMeeting.save();
          logger.info(`✅ Agenda added for event: ${event.summary} (${event.id})`);
        } else {
          await existingMeeting.save();
        }

        if (!hasAgenda && existingMeeting.warningsSent < 3) {
          const lastWarning = existingMeeting.lastWarningSent;
          const shouldSendWarning = !lastWarning || (Date.now() - lastWarning.getTime()) > 5 * 60 * 1000;

          if (shouldSendWarning) {
            await slackService.sendAgendaWarning(
              event.creator.email,
              event.summary || 'Untitled Meeting',
              event.id
            );

            existingMeeting.warningsSent += 1;
            existingMeeting.lastWarningSent = new Date();
            await existingMeeting.save();
          }
        }
      } else {
        const newMeeting = new Meeting({
          googleEventId: event.id,
          eventId: event.id,
          calendarId: event.organizer?.email || 'primary',
          summary: event.summary || 'Untitled Meeting',
          description: description,
          hasAgenda: hasAgenda,
          isProcessed: hasAgenda,
          creatorEmail: event.creator.email,
          creator: event.creator.email,
          creatorName: event.creator.displayName || event.creator.email,
          attendees: (event.attendees || []).map(a => ({
            email: a.email,
            name: a.displayName,
            status: a.responseStatus || 'needsAction',
            responseStatus: a.responseStatus || 'needsAction'
          })),
          startTime: new Date(event.start?.dateTime || event.start?.date),
          endTime: new Date(event.end?.dateTime || event.end?.date),
          location: event.location,
          meetingLink: event.hangoutLink,
          status: event.status === 'cancelled' ? 'cancelled' : 'scheduled'
        });

        if (hasAgenda) {
          newMeeting.agendaAddedAt = new Date();
        }

        await newMeeting.save();
        logger.info(`📅 New meeting created: ${event.summary} (${event.id}) - hasAgenda: ${hasAgenda}`);

        if (!hasAgenda) {
          await slackService.sendAgendaWarning(
            event.creator.email,
            event.summary || 'Untitled Meeting',
            event.id
          );

          newMeeting.warningsSent = 1;
          newMeeting.lastWarningSent = new Date();
          await newMeeting.save();
        }
      }
    } catch (error) {
      logger.error(`Error processing event ${event.id}:`, error);
    }
  }

  async patchEventDescription(eventId, newDescription) {
    if (!this.calendar) {
      logger.error('Cannot patch event - Google Calendar not configured');
      throw new Error('Google Calendar not configured');
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      const response = await this.calendar.events.patch({
        calendarId,
        eventId,
        requestBody: {
          description: newDescription
        },
        sendUpdates: 'all'
      });

      const meeting = await Meeting.findOne({ googleEventId: eventId });
      if (meeting) {
        meeting.description = newDescription;
        meeting.hasAgenda = true;
        meeting.isProcessed = true;
        meeting.agendaAddedAt = new Date();
        await meeting.save();
      }

      logger.info(`✅ Event description updated: ${eventId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error patching event description for ${eventId}:`, error.message);
      throw error;
    }
  }

  async getEvent(eventId) {
    if (!this.calendar) {
      throw new Error('Google Calendar not configured');
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
      const response = await this.calendar.events.get({
        calendarId,
        eventId
      });

      return response.data;
    } catch (error) {
      logger.error(`Error fetching event ${eventId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new GoogleService();
