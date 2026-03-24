import os
import asyncio
from typing import List
from PIL import Image, ImageDraw, ImageFont
from app.config import settings


class ImageGeneratorService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR

    async def generate_with_stable_diffusion(
        self,
        prompt: str,
        mood: str,
        output_filename: str = "generated_image.png"
    ) -> str:
        """Generate image using Stable Diffusion API"""

        # Note: This requires STABILITY_API_KEY in settings
        # TODO: Implement Stability AI API integration
        # For now, return a placeholder

        output_path = os.path.join(self.upload_dir, output_filename)

        # Create a simple gradient image based on mood as placeholder
        await self._create_mood_image(mood, output_path)

        return output_path

    async def overlay_song_list(
        self,
        image_path: str,
        song_list: List[str],
        output_filename: str = "cover_with_songs.png"
    ) -> str:
        """Add song list overlay to image"""

        from PIL import Image, ImageDraw, ImageFont

        # Open image
        img = Image.open(image_path)

        # Create a darker overlay for text readability
        overlay = Image.new('RGBA', img.size, (0, 0, 0, 128))
        img = img.convert('RGBA')
        img = Image.alpha_composite(img, overlay)

        # Convert back to RGB
        img = img.convert('RGB')

        # Create draw object
        draw = ImageDraw.Draw(img)

        # Try to load font, fallback to default
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            font = ImageFont.load_default()

        # Draw song list
        y_position = 100
        for i, song in enumerate(song_list[:15]):  # Max 15 songs
            text = f"{i+1}. {song}"
            draw.text((50, y_position), text, fill='white', font=font)
            y_position += 30

        # Save
        output_path = os.path.join(self.upload_dir, output_filename)
        img.save(output_path)

        return output_path

    async def _create_mood_image(self, mood: str, output_path: str):
        """Create a simple mood-based gradient image as placeholder"""

        from PIL import Image, ImageDraw

        # Color mapping for moods
        mood_colors = {
            'chill': ((135, 206, 235), (255, 182, 193)),  # Light blue to pink
            'happy': ((255, 255, 0), (255, 165, 0)),      # Yellow to orange
            'sad': ((70, 130, 180), (25, 25, 112)),       # Blue to navy
            'energetic': ((255, 0, 0), (255, 215, 0)),    # Red to gold
            'romantic': ((255, 182, 193), (219, 112, 147)), # Pink to deep pink
            'focus': ((176, 224, 230), (255, 255, 255)),  # Powder blue to white
            'sleep': ((25, 25, 112), (70, 130, 180)),     # Navy to blue
            'party': ((255, 20, 147), (138, 43, 226)),    # Deep pink to purple
            'workout': ((255, 69, 0), (255, 140, 0)),     # Orange to dark orange
            'relaxed': ((144, 238, 144), (255, 255, 255)) # Light green to white
        }

        # Get colors for mood or default
        colors = mood_colors.get(mood.lower(), ((200, 200, 200), (255, 255, 255)))

        # Create image
        img = Image.new('RGB', (1920, 1080), colors[0])
        draw = ImageDraw.Draw(img)

        # Create simple gradient
        for y in range(1080):
            ratio = y / 1080
            r = int(colors[0][0] * (1 - ratio) + colors[1][0] * ratio)
            g = int(colors[0][1] * (1 - ratio) + colors[1][1] * ratio)
            b = int(colors[0][2] * (1 - ratio) + colors[1][2] * ratio)
            draw.rectangle([(0, y), (1920, y+1)], fill=(r, g, b))

        # Add mood text
        try:
            font = ImageFont.truetype("arial.ttf", 48)
        except:
            font = ImageFont.load_default()

        text = mood.upper()
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]

        position = ((1920 - text_width) // 2, 50)
        draw.text(position, text, fill='white', font=font)

        img.save(output_path)

    async def save_uploaded_image(self, image_data: bytes, filename: str) -> str:
        """Save user uploaded image"""
        output_path = os.path.join(self.upload_dir, filename)

        with open(output_path, 'wb') as f:
            f.write(image_data)

        return output_path


# Global instance
image_generator_service = ImageGeneratorService()
