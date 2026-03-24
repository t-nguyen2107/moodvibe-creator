from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.models.database import Base


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service = Column(String(50))  # youtube, tiktok, stable_diffusion
    encrypted_key = Column(String(500))  # AES-256 encrypted
    created_at = Column(DateTime(timezone=True), server_default=func.now())
