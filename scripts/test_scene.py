#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Verify the read-only C scene adapter without SDL or a browser."""
from pathlib import Path
import os
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix="sopwith-scene-") as temp:
    executable = str(Path(temp) / "scene-test")
    subprocess.run([os.environ.get("CC", "cc"), "-std=c99", "-Wall", "-Wextra",
                    "-I" + str(ROOT / "web"), "-I" + str(ROOT / "third_party/sdl-sopwith/src"),
                    str(ROOT / "tests/scene.c"), str(ROOT / "web/scene.c"),
                    "-o", executable], check=True)
    subprocess.run([executable], check=True)
