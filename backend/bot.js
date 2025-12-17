const { slackApp } = require('./config/slack');
const googleService = require('./services/googleService');
const gamificationService = require('./services/gamificationService');
const slackService = require('./services/slackService');
const logger = require('./utils/logger');

async function initializeBot() {
  if (!slackApp) {
    logger.warn('Slack app not configured - bot handlers not initialized');
    return null;
  }

  slackApp.action('fix_agenda', async ({ ack, body, client }) => {
    await ack();

    try {
      const eventId = body.actions[0].value;
      const userId = body.user.id;

      const blockId = `agenda_input_${eventId}`;
      const agendaText = body.state?.values?.[blockId]?.agenda_text?.value;

      if (!agendaText || agendaText.trim().length < 10) {
        await client.chat.postMessage({
          channel: userId,
          text: '⚠️ Please provide a meaningful agenda (at least 10 characters) before fixing the meeting.',
          thread_ts: body.message.ts
        });
        return;
      }

      await googleService.patchEventDescription(eventId, agendaText);

      const userProfile = await client.users.profile.get({ user: userId });
      const email = userProfile.profile.email;

      await gamificationService.updateScore(email, 'AGENDA_ADDED', {
        name: body.user.name,
        slackId: userId
      });

      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '✅ *Meeting Fixed!*\n\nYour agenda has been added to the calendar event.\n\n*+10 Points* earned!'
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `📝 _Agenda:_ ${agendaText.substring(0, 100)}${agendaText.length > 100 ? '...' : ''}`
              }
            ]
          }
        ],
        text: '✅ Meeting fixed! +10 Points'
      });

      logger.info(`✅ User ${email} fixed agenda for event ${eventId}`);
    } catch (error) {
      logger.error('Error handling fix_agenda action:', error);

      await client.chat.postMessage({
        channel: body.user.id,
        text: '❌ There was an error updating your meeting. Please try again or update it manually in Google Calendar.',
        thread_ts: body.message.ts
      });
    }
  });

  slackApp.action('skip_agenda', async ({ ack, body, client }) => {
    await ack();

    try {
      const userId = body.user.id;

      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '⏭️ *Skipped*\n\nYou chose to skip adding an agenda. Remember, meetings without agendas are less productive!\n\n*-5 Points*'
            }
          }
        ],
        text: 'Agenda skipped'
      });

      logger.info(`User ${userId} skipped fixing agenda`);
    } catch (error) {
      logger.error('Error handling skip_agenda action:', error);
    }
  });

  slackApp.action('rsvp_accept', async ({ ack, body, client }) => {
    await ack();

    try {
      const eventId = body.actions[0].value;
      const userId = body.user.id;

      const userProfile = await client.users.profile.get({ user: userId });
      const email = userProfile.profile.email;

      await gamificationService.updateScore(email, 'RSVP_ON_TIME', {
        name: body.user.name,
        slackId: userId
      });

      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '✅ *RSVP Accepted!*\n\nThank you for responding!\n\n*+5 Points* earned!'
            }
          }
        ],
        text: 'RSVP accepted'
      });

      logger.info(`✅ User ${email} accepted RSVP for event ${eventId}`);
    } catch (error) {
      logger.error('Error handling rsvp_accept action:', error);
    }
  });

  slackApp.action('rsvp_tentative', async ({ ack, body, client }) => {
    await ack();

    try {
      const userId = body.user.id;

      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '❓ *RSVP Tentative*\n\nYour tentative response has been recorded.'
            }
          }
        ],
        text: 'RSVP tentative'
      });

      logger.info(`User ${userId} marked RSVP as tentative`);
    } catch (error) {
      logger.error('Error handling rsvp_tentative action:', error);
    }
  });

  slackApp.action('rsvp_decline', async ({ ack, body, client }) => {
    await ack();

    try {
      const userId = body.user.id;

      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '❌ *RSVP Declined*\n\nYour decline has been recorded.'
            }
          }
        ],
        text: 'RSVP declined'
      });

      logger.info(`User ${userId} declined RSVP`);
    } catch (error) {
      logger.error('Error handling rsvp_decline action:', error);
    }
  });

  slackApp.command('/mystats', async ({ command, ack, client }) => {
    await ack();

    try {
      const email = command.user_id;
      const stats = await gamificationService.getUserStats(email);

      await slackService.sendStatsUpdate(command.user_id, stats);
    } catch (error) {
      logger.error('Error handling /mystats command:', error);
      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        text: '❌ Error fetching your stats. Please try again later.'
      });
    }
  });

  slackApp.error(async (error) => {
    logger.error('Slack app error:', error);
  });

  logger.info('✅ Slack bot handlers initialized');
  return slackApp;
}

async function startBot() {
  if (!slackApp) {
    logger.warn('Slack app not configured - bot not started');
    return;
  }

  try {
    await slackApp.start();
    logger.info('⚡ Slack bot is running in Socket Mode!');
  } catch (error) {
    logger.error('Failed to start Slack bot:', error);
    throw error;
  }
}

module.exports = { initializeBot, startBot };
