#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
from pathlib import Path
import subprocess,tempfile
root=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(dir=root/'build',prefix='video-bounds-') as tmp:
 binary=Path(tmp)/'test'
 subprocess.run(['cc','-std=c99','-I'+str(root/'web'),'-I'+str(root/'third_party/sdl-sopwith/src'),str(root/'tests/video-bounds.c'),str(root/'web/video.c'),'-o',str(binary)],check=True)
 subprocess.run([str(binary)],check=True)
