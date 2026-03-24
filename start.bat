@echo off
echo Starting MoodVibe Creator...
echo.

echo Starting Backend...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8899"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo MoodVibe Creator is starting...
echo Backend: http://localhost:8899
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
