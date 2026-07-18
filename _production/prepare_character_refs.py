#!/usr/bin/env python3
"""Prepare tall, text-free single-character references from the supplied UMe manual.

These are generation inputs only. They are not shipped as final game frames.
"""

from pathlib import Path

from PIL import Image


OUT = Path("/tmp/ume-last-cup-refs")
OUT.mkdir(parents=True, exist_ok=True)

# page, crop box around the official 3D character (left, top, right, bottom)
CHARACTERS = {
    "ume": (13, (900, 120, 1390, 820)),
    "melon": (14, (930, 210, 1450, 860)),
    "lemon": (15, (900, 160, 1510, 830)),
    "guac": (16, (930, 190, 1450, 860)),
    "mango": (17, (930, 250, 1450, 860)),
    "pearl": (18, (900, 150, 1480, 820)),
}

for name, (page, box) in CHARACTERS.items():
    source = Image.open(f"/tmp/ume-page-{page}.jpg").convert("RGB")
    crop = source.crop(box)
    crop.thumbnail((650, 980), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (768, 1344), "white")
    x = (canvas.width - crop.width) // 2
    y = (canvas.height - crop.height) // 2
    canvas.paste(crop, (x, y))
    destination = OUT / f"{name}.jpg"
    canvas.save(destination, quality=94, subsampling=0)
    print(destination)
