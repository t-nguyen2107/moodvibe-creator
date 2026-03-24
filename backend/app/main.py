from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.database import init_db
from app.routers import music, playlists, media, social
from app.routers import settings as settings_router
from app.routers import playlist_downloads

# Initialize FastAPI app
app = FastAPI(
    title="MoodVibe Creator API",
    description="API for creating music playlists and uploading to social media",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",  # Next.js default port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(music.router)
app.include_router(playlists.router)
app.include_router(media.router)
app.include_router(social.router)
app.include_router(settings_router.router)
app.include_router(playlist_downloads.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    import os
    # Skip initialization in test environment (tests handle their own database)
    if os.environ.get("TESTING") != "1":
        init_db()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "MoodVibe Creator API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
