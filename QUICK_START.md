# ⚡ Quick Start - Get Running in 5 Minutes

For hackathon demo or quick testing, follow these minimal steps:

## 🎯 Minimal Setup (Demo Mode)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Create Minimal `.env` Files

**`backend/.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/calendar-enforcer
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB (Choose One)

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

**Option B: MongoDB Atlas (Free Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create free cluster (M0)
4. Get connection string
5. Update `MONGODB_URI` in `backend/.env`

### 4. Start the App

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the App

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

### 6. Load Demo Data (Optional)

```bash
curl -X POST http://localhost:5000/api/demo/seed
```

Or click "Load Demo Data" button in the dashboard.

---

## ✅ What Works Without Full Setup

- ✅ Landing page
- ✅ Login (demo mode - any credentials work)
- ✅ Dashboard with demo data
- ✅ All frontend pages
- ✅ Analytics and charts
- ✅ Cost calculator
- ✅ Team comparison
- ✅ Leaderboard

## ⚠️ What Requires Additional Setup

- ❌ Google Calendar integration (needs OAuth)
- ❌ Slack bot (needs Slack app setup)
- ❌ Real meeting data (needs Google Calendar)

---

## 🚀 Deploy to Production (Quick)

### Backend → Railway (Free)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select repo → Set root to `backend`
4. Add environment variables
5. Deploy!

### Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com)
2. Import Git Repository
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Add `VITE_API_URL` environment variable
6. Deploy!

---

## 📝 Environment Variables Reference

### Required (Minimum)
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Backend port (default: 5000)
- `VITE_API_URL` - Frontend API URL

### Optional (For Full Features)
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `SLACK_BOT_TOKEN` - Slack bot
- `SLACK_APP_TOKEN` - Slack bot
- `SLACK_SIGNING_SECRET` - Slack bot

---

## 🎉 You're Ready!

The app should now be running. Visit http://localhost:3000 to see the landing page!

For full production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)

