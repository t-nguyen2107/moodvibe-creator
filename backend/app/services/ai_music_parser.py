"""
AI-powered music query parser using Langchain with OpenAI or Ollama.

This service extracts structured music search parameters from natural language queries,
supporting multiple languages and providing confidence scores for each extraction.

AI Providers:
- OpenAI GPT-4o-mini (paid, ~$0.15/1M tokens)
- Ollama Llama 3 (FREE, runs locally)
"""

import json
import re
import time
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from functools import wraps

from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from app.config import settings
from app.schemas.search import AIParsedQuery

# Configure logging
logger = logging.getLogger(__name__)


def measure_time(func):
    """Decorator to measure function execution time"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        end_time = time.time()
        return result, (end_time - start_time) * 1000  # Return result and time in ms
    return wrapper


class AIMusicParserService:
    """
    AI-powered music query parser using Langchain.

    Supports multiple AI providers:
    - OpenAI GPT-4o-mini (paid, ~$0.15/1M tokens)
    - Ollama Llama 3 (FREE, runs locally)

    Features:
    - Extracts mood, genre, activity, era, language, culture from natural language
    - Supports multi-language queries (English, Vietnamese, Chinese, Korean)
    - Redis caching with 7-day TTL
    - Graceful fallback to keyword extraction
    - Token usage tracking
    - Automatic provider selection (OpenAI → Ollama → Fallback)
    """

    def __init__(self):
        """Initialize the AI parser service with available LLM provider"""
        self.cache_ttl = settings.CACHE_TTL_AI_PARSE

        # Determine which AI provider to use
        self.ai_provider = settings.AI_PROVIDER  # "auto", "openai", or "ollama"
        self.ollama_enabled = settings.OLLAMA_ENABLED

        # Initialize LLM (try OpenAI first, then Ollama, then fallback)
        self.llm = None
        self.llm_provider = None  # "openai", "ollama", or None

        logger.info(f"🔧 [DEBUG] AI Music Parser initializing...")
        logger.info(f"🔧 [DEBUG] AI_PROVIDER: {self.ai_provider}")
        logger.info(f"🔧 [DEBUG] OLLAMA_ENABLED: {self.ollama_enabled}")
        logger.info(f"🔧 [DEBUG] OPENAI_API_KEY set: {bool(settings.OPENAI_API_KEY)}")
        logger.info(f"🔧 [DEBUG] OLLAMA_MODEL: {settings.OLLAMA_MODEL}")
        logger.info(f"🔧 [DEBUG] OLLAMA_BASE_URL: {settings.OLLAMA_BASE_URL}")

        # Try OpenAI first if provider is "auto" or "openai"
        if self.ai_provider in ["auto", "openai"] and settings.OPENAI_API_KEY:
            try:
                logger.info(f"🔧 [DEBUG] Attempting to initialize OpenAI LLM...")
                self.llm = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    temperature=0.1,
                    api_key=settings.OPENAI_API_KEY,
                    timeout=10.0,
                    max_retries=2
                )
                self.llm_provider = "openai"
                logger.info(f"✅ [SUCCESS] Initialized OpenAI LLM with model {settings.OPENAI_MODEL}")
            except Exception as e:
                logger.warning(f"❌ [ERROR] Failed to initialize OpenAI LLM: {e}")

        # Try Ollama if OpenAI failed or provider is "ollama" or "auto"
        if not self.llm and (self.ai_provider in ["auto", "ollama"] or self.ollama_enabled):
            try:
                logger.info(f"🔧 [DEBUG] Attempting to initialize Ollama LLM...")
                self.llm = ChatOllama(
                    model=settings.OLLAMA_MODEL,
                    base_url=settings.OLLAMA_BASE_URL,
                    temperature=0.1,
                    timeout=30.0  # Ollama might be slower
                )
                self.llm_provider = "ollama"
                logger.info(f"✅ [SUCCESS] Initialized Ollama LLM with model {settings.OLLAMA_MODEL} at {settings.OLLAMA_BASE_URL}")
            except Exception as e:
                logger.error(f"❌ [ERROR] Failed to initialize Ollama LLM: {e}")
                import traceback
                logger.error(f"❌ [TRACEBACK] {traceback.format_exc()}")

        # If no LLM available, log warning
        if not self.llm:
            logger.warning("⚠️ [FALLBACK] No LLM configured (neither OpenAI nor Ollama available). AI parsing will use fallback keyword extraction.")
        else:
            logger.info(f"🎯 [DEBUG] AI Music Parser initialization complete. Provider: {self.llm_provider}")

        # Initialize Redis cache
        self.redis_client = None
        self._init_redis()

        # Create Langchain prompt template
        self.prompt = self._create_prompt_template()

        # Statistics tracking
        self.stats = {
            "total_requests": 0,
            "cache_hits": 0,
            "llm_calls": 0,
            "fallback_calls": 0,
            "total_tokens": 0,
            "openai_calls": 0,
            "ollama_calls": 0
        }

    def _init_redis(self):
        """Initialize Redis connection for caching"""
        try:
            import redis
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test connection
            self.redis_client.ping()
            logger.info(f"Connected to Redis at {settings.REDIS_HOST}:{settings.REDIS_PORT}")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Caching will be disabled.")
            self.redis_client = None

    def _create_prompt_template(self) -> ChatPromptTemplate:
        """
        Create Langchain prompt template for structured extraction.

        The prompt is designed to extract consistent JSON output with confidence scores
        from natural language music queries in multiple languages.
        """
        template = """You are a music query parser. Extract structured information from the user's query and return as JSON.

Query: {query}
Language: {language}

Extract the following fields if present:
- mood: emotional tone (chill, happy, sad, energetic, romantic, focus, sleep, party, workout, relaxed)
- genre: music genre (pop, rock, hip-hop, electronic, jazz, classical, k-pop, lo-fi, etc.)
- activity: what the user is doing (studying, working out, driving, relaxing, partying, sleeping, etc.)
- era: time period (80s, 90s, 2000s, 2010s, 2020s, vintage, modern)
- language: song language (english, spanish, korean, chinese, vietnamese, japanese, instrumental)
- culture: cultural context (western, asian, latin, african, etc.)
- trending: whether user wants trending/hot songs (true/false)

For each extracted field, provide a confidence score (0.0 to 1.0).

Return JSON in this exact format:
{{
    "mood": "chill" or null,
    "mood_confidence": 0.95 or 0.0,
    "genre": "lo-fi" or null,
    "genre_confidence": 0.88 or 0.0,
    "activity": "studying" or null,
    "activity_confidence": 0.92 or 0.0,
    "era": "2020s" or null,
    "era_confidence": 0.70 or 0.0,
    "language": "english" or null,
    "language_confidence": 0.85 or 0.0,
    "culture": "western" or null,
    "culture_confidence": 0.75 or 0.0,
    "trending": true or false or null,
    "trending_confidence": 0.90 or 0.0
}}

Rules:
- Only extract fields that are clearly mentioned in the query
- Use null for missing fields
- Confidence scores should be higher for explicit mentions (e.g., "sad songs" = 0.95, "chill vibes" = 0.85)
- Normalize to lowercase
- Handle multi-language queries (e.g., "nhạc K-pop" → genre=k-pop, language=korean)
- Extract trending=true when user says "hot", "trending", "top", "chart", "viral", "phát hành", "hot"
- If no clear extraction, set confidence to 0.0
- Return ONLY valid JSON, no explanations

Examples:
Query: "chill vibes for studying at night"
→ {{"mood": "chill", "mood_confidence": 0.95, "activity": "studying", "activity_confidence": 0.92, ...}}

Query: "nhạc K-pop tập gym"
→ {{"genre": "k-pop", "genre_confidence": 0.98, "activity": "workout", "activity_confidence": 0.95, "language": "korean", "language_confidence": 0.90}}

Query: "sad breakup songs from 90s"
→ {{"mood": "sad", "mood_confidence": 0.97, "era": "90s", "era_confidence": 0.95}}

Query: "upbeat pop songs for running"
→ {{"mood": "energetic", "mood_confidence": 0.90, "genre": "pop", "genre_confidence": 0.95, "activity": "running", "activity_confidence": 0.98}}

Query: "nhạc việt hot 2025"
→ {{"language": "vietnamese", "language_confidence": 0.95, "era": "2020s", "era_confidence": 0.90, "trending": true, "trending_confidence": 0.95}}

Query: "trending TikTok songs"
→ {{"trending": true, "trending_confidence": 0.98}}

Now parse the query and return ONLY valid JSON:"""

        return ChatPromptTemplate.from_template(template)

    def _get_cache_key(self, query: str, language: str) -> str:
        """Generate Redis cache key for query"""
        import hashlib
        content = f"{query}:{language}".lower().strip()
        return f"ai_parse:{hashlib.md5(content.encode()).hexdigest()}"

    def _get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Retrieve parsed query from Redis cache"""
        if not self.redis_client:
            return None

        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                logger.debug(f"Cache hit for key: {cache_key}")
                return json.loads(cached_data)
        except Exception as e:
            logger.warning(f"Redis cache read error: {e}")

        return None

    def _save_to_cache(self, cache_key: str, data: Dict[str, Any]):
        """Save parsed query to Redis cache"""
        if not self.redis_client:
            return

        try:
            self.redis_client.setex(
                cache_key,
                self.cache_ttl,
                json.dumps(data)
            )
            logger.debug(f"Cached parsed query: {cache_key}")
        except Exception as e:
            logger.warning(f"Redis cache write error: {e}")

    def _fallback_parse(self, query: str, language: str) -> Dict[str, Any]:
        """
        Fallback parser using keyword matching and regex patterns.
        Used when LLM is unavailable or fails.

        This provides basic extraction without AI, ensuring the service remains functional.
        """
        logger.info(f"Using fallback parser for query: {query}")

        result = {
            "mood": None,
            "mood_confidence": 0.0,
            "genre": None,
            "genre_confidence": 0.0,
            "activity": None,
            "activity_confidence": 0.0,
            "era": None,
            "era_confidence": 0.0,
            "language": None,
            "language_confidence": 0.0,
            "culture": None,
            "culture_confidence": 0.0
        }

        query_lower = query.lower()

        # Mood keywords
        mood_keywords = {
            "chill": ["chill", "chillout", "relaxed", "relaxing", "mellow", "calm", "peaceful"],
            "happy": ["happy", "upbeat", "cheerful", "joyful", "positive", "feel good"],
            "sad": ["sad", "melancholy", "emotional", "heartbreak", "breakup", "crying"],
            "energetic": ["energetic", "energy", "pump", "hype", "intense", "powerful"],
            "romantic": ["romantic", "love", "romance", "valentine", "tender", "sweet"],
            "focus": ["focus", "concentrate", "study", "work", "productive"],
            "sleep": ["sleep", "lullaby", "bedtime", "night", "insomnia"],
            "party": ["party", "dance", "club", "celebration", "festive"],
            "workout": ["workout", "gym", "exercise", "fitness", "training"],
            "relaxed": ["relaxed", "relax", "calm", "peaceful", "zen"]
        }

        for mood, keywords in mood_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                result["mood"] = mood
                result["mood_confidence"] = 0.70  # Lower confidence for keyword matching
                break

        # Genre keywords
        genre_keywords = {
            "pop": ["pop", "top 40", "mainstream"],
            "rock": ["rock", "alternative", "indie"],
            "hip-hop": ["hip hop", "hiphop", "rap", "trap"],
            "electronic": ["electronic", "edm", "techno", "house", "dubstep"],
            "jazz": ["jazz", "blues", "soul"],
            "classical": ["classical", "orchestra", "symphony", "opera"],
            "k-pop": ["k-pop", "kpop", "korean pop"],
            "lo-fi": ["lo-fi", "lofi", "chillhop", "beats"],
            "country": ["country", "folk", "acoustic"],
            "r&b": ["r&b", "rnb", "r and b"]
        }

        for genre, keywords in genre_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                result["genre"] = genre
                result["genre_confidence"] = 0.75
                break

        # Activity keywords
        activity_keywords = {
            "studying": ["study", "studying", "homework", "exam", "school"],
            "workout": ["workout", "gym", "exercise", "fitness", "training", "running"],
            "driving": ["driving", "road trip", "car", "drive"],
            "relaxing": ["relax", "relaxing", "unwind", "chill"],
            "partying": ["party", "club", "dance", "celebrate"],
            "sleeping": ["sleep", "bed", "night", "lullaby"]
        }

        for activity, keywords in activity_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                result["activity"] = activity
                result["activity_confidence"] = 0.72
                break

        # Era detection
        era_patterns = [
            (r"80s?|eighties", "80s"),
            (r"90s?|nineties", "90s"),
            (r"2000s?|two thousand", "2000s"),
            (r"2010s?|twenty ten", "2010s"),
            (r"2020s?|twenty twenty", "2020s"),
            (r"vintage|retro|old school", "vintage"),
            (r"modern|current|latest|new", "modern")
        ]

        for pattern, era in era_patterns:
            if re.search(pattern, query_lower):
                result["era"] = era
                result["era_confidence"] = 0.70
                break

        # Language detection
        language_keywords = {
            "english": ["english", "us", "uk", "american", "british"],
            "korean": ["korean", "korea", "nhạc hàn"],
            "chinese": ["chinese", "china", "mandarin", "cantonese"],
            "vietnamese": ["vietnamese", "vietnam", "nhạc việt"],
            "japanese": ["japanese", "japan", "j-pop"],
            "spanish": ["spanish", "español", "latino"]
        }

        for lang, keywords in language_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                result["language"] = lang
                result["language_confidence"] = 0.80
                break

        return result

    async def parse(self, query: str, language: str = "en") -> tuple[AIParsedQuery, Dict[str, Any]]:
        """
        Parse natural language query using AI (or fallback).

        Args:
            query: Natural language music query
            language: Query language code (en, vi, zh, ko, etc.)

        Returns:
            Tuple of (AIParsedQuery, metadata_dict)
            metadata includes: cached, processing_time_ms, tokens_used, model
        """
        self.stats["total_requests"] += 1

        # Check cache first
        cache_key = self._get_cache_key(query, language)
        cached_result = self._get_from_cache(cache_key)

        if cached_result:
            self.stats["cache_hits"] += 1
            parsed_query = AIParsedQuery(
                **cached_result["parsed"],
                raw_query=query,
                parsed_at=datetime.fromisoformat(cached_result["parsed_at"])
            )
            metadata = {
                "cached": True,
                "processing_time_ms": 5,  # Cache is nearly instant
                "tokens_used": None,
                "model": "cache"
            }
            logger.info(f"Returned cached result for query: {query[:50]}...")
            return parsed_query, metadata

        # Not in cache, parse using LLM or fallback
        start_time = time.time()

        if self.llm:
            try:
                # Use Langchain to parse
                result_data, tokens = await self._parse_with_llm(query, language)
                self.stats["llm_calls"] += 1
                self.stats["total_tokens"] += tokens

                # Determine model name for metadata
                if self.llm_provider == "openai":
                    model_name = settings.OPENAI_MODEL
                elif self.llm_provider == "ollama":
                    model_name = settings.OLLAMA_MODEL
                else:
                    model_name = "unknown"

                processing_time_ms = int((time.time() - start_time) * 1000)
                metadata = {
                    "cached": False,
                    "processing_time_ms": processing_time_ms,
                    "tokens_used": tokens,
                    "model": model_name,
                    "provider": self.llm_provider or "unknown"
                }

            except Exception as e:
                logger.error(f"LLM parsing failed: {e}, using fallback")
                result_data = self._fallback_parse(query, language)
                self.stats["fallback_calls"] += 1
                processing_time_ms = int((time.time() - start_time) * 1000)
                metadata = {
                    "cached": False,
                    "processing_time_ms": processing_time_ms,
                    "tokens_used": None,
                    "model": "fallback"
                }
        else:
            # LLM not configured, use fallback
            logger.info("LLM not configured, using fallback parser")
            result_data = self._fallback_parse(query, language)
            self.stats["fallback_calls"] += 1
            processing_time_ms = int((time.time() - start_time) * 1000)
            metadata = {
                "cached": False,
                "processing_time_ms": processing_time_ms,
                "tokens_used": None,
                "model": "fallback"
            }

        # Create AIParsedQuery
        parsed_query = AIParsedQuery(
            **result_data,
            raw_query=query,
            parsed_at=datetime.utcnow()
        )

        # Cache the result
        cache_data = {
            "parsed": result_data,
            "parsed_at": parsed_query.parsed_at.isoformat()
        }
        self._save_to_cache(cache_key, cache_data)

        logger.info(
            f"Parsed query in {processing_time_ms}ms: "
            f"mood={parsed_query.mood}, genre={parsed_query.genre}, "
            f"activity={parsed_query.activity}, model={metadata['model']}"
        )

        return parsed_query, metadata

    async def _parse_with_llm(self, query: str, language: str) -> tuple[Dict[str, Any], int]:
        """
        Parse query using Langchain LLM (OpenAI or Ollama).

        Returns:
            Tuple of (parsed_data_dict, tokens_used)
        """
        # Create chain
        chain = self.prompt | self.llm | JsonOutputParser()

        # Invoke chain
        try:
            result = await chain.ainvoke({
                "query": query,
                "language": language
            })

            # Validate result has required fields
            required_fields = [
                "mood", "mood_confidence",
                "genre", "genre_confidence",
                "activity", "activity_confidence",
                "era", "era_confidence",
                "language", "language_confidence",
                "culture", "culture_confidence"
            ]

            for field in required_fields:
                if field not in result:
                    result[field] = 0.0 if "confidence" in field else None

            # Track provider usage
            if self.llm_provider == "openai":
                self.stats["openai_calls"] += 1
                # Estimate tokens (rough approximation: ~4 chars per token)
                tokens_used = len(query) // 4 + 100  # Base tokens for prompt
            elif self.llm_provider == "ollama":
                self.stats["ollama_calls"] += 1
                tokens_used = 0  # Ollama is free, no need to track tokens
            else:
                tokens_used = 0

            return result, tokens_used

        except Exception as e:
            logger.error(f"LLM chain execution failed: {e}")
            raise

    def get_stats(self) -> Dict[str, Any]:
        """Get service statistics"""
        total = self.stats["total_requests"]
        cache_hit_rate = (self.stats["cache_hits"] / total * 100) if total > 0 else 0.0

        return {
            "total_requests": total,
            "cache_hits": self.stats["cache_hits"],
            "cache_hit_rate": round(cache_hit_rate, 2),
            "llm_calls": self.stats["llm_calls"],
            "fallback_calls": self.stats["fallback_calls"],
            "total_tokens": self.stats["total_tokens"],
            "estimated_cost_usd": round(self.stats["total_tokens"] * 0.00000015, 4)  # GPT-4o-mini pricing
        }

    def health_check(self) -> Dict[str, Any]:
        """Check service health status"""
        stats = self.get_stats()

        return {
            "status": "healthy" if self.llm or self.redis_client else "degraded",
            "ai_provider": self.llm_provider or "none",
            "openai_configured": self.llm_provider == "openai",
            "ollama_configured": self.llm_provider == "ollama",
            "redis_configured": self.redis_client is not None,
            "cache_hit_rate": stats["cache_hit_rate"],
            "total_requests": stats["total_requests"],
            "total_cache_hits": stats["cache_hits"],
            "openai_calls": stats.get("openai_calls", 0),
            "ollama_calls": stats.get("ollama_calls", 0),
            "average_response_time_ms": None  # Could be tracked if needed
        }


# Global service instance
ai_music_parser_service = AIMusicParserService()
