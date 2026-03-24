from pydantic import BaseModel
from typing import Optional


class SongCreate(BaseModel):
    title: str
    artist: Optional[str] = None
    source: str  # youtube, soundcloud, pixabay, fma
    source_id: str
    duration: Optional[int] = None
    audio_url: str
    thumbnail_url: Optional[str] = None
    is_royalty_free: bool = False
    position: int = 0


class SongResponse(BaseModel):
    id: int
    title: str
    artist: Optional[str]
    source: str
    source_id: str
    duration: Optional[int]
    audio_url: str
    thumbnail_url: Optional[str]
    is_royalty_free: bool
    position: int

    class Config:
        from_attributes = True
