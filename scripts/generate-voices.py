"""Record every voice note in the dojos as an MP3 under public/voices/.

    pip install edge-tts
    npm run voices            # only the recordings that are missing
    npm run voices -- --force # re-record everything (after changing a transcript)

Uses Microsoft's free neural voices through edge-tts: no API key. The voices are stock
voices, never a copy of a real person. Commit the MP3s it writes.
"""

import asyncio
import json
import os
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent

# Indian English for English transcripts, Hindi voices for Hinglish (they read Latin-script
# Hinglish well enough and keep the accent).
VOICES = {
    ("en", "male"): "en-IN-PrabhatNeural",
    ("en", "female"): "en-IN-NeerjaNeural",
    ("hinglish", "male"): "hi-IN-MadhurNeural",
    ("hinglish", "female"): "hi-IN-SwaraNeural",
}

# Rough moods: a stressed friend talks faster and higher, a pleading one slower and lower.
MOODS = {
    "casual": {"rate": "+5%", "pitch": "+0Hz"},
    "urgent": {"rate": "+18%", "pitch": "+6Hz"},
    "pleading": {"rate": "-4%", "pitch": "-3Hz"},
}


def voice_notes():
    out = subprocess.run(
        [
            "node",
            "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
            "--import",
            "./scripts/ts-resolve.mjs",
            "scripts/voice-notes.ts",
        ],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return json.loads(out)


async def record(note):
    path = ROOT / note["path"]
    path.parent.mkdir(parents=True, exist_ok=True)
    mood = MOODS[note["mood"]]
    speech = edge_tts.Communicate(
        note["text"],
        VOICES[(note["locale"], note["voice"])],
        rate=mood["rate"],
        pitch=mood["pitch"],
        # aiohttp ignores proxy env vars, so pass one on when there is one.
        proxy=os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy"),
    )
    await speech.save(str(path))
    print(f"recorded {note['path']}")


async def main():
    force = "--force" in sys.argv[1:]
    notes = voice_notes()
    todo = [n for n in notes if force or not (ROOT / n["path"]).exists()]
    for note in todo:
        await record(note)
    print(f"{len(todo)} recorded, {len(notes) - len(todo)} already there")


if __name__ == "__main__":
    asyncio.run(main())
