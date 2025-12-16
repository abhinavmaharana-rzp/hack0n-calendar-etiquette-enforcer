const UserStats = require('../../backend/models/UserStats');
const badgeService = require('../../backend/services/badgeService');
const logger = require('../../backend/utils/logger');

async function handleStatsCommand({ ack, command, respond }) {
  await ack();
  
  try {
    const userEmail = command.user_email || `${command.user_id}@razorpay.com`;
    const stats = await UserStats.findOne({ email: userEmail });

    if (!stats) {
      await respond({
        text: '📊 No stats found yet. Attend a few meetings to build your profile!',
        response_type: 'ephemeral'
      });
      return;
    }

    const badgeEmojis = stats.badges.map(b => {
      const badgeInfo = badgeService.getBadgeInfo(b.type);
      return badgeInfo ? `${badgeInfo.emoji} ${badgeInfo.name}` : '';
    }).join('\n');

    const overallScore = Math.round(
      (stats.agendaScore * 0.3) +
      (stats.rsvpScore * 0.4) +
      ((100 - stats.ghostScore) * 0.3)
    );

    await respond({
      blocks: [
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
              text: `*Agenda Score:* ${stats.agendaScore} 🥷`
            },
            {
              type: 'mrkdwn',
              text: `*RSVP Score:* ${stats.rsvpScore} ⚡`
            },
            {
              type: 'mrkdwn',
              text: `*Ghost Score:* ${stats.ghostScore} 👻`
            },
            {
              type: 'mrkdwn',
              text: `*Overall Score:* ${overallScore} 🎯`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🔥 Current Streak:* ${stats.currentRSVPStreak} days\n*📈 Best Streak:* ${stats.bestRSVPStreak} days`
          }
        },
        ...(stats.badges.length > 0 ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🏆 Badges Earned:*\n${badgeEmojis}`
          }
        }] : []),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `View full leaderboard: ${process.env.FRONTEND_URL}/leaderboard`
            }
          ]
        }
      ],
      response_type: 'ephemeral'
    });

    logger.info(`Stats shown for ${userEmail}`);
  } catch (error) {
    logger.error('Error showing stats:', error);
    await respond({
      text: `❌ Error fetching stats: ${error.message}`,
      response_type: 'ephemeral'
    });
  }
}

async function handleHelpCommand({ ack, respond }) {
  await ack();
  
  await respond({
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📅 Calendar Etiquette Enforcer Help',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*What is this?*\nI help improve meeting hygiene at Razorpay by:\n• Enforcing agendas on all meetings\n• Reminding people to RSVP\n• Tracking calendar etiquette scores\n• Auto-releasing rooms with no RSVPs'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Commands:*\n`/calendar-stats` - View your etiquette scores\n`/calendar-help` - Show this help message'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*How it works:*\n1️⃣ Create a meeting in Google Calendar\n2️⃣ Add an agenda using the template\n3️⃣ Invitees get RSVP reminders on Slack\n4️⃣ Earn badges and climb the leaderboard!'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Dashboard: ${process.env.FRONTEND_URL} | Questions? DM @abhinav`
          }
        ]
      }
    ],
    response_type: 'ephemeral'
  });
}

// slack-bot/handlers/commands.js
async function handleMeetingPrepCommand({ ack, command, respond }) {
  await ack();
  
  try {
    const userEmail = command.user_email;
    
    // Find user's meetings in next 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const meetings = await Meeting.find({
      'attendees.email': userEmail,
      startTime: { $gte: now, $lte: tomorrow },
      status: 'scheduled'
    }).sort({ startTime: 1 });
    
    if (meetings.length === 0) {
      await respond({
        text: '✨ You have no meetings in the next 24 hours. Enjoy your focus time!',
        response_type: 'ephemeral'
      });
      return;
    }
    
    // Build prep summary
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📚 Your Meeting Prep Sheet',
          emoji: true
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `You have *${meetings.length} meeting${meetings.length > 1 ? 's' : ''}* in the next 24 hours`
          }
        ]
      },
      {
        type: 'divider'
      }
    ];
    
    // Add each meeting
    for (const meeting of meetings) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${meeting.summary}*\n⏰ ${formatTime(meeting.startTime)} (${getDuration(meeting)})\n\n*Agenda:*\n${truncate(meeting.agenda.purpose, 100)}`
        },
        accessory: {
          type: 'button',
          text: { type: 'plain_text', text: 'Open in Calendar' },
          url: `https://calendar.google.com/calendar/event?eid=${meeting.eventId}`
        }
      });
      
      // Add prep checklist
      if (meeting.agenda.prereads) {
        blocks.push({
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `📖 *Pre-reads:* ${meeting.agenda.prereads}`
            }
          ]
        });
      }
      
      blocks.push({ type: 'divider' });
    }
    
    // Add productivity tip
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '💡 *Tip:* Review agendas 10 minutes before each meeting for better prep'
        }
      ]
    });
    
    await respond({
      blocks,
      response_type: 'ephemeral'
    });
    
  } catch (error) {
    logger.error('Error in meeting prep:', error);
    await respond({
      text: `❌ Error: ${error.message}`,
      response_type: 'ephemeral'
    });
  }
}

module.exports = {
  handleStatsCommand,
  handleHelpCommand,
  handleMeetingPrepCommand
};