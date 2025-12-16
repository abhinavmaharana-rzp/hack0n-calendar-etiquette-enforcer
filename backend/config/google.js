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
if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  const keyFile = JSON.parse(
    fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'utf8')
  );
  
  serviceAccountAuth = new google.auth.JWT({
    email: keyFile.client_email,
    key: keyFile.private_key,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/admin.directory.user.readonly'
    ],
    subject: process.env.GOOGLE_ADMIN_EMAIL // Admin email for domain-wide delegation
  });
}

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
const adminDirectory = google.admin({ version: 'directory_v1', auth: serviceAccountAuth });

module.exports = {
  oauth2Client,
  serviceAccountAuth,
  calendar,
  adminDirectory
};