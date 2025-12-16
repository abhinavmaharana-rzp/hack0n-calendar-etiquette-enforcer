const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

const TOKEN_PATH = path.join(__dirname, '../backend/.google-token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../backend/.google-credentials.json');

async function setupAuth() {
  console.log('🔐 Google Calendar OAuth Setup\n');

  // Check if credentials exist
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Google credentials file not found!');
    console.log('\n📝 To get credentials:');
    console.log('1. Go to https://console.cloud.google.com');
    console.log('2. Create a new project or select existing');
    console.log('3. Enable Google Calendar API');
    console.log('4. Create OAuth 2.0 credentials (Desktop app)');
    console.log('5. Download and save as backend/.google-credentials.json\n');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('🌐 Authorize this app by visiting this URL:\n');
  console.log(authUrl);
  console.log('\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the authorization code from that page here: ', async (code) => {
    rl.close();
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      // Store token
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      console.log('\n✅ Token stored successfully!');
      console.log('📁 Location:', TOKEN_PATH);
      console.log('\n🎉 Google Calendar auth setup complete!\n');
    } catch (error) {
      console.error('❌ Error retrieving access token:', error);
      process.exit(1);
    }
  });
}

setupAuth();