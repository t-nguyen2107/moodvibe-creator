import os
import asyncio
from typing import List
from app.config import settings


class VideoGeneratorService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR

    async def create_video(
        self,
        audio_path: str,
        image_path: str,
        song_list: List[str],
        show_song_list: bool = True,
        output_filename: str = "output_video.mp4"
    ) -> str:
        """Create video from audio and image with optional song list overlay"""

        output_path = os.path.join(self.upload_dir, output_filename)

        if show_song_list and song_list:
            # Create video with song list overlay
            await self._create_video_with_songlist(
                audio_path, image_path, song_list, output_path
            )
        else:
            # Simple video without song list
            await self._create_simple_video(audio_path, image_path, output_path)

        return output_path

    async def _create_simple_video(
        self,
        audio_path: str,
        image_path: str,
        output_path: str
    ):
        """Create simple video with audio and static image"""

        if not image_path or not os.path.exists(image_path):
            # Create a simple colored background video without image
            # Generate a 1280x720 gradient background using FFmpeg
            cmd = [
                'ffmpeg',
                '-f', 'lavfi',
                '-i', f'color=c=orange800:s=1280x720:d=1',  # Solid orange background
                '-i', audio_path,
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-tune', 'stillimage',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-shortest',
                '-pix_fmt', 'yuv420p',
                output_path
            ]
        else:
            cmd = [
                'ffmpeg',
                '-loop', '1',
                '-i', image_path,
                '-i', audio_path,
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-tune', 'stillimage',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-shortest',
                '-pix_fmt', 'yuv420p',
                output_path
            ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            error_msg = stderr.decode()
            raise Exception(f"FFmpeg error: {error_msg}")

    async def _create_video_with_songlist(
        self,
        audio_path: str,
        image_path: str,
        song_list: List[str],
        output_path: str
    ):
        """Create video with song list text overlay"""

        # Format song list text
        song_text = "\\n".join([f"{i+1}. {song}" for i, song in enumerate(song_list[:15])])

        # FFmpeg drawtext filter
        filter_complex = (
            f"drawtext=text='{song_text}':"
            f"fontfile=/Windows/Fonts/arial.ttf:"  # Windows font
            f"fontsize=24:"
            f"fontcolor=white:"
            f"x=50:"
            f"y=100:"
            f"line_spacing=20"
        )

        cmd = [
            'ffmpeg',
            '-loop', '1',
            '-i', image_path,
            '-i', audio_path,
            '-vf', filter_complex,
            '-c:v', 'libx264',
            '-tune', 'stillimage',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
            '-pix_fmt', 'yuv420p',
            output_path
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            # Fallback to simple video if text overlay fails
            await self._create_simple_video(audio_path, image_path, output_path)


# Global instance
video_generator_service = VideoGeneratorService()
