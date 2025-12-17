# 🚀 Quick Start Guide

This guide will help you get the Calendar Etiquette Enforcer up and running quickly.

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or Atlas)
- **Google Workspace** account (for Calendar integration)
- **Slack** workspace (for bot)

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

### Slack Bot
```bash
cd slack-bot
npm install
```

## Step 2: Configure Environment Variables

### Backend Configuration

Create `backend/.env` file (copy from `.env.example` if available):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/calendar-enforcer
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calendar-enforcer

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_SERVICE_ACCOUNT_KEY=./backend/.google-service-account.json
GOOGLE_ADMIN_EMAIL=admin@razorpay.com

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
SLACK_PORT=3001

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Backend URL
BACKEND_URL=http://localhost:5000
```

### Frontend Configuration

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## Step 3: Setup MongoDB

### Option A: Local MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
MongoDB runs as a service automatically after installation.

### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster (Free tier M0)
4. Create database user
5. Whitelist your IP (or use 0.0.0.0/0 for development)
6. Get connection string and update `MONGODB_URI` in `.env`

## Step 4: Setup Google Calendar Integration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable APIs:
   - Google Calendar API
   - Admin SDK API
   - Google Workspace Add-ons API
4. Create OAuth 2.0 credentials (Desktop app)
5. Create Service Account for domain-wide delegation
6. Download credentials and save as `backend/.google-credentials.json`
7. Download service account key as `backend/.google-service-account.json`
8. Update `.env` with your credentials

## Step 5: Setup Slack Bot

1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app
3. Enable Socket Mode
4. Add bot token scopes:
   - `chat:write`
   - `users:read`
   - `users:read.email`
   - `commands`
   - `im:write`
5. Install app to workspace
6. Copy tokens to `.env`:
   - Bot User OAuth Token (xoxb-...)
   - Signing Secret
   - App-Level Token (xapp-...)

## Step 6: Start the Application

### Terminal 1: Start MongoDB (if using local)
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows - MongoDB runs automatically
```

### Terminal 2: Start Backend
```bash
cd backend
npm run dev
```

Expected output:
```
[INFO] MongoDB connected successfully
[INFO] Reminder service started
[INFO] Server running on port 5000
⚡️ Slack bot is running!
```

### Terminal 3: Start Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 523 ms
  ➜  Local:   http://localhost:3000/
```

## Step 7: Verify Everything Works

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok",...}`

2. **Frontend Dashboard:**
   Open http://localhost:3000 in your browser
   Should show the dashboard (may be empty initially)

3. **Slack Bot:**
   In Slack, type `/calendar-help`
   Should receive help message

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running: `mongosh`
- Verify `MONGODB_URI` in `.env`
- For Atlas: Check IP whitelist

### Backend Won't Start
- Check all environment variables are set
- Verify MongoDB connection
- Check port 5000 is not in use

### Frontend Won't Start
- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Check port 3000 is not in use

### Slack Bot Not Responding
- Verify Socket Mode is enabled
- Check all Slack tokens in `.env`
- Reinstall app to workspace if needed

### Google Calendar Integration Issues
- Verify credentials files exist
- Check OAuth consent screen is configured
- Ensure APIs are enabled

## Next Steps

1. **Sync Slack Users:**
   ```bash
   curl -X POST http://localhost:5000/api/admin/sync-slack-users
   ```

2. **Test Meeting Registration:**
   - Create a meeting in Google Calendar
   - Use the Google Add-on to add agenda
   - Check backend logs for registration

3. **View Dashboard:**
   - Open http://localhost:3000
   - Navigate to Dashboard, Leaderboard, Analytics

## Development Commands

### Backend
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Project Structure

```
calendar-etiquette-enforcer/
├── backend/          # Node.js API server
├── frontend/         # React frontend
├── slack-bot/        # Slack bot handlers
├── google-addon/     # Google Workspace add-on
└── scripts/          # Setup scripts
```

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review API docs in [docs/API.md](./docs/API.md)
- Check logs in `backend/logs/` directory

## Production Deployment

For production deployment:
1. Use MongoDB Atlas
2. Deploy backend to cloud (Heroku/AWS/GCP)
3. Deploy frontend to Vercel/Netlify
4. Update all URLs in configs
5. Enable HTTPS
6. Configure domain-wide Google Add-on deployment

---

**Happy Coding! 🎉**

