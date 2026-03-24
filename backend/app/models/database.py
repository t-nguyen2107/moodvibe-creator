import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.config import settings


def get_database_url() -> str:
    """Get database URL based on current environment"""
    # Check if explicitly set in env
    env_db_url = os.environ.get("DATABASE_URL")
    if env_db_url:
        return env_db_url

    # Check if in test mode - use file-based database for tests
    if os.environ.get("TESTING") == "1":
        return "sqlite:///./test.db"

    # Use settings if provided
    if settings.DATABASE_URL:
        return settings.DATABASE_URL

    # Default to development database
    return "sqlite:///./database.db"


# Create database engine with computed URL
database_url = get_database_url()
engine = create_engine(
    database_url,
    connect_args={"check_same_thread": False} if "sqlite" in database_url else {}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Create Base class for models
class Base(DeclarativeBase):
    """Base class for all database models"""
    pass


# Dependency to get database session
def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize database
def init_db():
    """Initialize database tables"""
    from app.models import User, Playlist, Song, APIKey, SearchHistory, SpotifyChart, ZingChart
    Base.metadata.create_all(bind=engine)
