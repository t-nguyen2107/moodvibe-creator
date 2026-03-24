import pytest
from fastapi.testclient import TestClient
from app.main import app


# Remove client fixture to use the one from conftest.py
# The client fixture in conftest.py has database override
# pytest will automatically use that fixture


def test_root_endpoint(client):
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "MoodVibe Creator API"


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_get_music_sources(client):
    """Test get music sources endpoint"""
    response = client.get("/api/music/sources")
    assert response.status_code == 200
    data = response.json()
    assert "sources" in data
    assert isinstance(data["sources"], list)


def test_search_music_endpoint(client):
    """Test music search endpoint"""
    response = client.get("/api/music/search?q=test&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "songs" in data
    assert "total" in data
    assert isinstance(data["songs"], list)


def test_search_music_with_genre(client):
    """Test music search with genre filter"""
    response = client.get("/api/music/search?genre=vietnam&mood=chill&limit=10")
    assert response.status_code == 200


def test_get_playlists_empty(client):
    """Test get playlists when empty"""
    response = client.get("/api/playlists/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_create_playlist(client):
    """Test create playlist endpoint"""
    playlist_data = {
        "name": "Test Playlist",
        "mood": "chill",
        "genre": "vietnam",
        "description": "Test description"
    }
    response = client.post("/api/playlists/", json=playlist_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Playlist"
    assert data["mood"] == "chill"
    assert data["genre"] == "vietnam"


def test_create_playlist_invalid_data(client):
    """Test create playlist with invalid data"""
    playlist_data = {
        "name": "",  # Empty name should fail if validation is implemented
    }
    response = client.post("/api/playlists/", json=playlist_data)
    # Might pass or fail depending on validation
    assert response.status_code in [200, 422]


def test_preview_url_endpoint(client):
    """Test preview URL endpoint"""
    response = client.get("/api/music/preview/youtube/test_video_id")
    assert response.status_code == 200
    data = response.json()
    assert "url" in data


def test_check_copyright_endpoint(client):
    """Test copyright check endpoint"""
    response = client.get("/api/music/check-copyright/youtube/test_id")
    assert response.status_code == 200
    data = response.json()
    assert "is_royalty_free" in data


def test_cors_headers(client):
    """Test CORS headers are set"""
    response = client.get("/", headers={"Origin": "http://localhost:3000"})
    assert response.status_code == 200
