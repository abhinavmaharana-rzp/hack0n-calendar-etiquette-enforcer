# 🚀 Deployment Guide

Complete guide to deploy Calendar Etiquette Enforcer to production.

## 📋 Pre-Deployment Checklist

### ✅ Required Setup

- [ ] **MongoDB Database** (Atlas or self-hosted)
- [ ] **Google Cloud Project** with APIs enabled
- [ ] **Slack App** created and configured
- [ ] **Domain/Subdomain** for production URLs
- [ ] **SSL Certificate** (HTTPS required)
- [ ] **Environment Variables** configured

---

## 🔧 Step 1: Environment Variables Setup

### Backend Environment Variables

Create `backend/.env` with the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com

# MongoDB (Use Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calendar-enforcer?retryWrites=true&w=majority

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://your-backend-domain.com/auth/google/callback
GOOGLE_SERVICE_ACCOUNT_KEY=./backend/.google-service-account.json
GOOGLE_ADMIN_EMAIL=admin@yourdomain.com

# Slack Configuration (Optional - app works without it)
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
SLACK_PORT=3001
```

### Frontend Environment Variables

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

## 🗄️ Step 2: MongoDB Setup (MongoDB Atlas)

1. **Create Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select region closest to your deployment

3. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `calendar-enforcer`
   - Password: Generate secure password
   - Database User Privileges: "Read and write to any database"

4. **Whitelist IP Address:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For production: Add your server IP
   - For development: Use `0.0.0.0/0` (not recommended for production)

5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Update `MONGODB_URI` in `.env`

---

## 🔐 Step 3: Google Cloud Setup

### 3.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Calendar Etiquette Enforcer"
3. Enable billing (free tier available)

### 3.2 Enable Required APIs

Enable these APIs in your project:
- ✅ **Google Calendar API**
- ✅ **Admin SDK API** (for domain-wide delegation)
- ✅ **Google Workspace Add-ons API**

### 3.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Authorized redirect URIs:
   - `https://your-backend-domain.com/auth/google/callback`
5. Copy **Client ID** and **Client Secret** to `.env`

### 3.4 Create Service Account (for Domain-Wide Delegation)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service account"
3. Name: `calendar-enforcer-service`
4. Grant role: "Service Account User"
5. Click "Create Key" → JSON
6. Download and save as `backend/.google-service-account.json`
7. Copy service account email (e.g., `calendar-enforcer@project.iam.gserviceaccount.com`)

### 3.5 Enable Domain-Wide Delegation

1. In Google Workspace Admin Console:
   - Go to "Security" → "API Controls"
   - Click "Manage Domain Wide Delegation"
   - Click "Add new"
   - Client ID: (from service account JSON file)
   - OAuth Scopes:
     ```
     https://www.googleapis.com/auth/calendar
     https://www.googleapis.com/auth/calendar.events
     https://www.googleapis.com/auth/admin.directory.user.readonly
     ```
   - Click "Authorize"

---

## 💬 Step 4: Slack Bot Setup (Optional)

### 4.1 Create Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. App Name: "Calendar Etiquette Enforcer"
4. Workspace: Select your workspace

### 4.2 Enable Socket Mode

1. Go to "Socket Mode" in left sidebar
2. Toggle "Enable Socket Mode"
3. Click "Generate Token"
4. Copy **App-Level Token** (starts with `xapp-`)
5. Add to `.env` as `SLACK_APP_TOKEN`

### 4.3 Add Bot Token Scopes

1. Go to "OAuth & Permissions"
2. Scroll to "Scopes" → "Bot Token Scopes"
3. Add these scopes:
   - `chat:write`
   - `users:read`
   - `users:read.email`
   - `im:write`
   - `commands`

### 4.4 Install App to Workspace

1. Go to "Install App" in left sidebar
2. Click "Install to Workspace"
3. Authorize permissions
4. Copy **Bot User OAuth Token** (starts with `xoxb-`)
5. Add to `.env` as `SLACK_BOT_TOKEN`

### 4.5 Get Signing Secret

1. Go to "Basic Information"
2. Scroll to "App Credentials"
3. Copy **Signing Secret**
4. Add to `.env` as `SLACK_SIGNING_SECRET`

### 4.6 Create Slash Commands

1. Go to "Slash Commands"
2. Create commands:
   - `/calendar-stats` - Show user stats
   - `/calendar-help` - Show help message

---

## 🌐 Step 5: Deploy Backend

### Option A: Deploy to Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App:**
   ```bash
   cd backend
   heroku create calendar-enforcer-api
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set GOOGLE_CLIENT_ID=your_client_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_client_secret
   # ... set all other env vars
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

5. **Upload Service Account File:**
   ```bash
   # Use Heroku Config Vars or add-on for file storage
   # Or use environment variable for JSON content
   ```

### Option B: Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add `backend` as root directory
5. Set environment variables in Railway dashboard
6. Deploy automatically

### Option C: Deploy to AWS/GCP/Azure

See platform-specific documentation for:
- EC2/App Engine/App Service setup
- Load balancer configuration
- SSL certificate setup
- Environment variable configuration

---

## 🎨 Step 6: Deploy Frontend

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add `VITE_API_URL=https://your-backend-domain.com/api`

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Option B: Deploy to Netlify

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import from Git"
3. Connect repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variable: `VITE_API_URL`
6. Deploy

### Option C: Deploy to GitHub Pages

1. Update `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/calendar-etiquette-enforcer/',
     // ... rest of config
   })
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Use GitHub Actions or gh-pages package
   ```

---

## 📱 Step 7: Deploy Google Workspace Add-on

1. **Open Apps Script:**
   - Go to [Google Apps Script](https://script.google.com)
   - Create new project

2. **Upload Files:**
   - Copy files from `google-addon/src/` to Apps Script editor
   - Update `Config.gs` with your backend URL

3. **Deploy as Add-on:**
   - Click "Deploy" → "New deployment"
   - Type: "Add-on"
   - Description: "Calendar Etiquette Enforcer"
   - Execute as: Your account
   - Who has access: Your domain

4. **Test:**
   - Open Google Calendar
   - Create new event
   - Add-on should appear in sidebar

---

## ✅ Step 8: Post-Deployment Verification

### Backend Health Check

```bash
curl https://your-backend-domain.com/health
# Should return: {"status":"ok",...}
```

### Frontend Check

1. Visit your frontend URL
2. Should see landing page
3. Login should work
4. Dashboard should load

### API Test

```bash
curl https://your-backend-domain.com/api/dashboard/stats
# Should return dashboard stats
```

### Slack Bot Test

1. In Slack, type `/calendar-help`
2. Should receive help message

---

## 🔒 Security Checklist

- [ ] All environment variables are set (never commit `.env` files)
- [ ] HTTPS is enabled (SSL certificate configured)
- [ ] MongoDB connection uses authentication
- [ ] CORS is configured for production domain only
- [ ] Google OAuth redirect URIs match production URLs
- [ ] Service account key is secured (not in git)
- [ ] Slack tokens are kept secret
- [ ] Rate limiting is enabled (if applicable)

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Check database user permissions

**Google API Errors:**
- Verify APIs are enabled
- Check OAuth consent screen is configured
- Ensure service account has domain-wide delegation

**Slack Bot Not Working:**
- Verify Socket Mode is enabled
- Check all tokens are correct
- Reinstall app to workspace

### Frontend Issues

**API Calls Failing:**
- Check `VITE_API_URL` is correct
- Verify CORS is configured on backend
- Check browser console for errors

**Build Errors:**
- Run `npm install` in frontend directory
- Clear `node_modules` and reinstall
- Check for TypeScript/ESLint errors

---

## 📊 Monitoring & Maintenance

### Recommended Tools

- **Error Tracking:** Sentry, Rollbar
- **Analytics:** Google Analytics, Mixpanel
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Logs:** Loggly, Papertrail

### Regular Tasks

- Monitor error logs weekly
- Update dependencies monthly
- Review MongoDB usage
- Check API quota limits
- Backup database regularly

---

## 🎯 Quick Start for Demo/Hackathon

For a quick demo without full production setup:

1. **Use MongoDB Atlas (Free):**
   - Create free cluster
   - Get connection string
   - Add to `backend/.env`

2. **Skip Google Service Account:**
   - App works without it (limited features)
   - Can use OAuth only

3. **Skip Slack Bot:**
   - App works without it
   - Set dummy tokens in `.env`

4. **Deploy Frontend to Vercel:**
   - Free and fast
   - Automatic deployments

5. **Deploy Backend to Railway:**
   - Free tier available
   - Easy environment variable setup

---

## 📞 Support

For issues or questions:
- Check [README.md](./README.md) for detailed docs
- Review [STARTUP.md](./STARTUP.md) for setup guide
- Check logs in `backend/logs/` directory

---

**Happy Deploying! 🚀**

