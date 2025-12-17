# Backend Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 16+ installed
- MongoDB running locally or MongoDB Atlas account
- Google Workspace admin access
- Slack workspace admin access

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Required
PORT=5000
MONGO_URI=mongodb://localhost:27017/calendar-enforcer

# Google (Service Account with Domain-Wide Delegation)
GOOGLE_SERVICE_ACCOUNT_JSON=./backend/.google-service-account.json
GOOGLE_ADMIN_EMAIL=admin@razorpay.com
GOOGLE_CALENDAR_ID=primary

# Slack (Socket Mode)
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token

# Polling Configuration
POLL_INTERVAL_SECONDS=30
POLL_LOOKBACK_MINUTES=1
MIN_AGENDA_LENGTH=20

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Setup Google Service Account

#### Create Service Account
1. Go to Google Cloud Console → IAM & Admin → Service Accounts
2. Create new service account
3. Download JSON key file
4. Save as `.google-service-account.json` in backend folder

#### Enable Domain-Wide Delegation
1. Go to Service Account → Edit
2. Check "Enable G Suite Domain-wide Delegation"
3. Note the Client ID

#### Add OAuth Scopes in Google Admin
1. Go to admin.google.com → Security → API Controls → Domain-wide Delegation
2. Add new API client with Client ID from above
3. Add scopes:
   ```
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   https://www.googleapis.com/auth/calendar.readonly
   https://www.googleapis.com/auth/admin.directory.user.readonly
   ```

### 5. Setup Slack App

#### Create Slack App
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: "Calendar Etiquette Enforcer"

#### Enable Socket Mode
1. Go to "Socket Mode" → Enable
2. Generate App-Level Token (connections:write)
3. Copy token → `SLACK_APP_TOKEN`

#### Add Bot Scopes
1. Go to "OAuth & Permissions"
2. Add Bot Token Scopes:
   - `chat:write`
   - `users:read`
   - `users:read.email`
3. Install to workspace
4. Copy Bot Token → `SLACK_BOT_TOKEN`

#### Get Signing Secret
1. Go to "Basic Information"
2. Copy Signing Secret → `SLACK_SIGNING_SECRET`

#### Enable Interactivity
1. Go to "Interactivity & Shortcuts"
2. Enable Interactivity
3. No Request URL needed (using Socket Mode)

### 6. Start MongoDB
```bash
# Local
mongod

# Or configure MongoDB Atlas connection string in .env
```

### 7. Start Backend
```bash
npm run dev
```

You should see:
```
✅ Database connected
✅ Reminder service started
✅ Slack bot started in Socket Mode
🔄 Setting up calendar polling: every 30 seconds
✅ Calendar polling cron job initialized
🚀 Server running on port 5000
```

### 8. Sync Slack Users (Important!)
```bash
curl -X POST http://localhost:5000/api/admin/sync
```

This creates the email → Slack ID mapping required for DM functionality.

## Testing the System

### 1. Create a Test Meeting
1. Go to Google Calendar
2. Create a new meeting WITHOUT any description
3. Wait 30 seconds

### 2. Check Slack
You should receive a DM with:
- "Meeting Police Alert!"
- Text input for agenda
- "Fix Meeting Now" button

### 3. Add Agenda
1. Type an agenda in the input field
2. Click "Fix Meeting Now"
3. You should get +10 points

### 4. Check API
```bash
# Dashboard stats
curl http://localhost:5000/api/dashboard/stats

# Leaderboard
curl http://localhost:5000/api/leaderboard

# Your stats
curl http://localhost:5000/api/user/your-email@razorpay.com
```

## API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /api/dashboard/stats` - Global statistics
- `GET /api/leaderboard?limit=10` - Top users
- `GET /api/user/:email` - User statistics

### Admin Endpoints
- `POST /api/admin/sync` - Sync Slack users
- `POST /api/admin/trigger-reminders` - Trigger reminders
- `POST /api/admin/evaluate-badges` - Award badges
- `GET /api/admin/system-stats` - System statistics

## Architecture Components

### 1. Google Service (googleService.js)
- Polls calendar every 30 seconds
- Detects meetings without agendas
- Patches event descriptions
- Maintains idempotency

### 2. Slack Service (slackService.js)
- Sends interactive messages
- Syncs user email → Slack ID
- Manages DM delivery
- Caches user mappings

### 3. Gamification Service (gamificationService.js)
- Updates user scores
- Awards badges
- Calculates leaderboard
- Tracks streaks

### 4. Bot Handler (bot.js)
- Listens for button clicks
- Processes agenda submissions
- Updates calendar events
- Awards points

### 5. Server (server.js)
- Express API server
- Cron job scheduler
- Route initialization
- Error handling

## Troubleshooting

### No Slack Messages Received
1. Check Slack tokens are valid
2. Verify Socket Mode is enabled
3. Run `POST /api/admin/sync` to sync users
4. Check backend logs for errors

### Calendar Polling Not Working
1. Verify service account JSON file exists
2. Check domain-wide delegation is set up
3. Confirm OAuth scopes in Google Admin
4. Check `GOOGLE_ADMIN_EMAIL` is valid

### MongoDB Connection Failed
1. Check MongoDB is running
2. Verify `MONGO_URI` format
3. Check network connectivity
4. Review authentication credentials

### Button Click Not Working
1. Check Interactivity is enabled in Slack app
2. Verify Socket Mode is running
3. Check bot handler logs
4. Confirm action_id matches handler

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas (managed)
- [ ] Store secrets in secure vault
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Enable rate limiting
- [ ] Set up backups
- [ ] Configure alerts
- [ ] Document runbooks

## Support

For issues or questions:
1. Check logs in `backend/logs/`
2. Review error messages
3. Verify environment variables
4. Test endpoints individually
5. Check service health

## Success Metrics

Backend is working correctly when:
- ✅ Server starts without errors
- ✅ MongoDB connection established
- ✅ Slack bot connected
- ✅ Calendar polling runs every 30s
- ✅ Meetings detected and stored
- ✅ Slack messages delivered
- ✅ Button clicks update calendar
- ✅ Scores updated correctly
- ✅ API endpoints return data

Enjoy building amazing meeting hygiene at Razorpay! 🚀
