# ✅ Pre-Deployment Checklist

## 🎯 For Quick Demo/Hackathon (5 minutes)

### Minimum Required:
- [x] **MongoDB** - Use MongoDB Atlas (free) or local MongoDB
- [x] **Backend `.env`** - Just `MONGODB_URI` and `PORT`
- [x] **Frontend `.env`** - Just `VITE_API_URL`
- [x] **Run `npm install`** in backend and frontend
- [x] **Start servers** - Backend on port 5000, Frontend on port 3000

**That's it!** The app works in demo mode without Google/Slack setup.

---

## 🚀 For Full Production Deployment

### 1. Database Setup
- [ ] MongoDB Atlas account created
- [ ] Database cluster created (free M0 tier works)
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string copied to `.env`

### 2. Backend Environment Variables
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `PORT` - Server port (5000 or production port)
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` - Your frontend domain
- [ ] `BACKEND_URL` - Your backend domain

### 3. Google Calendar Integration (Optional)
- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] Admin SDK API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Service account created
- [ ] Service account key downloaded
- [ ] Domain-wide delegation enabled
- [ ] All credentials added to `.env`

### 4. Slack Bot Setup (Optional)
- [ ] Slack app created
- [ ] Socket Mode enabled
- [ ] Bot token scopes added
- [ ] App installed to workspace
- [ ] Bot token copied
- [ ] Signing secret copied
- [ ] App-level token generated
- [ ] All tokens added to `.env`

### 5. Frontend Environment Variables
- [ ] `VITE_API_URL` - Your backend API URL

### 6. Deployment Platforms
- [ ] **Backend** deployed (Heroku/Railway/AWS/etc.)
- [ ] **Frontend** deployed (Vercel/Netlify/etc.)
- [ ] Environment variables set on hosting platform
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured (optional)

### 7. Google Workspace Add-on (Optional)
- [ ] Apps Script project created
- [ ] Add-on code uploaded
- [ ] Backend URL updated in Config.gs
- [ ] Add-on deployed
- [ ] Tested in Google Calendar

### 8. Post-Deployment
- [ ] Health check endpoint working
- [ ] Frontend loads correctly
- [ ] Login works
- [ ] API calls succeed
- [ ] Demo data can be loaded
- [ ] Slack bot responds (if configured)
- [ ] Google Calendar integration works (if configured)

---

## 📋 Quick Commands Reference

### Local Development
```bash
# Install all dependencies
npm run install:all

# Start backend (Terminal 1)
npm run dev:backend
# or
cd backend && npm run dev

# Start frontend (Terminal 2)
npm run dev:frontend
# or
cd frontend && npm run dev

# Load demo data
npm run demo:seed
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend (production)
cd backend
npm start
```

---

## 🎯 What You Need Right Now

### For Hackathon Demo:
1. **MongoDB Atlas** (5 min setup) - [Get free account](https://www.mongodb.com/cloud/atlas)
2. **Backend `.env`** with MongoDB URI
3. **Frontend `.env`** with API URL
4. **Run the servers**

### For Full Production:
1. Everything above, PLUS:
2. **Google Cloud** setup (if using Calendar features)
3. **Slack App** setup (if using Slack bot)
4. **Deploy** to hosting platforms
5. **Configure** Google Workspace Add-on

---

## 📚 Documentation Files

- **QUICK_START.md** - Get running in 5 minutes
- **DEPLOYMENT.md** - Complete production deployment guide
- **STARTUP.md** - Detailed local development setup
- **README.md** - Full project documentation

---

## ⚡ TL;DR - Start Now

```bash
# 1. Get MongoDB URI from Atlas (free)
# 2. Create backend/.env:
MONGODB_URI=your_mongodb_uri_here
PORT=5000

# 3. Create frontend/.env:
VITE_API_URL=http://localhost:5000/api

# 4. Install and run
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev

# 5. Visit http://localhost:3000
```

**That's it!** The app works in demo mode. Add Google/Slack later for full features.

