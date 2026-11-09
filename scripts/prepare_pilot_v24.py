#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Prepare a real CC0 yell, replacing the spoken Himmel cue."""
from pathlib import Path
import hashlib,json,subprocess,wave
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets/audio/pilot-v24'
source=OUT/'original/3yell9.wav'
assert hashlib.sha256(source.read_bytes()).hexdigest()=='f9c63c26c2dafb9c0dd0859c56c79c9012faf32bf2defdc8b53b19ed23ad0704'
filters='atrim=start=0.32:end=2,asetpts=PTS-STARTPTS,highpass=f=80,lowpass=f=7500,loudnorm=I=-13:TP=-1.5:LRA=7,afade=t=in:d=0.012,afade=t=out:st=1.53:d=0.15'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(source),'-af',filters,'-ac','1','-ar','32000','-c:a','pcm_s16le',str(OUT/'enemy-argh.wav')],check=True)
files=[]
for p in sorted(OUT.rglob('*')):
 if not p.is_file() or p.name=='SOURCES.json':continue
 data=p.read_bytes();entry={'path':p.relative_to(OUT).as_posix(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 if p.suffix=='.wav':
  with wave.open(str(p)) as sound:entry.update(channels=sound.getnchannels(),rate=sound.getframerate(),seconds=sound.getnframes()/sound.getframerate())
 files.append(entry)
(OUT/'SOURCES.json').write_text(json.dumps({'acquired':'2026-11-09','author':'HaelDB','title':'Male Grunt/Yelling sounds / 3yell9.wav','sourceUrl':'https://opengameart.org/content/male-gruntyelling-sounds','downloadUrl':'https://opengameart.org/sites/default/files/yelling%20sounds.zip','archiveSha256':'e9100a4e3b9dcd146993089970dc6097dcf9935fa4683b196040012bad65d67a','archiveMember':'yelling sounds/3yell9.wav','license':'CC0-1.0','licenseUrl':'https://creativecommons.org/publicdomain/zero/1.0/','changes':'Trim 0.32..2 seconds, voice-band EQ, -13 LUFS/-1.5 dBTP normalization, short edge fades; original pitch and tempo; mono PCM16 32 kHz. Replaces the spoken Himmel sample only.','ffmpegFilters':filters,'files':files},indent=2)+'\n')
print('Real CC0 yell prepared: mono PCM16 32 kHz, 1.68 seconds, original pitch.')
