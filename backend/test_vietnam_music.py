"""
Test Vietnam music sources integration (Spotify + Zing MP3).
"""
import requests
import json
import sys
import io

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8899"

print("=" * 60)
print("Vietnam Music Sources - Test Suite")
print("=" * 60)

# Test 1: Spotify Health Check
print("\n=== 1. Spotify Health Check ===")
try:
    response = requests.get(f"{BASE_URL}/api/music/spotify/health")
    result = response.json()
    print(f"Status: {result.get('status')}")
    print(f"Spotify Configured: {result.get('spotify_configured')}")
    print(f"Caching: {result.get('caching')}")
    print("✅ Spotify service is running")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Zing MP3 Health Check
print("\n=== 2. Zing MP3 Health Check ===")
try:
    response = requests.get(f"{BASE_URL}/api/music/zing/health")
    result = response.json()
    print(f"Status: {result.get('status')}")
    print(f"Scraping Available: {result.get('scraping_available')}")
    print(f"Caching: {result.get('caching')}")
    print("✅ Zing MP3 service is running")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 3: Available Sources
print("\n=== 3. Available Music Sources ===")
try:
    response = requests.get(f"{BASE_URL}/api/music/sources")
    result = response.json()
    sources = result.get('sources', [])
    print(f"Total sources: {len(sources)}")
    for source in sources:
        print(f"  - {source}")
    if "spotify" in sources and "zing" in sources:
        print("✅ Vietnam sources added")
    else:
        print("❌ Vietnam sources missing")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 4: Spotify Search
print("\n=== 4. Spotify Search (Vietnamese song) ===")
try:
    response = requests.post(
        f"{BASE_URL}/api/music/spotify/search",
        json={
            "query": "Sơn Tùng M-TP",
            "limit": 3
        }
    )
    result = response.json()
    tracks = result.get('tracks', [])
    print(f"Found {len(tracks)} tracks")
    if tracks:
        for i, track in enumerate(tracks[:3], 1):
            print(f"  {i}. {track.get('name')} - {track.get('artist')}")
            print(f"     Popularity: {track.get('popularity')}/100")
        print("✅ Spotify search working")
    else:
        print("⚠️  No results (may need API key)")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 5: Zing MP3 Search
print("\n=== 5. Zing MP3 Search (Vietnamese song) ===")
try:
    response = requests.post(
        f"{BASE_URL}/api/music/zing/search",
        json={
            "query": "Sơn Tùng M-TP",
            "limit": 3
        }
    )
    result = response.json()
    songs = result.get('songs', [])
    print(f"Found {len(songs)} songs")
    if songs:
        for i, song in enumerate(songs[:3], 1):
            print(f"  {i}. {song.get('title')} - {song.get('artists')}")
        print("✅ Zing MP3 search working")
    else:
        print("⚠️  No results (scraping may have failed)")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 6: Spotify Vietnam Charts
print("\n=== 6. Spotify Vietnam Top 10 ===")
try:
    response = requests.get(
        f"{BASE_URL}/api/music/spotify/charts/vietnam",
        params={"limit": 10}
    )
    result = response.json()
    tracks = result.get('tracks', [])
    print(f"Chart: {result.get('chart_name')}")
    print(f"Tracks: {len(tracks)}")
    if tracks:
        print("\nTop 5 songs:")
        for i, track in enumerate(tracks[:5], 1):
            print(f"  {i}. {track.get('name')} - {track.get('artist')}")
            print(f"     Position: #{track.get('position')}, Popularity: {track.get('popularity')}/100")
        print("✅ Spotify charts working")
    else:
        print("⚠️  No chart data (may need API key)")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 7: Zing MP3 Charts
print("\n=== 7. Zing MP3 Top 100 Vietnam ===")
try:
    response = requests.get(
        f"{BASE_URL}/api/music/zing/charts/top-100",
        params={"limit": 10}
    )
    result = response.json()
    songs = result.get('songs', [])
    print(f"Chart: {result.get('chart_name')}")
    print(f"Songs: {len(songs)}")
    if songs:
        print("\nTop 5 songs:")
        for i, song in enumerate(songs[:5], 1):
            print(f"  {i}. {song.get('title')} - {song.get('artists')}")
            print(f"     Position: #{song.get('position')}")
        print("✅ Zing MP3 charts working")
    else:
        print("⚠️  No chart data (scraping may have failed)")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("Test Summary:")
print("Note: Some tests may fail if Spotify API key is not configured")
print("Zing MP3 scraping may be blocked by anti-bot measures")
print("=" * 60)
