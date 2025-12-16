const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupSlackBot() {
  console.log('🤖 Slack Bot Setup\n');
  console.log('Before continuing, you need to create a Slack app:');
  console.log('1. Go to https://api.slack.com/apps');
  console.log('2. Click "Create New App" → "From scratch"');
  console.log('3. Name it "Calendar Etiquette Enforcer"');
  console.log('4. Select your workspace\n');
  console.log('5. Enable Socket Mode (Settings → Socket Mode)');
  console.log('6. Create an App-Level Token with connections:write scope');
  console.log('7. Add Bot Token Scopes:');
  console.log('   - chat:write');
  console.log('   - users:read');
  console.log('   - users:read.email');
  console.log('   - commands');
  console.log('   - im:write\n');

  const continueSetup = await question('Have you completed these steps? (yes/no): ');
  
  if (continueSetup.toLowerCase() !== 'yes') {
    console.log('\n⚠️  Please complete the setup steps first, then run this script again.');
    rl.close();
    return;
  }

  console.log('\n📝 Enter your Slack credentials:\n');

  const botToken = await question('Bot Token (xoxb-...): ');
  const signingSecret = await question('Signing Secret: ');
  const appToken = await question('App-Level Token (xapp-...): ');

  // Update .env file
  const envPath = path.join(__dirname, '../backend/.env');
  let envContent = fs.readFileSync(envPath, 'utf8');

  envContent = envContent.replace(/SLACK_BOT_TOKEN=.*/, `SLACK_BOT_TOKEN=${botToken}`);
  envContent = envContent.replace(/SLACK_SIGNING_SECRET=.*/, `SLACK_SIGNING_SECRET=${signingSecret}`);
  envContent = envContent.replace(/SLACK_APP_TOKEN=.*/, `SLACK_APP_TOKEN=${appToken}`);

  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Slack credentials saved to .env');
  console.log('\n📋 Next steps:');
  console.log('1. Go to Slack App settings → Slash Commands');
  console.log('2. Add commands:');
  console.log('   /calendar-stats - View your calendar etiquette stats');
  console.log('   /calendar-help - Show help message');
  console.log('\n🎉 Slack bot setup complete!\n');

  rl.close();
}

setupSlackBot();