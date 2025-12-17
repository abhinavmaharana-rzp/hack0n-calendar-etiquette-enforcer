const { App } = require('@slack/bolt');
const { WebClient } = require('@slack/web-api');

// Check if tokens exist
const hasValidConfig = process.env.SLACK_BOT_TOKEN && 
                       process.env.SLACK_APP_TOKEN &&
                       process.env.SLACK_SIGNING_SECRET &&
                       process.env.SLACK_BOT_TOKEN.startsWith('xoxb-') &&
                       process.env.SLACK_APP_TOKEN.startsWith('xapp-');

let slackApp = null;
let slackClient = null;

if (hasValidConfig) {
  // Initialize Slack App with Socket Mode
  slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.SLACK_PORT || 3001
  });

  // Initialize Web Client
  slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

  console.log('✅ Slack app configured');
} else {
  console.log('⚠️  Slack not configured - demo mode');
}

module.exports = { slackApp, slackClient };