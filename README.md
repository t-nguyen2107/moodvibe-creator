# 🎵 MoodVibe Creator

Tạo playlist nhạc tự động và upload lên YouTube/TikTok

> **📍 Current Stage:** Development - Khuyến khích chạy **local** với **Ollama** (miễn phí)

---

## ✨ Features

### 🟢 Hoàn thành
- 🔍 **Tìm nhạc đa nguồn** - YouTube, SoundCloud, Pixabay, Free Music Archives
- 🤖 **AI Music Search** - Tìm nhạc bằng ngôn ngữ tự nhiên (hỗ trợ Ollama miễn phí)
- 🎵 **Ghép audio** - Kết hợp các bài hát với khoảng nghỉ (5-10 giây)
- 🎬 **Tạo video MP4** - Từ audio + hình nền
- 📥 **Download MP3/MP4** - Về máy
- 🔒 **Bảo mật API keys** - Mã hóa AES-256
- ✅ **Bộ lọc nhạc royalty-free** - Download an toàn
- ⚠️ **Cảnh báo bản quyền** - Khi upload nhạc có copyright
- 🎯 **Special genres** - Nhạc làm việc, nhạc không lời, nhạc ngủ...

### 🟡 In Progress
- 🎨 **Tạo hình nền AI** (Stable Diffusion) - đang phát triển
- 📤 **Upload YouTube** - đang phát triển
- 📤 **Upload TikTok** - đang phát triển

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

# 2. Run setup script (tự động tạo .env với SECRET_KEY random)
setup-env.bat

# 3. Start services
docker-compose up -d
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 📚 API Docs: http://localhost:8000/docs

---

### 🐳 Option 2: Docker (Recommended)

```bash
# Prerequisites: Docker Desktop installed

# Copy environment files
cp .env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit backend/.env - thay đổi SECRET_KEY và MASTER_ENCRYPTION_KEY

# Start
docker-compose up -d
```

**Stop:**
```bash
docker-compose down
```

---

### 💻 Option 3: Manual (Local Development)

> **💡 Tip:** Khuyến khích dùng **Ollama** để tiết kiệm chi phí AI!

#### Prerequisites
- Python 3.11+
- Node.js 18+
- FFmpeg (cài đặt global)
- **Ollama** (optional, nhưng recommended)

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
# Sử dụng Ollama (FREE)
AI_PROVIDER=ollama
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Hoặc dùng OpenAI (Paid)
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

Truy cập: http://localhost:3000

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

## 🎯 Hướng dẫn sử dụng

### 1. Tạo Playlist mới

1. Click **"Tạo Playlist Mới"**
2. **Bước 1**: Chọn mood và thể loại nhạc (hoặc dùng AI search)
3. **Bước 2**: Tìm kiếm và chọn bài hát (tối đa 20 bài)
   - Có thể lọc chỉ nhạc miễn phí bản quyền
   - Nghe thử trước khi chọn
4. **Bước 3**: Tùy chỉnh khoảng nghỉ giữa các bài
5. Click **"Tạo Playlist"**

### 2. Tạo Audio & Video

1. Vào trang chi tiết playlist
2. Click **"Tạo MP3"** để ghép các bài hát
3. Click **"Tạo MP4"** để tạo video
4. **Download** về máy

### 3. Upload (Coming Soon)

> ⚠️ Feature đang phát triển - chưa khả dụng

### 4. AI Music Search

Sử dụng ngôn ngữ tự nhiên để tìm nhạc:
- "Nhạc chill cho buổi tối"
- "Bài hát vui tươi cho party"
- "Nhạc tập gym energy cao"

---

## 🔑 API Keys (Optional)

Vào **Settings** để lưu API keys:

| API | Dùng cho | Link |
|-----|----------|------|
| YouTube Data API v3 | Upload YouTube | [Google Cloud Console](https://console.cloud.google.com/) |
| TikTok API | Upload TikTok | [TikTok Developer](https://developer.tiktok.com/) |
| Stable Diffusion | Tạo ảnh AI | [stability.ai](https://stability.ai/) |
| Spotify | Vietnam charts | [Spotify Dashboard](https://developer.spotify.com/dashboard) |

> 🔒 API keys được mã hóa AES-256 trước khi lưu

---

## 📁 Cấu trúc dự án

```
moodvibe-creator/
├── backend/                   # Python FastAPI
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── config.py         # Cấu hình
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
├── uploads/                   # Folder lưu files
├── .env.example              # Environment template
├── setup-env.bat             # Quick setup script
└── docker-compose.yml        # Docker config
```

---

## 🔒 Bảo mật

- ✅ API keys mã hóa AES-256-GCM
- ✅ Master key trong environment variables
- ✅ Không log raw API keys
- ✅ CORS configured cho frontend domain

---

## 🚧 Roadmap

### Phase 1 (Current)
- [x] Core features: search, create playlist, download
- [x] AI music search với Ollama
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

Contributions are welcome! Feel free to submit a Pull Request.

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
