#!/usr/bin/env python3
"""Upload anchor frames and generate the six Last Cup Run video clips.

Uses only the public Aigram upload endpoint and the approved first/last-frame
video service. No local generation workflow or private R2 credentials.
"""

from __future__ import annotations

import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.request
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = PUBLIC / "videos"

UPLOAD_API = "https://chat.aiwaves.tech/aigram/api/upload"
VIDEO_API = "https://u545921-b746-8a491f44.westc.seetacloud.com:8443/video"
VIDEO_TASK_API = "https://u545921-b746-8a491f44.westc.seetacloud.com:8443/video_task"
HERO_URL = "https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784398587356675.webp"
END_URLS = {
    "frames/end_melon.png": "https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396511103790.webp",
    "frames/end_lemon.png": "https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396520556759.webp",
    "frames/end_guac.png": "https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396530076653.webp",
    "frames/end_mango.png": "https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396540086344.webp",
    "frames/end_pearl.png": "https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396550382418.webp",
    "frames/end_climax.png": "https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396627080565.webp",
}

STYLE = (
    "Premium joyful 3D animated commercial, warm sunlight from upper right, soft sky-blue fill, "
    "same cream bubble-tea delivery van, same camera height and perspective, preserve every mascot's exact "
    "silhouette, colors, face and accessories, tactile soft-vinyl and fine plush materials. No new characters, "
    "no text, no logo changes, no duplicate limbs, no identity morphing. One readable slapstick action, smooth "
    "24 fps motion, stable background, portrait composition. "
)

JOBS = [
    (
        "clip_01_melon",
        "frames/end_melon.png",
        STYLE +
        "The camera whips from the pink rabbit toward the red-and-green safety strap. MelonMick, the exact red "
        "watermelon-ring mascot, springs into the van as if summoned by the strap. The strap loops harmlessly "
        "around his watermelon ring like a hula hoop and he wobbles once, delighted. End on the integrated "
        "single-character MelonMick scene; do not keep the pink rabbit in the final shot.",
    ),
    (
        "clip_02_lemon",
        "frames/end_lemon.png",
        STYLE +
        "The camera snaps from the pink rabbit to the yellow cooling lever. A harmless puff of icy blue mist bursts "
        "out and reveals the exact LemonShark mascot. LemonShark slides sideways once, squash-and-stretches gently "
        "and laughs with the huge mouth. End on the integrated single-character LemonShark scene; do not keep the "
        "pink rabbit in the final shot.",
    ),
    (
        "clip_03_guac",
        "frames/end_guac.png",
        STYLE +
        "The camera pushes from the pink rabbit toward the green knit cap on the bench. The exact GuacPiggy mascot "
        "pops up under the cap, which slips briefly over the eyes. GuacPiggy salutes in the wrong direction, then "
        "steadies the upright cup. End on the integrated single-character GuacPiggy scene; do not keep the pink "
        "rabbit in the final shot.",
    ),
    (
        "clip_04_mango",
        "frames/end_mango.png",
        STYLE +
        "The camera moves from the pink rabbit to the mango-yellow delivery ticket. The exact MangoChick mascot "
        "hops into the van, pecks the ticket once, and several paper tickets float overhead. MangoChick freezes with "
        "an innocent expression while the leaf crown flutters. End on the integrated single-character MangoChick "
        "scene; do not keep the pink rabbit in the final shot.",
    ),
    (
        "clip_05_pearl",
        "frames/end_pearl.png",
        STYLE +
        "The camera tilts from the pink rabbit toward the dark pearl hanging inside the gold ring. The pearl floats "
        "free and becomes the exact BubblePearl mascot with cat ears, white wings and gold halo. BubblePearl flies "
        "one wobbly loop; the halo tilts and three tapioca pearls hover like bubbles. End on the integrated "
        "single-character BubblePearl scene; do not keep the pink rabbit in the final shot.",
    ),
    (
        "clip_06_climax",
        "frames/end_climax.png",
        STYLE +
        "Return rapidly from the five relay clues to the exact pink UMe rabbit as the delivery van accelerates. The "
        "last bubble tea cup lifts slightly, and the pink rabbit catches it safely with both hands. The cup stays "
        "perfectly upright and does not spill. Yellow and blue speed lines appear outside the moving van. End on "
        "the integrated single-character hero shot of the joyful pink rabbit holding the cup. No family group shot "
        "and no other mascot in the final frame.",
    ),
]


def upload(path: Path) -> str:
    boundary = f"----ume-{uuid.uuid4().hex}"
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    data = path.read_bytes()
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{path.name}"\r\n'
        f"Content-Type: {mime}\r\n\r\n"
    ).encode() + data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        UPLOAD_API,
        data=body,
        method="POST",
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )
    with urllib.request.urlopen(req, timeout=180) as response:
        result = json.loads(response.read())
    if not result.get("url"):
        raise RuntimeError(f"upload returned no URL: {result}")
    return result["url"]


def post_json(url: str, payload: dict, timeout: int = 90) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read())


def submit(first_url: str, end_url: str, prompt: str) -> str:
    result = post_json(VIDEO_API, {"query": "", "params": {
        "image_url": first_url,
        "end_image_url": end_url,
        "prompt": prompt,
        "env": "prod",
        "target_image_ratio": "9x16",
    }})
    task_id = result.get("task_id")
    if not task_id:
        raise RuntimeError(f"video submit returned no task_id: {result}")
    return task_id


def poll(task_id: str, timeout: int = 1800) -> str:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            result = post_json(VIDEO_TASK_API, {"query": "", "params": {"task_id": task_id}}, timeout=60)
            status = result.get("status")
            if status == "success":
                return result["url"]
            if status == "failed":
                raise RuntimeError(f"video task failed: {result}")
        except urllib.error.URLError as error:
            print(f"  poll transient error for {task_id}: {error}", flush=True)
        time.sleep(15)
    raise TimeoutError(f"video task timed out: {task_id}")


def download(url: str, destination: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=240) as response:
        destination.write_bytes(response.read())


def process(job: tuple[str, str, str], hero_url: str, end_urls: dict[str, str]) -> tuple[str, str]:
    clip_id, end_path, prompt = job
    destination = OUT / f"{clip_id}.mp4"
    if destination.exists() and destination.stat().st_size > 100_000:
        return clip_id, "skip"
    try:
        print(f"[submit] {clip_id}", flush=True)
        task_id = submit(hero_url, end_urls[end_path], prompt)
        print(f"  {clip_id}: task={task_id}", flush=True)
        result_url = poll(task_id)
        download(result_url, destination)
        print(f"  {clip_id}: saved {destination.stat().st_size} bytes", flush=True)
        return clip_id, "ok"
    except Exception as error:  # keep other jobs alive and report all failures together
        print(f"  {clip_id}: FAILED {error}", flush=True)
        return clip_id, f"error: {error}"


def main() -> None:
    selected = set(sys.argv[1:])
    jobs = [job for job in JOBS if not selected or job[0] in selected]
    if not jobs:
        raise SystemExit("No matching clip IDs")

    OUT.mkdir(parents=True, exist_ok=True)
    hero_url = HERO_URL
    end_urls = END_URLS
    print(f"[anchors] hero: {hero_url}", flush=True)

    results: list[tuple[str, str]] = []
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = []
        for index, job in enumerate(jobs):
            futures.append(executor.submit(process, job, hero_url, end_urls))
            if index < len(jobs) - 1:
                time.sleep(20)
        for future in as_completed(futures):
            results.append(future.result())

    print("[results]", flush=True)
    for clip_id, status in sorted(results):
        print(f"  {clip_id}: {status}", flush=True)
    failures = [clip_id for clip_id, status in results if status.startswith("error")]
    if failures:
        raise SystemExit(f"failed clips: {', '.join(failures)}")


if __name__ == "__main__":
    main()
