# Vietnam Music Sources Integration

This document describes the implementation of Vietnam-focused music sources (Spotify and Zing MP3) for MoodVibe Creator.

## Overview

The integration adds two major music sources focused on Vietnamese content:

1. **Spotify Web API** - Official Spotify integration with Vietnam charts
2. **Zing MP3** - Vietnam's popular music platform via web scraping

## Features

### Spotify Integration

- **Search**: Search tracks, albums, playlists on Spotify
- **Charts**:
  - Vietnam Top 50 (most popular tracks)
  - Viral 50 Vietnam (trending tracks)
- **Metadata**: Popularity scores, release dates, available markets, preview URLs
- **Caching**: 24-hour TTL to reduce API calls
- **Rate Limiting**: Respects Spotify's rate limits (10 requests/second)

### Zing MP3 Integration

- **Search**: Search Vietnamese songs
- **Charts**:
  - Top 100 Vietnam (most popular songs)
  - Real Trending (most trending songs)
- **Metadata**: Song titles, artists, thumbnails, durations
- **Caching**: 6-hour TTL to minimize scraping
- **Graceful Degradation**: Handles anti-scraping measures with retry logic

## Installation

### 1. Install Dependencies

```bash
cd backend
pip install spotipy beautifulsoup4 lxml
```

Or update all dependencies:

```bash
pip install -r requirements.txt
```

### 2. Configure Spotify API (Optional but Recommended)

Spotify integration requires API credentials:

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in app details:
   - App name: "MoodVibe Creator"
   - App description: "Music playlist generator"
   - Redirect URI: `http://localhost:8899/callback` (not actually used)
5. After creating, note down:
   - **Client ID**
   - **Client Secret**

### 3. Update Environment Variables

Add to `backend/.env`:

```bash
# Spotify API (for Vietnam charts)
SPOTIFY_CLIENT_ID=your-client-id-here
SPOTIFY_CLIENT_SECRET=your-client-secret-here
```

Or copy from `.env.example`:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` and add your credentials.

## Usage

### API Endpoints

#### Spotify Endpoints

**Search Spotify:**
```bash
POST /api/music/spotify/search?query=nhạc việt pop&limit=20&market=VN
```

**Get Vietnam Top 50:**
```bash
GET /api/music/spotify/charts/vietnam?limit=50
```

**Get Viral 50 Vietnam:**
```bash
GET /api/music/spotify/charts/viral-vietnam?limit=50
```

**Get Track Details:**
```bash
GET /api/music/spotify/track/{track_id}?market=VN
```

**Spotify Health Check:**
```bash
GET /api/music/spotify/health
```

#### Zing MP3 Endpoints

**Search Zing MP3:**
```bash
POST /api/music/zing/search?query=nhạc việt pop&limit=20
```

**Get Top 100 Vietnam:**
```bash
GET /api/music/zing/charts/top-100?limit=100
```

**Get Real Trending:**
```bash
GET /api/music/zing/charts/real-trending?limit=50
```

**Get Song Details:**
```bash
GET /api/music/zing/song/{song_id}
```

**Zing MP3 Health Check:**
```bash
GET /api/music/zing/health
```

### Unified Search

The new sources are integrated into the existing music search:

```bash
GET /api/music/search?q=nhạc việt pop&sources=spotify,zing&limit=20
```

Available sources: `youtube`, `soundcloud`, `pixabay`, `fma`, `spotify`, `zing`

## Response Formats

### Spotify Search Response

```json
{
  "tracks": [
    {
      "track_id": "3n3Ppam7vgaVa1iaRUc9Lp",
      "name": "Em Của Ngày Hôm Qua",
      "artist": "Sơn Tùng M-TP",
      "album": "m-tp M-TP",
      "popularity": 85,
      "release_date": "2014-12-10",
      "preview_url": "https://p.scdn.co/mp3-preview/...",
      "external_urls": {
        "spotify": "https://open.spotify.com/track/..."
      },
      "available_markets": ["VN", "US", ...],
      "duration_ms": 234000,
      "images": [
        {
          "url": "https://i.scdn.co/image/...",
          "height": 640,
          "width": 640
        }
      ]
    }
  ],
  "total": 1
}
```

### Spotify Chart Response

```json
{
  "chart_type": "top50",
  "region": "vietnam",
  "tracks": [
    {
      "position": 1,
      "track_id": "...",
      "name": "...",
      "artist": "...",
      "popularity": 95,
      ...
    }
  ],
  "total": 50,
  "fetched_at": "2026-03-18T10:30:00"
}
```

### Zing MP3 Search Response

```json
{
  "songs": [
    {
      "song_id": "ZW6B9WIB",
      "title": "Em Của Ngày Hôm Qua",
      "artists": "Sơn Tùng M-TP",
      "thumbnail": "https://photo-resize-zmp3...",
      "duration": 234,
      "streaming_url": "",
      "zing_url": "https://zingmp3.vn/bai-hat/..."
    }
  ],
  "total": 1
}
```

### Zing MP3 Chart Response

```json
{
  "chart_type": "top100",
  "songs": [
    {
      "position": 1,
      "song_id": "...",
      "title": "...",
      "artists": "...",
      ...
    }
  ],
  "total": 100,
  "fetched_at": "2026-03-18T10:30:00"
}
```

## Database Models

### Spotify Charts Table

Stores Spotify chart data for trend analysis:

```sql
CREATE TABLE spotify_charts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chart_type VARCHAR(50),  -- 'top50', 'viral50'
    region VARCHAR(50),       -- 'vietnam', 'global'
    track_id VARCHAR(255),    -- Spotify track ID
    track_name VARCHAR(255),
    artist_name VARCHAR(255),
    position INTEGER,
    position_change INTEGER,  -- +5 rose, -3 fell, 0 same
    popularity_score INTEGER, -- 0-100
    fetched_at TIMESTAMP,
    UNIQUE(chart_type, region, track_id, fetched_at)
);
```

### Zing Charts Table

Stores Zing MP3 chart data:

```sql
CREATE TABLE zing_charts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id VARCHAR(255),
    song_name VARCHAR(255),
    artist_name VARCHAR(255),
    position INTEGER,
    week_date DATE,
    fetched_at TIMESTAMP,
    UNIQUE(song_id, fetched_at)
);
```

## Caching Strategy

### Spotify
- **Search results**: 24-hour TTL
- **Chart data**: 24-hour TTL
- **Track details**: 24-hour TTL

### Zing MP3
- **Search results**: 6-hour TTL
- **Chart data**: 6-hour TTL
- **Song details**: 6-hour TTL

Caching is implemented in-memory using dictionaries. For production, consider using Redis for distributed caching.

## Error Handling

### Graceful Degradation

If one source fails, others continue to work:

```python
# If Spotify fails, Zing MP3 still works
sources = ["spotify", "zing"]
# Results from Zing MP3 will be returned even if Spotify fails
```

### Retry Logic

Zing MP3 implements exponential backoff retry logic:

```python
max_retries = 3
retry_delay = 2  # seconds
# Exponential backoff: 2s, 4s, 8s
```

### Logging

All operations are logged for debugging:

```python
logger.info(f"Spotify search: {query}")
logger.error(f"Zing MP3 error: {str(e)}")
```

## Deduplication

When searching multiple sources, duplicate songs (same title + artist) are automatically removed. Source priority:

1. **spotify** (highest quality metadata)
2. **zing** (Vietnam-focused)
3. **youtube**
4. **soundcloud**
5. **pixabay**

## Testing

### Manual Testing

```bash
# Test Spotify search
curl -X POST "http://localhost:8899/api/music/spotify/search?query=nhạc việt pop&limit=5"

# Test Vietnam Top 50
curl "http://localhost:8899/api/music/spotify/charts/vietnam?limit=10"

# Test Zing MP3 search
curl -X POST "http://localhost:8899/api/music/zing/search?query=v-pop&limit=5"

# Test Zing Top 100
curl "http://localhost:8899/api/music/zing/charts/top-100?limit=10"

# Test unified search
curl "http://localhost:8899/api/music/search?q=nhạc việt&sources=spotify,zing&limit=10"
```

### Health Checks

```bash
# Check Spotify service status
curl "http://localhost:8899/api/music/spotify/health"

# Check Zing MP3 service status
curl "http://localhost:8899/api/music/zing/health"
```

## Limitations

### Spotify
- Requires API credentials (free tier available)
- Rate limited (10 requests/second)
- Preview URLs are 30-second clips only
- Full playback requires Spotify Premium

### Zing MP3
- Uses web scraping (may break if Zing MP3 changes structure)
- No direct streaming URLs (users must visit Zing MP3 website)
- May encounter anti-scraping measures
- Fallback: Returns sample data if scraping fails

## Future Enhancements

1. **Background Tasks**: Schedule chart updates every 6 hours
2. **Trend Analysis**: Track position changes over time
3. **Database Storage**: Store chart history for analytics
4. **Redis Caching**: Replace in-memory caching with Redis
5. **More Charts**: Add genre-specific charts (K-pop, US-UK)
6. **Audio Preview**: Implement actual audio playback

## Troubleshooting

### Spotify Not Working

**Problem**: Spotify returns empty results

**Solutions**:
1. Check if credentials are set in `.env`
2. Verify credentials are correct (no extra spaces)
3. Check if Spotify app is created in dashboard
4. Test with health check endpoint

### Zing MP3 Not Working

**Problem**: Zing MP3 returns empty results

**Solutions**:
1. Check if Zing MP3 website is accessible
2. Verify internet connection
3. Check logs for scraping errors
4. Zing MP3 may have changed structure (contact maintainer)

### Import Errors

**Problem**: `ModuleNotFoundError: No module named 'spotipy'`

**Solution**:
```bash
pip install spotipy beautifulsoup4 lxml
```

## Contributing

To add more music sources:

1. Create new service in `backend/app/services/`
2. Follow existing patterns (async methods, caching, error handling)
3. Add Pydantic schemas in `backend/app/schemas/search.py`
4. Update `MUSIC_SOURCES` in `backend/app/config.py`
5. Add search method in `backend/app/services/music_search.py`
6. Add API endpoints in `backend/app/routers/music.py`

## License

This integration respects the Terms of Service of:
- Spotify Web API: https://developer.spotify.com/terms/
- Zing MP3: https://zingmp3.vn/terms-of-use

Users are responsible for:
- Complying with copyright laws
- Obtaining proper licenses for commercial use
- Respecting API rate limits
- Not abusing the services

## Support

For issues or questions:
1. Check logs in `backend/logs/`
2. Review this documentation
3. Check API health endpoints
4. Open GitHub issue with error details
