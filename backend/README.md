# Calendar Etiquette Enforcer - Backend

## Overview

A robust, reactive backend that gamifies meeting hygiene through intelligent automation. This system monitors Google Calendar events, enforces agenda requirements, manages RSVP tracking, and provides gamification features via Slack integration.

## Architecture

### Server-Side Polling Architecture

The backend uses **node-cron** to poll Google Calendar every 30 seconds for new or updated events. This eliminates the need for webhooks or Chrome extensions.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Google Calendar│────>│  Polling Service │────>│   MongoDB   │
└─────────────────┘     └──────────────────┘     └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Slack Bot    │
                        │ (Socket Mode)│
                        └──────────────┘
```

## Core Features

### 1. Agenda Enforcer
- Detects meetings created without agendas (< 20 characters in description)
- Sends interactive Slack messages to meeting creators
- Tracks warnings to prevent spam (max 3 warnings per meeting)
- Updates scores when agendas are added

### 2. RSVP Police
- Monitors attendee response status
- Sends escalating reminders (gentle → firm → cheeky)
- Tracks ghost behavior and updates scores

### 3. Gamification System
- **Agenda Score**: +10 points for adding agendas
- **Ghost Score**: +5 points for ignored RSVPs
- **RSVP Score**: +5 points for timely responses
- **Badges**: Earned at score milestones
  - "Agenda Ninja" (100+ agenda points)
  - "Serial Ghost" (50+ ghost points)
  - "RSVP Champion" (100+ RSVP points)
  - "Streak Master" (7+ day RSVP streak)

### 4. Leaderboard API
- Top users by agenda score
- Team comparisons
- Global statistics

## Project Structure

```
backend/
├── server.js                 # Main entry point with cron setup
├── bot.js                    # Slack bot with interactive handlers
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
├── config/
│   ├── database.js           # MongoDB connection
│   ├── google.js             # Google Service Account setup
│   └── slack.js              # Slack app initialization
├── models/
│   ├── Meeting.js            # Meeting schema with agenda tracking
│   ├── UserStats.js          # User statistics and badges
│   └── EmailSlackMap.js      # Email to Slack ID mapping
├── services/
│   ├── googleService.js      # Calendar polling and event processing
│   ├── slackService.js       # Slack messaging and user sync
│   ├── gamificationService.js # Score updates and badge awards
│   ├── calendarService.js    # Calendar CRUD operations
│   ├── reminderService.js    # Automated reminder system
│   └── analyticsService.js   # Statistics and analytics
├── routes/
│   ├── dashboard.js          # Dashboard stats endpoint
│   ├── leaderboard.js        # Leaderboard endpoint
│   ├── user.js               # User stats endpoint
│   ├── admin.js              # Admin operations
│   └── webhooks.js           # Webhook handlers
├── middleware/
│   └── errorHandler.js       # Global error handling
└── utils/
    ├── logger.js             # Custom logger
    └── helpers.js            # Utility functions
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `MONGO_URI`: MongoDB connection string
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Path to service account key file
- `GOOGLE_ADMIN_EMAIL`: Admin email for domain-wide delegation
- `SLACK_BOT_TOKEN`: Slack bot token (xoxb-...)
- `SLACK_SIGNING_SECRET`: Slack signing secret
- `SLACK_APP_TOKEN`: Slack app token for Socket Mode (xapp-...)

### 3. Setup Google Service Account

1. Create a service account in Google Cloud Console
2. Enable Domain-Wide Delegation
3. Add the following OAuth scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/admin.directory.user.readonly`
4. Download the JSON key file
5. Update `GOOGLE_SERVICE_ACCOUNT_JSON` path in `.env`

### 4. Setup Slack App

1. Create a Slack app at https://api.slack.com/apps
2. Enable Socket Mode and generate an App Token
3. Add Bot Token Scopes:
   - `chat:write`
   - `users:read`
   - `users:read.email`
4. Install the app to your workspace
5. Copy tokens to `.env`

### 5. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

### 6. Start the Server

```bash
npm run dev
```

The server will:
- Connect to MongoDB
- Initialize Slack bot in Socket Mode
- Start calendar polling every 30 seconds
- Start Express API server on port 5000

## API Endpoints

### Dashboard
```
GET /api/dashboard/stats
GET /api/dashboard/leaderboard?limit=20
GET /api/dashboard/user/:email
```

### Leaderboard
```
GET /api/leaderboard?limit=10
```

### User Stats
```
GET /api/user/:email
```

### Admin Operations
```
POST /api/admin/sync                  # Sync Slack users
POST /api/admin/trigger-reminders     # Trigger reminder batch
POST /api/admin/evaluate-badges       # Evaluate badges for all users
GET  /api/admin/system-stats          # Get system statistics
```

## How It Works

### Calendar Polling Flow

1. **Cron Job** runs every 30 seconds
2. **googleService.pollNewEvents()** fetches events updated in the last minute
3. For each event:
   - Check if agenda exists (description length >= 20 chars)
   - Check if event already processed in DB
   - If no agenda and not processed:
     - Send Slack warning to creator
     - Create/update Meeting record
     - Mark as processed

### Interactive Slack Messages

When a user receives an agenda warning, they see:
- Meeting title and details
- Text input field for agenda
- "Fix Meeting Now" button
- "Skip" button

When user clicks "Fix Meeting Now":
1. **bot.js** action handler captures the input
2. **googleService.patchEventDescription()** updates Google Calendar
3. **gamificationService.updateScore()** awards +10 points
4. Meeting marked as processed
5. Success message sent to user

### Email Mapping Problem Solution

The system maintains an `EmailSlackMap` collection:
- Maps Google Calendar emails to Slack user IDs
- Populated by `slackService.syncAllUsers()`
- Cached for performance
- Refreshed when user lookup fails

### Idempotency

The system prevents duplicate warnings using:
- `isProcessed` flag on Meeting model
- `warningsSent` counter (max 3)
- `lastWarningSent` timestamp (5 min cooldown)

## Database Models

### Meeting
```javascript
{
  googleEventId: String,        // Unique event ID
  hasAgenda: Boolean,           // Agenda detection flag
  isProcessed: Boolean,         // Prevents duplicate processing
  creatorEmail: String,         // Event creator
  attendees: [{
    email: String,
    status: String              // needsAction, accepted, declined, tentative
  }],
  warningsSent: Number,         // Warning counter
  lastWarningSent: Date         // Last warning timestamp
}
```

### UserStats
```javascript
{
  email: String,
  slackId: String,
  stats: {
    agendaScore: Number,
    ghostScore: Number,
    streak: Number
  },
  badges: [String],
  currentRSVPStreak: Number
}
```

## Troubleshooting

### Google Calendar Not Polling
- Verify service account key file exists
- Check domain-wide delegation is enabled
- Confirm OAuth scopes are correct
- Check `GOOGLE_ADMIN_EMAIL` is valid

### Slack Messages Not Sending
- Verify Slack tokens in `.env`
- Check Socket Mode is enabled
- Confirm bot scopes are correct
- Run `POST /api/admin/sync` to sync users

### MongoDB Connection Issues
- Check `MONGO_URI` format
- Verify MongoDB is running
- Check network connectivity
- Review firewall rules

## Development

### Running in Development Mode
```bash
npm run dev
```

### Environment
- Uses `nodemon` for auto-restart
- Detailed logging enabled
- Stack traces in error responses

### Testing Endpoints
```bash
# Get dashboard stats
curl http://localhost:5000/api/dashboard/stats

# Get leaderboard
curl http://localhost:5000/api/leaderboard

# Sync Slack users
curl -X POST http://localhost:5000/api/admin/sync

# Health check
curl http://localhost:5000/health
```

## Security Considerations

- Service account key stored securely (not in git)
- Slack tokens stored in environment variables
- MongoDB connection uses authentication
- CORS configured for frontend origin only
- Input validation on all endpoints
- Rate limiting recommended for production

## Performance

- Polling interval: 30 seconds (configurable)
- Lookback window: 1 minute (configurable)
- Max events per poll: 50
- Caching: Email-to-Slack mapping cached in DB
- Async/await throughout for non-blocking operations

## Production Deployment

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas or managed MongoDB
3. Deploy on cloud platform (AWS, Heroku, etc.)
4. Set up process manager (PM2)
5. Configure logging aggregation
6. Enable monitoring and alerts
7. Set up backups for MongoDB

## Contributing

This is a hackathon project! Feel free to extend with:
- More sophisticated agenda analysis
- ML-based meeting recommendations
- Integration with other calendar systems
- Advanced gamification mechanics
- Team-based competitions

## License

MIT
