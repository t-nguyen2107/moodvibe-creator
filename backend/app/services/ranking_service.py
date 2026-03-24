"""
Intelligent Music Ranking Service

Combines multiple signals to rank search results:
1. Trending Score: Chart positions (Spotify, Zing)
2. Relevance Score: AI confidence for mood/genre matching
3. Popularity Score: Stream counts, likes, plays
4. Freshness Score: New releases get boost
5. Quality Score: Audio quality, completeness

Final Score = Weighted combination of all signals
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict

from app.schemas.search import SongResult, AIParsedQuery, SpotifyChartTrack, ZingChartTrack

logger = logging.getLogger(__name__)


class MusicRankingService:
    """
    Intelligent ranking service for music search results.

    Scoring Algorithm:
    - Trending (40%): Chart positions, recent popularity
    - Relevance (30%): AI confidence in mood/genre match
    - Popularity (20%): Stream counts, engagement
    - Freshness (10%): Release date recency bonus

    Final score: 0.0 to 1.0
    """

    def __init__(self):
        # Scoring weights (adjustable)
        self.weights = {
            'trending': 0.40,    # Chart performance
            'relevance': 0.30,   # AI matching confidence
            'popularity': 0.20,  # Overall popularity
            'freshness': 0.10    # New release bonus
        }

        # Chart data cache (in production, use Redis)
        self.spotify_charts: Dict[str, List[SpotifyChartTrack]] = {}
        self.zing_charts: Dict[str, List[ZingChartTrack]] = {}

    def update_charts(
        self,
        spotify_tracks: Optional[List[SpotifyChartTrack]] = None,
        zing_tracks: Optional[List[ZingChartTrack]] = None
    ):
        """Update chart data for ranking"""
        if spotify_tracks:
            self.spotify_charts['vietnam'] = spotify_tracks
            logger.info(f"Updated {len(spotify_tracks)} Spotify chart tracks")

        if zing_tracks:
            self.zing_charts['vietnam'] = zing_tracks
            logger.info(f"Updated {len(zing_tracks)} Zing chart tracks")

    def rank_songs(
        self,
        songs: List[SongResult],
        ai_parsed_query: Optional[AIParsedQuery] = None,
        limit: int = 20
    ) -> List[SongResult]:
        """
        Rank songs using multi-factor scoring algorithm.

        Args:
            songs: List of songs to rank
            ai_parsed_query: AI-parsed query with confidence scores
            limit: Max number of results to return

        Returns:
            Ranked list of songs (highest score first)
        """
        if not songs:
            return []

        # Calculate scores for each song
        scored_songs = []
        for song in songs:
            score = self._calculate_song_score(song, ai_parsed_query)
            scored_songs.append((song, score))

        # Sort by score (descending)
        scored_songs.sort(key=lambda x: x[1], reverse=True)

        # Return top N songs
        ranked_songs = [song for song, score in scored_songs[:limit]]

        logger.info(f"Ranked {len(ranked_songs)} songs (top score: {scored_songs[0][1]:.3f})")
        return ranked_songs

    def _calculate_song_score(
        self,
        song: SongResult,
        ai_parsed_query: Optional[AIParsedQuery]
    ) -> float:
        """
        Calculate composite score for a single song.

        Score = weighted sum of all factors:
        - Trending: Chart position, recent popularity
        - Relevance: AI confidence in mood/genre match
        - Popularity: Stream counts, engagement
        - Freshness: Release date recency
        """
        scores = {
            'trending': self._calculate_trending_score(song),
            'relevance': self._calculate_relevance_score(song, ai_parsed_query),
            'popularity': self._calculate_popularity_score(song),
            'freshness': self._calculate_freshness_score(song)
        }

        # Weighted sum
        final_score = sum(
            scores[factor] * self.weights[factor]
            for factor in scores
        )

        return final_score

    def _calculate_trending_score(self, song: SongResult) -> float:
        """
        Calculate trending score based on chart positions.

        Scoring:
        - Top 10: 1.0 (gold tier)
        - Top 25: 0.8 (silver tier)
        - Top 50: 0.6 (bronze tier)
        - Not in chart: 0.2 (baseline)
        """
        # Check Spotify charts
        if song.source == 'spotify':
            for chart_type, tracks in self.spotify_charts.items():
                for track in tracks:
                    if track.track_id == song.source_id:
                        position = track.position
                        if position <= 10:
                            return 1.0
                        elif position <= 25:
                            return 0.8
                        elif position <= 50:
                            return 0.6
                        else:
                            return 0.4

        # Check Zing charts
        if song.source == 'zing':
            for chart_type, tracks in self.zing_charts.items():
                for track in tracks:
                    if track.song_id == song.source_id:
                        position = track.position
                        if position <= 10:
                            return 1.0
                        elif position <= 25:
                            return 0.8
                        elif position <= 50:
                            return 0.6
                        else:
                            return 0.4

        # Source priority (YouTube/SoundCloud more popular)
        source_bonus = {
            'youtube': 0.3,
            'soundcloud': 0.25,
            'spotify': 0.2,
            'zing': 0.15,
            'pixabay': 0.1,
            'fma': 0.1
        }

        return 0.2 + source_bonus.get(song.source, 0.1)

    def _calculate_relevance_score(
        self,
        song: SongResult,
        ai_parsed_query: Optional[AIParsedQuery]
    ) -> float:
        """
        Calculate relevance score based on AI confidence.

        If AI parsed query with high confidence, boost matching songs.
        """
        if not ai_parsed_query:
            return 0.5  # Neutral if no AI parsing

        # Extract AI confidence scores
        mood_conf = ai_parsed_query.mood_confidence or 0.0
        genre_conf = ai_parsed_query.genre_confidence or 0.0
        activity_conf = ai_parsed_query.activity_confidence or 0.0

        # Average confidence
        avg_confidence = (mood_conf + genre_conf + activity_conf) / 3

        # Boost score based on AI confidence
        if avg_confidence > 0.8:
            return 1.0  # High confidence
        elif avg_confidence > 0.6:
            return 0.8  # Good confidence
        elif avg_confidence > 0.4:
            return 0.6  # Moderate confidence
        else:
            return 0.4  # Low confidence

    def _calculate_popularity_score(self, song: SongResult) -> float:
        """
        Calculate popularity score.

        For now, use heuristics based on source and metadata.
        In production, use actual stream counts.
        """
        # Source popularity baseline
        source_popularity = {
            'youtube': 0.8,
            'spotify': 0.9,
            'soundcloud': 0.7,
            'zing': 0.6,
            'pixabay': 0.4,
            'fma': 0.5
        }

        base_score = source_popularity.get(song.source, 0.5)

        # Duration bonus (prefer 3-5 minute songs)
        if song.duration:
            duration_min = song.duration / 60
            if 3 <= duration_min <= 5:
                base_score += 0.1  # Perfect length
            elif 2 <= duration_min <= 6:
                base_score += 0.05  # Good length

        return min(base_score, 1.0)

    def _calculate_freshness_score(self, song: SongResult) -> float:
        """
        Calculate freshness score (bonus for newer songs).

        For now, use source heuristics.
        In production, use release_date from Spotify API.
        """
        # Sources tend to have newer content
        source_freshness = {
            'youtube': 0.7,
            'spotify': 0.8,
            'soundcloud': 0.6,
            'zing': 0.9,  # Vietnamese charts very fresh
            'pixabay': 0.5,
            'fma': 0.5
        }

        return source_freshness.get(song.source, 0.5)


# Global service instance
music_ranking_service = MusicRankingService()
