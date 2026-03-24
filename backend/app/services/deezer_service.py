"""
Deezer Music Service - Fetches music data from Deezer API

Deezer API is free and doesn't require authentication for basic operations.
API Documentation: https://developers.deezer.com/api
"""

import requests
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class DeezerService:
    """
    Service for interacting with Deezer Music API.

    Features:
    - Search songs/tracks
    - Get Top Charts by country
    - Get track details
    - No authentication required for basic operations
    """

    DEEZER_API_BASE = "https://api.deezer.com"

    def __init__(self):
        """Initialize Deezer service"""
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'MoodVibe Creator/1.0'
        })

    async def search_tracks(
        self,
        query: str,
        limit: int = 20,
        index: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Search for tracks on Deezer.

        Args:
            query: Search query string
            limit: Maximum number of results (default: 20, max: 100)
            index: Offset for pagination (default: 0)

        Returns:
            List of track dictionaries with metadata

        API: GET /search/track
        """
        try:
            url = f"{self.DEEZER_API_BASE}/search/track"
            params = {
                'q': query,
                'limit': min(limit, 100),  # Max 100 per API
                'index': index
            }

            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extract tracks from response
            tracks = []
            for track in data.get('data', []):
                tracks.append({
                    'track_id': track.get('id'),
                    'name': track.get('title'),
                    'artist': track.get('artist', {}).get('name', ''),
                    'album': track.get('album', {}).get('title', ''),
                    'duration': track.get('duration', 0),  # seconds
                    'preview_url': track.get('preview'),
                    'images': self._extract_images(track),
                    'external_urls': {
                        'deezer': track.get('link'),
                        'share': track.get('share')
                    },
                    'popularity': track.get('rank', 0),  # Deezer rank (0-100)
                    'available': True
                })

            logger.info(f"Deezer search '{query}' returned {len(tracks)} tracks")
            return tracks

        except Exception as e:
            logger.error(f"Deezer search error: {e}")
            return []

    async def get_top_chart(
        self,
        country: str = "VN",
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get top chart for a specific country.

        Args:
            country: ISO 3166-1 alpha-2 country code (default: VN for Vietnam)
                    Common codes: VN, US, GB, FR, DE, JP, KR, CN
            limit: Maximum number of results (default: 50)

        Returns:
            List of track dictionaries with chart position

        API: GET /chart/{country}/tracks
        """
        try:
            url = f"{self.DEEZER_API_BASE}/chart/{country}/tracks"
            params = {
                'limit': min(limit, 100)
            }

            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extract tracks with position
            tracks = []
            for idx, track in enumerate(data.get('data', {}), 1):
                tracks.append({
                    'position': idx,
                    'track_id': track.get('id'),
                    'name': track.get('title'),
                    'artist': track.get('artist', {}).get('name', ''),
                    'album': track.get('album', {}).get('title', ''),
                    'duration': track.get('duration', 0),
                    'preview_url': track.get('preview'),
                    'images': self._extract_images(track),
                    'external_urls': {
                        'deezer': track.get('link')
                    },
                    'popularity': track.get('rank', 0),
                    'chart_position': idx
                })

            logger.info(f"Deezer top {country} chart returned {len(tracks)} tracks")
            return tracks

        except Exception as e:
            logger.error(f"Deezer chart error: {e}")
            return []

    async def get_track_by_id(
        self,
        track_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Get detailed track information by ID.

        Args:
            track_id: Deezer track ID

        Returns:
            Track dictionary with full details

        API: GET /track/{id}
        """
        try:
            url = f"{self.DEEZER_API_BASE}/track/{track_id}"

            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            track = response.json()

            return {
                'track_id': track.get('id'),
                'name': track.get('title'),
                'artist': track.get('artist', {}).get('name', ''),
                'album': track.get('album', {}).get('title', ''),
                'duration': track.get('duration', 0),
                'preview_url': track.get('preview'),
                'images': self._extract_images(track),
                'external_urls': {
                    'deezer': track.get('link')
                },
                'popularity': track.get('rank', 0),
                'available': track.get('readable', True)
            }

        except Exception as e:
            logger.error(f"Deezer get track {track_id} error: {e}")
            return None

    def _extract_images(self, track: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Extract images from track data in different sizes.

        Deezer provides cover art in multiple sizes through the album.

        Args:
            track: Track data from API

        Returns:
            List of image dictionaries with URL and size
        """
        images = []

        # Get album cover
        album = track.get('album', {})
        if album:
            cover_url = album.get('cover', '')
            if cover_url:
                # Deezer uses size suffixes: /cover/, /cover_medium/, /cover_big/
                images.append({
                    'url': cover_url.replace('/cover/', '/cover_big/'),  # 500x500
                    'width': 500,
                    'height': 500,
                    'size': 'large'
                })
                images.append({
                    'url': cover_url.replace('/cover/', '/cover_medium/'),  # 250x250
                    'width': 250,
                    'height': 250,
                    'size': 'medium'
                })
                images.append({
                    'url': cover_url,  # 120x120
                    'width': 120,
                    'height': 120,
                    'size': 'small'
                })

        # Get artist image as fallback
        artist = track.get('artist', {})
        if artist and artist.get('picture'):
            images.append({
                'url': artist.get('picture', ''),
                'width': 500,
                'height': 500,
                'size': 'artist_large'
            })

        return images

    def get_health_status(self) -> Dict[str, Any]:
        """
        Get health status of Deezer service.

        Returns:
            Dictionary with service status and configuration
        """
        try:
            # Test API with a simple request
            response = self.session.get(
                f"{self.DEEZER_API_BASE}/chart/VN/tracks",
                params={'limit': 1},
                timeout=5
            )

            is_available = response.status_code == 200

            return {
                'configured': True,  # No config needed
                'available': is_available,
                'requires_auth': False,
                'rate_limit': 'Unlimited (no official limit)',
                'description': 'Deezer API (free, no auth required)'
            }

        except Exception as e:
            return {
                'configured': True,
                'available': False,
                'error': str(e),
                'description': 'Deezer API'
            }


# Global instance
deezer_service = DeezerService()
