#!/usr/bin/env python3
"""Generate alternate integrated hero frames through the Aigram transit API."""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from pathlib import Path


API = "https://chat.aiwaves.tech/aigram/api/gen-image"
REF_URL = "https://images.aiwaves.tech/uploads/1784396382160-k04sji1k7zd.jpg"
OUT = Path(__file__).resolve().parents[1] / "_qa" / "hero-variants"

BASE = (
    "Create a polished 9:16 portrait key frame for a joyful family-friendly 3D animated game. "
    "Use the supplied image as the strict identity reference for the only character: the exact pink UMe rabbit, "
    "with the same asymmetric rabbit ears, glossy black eyes with tiny lashes, blue bow, pink soft-vinyl body, "
    "short arms and feet. Place the rabbit naturally inside the warm cream interior of a tiny bubble-tea delivery "
    "van driving through a sunny colorful town. The rabbit must have a charming happy expression with bright eyes, "
    "rosy cheeks and a small clearly visible smile. Keep the entire face fully unobstructed: no straw, cup, prop, "
    "hand, reflection or foreground object may overlap the eyes, nose or mouth. Include exactly one upright amber "
    "bubble-tea cup with black tapioca pearls, positioned below shoulder level and away from the face. Put the brand "
    "mark UMe once on a separate flat cream label centered on the front of the cup: crisp simple white Roman letters "
    "U M e, correctly spelled, evenly aligned, not warped, not duplicated, not floral, and not crossing any seam, "
    "highlight, straw or curved edge. Keep five small readable story clues integrated around the van interior: a "
    "red-and-green strap, yellow cooling lever, green knit cap, mango-yellow ticket, and gold ring holding one dark "
    "pearl. Warm sunlight from upper right, soft blue fill, premium tactile materials, unified shadows and depth of "
    "field. One character only. No extra mascot, no human, no caption, no poster title, no watermark. "
)

PROMPTS = {
    "hero_a": BASE + (
        "Medium-wide symmetrical view. Rabbit stands slightly left of center and waves with one hand; cup sits on a "
        "low secure tray at lower right. Use an open cheerful smile without showing teeth."
    ),
    "hero_b": BASE + (
        "Three-quarter cinematic view from slightly above. Rabbit sits securely on the curved bench, leaning forward "
        "with an eager closed-mouth smile; cup sits in a recessed holder in the lower left foreground, never touching "
        "the face."
    ),
    "hero_c": BASE + (
        "Energetic centered view. Rabbit holds the cup low at waist height with both hands while the straw angles away "
        "from the head; the full smiling face has generous clear space around it. Make the pose lively but stable."
    ),
    "hero_d": BASE + (
        "Slight side view with the city visible through the round rear opening. Rabbit braces playfully with one foot "
        "forward and gives a confident tiny grin; cup is strapped into a holder at the bottom center, well below the "
        "chin. Prioritize a clean silhouette and especially clean readable UMe label."
    ),
}


def generate(name: str, prompt: str) -> tuple[str, str]:
    payload = json.dumps({"prompt": prompt, "ref_url": REF_URL}).encode()
    request = urllib.request.Request(
        API,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Origin": "https://aigram.app",
            "User-Agent": "Mozilla/5.0",
        },
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=900) as response:
                result = json.loads(response.read())
            break
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == 3:
                raise
            delay = 30 * (attempt + 1)
            print(f"{name}: rate limited; retrying in {delay}s", flush=True)
            time.sleep(delay)
    url = result.get("url")
    if not url:
        raise RuntimeError(f"{name}: no URL in response {result}")
    destination = OUT / f"{name}.png"
    download_request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(download_request, timeout=300) as response:
        destination.write_bytes(response.read())
    return name, url


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, prompt in PROMPTS.items():
        destination = OUT / f"{name}.png"
        if destination.exists() and destination.stat().st_size > 100_000:
            print(f"{name}\tskip", flush=True)
            continue
        completed_name, url = generate(name, prompt)
        print(f"{completed_name}\t{url}", flush=True)
        time.sleep(20)


if __name__ == "__main__":
    main()
