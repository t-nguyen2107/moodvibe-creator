import pytest
from app.services.music_search import MusicSearchService


@pytest.fixture
def music_search_service():
    return MusicSearchService()


@pytest.mark.asyncio
async def test_search_music_no_query(music_search_service):
    """Test search with no query"""
    results = await music_search_service.search(
        query=None,
        mood="chill",
        genre="vietnam",
        sources=["youtube"],
        limit=5
    )
    assert isinstance(results, list)


@pytest.mark.asyncio
async def test_search_music_with_query(music_search_service):
    """Test search with query"""
    results = await music_search_service.search(
        query="lofi beats",
        mood=None,
        genre=None,
        sources=["youtube"],
        limit=10
    )
    assert isinstance(results, list)


@pytest.mark.asyncio
async def test_search_music_royalty_free_only(music_search_service):
    """Test search with royalty free filter"""
    results = await music_search_service.search(
        query="music",
        royalty_free_only=True,
        sources=["pixabay"],
        limit=5
    )
    assert isinstance(results, list)
    # All results should be royalty free
    for song in results:
        if hasattr(song, 'is_royalty_free'):
            assert song.is_royalty_free == True


@pytest.mark.asyncio
async def test_search_music_limit(music_search_service):
    """Test search with limit"""
    results = await music_search_service.search(
        query="test",
        limit=3
    )
    assert len(results) <= 3


@pytest.mark.asyncio
async def test_get_audio_url_invalid_source(music_search_service):
    """Test get audio URL with invalid source"""
    url = await music_search_service.get_audio_url("invalid_source", "123")
    assert url == ""


def test_check_youtube_creative_commons(music_search_service):
    """Test YouTube Creative Commons detection"""
    entry_with_cc = {
        'license': 'Creative Commons Attribution license (reuse allowed)'
    }
    assert music_search_service._check_youtube_creative_commons(entry_with_cc) == True

    entry_without_cc = {
        'license': 'Standard YouTube License'
    }
    assert music_search_service._check_youtube_creative_commons(entry_without_cc) == False
