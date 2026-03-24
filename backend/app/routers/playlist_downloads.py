"""
Playlist download endpoints - handles MP3 and video generation
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.playlist import Playlist
from app.models.song import Song
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/playlists-download", tags=["playlists-download"])


@router.post("/{playlist_id}/mp3")
async def download_playlist_mp3(
    playlist_id: int,
    db: Session = Depends(get_db)
):
    """Download all songs in playlist as merged MP3"""

    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    songs = db.query(Song).filter(Song.playlist_id == playlist_id).order_by(Song.position).all()
    if not songs:
        raise HTTPException(status_code=400, detail="No songs in playlist")

    try:
        from app.services.playlist_download import download_playlist_as_mp3

        logger.info(f"Starting MP3 download for playlist {playlist_id}")

        # Download and merge (synchronous)
        result = download_playlist_as_mp3(songs, playlist.name)

        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Download failed"))

        return {
            "message": "MP3 created successfully!",
            "playlist_id": playlist_id,
            "song_count": len(songs),
            "total_duration": sum(song.duration or 0 for song in songs),
            "output_filename": result["filename"],
            "download_url": result["download_url"],
            "status": "completed",
            "file_size_mb": round(result["file_size"] / 1024 / 1024, 2)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading MP3: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Failed to download MP3: {str(e)}")


@router.get("/download-file/{filename}")
async def download_file(filename: str):
    """Download generated file"""
    from fastapi.responses import FileResponse
    from pathlib import Path

    file_path = Path(f"uploads/playlists/{filename}")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or still processing")

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type='audio/mpeg'
    )
