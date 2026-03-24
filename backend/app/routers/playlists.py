from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.playlist import Playlist
from app.models.song import Song
from app.schemas.playlist import PlaylistCreate, PlaylistResponse, PlaylistUpdate, SongInput
from app.schemas.song import SongCreate, SongResponse
import logging
import os
import asyncio
from pathlib import Path

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/playlists", tags=["playlists"])


@router.post("/", response_model=PlaylistResponse)
async def create_playlist(
    playlist: PlaylistCreate,
    cover_image: UploadFile = None,
    user_id: int = 1,  # TODO: Get from auth
    db: Session = Depends(get_db)
):
    """Create a new playlist with optional songs and cover image"""

    # Check special genres
    from app.config import SPECIAL_GENRES
    show_song_list = playlist.genre not in SPECIAL_GENRES if playlist.genre else True

    # Handle cover image upload
    cover_image_path = None
    if cover_image and cover_image.filename:
        import uuid
        from pathlib import Path

        # Create uploads directory
        upload_dir = Path(__file__).parent.parent.parent / "uploads" / "covers"
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename
        file_ext = Path(cover_image.filename).suffix
        unique_filename = f"{uuid.uuid4().hex[:12]}{file_ext}"
        file_path = upload_dir / unique_filename

        # Save file
        try:
            contents = await cover_image.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            cover_image_path = f"uploads/covers/{unique_filename}"
            logger.info(f"Cover image saved: {cover_image_path}")
        except Exception as e:
            logger.error(f"Failed to save cover image: {e}")
            # Continue without cover image

    db_playlist = Playlist(
        user_id=user_id,
        name=playlist.name,
        mood=playlist.mood,
        genre=playlist.genre,
        description=playlist.description,
        show_song_list=show_song_list,
        cover_image_path=cover_image_path
    )

    db.add(db_playlist)
    db.commit()
    db.refresh(db_playlist)

    # Add songs if provided
    logger.info(f"Creating playlist with {len(playlist.songs) if playlist.songs else 0} songs")
    if playlist.songs and len(playlist.songs) > 0:
        try:
            logger.info(f"Adding {len(playlist.songs)} songs to playlist {db_playlist.id}")
            for position, song_data in enumerate(playlist.songs):
                logger.info(f"Adding song {position}: {song_data.title}")
                db_song = Song(
                    playlist_id=db_playlist.id,
                    title=song_data.title,
                    artist=song_data.artist,
                    source=song_data.source,
                    source_id=song_data.source_id,
                    duration=song_data.duration,
                    audio_url=song_data.audio_url,
                    thumbnail_url=song_data.thumbnail_url,
                    is_royalty_free=song_data.is_royalty_free,
                    position=position
                )
                db.add(db_song)
                logger.info(f"Added song {song_data.title} to session")

            # Update playlist royalty free status
            all_royalty_free = all(s.is_royalty_free for s in playlist.songs)
            db_playlist.is_royalty_free = all_royalty_free

            db.commit()
            db.refresh(db_playlist)
            logger.info(f"Successfully saved {len(playlist.songs)} songs for playlist {db_playlist.id}")
        except Exception as e:
            logger.error(f"Error saving songs: {str(e)}")
            logger.exception("Full traceback:")
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to save songs: {str(e)}")
    else:
        logger.info("No songs provided, skipping song addition")

    return db_playlist


@router.get("/", response_model=List[PlaylistResponse])
async def get_playlists(
    user_id: int = 1,  # TODO: Get from auth
    db: Session = Depends(get_db)
):
    """Get all user playlists"""

    playlists = db.query(Playlist).filter(Playlist.user_id == user_id).all()

    # Add song_count to each playlist
    result = []
    for playlist in playlists:
        playlist_dict = PlaylistResponse.model_validate(playlist).model_dump()
        song_count = db.query(Song).filter(Song.playlist_id == playlist.id).count()
        playlist_dict['song_count'] = song_count
        result.append(playlist_dict)

    return result


@router.get("/{playlist_id}", response_model=PlaylistResponse)
async def get_playlist(
    playlist_id: int,
    db: Session = Depends(get_db)
):
    """Get playlist by ID"""

    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Add song_count to response
    playlist_dict = PlaylistResponse.model_validate(playlist).model_dump()
    song_count = db.query(Song).filter(Song.playlist_id == playlist_id).count()
    playlist_dict['song_count'] = song_count

    return playlist_dict


@router.get("/{playlist_id}/songs", response_model=List[SongResponse])
async def get_playlist_songs(
    playlist_id: int,
    db: Session = Depends(get_db)
):
    """Get all songs in a playlist"""

    songs = db.query(Song).filter(Song.playlist_id == playlist_id).order_by(Song.position).all()
    return songs


@router.post("/{playlist_id}/songs", response_model=SongResponse)
async def add_song_to_playlist(
    playlist_id: int,
    song: SongCreate,
    db: Session = Depends(get_db)
):
    """Add a song to playlist"""

    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Check current song count
    current_count = db.query(Song).filter(Song.playlist_id == playlist_id).count()

    db_song = Song(
        playlist_id=playlist_id,
        title=song.title,
        artist=song.artist,
        source=song.source,
        source_id=song.source_id,
        duration=song.duration,
        audio_url=song.audio_url,
        thumbnail_url=song.thumbnail_url,
        is_royalty_free=song.is_royalty_free,
        position=current_count
    )

    db.add(db_song)
    db.commit()
    db.refresh(db_song)

    # Update playlist royalty free status
    all_royalty_free = all(s.is_royalty_free for s in db.query(Song).filter(Song.playlist_id == playlist_id).all())
    playlist.is_royalty_free = all_royalty_free
    db.commit()

    return db_song


@router.delete("/{playlist_id}")
async def delete_playlist(
    playlist_id: int,
    db: Session = Depends(get_db)
):
    """Delete a playlist"""

    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    db.delete(playlist)
    db.commit()

    return {"message": "Playlist deleted successfully"}


@router.post("/{playlist_id}/download-mp3")
async def download_playlist_mp3(
    playlist_id: int,
    background_tasks: BackgroundTasks,
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
        from app.services.audio_processor import audio_processor_service
        from app.services.music_search import music_search_service
        import uuid

        # Create output directory
        output_dir = Path("uploads/playlists")
        output_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename
        unique_id = str(uuid.uuid4())[:8]
        safe_name = "".join(c for c in playlist.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        output_filename = f"{safe_name}_{unique_id}.mp3"
        output_path = output_dir / output_filename

        # Get audio URLs for all songs
        audio_urls = []
        for song in songs:
            if song.audio_url:
                audio_urls.append(song.audio_url)
            elif song.source_id:
                # Generate stream URL
                stream_url = f"http://localhost:8899/api/music/stream-audio/{song.source}/{song.source_id}"
                audio_urls.append(stream_url)

        if not audio_urls:
            raise HTTPException(status_code=400, detail="No audio URLs available")

        logger.info(f"Downloading MP3 for playlist {playlist_id} with {len(audio_urls)} songs")

        # Process in background
        def process_download():
            import asyncio
            asyncio.run(audio_processor_service.merge_audio(
                audio_urls=audio_urls,
                gap=2,  # 2 seconds crossfade
                output_filename=output_filename
            ))
            logger.info(f"MP3 download complete: {output_filename}")

        # Run in background thread
        import threading
        thread = threading.Thread(target=process_download, daemon=True)
        thread.start()

        return {
            "message": "MP3 download started",
            "playlist_id": playlist_id,
            "playlist_name": playlist.name,
            "song_count": len(songs),
            "total_duration": sum(song.duration or 0 for song in songs),
            "output_filename": output_filename,
            "download_url": f"/api/playlists/{playlist_id}/download-file/{output_filename}",
            "status": "processing",
            "estimated_time": f"{len(songs) * 5} seconds"
        }

    except Exception as e:
        logger.error(f"Error downloading MP3: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Failed to download MP3: {str(e)}")


@router.post("/{playlist_id}/generate-video")
async def generate_playlist_video(
    playlist_id: int,
    db: Session = Depends(get_db)
):
    """Generate video from playlist"""

    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    songs = db.query(Song).filter(Song.playlist_id == playlist_id).order_by(Song.position).all()
    if not songs:
        raise HTTPException(status_code=400, detail="No songs in playlist")

    try:
        from app.services.playlist_download import download_playlist_as_mp3
        from pathlib import Path
        import subprocess
        import uuid

        # Use absolute path
        output_dir = Path(__file__).parent.parent.parent / "uploads" / "playlists"
        output_dir = output_dir.resolve()
        output_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"Generating video for playlist {playlist_id}")

        # Generate unique filename
        safe_name = "".join(c if c.isalnum() or c in " -_" else "_" for c in playlist.name)[:50].strip("_")
        unique_id = uuid.uuid4().hex[:9]
        video_filename = f"{safe_name}_{unique_id}.mp4"
        video_path = output_dir / video_filename

        # Step 1: Download and merge audio (reusing MP3 download logic)
        logger.info("Step 1: Creating merged audio...")
        audio_result = download_playlist_as_mp3(songs, playlist.name)

        if not audio_result.get("success"):
            raise HTTPException(status_code=500, detail=audio_result.get("error", "Failed to create audio"))

        # Get the merged MP3 path
        mp3_path = output_dir / audio_result["filename"]
        if not mp3_path.exists():
            raise HTTPException(status_code=500, detail="Merged audio file not found")

        # Step 2: Create video with audio
        logger.info("Step 2: Creating video...")

        # Determine cover image to use
        cover_image = None

        # Priority: Playlist cover > First song thumbnail > Default cover
        if playlist.cover_image_path:
            # Use playlist's custom cover
            from pathlib import Path
            cover_full_path = Path(__file__).parent.parent.parent / playlist.cover_image_path
            if cover_full_path.exists():
                cover_image = str(cover_full_path)
                logger.info(f"Using playlist cover: {cover_image}")
        elif songs and songs[0].thumbnail_url:
            # Could download thumbnail here, but for now skip
            logger.info("First song has thumbnail but skipping download")
        # Always use default cover as fallback

        # Use default cover
        if not cover_image:
            from pathlib import Path
            default_cover = Path(__file__).parent.parent.parent / "uploads" / "covers" / "default_cover.jpg"
            if default_cover.exists():
                cover_image = str(default_cover)
                logger.info(f"Using default cover: {cover_image}")

        # Create video with cover image
        if cover_image:
            cmd = [
                'ffmpeg',
                '-loop', '1',
                '-i', str(cover_image),
                '-i', str(mp3_path),
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-tune', 'stillimage',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-shortest',
                '-pix_fmt', 'yuv420p',
                str(video_path)
            ]
        else:
            # Fallback to colored background
            cmd = [
                'ffmpeg',
                '-f', 'lavfi',
                '-i', 'color=c=0xFF6B35:s=1280x720:d=1',
                '-i', str(mp3_path),
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-tune', 'stillimage',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-shortest',
                '-pix_fmt', 'yuv420p',
                str(video_path)
            ]

        logger.info(f"Running FFmpeg: {' '.join(cmd[:5])}...")
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            logger.error(f"FFmpeg error: {result.stderr}")
            raise HTTPException(status_code=500, detail="Failed to create video")

        # Cleanup temp MP3
        try:
            mp3_path.unlink()
            logger.info(f"Cleaned up temp MP3: {mp3_path}")
        except:
            pass

        # Get file size
        file_size = video_path.stat().st_size if video_path.exists() else 0
        file_size_mb = round(file_size / 1024 / 1024, 2)

        logger.info(f"✓ Video created: {video_filename} ({file_size_mb} MB)")

        return {
            "message": "Video created successfully!",
            "playlist_id": playlist_id,
            "song_count": len(songs),
            "total_duration": sum(song.duration or 0 for song in songs),
            "output_filename": video_filename,
            "download_url": f"/api/playlists/{playlist_id}/video-file/{video_filename}",
            "status": "completed",
            "file_size_mb": file_size_mb
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating video: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {str(e)}")


@router.get("/{playlist_id}/download-file/{filename}")
async def download_file(
    playlist_id: int,
    filename: str,
    db: Session = Depends(get_db)
):
    """Download generated file"""
    from fastapi.responses import FileResponse

    file_path = Path(f"uploads/playlists/{filename}")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or still processing")

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type='application/octet-stream'
    )
