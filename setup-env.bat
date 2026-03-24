@echo off
echo ===============================================
echo MoodVibe Creator - Environment Setup
echo ===============================================
echo.

cd /d "%~dp0"

echo Generating SECRET_KEY and MASTER_ENCRYPTION_KEY...
for /f "delims=" %%i in ('python -c "import secrets; print(secrets.token_urlsafe(32))"') do set SECRET_KEY=%%i
for /f "delims=" %%j in ('python -c "import secrets; print(secrets.token_urlsafe(32))"') do set MASTER_KEY=%%j

echo.
echo Creating backend/.env ...
(
echo # Database
echo DATABASE_URL=sqlite:///./database.db
echo.
echo # Security
echo SECRET_KEY=%SECRET_KEY%
echo MASTER_ENCRYPTION_KEY=%MASTER_KEY%
echo.
echo # File Storage
echo UPLOAD_DIR=../uploads
echo MAX_PLAYLIST_SIZE=20
echo.
echo # CORS
echo FRONTEND_URL=http://localhost:3000
echo.
echo # API Keys (add your keys here)
echo YOUTUBE_API_KEY=
echo TIKTOK_CLIENT_ID=
echo TIKTOK_CLIENT_SECRET=
echo STABILITY_API_KEY=
echo SPOTIFY_CLIENT_ID=
echo SPOTIFY_CLIENT_SECRET=
echo.
echo # AI Provider
echo OPENAI_API_KEY=
echo OPENAI_MODEL=gpt-4o-mini
echo OLLAMA_ENABLED=false
echo OLLAMA_BASE_URL=http://localhost:11434
echo OLLAMA_MODEL=llama3
echo AI_PROVIDER=auto
echo.
echo # Redis (optional)
echo REDIS_HOST=localhost
echo REDIS_PORT=6379
echo REDIS_DB=0
echo REDIS_PASSWORD=
echo CACHE_TTL_AI_PARSE=604800
echo CACHE_TTL_CHARTS=86400
echo AI_PARSE_RATE_LIMIT=10
) > backend\.env

echo Creating frontend/.env.local ...
(
echo NEXT_PUBLIC_API_URL=http://localhost:8000
) > frontend\.env.local

echo.
echo ===============================================
echo Setup complete!
echo ===============================================
echo.
echo Files created:
echo   - backend/.env
echo   - frontend/.env.local
echo.
echo Next steps:
echo   1. Add your API keys to backend/.env (optional)
echo   2. Run: docker-compose up -d
echo   3. Or run manually:
echo      - cd backend ^&^& uvicorn app.main:app --reload
echo      - cd frontend ^&^& npm run dev
echo.
pause
