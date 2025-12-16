require('dotenv').config({ path: '../backend/.env' });
const { slackApp } = require('../backend/config/slack');
const actionsHandler = require('./handlers/actions');
const commandsHandler = require('./handlers/commands');
const logger = require('../backend/utils/logger');

// Register action handlers
slackApp.action('rsvp_accept', actionsHandler.handleRSVPAccept);
slackApp.action('rsvp_decline', actionsHandler.handleRSVPDecline);
slackApp.action('rsvp_tentative', actionsHandler.handleRSVPTentative);

// Register slash commands
slackApp.command('/calendar-stats', commandsHandler.handleStatsCommand);
slackApp.command('/calendar-help', commandsHandler.handleHelpCommand);

// Start Slack app
(async () => {
  try {
    await slackApp.start();
    logger.info('⚡️ Slack bot is running!');
  } catch (error) {
    logger.error('Failed to start Slack bot:', error);
    process.exit(1);
  }
})();