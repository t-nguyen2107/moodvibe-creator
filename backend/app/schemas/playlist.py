from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SongInput(BaseModel):
    """Song data for creating playlist with songs"""
    title: str
    artist: Optional[str] = None
    source: str
    source_id: str
    duration: Optional[int] = None
    audio_url: str
    thumbnail_url: Optional[str] = None
    is_royalty_free: bool = False


class PlaylistCreate(BaseModel):
    name: str
    mood: Optional[str] = None
    genre: Optional[str] = None
    description: Optional[str] = None
    show_song_list: bool = True
    songs: Optional[List[SongInput]] = None  # Optional songs to add immediately


class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    mood: Optional[str] = None
    description: Optional[str] = None
    cover_image_path: Optional[str] = None


class PlaylistResponse(BaseModel):
    id: int
    name: str
    mood: Optional[str]
    genre: Optional[str]
    is_royalty_free: bool
    show_song_list: bool
    description: Optional[str]
    cover_image_path: Optional[str]
    audio_path: Optional[str]
    video_path: Optional[str]
    song_count: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
