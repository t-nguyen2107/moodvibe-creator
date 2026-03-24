from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional
import os


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"  # development, testing, production

    # Server Configuration
    PORT: int = 8899  # Server port

    # Database (can be overridden, will auto-detect if not set)
    DATABASE_URL: Optional[str] = None

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    MASTER_ENCRYPTION_KEY: str = "your-32-byte-master-key-here"

    # File Storage
    UPLOAD_DIR: str = "../uploads"
    MAX_PLAYLIST_SIZE: int = 20

    # API Keys (optional - users can provide their own)
    YOUTUBE_API_KEY: Optional[str] = None
    TIKTOK_CLIENT_ID: Optional[str] = None
    TIKTOK_CLIENT_SECRET: Optional[str] = None
    STABILITY_API_KEY: Optional[str] = None
    SPOTIFY_CLIENT_ID: Optional[str] = None
    SPOTIFY_CLIENT_SECRET: Optional[str] = None

    # OpenAI Configuration (for AI music parsing)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"  # Cost-effective: $0.15/1M input tokens

    # Ollama Configuration (for local LLM support - FREE alternative)
    OLLAMA_ENABLED: bool = False  # Set to True to use Ollama instead of OpenAI
    OLLAMA_BASE_URL: str = "http://localhost:11434"  # Default Ollama endpoint
    OLLAMA_MODEL: str = "llama3"  # Default Llama 3 model

    # AI Provider Selection (auto: try OpenAI first, fallback to Ollama)
    AI_PROVIDER: str = "auto"  # Options: "openai", "ollama", "auto"

    # Redis Configuration (for caching AI parse results)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None

    # Cache TTL (seconds)
    CACHE_TTL_AI_PARSE: int = 604800  # 7 days - AI parse results don't change
    CACHE_TTL_CHARTS: int = 86400     # 24 hours - music charts change daily

    # Rate Limiting
    AI_PARSE_RATE_LIMIT: int = 10  # requests per minute per user

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def is_testing(self) -> bool:
        """Check if running in test mode"""
        return os.environ.get("TESTING") == "1" or self.ENVIRONMENT == "testing"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def compute_database_url(cls, v: Optional[str]) -> str:
        """Compute database URL based on environment"""
        # If explicitly provided, use it
        if v:
            return v

        # Check if explicitly set in env
        env_db_url = os.environ.get("DATABASE_URL")
        if env_db_url:
            return env_db_url

        # Auto-detect based on environment
        testing = os.environ.get("TESTING") == "1"
        environment = os.environ.get("ENVIRONMENT", "development")

        if testing or environment == "testing":
            return "sqlite:///:memory:"
        elif environment == "production":
            return "sqlite:///./database.db"
        else:  # development
            return "sqlite:///./database.db"


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Special genres that don't show song list
SPECIAL_GENRES = [
    "work_music",
    "instrumental",
    "sleep_music",
    "baby_lullabies"
]

# Available music sources
MUSIC_SOURCES = ["youtube", "soundcloud", "pixabay", "fma", "spotify", "zing", "deezer"]

# Available moods
MOODS = [
    "chill", "happy", "sad", "energetic", "romantic",
    "focus", "sleep", "party", "workout", "relaxed"
]

# Available genres
GENRES = [
    "hot", "us_uk", "korean", "chinese", "vietnam",
    "work_music", "instrumental", "sleep_music", "baby_lullabies"
]
