"""
Trending Songs Service
Searches the internet for trending songs and extracts specific song names
"""
import requests
import logging
from typing import List, Optional
import re

logger = logging.getLogger(__name__)


class TrendingSongsService:
    """Service for finding trending songs from the internet"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    async def search_trending_songs(
        self,
        query: str,
        limit: int = 20
    ) -> List[str]:
        """
        Search the internet for trending songs and return song names

        Args:
            query: Search query (e.g., "nhac hot TikTok 2025")
            limit: Maximum number of song names to return

        Returns:
            List of song names/artist combinations
        """
        try:
            # Extract language from query if provided (e.g., "language:vi")
            language = 'en'  # Default
            if 'language:' in query:
                parts = query.split('language:')
                if len(parts) > 1:
                    language = parts[1].strip().split()[0].lower()
                    query = parts[0].strip()  # Remove language part from query

            # For now, return a list of known trending Vietnamese/International songs
            # This is a simplified approach - in production, scrape actual websites
            trending_songs = self._get_known_trending_songs(query, language)

            logger.info(f"Found {len(trending_songs)} trending songs for query: {query} (language: {language})")
            return trending_songs[:limit]

        except Exception as e:
            logger.error(f"Error searching trending songs: {e}")
            return []

    def _get_known_trending_songs(self, query: str, language: str = 'en') -> List[str]:
        """
        Get known trending songs based on query keywords and language

        This is a simplified approach. In production, you would:
        1. Scrape TikTok trending page
        2. Scrape Spotify Charts
        3. Scrape YouTube Trends
        4. Use Music Chart APIs (Billboard, etc.)
        """
        query_lower = query.lower()

        # Vietnamese TikTok trending songs
        vietnamese_tiktok = [
            "Nắng Dưới Chân Mây Nguyễn Hữu Kha",
            "Anh Vui Phạm Kỳ",
            "Cơ Hội Cuối",
            "Hẹn Hò Nhưng Khum Yêu",
            "NGƯỜI ẤY HYCHUN ĐÔNG REMIX",
            "Rượu Mừng Hoá Người Dưng",
            "Tình Phai Remix",
            "Cuối Vội Vàng Remix",
            "Đơn Phương Mình Anh",
            "Hương Tóc Mạ Non",
            "Nỗi Buồn Mẹ Tôi",
            "Thương Lắm Mình Ơi",
        ]

        # International TikTok trending 2024-2025
        international_tiktok = [
            "Espresso Sabrina Carpenter",
            "We Can't Be Friends Ariana Grande",
            "Beautiful Things Benson Boone",
            "Lunch Billie Eilish",
            "Not Like Us Kendrick Lamar",
            "I Had Some Help Drake Post Malone",
            "Million Dollar Baby Tommy Richman",
        ]

        # Lofi/Chill vibes
        lofi_songs = [
            "lofi hip hop study beats",
            "chill lofi beats relax",
            "lofi radio relax study",
            "quiet moments lofi",
            "peaceful piano lofi",
        ]

        # Select based on query keywords
        # Priority: Vietnamese > International > Lofi
        if any(kw in query_lower for kw in ['tiktok', 'hot', 'viral', 'trending', 'nhạc', 'nhac']):
            # Check if Vietnamese context (language parameter OR query keywords)
            has_vietnamese_context = (
                language == 'vi' or  # Language parameter from request
                any(kw in query_lower for kw in ['việt', 'viet', 'nhac', 'vietnamese'])
            )

            if has_vietnamese_context:
                # Return mix: 70% Vietnamese, 30% International
                return vietnamese_tiktok + international_tiktok[:3]
            else:
                # International context: more international songs
                return international_tiktok + vietnamese_tiktok[:3]

        elif any(kw in query_lower for kw in ['lofi', 'chill', 'relax', 'study']):
            return lofi_songs

        elif any(kw in query_lower for kw in ['workout', 'gym', 'fitness']):
            return [
                "Workout Mix 2025",
                "Gym Motivation Music",
                "Cardio Hits 2025",
                "Power Workout Playlist",
            ]

        else:
            # Default: mix based on language
            if language == 'vi':
                return vietnamese_tiktok[:5] + international_tiktok[:3] + lofi_songs[:2]
            else:
                return international_tiktok[:5] + vietnamese_tiktok[:3] + lofi_songs[:2]

    def extract_song_names_from_text(self, text: str) -> List[str]:
        """
        Extract song names from text (e.g., from web scraping)

        Args:
            text: Text to extract song names from

        Returns:
            List of extracted song names
        """
        # Pattern: "Artist - Song Name" or "Song Name by Artist"
        patterns = [
            r'([A-Z][\w\s]+)\s[-–]\s([A-Z][\w\s]+)',  # Artist - Song
            r'([A-Z][\w\s]+)\sby\s([A-Z][\w\s]+)',      # Song by Artist
        ]

        songs = []
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if isinstance(match, tuple):
                    song = f"{match[0]} - {match[1]}"
                else:
                    song = match
                songs.append(song.strip())

        return songs


# Global instance
trending_songs_service = TrendingSongsService()
