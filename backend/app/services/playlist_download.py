"""
Simple playlist download service - downloads and merges audio files
"""
import os
import subprocess
import uuid
import shutil
from pathlib import Path
from typing import List
from app.models.song import Song


def download_playlist_as_mp3(songs: List[Song], playlist_name: str = "playlist"):
    # Use absolute path to avoid Windows path issues
    output_dir = Path(__file__).parent.parent.parent / "uploads" / "playlists"
    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {output_dir}")

    # Check dependencies
    if not shutil.which("yt-dlp"):
        return {"success": False, "error": "yt-dlp not found"}
    if not shutil.which("ffmpeg"):
        return {"success": False, "error": "ffmpeg not found"}

    # Create unique temp directory to prevent concurrent download conflicts
    temp_session_id = uuid.uuid4().hex[:12]
    temp_dir = output_dir / f"tmp_{temp_session_id}"
    temp_dir.mkdir(exist_ok=True)
    print(f"Temp directory: {temp_dir}")

    # Tạo tên file output đẹp + unique
    safe_name = "".join(c if c.isalnum() or c in " -_" else "_" for c in playlist_name)[:50].strip("_")
    unique_id = uuid.uuid4().hex[:9]
    output_filename = f"{safe_name or 'playlist'}_{unique_id}.mp3"
    output_path = output_dir / output_filename

    temp_audio_files = []

    # Download each song synchronously
    for i, song in enumerate(songs):
        temp_file = temp_dir / f"temp_{i+1}.mp3"

        cmd = [
            "yt-dlp",
            "--no-playlist",
            "-f", "bestaudio/best",
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "192",
            "-o", str(temp_file),
            f"https://www.youtube.com/watch?v={song.source_id}"
        ]

        print(f"Downloading {i+1}/{len(songs)}: {song.title or song.source_id}")
        print(f"Output path: {temp_file}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        print(f"Return code: {result.returncode}")
        if result.stdout:
            print(f"Stdout: {result.stdout[:200]}")

        if result.returncode == 0 and temp_file.exists():
            temp_audio_files.append(str(temp_file))
            print(f"  ✓ Success")
        else:
            print(f"  ✗ Failed: {result.stderr[-200:]}")

    if not temp_audio_files:
        return {"success": False, "error": "No songs downloaded"}

    # Use ffmpeg concat demuxer
    print(f"Merging {len(temp_audio_files)} files...")
    concat_file = temp_dir / "concat_list.txt"
    with open(concat_file, 'w') as f:
        for temp_file in temp_audio_files:
            f.write(f"file '{os.path.basename(temp_file)}'\n")

    cmd = [
        'ffmpeg', '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', str(concat_file),
        '-c', 'copy',
        str(output_path)
    ]

    result = subprocess.run(cmd, cwd=str(temp_dir), capture_output=True, text=True)

    # Cleanup temp directory
    try:
        shutil.rmtree(temp_dir)
        print(f"Cleaned up temp directory: {temp_dir}")
    except Exception as e:
        print(f"Warning: Failed to cleanup temp directory: {e}")

    if result.returncode != 0 or not output_path.exists():
        print(f"FFmpeg error: {result.stderr}")
        return {"success": False, "error": "FFmpeg merge failed"}

    file_size = os.path.getsize(output_path) if output_path.exists() else 0
    print(f"✓ Success! Created: {output_filename} ({file_size / 1024 / 1024:.1f} MB)")

    download_url = f"/api/playlists-download/download-file/{output_filename}"
    print(f"DEBUG: Returning download_url = {download_url}")
    return {
        "success": True,
        "filename": output_filename,
        "download_url": download_url,
        "file_size": file_size,
        "song_count": len(temp_audio_files)
    }
