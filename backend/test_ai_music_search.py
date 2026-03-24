"""
Test script for AI-powered music search.

Run this to verify the AI parsing service is working correctly.
"""

import asyncio
import sys
import os

# Fix Windows console encoding
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.ai_music_parser import ai_music_parser_service


async def test_basic_parsing():
    """Test basic English query parsing"""
    print("\n=== Test 1: Basic English Query ===")
    query = "chill vibes for studying at night"
    parsed, metadata = await ai_music_parser_service.parse(query, "en")

    print(f"Query: {query}")
    print(f"Mood: {parsed.mood} (confidence: {parsed.mood_confidence})")
    print(f"Activity: {parsed.activity} (confidence: {parsed.activity_confidence})")
    print(f"Model: {metadata['model']}")
    print(f"Cached: {metadata['cached']}")
    print(f"Processing time: {metadata['processing_time_ms']}ms")

    assert parsed.mood == "chill", f"Expected mood='chill', got '{parsed.mood}'"
    assert parsed.activity == "studying", f"Expected activity='studying', got '{parsed.activity}'"
    print("✅ Test 1 passed!")


async def test_multilingual():
    """Test Vietnamese query parsing"""
    print("\n=== Test 2: Vietnamese Query ===")
    query = "nhạc K-pop tập gym"
    parsed, metadata = await ai_music_parser_service.parse(query, "vi")

    print(f"Query: {query}")
    print(f"Genre: {parsed.genre} (confidence: {parsed.genre_confidence})")
    print(f"Activity: {parsed.activity} (confidence: {parsed.activity_confidence})")
    print(f"Language: {parsed.language} (confidence: {parsed.language_confidence})")

    assert parsed.genre == "k-pop", f"Expected genre='k-pop', got '{parsed.genre}'"
    assert parsed.activity == "workout", f"Expected activity='workout', got '{parsed.activity}'"
    print("✅ Test 2 passed!")


async def test_cache_hit():
    """Test Redis caching"""
    print("\n=== Test 3: Cache Performance ===")
    query = "sad breakup songs from 90s"

    # First call - cache miss
    parsed1, meta1 = await ai_music_parser_service.parse(query, "en")
    print(f"First call - Cached: {meta1['cached']}, Time: {meta1['processing_time_ms']}ms")

    # Second call - should be cache hit
    parsed2, meta2 = await ai_music_parser_service.parse(query, "en")
    print(f"Second call - Cached: {meta2['cached']}, Time: {meta2['processing_time_ms']}ms")

    assert meta1['cached'] == False, "First call should not be cached"
    assert meta2['cached'] == True, "Second call should be cached"
    assert meta2['processing_time_ms'] < 50, f"Cached response should be fast, got {meta2['processing_time_ms']}ms"

    print("✅ Test 3 passed!")


async def test_fallback_parser():
    """Test fallback keyword extraction"""
    print("\n=== Test 4: Fallback Parser ===")

    # Temporarily disable LLM to test fallback
    original_llm = ai_music_parser_service.llm
    ai_music_parser_service.llm = None

    query = "happy upbeat pop songs"
    result = ai_music_parser_service._fallback_parse(query, "en")

    print(f"Query: {query}")
    print(f"Mood: {result['mood']} (confidence: {result['mood_confidence']})")
    print(f"Genre: {result['genre']} (confidence: {result['genre_confidence']})")

    # Restore LLM
    ai_music_parser_service.llm = original_llm

    assert result['mood'] == 'happy', f"Expected mood='happy', got '{result['mood']}'"
    assert result['genre'] == 'pop', f"Expected genre='pop', got '{result['genre']}'"
    print("✅ Test 4 passed!")


async def test_health_check():
    """Test health check endpoint"""
    print("\n=== Test 5: Health Check ===")
    health = ai_music_parser_service.health_check()

    print(f"Status: {health['status']}")
    print(f"OpenAI configured: {health['openai_configured']}")
    print(f"Redis configured: {health['redis_configured']}")
    print(f"Total requests: {health['total_requests']}")

    assert health['status'] in ['healthy', 'degraded'], f"Invalid status: {health['status']}"
    print("✅ Test 5 passed!")


async def test_stats():
    """Test statistics tracking"""
    print("\n=== Test 6: Statistics ===")
    stats = ai_music_parser_service.get_stats()

    print(f"Total requests: {stats['total_requests']}")
    print(f"Cache hits: {stats['cache_hits']}")
    print(f"Cache hit rate: {stats['cache_hit_rate']}%")
    print(f"LLM calls: {stats['llm_calls']}")
    print(f"Total tokens: {stats['total_tokens']}")
    print(f"Estimated cost: ${stats['estimated_cost_usd']}")

    assert stats['total_requests'] > 0, "Should have tracked requests"
    print("✅ Test 6 passed!")


async def main():
    """Run all tests"""
    print("=" * 60)
    print("AI Music Search Service - Test Suite")
    print("=" * 60)

    try:
        await test_basic_parsing()
        await test_multilingual()
        await test_cache_hit()
        await test_fallback_parser()
        await test_health_check()
        await test_stats()

        print("\n" + "=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)

    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  WARNING: OPENAI_API_KEY not set")
        print("   Tests will use fallback parser only")
        print("   Set OPENAI_API_KEY in .env for full testing")
        print()

    asyncio.run(main())
