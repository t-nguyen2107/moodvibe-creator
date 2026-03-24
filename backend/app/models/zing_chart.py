"""
Zing MP3 Chart Database Model

Stores Zing MP3 chart data (Top 100, Real Trending) for Vietnam.
Used for tracking chart positions and trends over time.
"""

from sqlalchemy import Column, Integer, String, DateTime, Date, UniqueConstraint
from datetime import datetime
from app.models.database import Base


class ZingChart(Base):
    """
    Zing MP3 chart entry model.

    Stores chart positions for tracking trends over time.
    Focuses on Vietnamese music charts.
    """
    __tablename__ = "zing_charts"

    id = Column(Integer, primary_key=True, index=True)
    song_id = Column(String(255), nullable=False)  # Zing MP3 song ID
    song_name = Column(String(255), nullable=False)
    artist_name = Column(String(255), nullable=False)
    position = Column(Integer, nullable=False)
    week_date = Column(Date, nullable=True)  # Optional week grouping
    fetched_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Unique constraint to prevent duplicate entries
    __table_args__ = (
        UniqueConstraint('song_id', 'fetched_at', name='unique_zing_chart_entry'),
    )

    def __repr__(self):
        return f"<ZingChart: #{self.position} {self.song_name} by {self.artist_name}>"
