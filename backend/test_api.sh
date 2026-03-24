#!/bin/bash

echo "=== 1. Health Check ==="
curl -s http://localhost:8899/api/music/ai-health | python -m json.tool

echo ""
echo "=== 2. AI Parse (Vietnamese) ==="
curl -s -X POST http://localhost:8899/api/music/ai-parse \
  -H "Content-Type: application/json" \
  -d '{"query": "nhac chill de hoc bài", "language": "vi"}' \
  | python -m json.tool

echo ""
echo "=== 3. AI Parse (English) ==="
curl -s -X POST http://localhost:8899/api/music/ai-parse \
  -H "Content-Type: application/json" \
  -d '{"query": "upbeat k-pop songs for workout", "language": "en"}' \
  | python -m json.tool

echo ""
echo "=== 4. AI Stats ==="
curl -s http://localhost:8899/api/music/ai-stats | python -m json.tool
