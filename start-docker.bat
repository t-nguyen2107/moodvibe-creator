@echo off
echo ================================================
echo   MoodVibe Creator - Docker Startup
echo ================================================
echo.
echo Starting MoodVibe Creator with Docker...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Build and start containers
echo [1/3] Building Docker images...
docker-compose up -d --build

if errorlevel 1 (
    echo [ERROR] Failed to build containers!
    pause
    exit /b 1
)

echo.
echo [2/3] Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo [3/3] Checking service status...
docker-compose ps

echo.
echo ================================================
echo   MoodVibe Creator is now running!
echo ================================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
echo To view logs: docker-compose logs -f
echo To stop:     docker-compose down
echo.
pause
