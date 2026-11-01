#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Verify that the deployed game includes usable files and matching source."""
from html.parser import HTMLParser
from pathlib import Path
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
    for name in ("index.html", "classic.html", "rainbow.html", "runner.html", "info.html"):
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
    for name in ("COPYING.md", "AUTHORS.txt", "NOTICE.md", "SDL2-LICENSE.txt", "Emscripten-LICENSE.txt"):
        assert (DIST / "source" / name).stat().st_size > 0, f"Missing notice: {name}"

    archive = DIST / "source/sopwith-web-source.tar.gz"
    with tarfile.open(archive, "r:gz") as bundle:
        for relative in ("web/bridge.c", "web/trainer.c", "scripts/build.py", "LICENSE", "NOTICE.md",
                         "web/move.c", "tests/home.c", "scripts/test_home.py", "dist/rainbow-ui.css", "dist/rainbow-ui.js", "dist/rainbow-timeline.js", "tests/rainbow-timeline.mjs",
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
