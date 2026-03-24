#!/bin/bash

echo "Starting MoodVibe Creator..."
echo ""

echo "Starting Backend..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8899 &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$@

echo ""
echo "MoodVibe Creator is running..."
echo "Backend: http://localhost:8899"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" INT

# Wait for both processes
wait
