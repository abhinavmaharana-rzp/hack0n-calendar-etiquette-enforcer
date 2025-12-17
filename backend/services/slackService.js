const { slackClient } = require('../config/slack');
const EmailSlackMap = require('../models/EmailSlackMap');
const logger = require('../utils/logger');

class SlackService {
  // Check if Slack is configured
  isConfigured() {
    return slackClient !== null;
  }

  // Get Slack user ID from email
  async getSlackUserId(email) {
    if (!this.isConfigured()) {
      return null;
    }
    
    try {
      // Check cache first
      const cached = await EmailSlackMap.findOne({ email });
      if (cached) return cached.slackUserId;
      
      // Fetch from Slack
      const result = await slackClient.users.lookupByEmail({ email });
      
      if (result.ok) {
        // Cache it
        await EmailSlackMap.findOneAndUpdate(
          { email },
          {
            email,
            slackUserId: result.user.id,
            name: result.user.real_name,
            lastSynced: new Date()
          },
          { upsert: true }
        );
        
        return result.user.id;
      }
      
      return null;
    } catch (error) {
      if (error.data?.error === 'users_not_found') {
        logger.warn(`No Slack user found for ${email}`);
        return null;
      }
      logger.error('Error getting Slack user ID:', error);
      return null;
    }
  }

  // Send DM
  async sendDM(userId, blocks, text = '') {
    if (!this.isConfigured()) {
      logger.warn('Slack not configured, skipping DM');
      return false;
    }

    try {
      const result = await slackClient.chat.postMessage({
        channel: userId,
        blocks,
        text
      });

      return result.ok;
    } catch (error) {
      logger.error('Error sending Slack DM:', error);
      return false;
    }
  }

  async sendAgendaWarning(email, eventTitle, eventId) {
    if (!this.isConfigured()) {
      logger.warn('Slack not configured, skipping agenda warning');
      return false;
    }

    try {
      const slackUserId = await this.getSlackUserId(email);

      if (!slackUserId) {
        logger.warn(`No Slack user found for ${email}, cannot send agenda warning`);
        return false;
      }

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 Meeting Police Alert!',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `You created *${eventTitle}* without an agenda!\n\n❌ No agenda = Chaos\n✅ Add agenda = +10 Points`
          }
        },
        {
          type: 'input',
          block_id: `agenda_input_${eventId}`,
          element: {
            type: 'plain_text_input',
            action_id: 'agenda_text',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'Type your meeting agenda here...'
            }
          },
          label: {
            type: 'plain_text',
            text: '📝 Meeting Agenda'
          },
          dispatch_action: false
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '✅ Fix Meeting Now',
                emoji: true
              },
              style: 'primary',
              action_id: 'fix_agenda',
              value: eventId
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '⏭️ Skip (Lose Points)',
                emoji: true
              },
              style: 'danger',
              action_id: 'skip_agenda',
              value: eventId
            }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '💡 _Good agendas include: Purpose, Expected Outcomes, and Key Discussion Points_'
            }
          ]
        }
      ];

      const sent = await this.sendDM(
        slackUserId,
        blocks,
        `Meeting Police: You created "${eventTitle}" without an agenda!`
      );

      if (sent) {
        logger.info(`✅ Agenda warning sent to ${email} for event ${eventId}`);
      }

      return sent;
    } catch (error) {
      logger.error(`Error sending agenda warning to ${email}:`, error);
      return false;
    }
  }

  // Send reminder with RSVP buttons
  async sendRSVPReminder(userId, meeting, reminderType = 'gentle') {
    const messages = this.getReminderMessages(reminderType);
    const message = this.formatMessage(
      messages[Math.floor(Math.random() * messages.length)],
      meeting
    );
    
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*📋 Agenda:*\n${meeting.agenda.raw.substring(0, 300)}${meeting.agenda.raw.length > 300 ? '...' : ''}`
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Accept', emoji: true },
            style: 'primary',
            action_id: 'rsvp_accept',
            value: meeting.eventId
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❓ Tentative', emoji: true },
            action_id: 'rsvp_tentative',
            value: meeting.eventId
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ Decline', emoji: true },
            style: 'danger',
            action_id: 'rsvp_decline',
            value: meeting.eventId
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📅 <https://calendar.google.com/calendar/event?eid=${meeting.eventId}|Open in Calendar>`
          }
        ]
      }
    ];
    
    return this.sendDM(userId, blocks, message);
  }

  // Reminder message templates
  getReminderMessages(type) {
    const templates = {
      gentle: [
        "👋 Hey! Quick reminder to RSVP for *{meetingTitle}* on {date}.",
        "🙏 Would love to know if you're joining *{meetingTitle}* on {date}!",
        "📅 Friendly nudge: Please RSVP for *{meetingTitle}* happening {date}."
      ],
      firm: [
        "⚠️ Second reminder: Your RSVP for *{meetingTitle}* is still pending. The host needs to plan accordingly!",
        "🔔 This is your second nudge for *{meetingTitle}* on {date}. Please respond!",
        "⏰ Getting close! We need your RSVP for *{meetingTitle}* by EOD."
      ],
      cheeky: [
        "🕵️ Your RSVP status for *{meetingTitle}* is still MIA. The meeting will proceed with or without you, but don't make us guess! 🤷",
        "👻 Are you ghosting this meeting? *{meetingTitle}* on {date} needs your response. Last chance!",
        "🚨 FINAL CALL: *{meetingTitle}* is happening {date}. Your non-response is now a conversation topic in itself. 😅",
        "💀 You've officially joined the 'Serial RSVP Ghost' club for *{meetingTitle}*. Embrace the badge or respond now!"
      ]
    };
    
    return templates[type] || templates.gentle;
  }

  // Format message
  formatMessage(template, meeting) {
    const dateStr = new Date(meeting.startTime).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    
    return template
      .replace('{meetingTitle}', meeting.summary)
      .replace('{date}', dateStr);
  }

  // Send stats update to user
  async sendStatsUpdate(userId, stats) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Your Calendar Etiquette Stats',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Agenda Score:* ${stats.agendaScore}`
          },
          {
            type: 'mrkdwn',
            text: `*RSVP Score:* ${stats.rsvpScore}`
          },
          {
            type: 'mrkdwn',
            text: `*Ghost Score:* ${stats.ghostScore}`
          },
          {
            type: 'mrkdwn',
            text: `*Current Streak:* ${stats.currentRSVPStreak} days`
          }
        ]
      }
    ];
    
    if (stats.badges.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🏆 Badges:* ${stats.badges.map(b => this.getBadgeEmoji(b.type)).join(' ')}`
        }
      });
    }
    
    return this.sendDM(userId, blocks, 'Your calendar stats');
  }

  // Badge emoji mapping
  getBadgeEmoji(badgeType) {
    const badges = {
      'agenda-ninja': '🥷',
      'rsvp-champion': '⚡',
      'serial-ghost': '👻',
      'meeting-monk': '🧘',
      'overcapacity-offender': '🚫',
      'punctuality-pro': '⏰',
      'room-releaser': '🏢'
    };
    
    return badges[badgeType] || '⭐';
  }

  // Bulk sync all users
  async syncAllUsers() {
    if (!this.isConfigured()) {
      logger.warn('Slack not configured, cannot sync users');
      return 0;
    }
    
    try {
      let cursor;
      let totalSynced = 0;
      
      do {
        const result = await slackClient.users.list({
          cursor,
          limit: 200
        });
        
        if (result.ok) {
          for (const user of result.members) {
            if (!user.deleted && !user.is_bot && user.profile.email) {
              await EmailSlackMap.findOneAndUpdate(
                { email: user.profile.email },
                {
                  email: user.profile.email,
                  slackUserId: user.id,
                  name: user.real_name,
                  lastSynced: new Date()
                },
                { upsert: true }
              );
              totalSynced++;
            }
          }
          
          cursor = result.response_metadata?.next_cursor;
        } else {
          break;
        }
      } while (cursor);
      
      logger.info(`Synced ${totalSynced} Slack users`);
      return totalSynced;
    } catch (error) {
      logger.error('Error syncing Slack users:', error);
      throw error;
    }
  }
}

module.exports = new SlackService();