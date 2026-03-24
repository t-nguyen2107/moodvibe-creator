import pytest
import os

# IMPORTANT: Set TESTING=1 BEFORE importing any app modules
os.environ["TESTING"] = "1"

# Now we can import from app
from app.models.database import Base, get_db, SessionLocal, engine
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture(scope="function")
def db():
    """Create a fresh database and session for each test"""
    test_db_file = "./test.db"

    # Remove test database file at start of each test
    if os.path.exists(test_db_file):
        try:
            os.remove(test_db_file)
        except:
            pass

    # Create all tables
    from app.models import User, Playlist, Song, APIKey, SearchHistory
    Base.metadata.create_all(bind=engine)

    # Create session
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean up tables
        Base.metadata.drop_all(bind=engine)

        # Remove test database file at end of each test
        if os.path.exists(test_db_file):
            try:
                os.remove(test_db_file)
            except:
                pass


@pytest.fixture(scope="function")
def client(db):
    """Create test client with database override"""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    # Override the dependency
    app.dependency_overrides[get_db] = override_get_db

    # Create test client
    test_client = TestClient(app, raise_server_exceptions=True)
    yield test_client

    # Clean up
    app.dependency_overrides = {}
