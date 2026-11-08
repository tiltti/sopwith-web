#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Build the victory cue from the retained CC BY 4.0 Freesound HQ preview."""
from pathlib import Path
import hashlib
import json
import subprocess
import wave

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist/assets/audio/victory-v23"
SOURCE = OUT / "original/victory-fanfare-hq.mp3"
SOURCE_HASH = "d99a915cf6adc87949b939259fd053deaa6d62659a781926a89be3e33375d249"
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH

# The native departure is 72 ticks (7.2 s). Keep the complete musical phrase
# at its original pitch, with a short reverb tail, inside that interval.
filters = (
    "atrim=start=0.20:end=9.80,asetpts=PTS-STARTPTS,atempo=1.4,"
    "loudnorm=I=-16:TP=-1.5:LRA=9,"
    "afade=t=in:d=0.015,afade=t=out:st=6.45:d=0.4"
)
subprocess.run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(SOURCE),
    "-af", filters, "-t", "6.85", "-ac", "2", "-ar", "32000",
    "-c:a", "pcm_s16le", str(OUT / "victory.wav"),
], check=True)

files = []
for path in sorted(OUT.rglob("*")):
    if not path.is_file() or path.name == "SOURCES.json":
        continue
    data = path.read_bytes()
    entry = {"path": path.relative_to(OUT).as_posix(), "bytes": len(data),
             "sha256": hashlib.sha256(data).hexdigest()}
    if path.suffix == ".wav":
        with wave.open(str(path)) as sound:
            entry.update(channels=sound.getnchannels(), rate=sound.getframerate(),
                         seconds=sound.getnframes()/sound.getframerate())
            assert (sound.getnchannels(), sound.getframerate(), sound.getsampwidth()) == (2, 32000, 2)
            assert 6.7 <= entry["seconds"] <= 6.85
    files.append(entry)

receipt = {
    "acquired": "2026-11-08",
    "title": "Victory Fanfare",
    "author": "humanoide9000 / Luis Humanoide",
    "sourceUrl": "https://freesound.org/people/humanoide9000/sounds/466133/",
    "downloadUrl": "https://cdn.freesound.org/previews/466/466133_4361321-hq.mp3",
    "license": "CC-BY-4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "licenseText": "../../../source/CC-BY-4.0.txt",
    "original": "original/victory-fanfare-hq.mp3",
    "sourceFormat": "Freesound official HQ MP3 preview, 44.1 kHz stereo; not the login-only original WAV",
    "output": "victory.wav",
    "changes": "Trim 0.20..9.80 s, pitch-preserving 1.4x tempo, -16 LUFS/-1.5 dBTP normalization, 15 ms attack/400 ms tail fades, stereo PCM16 at 32 kHz; <=6.85 s to fit the existing 7.2 s departure. No music layered over it.",
    "ffmpegFilters": filters,
    "files": files,
}
(OUT / "SOURCES.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
print("Verified CC BY 4.0 source and generated stereo victory WAV inside the 7.2-second departure.")
