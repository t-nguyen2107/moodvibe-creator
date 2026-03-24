"""
Test API endpoints with proper JSON handling.
"""
import requests
import json

BASE_URL = "http://localhost:8899"

print("=== 1. Health Check ===")
response = requests.get(f"{BASE_URL}/api/music/ai-health")
print(json.dumps(response.json(), indent=2))

print("\n=== 2. AI Parse (Vietnamese) ===")
response = requests.post(
    f"{BASE_URL}/api/music/ai-parse",
    json={
        "query": "nhac chill de hoc bài",
        "language": "vi"
    }
)
print(json.dumps(response.json(), indent=2))

print("\n=== 3. AI Parse (English) ===")
response = requests.post(
    f"{BASE_URL}/api/music/ai-parse",
    json={
        "query": "upbeat k-pop songs for workout",
        "language": "en"
    }
)
print(json.dumps(response.json(), indent=2))

print("\n=== 4. AI Stats ===")
response = requests.get(f"{BASE_URL}/api/music/ai-stats")
print(json.dumps(response.json(), indent=2))

print("\n=== 5. AI Search (with AI parsing) ===")
response = requests.post(
    f"{BASE_URL}/api/music/ai-search",
    json={
        "query": "chill lo-fi beats for studying",
        "language": "en",
        "limit": 5
    }
)
result = response.json()
print(f"Query parsed: {result.get('parsed_query', {})}")
print(f"Found {result.get('total', 0)} songs")
if result.get('songs'):
    for i, song in enumerate(result['songs'][:3], 1):
        print(f"  {i}. {song.get('title')} - {song.get('artist')}")
