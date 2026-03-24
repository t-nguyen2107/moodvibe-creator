"""
AI Query Generator - Generates optimized search queries from natural language input.

This service takes a user's natural language query and generates multiple
optimized search queries for different music sources (YouTube, Spotify, SoundCloud, Zing).
"""

import json
import logging
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate

from app.config import settings

logger = logging.getLogger(__name__)


class AIQueryGenerator:
    """
    AI-powered query generator for music search.

    Generates 5-10 optimized search queries from natural language input,
    tailored for different music platforms and search algorithms.
    """

    def __init__(self):
        """Initialize the AI query generator"""
        self.llm = None
        self.llm_provider = None
        self.query_cache = {}  # OPTIMIZATION: In-memory cache for generated queries

        logger.info(f"🔧 [DEBUG] AI Query Generator initializing...")
        logger.info(f"🔧 [DEBUG] AI_PROVIDER: {settings.AI_PROVIDER}")
        logger.info(f"🔧 [DEBUG] OLLAMA_ENABLED: {settings.OLLAMA_ENABLED}")
        logger.info(f"🔧 [DEBUG] OPENAI_API_KEY set: {bool(settings.OPENAI_API_KEY)}")
        logger.info(f"🔧 [DEBUG] OLLAMA_MODEL: {settings.OLLAMA_MODEL}")
        logger.info(f"🔧 [DEBUG] OLLAMA_BASE_URL: {settings.OLLAMA_BASE_URL}")

        # Try OpenAI first (if API key is set)
        if settings.OPENAI_API_KEY:
            try:
                logger.info(f"🔧 [DEBUG] Attempting to initialize OpenAI...")
                self.llm = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    temperature=0.3,  # Lower temperature for more focused queries
                    api_key=settings.OPENAI_API_KEY,
                    timeout=10.0,
                    max_retries=2
                )
                self.llm_provider = "openai"
                logger.info(f"✅ [SUCCESS] AI Query Generator using OpenAI {settings.OPENAI_MODEL}")
            except Exception as e:
                logger.warning(f"❌ [ERROR] Failed to initialize OpenAI: {e}")

        # Try Ollama as fallback or if provider is ollama
        if not self.llm or settings.AI_PROVIDER == "ollama":
            try:
                logger.info(f"🔧 [DEBUG] Attempting to initialize Ollama...")
                from langchain_ollama import ChatOllama
                self.llm = ChatOllama(
                    model=settings.OLLAMA_MODEL,
                    base_url=settings.OLLAMA_BASE_URL,
                    temperature=0.3,
                    timeout=30.0
                )
                self.llm_provider = "ollama"
                logger.info(f"✅ [SUCCESS] AI Query Generator using Ollama {settings.OLLAMA_MODEL} at {settings.OLLAMA_BASE_URL}")
            except Exception as e:
                logger.error(f"❌ [ERROR] Failed to initialize Ollama: {e}")
                import traceback
                logger.error(f"❌ [TRACEBACK] {traceback.format_exc()}")

        if not self.llm:
            logger.warning("⚠️ [FALLBACK] No LLM available for query generation, using rule-based fallback")

        self.prompt = self._create_prompt_template()
        logger.info(f"🔧 [DEBUG] AI Query Generator initialization complete. Provider: {self.llm_provider or 'None'}")

    def _create_prompt_template(self) -> ChatPromptTemplate:
        """Create prompt template for query generation"""
        template = """You are a music search query optimizer. Generate 5-10 effective search queries from the user's input.

User Query: {query}
Language: {language}
AI Parsing: {ai_parsing}

Generate search queries that will work well on:
- YouTube (algorithmic search, likes views)
- Spotify (metadata-based)
- SoundCloud (underground/indie focus)
- Zing MP3 (Vietnamese focused)

CRITICAL LANGUAGE PRIORITY:
- If user query is Vietnamese → 70% of queries MUST be in Vietnamese
- If user query is Korean → 70% of queries MUST be in Korean
- If user query is Spanish → 70% of queries MUST be in Spanish
- ALWAYS prioritize the same language as the user's query
- For Vietnamese: always include "nhạc việt", "bài hát việt", "vietnamese music" variations

Guidelines:
- Return ONLY valid JSON array
- Each query should be different (vary keywords, order, synonyms)
- Prioritize SAME LANGUAGE as user query (this is critical!)
- Add artist names if implied
- Add year/era if relevant
- Use genre-specific terminology
- Remove filler words
- For Vietnamese queries: mix "nhạc việt", "việt top", "bài hát hot việt", "nhạc trẻ", "v-pop"

Return JSON format:
[
  "query 1",
  "query 2",
  "query 3",
  ...
]

Examples:

Input: "nhạc việt hot 2025"
AI Parsing: language=vietnamese, trending=true, era=2020s
Output: [
  "nhạc việt hot 2025",
  "bài hát việt hot nhất 2025",
  "nhạc trẻ trending việt",
  "v-pop hay nhất 2025",
  "top nhạc việt mới",
  "vietnamese music chart 2025",
  "nhạc việt viral tiktok"
]

Input: "bài gì hot hot tiktok đi em"
AI Parsing: language=vietnamese, trending=true, platform=tiktok
Output: [
  "nhạc việt hot tiktok",
  "bài hát việt trending",
  "nhạc trẻ viral tiktok",
  "v-pop hot 2025",
  "top nhạc việt tiktok",
  "bài hát việt hay nhất",
  "nhạc việt phổ biến"
]

Input: "chill lo-fi beats for studying"
AI Parsing: mood=chill, genre=lo-fi, activity=studying
Output: [
  "chill lo-fi beats studying",
  "lo-fi hip hop study music",
  "chhop hop beats focus",
  "lofi study playlist",
  "chill instrumental beats",
  "study beats lofi"
]

Now generate queries for the user input and return ONLY valid JSON:
"""
        return ChatPromptTemplate.from_template(template)

    def _fallback_generate(
        self,
        query: str,
        ai_parsing: Dict[str, Any]
    ) -> List[str]:
        """
        Fallback query generator using rule-based patterns.
        Used when LLM is unavailable.
        """
        queries = [query]

        # Add variations based on AI parsing
        if ai_parsing.get('language'):
            lang = ai_parsing['language']
            if lang == 'vietnamese':
                queries.extend([
                    f"nhạc việt {query}",
                    f"vietnamese music {query}",
                    "nhạc việt hot",
                    "vietnam top hits"
                ])
            elif lang == 'korean':
                queries.extend([
                    f"k-pop {query}",
                    "korean music chart",
                    "korea top 100"
                ])

        if ai_parsing.get('trending'):
            queries.extend([
                f"{query} trending",
                f"{query} chart",
                f"top hits {query}",
                f"best songs {query}"
            ])

        if ai_parsing.get('genre'):
            genre = ai_parsing['genre']
            queries.extend([
                f"{genre} songs",
                f"best {genre}",
                f"top {genre} hits"
            ])

        if ai_parsing.get('era'):
            era = ai_parsing['era']
            queries.append(f"{query} {era}")

        # Remove duplicates and limit
        return list(set(queries))[:10]

    async def generate_queries(
        self,
        query: str,
        language: str = "en",
        ai_parsing: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """
        Generate optimized search queries from natural language input.

        Args:
            query: User's natural language query
            language: User's language code
            ai_parsing: AI-parsed parameters (mood, genre, era, etc.)

        Returns:
            List of 5-10 optimized search queries
        """
        logger.info(f"🎯 [DEBUG] generate_queries called with query: '{query}', language: '{language}'")
        logger.info(f"🎯 [DEBUG] AI Parsing: {ai_parsing}")
        logger.info(f"🎯 [DEBUG] LLM Available: {self.llm is not None}")
        logger.info(f"🎯 [DEBUG] LLM Provider: {self.llm_provider}")

        # OPTIMIZATION: Check cache first
        cache_key = f"{query}_{language}_{json.dumps(ai_parsing or {}, sort_keys=True)}"
        if cache_key in self.query_cache:
            logger.info(f"✅ [CACHE HIT] Using cached queries for: {query}")
            return self.query_cache[cache_key]

        if not ai_parsing:
            ai_parsing = {}

        # Format AI parsing for prompt
        ai_parsing_str = json.dumps(ai_parsing, indent=2)

        logger.info(f"🎯 [DEBUG] Generating queries for: {query}")

        # Try LLM-based generation
        if self.llm:
            try:
                logger.info(f"🤖 [DEBUG] Attempting LLM-based query generation using {self.llm_provider}...")
                chain = self.prompt | self.llm
                result = await chain.ainvoke({
                    "query": query,
                    "language": language,
                    "ai_parsing": ai_parsing_str
                })

                logger.info(f"🤖 [DEBUG] LLM response received, parsing...")

                # Parse JSON response
                content = result.content.strip()
                logger.info(f"🤖 [DEBUG] Raw LLM response: {content[:200]}...")

                # Extract JSON array (handle potential markdown formatting)
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[5:]
                content = content.strip().strip("`")

                queries = json.loads(content)
                logger.info(f"🤖 [DEBUG] Parsed queries: {queries}")

                if isinstance(queries, list) and len(queries) > 0:
                    # OPTIMIZATION: Cache the results
                    self.query_cache[cache_key] = queries
                    # OPTIMIZATION: Return only 3-5 queries instead of 5-10
                    logger.info(f"✅ [SUCCESS] Generated {len(queries)} queries via {self.llm_provider}, returning top 5")
                    logger.info(f"✅ [QUERIES] {queries[:5]}")
                    return queries[:5]

            except Exception as e:
                logger.error(f"❌ [ERROR] LLM query generation failed: {e}")
                import traceback
                logger.error(f"❌ [TRACEBACK] {traceback.format_exc()}")

        # Fallback to rule-based generation
        logger.info(f"⚠️ [FALLBACK] Using rule-based query generation")
        queries = self._fallback_generate(query, ai_parsing)

        logger.info(f"✅ [FALLBACK] Generated {len(queries)} fallback queries: {queries}")
        return queries


# Global instance
ai_query_generator = AIQueryGenerator()
