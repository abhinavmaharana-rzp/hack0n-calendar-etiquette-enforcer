const { google } = require('googleapis');
const fs = require('fs');

// OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Service Account (for domain-wide delegation)
let serviceAccountAuth = null;
const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

if (serviceAccountPath) {
  try {
    const keyFilePath = serviceAccountPath;
    const resolvedPath = keyFilePath.startsWith('./')
      ? keyFilePath.replace('./backend/', './')
      : keyFilePath;

    if (fs.existsSync(resolvedPath)) {
      const keyFile = JSON.parse(
        fs.readFileSync(resolvedPath, 'utf8')
      );

      serviceAccountAuth = new google.auth.JWT({
        email: keyFile.client_email,
        key: keyFile.private_key,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/admin.directory.user.readonly'
        ],
        subject: process.env.GOOGLE_ADMIN_EMAIL
      });

      console.log('✅ Google Service Account configured for domain-wide delegation');
    } else {
      console.warn(`⚠️  Google service account file not found: ${resolvedPath}. Google Calendar features will be limited.`);
    }
  } catch (error) {
    console.warn(`⚠️  Error loading Google service account: ${error.message}. Google Calendar features will be limited.`);
  }
}

// Initialize calendar and admin APIs (will work even without full auth for demo)
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
const adminDirectory = serviceAccountAuth 
  ? google.admin({ version: 'directory_v1', auth: serviceAccountAuth })
  : null;

module.exports = {
  oauth2Client,
  serviceAccountAuth,
  calendar,
  adminDirectory
};