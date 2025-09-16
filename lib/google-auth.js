const { google } = require('googleapis');

function getGoogleAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE, // Path to service account key
    // OR  inline credentials: waiting for Capretti
    credentials: process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS ? 
      JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) : undefined,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/tasks'
    ]
  });
  
  return auth;
}

function getCalendarClient() {
  const auth = getGoogleAuth();
  return google.calendar({ version: 'v3', auth });
}

function getTasksClient() {
  const auth = getGoogleAuth();
  return google.tasks({ version: 'v1', auth });
}

module.exports = {
  getGoogleAuth,
  getCalendarClient,
  getTasksClient
};
