"""
Spotify Chart Database Model

Stores Spotify chart data (Top 50, Viral 50) for different regions.
Used for tracking chart positions and trends over time.
"""

from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint
from datetime import datetime
from app.models.database import Base


class SpotifyChart(Base):
    """
    Spotify chart entry model.

    Stores chart positions for tracking trends over time.
    Tracks position changes (rise/fall) and popularity scores.
    """
    __tablename__ = "spotify_charts"

    id = Column(Integer, primary_key=True, index=True)
    chart_type = Column(String(50), nullable=False)  # 'top50', 'viral50'
    region = Column(String(50), nullable=False)  # 'vietnam', 'global'
    track_id = Column(String(255), nullable=False)  # Spotify track ID
    track_name = Column(String(255), nullable=False)
    artist_name = Column(String(255), nullable=False)
    position = Column(Integer, nullable=False)
    position_change = Column(Integer, nullable=True)  # +5 rose, -3 fell, 0 same
    popularity_score = Column(Integer, nullable=False)  # 0-100
    fetched_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Unique constraint to prevent duplicate entries
    __table_args__ = (
        UniqueConstraint('chart_type', 'region', 'track_id', 'fetched_at', name='unique_spotify_chart_entry'),
    )

    def __repr__(self):
        return f"<SpotifyChart {self.chart_type}/{self.region}: #{self.position} {self.track_name} by {self.artist_name}>"
