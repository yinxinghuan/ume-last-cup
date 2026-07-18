#!/usr/bin/env python3
"""Add the exact game title to the Aigram transit-generated raster poster."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


SOURCE = Path("/tmp/ume-last-cup-poster-base.webp")
DESTINATION = Path(__file__).resolve().parents[1] / "public" / "poster.png"
THUMBNAIL = Path(__file__).resolve().parents[1] / "_qa" / "ui" / "poster-160.png"
FONT = Path("/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf")

image = Image.open(SOURCE).convert("RGB").resize((1024, 1024), Image.Resampling.LANCZOS)
draw = ImageDraw.Draw(image)
font = ImageFont.truetype(str(FONT), 54)
title = "THE LAST CUP RUN"

left, top, right, bottom = draw.textbbox((0, 0), title, font=font)
text_width = right - left
text_height = bottom - top
pad_x, pad_y = 30, 17
x0 = (image.width - text_width) // 2 - pad_x
y0 = 218
x1 = x0 + text_width + pad_x * 2
y1 = y0 + text_height + pad_y * 2

draw.rounded_rectangle((x0, y0 + 8, x1, y1 + 8), radius=30, fill=(255, 211, 50))
draw.rounded_rectangle((x0, y0, x1, y1), radius=30, fill=(58, 36, 27), outline=(255, 247, 232), width=5)
draw.text(((image.width - text_width) // 2, y0 + pad_y - top), title, font=font, fill=(255, 247, 232))

DESTINATION.parent.mkdir(parents=True, exist_ok=True)
image.save(DESTINATION, "PNG", optimize=True)

THUMBNAIL.parent.mkdir(parents=True, exist_ok=True)
thumb = image.resize((160, 160), Image.Resampling.LANCZOS)
thumb.save(THUMBNAIL, "PNG", optimize=True)

print(DESTINATION)
print(THUMBNAIL)
