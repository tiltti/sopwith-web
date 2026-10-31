#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Run real C game rules headlessly; requires a native SDL2 development package."""
from pathlib import Path
import os
import shlex
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "third_party/sdl-sopwith/src"


def main():
    output = ROOT / "build"
    output.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="trainer-test-", dir=output) as directory:
        temporary = Path(directory)
        prefs = temporary / "prefs"
        prefs.mkdir()
        flags = ["-std=gnu11", "-DSDL_MAIN_HANDLED", "-I" + str(ROOT / "web"), "-I" + str(SRC)]
        cflags = shlex.split(subprocess.check_output(["pkg-config", "--cflags", "sdl2"], text=True))
        libs = shlex.split(subprocess.check_output(["pkg-config", "--libs", "sdl2"], text=True))
        compiler = os.environ.get("CC", "cc")
        video_object = temporary / "video.o"
        subprocess.run([compiler, *flags, *cflags, "-DVid_GetPrefPath=Native_Vid_GetPrefPath",
                        "-c", str(SRC / "sdl/video.c"), "-o", str(video_object)], check=True)
        sources = sorted(SRC.glob("*.c"))
        sources += [SRC / "sdl" / name for name in ("pcsound.c", "timer.c", "controller.c")]
        sources += [ROOT / "web/trainer.c", ROOT / "tests/trainer.c"]
        binary = temporary / "trainer-test"
        subprocess.run([compiler, *flags, *cflags, '-DWEB_TEST_PREF_PATH="' + str(prefs) + '/"',
                        *map(str, sources), str(video_object), *libs, "-lm", "-o", str(binary)], check=True)
        env = os.environ.copy()
        env["SDL_VIDEODRIVER"] = "dummy"
        env["SDL_AUDIODRIVER"] = "dummy"
        subprocess.run([str(binary)], env=env, check=True, timeout=30)


if __name__ == "__main__":
    main()
