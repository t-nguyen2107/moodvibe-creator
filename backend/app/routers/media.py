from fastapi import APIRouter, HTTPException, File, UploadFile
from app.schemas.media import AudioMergeRequest, VideoGenerateRequest, ImageGenerateRequest
from app.services.audio_processor import audio_processor_service
from app.services.video_generator import video_generator_service
from app.services.image_generator import image_generator_service
import uuid

router = APIRouter(prefix="/api/media", tags=["media"])


@router.post("/audio/merge")
async def merge_audio(request: AudioMergeRequest):
    """Merge audio files with gaps"""

    try:
        output_filename = f"merged_{uuid.uuid4().hex[:8]}.mp3"
        audio_path = await audio_processor_service.merge_audio(
            audio_urls=request.audio_urls,
            gap=request.gap,
            output_filename=output_filename
        )

        return {
            "audio_path": audio_path,
            "filename": output_filename
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/video/generate")
async def generate_video(request: VideoGenerateRequest):
    """Generate MP4 video from audio and image"""

    try:
        output_filename = f"video_{uuid.uuid4().hex[:8]}.mp4"
        video_path = await video_generator_service.create_video(
            audio_path=request.audio_path,
            image_path=request.image_path,
            song_list=request.song_list,
            show_song_list=request.show_song_list,
            output_filename=output_filename
        )

        return {
            "video_path": video_path,
            "filename": output_filename
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image/generate")
async def generate_image(request: ImageGenerateRequest):
    """Generate image using Stable Diffusion"""

    try:
        output_filename = f"image_{uuid.uuid4().hex[:8]}.png"
        image_path = await image_generator_service.generate_with_stable_diffusion(
            prompt=request.prompt,
            mood=request.mood,
            output_filename=output_filename
        )

        return {
            "image_path": image_path,
            "filename": output_filename
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload custom image"""

    try:
        contents = await file.read()

        # Generate unique filename
        import uuid
        filename = f"upload_{uuid.uuid4().hex[:8]}_{file.filename}"

        image_path = await image_generator_service.save_uploaded_image(contents, filename)

        return {
            "image_path": image_path,
            "filename": filename
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
