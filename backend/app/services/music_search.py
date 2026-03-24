import yt_dlp
import requests
import logging
from typing import List, Optional, Union
from app.schemas.search import SongResult, AIParsedQuery
from app.config import MUSIC_SOURCES

# Import new music services
from app.services.spotify_service import spotify_service
from app.services.zing_service import zing_service
from app.services.deezer_service import deezer_service
from app.services.thumbnail_service import thumbnail_service
from app.services.ai_query_generator import ai_query_generator
from app.services.trending_songs_service import trending_songs_service

# Configure logging
logger = logging.getLogger(__name__)


class MusicSearchService:
    def __init__(self):
        self.sources = MUSIC_SOURCES

    async def search(
        self,
        query: Optional[str] = None,
        genre: Optional[str] = None,
        mood: Optional[str] = None,
        sources: Optional[List[str]] = None,
        limit: int = 50,
        royalty_free_only: bool = False,
        ai_parsed_query: Optional[AIParsedQuery] = None,
        language: str = "en"
    ) -> List[SongResult]:
        """
        Search music from multiple sources using AI-generated queries.

        NEW APPROACH:
        1. AI generates 5-10 optimized search queries
        2. Search all sources with all queries
        3. Collect ALL results (60+ songs)
        4. Rank by popularity/views/plays
        5. Return top N results

        Args:
            query: Raw search query
            genre: Music genre (backward compatibility)
            mood: Mood/theme (backward compatibility)
            sources: List of sources to search (youtube, soundcloud, pixabay, spotify, zing)
            limit: Maximum number of results to return
            royalty_free_only: Only return royalty-free music
            ai_parsed_query: AI-parsed query with enhanced parameters

        Returns:
            List of SongResult objects, ranked by popularity
        """
        if not query:
            return []

        # Step 0: Check if user wants trending songs - get song names from internet
        query_lower = query.lower()
        use_trending = any(kw in query_lower for kw in ['tiktok', 'hot', 'viral', 'trending', 'nhạc hot', 'top hits'])

        if use_trending:
            logger.info(f"Trending song search detected - getting trending songs from internet...")
            try:
                # Pass language to help determine regional trending songs
                trending_songs = await trending_songs_service.search_trending_songs(
                    query=f"{query} language:{language}",  # Include language in query
                    limit=15
                )
                if trending_songs:
                    logger.info(f"Found {len(trending_songs)} trending songs: {trending_songs[:3]}")
                    # Use these specific songs for search instead of variations
                    generated_queries = trending_songs
                else:
                    # Fallback to normal query generation
                    generated_queries = [query]
            except Exception as e:
                logger.warning(f"Trending search failed: {e}. Using normal search.")
                generated_queries = [query]
        else:
            # Normal search - use query generation logic
            generated_queries = [query]

        # If no sources specified, use all available
        if not sources:
            sources = self.sources

        # Convert ai_parsed_query to dict for query generator
        ai_parsing_dict = None
        if ai_parsed_query:
            ai_parsing_dict = {
                'mood': ai_parsed_query.mood,
                'genre': ai_parsed_query.genre,
                'era': ai_parsed_query.era,
                'language': ai_parsed_query.language,
                'activity': ai_parsed_query.activity,
                'trending': ai_parsed_query.trending,
            }

        # Step 1: Generate search queries
        # Already handled above in Step 0 (trending detection)

        # Detect if this is a specific song search (has song-specific patterns)
        if not use_trending:
            is_specific_song = any([
                ' - ' in query,  # "Artist - Song" format
                len(query.split()) <= 5,  # Short queries likely specific songs
                any(word in query.lower() for word in ['official', 'mv', 'remix', 'cover']),  # Music keywords
            ])

            if is_specific_song:
                # For specific songs, use exact query only - don't modify
                generated_queries = [query]
                logger.info(f"Specific song detected - using exact query: '{query}'")
            else:
                # For general searches, use variations
                generated_queries = [query]
                if ' ' in query and len(query.split()) > 3:
                    # Add variation without last word for longer queries only
                    words = query.split()
                    generated_queries.append(' '.join(words[:-1]))

                logger.info(f"Using {len(generated_queries)} queries for '{query}'")

        # Limit queries for trending searches (can be many)
        if use_trending:
            generated_queries = generated_queries[:10]  # Search up to 10 trending songs
        else:
            generated_queries = [query]  # OPTIMIZATION: Use only the main query for speed

        # Step 2: Search all sources with all queries (OPTIMIZED: Sequential but faster)
        all_results = []
        results_by_source = {source: [] for source in sources}

        # Calculate results per source
        # For trending: fewer results per query (since we have many queries)
        # For normal search: more results per query
        if use_trending:
            results_per_source_per_query = max(3, 20 // (len(sources) * len(generated_queries)))
        else:
            results_per_source_per_query = max(10, 35 // (len(sources) * len(generated_queries)))

        logger.info(f"Searching {len(sources)} sources with {len(generated_queries)} queries each ({results_per_source_per_query} results per source per query)...")
        logger.info(f"Query list: {generated_queries}")
        logger.info(f"Sources: {sources}")

        # OPTIMIZATION: Limit to first 2 queries maximum
        generated_queries = generated_queries[:2]

        for search_query in generated_queries:
            logger.info(f"  Searching with: '{search_query}'")

            # Search YouTube
            if "youtube" in sources:
                try:
                    logger.info(f"    Searching YouTube with: '{search_query}' (limit: {results_per_source_per_query})")
                    youtube_results = await self._search_youtube(search_query, results_per_source_per_query)
                    results_by_source["youtube"].extend(youtube_results)
                    logger.info(f"    YouTube: {len(youtube_results)} results")
                except Exception as e:
                    logger.warning(f"    YouTube search failed: {e}")

            # Search SoundCloud
            if "soundcloud" in sources:
                try:
                    soundcloud_results = await self._search_soundcloud(search_query, results_per_source_per_query)
                    results_by_source["soundcloud"].extend(soundcloud_results)
                    logger.info(f"    SoundCloud: {len(soundcloud_results)} results")
                except Exception as e:
                    logger.warning(f"    SoundCloud search failed: {e}")

            # Search Spotify
            if "spotify" in sources:
                try:
                    spotify_results = await self._search_spotify(search_query, results_per_source_per_query)
                    results_by_source["spotify"].extend(spotify_results)
                    logger.info(f"    Spotify: {len(spotify_results)} results")
                except Exception as e:
                    logger.warning(f"    Spotify search failed: {e}")

            # Search Zing MP3
            if "zing" in sources:
                try:
                    zing_results = await self._search_zing(search_query, results_per_source_per_query)
                    results_by_source["zing"].extend(zing_results)
                    logger.info(f"    Zing: {len(zing_results)} results")
                except Exception as e:
                    logger.warning(f"    Zing search failed: {e}")

            # Search Deezer
            if "deezer" in sources:
                try:
                    deezer_results = await self._search_deezer(search_query, results_per_source_per_query)
                    results_by_source["deezer"].extend(deezer_results)
                    logger.info(f"    Deezer: {len(deezer_results)} results")
                except Exception as e:
                    logger.warning(f"    Deezer search failed: {e}")

        # Step 3: Collect all results from all sources
        for source in sources:
            all_results.extend(results_by_source[source])

        logger.info(f"Total raw results collected: {len(all_results)}")

        # Step 4: Detect royalty-free songs from metadata
        # Check for common royalty-free keywords in title and description
        royalty_free_keywords = [
            'ncs', 'no copyright', 'no copyright sounds', 'royalty free', 'royalty-free',
            'copyright free', 'copyright-free', 'free music', 'free to use',
            'creative commons', 'cc license', 'attribution', 'non-commercial'
        ]

        def detect_royalty_free(song) -> bool:
            """Detect if song is likely royalty-free based on metadata"""
            if not song or not song.title:
                return False

            title_lower = song.title.lower()

            # Check if title contains royalty-free keywords
            for keyword in royalty_free_keywords:
                if keyword in title_lower:
                    return True

            # Additional heuristics for royalty-free detection
            # Songs from Pixabay or similar sources are usually royalty-free
            if song.source == 'pixabay':
                return True

            return False

        # Update is_royalty_free flag for all songs based on detection
        for song in all_results:
            if detect_royalty_free(song):
                song.is_royalty_free = True

        # Step 4.5: Filter by royalty-free if requested
        if royalty_free_only:
            rf_count = sum(1 for r in all_results if r.is_royalty_free)
            logger.info(f"Found {rf_count}/{len(all_results)} royalty-free songs in results")

            if rf_count == 0:
                # No royalty-free songs found, but return all with warning
                logger.warning(f"No royalty-free songs found. Returning all results with warning flag.")
                # Don't filter, just return all results (frontend will show warning)
            else:
                # Filter to only royalty-free songs
                all_results = [r for r in all_results if r.is_royalty_free]
                logger.info(f"Filtered to {len(all_results)} royalty-free songs only")

        # Step 5: Deduplicate results (same title + artist from different sources)
        all_results = self._deduplicate_results(all_results)
        logger.info(f"After deduplication: {len(all_results)}")

        # Step 6: Filter out unwanted content (mixes, playlists, radio)
        # EXCEPTION: Allow mixes for instrumental/background music
        exclude_keywords = ['mix', 'playlist', 'radio', 'lo-fi hip hop radio', 'lofi hip hop radio',
                           'best of', 'collection', 'compilation', 'megamix']

        instrumental_keywords = [
            'sleep', 'ambient', 'meditation', 'spa', 'massage', 'yoga', 'relax',
            'cafe', 'coffee', 'chill', 'lofi', 'study', 'work', 'focus', 'reading',
            'background', 'instrumental', 'piano', 'jazz', 'classical', 'nature',
            'soundtrack', 'game music', 'bm', 'nhã nhạc', 'thư giãn', 'ngủ'
        ]

        def is_instrumental_or_background(song) -> bool:
            """Check if song is instrumental/background music"""
            if not song or not song.title:
                return False
            title_lower = song.title.lower()
            return any(kw in title_lower for kw in instrumental_keywords)

        before_filter = len(all_results)
        all_results = [
            r for r in all_results
            if not any(kw in r.title.lower() for kw in exclude_keywords)
            or is_instrumental_or_background(r)  # Allow if instrumental
        ]
        filtered_keywords = before_filter - len(all_results)
        if filtered_keywords > 0:
            logger.info(f"Filtered out {filtered_keywords} songs with exclude keywords (instrumental exempt)")

        # Step 7: Filter by duration (max 15 minutes = 900 seconds)
        # EXCEPTION: Instrumental/background music allowed up to 3 hours (10800 seconds)
        before_duration_filter = len(all_results)
        all_results = [
            r for r in all_results
            if (r.duration is None or
                r.duration < 900 or  # < 15 minutes always OK
                (r.duration < 10800 and is_instrumental_or_background(r)))  # < 3 hours for instrumental
        ]
        filtered_count = before_duration_filter - len(all_results)
        if filtered_count > 0:
            logger.info(f"Filtered out {filtered_count} songs >= 15 minutes (instrumental allowed up to 3 hours)")
        logger.info(f"After all filters: {len(all_results)}")

        # Step 7: Rank by popularity/views/plays
        all_results = self._rank_by_popularity(all_results)
        logger.info(f"After ranking: {len(all_results)}")

        # Step 8: Return top N results
        return all_results[:limit]

    def _map_genre_for_search(self, genre: str) -> str:
        """
        Map AI-extracted genre to search-friendly terms.

        Args:
            genre: Genre extracted by AI

        Returns:
            Search-optimized genre string
        """
        genre_map = {
            "k-pop": "K-pop",
            "lo-fi": "lo-fi beats",
            "hip-hop": "hip hop",
            "r&b": "R&B",
            "electronic": "electronic music",
            "classical": "classical music"
        }
        return genre_map.get(genre.lower(), genre)

    async def _search_youtube(self, query: str, limit: int) -> List[SongResult]:
        """Search YouTube Music using yt-dlp (optimized for SPEED)"""
        try:
            ydl_opts = {
                'format': 'bestaudio/best',
                'quiet': True,
                'no_warnings': True,
                'extract_flat': True,  # FAST: Chỉ lấy metadata, không extract audio
                'playlistend': limit,
                'ignoreerrors': True,
                'skip_download': True,
                'socket_timeout': 10,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                search_results = ydl.extract_info(f"ytsearch{limit}:{query}", download=False)

            results = []
            entries = search_results.get('entries', []) if search_results else []
            logger.info(f"YouTube search for '{query}' returned {len(entries)} results")

            for entry in entries[:limit]:
                if not entry:
                    continue

                # Generate thumbnail URL directly (instant)
                video_id = entry.get('id', '')
                thumbnail_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg" if video_id else ''

                # Store the full URL for later extraction
                audio_url = entry.get('url', '') or entry.get('webpage_url', f"https://www.youtube.com/watch?v={video_id}")

                results.append(SongResult(
                    title=entry.get('title', ''),
                    artist=entry.get('artist') or entry.get('uploader', ''),
                    source='youtube',
                    source_id=entry.get('id', ''),
                    duration=entry.get('duration'),
                    audio_url=audio_url,  # Will extract on-demand
                    thumbnail_url=thumbnail_url,
                    is_royalty_free=False
                ))

            logger.info(f"YouTube search completed: {len(results)} results (fast mode)")
            return results

        except Exception as e:
            logger.error(f"YouTube search error: {str(e)}")
            return []

    async def _search_soundcloud(self, query: str, limit: int) -> List[SongResult]:
        """Search SoundCloud (optimized for speed)"""
        try:
            # Use extract_flat for fast search
            # Audio URL will be extracted on-demand when user clicks play
            ydl_opts = {
                'format': 'bestaudio/best',
                'quiet': True,
                'no_warnings': True,
                'extract_flat': True,  # FAST: Don't extract full info
                'skip_download': True,
                'max_results': limit,
                'socket_timeout': 8,  # OPTIMIZATION: Add 8s timeout
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                search_url = f"scsearch{limit}:{query}"
                search_results = ydl.extract_info(search_url, download=False)

            results = []
            for entry in search_results.get('entries', [])[:limit]:
                if not entry:
                    continue

                # Get thumbnail
                thumbnail_url = entry.get('thumbnail', '')

                # Store the webpage URL for later extraction
                webpage_url = entry.get('webpage_url', '') or entry.get('url', '')

                results.append(SongResult(
                    title=entry.get('title', ''),
                    artist=entry.get('uploader', ''),
                    source='soundcloud',
                    source_id=entry.get('id', ''),
                    duration=entry.get('duration'),
                    audio_url=webpage_url,  # Store webpage URL, will extract on-demand
                    thumbnail_url=thumbnail_url,
                    is_royalty_free=False
                ))

            logger.info(f"SoundCloud search completed: {len(results)} results (fast mode)")
            return results

        except Exception as e:
            logger.error(f"SoundCloud search error: {str(e)}")
            return []

    async def _search_spotify(self, query: str, limit: int) -> List[SongResult]:
        """Search Spotify using Spotify Web API"""
        try:
            spotify_tracks = await spotify_service.search_tracks(query, limit=limit)

            results = []
            for track in spotify_tracks:
                # Get or fetch thumbnail
                thumbnail_url = track.get('images', [{}])[0].get('url', '') if track.get('images') else ''
                if not thumbnail_url:
                    # Fetch thumbnail from Spotify
                    thumbnail_url = await thumbnail_service.get_spotify_thumbnail(track.get('track_id', ''))

                # Convert Spotify track to SongResult
                results.append(SongResult(
                    title=track.get('name', ''),
                    artist=track.get('artist', ''),
                    source='spotify',
                    source_id=track.get('track_id', ''),
                    duration=track.get('duration_ms', 0) // 1000,  # Convert ms to seconds
                    audio_url=track.get('preview_url', ''),  # Use preview URL
                    thumbnail_url=thumbnail_url,
                    is_royalty_free=False  # Spotify tracks are not royalty free
                ))

            logger.info(f"Found {len(results)} tracks on Spotify")
            return results

        except Exception as e:
            logger.error(f"Spotify search error: {str(e)}")
            return []

    async def _search_zing(self, query: str, limit: int) -> List[SongResult]:
        """Search Zing MP3"""
        try:
            zing_songs = await zing_service.search_songs(query, limit=limit)

            results = []
            for song in zing_songs:
                # Get or fetch thumbnail
                thumbnail_url = song.get('thumbnail', '')
                if not thumbnail_url:
                    # Fetch thumbnail from Zing MP3
                    thumbnail_url = await thumbnail_service.get_zing_thumbnail(song.get('streaming_url', ''))

                # Convert Zing song to SongResult
                results.append(SongResult(
                    title=song.get('title', ''),
                    artist=song.get('artists', ''),
                    source='zing',
                    source_id=song.get('song_id', ''),
                    duration=song.get('duration', 0),
                    audio_url=song.get('streaming_url', ''),
                    thumbnail_url=thumbnail_url,
                    is_royalty_free=False
                ))

            logger.info(f"Found {len(results)} songs on Zing MP3")
            return results

        except Exception as e:
            logger.error(f"Zing MP3 search error: {str(e)}")
            return []

    async def _search_deezer(self, query: str, limit: int) -> List[SongResult]:
        """Search Deezer using Deezer API"""
        try:
            deezer_tracks = await deezer_service.search_tracks(query, limit=limit)

            results = []
            for track in deezer_tracks:
                # Get or fetch thumbnail
                thumbnail_url = ''
                if track.get('images'):
                    # Use largest image available
                    thumbnail_url = track['images'][0].get('url', '')
                elif track.get('preview_url'):
                    # Fallback: no thumbnail, will fetch later if needed
                    pass

                # Convert Deezer track to SongResult
                results.append(SongResult(
                    title=track.get('name', ''),
                    artist=track.get('artist', ''),
                    source='deezer',
                    source_id=str(track.get('track_id', '')),
                    duration=track.get('duration', 0),  # Already in seconds
                    audio_url=track.get('preview_url', ''),  # Use preview URL
                    thumbnail_url=thumbnail_url,
                    is_royalty_free=False,  # Deezer tracks are not royalty free
                    listeners_count=track.get('popularity', 0) * 100  # Approximate
                ))

            logger.info(f"Found {len(results)} tracks on Deezer")
            return results

        except Exception as e:
            logger.error(f"Deezer search error: {str(e)}")
            return []

    def _deduplicate_results(self, results: List[SongResult]) -> List[SongResult]:
        """
        Remove duplicate songs (same title + artist from different sources).

        Prioritizes sources in this order:
        1. spotify (highest quality metadata)
        2. zing (Vietnam-focused)
        3. youtube
        4. soundcloud
        5. pixabay

        Args:
            results: List of SongResult objects

        Returns:
            Deduplicated list with unique songs
        """
        seen = {}
        deduplicated = []

        # Source priority
        source_priority = {
            'spotify': 7,
            'deezer': 6,
            'zing': 5,
            'youtube': 4,
            'soundcloud': 3,
            'fma': 1
        }

        for song in results:
            # Create key from title + artist (case-insensitive)
            key = f"{song.title.lower()}_{song.artist.lower()}"

            # If we haven't seen this song, or current source has higher priority
            if key not in seen or source_priority.get(song.source, 0) > source_priority.get(seen[key].source, 0):
                seen[key] = song

        # Return deduplicated results maintaining priority order
        return list(seen.values())

    def _rank_by_popularity(self, results: List[SongResult]) -> List[SongResult]:
        """
        Rank songs by popularity metrics (views, streams, plays).

        Priority:
        1. Trending rank (chart position) - highest priority
        2. Listener count
        3. Viral status
        4. Source priority (spotify > zing > youtube > soundcloud)

        Args:
            results: List of SongResult objects

        Returns:
            Ranked list sorted by popularity (highest first)
        """
        def calculate_popularity_score(song: SongResult) -> float:
            """Calculate a single popularity score for a song"""
            score = 0.0

            # Trending rank (higher is better, so we invert)
            if song.trending_rank and song.trending_rank > 0:
                # Rank 1 = 100 points, Rank 50 = 51 points
                score += max(0, 101 - song.trending_rank) * 10

            # Listener count
            if song.listeners_count and song.listeners_count > 0:
                # Logarithmic scale to avoid huge numbers dominating
                import math
                score += math.log10(song.listeners_count + 1) * 20

            # Viral status
            if song.is_viral:
                score += 50

            # Source priority (quality indicator)
            source_priority = {
                'spotify': 40,
                'deezer': 35,
                'zing': 30,
                'youtube': 25,
                'soundcloud': 10,
                'fma': 5
            }
            score += source_priority.get(song.source, 0)

            return score

        # Sort by popularity score (descending)
        ranked = sorted(results, key=calculate_popularity_score, reverse=True)

        # Add popularity rank
        for idx, song in enumerate(ranked, 1):
            # Don't override existing rank_position if it exists
            if not hasattr(song, 'popularity_rank') or song.popularity_rank is None:
                song.popularity_rank = idx

        return ranked

    def _check_youtube_creative_commons(self, entry: dict) -> bool:
        """Check if YouTube video has Creative Commons license"""
        license_str = entry.get('license', '').lower()
        return 'creative commons' in license_str or 'cc' in license_str

    async def get_audio_url(self, source: str, source_id: str) -> str:
        """Get direct audio URL for streaming"""
        try:
            if source == 'youtube':
                url = f"https://www.youtube.com/watch?v={source_id}"
                logger.info(f"Extracting audio URL for YouTube: {source_id}")

                ydl_opts = {
                    'format': 'bestaudio/best',
                    'quiet': True,
                    'noplaylist': True,
                }

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=False)
                    logger.info(f"Extracted info keys: {list(info.keys())[:10]}")

                    # Get the direct audio URL with all required parameters
                    audio_url = info.get('url', '')

                    if not audio_url and 'formats' in info and info['formats']:
                        # Try to get URL from first format
                        audio_url = info['formats'][0].get('url', '')
                        logger.info(f"Using URL from formats: {audio_url[:100] if audio_url else 'EMPTY'}")

                    if audio_url:
                        logger.info(f"Successfully extracted audio URL for {source_id}: {audio_url[:100]}...")
                        return audio_url
                    else:
                        logger.error(f"No audio URL found in extracted info for {source_id}")
                        return ''

            elif source == 'soundcloud':
                # SoundCloud: Need to search by ID or use the track URL
                # Try multiple approaches to get the URL
                ydl_opts = {
                    'format': 'bestaudio/best',
                    'quiet': True,
                    'noplaylist': True,
                }

                # Try using scsearch to find the track by ID
                try:
                    # Method 1: Try direct extraction with ID as URL
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        # Try to extract using just the ID (yt-dlp can handle this)
                        info = ydl.extract_info(f"https://soundcloud.com/tracks/{source_id}", download=False)
                        if info and info.get('url'):
                            return info.get('url')
                except:
                    pass

                # Method 2: If the above fails, return empty string
                # The frontend will use the audio_url from the search result
                return ''

            elif source == 'deezer':
                # Deezer provides preview_url directly
                # Return empty as the audio_url is already in the search result
                return ''

            return ''

        except Exception as e:
            logger.error(f"Error getting audio URL for {source}:{source_id}: {str(e)}")
            return ''


# Global instance
music_search_service = MusicSearchService()
