"""
Spotify Web API Integration Service

Provides search and chart functionality for Spotify music data.
Uses Spotify Client Credentials Flow (no user authentication required).

Features:
- Search tracks, albums, playlists
- Get Vietnam Top 50 and Viral 50 charts
- Track metadata (popularity, release date, available markets)
- Caching with 24-hour TTL
"""

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import logging
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)


class SpotifyService:
    """
    Spotify Web API integration service.

    Handles authentication, search, and chart retrieval from Spotify.
    Implements caching to reduce API calls and respect rate limits.
    """

    def __init__(self):
        """Initialize Spotify service with client credentials."""
        self.client_id = getattr(settings, 'SPOTIFY_CLIENT_ID', None)
        self.client_secret = getattr(settings, 'SPOTIFY_CLIENT_SECRET', None)
        self.spotipy_client: Optional[spotipy.Spotify] = None
        self._cache: Dict[str, tuple[Any, datetime]] = {}
        self._cache_ttl = timedelta(hours=getattr(settings, 'CACHE_TTL_CHARTS', 86400) // 3600)

        # Initialize client if credentials are available
        if self.client_id and self.client_secret:
            try:
                auth_manager = SpotifyClientCredentials(
                    client_id=self.client_id,
                    client_secret=self.client_secret
                )
                self.spotipy_client = spotipy.Spotify(auth_manager=auth_manager)
                logger.info("Spotify client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Spotify client: {str(e)}")
        else:
            logger.warning("Spotify credentials not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env")

    def _is_configured(self) -> bool:
        """Check if Spotify service is properly configured."""
        return self.spotipy_client is not None

    def _get_from_cache(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired."""
        if key in self._cache:
            value, timestamp = self._cache[key]
            if datetime.now() - timestamp < self._cache_ttl:
                return value
            else:
                # Remove expired entry
                del self._cache[key]
        return None

    def _set_cache(self, key: str, value: Any) -> None:
        """Set value in cache with current timestamp."""
        self._cache[key] = (value, datetime.now())

    def _clear_cache(self) -> None:
        """Clear all cached data."""
        self._cache.clear()
        logger.info("Spotify cache cleared")

    async def search_tracks(
        self,
        query: str,
        limit: int = 20,
        market: str = "VN"
    ) -> List[Dict[str, Any]]:
        """
        Search for tracks on Spotify.

        Args:
            query: Search query string
            limit: Maximum number of results (default: 20, max: 50)
            market: ISO 3166-1 alpha-2 country code (default: VN for Vietnam)

        Returns:
            List of track dictionaries with metadata:
            - track_id: Spotify track ID
            - name: Track name
            - artist: Artist name(s)
            - album: Album name
            - popularity: Popularity score (0-100)
            - release_date: Release date
            - preview_url: 30-second preview URL
            - external_urls: Spotify URL
            - available_markets: List of countries where available
            - duration_ms: Duration in milliseconds
            - images: Album cover images

        Example:
            >>> results = await spotify_service.search_tracks("nhạc việt", limit=10)
            >>> print(results[0]['name'], results[0]['artist'])
        """
        if not self._is_configured():
            logger.warning("Spotify not configured, returning empty results")
            return []

        try:
            # Check cache first
            cache_key = f"search:{query}:{limit}:{market}"
            cached_results = self._get_from_cache(cache_key)
            if cached_results:
                logger.info(f"Returning cached search results for: {query}")
                return cached_results

            # Search Spotify (run in thread pool to avoid blocking)
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                lambda: self.spotipy_client.search(
                    q=query,
                    type='track',
                    limit=limit,
                    market=market
                )
            )

            # Extract and format track data
            tracks = []
            for item in results.get('tracks', {}).get('items', []):
                track_data = {
                    'track_id': item.get('id', ''),
                    'name': item.get('name', ''),
                    'artist': ', '.join([artist.get('name', '') for artist in item.get('artists', [])]),
                    'album': item.get('album', {}).get('name', ''),
                    'popularity': item.get('popularity', 0),
                    'release_date': item.get('album', {}).get('release_date', ''),
                    'preview_url': item.get('preview_url', ''),
                    'external_urls': item.get('external_urls', {}),
                    'available_markets': item.get('available_markets', []),
                    'duration_ms': item.get('duration_ms', 0),
                    'images': item.get('album', {}).get('images', [])
                }
                tracks.append(track_data)

            # Cache results
            self._set_cache(cache_key, tracks)
            logger.info(f"Found {len(tracks)} tracks for query: {query}")

            return tracks

        except Exception as e:
            logger.error(f"Spotify search error: {str(e)}")
            return []

    async def get_vietnam_top_50(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get Spotify Vietnam Top 50 chart.

        Returns the current Top 50 most popular tracks in Vietnam.

        Args:
            limit: Maximum number of results (default: 50)

        Returns:
            List of track dictionaries with chart position:
            - position: Chart position (1-50)
            - track_id: Spotify track ID
            - name: Track name
            - artist: Artist name(s)
            - album: Album name
            - popularity: Popularity score (0-100)
            - preview_url: 30-second preview URL
            - external_urls: Spotify URL

        Example:
            >>> top_50 = await spotify_service.get_vietnam_top_50()
            >>> print(f"#{top_50[0]['position']}: {top_50[0]['name']}")
        """
        if not self._is_configured():
            logger.warning("Spotify not configured, returning empty results")
            return []

        try:
            # Check cache first
            cache_key = "chart:vietnam_top_50"
            cached_results = self._get_from_cache(cache_key)
            if cached_results:
                logger.info("Returning cached Vietnam Top 50 chart")
                return cached_results

            # Vietnam Top 50 playlist ID
            playlist_id = "37i9dQZF1DX1vSST4Dey40"

            # Get playlist tracks
            loop = asyncio.get_event_loop()
            playlist = await loop.run_in_executor(
                None,
                lambda: self.spotipy_client.playlist(playlist_id)
            )

            # Extract track data with position
            tracks = []
            for idx, item in enumerate(playlist.get('tracks', {}).get('items', []), start=1):
                if idx > limit:
                    break

                track = item.get('track', {})
                track_data = {
                    'position': idx,
                    'track_id': track.get('id', ''),
                    'name': track.get('name', ''),
                    'artist': ', '.join([artist.get('name', '') for artist in track.get('artists', [])]),
                    'album': track.get('album', {}).get('name', ''),
                    'popularity': track.get('popularity', 0),
                    'preview_url': track.get('preview_url', ''),
                    'external_urls': track.get('external_urls', {}),
                    'duration_ms': track.get('duration_ms', 0),
                    'images': track.get('album', {}).get('images', [])
                }
                tracks.append(track_data)

            # Cache results
            self._set_cache(cache_key, tracks)
            logger.info(f"Retrieved Vietnam Top 50 chart: {len(tracks)} tracks")

            return tracks

        except Exception as e:
            logger.error(f"Error fetching Vietnam Top 50: {str(e)}")
            return []

    async def get_viral_vietnam(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get Spotify Viral 50 Vietnam chart.

        Returns the current Viral 50 most trending tracks in Vietnam.

        Args:
            limit: Maximum number of results (default: 50)

        Returns:
            List of track dictionaries with chart position (same format as get_vietnam_top_50)
        """
        if not self._is_configured():
            logger.warning("Spotify not configured, returning empty results")
            return []

        try:
            # Check cache first
            cache_key = "chart:viral_vietnam_50"
            cached_results = self._get_from_cache(cache_key)
            if cached_results:
                logger.info("Returning cached Viral Vietnam chart")
                return cached_results

            # Viral 50 Vietnam playlist ID
            playlist_id = "37i9dQZF1DX2NvT5JE8Gkd"

            # Get playlist tracks
            loop = asyncio.get_event_loop()
            playlist = await loop.run_in_executor(
                None,
                lambda: self.spotipy_client.playlist(playlist_id)
            )

            # Extract track data with position
            tracks = []
            for idx, item in enumerate(playlist.get('tracks', {}).get('items', []), start=1):
                if idx > limit:
                    break

                track = item.get('track', {})
                track_data = {
                    'position': idx,
                    'track_id': track.get('id', ''),
                    'name': track.get('name', ''),
                    'artist': ', '.join([artist.get('name', '') for artist in track.get('artists', [])]),
                    'album': track.get('album', {}).get('name', ''),
                    'popularity': track.get('popularity', 0),
                    'preview_url': track.get('preview_url', ''),
                    'external_urls': track.get('external_urls', {}),
                    'duration_ms': track.get('duration_ms', 0),
                    'images': track.get('album', {}).get('images', [])
                }
                tracks.append(track_data)

            # Cache results
            self._set_cache(cache_key, tracks)
            logger.info(f"Retrieved Viral Vietnam chart: {len(tracks)} tracks")

            return tracks

        except Exception as e:
            logger.error(f"Error fetching Viral Vietnam: {str(e)}")
            return []

    async def get_track_by_id(self, track_id: str, market: str = "VN") -> Optional[Dict[str, Any]]:
        """
        Get detailed track information by Spotify track ID.

        Args:
            track_id: Spotify track ID
            market: ISO 3166-1 alpha-2 country code (default: VN)

        Returns:
            Dictionary with detailed track information or None if not found
        """
        if not self._is_configured():
            logger.warning("Spotify not configured")
            return None

        try:
            # Check cache first
            cache_key = f"track:{track_id}:{market}"
            cached_result = self._get_from_cache(cache_key)
            if cached_result:
                logger.info(f"Returning cached track data for: {track_id}")
                return cached_result

            # Get track details
            loop = asyncio.get_event_loop()
            track = await loop.run_in_executor(
                None,
                lambda: self.spotipy_client.track(track_id, market=market)
            )

            track_data = {
                'track_id': track.get('id', ''),
                'name': track.get('name', ''),
                'artist': ', '.join([artist.get('name', '') for artist in track.get('artists', [])]),
                'album': track.get('album', {}).get('name', ''),
                'popularity': track.get('popularity', 0),
                'release_date': track.get('album', {}).get('release_date', ''),
                'preview_url': track.get('preview_url', ''),
                'external_urls': track.get('external_urls', {}),
                'available_markets': track.get('available_markets', []),
                'duration_ms': track.get('duration_ms', 0),
                'images': track.get('album', {}).get('images', [])
            }

            # Cache result
            self._set_cache(cache_key, track_data)
            logger.info(f"Retrieved track details for: {track_id}")

            return track_data

        except Exception as e:
            logger.error(f"Error fetching track {track_id}: {str(e)}")
            return None

    def get_health_status(self) -> Dict[str, Any]:
        """
        Get health status of Spotify service.

        Returns:
            Dictionary with service status information
        """
        return {
            'configured': self._is_configured(),
            'cache_size': len(self._cache),
            'cache_ttl_hours': self._cache_ttl.total_seconds() / 3600
        }


# Global instance
spotify_service = SpotifyService()
