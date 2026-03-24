# 🎵 MoodVibe Creator

[![GitHub stars](https://img.shields.io/github/stars/t-nguyen2107/moodvibe-creator?style=social)](https://github.com/t-nguyen2107/moodvibe-creator/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/t-nguyen2107/moodvibe-creator?style=social)](https://github.com/t-nguyen2107/moodvibe-creator/network/members)
[![GitHub license](https://img.shields.io/github/license/t-nguyen2107/moodvibe-creator)](https://github.com/t-nguyen2107/moodvibe-creator/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/t-nguyen2107/moodvibe-creator)](https://github.com/t-nguyen2107/moodvibe-creator/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/t-nguyen2107/moodvibe-creator)](https://github.com/t-nguyen2107/moodvibe-creator/commits/main)

Automatically generate music playlists and upload to YouTube/TikTok

> **📍 Current Stage:** Development - Recommended to run **locally** with **Ollama** (free)

---

## ✨ Features

### 🟢 Completed
- 🔍 **Multi-source music search** - YouTube, SoundCloud, Pixabay, Free Music Archives
- 🤖 **AI Music Search** - Find music using natural language (free with Ollama)
- 🎵 **Audio merging** - Combine songs with gaps (5-10 seconds)
- 🎬 **MP4 video creation** - From audio + background image
- 📥 **Download MP3/MP4** - Save to your device
- 🔒 **Secure API key storage** - AES-256 encryption
- ✅ **Royalty-free filter** - Safe downloads
- ⚠️ **Copyright warning** - Alerts for copyrighted music
- 🎯 **Special genres** - Work music, lo-fi, sleep music, baby lullabies...

### 🟡 In Progress
- 🎨 **AI background generation** (Stable Diffusion) - under development
- 📤 **YouTube upload** - under development
- 📤 **TikTok upload** - under development

### 🔮 Future Features
- 👤 User authentication (login/register)
- 🌙 Dark mode
- 📊 Real-time progress tracking
- 🎧 More music sources

---

## 🚀 Quick Start

### ⚡ Option 1: Quick Setup (Windows)

```bash
# 1. Clone repo
git clone https://github.com/t-nguyen2107/moodvibe-creator.git
cd moodvibe-creator

# 2. Run setup script (auto-generates .env with random SECRET_KEY)
setup-env.bat

# 3. Start services
docker-compose up -d
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 📚 API Docs: http://localhost:8899/docs

---

### 🐳 Option 2: Docker (Recommended)

```bash
# Prerequisites: Docker Desktop installed

# Copy environment files
cp .env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit backend/.env - change SECRET_KEY and MASTER_ENCRYPTION_KEY

# Start
docker-compose up -d
```

**Stop:**
```bash
docker-compose down
```

---

### 💻 Option 3: Manual (Local Development)

> **💡 Tip:** Use **Ollama** for free AI features!

#### Prerequisites
- Python 3.11+
- Node.js 18+
- FFmpeg (installed globally)
- **Ollama** (optional, but recommended)

#### 1. Setup Ollama (FREE AI)

```bash
# Install Ollama: https://ollama.ai
ollama pull llama3

# Verify
ollama run llama3 "Hello"
```

#### 2. Setup Environment

```bash
# Windows
setup-env.bat

# Or manually:
cp .env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit `backend/.env`:
```bash
# Use Ollama (FREE)
AI_PROVIDER=ollama
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Or use OpenAI (Paid)
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-your-key
```

#### 3. Install Dependencies

**Backend:**
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

#### 4. Run

**Backend (Port 8000):**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (Port 3000):**
```bash
cd frontend
npm run dev
```

Access: http://localhost:3000

---

## 🛠 Tech Stack

| Backend | Frontend |
|---------|----------|
| Python 3.11+ | Next.js 14 (App Router) |
| FastAPI | TypeScript |
| SQLAlchemy (SQLite) | Tailwind CSS |
| FFmpeg, yt-dlp | Zustand |
| Ollama / OpenAI | Heroicons |

---

## 🎯 How to Use

### 1. Create a New Playlist

1. Click **"Create New Playlist"**
2. **Step 1:** Select mood and genre (or use AI search)
3. **Step 2:** Search and select songs (max 20)
   - Filter for royalty-free music
   - Preview before selecting
4. **Step 3:** Customize gaps between songs
5. Click **"Create Playlist"**

### 2. Generate Audio & Video

1. Go to playlist details
2. Click **"Generate MP3"** to merge songs
3. Click **"Generate MP4"** to create video
4. **Download** to your device

### 3. Upload (Coming Soon)

> ⚠️ Feature under development - not yet available

### 4. AI Music Search

Use natural language to find music:
- "Chill music for evening"
- "Upbeat songs for party"
- "High energy workout music"

---

## 🔑 API Keys (Optional)

Go to **Settings** to save API keys:

| API | Purpose | Link |
|-----|---------|------|
| YouTube Data API v3 | YouTube upload | [Google Cloud Console](https://console.cloud.google.com/) |
| TikTok API | TikTok upload | [TikTok Developer](https://developer.tiktok.com/) |
| Stable Diffusion | AI image generation | [stability.ai](https://stability.ai/) |
| Spotify | Vietnam charts | [Spotify Dashboard](https://developer.spotify.com/dashboard) |

> 🔒 API keys are encrypted with AES-256 before storage

---

## 📁 Project Structure

```
moodvibe-creator/
├── backend/                   # Python FastAPI
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── config.py         # Configuration
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helpers
│   ├── requirements.txt
│   └── .env
├── frontend/                  # Next.js
│   ├── app/                  # App Router pages
│   ├── components/           # React components
│   ├── lib/                  # Utils, store, API
│   └── package.json
├── uploads/                   # Uploaded files
├── .env.example              # Environment template
├── setup-env.bat             # Quick setup script
└── docker-compose.yml        # Docker config
```

---

## 🔒 Security

- ✅ API keys encrypted with AES-256-GCM
- ✅ Master key stored in environment variables
- ✅ No raw API key logging
- ✅ CORS configured for frontend domain

---

## 🚧 Roadmap

### Phase 1 (Current)
- [x] Core features: search, create playlist, download
- [x] AI music search with Ollama
- [ ] YouTube upload
- [ ] TikTok upload
- [ ] Stable Diffusion image generation

### Phase 2
- [ ] User authentication
- [ ] Dark mode
- [ ] Real-time progress
- [ ] More music sources

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📝 License

MIT

---

## 🙏 Credits

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube/SoundCloud download
- [FFmpeg](https://ffmpeg.org/) - Audio/video processing
- [Next.js](https://nextjs.org/) - React framework
- [Ollama](https://ollama.ai/) - Local AI
- [Heroicons](https://heroicons.com/) - Beautiful icons
