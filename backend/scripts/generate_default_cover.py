#!/usr/bin/env python3
"""
Generate default cover image for playlists
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_default_cover():
    """Create a gradient default cover image"""

    # Image dimensions
    width, height = 1280, 720

    # Create image with gradient
    img = Image.new('RGB', (width, height))

    # Create vertical gradient from top to bottom
    for y in range(height):
        # Gradient from blue (#2563EB) via orange (#F97316) to rose (#E11D48)
        ratio = y / height

        if ratio < 0.5:
            # Blue to orange
            local_ratio = ratio * 2
            r = int(37 + (249 - 37) * local_ratio)
            g = int(99 + (115 - 99) * local_ratio)
            b = int(235 + (22 - 235) * local_ratio)
        else:
            # Orange to rose
            local_ratio = (ratio - 0.5) * 2
            r = int(249 + (225 - 249) * local_ratio)
            g = int(115 + (29 - 115) * local_ratio)
            b = int(22 + (72 - 22) * local_ratio)

        for x in range(width):
            img.putpixel((x, y), (r, g, b))

    # Add musical note icon
    draw = ImageDraw.Draw(img)

    # Draw a simple music note symbol
    center_x, center_y = width // 2, height // 2

    # Note head (ellipse)
    note_head_x1 = center_x - 40
    note_head_y1 = center_y + 20
    note_head_x2 = center_x + 40
    note_head_y2 = center_y + 70

    draw.ellipse(
        [note_head_x1, note_head_y1, note_head_x2, note_head_y2],
        fill=(255, 255, 255, 200)
    )

    # Note stem
    draw.rectangle(
        [center_x + 30, center_y - 60, center_x + 40, center_y + 20],
        fill=(255, 255, 255, 200)
    )

    # Note flag
    draw.polygon(
        [
            (center_x + 40, center_y - 60),
            (center_x + 80, center_y - 40),
            (center_x + 80, center_y - 20),
            (center_x + 40, center_y - 40)
        ],
        fill=(255, 255, 255, 200)
    )

    # Ensure uploads directory exists
    uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'covers')
    os.makedirs(uploads_dir, exist_ok=True)

    # Save image
    output_path = os.path.join(uploads_dir, 'default_cover.jpg')
    img.save(output_path, 'JPEG', quality=95)

    print(f"✓ Default cover image created: {output_path}")

if __name__ == '__main__':
    create_default_cover()
