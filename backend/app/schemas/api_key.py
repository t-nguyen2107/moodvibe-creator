from pydantic import BaseModel


class APIKeyCreate(BaseModel):
    service: str  # youtube, tiktok, stable_diffusion
    api_key: str


class APIKeyResponse(BaseModel):
    id: int
    service: str
    # Don't return the actual key, just masked version
    has_key: bool = True

    class Config:
        from_attributes = True
