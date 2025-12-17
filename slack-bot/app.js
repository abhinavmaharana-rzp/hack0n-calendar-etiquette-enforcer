require('dotenv').config({ path: '../backend/.env' });
const { App } = require('@slack/bolt');
const actionsHandler = require('./handlers/actions');
const commandsHandler = require('./handlers/commands');

console.log('🤖 Starting ChronoKeeper Slack Bot...\n');

// ============================================
// VERIFY TOKENS
// ============================================

if (!process.env.SLACK_BOT_TOKEN) {
  console.error('❌ SLACK_BOT_TOKEN is missing from .env');
  console.log('\n💡 Fix: Add your bot token to backend/.env');
  process.exit(1);
}

if (!process.env.SLACK_APP_TOKEN) {
  console.error('❌ SLACK_APP_TOKEN is missing from .env');
  console.log('\n💡 Fix: Enable Socket Mode and generate app token');
  process.exit(1);
}

if (!process.env.SLACK_SIGNING_SECRET) {
  console.error('❌ SLACK_SIGNING_SECRET is missing from .env');
  process.exit(1);
}

console.log('✅ All Slack tokens loaded from .env\n');

// ============================================
// INITIALIZE SLACK APP
// ============================================

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.SLACK_PORT || 3001
});

console.log('✅ Slack App initialized\n');

// ============================================
// REGISTER ACTION HANDLERS (Button Clicks)
// ============================================

console.log('📝 Registering action handlers...');

slackApp.action('rsvp_accept', actionsHandler.handleRSVPAccept);
slackApp.action('rsvp_decline', actionsHandler.handleRSVPDecline);
slackApp.action('rsvp_tentative', actionsHandler.handleRSVPTentative);

console.log('✅ Action handlers registered\n');

// ============================================
// REGISTER COMMAND HANDLERS
// ============================================

console.log('📝 Registering command handlers...');

slackApp.command('/calendar-stats', commandsHandler.handleStatsCommand);
slackApp.command('/calendar-help', commandsHandler.handleHelpCommand);
slackApp.command('/meeting-prep', commandsHandler.handleMeetingPrepCommand);

console.log('✅ Command handlers registered\n');

// ============================================
// ERROR HANDLING
// ============================================

slackApp.error((error) => {
  console.error('❌ Slack app error:', error.message);
});

// ============================================
// START THE BOT
// ============================================

(async () => {
  try {
    console.log('🔌 Connecting to Slack...\n');
    
    await slackApp.start();
    
    console.log('═'.repeat(50));
    console.log('⚡️ CHRONOKEEPER SLACK BOT IS RUNNING!');
    console.log('═'.repeat(50));
    console.log('\n📱 Socket Mode: Enabled');
    console.log('🎯 Ready to receive commands and actions\n');
    console.log('Test commands in Slack:');
    console.log('  • /calendar-help');
    console.log('  • /calendar-stats');
    console.log('  • /meeting-prep\n');
    
  } catch (error) {
    console.error('\n❌ Failed to start Slack bot:', error.message);
    
    if (error.message.includes('invalid_auth')) {
      console.log('\n💡 Fix:');
      console.log('1. Go to https://api.slack.com/apps');
      console.log('2. Select your app → OAuth & Permissions');
      console.log('3. Click "Reinstall to Workspace"');
      console.log('4. Copy the NEW Bot Token');
      console.log('5. Update backend/.env → SLACK_BOT_TOKEN=xoxb-...\n');
    }
    
    process.exit(1);
  }
})();

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down Slack bot gracefully...');
  await slackApp.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Slack bot gracefully...');
  await slackApp.stop();
  process.exit(0);
});