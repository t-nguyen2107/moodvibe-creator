# Quick Start Guide - MoodVibe Creator

## Cài đặt nhanh (5 phút)

### 1. Clone repository
```bash
cd f:\generateYouTube
```

### 2. Cài đặt Backend (2 phút)

```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt (Windows)
venv\Scripts\activate
# Hoặc (Linux/Mac):
# source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Copy .env file
copy .env.example .env

# Edit .env và thay đổi SECRET_KEY và MASTER_ENCRYPTION_KEY
# Notepad .env
```

### 3. Cài đặt Frontend (2 phút)

```bash
cd ..\frontend

# Cài đặt dependencies
npm install

# Copy .env file
copy .env.local.example .env.local
```

### 4. Chạy ứng dụng

**Windows:**
```bash
# Double click start.bat
# Hoặc chạy:
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Hoặc chạy thủ công:**

Terminal 1 (Backend):
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Truy cập ứng dụng

Mở browser: http://localhost:3000

## Tạo playlist đầu tiên

1. Click "Tạo Playlist Mới"
2. Chọn mood: "chill"
3. Chọn thể loại: "vietnam"
4. Click "Tiếp tục"
5. Click "Tìm kiếm" (để tìm nhạc chill vietnam)
6. Chọn vài bài hát
7. Click "Tiếp tục"
8. Chọn khoảng nghỉ: 5 giây
9. Click "Tạo Playlist"
10. Xem kết quả và download MP3/MP4!

## Troubleshooting

### Backend không chạy
- Kiểm tra Python version: `python --version` (cần 3.11+)
- Kiểm tra FFmpeg: `ffmpeg -version` (cần cài đặt)
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`

### Frontend không chạy
- Kiểm tra Node.js version: `node --version` (cần 18+)
- Delete node_modules và reinstall: `rm -rf node_modules && npm install`

### FFmpeg not found
- Windows: Download từ https://ffmpeg.org/download.html và add to PATH
- Linux: `sudo apt-get install ffmpeg`
- Mac: `brew install ffmpeg`

## Need help?

Đọc full README.md hoặc mở issue trên GitHub.
