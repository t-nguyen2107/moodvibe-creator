from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.database import Base


class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    mood = Column(String(100))
    genre = Column(String(50))
    is_royalty_free = Column(Boolean, default=False)
    show_song_list = Column(Boolean, default=True)
    description = Column(Text)
    cover_image_path = Column(String(500))
    audio_path = Column(String(500))
    video_path = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    songs = relationship("Song", back_populates="playlist", cascade="all, delete-orphan")
