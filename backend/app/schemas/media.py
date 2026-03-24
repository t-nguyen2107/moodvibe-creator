from pydantic import BaseModel
from typing import List


class AudioMergeRequest(BaseModel):
    audio_urls: List[str]
    gap: int = 5  # seconds between songs


class VideoGenerateRequest(BaseModel):
    audio_path: str
    image_path: str
    song_list: List[str]
    show_song_list: bool = True


class ImageGenerateRequest(BaseModel):
    prompt: str
    mood: str
    song_list: List[str]
    show_song_list: bool = True
