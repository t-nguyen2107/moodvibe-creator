import os
import asyncio
import subprocess
import aiofiles
import aiohttp
from typing import List
from app.config import settings


class AudioProcessorService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR

    async def download_audio(self, url: str, filename: str) -> str:
        """Download audio from URL"""
        filepath = os.path.join(self.upload_dir, filename)

        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    async with aiofiles.open(filepath, 'wb') as f:
                        await f.write(await response.read())

        return filepath

    async def merge_audio(
        self,
        audio_urls: List[str],
        gap: int = 5,
        output_filename: str = "merged_audio.mp3"
    ) -> str:
        """Merge multiple audio files with gaps between them"""

        # Download all audio files
        temp_files = []
        for i, url in enumerate(audio_urls):
            filename = f"temp_{i}_{output_filename}"
            filepath = await self.download_audio(url, filename)
            temp_files.append(filepath)

        # Create concat file for ffmpeg
        concat_file = os.path.join(self.upload_dir, "concat_list.txt")
        async with aiofiles.open(concat_file, 'w') as f:
            for temp_file in temp_files:
                await f.write(f"file '{temp_file}'\n")
                await f.write(f"duration {gap}\n")  # Add gap

        # Merge using ffmpeg
        output_path = os.path.join(self.upload_dir, output_filename)

        cmd = [
            'ffmpeg',
            '-f', 'concat',
            '-safe', '0',
            '-i', concat_file,
            '-c', 'copy',
            output_path
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            raise Exception(f"FFmpeg error: {stderr.decode()}")

        # Clean up temp files
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
            except:
                pass

        os.remove(concat_file)

        return output_path

    async def get_audio_duration(self, filepath: str) -> int:
        """Get audio duration in seconds"""
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            filepath
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if process.returncode == 0:
            return int(float(stdout.decode().strip()))

        return 0


# Global instance
audio_processor_service = AudioProcessorService()
