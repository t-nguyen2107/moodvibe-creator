# MoodVibe Creator

Tạo playlist nhạc tự động và upload lên YouTube/TikTok

## 🐳 QUICK START (DOCKER) - Recommended!

### Prerequisites
- Docker Desktop installed

### One-Command Startup
```bash
cd f:/generateYouTube
docker-compose up -d
```

**Access the app:**
- 🌐 Frontend: http://localhost:3000
- 📚 API Docs: http://localhost:8000/docs

**Stop the app:**
```bash
docker-compose down
```

📖 **See [DOCKER.md](DOCKER.md) for detailed Docker instructions**

---

## 📦 Manual Installation (Without Docker)

<details>
<summary>Click to expand manual setup instructions</summary>

### Yêu cầu
- Python 3.11+
- Node.js 18+
- FFmpeg (cài đặt global)

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

### Cấu hình Environment

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Edit backend/.env và thay đổi SECRET_KEY và MASTER_ENCRYPTION_KEY
```

**Frontend** (`frontend/.env.local`):
```bash
cp frontend/.env.local.example frontend/.env.local
```

### Chạy

**Backend (Port 8000)**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (Port 3000)**
```bash
cd frontend
npm run dev
```

Truy cập: http://localhost:3000

</details>

---

## 🎵 Tính năng

- 🔍 Tìm nhạc từ nhiều nguồn (YouTube, SoundCloud, Pixabay, Free Music Archives)
- 🎨 Tạo hình nền AI (Stable Diffusion) hoặc upload tự chọn
- 🎵 Ghép audio với khoảng nghỉ giữa các bài (5-10 giây)
- 🎬 Tạo video MP4 từ audio + hình nền
- 📥 Download MP3/MP4 về máy
- 📤 Upload tự động lên YouTube/TikTok
- 🔒 Bảo mật API keys với mã hóa AES-256
- ✅ Bộ lọc nhạc miễn phí bản quyền - download local an toàn
- ⚠️ Warning khi upload nhạc có bản quyền - user tự chịu trách nhiệm
- 🎯 Special genres không hiển thị danh sách bài hát (nhạc làm việc, nhạc không lời, nhạc đi ngủ, nhạc ngủ cho bé)

## 🛠 Tech Stack

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy (SQLite)
- FFmpeg
- yt-dlp (YouTube/SoundCloud downloader)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Heroicons (SVG only, không dùng image icons)
- Zustand (state management)

## 📦 Cài đặt

### Yêu cầu
- Python 3.11+
- Node.js 18+
- FFmpeg (cài đặt global)

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

### Cấu hình Environment

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Edit backend/.env và thay đổi SECRET_KEY và MASTER_ENCRYPTION_KEY
```

**Frontend** (`frontend/.env.local`):
```bash
cp frontend/.env.local.example frontend/.env.local
```

## 🚀 Chạy

### Backend (Port 8000)
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

Truy cập: http://localhost:3000

## 🎯 Hướng dẫn sử dụng

### 1. Tạo Playlist mới

1. Click "Tạo Playlist Mới"
2. **Bước 1**: Chọn mood và thể loại nhạc
3. **Bước 2**: Tìm kiếm và chọn bài hát (tối đa 20 bài)
   - Có thể lọc chỉ nhạc miễn phí bản quyền
   - Nghe thử trước khi chọn
4. **Bước 3**: Tùy chỉnh khoảng nghỉ giữa các bài
5. Click "Tạo Playlist"

### 2. Tạo Audio & Video

1. Vào trang chi tiết playlist
2. Click "Tạo MP3" để ghép các bài hát thành 1 file
3. Click "Tạo MP4" để tạo video từ audio + hình nền
4. Download về máy

### 3. Upload lên YouTube/TikTok

1. Sau khi tạo xong video, nhập mô tả và hashtags
2. Click "Upload lên YouTube" hoặc "Upload lên TikTok"
3. **⚠️ CẢNH BÁO**: Nếu playlist có nhạc có bản quyền, bạn sẽ thấy warning
4. Bạn phải tự chịu trách nhiệm khi upload nhạc có bản quyền

### 4. Lưu API Keys

Vào Settings để lưu API keys:
- YouTube Data API v3
- TikTok API
- Stable Diffusion

API keys được mã hóa AES-256 trước khi lưu vào database.

## 🔑 Lấy API Keys

### YouTube Data API v3

1. Đi đến [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới
3. Enable **YouTube Data API v3**
4. Tạo **OAuth 2.0 credentials** hoặc **API key**
5. Copy API key

### TikTok API

1. Đi đến [TikTok Developer Portal](https://developer.tiktok.com/)
2. Tạo app mới
3. Thêm permissions: `video.upload`
4. Lấy Client ID và Secret

### Stable Diffusion

1. Đi đến [stability.ai](https://stability.ai/)
2. Tạo tài khoản
3. Lấy API key từ dashboard

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
│   │   │   ├── music_search.py      # Tìm nhạc multi-source
│   │   │   ├── audio_processor.py   # Xử lý audio (FFmpeg)
│   │   │   ├── video_generator.py   # Tạo video
│   │   │   └── image_generator.py   # Tạo ảnh AI
│   │   └── utils/            # Helpers
│   │       └── encryption.py # Mã hóa API keys
│   ├── requirements.txt
│   └── .env
├── frontend/                  # Next.js
│   ├── app/
│   │   ├── page.tsx          # Home page
│   │   ├── create/           # Tạo playlist wizard
│   │   ├── library/          # Thư viện
│   │   ├── settings/         # Cài đặt
│   │   └── playlist/[id]/    # Chi tiết playlist
│   ├── components/
│   │   ├── ui/               # UI components
│   │   └── SongCard.tsx      # Song card component
│   ├── lib/
│   │   ├── store.ts          # Zustand store
│   │   └── api.ts            # API client
│   └── package.json
├── uploads/                   # Folder lưu files
└── README.md
```

## 🔒 Bảo mật

- API keys được mã hóa với AES-256-GCM trước khi lưu vào database
- Master key được lưu trong environment variables
- Không bao giờ log raw API keys
- CORS được cấu hình để chỉ cho phép frontend domain

## 🎨 Giao diện

- Đơn giản, chuyên nghiệp, dễ sử dụng
- Chỉ sử dụng SVG icons từ Heroicons (không dùng image icons)
- Responsive design
- Dark mode support (sắp tới)

## 🚧 Todo

- [ ] Implement YouTube Data API v3 upload
- [ ] Implement TikTok API upload
- [ ] Implement Stable Diffusion API integration
- [ ] Add user authentication
- [ ] Add more music sources
- [ ] Add real-time progress tracking
- [ ] Add dark mode
- [ ] Add more moods and genres

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Credits

- yt-dlp for YouTube/SoundCloud download
- FFmpeg for audio/video processing
- Next.js team for the amazing framework
- Heroicons for beautiful icons
