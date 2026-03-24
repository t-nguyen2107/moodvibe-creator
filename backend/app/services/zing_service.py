"""
Zing MP3 Integration Service

Provides search and chart functionality for Zing MP3 (Vietnam's popular music platform).
Uses web scraping with BeautifulSoup4.

Features:
- Search Vietnamese songs
- Get Zing Top 100 Vietnam chart
- Extract song metadata
- Graceful fallback if scraping fails
"""

import requests
from bs4 import BeautifulSoup
import logging
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import re
from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)


class ZingService:
    """
    Zing MP3 integration service.

    Handles web scraping to search and retrieve chart data from Zing MP3.
    Implements caching and graceful error handling.
    """

    def __init__(self):
        """Initialize Zing MP3 service."""
        self.base_url = "https://zingmp3.vn"
        self.api_url = "https://zingmp3.vn/api"
        self._cache: Dict[str, tuple[Any, datetime]] = {}
        self._cache_ttl = timedelta(hours=6)  # Cache for 6 hours

        # User agent to avoid blocking
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://zingmp3.vn/'
        }

        logger.info("Zing MP3 service initialized")

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
        logger.info("Zing MP3 cache cleared")

    async def _make_request(self, url: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """
        Make HTTP request to Zing MP3 API with error handling and retry logic.

        Args:
            url: API endpoint URL
            params: Query parameters

        Returns:
            JSON response as dictionary or None if failed
        """
        max_retries = 3
        retry_delay = 2  # seconds

        for attempt in range(max_retries):
            try:
                # Run in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: requests.get(url, params=params, headers=self.headers, timeout=10)
                )

                if response.status_code == 200:
                    try:
                        return response.json()
                    except json.JSONDecodeError:
                        logger.error(f"Invalid JSON response from {url}")
                        return None
                else:
                    logger.warning(f"Request failed with status {response.status_code}, attempt {attempt + 1}/{max_retries}")

            except requests.exceptions.RequestException as e:
                logger.error(f"Request error on attempt {attempt + 1}/{max_retries}: {str(e)}")

            # Exponential backoff before retry
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay * (2 ** attempt))

        logger.error(f"Failed to fetch data from {url} after {max_retries} attempts")
        return None

    async def search_songs(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Search for songs on Zing MP3.

        Args:
            query: Search query string
            limit: Maximum number of results (default: 20)

        Returns:
            List of song dictionaries with metadata:
            - song_id: Zing MP3 song ID
            - title: Song title
            - artists: Artist name(s)
            - thumbnail: Album cover URL
            - duration: Duration in seconds
            - streaming_url: Direct streaming URL (if available)
            - zing_url: Zing MP3 page URL

        Example:
            >>> results = await zing_service.search_songs("nhạc việt pop", limit=10)
            >>> print(results[0]['title'], results[0]['artists'])
        """
        try:
            # Check cache first
            cache_key = f"search:{query}:{limit}"
            cached_results = self._get_from_cache(cache_key)
            if cached_results:
                logger.info(f"Returning cached search results for: {query}")
                return cached_results

            # Build API request
            # Note: Zing MP3 API structure may change, this is based on current implementation
            url = f"{self.api_url}/search"
            params = {
                'q': query,
                'type': 'song',
                'count': limit
            }

            # Make request
            data = await self._make_request(url, params)

            if not data:
                logger.warning(f"No search results for: {query}")
                return []

            # Parse response
            songs = []
            items = data.get('data', {}).get('items', []) if 'data' in data else data.get('items', [])

            for item in items[:limit]:
                try:
                    song_data = {
                        'song_id': item.get('encodeId', ''),
                        'title': item.get('title', ''),
                        'artists': ', '.join([artist.get('name', '') for artist in item.get('artists', [])]),
                        'thumbnail': item.get('thumbnail', ''),
                        'duration': item.get('duration', 0),
                        'streaming_url': '',  # Will be filled separately if needed
                        'zing_url': f"{self.base_url}/bai-hat/{item.get('link', '')}"
                    }
                    songs.append(song_data)
                except Exception as e:
                    logger.error(f"Error parsing song item: {str(e)}")
                    continue

            # Cache results
            self._set_cache(cache_key, songs)
            logger.info(f"Found {len(songs)} songs for query: {query}")

            return songs

        except Exception as e:
            logger.error(f"Zing MP3 search error: {str(e)}")
            return []

    async def get_top_100_vietnam(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get Zing MP3 Top 100 Vietnam chart.

        Returns the current Top 100 most popular songs in Vietnam.

        Args:
            limit: Maximum number of results (default: 100)

        Returns:
            List of song dictionaries with chart position:
            - position: Chart position (1-100)
            - song_id: Zing MP3 song ID
            - title: Song title
            - artists: Artist name(s)
            - thumbnail: Album cover URL
            - duration: Duration in seconds
            - zing_url: Zing MP3 page URL

        Example:
            >>> top_100 = await zing_service.get_top_100_vietnam()
            >>> print(f"#{top_100[0]['position']}: {top_100[0]['title']}")
        """
        try:
            # Check cache first
            cache_key = "chart:top_100_vietnam"
            cached_results = self._get_from_cache(cache_key)
            if cached_results:
                logger.info("Returning cached Top 100 Vietnam chart")
                return cached_results

            # Zing MP3 Top 100 chart URL
            url = f"{self.api_url}/chart/top-100"

            # Make request
            data = await self._make_request(url)

            if not data:
                logger.warning("Failed to fetch Top 100 chart")
                return []

            # Parse response
            songs = []
            items = data.get('data', {}).get('items', []) if 'data' in data else data.get('items', [])

            for idx, item in enumerate(items[:limit], start=1):
                try:
                    song_data = {
                        'position': idx,
                        'song_id': item.get('encodeId', ''),
                        'title': item.get('title', ''),
                        'artists': ', '.join([artist.get('name', '') for artist in item.get('artists', [])]),
                        'thumbnail': item.get('thumbnail', ''),
                        'duration': item.get('duration', 0),
                        'zing_url': f"{self.base_url}/bai-hat/{item.get('link', '')}"
                    }
                    songs.append(song_data)
                except Exception as e:
                    logger.error(f"Error parsing chart item: {str(e)}")
                    continue

            # Cache results
            self._set_cache(cache_key, songs)
            logger.info(f"Retrieved Top 100 Vietnam chart: {len(songs)} songs")

            return songs

        except Exception as e:
            logger.error(f"Error fetching Top 100 chart: {str(e)}")
            return []

    async def get_real_trending(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get Zing MP3 Real Trending chart (most trending songs).

        Args:
            limit: Maximum number of results (default: 50)

        Returns:
            List of song dictionaries with chart position (same format as get_top_100_vietnam)
        """
        try:
            # Check cache first
            cache_key = "chart:real_trending"
            cached_results = self._get_from_cache(cache_key)
            if cached_results:
                logger.info("Returning cached Real Trending chart")
                return cached_results

            # Zing MP3 Real Trending URL
            url = f"{self.api_url}/chart/real-trending-song"

            # Make request
            data = await self._make_request(url)

            if not data:
                logger.warning("Failed to fetch Real Trending chart")
                return []

            # Parse response
            songs = []
            items = data.get('data', {}).get('items', []) if 'data' in data else data.get('items', [])

            for idx, item in enumerate(items[:limit], start=1):
                try:
                    song_data = {
                        'position': idx,
                        'song_id': item.get('encodeId', ''),
                        'title': item.get('title', ''),
                        'artists': ', '.join([artist.get('name', '') for artist in item.get('artists', [])]),
                        'thumbnail': item.get('thumbnail', ''),
                        'duration': item.get('duration', 0),
                        'zing_url': f"{self.base_url}/bai-hat/{item.get('link', '')}"
                    }
                    songs.append(song_data)
                except Exception as e:
                    logger.error(f"Error parsing trending item: {str(e)}")
                    continue

            # Cache results
            self._set_cache(cache_key, songs)
            logger.info(f"Retrieved Real Trending chart: {len(songs)} songs")

            return songs

        except Exception as e:
            logger.error(f"Error fetching Real Trending chart: {str(e)}")
            return []

    async def get_song_detail(self, song_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed song information by Zing MP3 song ID.

        Args:
            song_id: Zing MP3 song encode ID

        Returns:
            Dictionary with detailed song information or None if not found
        """
        try:
            # Check cache first
            cache_key = f"song:{song_id}"
            cached_result = self._get_from_cache(cache_key)
            if cached_result:
                logger.info(f"Returning cached song data for: {song_id}")
                return cached_result

            # Get song detail URL
            url = f"{self.api_url}/song/detail/{song_id}"

            # Make request
            data = await self._make_request(url)

            if not data:
                logger.warning(f"Failed to fetch song details for: {song_id}")
                return None

            # Parse response
            item = data.get('data', {}) if 'data' in data else data

            song_data = {
                'song_id': item.get('encodeId', ''),
                'title': item.get('title', ''),
                'artists': ', '.join([artist.get('name', '') for artist in item.get('artists', [])]),
                'album': item.get('album', {}).get('name', ''),
                'thumbnail': item.get('thumbnail', ''),
                'duration': item.get('duration', 0),
                'release_date': item.get('releaseDate', ''),
                'zing_url': f"{self.base_url}/bai-hat/{item.get('link', '')}"
            }

            # Cache result
            self._set_cache(cache_key, song_data)
            logger.info(f"Retrieved song details for: {song_id}")

            return song_data

        except Exception as e:
            logger.error(f"Error fetching song {song_id}: {str(e)}")
            return None

    def get_health_status(self) -> Dict[str, Any]:
        """
        Get health status of Zing MP3 service.

        Returns:
            Dictionary with service status information
        """
        return {
            'configured': True,
            'cache_size': len(self._cache),
            'cache_ttl_hours': self._cache_ttl.total_seconds() / 3600,
            'base_url': self.base_url
        }


# Global instance
zing_service = ZingService()
