const { App } = require('@slack/bolt');
const { WebClient } = require('@slack/web-api');

// Only initialize Slack if valid credentials are provided
const hasValidSlackConfig = () => {
  return process.env.SLACK_BOT_TOKEN && 
         process.env.SLACK_BOT_TOKEN !== 'xoxb-your-bot-token-here' &&
         process.env.SLACK_BOT_TOKEN.startsWith('xoxb-');
};

let slackApp = null;
let slackClient = null;

if (hasValidSlackConfig()) {
  try {
    slackApp = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
      port: process.env.SLACK_PORT || 3001
    });

    slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
  } catch (error) {
    console.warn('⚠️  Failed to initialize Slack client:', error.message);
    slackApp = null;
    slackClient = null;
  }
}

module.exports = { slackApp, slackClient };