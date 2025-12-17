📅 Calendar Etiquette Enforcer

Improving meeting hygiene at Razorpay through intelligent automation, gamification, and a whole lot of humor!

Built for Razorpay | A complete solution to enforce agenda requirements, automate RSVP reminders, and track calendar etiquette across the organization.

📋 Table of Contents

Overview
Features
Architecture
Tech Stack
Prerequisites
Installation

1. Project Setup
2. MongoDB Setup
3. Backend Configuration
4. Google Calendar Integration
5. Slack Bot Setup
6. Google Workspace Add-on Deployment
7. Frontend Setup


Running the Application
Testing
API Documentation
Usage Guide
Troubleshooting
Project Structure
Contributing
License


🎯 Overview
The Problem:
Meetings at Razorpay lack basic hygiene: many invites go out without an agenda, attendees don't RSVP, organizers don't know who is coming, and attendees don't know why they're coming. This wastes time, creates confusion, and forces people to chase context on Slack/WhatsApp.
The Solution:
Calendar Etiquette Enforcer is an integrated system that:

✅ Enforces agendas on every meeting invite through a Google Workspace Add-on
📱 Sends automated RSVP reminders via Slack with escalating humor
🏆 Gamifies meeting etiquette with leaderboards and badges
🏢 Auto-releases meeting rooms when no one RSVPs
📊 Provides analytics on meeting efficiency across the organization
⚡ Supports mandatory attendees with auto-cancellation if they decline


✨ Features
Core Features
FeatureDescription📋 Agenda EnforcementGoogle Calendar add-on that blocks meeting creation without a structured agenda📱 Slack RSVP RemindersAutomated reminders with escalating tone: Gentle → Firm → Cheeky🏆 Leaderboard & BadgesGamified tracking with badges like "Agenda Ninja" 🥷, "RSVP Champion" ⚡, "Serial Ghost" 👻🏢 Smart Room ManagementAuto-release rooms 15 minutes before meetings with no RSVPs⚠️ Mandatory AttendeesAuto-cancel meetings if specified mandatory attendees decline📊 Analytics DashboardReal-time insights into meeting efficiency, RSVP rates, and room usage🔥 Streak TrackingTrack user RSVP streaks and reward consistency🎨 Agenda TemplatesPre-formatted agenda sections: Purpose, Outcomes, Decisions, Pre-reads
Bonus Features

Multi-factor scoring system for agenda quality
Department-wise statistics for team comparisons
Historical data tracking for trend analysis
Webhook integration for real-time calendar sync
Smart badge system that updates automatically based on behavior


🏗️ Architecture
┌─────────────────────────────────────────────────────────────┐
│                     Google Workspace                         │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │ Google Calendar│◄────────┤  Calendar Add-on │           │
│  │     API        │         │  (Apps Script)   │           │
│  └────────┬───────┘         └──────────────────┘           │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ Webhooks / API Calls
            │
┌───────────▼──────────────────────────────────────────────────┐
│                   Backend API (Node.js)                       │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │   Express    │  │  Services   │  │   MongoDB    │       │
│  │   Routes     │──┤  - Calendar │──┤   Database   │       │
│  │              │  │  - Reminder │  │              │       │
│  │              │  │  - Badge    │  │              │       │
│  │              │  │  - Slack    │  │              │       │
│  └──────────────┘  └─────────────┘  └──────────────┘       │
└───────────┬──────────────────────────────────────────────────┘
            │
            │ REST API
            │
┌───────────┴──────────────────────┬───────────────────────────┐
│                                  │                           │
│  ┌──────────────────┐           │   ┌──────────────────┐   │
│  │  React Dashboard │           │   │    Slack Bot     │   │
│  │   (Frontend)     │           │   │  (Socket Mode)   │   │
│  │  - Leaderboard   │           │   │  - Reminders     │   │
│  │  - Analytics     │           │   │  - RSVP Actions  │   │
│  │  - Stats         │           │   │  - Commands      │   │
│  └──────────────────┘           │   └──────────────────┘   │
│                                  │                           │
└──────────────────────────────────┴───────────────────────────┘

🛠️ Tech Stack
Backend

Runtime: Node.js 18+
Framework: Express.js
Database: MongoDB
APIs: Google Calendar API, Google Admin SDK, Slack Bolt API
Scheduling: node-cron
Authentication: OAuth 2.0, JWT

Frontend

Framework: React 18
Build Tool: Vite
Styling: Tailwind CSS
Charts: Recharts
Routing: React Router v6
HTTP Client: Axios

Integrations

Google Workspace Add-on: Apps Script
Slack Bot: Bolt for JavaScript (Socket Mode)
Calendar Sync: Google Calendar Push Notifications

Development Tools

Version Control: Git
Package Manager: npm
Code Editor: VS Code (recommended)
API Testing: Postman/Thunder Client (optional)


📦 Prerequisites
Before you begin, ensure you have the following installed and configured:
Required Software
SoftwareVersionInstallationNode.js18.x or higherDownloadnpm9.x or higherComes with Node.jsMongoDB6.x or higherDownload or use MongoDB AtlasGitLatestDownload
Required Accounts & Access

✅ Google Workspace Account (with admin access for domain-wide delegation)
✅ Slack Workspace (with permission to create apps)
✅ Google Cloud Platform account (free tier is sufficient)
✅ Razorpay email domain access (for production deployment)

System Requirements

OS: macOS, Linux, or Windows (WSL recommended for Windows)
RAM: Minimum 4GB (8GB recommended)
Disk Space: 2GB free space
Network: Internet connection for API calls


🚀 Installation
1. Project Setup
Clone the Repository
bash# Clone the repository
git clone https://github.com/your-username/calendar-etiquette-enforcer.git
cd calendar-etiquette-enforcer
Create Project Structure
bash# Create all necessary directories
mkdir -p backend/{config,models,services,routes,middleware,utils}
mkdir -p frontend/src/{components/{Dashboard,Leaderboard,Analytics,Layout},pages,hooks,utils}
mkdir -p google-addon/src
mkdir -p slack-bot/{handlers,blocks}
mkdir -p scripts docs logs

echo "✅ Project structure created!"

2. MongoDB Setup
Option A: Local MongoDB (Recommended for Development)
macOS:
bash# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB service
brew services start mongodb-community@6.0

# Verify installation
mongosh
# Type 'exit' to quit
Linux (Ubuntu/Debian):
bash# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
mongosh
Windows:
bash# Download MongoDB installer from:
# https://www.mongodb.com/try/download/community

# Run installer and follow installation wizard
# MongoDB will start as a Windows service automatically

# Verify installation (in Command Prompt)
mongosh
```

#### Option B: MongoDB Atlas (Cloud - Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Click **"Create a New Cluster"**
4. Choose **Free Tier (M0)**
5. Select region closest to you (Mumbai for India)
6. Click **"Create Cluster"** (takes 3-5 minutes)
7. **Create Database User**:
   - Security → Database Access
   - Add New Database User
   - Username: `calendar-enforcer`
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database
8. **Whitelist IP Address**:
   - Security → Network Access
   - Add IP Address
   - Choose: "Allow Access from Anywhere" (0.0.0.0/0) for development
9. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

Your connection string will look like:
```
mongodb+srv://calendar-enforcer:<password>@cluster0.xxxxx.mongodb.net/calendar-enforcer?retryWrites=true&w=majority

3. Backend Configuration
Install Dependencies
bashcd backend
npm init -y

# Install production dependencies
npm install express mongoose googleapis @slack/web-api @slack/bolt cors dotenv node-cron jsonwebtoken bcryptjs

# Install development dependencies
npm install --save-dev nodemon

echo "✅ Backend dependencies installed!"
Configure Environment Variables
bash# Create .env file
touch .env
Edit backend/.env with the following content:
bash# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/calendar-enforcer

# For MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://calendar-enforcer:<password>@cluster0.xxxxx.mongodb.net/calendar-enforcer?retryWrites=true&w=majority

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

# Backend URL (for webhooks)
BACKEND_URL=http://localhost:5000
Update package.json Scripts
Edit backend/package.json:
json{
  "name": "calendar-etiquette-enforcer-backend",
  "version": "1.0.0",
  "description": "Backend API for Calendar Etiquette Enforcer",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "setup-google": "node ../scripts/setup-google-auth.js",
    "setup-slack": "node ../scripts/setup-slack-bot.js",
    "seed": "node ../scripts/seed-data.js"
  },
  "keywords": ["calendar", "slack", "razorpay", "automation"],
  "author": "Abhinav",
  "license": "MIT"
}
```

---

### 4. Google Calendar Integration

#### Step 4.1: Create Google Cloud Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. Click **"Select a Project"** → **"New Project"**
3. **Project Name**: `Calendar Etiquette Enforcer`
4. **Organization**: Select your organization or leave as "No organization"
5. Click **"Create"**
6. Wait for project creation (30 seconds)

#### Step 4.2: Enable Required APIs

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search and enable these APIs:
   - ✅ **Google Calendar API**
   - ✅ **Admin SDK API**
   - ✅ **Google Workspace Add-ons API**

#### Step 4.3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - **User Type**: Internal (for Razorpay employees only)
   - **App Name**: Calendar Etiquette Enforcer
   - **User support email**: your-email@razorpay.com
   - **Developer contact**: your-email@razorpay.com
   - **Scopes**: Add these scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
   - Save and continue
4. Back to Credentials → **"Create OAuth client ID"**:
   - **Application type**: Desktop app
   - **Name**: Calendar Enforcer Desktop
   - Click **"Create"**
5. **Download JSON** file → Save as `backend/.google-credentials.json`

#### Step 4.4: Create Service Account (for Domain-Wide Delegation)

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"Service Account"**
3. **Service account details**:
   - **Name**: `calendar-enforcer-sa`
   - **ID**: `calendar-enforcer-sa`
   - Click **"Create and Continue"**
4. **Grant this service account access** (skip, click Continue)
5. Click **"Done"**
6. Click on the created service account
7. Go to **"Keys"** tab → **"Add Key"** → **"Create new key"**
8. Choose **JSON** format → Click **"Create"**
9. Save the downloaded file as `backend/.google-service-account.json`

#### Step 4.5: Enable Domain-Wide Delegation

1. In the service account details, copy the **"Unique ID"** (a long number)
2. Go to **Google Workspace Admin Console**: https://admin.google.com
3. Navigate to **Security** → **Access and data control** → **API Controls**
4. Click **"Manage Domain Wide Delegation"**
5. Click **"Add new"**:
   - **Client ID**: Paste the Unique ID from step 1
   - **OAuth Scopes**: Add these (comma-separated):
```
     https://www.googleapis.com/auth/calendar,
     https://www.googleapis.com/auth/calendar.events,
     https://www.googleapis.com/auth/admin.directory.user.readonly

Click "Authorize"

Step 4.6: Run Google OAuth Setup Script
bashcd backend
node ../scripts/setup-google-auth.js
Follow the prompts:

A URL will be displayed
Copy and paste it into your browser
Sign in with your Google account
Allow the requested permissions
Copy the authorization code
Paste it back into the terminal
✅ Token will be saved as backend/.google-token.json


5. Slack Bot Setup
Step 5.1: Create Slack App

Go to Slack API: https://api.slack.com/apps
Click "Create New App"
Choose "From scratch"
App Name: Calendar Etiquette Enforcer
Pick a workspace: Select your Razorpay workspace
Click "Create App"

Step 5.2: Enable Socket Mode

In your app settings, go to "Socket Mode"
Enable Socket Mode: Toggle ON
Token Name: socket-token
Scopes: Select connections:write
Click "Generate"
Copy the token (starts with xapp-) → Save for later

Step 5.3: Add Bot Token Scopes

Go to "OAuth & Permissions" in the sidebar
Scroll to "Scopes" → "Bot Token Scopes"
Click "Add an OAuth Scope" and add these scopes:

✅ chat:write - Send messages
✅ users:read - View users
✅ users:read.email - View email addresses
✅ commands - Add slash commands
✅ im:write - Send direct messages



Step 5.4: Install App to Workspace

Scroll up to "OAuth Tokens for Your Workspace"
Click "Install to Workspace"
Review permissions → Click "Allow"
Copy the Bot User OAuth Token (starts with xoxb-) → Save for later

Step 5.5: Get Signing Secret

Go to "Basic Information" in the sidebar
Scroll to "App Credentials"
Copy the Signing Secret → Save for later

Step 5.6: Add Slash Commands

Go to "Slash Commands" in the sidebar
Click "Create New Command"

Command 1:

Command: /calendar-stats
Request URL: http://localhost:5000/slack/commands (temporary)
Short Description: View your calendar etiquette stats
Usage Hint: [no parameters needed]
Click "Save"

Command 2:

Command: /calendar-help
Request URL: http://localhost:5000/slack/commands (temporary)
Short Description: Show help message
Usage Hint: [no parameters needed]
Click "Save"

Step 5.7: Enable Interactivity

Go to "Interactivity & Shortcuts"
Toggle "Interactivity" ON
Request URL: http://localhost:5000/slack/interactions (temporary)
Click "Save Changes"


Note: For local development, these URLs won't work. Socket Mode handles all communication. For production, you'll need to expose your server with a public URL (using ngrok or deploy to a server).

Step 5.8: Run Slack Bot Setup Script
bash# From backend directory
node ../scripts/setup-slack-bot.js
Follow the prompts:

Confirm you've completed the above steps (yes)
Enter your Bot Token (xoxb-...)
Enter your Signing Secret
Enter your App-Level Token (xapp-...)
✅ Credentials will be saved to .env

Step 5.9: Sync Slack Users (Optional but Recommended)
After starting the backend, you can sync all Slack users to create the email-to-Slack-ID mapping:
bash# Start backend first
npm run dev

# In another terminal, make API call
curl -X POST http://localhost:5000/api/admin/sync-slack-users

6. Google Workspace Add-on Deployment
Step 6.1: Install clasp (Command Line Apps Script)
bash# Install globally
npm install -g @google/clasp

# Login to Google account
clasp login
This will open a browser window. Sign in with your Google Workspace account.
Step 6.2: Create Add-on Project
bashcd google-addon

# Create new Apps Script project
clasp create --type addon --title "Calendar Etiquette Enforcer"
```

**Output:**
```
Created new Google Apps Script project: https://script.google.com/d/xxxxx/edit
Warning: files in subfolder are not accounted for unless you set a '.claspignore' file.
Cloned 1 file.
└─ appsscript.json
Step 6.3: Update Backend URL in Add-on
Edit google-addon/src/Code.gs and update line 7:
javascriptconst CONFIG = {
  BACKEND_API: 'http://localhost:5000', // For local testing
  // For production: 'https://your-production-url.com'
  MIN_AGENDA_LENGTH: 50,
  AGENDA_TEMPLATE: `📍 Purpose:

🎯 Expected Outcomes:

⚡ Decisions Needed:

📌 Pre-reads (optional):`
};
Step 6.4: Push Code to Apps Script
bash# Push all files
clasp push

# If asked about manifest, choose 'Y' to overwrite
```

**Verify files pushed:**
```
└─ appsscript.json
└─ Code.gs
Step 6.5: Deploy Add-on
bash# Create deployment
clasp deploy --description "v1.0 - Initial Release"
```

**Output:**
```
Created version 1.
- xxxxxxxxx @1.
Copy the deployment ID (the xxxxxxxxx part).
Step 6.6: Test Add-on

Open the Apps Script editor:

bash   clasp open

In the editor, go to "Run" → "Test as add-on"
Select "Calendar event is opened"
Click "Test"
Open Google Calendar in another tab
Create a new event
The add-on should appear in the sidebar!

Step 6.7: Publish to Google Workspace Marketplace (Optional - For Org-Wide Deployment)
For organization-wide deployment:

In Apps Script editor, click "Deploy" → "New deployment"
Choose type: "Add-on"
Fill in deployment details:

Short description: Enforce meeting agendas
Help URL: Your documentation URL
Post-install tip: "Create a meeting to get started!"


Click "Deploy"
Share the deployment link with your Google Workspace admin
Admin installs it for the entire organization


7. Frontend Setup
Step 7.1: Create React App with Vite
bashcd frontend

# Create Vite React app
npm create vite@latest . -- --template react

# When prompted:
# ? Current directory is not empty. Remove existing files and continue? › Yes

# Install dependencies
npm install

# Install project-specific dependencies
npm install react-router-dom recharts axios date-fns

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
Step 7.2: Configure Tailwind CSS
Edit tailwind.config.js:
javascript/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4285f4',
        secondary: '#34a853',
        warning: '#fbbc04',
        danger: '#ea4335',
      }
    },
  },
  plugins: [],
}
Step 7.3: Configure Vite
Edit vite.config.js:
javascriptimport { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
Step 7.4: Create Environment File
bash# Create .env file in frontend directory
touch .env
Edit frontend/.env:
bashVITE_API_URL=http://localhost:5000/api
Step 7.5: Update Index CSS
Replace src/index.css content with:
css@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
Step 7.6: Copy All React Components
Now copy all the React component files from the previous codebase into your frontend/src/ directory:
bash# From project root
# Copy all components
cp -r <previous_code_location>/frontend/src/* frontend/src/

# Or manually create each file using the code provided earlier:
# - src/App.jsx
# - src/main.jsx
# - src/pages/Dashboard.jsx
# - src/pages/Leaderboard.jsx
# - src/pages/Analytics.jsx
# - src/components/Dashboard/StatsCard.jsx
# - src/components/Dashboard/TrendChart.jsx
# - src/utils/api.js
Step 7.7: Test Frontend
bashnpm run dev
Open http://localhost:3000 in your browser. You should see the dashboard (it will show loading state until backend is running).

🎮 Running the Application
Quick Start (All Services)
Terminal 1: Start MongoDB (if using local)
bash# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows - MongoDB runs as service automatically
Terminal 2: Start Backend API
bashcd backend
npm run dev
```

**Expected Output:**
```
[INFO] MongoDB connected successfully
[INFO] Reminder service started
[INFO] Server running on port 5000
[INFO] Environment: development
⚡️ Slack bot is running!
Terminal 3: Start Frontend
bashcd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
Terminal 4: Start Slack Bot (Optional - if not started with backend)
bashcd slack-bot
node app.js
Verify Everything is Running
Open these URLs in your browser:

Backend Health Check: http://localhost:5000/health

Should return: {"status":"ok","timestamp":"...","uptime":...}


Frontend Dashboard: http://localhost:3000

Should display the dashboard


Slack Bot: In Slack, type /calendar-help

Should receive help message


Google Add-on:

Open Google Calendar
Create a new event
Add-on should appear in sidebar




🧪 Testing
Manual Testing Checklist
1. Backend API Testing
bash# Test health endpoint
curl http://localhost:5000/health

# Test dashboard stats (should return empty data initially)
curl http://localhost:5000/api/dashboard/stats
```

#### 2. Google Calendar Add-on Testing

1. Open Google Calendar: https://calendar.google.com
2. Click **"Create"** to create a new event
3. **Add-on should appear** in the right sidebar
4. Fill in the agenda form with test data
5. Click **"Save Agenda"**
6. Check backend logs for meeting registration
7. Verify event description includes agenda

#### 3. Slack Bot Testing

**Test Commands:**
```
/calendar-stats     → Should show stats (or "No stats yet")
/calendar-help      → Should show help message
Test RSVP Flow:

Wait for a reminder (or trigger manually in code)
Click RSVP buttons (Accept/Decline/Tentative)
Verify response updates in Slack
Check MongoDB for updated RSVP status

4. Frontend Testing
Navigate through all pages:

http://localhost:3000/ (Dashboard)
http://localhost:3000/leaderboard (Leaderboard)
http://localhost:3000/analytics (Analytics)

Verify:

✅ Stats cards display correctly
✅ Charts render
✅ Leaderboard shows users
✅ Navigation works

5. Database Testing
bash# Connect to MongoDB
mongosh

# Switch to database
use calendar-enforcer

# Check collections
show collections

# View meetings
db.meetings.find().pretty()

# View user stats
db.userstats.find().pretty()

# Exit
exit
Automated Testing (Optional)
Create test files for critical functions:
bash# Backend tests
cd backend
npm install --save-dev jest supertest
npm test
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
Endpoints
Events
MethodEndpointDescriptionRequest BodyPOST/events/registerRegister new meeting{ eventId, agenda, mandatoryAttendees, creator }POST/events/rsvpUpdate RSVP status{ eventId, userEmail, responseStatus }GET/events/:eventIdGet meeting details-
Dashboard
MethodEndpointDescriptionQuery ParamsGET/dashboard/statsGet overall statistics-GET/dashboard/leaderboardGet user leaderboard?limit=50GET/dashboard/user/:emailGet user stats-GET/dashboard/roomsGet room usage stats-GET/dashboard/badgesGet all badge definitions-
Webhooks
MethodEndpointDescriptionHeadersPOST/webhooks/calendarGoogle Calendar webhookx-goog-channel-id, x-goog-resource-state
Example Requests
Register Meeting
bashcurl -X POST http://localhost:5000/api/events/register \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "abc123xyz",
    "agenda": "📍 Purpose: Q4 Planning\n🎯 Expected Outcomes: Finalized roadmap\n⚡ Decisions Needed: Budget allocation",
    "mandatoryAttendees": ["ceo@razorpay.com"],
    "creator": "john.doe@razorpay.com"
  }'
Update RSVP
bashcurl -X POST http://localhost:5000/api/events/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "abc123xyz",
    "userEmail": "jane.smith@razorpay.com",
    "responseStatus": "accepted"
  }'
Get Dashboard Stats
bashcurl http://localhost:5000/api/dashboard/stats
```

---

## 📖 Usage Guide

### For Meeting Organizers

#### Creating a Meeting with Agenda

1. **Open Google Calendar**
2. **Click "Create"** or click on a time slot
3. **Add meeting details**:
   - Title
   - Date & Time
   - Add attendees
4. **Add-on appears** in right sidebar
5. **Fill in agenda template**:
```
   📍 Purpose: [What is this meeting about?]
   
   🎯 Expected Outcomes: [What should we achieve?]
   
   ⚡ Decisions Needed: [What needs to be decided?]
   
   📌 Pre-reads: [Any docs to review beforehand?]
```
6. **(Optional) Add mandatory attendees**: Enter comma-separated emails
7. **Click "Save Agenda"**
8. ✅ **Send invite** - Agenda is automatically added to event description

### For Attendees

#### Responding to RSVP Reminders

1. **Receive Slack DM** with meeting reminder
2. **Review agenda** in the message
3. **Click one of three buttons**:
   - ✅ **Accept** - You'll attend
   - ❓ **Tentative** - You might attend
   - ❌ **Decline** - You won't attend
4. **Confirmation message** appears
5. **Calendar automatically updated** with your response

#### Checking Your Stats

In Slack, type:
```
/calendar-stats
```

You'll see:
- 🥷 **Agenda Score**: Points for creating meetings with agendas
- ⚡ **RSVP Score**: Points for timely RSVPs
- 👻 **Ghost Score**: Penalty points for ignored RSVPs
- 🔥 **Current Streak**: Days of consecutive timely RSVPs
- 🏆 **Badges**: Earned achievements

### For Admins

#### Viewing the Dashboard

1. **Open Dashboard**: http://localhost:3000
2. **Overview**:
   - Total meetings created
   - Percentage with agendas
   - RSVP rate
   - Auto-cancelled meetings
3. **Navigate to Leaderboard**: View top performers
4. **Navigate to Analytics**: View room usage efficiency

#### Monitoring Meeting Etiquette

**Key Metrics to Watch:**
- **Agenda Percentage**: Target >90%
- **RSVP Rate**: Target >80%
- **Auto-Cancellation Rate**: Should be <5%
- **Room Release Rate**: Tracks efficiency

**Identify Issues:**
- Users with high Ghost Score (>10)
- Departments with low agenda scores
- Frequently released rooms

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue 1: MongoDB Connection Error

**Error:**
```
MongooseError: Could not connect to any servers in your MongoDB Atlas cluster
Solution:
bash# Check if MongoDB is running
mongosh

# If not running:
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# For MongoDB Atlas: Check IP whitelist in Atlas dashboard
Issue 2: Google Add-on Not Appearing
Problem: Add-on doesn't show in Google Calendar sidebar
Solutions:

Clear browser cache: Ctrl+Shift+Delete → Clear cache
Wait 5-10 minutes: Google needs time to propagate deployment
Check deployment:

bash   cd google-addon
   clasp deployments

Check Apps Script logs:

bash   clasp logs

Redeploy:

bash   clasp deploy --description "v1.1"
Issue 3: Slack Bot Not Responding
Problem: Slack commands don't work
Solutions:

Verify Socket Mode is enabled in Slack app settings
Check tokens in .env:

bash   cat backend/.env | grep SLACK

Verify bot is running:

bash   # Check backend logs for:
   # "⚡️ Slack bot is running!"

Reinstall app to workspace
Test connection:

bash   curl -X POST http://localhost:5000/slack/test
```

#### Issue 4: CORS Errors in Frontend

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
Solution:

Check backend CORS config in server.js:

javascript   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));

Verify backend is running: http://localhost:5000/health
Check proxy in vite.config.js:

javascript   proxy: {
     '/api': {
       target: 'http://localhost:5000',
       changeOrigin: true,
     }
   }
```

#### Issue 5: Google OAuth Errors

**Error:**
```
Error: invalid_grant
Solution:

Token expired - Rerun setup:

bash   cd backend
   node ../scripts/setup-google-auth.js

Check credentials file exists:

bash   ls -la backend/.google-credentials.json

Verify redirect URI matches in Google Cloud Console

Issue 6: Reminder Service Not Sending Messages
Problem: No Slack reminders are sent
Solutions:

Check cron is running:

bash   # Check backend logs for:
   # "Reminder service started"

Verify user email-Slack mapping:

bash   mongosh
   use calendar-enforcer
   db.emailslackmaps.find()

Manually sync Slack users:

bash   curl -X POST http://localhost:5000/api/admin/sync-slack-users

Test reminder manually (add to code temporarily):

javascript   // In reminderService.js
   // Call immediately instead of cron:
   sendReminderBatch();
Getting Help
If you encounter issues not covered here:

Check logs:

bash   # Backend logs
   tail -f backend/logs/info.log
   tail -f backend/logs/error.log

Enable debug mode:

bash   # In .env
   NODE_ENV=development
   DEBUG=*
```

3. **Contact maintainer**: Abhinav on Slack

---

## 📁 Project Structure
```
calendar-etiquette-enforcer/
│
├── backend/                          # Node.js Backend API
│   ├── config/                       # Configuration files
│   │   ├── database.js               # MongoDB connection
│   │   ├── google.js                 # Google APIs config
│   │   └── slack.js                  # Slack config
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── Meeting.js                # Meeting model
│   │   ├── UserStats.js              # User statistics model
│   │   └── EmailSlackMap.js          # Email-Slack ID mapping
│   │
│   ├── services/                     # Business logic
│   │   ├── calendarService.js        # Google Calendar operations
│   │   ├── reminderService.js        # RSVP reminder system
│   │   ├── slackService.js           # Slack messaging
│   │   ├── badgeService.js           # Badge evaluation
│   │   └── analyticsService.js       # Analytics & stats
│   │
│   ├── routes/                       # Express routes
│   │   ├── events.js                 # Meeting CRUD operations
│   │   ├── dashboard.js              # Dashboard APIs
│   │   ├── webhooks.js               # Google Calendar webhooks
│   │   └── admin.js                  # Admin operations
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── auth.js                   # Authentication
│   │   └── errorHandler.js           # Error handling
│   │
│   ├── utils/                        # Utility functions
│   │   ├── logger.js                 # Logging utility
│   │   └── helpers.js                # Helper functions
│   │
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Example env file
│   ├── .google-credentials.json      # Google OAuth credentials
│   ├── .google-token.json            # Google OAuth token
│   ├── .google-service-account.json  # Service account key
│   ├── server.js                     # Main entry point
│   └── package.json                  # Dependencies
│
├── frontend/                         # React Frontend
│   ├── public/                       # Static files
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── Dashboard/
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   └── TrendChart.jsx
│   │   │   ├── Leaderboard/
│   │   │   │   └── (components)
│   │   │   ├── Analytics/
│   │   │   │   └── (components)
│   │   │   └── Layout/
│   │   │       └── (components)
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── Analytics.jsx
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useStats.js
│   │   │   └── useLeaderboard.js
│   │   │
│   │   ├── utils/                    # Utilities
│   │   │   └── api.js                # API client
│   │   │
│   │   ├── App.jsx                   # Main App component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── .env                          # Environment variables
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind config
│   ├── postcss.config.js             # PostCSS config
│   └── package.json                  # Dependencies
│
├── google-addon/                     # Google Workspace Add-on
│   ├── src/
│   │   ├── Code.gs                   # Main add-on logic
│   │   ├── UI.gs                     # UI components
│   │   ├── Utils.gs                  # Utility functions
│   │   └── Config.gs                 # Configuration
│   │
│   ├── appsscript.json               # Manifest file
│   ├── .clasp.json                   # Clasp configuration
│   └── README.md                     # Add-on documentation
│
├── slack-bot/                        # Slack Bot
│   ├── handlers/                     # Event handlers
│   │   ├── actions.js                # Button actions
│   │   ├── commands.js               # Slash commands
│   │   └── events.js                 # Slack events
│   │
│   ├── blocks/                       # Slack Block Kit templates
│   │   ├── rsvpBlock.js
│   │   └── statsBlock.js
│   │
│   ├── app.js                        # Main Slack app
│   └── package.json                  # Dependencies
│
├── scripts/                          # Setup & utility scripts
│   ├── setup-google-auth.js          # Google OAuth setup
│   ├── setup-slack-bot.js            # Slack bot setup
│   ├── migrate-db.js                 # Database migrations
│   └── seed-data.js                  # Seed test data
│
├── docs/                             # Documentation
│   ├── API.md                        # API documentation
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── ARCHITECTURE.md               # Architecture docs
│
├── logs/                             # Application logs
│   ├── info.log
│   ├── error.log
│   └── debug.log
│
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
└── LICENSE                           # MIT License
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - System information (OS, Node version, etc.)

### Suggesting Features

1. Open a new issue with the `enhancement` label
2. Describe the feature and its use case
3. Explain how it aligns with project goals

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation if needed
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the **MIT License**.
```
MIT License

Copyright (c) 2024 Abhinav - Razorpay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

🙏 Acknowledgments

Razorpay for organizing Hack0n-05
Arun Chetty for the bounty and problem statement
Google Workspace for the Calendar API and Add-ons platform
Slack for the Bolt framework
The open-source community for amazing tools


📞 Contact & Support
Built by: Abhinav
Email: [abhinav.maharana@razorpay.com]
Slack: @abhinav
Hackathon: Razorpay
For questions, issues, or suggestions, please:

Open an issue on GitHub
DM on Slack: @abhinav
Email: [your-email@razorpay.com]


🚀 Deployment to Production
For production deployment instructions, see DEPLOYMENT.md
Quick checklist:

 Use MongoDB Atlas for database
 Deploy backend to cloud (Heroku/AWS/GCP)
 Deploy frontend to Vercel/Netlify
 Update all URLs in configs
 Enable HTTPS
 Set up monitoring (Sentry/DataDog)
 Configure domain-wide deployment for Google Add-on
 Install Slack app to production workspace


📊 Project Status
Current Version: 1.0.0
Status: ✅ Ready for Submission
Last Updated: December 2024
Completed Features ✅

 Google Workspace Add-on for agenda enforcement
 Backend API with MongoDB
 Slack bot with Socket Mode
 RSVP reminder system with escalating messages
 Badge and leaderboard system
 Analytics dashboard
 Room auto-release functionality
 Mandatory attendee support
 Real-time calendar webhook sync

Future Enhancements 🔮

 Email notifications (in addition to Slack)
 Mobile app (React Native)
 AI-powered agenda quality scoring
 Integration with MS Teams
 Calendar heatmaps
 Recurring meeting intelligence
 Meeting cost calculator
 Video call attendance tracking


⭐ If you find this project helpful, please star the repository!
Built with ❤️ for better meetings at RazorpayTo run code, enable code execution and file creation in Settings > Capabilities.