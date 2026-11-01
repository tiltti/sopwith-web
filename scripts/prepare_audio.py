#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Verify the selected CC0 source roster and prepare Amiga-like 8-bit samples.

Usage: python scripts/prepare_audio.py PATH_TO_DOWNLOADED_OGG_FILES
Requires ffmpeg. No network access or audio playback is performed.
"""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]

def main():
    source = Path(sys.argv[1]).resolve()
    manifest = json.loads((ROOT / 'web/audio-sources.json').read_text())
    target = ROOT / 'dist/assets/audio'
    originals = target / 'original'
    originals.mkdir(parents=True, exist_ok=True)
    roster = []
    for item in manifest['sources']:
        name = Path(item['path']).name
        raw = (source / name).read_bytes()
        digest = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
        assert len(raw) == item['size'] and digest == item['sha'], f'Invalid source: {name}'
        shutil.copyfile(source / name, originals / name)
        output = target / (Path(name).stem + '.wav')
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
                        '-i', str(source / name), '-ac', '1', '-ar', '22050',
                        '-c:a', 'pcm_u8', '-map_metadata', '-1', str(output)], check=True)
        for path in (originals / name, output):
            data = path.read_bytes()
            roster.append({'path':path.relative_to(target).as_posix(),
                           'bytes':len(data), 'sha256':hashlib.sha256(data).hexdigest()})
    (target / 'SOURCES.json').write_text(json.dumps({**manifest,
        'conversion':'ffmpeg: mono, 22050 Hz unsigned 8-bit PCM WAV; originals retained',
        'files':roster}, indent=2) + '\n')
    print(f'Verified {len(manifest["sources"])} CC0 originals; wrote 8-bit WAVs and closed SHA-256 roster.')

if __name__ == '__main__':
    main()
