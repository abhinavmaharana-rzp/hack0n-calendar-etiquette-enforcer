require('dotenv').config({ path: '../backend/.env' });
const { slackApp } = require('../backend/config/slack');
const logger = require('../backend/utils/logger');

// Only start if Slack app is configured
if (!slackApp) {
  logger.warn('Slack bot not configured, skipping initialization');
  process.exit(0);
}

const actionsHandler = require('./handlers/actions');
const commandsHandler = require('./handlers/commands');

// Register action handlers
slackApp.action('rsvp_accept', actionsHandler.handleRSVPAccept);
slackApp.action('rsvp_decline', actionsHandler.handleRSVPDecline);
slackApp.action('rsvp_tentative', actionsHandler.handleRSVPTentative);

// Register slash commands
slackApp.command('/calendar-stats', commandsHandler.handleStatsCommand);
slackApp.command('/calendar-help', commandsHandler.handleHelpCommand);
slackApp.command('/calendar-meeting-prep', commandsHandler.handleMeetingPrepCommand)

// Start Slack app
(async () => {
  try {
    await slackApp.start();
    logger.info('⚡️ Slack bot is running!');
  } catch (error) {
    logger.error('Failed to start Slack bot:', error);
    // Don't exit process - let server continue without Slack
    logger.warn('Continuing without Slack bot');
  }
})();