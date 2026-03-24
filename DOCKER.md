# 🐳 Docker Quick Start - MoodVibe Creator

## One-Command Startup 🚀

### Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)

### Quick Start (Windows)

1. **Clone or navigate to the project:**
   ```bash
   cd f:/generateYouTube
   ```

2. **Start the application with ONE command:**
   ```bash
   docker-compose up -d
   ```

3. **Wait for containers to start** (first run takes 2-3 minutes for building)

4. **Access the application:**
   - 🌐 **Frontend:** http://localhost:3000
   - 📚 **API Docs:** http://localhost:8899/docs

---

## 📋 Docker Commands

### Start the application
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Stop the application
```bash
docker-compose down
```

### Restart the application
```bash
docker-compose restart
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Clean up everything (including volumes)
```bash
docker-compose down -v
```

---

## 🗂️ Project Structure

```
f:/generateYouTube/
├── backend/              # FastAPI Python backend
│   ├── Dockerfile        # Backend container definition
│   └── .dockerignore     # Files to exclude from Docker image
├── frontend/             # Next.js 14 frontend
│   ├── Dockerfile        # Frontend container definition
│   └── .dockerignore     # Files to exclude from Docker image
├── docker-compose.yml    # Orchestration configuration
└── uploads/              # Shared volume for file storage
```

---

## 🔧 Troubleshooting

### Port already in use?
If port 3000 or 8000 is already in use:

```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Or change ports in docker-compose.yml:
# ports:
#   - "3001:3000"  # Use 3001 instead of 3000
```

### Containers not starting?
```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs backend
docker-compose logs frontend
```

### Need to rebuild from scratch?
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker rmi moodvibe-backend moodvibe-frontend

# Rebuild and start
docker-compose up -d --build
```

### Out of disk space?
```bash
# Clean up Docker system
docker system prune -a --volumes
```

---

## 🌐 Production Deployment

### Environment Variables
Create a `.env` file in the project root:

```env
# Security (generate your own!)
SECRET_KEY=your-secret-key-here
MASTER_ENCRYPTION_KEY=your-32-byte-key-here

# Optional API Keys (users can add their own in Settings)
YOUTUBE_API_KEY=
TIKTOK_CLIENT_ID=
TIKTOK_CLIENT_SECRET=
STABILITY_API_KEY=
```

### Deploy to Cloud

**Option 1: Deploy to VPS (DigitalOcean, AWS, etc.)**
```bash
# On your VPS
git clone <your-repo-url>
cd generateYouTube
docker-compose up -d
```

**Option 2: Deploy to Railway/Render**
- Import your GitHub repository
- Set environment variables
- Deploy automatically

---

## 📊 Container Information

### Backend Container
- **Image:** Python 3.12 slim
- **Port:** 8000
- **Includes:** FFmpeg, all Python dependencies
- **Health Check:** http://localhost:8899/health

### Frontend Container
- **Image:** Node 20 Alpine
- **Port:** 3000
- **Build:** Next.js standalone output
- **Health Check:** http://localhost:3000

### Volumes
- `./uploads:/app/uploads` - Shared file storage
- `backend-data` - Database persistence

---

## 🎯 Benefits of Docker Setup

✅ **One-command startup** - No manual dependency installation
✅ **Isolated environment** - No conflicts with local Python/Node versions
✅ **Consistent behavior** - Works the same on all machines
✅ **Easy deployment** - Deploy anywhere Docker runs
✅ **Automatic restart** - Containers restart on failure
✅ **Resource efficiency** - Optimized multi-stage builds

---

## 💡 Tips

1. **First run is slower** - Docker needs to build images, subsequent starts are instant
2. **Check logs** - Use `docker-compose logs -f` to monitor startup
3. **Volume persistence** - Your uploads are stored in `./uploads` directory
4. **Database** - SQLite database is in backend container, use volumes for persistence

---

*Last updated: 2026-03-16*
*Status: ✅ Ready for Docker deployment*
