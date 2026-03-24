import re
import requests
import logging
from typing import Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class ThumbnailService:
    """Service to fetch thumbnails from various music sources"""

    @staticmethod
    async def get_youtube_thumbnail(video_id: str) -> Optional[str]:
        """
        Get high-quality YouTube thumbnail from video ID

        Args:
            video_id: YouTube video ID

        Returns:
            Thumbnail URL or None
        """
        if not video_id:
            return None

        # Try multiple thumbnail qualities in order of preference
        thumbnail_qualities = [
            f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",  # HD (1280x720)
            f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",     # HQ (480x360)
            f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg",     # MQ (320x180)
            f"https://img.youtube.com/vi/{video_id}/default.jpg",        # Low (120x90)
        ]

        for thumbnail_url in thumbnail_qualities:
            try:
                response = requests.head(thumbnail_url, timeout=5)
                if response.status_code == 200:
                    logger.info(f"Successfully fetched YouTube thumbnail: {thumbnail_url}")
                    return thumbnail_url
            except Exception as e:
                logger.warning(f"Failed to fetch YouTube thumbnail {thumbnail_url}: {e}")
                continue

        logger.warning(f"Could not fetch any thumbnail for YouTube video {video_id}")
        return None

    @staticmethod
    async def get_spotify_thumbnail(track_id: str) -> Optional[str]:
        """
        Get Spotify thumbnail from track ID using web scraping

        Args:
            track_id: Spotify track ID

        Returns:
            Thumbnail URL or None
        """
        if not track_id:
            return None

        try:
            # Spotify Open API endpoint
            url = f"https://open.spotify.com/oembed?url=https://open.spotify.com/track/{track_id}"
            response = requests.get(url, timeout=10)

            if response.status_code == 200:
                data = response.json()
                thumbnail_url = data.get('thumbnail_url')
                if thumbnail_url:
                    # Get higher quality by replacing the image size
                    # Spotify returns different sizes, replace with largest
                    thumbnail_url = re.sub(r'-\d+x\d+', '', thumbnail_url)
                    logger.info(f"Successfully fetched Spotify thumbnail for track {track_id}")
                    return thumbnail_url
        except Exception as e:
            logger.warning(f"Failed to fetch Spotify thumbnail for track {track_id}: {e}")

        return None

    @staticmethod
    async def get_soundcloud_thumbnail(track_url: str) -> Optional[str]:
        """
        Get SoundCloud thumbnail from track URL

        Args:
            track_url: SoundCloud track URL

        Returns:
            Thumbnail URL or None
        """
        if not track_url:
            return None

        try:
            # Use oEmbed API
            oembed_url = f"https://soundcloud.com/oembed?url={track_url}&format=json"
            response = requests.get(oembed_url, timeout=10)

            if response.status_code == 200:
                data = response.json()
                thumbnail_url = data.get('thumbnail_url')
                if thumbnail_url:
                    logger.info(f"Successfully fetched SoundCloud thumbnail")
                    return thumbnail_url
        except Exception as e:
            logger.warning(f"Failed to fetch SoundCloud thumbnail: {e}")

        return None

    @staticmethod
    async def get_zing_thumbnail(song_url: str) -> Optional[str]:
        """
        Get Zing MP3 thumbnail from song URL

        Args:
            song_url: Zing MP3 song URL

        Returns:
            Thumbnail URL or None
        """
        if not song_url:
            return None

        try:
            # Fetch the song page
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(song_url, headers=headers, timeout=10)

            if response.status_code == 200:
                # Parse HTML to extract thumbnail
                # Zing MP3 typically stores thumbnail in specific meta tags or JSON data
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, 'html.parser')

                # Try to find thumbnail in different locations
                # Method 1: og:image meta tag
                og_image = soup.find('meta', property='og:image')
                if og_image and og_image.get('content'):
                    thumbnail_url = og_image.get('content')
                    logger.info(f"Successfully fetched Zing MP3 thumbnail from og:image")
                    return thumbnail_url

                # Method 2: json-LD script
                json_ld = soup.find('script', type='application/ld+json')
                if json_ld:
                    import json
                    data = json.loads(json_ld.string)
                    if 'image' in data:
                        thumbnail_url = data['image']
                        logger.info(f"Successfully fetched Zing MP3 thumbnail from json-ld")
                        return thumbnail_url

                # Method 3: Look for thumbnail in specific div
                thumbnail_div = soup.find('div', class_=re.compile(r'.*thumbnail.*', re.I))
                if thumbnail_div and thumbnail_div.get('data-src'):
                    return thumbnail_div.get('data-src')

                # Method 4: Check for img tag with specific class
                img_tag = soup.find('img', class_=re.compile(r'.*thumb.*', re.I))
                if img_tag and img_tag.get('src'):
                    return img_tag.get('src')

        except Exception as e:
            logger.warning(f"Failed to fetch Zing MP3 thumbnail: {e}")

        return None

    @staticmethod
    async def fetch_thumbnail(source: str, source_id: str, url: Optional[str] = None) -> Optional[str]:
        """
        Main method to fetch thumbnail from any source

        Args:
            source: Music source (youtube, spotify, soundcloud, zing)
            source_id: Unique ID from the source
            url: Original URL (optional, for some sources)

        Returns:
            Thumbnail URL or None
        """
        logger.info(f"Fetching thumbnail for {source} - {source_id}")

        if source == 'youtube':
            return await ThumbnailService.get_youtube_thumbnail(source_id)

        elif source == 'spotify':
            return await ThumbnailService.get_spotify_thumbnail(source_id)

        elif source == 'soundcloud':
            return await ThumbnailService.get_soundcloud_thumbnail(url or source_id)

        elif source == 'zing':
            return await ThumbnailService.get_zing_thumbnail(url or source_id)

        else:
            logger.warning(f"Unknown source: {source}")
            return None


# Global instance
thumbnail_service = ThumbnailService()
