#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Verify that the deployed game includes usable files and matching source."""
from html.parser import HTMLParser
from pathlib import Path
import base64
import io
import wave
import re
import hashlib
import json
import tarfile
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = []

    def handle_starttag(self, tag, attributes):
        for name, value in attributes:
            if name in ("src", "href") and value:
                parsed = urlsplit(value)
                if not parsed.scheme and not parsed.netloc and parsed.path:
                    self.paths.append(unquote(parsed.path))


def main():
    for name in ("index.html", "classic.html", "rainbow.html", "runner.html", "info.html", "look-lab.html"):
        parser = References()
        parser.feed((DIST / name).read_text())
        for relative in parser.paths:
            path = DIST / relative
            assert path.exists(), f"Missing local reference in {name}: {relative}"

    assert (DIST / "engine/sopwith.wasm").read_bytes()[:4] == b"\x00asm", "Invalid WASM header"
    roster = json.loads((ROOT / "web/ASSET-LOCK.json").read_text())["files"]
    actual = {p.relative_to(ROOT).as_posix() for p in (DIST / "assets").rglob("*") if p.is_file()}
    assert actual == {item["path"] for item in roster}, "Asset roster is not closed"
    for item in roster:
        data = (ROOT / item["path"]).read_bytes()
        assert len(data) == item["bytes"] and hashlib.sha256(data).hexdigest() == item["sha256"], \
            f"Asset integrity mismatch: {item['path']}"
    for name in ("COPYING.md", "AUTHORS.txt", "NOTICE.md", "SDL2-LICENSE.txt", "Emscripten-LICENSE.txt", "CC-BY-4.0.txt", "CC-BY-SA-4.0.txt"):
        assert (DIST / "source" / name).stat().st_size > 0, f"Missing notice: {name}"

    audio_source = (DIST / "rainbow-audio.js").read_text()
    encoded = re.search(r'const USER_DIVE_SAMPLE = "data:audio/wav;base64,([A-Za-z0-9+/=]+)"', audio_source).group(1)
    sample = base64.b64decode(encoded, validate=True)
    metadata = json.loads((ROOT / "web/user-dive-source.json").read_text())
    assert len(sample) == metadata["sampleBytes"]
    assert hashlib.sha256(sample).hexdigest() == metadata["sampleSha256"]
    with wave.open(io.BytesIO(sample), "rb") as sound:
        assert (sound.getnchannels(), sound.getframerate(), sound.getsampwidth()) == (1,22050,2)
        assert sound.getnframes()/sound.getframerate() == metadata["sampleDurationSeconds"]
    assert not any("sound_of_a_falling" in name or "dive-game-preview" in name for name in actual)
    art_records = [record for name in ("score-cockpit-v09", "effects-dashboard-v10", "campaign-v11", "airfields-v12")
                   for record in json.loads((ROOT / f"web/{name}-files.json").read_text())["files"]]
    for record in art_records:
        data=(ROOT / record["path"]).read_bytes()
        assert len(data)==record["bytes"] and hashlib.sha256(data).hexdigest()==record["sha256"]
        assert data[:8]==b"\x89PNG\r\n\x1a\n"
        assert (int.from_bytes(data[16:20],"big"),int.from_bytes(data[20:24],"big"))==(record["width"],record["height"])
    archive = DIST / "source/sopwith-web-source.tar.gz"
    with tarfile.open(archive, "r:gz") as bundle:
        for relative in ("dist/index.html", "web/airfields-v12-prompts.json", "web/airfields-v12-files.json", "web/campaign-v11-prompts.json", "web/campaign-v11-files.json", "web/effects-dashboard-v10-prompts.json", "web/effects-dashboard-v10-files.json", "web/score-cockpit-v09-prompts.json", "web/score-cockpit-v09-files.json", "scripts/prepare_user_dive.py", "web/user-dive-source.json", "web/flight-art-v08-prompts.json", "web/flight-art-v08-files.json", "web/environment-v08-prompts.json", "web/aircraft-roll-v08-prompt.json", "tests/audio-offline-check.html", "web/bridge.c", "web/trainer.c", "web/collisions.c", "web/pilot-walk-v3-generation.json", "dist/rainbow-stages.js", "tests/patrol.c", "tests/rainbow-stages.mjs", "scripts/prepare_patrol_art.py", "scripts/prepare_audio_v06.py", "scripts/test_patrol.py", "web/RELEASE-CHECKLIST.md", "dist/i18n.js", "tests/i18n.mjs", "server/drizzle/0001_combat_difficulty.sql", "server/db/schema.ts", "scripts/build.py", "LICENSE", "NOTICE.md",
                         "dist/look-lab.html", "dist/look-lab.js", "dist/look-lab.css", "dist/title-audio.js", "tests/title-audio.mjs", "tests/leaderboard-ui.mjs", "scripts/prepare_audio_v05.py", "web/move.c", "tests/home.c", "scripts/test_home.py", "dist/rainbow-ui.css", "dist/rainbow-ui.js", "dist/rainbow-timeline.js", "tests/rainbow-timeline.mjs",
                         "web/scene.c", "web/scene.h", "web/variant.c", "web/variant.h", "tests/scene.c", "tests/rainbow-renderer.mjs", "scripts/test_scene.py",
                         "third_party/sdl-sopwith/src/swmain.c", "dist/app.js", "dist/runner.js", "dist/info.html",
                         "dist/classic.html", "dist/rainbow.html", "dist/rainbow-renderer.js", "dist/tribute.css",
                         "dist/assets/tribute-mark.svg", "dist/assets/classic-cover.svg", "dist/leaderboard.js", "dist/leaderboard-config.json", "server/worker.js",
                         "dist/rainbow-assets.js", "dist/rainbow-audio.js", "web/ASSET-LOCK.json", "web/audio-sources.json",
                         "scripts/prepare_audio.py", "tests/rainbow-assets.mjs", "tests/rainbow-audio.mjs",
                         *(item["path"] for item in roster)):
            member = bundle.extractfile("sopwith-web/" + relative)
            assert member is not None and member.read() == (ROOT / relative).read_bytes(), \
                f"Source archive does not match the working source: {relative}"
    print("Release files, local links, WASM header, notices and corresponding sources verified.")


if __name__ == "__main__":
    main()
