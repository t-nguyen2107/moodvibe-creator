# 🚀 Deployment Guide - MoodVibe Creator

Hướng dẫn deploy MoodVibe Creator lên production (FREE hosting)

---

## 📋 Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Render        │
│   (Frontend)    │     │   (Backend)     │
│   Next.js 14    │     │   FastAPI       │
│   FREE          │     │   FREE          │
└─────────────────┘     └─────────────────┘
     moodvibe-creator        moodvibe-backend
     .vercel.app             .onrender.com
```

---

## 🎯 Prerequisites

- ✅ GitHub account
- ✅ GitHub repo: `t-nguyen2107/moodvibe-creator`
- ✅ Vercel account (sign up với GitHub)
- ✅ Render account (sign up với GitHub)

---

## 📦 Step 1: Deploy Backend (Render)

### 1.1. Go to Render
1. Visit https://render.com
2. Click **"Sign Up"** → Choose **"Sign up with GitHub"**
3. Authorize Render to access your GitHub

### 1.2. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Click **"Connect account"** if needed
3. Find `moodvibe-creator` repo → Click **"Connect"**

### 1.3. Configure Service

| Field | Value |
|-------|-------|
| **Name** | `moodvibe-backend` |
| **Region** | Singapore (closest to VN) |
| **Branch** | `main` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

### 1.4. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `sqlite:///./database.db` |
| `SECRET_KEY` | (click Generate) |
| `MASTER_ENCRYPTION_KEY` | (click Generate) |
| `UPLOAD_DIR` | `./uploads` |
| `MAX_PLAYLIST_SIZE` | `20` |
| `FRONTEND_URL` | `https://moodvibe-creator.vercel.app` |
| `AI_PROVIDER` | `auto` |
| `OLLAMA_ENABLED` | `false` |

### 1.5. Add Persistent Disk (for uploads)

1. Scroll to **"Disks"** section
2. Click **"Add Disk"**
   - **Name:** `moodvibe-data`
   - **Mount Path:** `/opt/render/project/uploads`
   - **Size:** `1 GB`
3. Update `UPLOAD_DIR` env var to `/opt/render/project/uploads`

### 1.6. Deploy
1. Click **"Deploy Web Service"**
2. Wait 5-10 minutes for build
3. Note your backend URL: `https://moodvibe-backend.onrender.com`

### 1.7. Verify
```bash
curl https://moodvibe-backend.onrender.com/health
```

---

## 🌐 Step 2: Deploy Frontend (Vercel)

### 2.1. Go to Vercel
1. Visit https://vercel.com
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. Authorize Vercel

### 2.2. Import Project
1. Click **"Add New..."** → **"Project"**
2. Find `moodvibe-creator` repo
3. Click **"Import"**

### 2.3. Configure Project

| Field | Value |
|-------|-------|
| **Framework Preset** | `Next.js` (auto-detected) |
| **Root Directory** | `./frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |

### 2.4. Add Environment Variable

Click **"Environment Variables"**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://moodvibe-backend.onrender.com` |

### 2.5. Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. 🎉 Done!

### 2.6. Get Your URL
Your app will be at: `https://moodvibe-creator.vercel.app`

---

## 🔧 Step 3: Update CORS (Backend)

After deploying frontend, update Render env:

1. Go to Render Dashboard → `moodvibe-backend`
2. Click **"Environment"** tab
3. Update `FRONTEND_URL` to your Vercel URL:
   - `https://moodvibe-creator.vercel.app`
4. Click **"Save Changes"** → Service will auto-restart

---

## 🔄 Step 4: Setup Auto Deploy

Both Vercel and Render auto-deploy when you push to `main` branch!

```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

✅ Vercel: Auto-deploys in ~1-2 mins
✅ Render: Auto-deploys in ~5-10 mins

---

## 📊 Monitoring

### Render Dashboard
- Logs: `https://dashboard.render.com/web/moodvibe-backend/logs`
- Metrics: CPU, Memory, Requests

### Vercel Dashboard
- Deployments: `https://vercel.com/dashboard`
- Analytics: Views, Visitors

---

## 🆓 Free Tier Limits

| Service | Limit |
|---------|-------|
| **Render** | 750 hours/month, 512MB RAM |
| **Vercel** | 100GB bandwidth, 6000 build mins |

**Note:** Render free tier spins down after 15 mins inactivity (cold start ~30s)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs in Render dashboard
# Common issues:
# - Missing env vars
# - Port not using $PORT
# - Dependencies not installed
```

### Frontend can't connect to backend
1. Check `NEXT_PUBLIC_API_URL` in Vercel
2. Check `FRONTEND_URL` in Render (CORS)
3. Check backend is running: `/health` endpoint

### FFmpeg not working on Render
Render free tier doesn't support FFmpeg. Options:
1. Upgrade to paid plan ($7/month)
2. Use external FFmpeg service
3. Process videos client-side

---

## 🎉 Done!

Your MoodVibe Creator is now live at:
- **Frontend:** https://moodvibe-creator.vercel.app
- **Backend:** https://moodvibe-backend.onrender.com

Share with the world! 🚀
