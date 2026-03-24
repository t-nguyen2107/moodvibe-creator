@echo off
REM Redis Setup Script for MoodVibe Creator AI Music Search (Windows)
REM This script helps install and start Redis on Windows

echo ==========================================
echo Redis Setup for AI Music Search Caching
echo ==========================================
echo.

echo Detected OS: Windows
echo.

echo ==========================================
echo Redis Installation Options for Windows
echo ==========================================
echo.

echo Option 1: Using Docker (Recommended)
echo ------------------------------------
echo 1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop
echo 2. Run this command in PowerShell:
echo    docker run -d -p 6379:6379 --name redis redis:alpine
echo.

echo Option 2: Using WSL (Windows Subsystem for Linux)
echo -------------------------------------------------
echo 1. Enable WSL by running in PowerShell (as Administrator):
echo    wsl --install
echo 2. Open WSL terminal (Ubuntu)
echo 3. Run these commands:
echo    sudo apt-get update
echo    sudo apt-get install redis-server
echo    sudo service redis-server start
echo.

echo Option 3: Download Redis for Windows (Unofficial)
echo -------------------------------------------------
echo 1. Download from: https://github.com/microsoftarchive/redis/releases
echo 2. Extract and run redis-server.exe
echo.

echo Option 4: Use Without Redis (Fallback Mode)
echo ------------------------------------------
echo The AI service will work without Redis but will be slower and cost more.
echo It will use OpenAI API for every request instead of caching results.
echo.

echo ==========================================
echo Next Steps
echo ==========================================
echo.

echo 1. Configure backend/.env:
echo    If using Redis:
echo      REDIS_HOST=localhost
echo      REDIS_PORT=6379
echo.
echo    Always required:
echo      OPENAI_API_KEY=sk-your-key-here
echo.

echo 2. Install Python dependencies:
echo    pip install -r requirements.txt
echo.

echo 3. Test the AI service:
echo    python test_ai_music_search.py
echo.

echo ==========================================
echo Testing Docker Redis (if available)
echo ==========================================
echo.

docker ps --filter "name=redis" --format "Redis container found: {{.Names}}" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Redis is running in Docker
) else (
    echo [INFO] Redis not found in Docker
)

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.

pause
