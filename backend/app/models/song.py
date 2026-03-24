from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.database import Base


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    playlist_id = Column(Integer, ForeignKey("playlists.id"), nullable=False)
    title = Column(String(255), nullable=False)
    artist = Column(String(255))
    source = Column(String(50))  # youtube, soundcloud, pixabay, fma
    source_id = Column(String(255))
    duration = Column(Integer)  # in seconds
    audio_url = Column(String(500))
    thumbnail_url = Column(String(500))
    is_royalty_free = Column(Boolean, default=False)
    position = Column(Integer)

    # Relationships
    playlist = relationship("Playlist", back_populates="songs")
