#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Rebuild the v0.5 cues from retained source bytes; no network or playback."""
from pathlib import Path
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'dist/assets/audio/audition-v05'
manifest=json.loads((BASE/'SOURCES.json').read_text())
for item in manifest['files']:
    if item['path'].startswith('original/'):
        data=(BASE/item['path']).read_bytes()
        assert len(data)==item['bytes'] and hashlib.sha256(data).hexdigest()==item['sha256']
def convert(source,out,filters=None,start=None,duration=None,stereo=False,music=False):
    args=['ffmpeg','-v','error','-y']
    if start is not None:args+=['-ss',str(start)]
    if duration is not None:args+=['-t',str(duration)]
    args+=['-i',str(BASE/'original'/source)]
    if filters:args+=['-filter_complex' if '[' in filters else '-af',filters]
    args+=['-ar','22050','-ac','2' if stereo else '1','-c:a','aac' if music else 'pcm_s16le']
    if music:args+=['-b:a','64k']
    subprocess.run([*args,str(BASE/out)],check=True)
convert('castlefanfare.ogg','fanfare.wav')
convert('sad-trombone.mp3','wah-wah.wav','afade=t=in:d=0.015,afade=t=out:st=4.9:d=0.3,volume=0.7')
convert('cow-moo-8.mp3','moo.wav','afade=t=in:d=0.035,afade=t=out:st=1.6:d=0.15,volume=1.8',2.8,1.75)
convert('crow-2764.wav','bird.wav','afade=t=in:d=0.008,afade=t=out:st=0.25:d=0.07')
convert('radial-j22.mp3','startup.wav','acompressor=threshold=0.03:ratio=3:makeup=1.5,afade=t=in:d=0.015,afade=t=out:st=2.3:d=0.1',39.1,2.4)
convert('radial-j22.mp3','radial-idle.wav','[0:a]asetpts=PTS-STARTPTS,asplit[a][b];[a][b]acrossfade=d=0.12:c1=tri:c2=tri,atrim=start=1.5:end=4.38',60,3)
convert('war-theme-v2.ogg','title-theme.m4a','lowpass=f=7000,afade=t=in:d=0.15',stereo=True,music=True)
print('Verified source bytes and regenerated 7 cues/music files. Review hashes after any ffmpeg version change.')
