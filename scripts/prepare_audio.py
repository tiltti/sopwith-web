#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Verify the selected CC0 source roster and prepare Amiga-like 8-bit samples.

Usage: python scripts/prepare_audio.py PATH_TO_ORIGINAL_FILES
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
        if source / name != originals / name:
            shutil.copyfile(source / name, originals / name)
        output = target / (Path(name).stem + '.wav')
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
                        '-i', str(source / name), '-ac', '1', '-ar', '22050',
                        '-c:a', 'pcm_u8', '-map_metadata', '-1', str(output)], check=True)
        for path in (originals / name, output):
            data = path.read_bytes()
            roster.append({'path':path.relative_to(target).as_posix(),
                           'bytes':len(data), 'sha256':hashlib.sha256(data).hexdigest()})
    moo = json.loads((ROOT / 'web/moo-source.json').read_text())
    moo_input = source / moo['path']
    raw = moo_input.read_bytes()
    assert len(raw) == moo['bytes'] and hashlib.sha256(raw).hexdigest() == moo['sha256'], 'Invalid cow source'
    retained = originals / moo['path']
    if moo_input != retained:
        shutil.copyfile(moo_input, retained)
    output = target / 'cow-moo.wav'
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
                    '-ss', '0.15', '-t', '1.95', '-i', str(moo_input),
                    '-af', 'volume=1.7', '-ac', '1', '-ar', '22050', '-c:a', 'pcm_u8', str(output)], check=True)
    for path in (retained, output):
        data = path.read_bytes()
        roster.append({'path':path.relative_to(target).as_posix(), 'bytes':len(data),
                       'sha256':hashlib.sha256(data).hexdigest()})
    (target / 'SOURCES.json').write_text(json.dumps({**manifest,
        'additionalSources':[moo],
        'conversion':'ffmpeg: mono, 22050 Hz unsigned 8-bit PCM WAV; originals retained',
        'files':roster}, indent=2) + '\n')
    print(f'Verified {len(manifest["sources"])+1} CC0 originals; wrote 8-bit WAVs and closed SHA-256 roster.')

if __name__ == '__main__':
    main()
