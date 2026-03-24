from pydantic import BaseModel, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime


class MusicSearchRequest(BaseModel):
    query: Optional[str] = None
    genre: Optional[str] = None
    mood: Optional[str] = None
    sources: Optional[List[str]] = None
    limit: int = 20
    royalty_free_only: bool = False


class SongResult(BaseModel):
    title: str
    artist: Optional[str]
    source: str
    source_id: str
    duration: Optional[int] = None
    audio_url: str
    thumbnail_url: Optional[str]
    is_royalty_free: bool
    rank_score: Optional[float] = None  # Overall ranking score (0.0 to 1.0)
    rank_position: Optional[int] = None  # Position in ranked results
    popularity_rank: Optional[int] = None  # Position in popularity ranking
    trending_rank: Optional[int] = None  # Chart position (1-50)
    listeners_count: Optional[int] = None  # Number of listeners
    is_viral: Optional[bool] = None  # Viral/trending status

    @field_validator('duration', mode='before')
    @classmethod
    def convert_duration_to_int(cls, v):
        """Convert float duration to int (SoundCloud returns float)"""
        if v is None:
            return None
        if isinstance(v, float):
            return int(v)  # Truncate decimal part
        return v


class MusicSearchResponse(BaseModel):
    songs: List[SongResult]
    total: int


# AI Parsing Schemas

class AIParsedQuery(BaseModel):
    """Structured output from AI parsing of natural language music queries"""
    mood: Optional[str] = None
    mood_confidence: float = 0.0
    genre: Optional[str] = None
    genre_confidence: float = 0.0
    activity: Optional[str] = None
    activity_confidence: float = 0.0
    era: Optional[str] = None
    era_confidence: float = 0.0
    language: Optional[str] = None
    language_confidence: float = 0.0
    culture: Optional[str] = None
    culture_confidence: float = 0.0
    trending: Optional[bool] = None
    trending_confidence: float = 0.0
    raw_query: str
    parsed_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AIParseRequest(BaseModel):
    """Request to parse natural language query using AI"""
    query: str
    language: str = "en"
    limit: int = 10  # Max number of results to return (default 10 for faster search)
    offset: int = 0  # For pagination (skip first N results)

    # Advanced filters (optional)
    moods: Optional[List[str]] = None
    genres: Optional[List[str]] = None
    eras: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    sources: Optional[List[str]] = None
    royalty_free_only: Optional[bool] = None
    trending: Optional[bool] = None


class AIParseResponse(BaseModel):
    """Response from AI parsing endpoint"""
    parsed: AIParsedQuery
    cached: bool = False
    processing_time_ms: int
    tokens_used: Optional[int] = None
    model: str


class AIHealthResponse(BaseModel):
    """Health check response for AI service"""
    status: str  # "healthy", "degraded", "unavailable"
    openai_configured: bool
    redis_configured: bool
    cache_hit_rate: Optional[float] = None
    average_response_time_ms: Optional[float] = None
    total_requests: int = 0
    total_cache_hits: int = 0


# Spotify Schemas

class SpotifySongResult(BaseModel):
    """Song result from Spotify search"""
    track_id: str
    name: str
    artist: str
    album: Optional[str] = None
    popularity: int  # 0-100
    release_date: Optional[str] = None
    preview_url: Optional[str] = None
    external_urls: Dict[str, str]
    available_markets: List[str]
    duration_ms: int
    images: List[Dict[str, Any]]


class SpotifyChartTrack(BaseModel):
    """Track from Spotify chart (includes position)"""
    position: int
    track_id: str
    name: str
    artist: str
    album: Optional[str] = None
    popularity: int
    preview_url: Optional[str] = None
    external_urls: Dict[str, str]
    duration_ms: int
    images: List[Dict[str, Any]]


class SpotifySearchResponse(BaseModel):
    """Response from Spotify search"""
    tracks: List[SpotifySongResult]
    total: int


class SpotifyChartResponse(BaseModel):
    """Response from Spotify chart endpoint"""
    chart_type: str  # "top50" or "viral50"
    region: str  # "vietnam"
    tracks: List[SpotifyChartTrack]
    total: int
    fetched_at: datetime


# Zing MP3 Schemas

class ZingSongResult(BaseModel):
    """Song result from Zing MP3 search"""
    song_id: str
    title: str
    artists: str
    thumbnail: Optional[str] = None
    duration: int  # seconds
    streaming_url: Optional[str] = None
    zing_url: str


class ZingChartTrack(BaseModel):
    """Track from Zing MP3 chart (includes position)"""
    position: int
    song_id: str
    title: str
    artists: str
    thumbnail: Optional[str] = None
    duration: int
    zing_url: str


class ZingSearchResponse(BaseModel):
    """Response from Zing MP3 search"""
    songs: List[ZingSongResult]
    total: int


class ZingChartResponse(BaseModel):
    """Response from Zing MP3 chart endpoint"""
    chart_type: str  # "top100" or "real_trending"
    songs: List[ZingChartTrack]
    total: int
    fetched_at: datetime


# Database Models for Chart Tracking

class SpotifyChartEntry(BaseModel):
    """Spotify chart entry for database storage"""
    id: Optional[int] = None
    chart_type: str  # 'top50', 'viral50'
    region: str  # 'vietnam', 'global'
    track_id: str
    track_name: str
    artist_name: str
    position: int
    position_change: Optional[int] = None  # +5 rose, -3 fell, 0 same
    popularity_score: int  # 0-100
    fetched_at: datetime


class ZingChartEntry(BaseModel):
    """Zing MP3 chart entry for database storage"""
    id: Optional[int] = None
    song_id: str
    song_name: str
    artist_name: str
    position: int
    week_date: Optional[str] = None
    fetched_at: datetime
