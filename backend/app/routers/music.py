from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from asyncio import sleep
from typing import List, Optional
import logging
from datetime import datetime
import requests
import io

from app.schemas.search import (
    MusicSearchRequest,
    MusicSearchResponse,
    SongResult,
    AIParseRequest,
    AIParseResponse,
    AIHealthResponse,
    SpotifySongResult,
    SpotifyChartTrack,
    SpotifySearchResponse,
    SpotifyChartResponse,
    ZingSongResult,
    ZingChartTrack,
    ZingSearchResponse,
    ZingChartResponse
)

# Deezer Schemas (inline for now, can move to schemas.py later)
from pydantic import BaseModel

class DeezerSongResult(BaseModel):
    """Song result from Deezer search"""
    track_id: int
    name: str
    artist: str
    album: Optional[str] = None
    duration: int  # seconds
    preview_url: Optional[str] = None
    images: list
    external_urls: dict
    popularity: int  # 0-100

class DeezerChartTrack(BaseModel):
    """Track from Deezer chart (includes position)"""
    position: int
    track_id: int
    name: str
    artist: str
    album: Optional[str] = None
    duration: int
    preview_url: Optional[str] = None
    images: list
    external_urls: dict
    popularity: int

class DeezerSearchResponse(BaseModel):
    """Response from Deezer search"""
    tracks: List[DeezerSongResult]
    total: int

class DeezerChartResponse(BaseModel):
    """Response from Deezer chart endpoint"""
    chart_type: str  # "top"
    region: str  # "VN", "US", etc.
    tracks: List[DeezerChartTrack]
    total: int
    fetched_at: datetime

from app.services.music_search import music_search_service
from app.services.ai_music_parser import ai_music_parser_service
from app.services.spotify_service import spotify_service
from app.services.zing_service import zing_service
from app.services.deezer_service import deezer_service
from app.services.ranking_service import music_ranking_service

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/music", tags=["music"])


@router.post("/ai-parse", response_model=AIParseResponse)
async def parse_natural_language_query(request: AIParseRequest):
    """
    Parse natural language query using AI to extract structured parameters.

    This endpoint uses OpenAI GPT-4o-mini via Langchain to extract:
    - Mood (chill, happy, sad, energetic, etc.)
    - Genre (pop, rock, k-pop, lo-fi, etc.)
    - Activity (studying, workout, driving, etc.)
    - Era (80s, 90s, 2000s, etc.)
    - Language (english, korean, chinese, etc.)
    - Culture (western, asian, latin, etc.)

    Each extraction includes a confidence score (0.0 to 1.0).

    **Examples:**

    Request:
    ```json
    {
        "query": "chill vibes for studying at night",
        "language": "en"
    }
    ```

    Response:
    ```json
    {
        "parsed": {
            "mood": "chill",
            "mood_confidence": 0.95,
            "activity": "studying",
            "activity_confidence": 0.92,
            "language": "en",
            "genre": null,
            "era": null
        },
        "cached": false,
        "processing_time_ms": 450,
        "tokens_used": 150,
        "model": "gpt-4o-mini"
    }
    ```

    **Multi-language Support:**
    - "nhạc K-pop tập gym" (Vietnamese) → genre=k-pop, activity=workout
    - "快乐的音乐适合开车" (Chinese) → mood=happy, activity=driving

    **Rate Limiting:** 10 requests per minute per user

    **Caching:** Results are cached for 7 days to reduce API costs
    """
    try:
        # Parse query using AI service
        parsed_query, metadata = await ai_music_parser_service.parse(
            query=request.query,
            language=request.language
        )

        # Return response
        return AIParseResponse(
            parsed=parsed_query,
            cached=metadata["cached"],
            processing_time_ms=metadata["processing_time_ms"],
            tokens_used=metadata.get("tokens_used"),
            model=metadata["model"]
        )

    except Exception as e:
        logger.error(f"AI parse error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse query: {str(e)}"
        )


@router.get("/ai-health", response_model=AIHealthResponse)
async def get_ai_health():
    """
    Check health status of AI parsing service.

    Returns information about:
    - OpenAI configuration status
    - Redis cache configuration
    - Cache hit rate statistics
    - Service statistics (total requests, cache hits)

    Use this endpoint to monitor the AI service and diagnose issues.
    """
    try:
        health = ai_music_parser_service.health_check()
        return AIHealthResponse(**health)
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return AIHealthResponse(
            status="unavailable",
            openai_configured=False,
            redis_configured=False
        )


@router.get("/ai-stats")
async def get_ai_stats():
    """
    Get detailed statistics about AI parsing service.

    Returns:
    - Total requests
    - Cache hits and hit rate
    - LLM calls vs fallback calls
    - Total tokens used
    - Estimated cost in USD

    Useful for monitoring usage and costs.
    """
    try:
        stats = ai_music_parser_service.get_stats()
        return stats
    except Exception as e:
        logger.error(f"Stats error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )


@router.get("/search", response_model=MusicSearchResponse)
async def search_music(
    q: Optional[str] = None,
    genre: Optional[str] = None,
    mood: Optional[str] = None,
    sources: Optional[str] = None,  # Comma-separated
    limit: int = 20,
    royalty_free_only: bool = False
):
    """
    Search music from multiple sources (YouTube, SoundCloud, Spotify, Deezer, Zing).

    Supports backward-compatible search with explicit parameters.
    For AI-powered search, use the POST /api/music/ai-search endpoint.

    **Parameters:**
    - q: Search query string
    - genre: Music genre (hot, us_uk, korean, chinese, vietnam, work_music, instrumental, sleep_music, baby_lullabies)
    - mood: Mood (chill, happy, sad, energetic, romantic, focus, sleep, party, workout, relaxed)
    - sources: Comma-separated list of sources (youtube, soundcloud, spotify, deezer, zing)
    - limit: Maximum number of results (default: 20)
    - royalty_free_only: Only return royalty-free music

    **Example:**
    ```
    GET /api/music/search?q=chill&mood=chill&sources=youtube,soundcloud&limit=10
    ```
    """
    try:
        source_list = sources.split(',') if sources else None

        songs = await music_search_service.search(
            query=q,
            genre=genre,
            mood=mood,
            sources=source_list,
            limit=limit,
            royalty_free_only=royalty_free_only
        )

        return MusicSearchResponse(
            songs=songs,
            total=len(songs)
        )
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )


@router.post("/ai-search", response_model=MusicSearchResponse)
async def search_music_with_ai(request: AIParseRequest):
    """
    Search music using AI-parsed natural language query with intelligent ranking.

    This endpoint combines:
    1. AI parsing for mood/genre extraction
    2. Music search from multiple sources
    3. Intelligent ranking (trending + relevance + popularity)

    **Example:**
    ```json
    {
        "query": "chill lo-fi beats for studying",
        "language": "en",
        "sources": ["youtube", "spotify", "zing"],
        "limit": 20
    }
    ```

    The AI will extract:
    - mood: "chill" (confidence: 0.95)
    - genre: "lo-fi" (confidence: 0.90)
    - activity: "studying" (confidence: 0.92)

    Then ranks results by:
    - Trending (40%): Chart positions
    - Relevance (30%): AI confidence
    - Popularity (20%): Stream counts
    - Freshness (10%): New releases

    **Advanced Filters:**
    - moods: ["chill", "happy"] - Filter by moods
    - genres: ["pop", "k-pop"] - Filter by genres
    - eras: ["90s", "2000s"] - Filter by eras
    - languages: ["vietnamese", "korean"] - Filter by languages
    - sources: ["youtube", "spotify"] - Filter by sources
    - royalty_free_only: true - Only royalty-free music
    - trending: true - Only trending songs
    """
    try:
        # Step 1: Parse query with AI
        parsed_query, _ = await ai_music_parser_service.parse(
            query=request.query,
            language=request.language
        )

        logger.info(
            f"AI-search parsed: mood={parsed_query.mood}, "
            f"genre={parsed_query.genre}, activity={parsed_query.activity}, "
            f"trending={parsed_query.trending}, language={parsed_query.language}"
        )

        # Log advanced filters if provided
        if request.moods or request.genres or request.eras or request.languages:
            logger.info(
                f"Advanced filters: moods={request.moods}, "
                f"genres={request.genres}, eras={request.eras}, "
                f"languages={request.languages}, sources={request.sources}, "
                f"royalty_free_only={request.royalty_free_only}, "
                f"trending={request.trending}"
            )

        # Step 2: Search using AI-parsed parameters and advanced filters
        # Search for MORE songs than requested to support pagination
        actual_limit = request.limit + request.offset + 10  # Get extra buffer for load more
        songs = await music_search_service.search(
            query=request.query,  # Include original query
            ai_parsed_query=parsed_query,  # Enhanced with AI
            sources=request.sources,
            limit=actual_limit,  # Search for more songs
            royalty_free_only=request.royalty_free_only or False,
            language=request.language  # Pass language for trending detection
        )

        # Step 2.5: If trending/hot detected, fetch chart results
        if (parsed_query.trending and parsed_query.trending_confidence > 0.7) or request.trending:
            logger.info("Trending/hot detected, fetching chart results...")

            try:
                # Fetch Spotify Vietnam Top 50
                spotify_top50 = await spotify_service.get_vietnam_top_50(limit=25)
                for track in spotify_top50:
                    track_dict = dict(track)
                    # Convert to SongResult format
                    if track_dict not in [s.dict() for s in songs]:
                        songs.append(SongResult(
                            title=track_dict.get('name', ''),
                            artist=track_dict.get('artist', ''),
                            source='spotify',
                            source_id=track_dict.get('track_id', ''),
                            duration=track_dict.get('duration_ms', 0) // 1000,
                            audio_url=track_dict.get('preview_url', ''),
                            thumbnail_url=track_dict.get('images', [{}])[0].get('url', '') if track_dict.get('images') else '',
                            is_royalty_free=False,
                            trending_rank=track_dict.get('position'),
                            listeners_count=track_dict.get('popularity', 0) * 1000  # Approximate
                        ))

                # Fetch Zing Real Trending
                zing_trending = await zing_service.get_real_trending(limit=25)
                for song in zing_trending:
                    song_dict = dict(song)
                    # Convert to SongResult format
                    if song_dict not in [s.dict() for s in songs]:
                        songs.append(SongResult(
                            title=song_dict.get('title', ''),
                            artist=song_dict.get('artists', ''),
                            source='zing',
                            source_id=song_dict.get('song_id', ''),
                            duration=song_dict.get('duration', 0),
                            audio_url=song_dict.get('streaming_url', ''),
                            thumbnail_url=song_dict.get('thumbnail', ''),
                            is_royalty_free=False,
                            trending_rank=song_dict.get('position'),
                            is_viral=True  # Zing Real Trending = viral
                        ))

                logger.info(f"Added chart results: {len(songs)} total songs")
            except Exception as e:
                logger.warning(f"Failed to fetch chart results: {e}")

        # Step 3: Rank songs using intelligent algorithm
        ranked_songs = music_ranking_service.rank_songs(
            songs=songs,
            ai_parsed_query=parsed_query,
            limit=actual_limit  # Rank all fetched songs
        )

        # Apply offset for pagination (for load more)
        paginated_songs = ranked_songs[request.offset:request.offset + request.limit]

        # Add rank positions to response
        for idx, song in enumerate(paginated_songs, request.offset + 1):
            song.rank_position = idx

        logger.info(f"AI-search returned {len(paginated_songs)} songs (offset={request.offset}, limit={request.limit})")

        return MusicSearchResponse(
            songs=paginated_songs,
            total=len(paginated_songs)
        )

    except Exception as e:
        logger.error(f"AI search error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"AI search failed: {str(e)}"
        )


@router.get("/ai-search/stream")
async def search_music_with_ai_stream(
    query: str,
    language: str = "en",
    sources: Optional[str] = None,
    limit: int = 20,
    royalty_free_only: bool = False,
    trending: bool = False
):
    """
    Search music with real-time progress updates via Server-Sent Events (SSE).

    This endpoint streams progress updates to keep users informed during search:
    - "Đang phân tích query..."
    - "Đang tối ưu keywords..."
    - "Đang tìm trong YouTube..."
    - "Đang tìm trong SoundCloud..."
    - etc.

    **Usage:**
    ```
    GET /api/music/ai-search/stream?query=nhac%20hot%20tiktok&sources=youtube,soundcloud&limit=20

    Response: Server-Sent Events stream
    data: {"step": "analyzing", "message": "Đang phân tích query...", "progress": 10}

    data: {"step": "generating", "message": "Đang tối ưu keywords...", "progress": 20}

    data: {"step": "searching", "source": "YouTube", "message": "Đang tìm trong YouTube...", "progress": 30}

    data: {"step": "searching", "source": "SoundCloud", "message": "Đang tìm trong SoundCloud...", "progress": 50}

    data: {"step": "ranking", "message": "Đang xếp hạng kết quả...", "progress": 80}

    data: {"step": "complete", "message": "Hoàn thành!", "progress": 100, "total": 20}
    """
    import json
    from app.services.ai_music_parser import ai_music_parser_service

    async def event_generator():
        try:
            # Parse sources
            source_list = sources.split(',') if sources else ['youtube', 'soundcloud', 'deezer']

            # Step 1: Analyzing query
            yield f"data: {json.dumps({'step': 'analyzing', 'message': 'Đang phân tích query...', 'progress': 10}, ensure_ascii=False)}\n\n"
            await sleep(0.1)

            # Step 2: AI parsing
            parsed_query, _ = await ai_music_parser_service.parse(
                query=query,
                language=language
            )

            # Step 3: Generating optimized queries
            yield f"data: {json.dumps({'step': 'generating', 'message': 'Đang tối ưu keywords...', 'progress': 20}, ensure_ascii=False)}\n\n"
            await sleep(0.1)

            # Step 4: Search each source with progress updates
            total_sources = len(source_list)
            songs = []

            for i, source in enumerate(source_list):
                progress = 30 + (i * 40 // total_sources)  # 30% to 70%
                source_name = source.capitalize()

                yield f"data: {json.dumps({'step': 'searching', 'source': source_name, 'message': f'Đang tìm trong {source_name}...', 'progress': progress}, ensure_ascii=False)}\n\n"
                await sleep(0.1)

                # Search this source
                from app.services.music_search import music_search_service
                if source == 'youtube':
                    results = await music_search_service._search_youtube(query, limit // total_sources + 5)
                elif source == 'soundcloud':
                    results = await music_search_service._search_soundcloud(query, limit // total_sources + 5)
                elif source == 'spotify':
                    results = await music_search_service._search_spotify(query, limit // total_sources + 5)
                elif source == 'zing':
                    results = await music_search_service._search_zing(query, limit // total_sources + 5)
                elif source == 'deezer':
                    results = await music_search_service._search_deezer(query, limit // total_sources + 5)
                else:
                    results = []

                songs.extend(results)
                logger.info(f"Found {len(results)} songs from {source}")

            # Step 5: Ranking
            yield f"data: {json.dumps({'step': 'ranking', 'message': 'Đang xếp hạng kết quả...', 'progress': 80}, ensure_ascii=False)}\n\n"
            await sleep(0.1)

            # Deduplicate and rank
            songs = music_search_service._deduplicate_results(songs)
            songs = music_search_service._rank_by_popularity(songs)

            # Step 6: Complete
            yield f"data: {json.dumps({'step': 'complete', 'message': 'Hoàn thành!', 'progress': 100, 'total': len(songs[:limit]), 'songs': [{'title': s.title, 'artist': s.artist, 'source': s.source, 'thumbnail_url': s.thumbnail_url} for s in songs[:limit]]}, ensure_ascii=False)}\n\n"

        except Exception as e:
            logger.error(f"SSE search error: {str(e)}")
            yield f"data: {json.dumps({'step': 'error', 'message': f'Lỗi: {str(e)}', 'progress': 0}, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/sources")
async def get_sources():
    """Get available music sources"""
    return {
        "sources": ["youtube", "soundcloud", "fma", "spotify", "zing", "deezer"],
        "default": ["youtube", "soundcloud"],
        "description": {
            "youtube": "YouTube Music (via yt-dlp)",
            "soundcloud": "SoundCloud (via yt-dlp)",
            "fma": "Free Music Archive (royalty-free)",
            "spotify": "Spotify Web API (Vietnam charts)",
            "zing": "Zing MP3 (Vietnam charts)",
            "deezer": "Deezer API (free, global charts)"
        }
    }


@router.get("/preview/{source}/{source_id}")
async def get_preview_url(source: str, source_id: str):
    """
    Get direct audio URL for streaming (on-demand extraction).

    This endpoint extracts the actual playable audio URL when user clicks play.
    Search uses extract_flat=True for speed, audio URL is extracted here on-demand.

    **Performance**: First click = 3-5s (extraction), subsequent clicks = instant (cached)
    """
    try:
        # Get the direct audio URL by extracting on-demand
        audio_url = await music_search_service.get_audio_url(source, source_id)

        if not audio_url:
            # For YouTube/SoundCloud, this means extraction failed
            raise HTTPException(
                status_code=404,
                detail=f"Could not extract audio URL for {source}:{source_id}"
            )

        return {"url": audio_url}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Preview URL error for {source}:{source_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract audio URL: {str(e)}"
        )


@router.get("/check-copyright/{source}/{source_id}")
async def check_copyright(source: str, source_id: str):
    """
    Check if song is royalty free.

    **Note:** This is a placeholder implementation.
    TODO: Implement proper copyright checking using:
    - YouTube Data API v3 (check license field)
    - SoundCloud API (check license type)
    """
    return {
        "is_royalty_free": False,  # Placeholder
        "license_info": "TODO: Implement proper license check",
        "warning": "Copyright checking is not yet implemented. Always verify copyright status before using content."
    }


# =============================================================================
# SPOTIFY ENDPOINTS
# =============================================================================

@router.post("/spotify/search", response_model=SpotifySearchResponse)
async def search_spotify(
    query: str,
    limit: int = 20,
    market: str = "VN"
):
    """
    Search Spotify for tracks.

    **Parameters:**
    - query: Search query string
    - limit: Maximum number of results (default: 20, max: 50)
    - market: ISO 3166-1 alpha-2 country code (default: VN for Vietnam)

    **Returns:**
    - List of Spotify tracks with metadata (popularity, release date, preview URL)

    **Example:**
    ```
    POST /api/music/spotify/search?query=nhạc việt pop&limit=10
    ```

    **Note:** Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env
    Get credentials from: https://developer.spotify.com/dashboard
    """
    try:
        tracks = await spotify_service.search_tracks(query, limit=limit, market=market)

        # Convert to response format
        spotify_tracks = [
            SpotifySongResult(**track) for track in tracks
        ]

        return SpotifySearchResponse(
            tracks=spotify_tracks,
            total=len(spotify_tracks)
        )

    except Exception as e:
        logger.error(f"Spotify search error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Spotify search failed: {str(e)}"
        )


@router.get("/spotify/charts/vietnam", response_model=SpotifyChartResponse)
async def get_spotify_vietnam_top_50(limit: int = 50):
    """
    Get Spotify Vietnam Top 50 chart.

    Returns the current Top 50 most popular tracks in Vietnam.

    **Parameters:**
    - limit: Maximum number of results (default: 50)

    **Returns:**
    - List of tracks with chart position (1-50)

    **Example:**
    ```
    GET /api/music/spotify/charts/vietnam?limit=20
    ```

    **Note:** Chart data is cached for 24 hours
    """
    try:
        tracks = await spotify_service.get_vietnam_top_50(limit=limit)

        # Convert to response format
        chart_tracks = [
            SpotifyChartTrack(**track) for track in tracks
        ]

        return SpotifyChartResponse(
            chart_type="top50",
            region="vietnam",
            tracks=chart_tracks,
            total=len(chart_tracks),
            fetched_at=datetime.now()
        )

    except Exception as e:
        logger.error(f"Spotify Vietnam Top 50 error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Vietnam Top 50: {str(e)}"
        )


@router.get("/spotify/charts/viral-vietnam", response_model=SpotifyChartResponse)
async def get_spotify_viral_vietnam(limit: int = 50):
    """
    Get Spotify Viral 50 Vietnam chart.

    Returns the current Viral 50 most trending tracks in Vietnam.

    **Parameters:**
    - limit: Maximum number of results (default: 50)

    **Returns:**
    - List of tracks with chart position (1-50)

    **Example:**
    ```
    GET /api/music/spotify/charts/viral-vietnam?limit=20
    ```

    **Note:** Chart data is cached for 24 hours
    """
    try:
        tracks = await spotify_service.get_viral_vietnam(limit=limit)

        # Convert to response format
        chart_tracks = [
            SpotifyChartTrack(**track) for track in tracks
        ]

        return SpotifyChartResponse(
            chart_type="viral50",
            region="vietnam",
            tracks=chart_tracks,
            total=len(chart_tracks),
            fetched_at=datetime.now()
        )

    except Exception as e:
        logger.error(f"Spotify Viral Vietnam error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Viral Vietnam: {str(e)}"
        )


@router.get("/spotify/track/{track_id}")
async def get_spotify_track(track_id: str, market: str = "VN"):
    """
    Get detailed Spotify track information by track ID.

    **Parameters:**
    - track_id: Spotify track ID
    - market: ISO 3166-1 alpha-2 country code (default: VN)

    **Returns:**
    - Detailed track information including metadata, popularity, preview URL

    **Example:**
    ```
    GET /api/music/spotify/track/3n3Ppam7vgaVa1iaRUc9Lp
    ```
    """
    try:
        track = await spotify_service.get_track_by_id(track_id, market=market)

        if not track:
            raise HTTPException(
                status_code=404,
                detail=f"Track not found: {track_id}"
            )

        return track

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Spotify track error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch track: {str(e)}"
        )


@router.get("/spotify/health")
async def get_spotify_health():
    """
    Get Spotify service health status.

    Returns configuration status, cache information, and availability.
    """
    try:
        health = spotify_service.get_health_status()
        return health
    except Exception as e:
        logger.error(f"Spotify health check error: {str(e)}")
        return {
            "configured": False,
            "error": str(e)
        }


# =============================================================================
# ZING MP3 ENDPOINTS
# =============================================================================

@router.post("/zing/search", response_model=ZingSearchResponse)
async def search_zing(
    query: str,
    limit: int = 20
):
    """
    Search Zing MP3 for songs.

    **Parameters:**
    - query: Search query string
    - limit: Maximum number of results (default: 20)

    **Returns:**
    - List of Zing MP3 songs with metadata

    **Example:**
    ```
    POST /api/music/zing/search?query=nhạc việt pop&limit=10
    ```

    **Note:** Uses web scraping, results are cached for 6 hours
    """
    try:
        songs = await zing_service.search_songs(query, limit=limit)

        # Convert to response format
        zing_songs = [
            ZingSongResult(**song) for song in songs
        ]

        return ZingSearchResponse(
            songs=zing_songs,
            total=len(zing_songs)
        )

    except Exception as e:
        logger.error(f"Zing MP3 search error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Zing MP3 search failed: {str(e)}"
        )


@router.get("/zing/charts/top-100", response_model=ZingChartResponse)
async def get_zing_top_100(limit: int = 100):
    """
    Get Zing MP3 Top 100 Vietnam chart.

    Returns the current Top 100 most popular songs in Vietnam.

    **Parameters:**
    - limit: Maximum number of results (default: 100)

    **Returns:**
    - List of songs with chart position (1-100)

    **Example:**
    ```
    GET /api/music/zing/charts/top-100?limit=50
    ```

    **Note:** Chart data is cached for 6 hours
    """
    try:
        songs = await zing_service.get_top_100_vietnam(limit=limit)

        # Convert to response format
        chart_songs = [
            ZingChartTrack(**song) for song in songs
        ]

        return ZingChartResponse(
            chart_type="top100",
            songs=chart_songs,
            total=len(chart_songs),
            fetched_at=datetime.now()
        )

    except Exception as e:
        logger.error(f"Zing MP3 Top 100 error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Top 100 chart: {str(e)}"
        )


@router.get("/zing/charts/real-trending", response_model=ZingChartResponse)
async def get_zing_real_trending(limit: int = 50):
    """
    Get Zing MP3 Real Trending chart.

    Returns the current most trending songs on Zing MP3.

    **Parameters:**
    - limit: Maximum number of results (default: 50)

    **Returns:**
    - List of songs with chart position

    **Example:**
    ```
    GET /api/music/zing/charts/real-trending?limit=20
    ```

    **Note:** Chart data is cached for 6 hours
    """
    try:
        songs = await zing_service.get_real_trending(limit=limit)

        # Convert to response format
        chart_songs = [
            ZingChartTrack(**song) for song in songs
        ]

        return ZingChartResponse(
            chart_type="real_trending",
            songs=chart_songs,
            total=len(chart_songs),
            fetched_at=datetime.now()
        )

    except Exception as e:
        logger.error(f"Zing MP3 Real Trending error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Real Trending chart: {str(e)}"
        )


@router.get("/zing/song/{song_id}")
async def get_zing_song(song_id: str):
    """
    Get detailed Zing MP3 song information by song ID.

    **Parameters:**
    - song_id: Zing MP3 song encode ID

    **Returns:**
    - Detailed song information including metadata

    **Example:**
    ```
    GET /api/music/zing/song/ZW6B9WIB
    ```
    """
    try:
        song = await zing_service.get_song_detail(song_id)

        if not song:
            raise HTTPException(
                status_code=404,
                detail=f"Song not found: {song_id}"
            )

        return song

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Zing MP3 song error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch song: {str(e)}"
        )


@router.get("/zing/health")
async def get_zing_health():
    """
    Get Zing MP3 service health status.

    Returns configuration status, cache information, and availability.
    """
    try:
        health = zing_service.get_health_status()
        return health
    except Exception as e:
        logger.error(f"Zing MP3 health check error: {str(e)}")
        return {
            "configured": False,
            "error": str(e)
        }


# =============================================================================
# DEEZER ENDPOINTS
# =============================================================================

@router.post("/deezer/search", response_model=DeezerSearchResponse)
async def search_deezer(
    query: str,
    limit: int = 20
):
    """
    Search Deezer for tracks.

    **Parameters:**
    - query: Search query string
    - limit: Maximum number of results (default: 20, max: 100)

    **Returns:**
    - List of Deezer tracks with metadata (popularity, preview URL)

    **Example:**
    ```
    POST /api/music/deezer/search?query=nhac việt pop&limit=10
    ```

    **Note:** Deezer API is free and doesn't require authentication
    """
    try:
        tracks = await deezer_service.search_tracks(query, limit=limit)

        # Convert to response format
        deezer_tracks = [
            DeezerSongResult(**track) for track in tracks
        ]

        return DeezerSearchResponse(
            tracks=deezer_tracks,
            total=len(deezer_tracks)
        )

    except Exception as e:
        logger.error(f"Deezer search error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Deezer search failed: {str(e)}"
        )


@router.get("/deezer/chart/{country}", response_model=DeezerChartResponse)
async def get_deezer_chart(
    country: str = "VN",
    limit: int = 50
):
    """
    Get Deezer Top chart for a specific country.

    **Parameters:**
    - country: ISO 3166-1 alpha-2 country code (default: VN for Vietnam)
             Common codes: VN, US, GB, FR, DE, JP, KR, CN
    - limit: Maximum number of results (default: 50)

    **Returns:**
    - List of tracks with chart position (1-50+)

    **Example:**
    ```
    GET /api/music/deezer/chart/VN?limit=20
    ```

    **Available Countries:**
    - VN: Vietnam
    - US: USA
    - GB: UK
    - FR: France
    - DE: Germany
    - JP: Japan
    - KR: South Korea
    - CN: China

    **Note:** Chart data is fetched in real-time (no cache)
    """
    try:
        tracks = await deezer_service.get_top_chart(country=country, limit=limit)

        # Convert to response format
        chart_tracks = [
            DeezerChartTrack(**track) for track in tracks
        ]

        return DeezerChartResponse(
            chart_type="top",
            region=country,
            tracks=chart_tracks,
            total=len(chart_tracks),
            fetched_at=datetime.now()
        )

    except Exception as e:
        logger.error(f"Deezer chart error for {country}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch {country} chart: {str(e)}"
        )


@router.get("/deezer/track/{track_id}")
async def get_deezer_track(track_id: int):
    """
    Get detailed Deezer track information by track ID.

    **Parameters:**
    - track_id: Deezer track ID (integer)

    **Returns:**
    - Detailed track information including metadata, preview URL

    **Example:**
    ```
    GET /api/music/deezer/track/3135556
    ```
    """
    try:
        track = await deezer_service.get_track_by_id(track_id)

        if not track:
            raise HTTPException(
                status_code=404,
                detail=f"Track not found: {track_id}"
            )

        return track

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Deezer track error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch track: {str(e)}"
        )


@router.get("/deezer/health")
async def get_deezer_health():
    """
    Get Deezer service health status.

    Returns configuration status, availability, and rate limit info.
    """
    try:
        health = deezer_service.get_health_status()
        return health
    except Exception as e:
        logger.error(f"Deezer health check error: {str(e)}")
        return {
            "configured": False,
            "available": False,
            "error": str(e)
        }


# =============================================================================
# AUDIO STREAMING ENDPOINTS
# =============================================================================

@router.get("/stream-audio/{source}/{source_id}")
async def stream_audio(source: str, source_id: str):
    """
    Stream audio from YouTube/SoundCloud/Deezer to bypass ORB restrictions.

    Args:
        source: Music source (youtube, soundcloud, deezer)
        source_id: Video/track ID

    Returns:
        StreamingResponse with audio data
    """
    import requests
    import yt_dlp
    import tempfile
    import os

    try:
        if source == 'youtube':
            # Get the direct audio URL using the music search service
            audio_url = await music_search_service.get_audio_url(source, source_id)

            if not audio_url:
                raise HTTPException(
                    status_code=404,
                    detail=f"Could not extract audio URL for {source}:{source_id}"
                )

            logger.info(f"Streaming audio from {source}:{source_id}")

            # Stream the audio in chunks
            def iter_audio():
                """Generator function to stream audio in chunks"""
                try:
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    }
                    with requests.get(audio_url, stream=True, headers=headers, timeout=30) as r:
                        r.raise_for_status()
                        chunk_size = 8192  # 8KB chunks
                        for chunk in r.iter_content(chunk_size=chunk_size):
                            if chunk:
                                yield chunk
                except Exception as e:
                    logger.error(f"Error streaming audio: {str(e)}")
                    raise

            # Determine content type
            content_type = "audio/webm"  # YouTube uses WebM audio

            return StreamingResponse(
                iter_audio(),
                media_type=content_type,
                headers={
                    "Accept-Ranges": "bytes",
                    "Cache-Control": "no-cache",
                    "Access-Control-Allow-Origin": "*",
                }
            )

        elif source == 'soundcloud':
            # For SoundCloud, use yt-dlp to get the direct URL
            ydl_opts = {
                'format': 'bestaudio/best',
                'quiet': True,
                'noplaylist': True,
            }

            # Try multiple URL formats for SoundCloud
            possible_urls = [
                f"https://soundcloud.com/tracks/{source_id}",
                f"https://api.soundcloud.com/tracks/{source_id}",
                source_id if source_id.startswith('http') else None
            ]

            # Filter out None values
            possible_urls = [url for url in possible_urls if url]

            last_error = None

            for track_url in possible_urls:
                try:
                    logger.info(f"Trying SoundCloud URL: {track_url}")

                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        info = ydl.extract_info(track_url, download=False)
                        audio_url = info.get('url', '')

                        if not audio_url:
                            logger.warning(f"No audio URL found for {track_url}")
                            continue

                        logger.info(f"Extracted SoundCloud audio URL: {audio_url[:100]}...")

                        # Stream from the extracted URL
                        headers = {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        }
                        response = requests.get(audio_url, stream=True, headers=headers, timeout=30)
                        response.raise_for_status()

                        content_type = response.headers.get('content-type', 'audio/mpeg')

                        def iter_audio():
                            for chunk in response.iter_content(chunk_size=8192):
                                if chunk:
                                    yield chunk

                        return StreamingResponse(
                            iter_audio(),
                            media_type=content_type,
                            headers={
                                "Cache-Control": "no-cache, no-store, must-revalidate",
                                "Pragma": "no-cache",
                                "Expires": "0",
                                "Accept-Ranges": "bytes",
                                "Access-Control-Allow-Origin": "*",
                            }
                        )

                except Exception as e:
                    logger.warning(f"Failed to extract from {track_url}: {str(e)}")
                    last_error = e
                    continue

            # If all attempts failed
            logger.error(f"All SoundCloud URL attempts failed for {source_id}")
            raise HTTPException(
                status_code=404,
                detail=f"Could not stream SoundCloud track {source_id}. Tried: {possible_urls}. Last error: {str(last_error)}"
            )

        elif source == 'deezer':
            # For Deezer, the preview URL should be available from the search result
            # We need to return an error if no URL is provided
            raise HTTPException(
                status_code=400,
                detail="Deezer preview URLs should be used directly from search results. Please use the audio_url field from the song data."
            )

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported source: {source}"
            )

    except HTTPException:
        raise
    except requests.RequestException as e:
        logger.error(f"Error streaming audio: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to stream audio: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in audio streaming: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# =============================================================================
# END OF ROUTES
# =============================================================================
