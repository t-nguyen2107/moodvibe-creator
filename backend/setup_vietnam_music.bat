@echo off
REM Setup script for Vietnam Music Sources Integration (Windows)

echo ==================================
echo Vietnam Music Sources Setup
echo ==================================
echo.

REM Check Python version
python --version
echo.

REM Install dependencies
echo Installing Python dependencies...
pip install spotipy beautifulsoup4 lxml

if %ERRORLEVEL% EQU 0 (
    echo [OK] Dependencies installed successfully
) else (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ==================================
echo Spotify API Setup
echo ==================================
echo.
echo To use Spotify integration, you need API credentials:
echo.
echo 1. Go to: https://developer.spotify.com/dashboard
echo 2. Log in with your Spotify account
echo 3. Click "Create App"
echo 4. Fill in:
echo    - App name: MoodVibe Creator
echo    - App description: Music playlist generator
echo    - Redirect URI: http://localhost:8899/callback
echo 5. After creating, copy Client ID and Client Secret
echo.
echo Add these to your backend\.env file:
echo.
echo SPOTIFY_CLIENT_ID=your-client-id-here
echo SPOTIFY_CLIENT_SECRET=your-client-secret-here
echo.

REM Check if .env exists
if exist .env (
    echo [OK] .env file exists
    echo.
    set /p ADD_CREDS="Do you want to add Spotify credentials now? (y/n): "

    if /i "%ADD_CREDS%"=="y" (
        set /p CLIENT_ID="Enter Spotify Client ID: "
        set /p CLIENT_SECRET="Enter Spotify Client Secret: "

        REM Add to .env
        echo. >> .env
        echo # Spotify API >> .env
        echo SPOTIFY_CLIENT_ID=%CLIENT_ID% >> .env
        echo SPOTIFY_CLIENT_SECRET=%CLIENT_SECRET% >> .env

        echo [OK] Spotify credentials added to .env
    )
) else (
    echo [WARNING] .env file not found
    echo Copy .env.example to .env and add your credentials:
    echo   copy .env.example .env
)

echo.
echo ==================================
echo Setup Complete!
echo ==================================
echo.
echo To test the integration:
echo.
echo 1. Start the backend server:
echo    cd backend
echo    python -m uvicorn app.main:app --reload --port 8000
echo.
echo 2. Test endpoints:
echo    curl "http://localhost:8899/api/music/spotify/health"
echo    curl "http://localhost:8899/api/music/zing/health"
echo.
echo 3. Search music:
echo    curl -X POST "http://localhost:8899/api/music/spotify/search?query=nhac viet pop^&limit=5"
echo.
echo For more information, see: backend\VNM_MUSIC_INTEGRATION.md
echo.

pause
