#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Build the pinned, unchanged C game and the browser integration with emcc."""
from pathlib import Path
import os
import shutil
import subprocess
import sys
import tarfile

ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = ROOT / "third_party/sdl-sopwith"
EMSDK = ROOT / ".tools/emsdk"
EMCC = EMSDK / "upstream/emscripten/emcc.py"
OUTPUT = ROOT / "dist"

def main():
    source_only = "--source-only" in sys.argv[1:]
    if not source_only and not EMCC.exists():
        sys.exit("Emscripten missing. Follow README.md to install Emscripten 4.0.10 locally.")
    (OUTPUT / "engine").mkdir(parents=True, exist_ok=True)
    (OUTPUT / "source").mkdir(parents=True, exist_ok=True)
    sources = sorted(p for p in (UPSTREAM / "src").glob("*.c") if p.name not in ("swmove.c", "swcollsn.c", "video.c"))
    sources += [UPSTREAM / "src/sdl" / name for name in
                ("main.c", "video.c", "pcsound.c", "controller.c")]
    sources += [ROOT / "web/bridge.c", ROOT / "web/trainer.c", ROOT / "web/scene.c", ROOT / "web/variant.c", ROOT / "web/move.c", ROOT / "web/collisions.c", ROOT / "web/video.c"]
    env = os.environ.copy()
    env["EM_CONFIG"] = str(EMSDK / ".emscripten")
    env["EMSDK_PYTHON"] = sys.executable
    cmd = [sys.executable, str(EMCC), *map(str, sources),
           "-I" + str(ROOT / "web"), "-I" + str(UPSTREAM / "src"),
           "-O2", "-g2", "-fexceptions", "-sUSE_SDL=2", "-sASYNCIFY",
           "-sASYNCIFY_STACK_SIZE=65536", "-sSTACK_SIZE=1048576",
           "-sASSERTIONS=1", "-sSTACK_OVERFLOW_CHECK=2",
           "-sSUPPORT_LONGJMP=emscripten", "-sFORCE_FILESYSTEM", "-lidbfs.js", "-Wl,-u,ntohs",
           "-sALLOW_MEMORY_GROWTH", "-sENVIRONMENT=web", "-sMODULARIZE",
           "-sEXPORT_NAME=createSopwith", "-sINVOKE_RUN=0",
           '-sEXPORTED_FUNCTIONS=["_main","_web_key","_web_bomb","_web_pause","_web_palette","_web_sound","_web_read","_web_trainer","_web_input_mode","_web_scene","_web_variant","_web_easy","_web_wingman","_web_test","_web_effects"]',
           '-sEXPORTED_RUNTIME_METHODS=["FS","IDBFS","callMain","HEAP32","HEAPU8"]',
           "-o", str(OUTPUT / "engine/sopwith.js")]
    if not source_only:
        subprocess.run(cmd, cwd=ROOT, env=env, check=True)
    shutil.copyfile(UPSTREAM / "icon.png", OUTPUT / "plane.png")
    shutil.copyfile(UPSTREAM / "COPYING.md", ROOT / "COPYING.md")
    shutil.copyfile(UPSTREAM / "COPYING.md", OUTPUT / "source/COPYING.md")
    shutil.copyfile(UPSTREAM / "AUTHORS", OUTPUT / "source/AUTHORS.txt")
    shutil.copyfile(ROOT / "NOTICE.md", OUTPUT / "source/NOTICE.md")
    for notice in (ROOT / "licenses").glob("*.txt"):
        shutil.copyfile(notice, OUTPUT / "source" / notice.name)
    # Keep each downloadable part below GitHub's 100 MiB per-file limit.
    # All four extract into the same tree; no media is omitted from sources.
    # Balance original raster art across two parts, leaving room for new art.
    artwork = [p for p in (OUTPUT / 'assets').rglob('*')
               if p.is_file() and p.suffix.lower() in ('.png', '.jpg', '.jpeg')]
    art_parts, art_sizes = [[], []], [0, 0]
    for path in sorted(artwork, key=lambda p: (-p.stat().st_size, p.as_posix())):
        part = min(range(2), key=lambda i: art_sizes[i])
        art_parts[part].append(path)
        art_sizes[part] += path.stat().st_size
    with tarfile.open(OUTPUT / "source/sopwith-web-source.tar.gz", "w:gz") as bundle:
        for name in ("third_party/sdl-sopwith", "web", "server", "scripts", "tests", "licenses", ".github",
                     "README.md", "COPYING.md", "LICENSE", "NOTICE.md", "VALIDATION.md"):
            bundle.add(ROOT / name, arcname="sopwith-web/" + name,
                       filter=lambda info: None if any(p in ("__pycache__", "node_modules", ".git") for p in Path(info.name).parts) else info)
        for path in OUTPUT.iterdir():
            if path.is_file() and path.suffix in (".html", ".js", ".css", ".svg", ".json"):
                bundle.add(path, arcname="sopwith-web/dist/" + path.name)
        if (OUTPUT / "assets").exists():
            bundle.add(OUTPUT / "assets", arcname="sopwith-web/dist/assets",
                       filter=lambda info: None if info.name.startswith("sopwith-web/dist/assets/audio")
                       or (info.isfile() and Path(info.name).suffix.lower() in ('.png', '.jpg', '.jpeg')) else info)
    for index, paths in enumerate(art_parts, 1):
        with tarfile.open(OUTPUT / f'source/sopwith-web-artwork-{index}.tar.gz', 'w:gz') as bundle:
            for path in sorted(paths):
                bundle.add(path, arcname='sopwith-web/' + path.relative_to(ROOT).as_posix())
            bundle.add(ROOT / 'NOTICE.md', arcname='sopwith-web/NOTICE.md')
            bundle.add(OUTPUT / 'assets/ARTWORK.md', arcname='sopwith-web/dist/assets/ARTWORK.md')
    with tarfile.open(OUTPUT / "source/sopwith-web-audio-source.tar.gz", "w:gz") as bundle:
        bundle.add(OUTPUT / "assets/audio", arcname="sopwith-web/dist/assets/audio")
    print("Packaged complete code, artwork and audio archives." if source_only else
          "Built dist/engine/sopwith.wasm and complete code/artwork/audio archives.")

if __name__ == "__main__":
    main()
