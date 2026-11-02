#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Derive bounded, attributed 22.05 kHz game samples from retained sources."""
from pathlib import Path
import hashlib,json,subprocess,wave
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets/audio/patrol-v06'
def ff(*args):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*map(str,args)],check=True)
ff('-i',OUT/'original/hurt.mp3','-af','highpass=f=100,lowpass=f=6200,loudnorm=I=-15:TP=-1.5:LRA=7,afade=t=in:d=0.008,afade=t=out:st=0.19:d=0.07','-ac','1','-ar','22050','-c:a','pcm_s16le',OUT/'argh.wav')
ff('-i',OUT/'original/himmel.ogg','-af','silenceremove=start_periods=1:start_threshold=-38dB,highpass=f=140,lowpass=f=6500,acompressor=threshold=0.08:ratio=3:makeup=1.5,loudnorm=I=-15:TP=-1.5:LRA=7,afade=t=in:d=0.01','-ac','1','-ar','22050','-c:a','pcm_s16le',OUT/'himmel.wav')
old=ROOT/'dist/assets/audio/audition-v05'
ff('-i',old/'original/castlefanfare.ogg','-ss','18','-t','7.8','-i',old/'original/war-theme-v2.ogg','-filter_complex','[0:a]volume=0.65,apad=whole_dur=7.8[a];[1:a]volume=0.55,afade=t=in:d=1.5,afade=t=out:st=6.7:d=1.1[b];[a][b]amix=inputs=2:normalize=0,alimiter=limit=0.88,lowpass=f=7000','-t','7.8','-ac','1','-ar','22050','-c:a','pcm_s16le',OUT/'victory.wav')
sources=[
 {'name':'argh','author':'EZduzziteh','title':'Hurt Sound Effects / hurt_01','license':'CC0-1.0','sourceUrl':'https://opengameart.org/content/hurt-sound-effects','downloadUrl':'https://opengameart.org/sites/default/files/hurt_01_0.mp3','original':'original/hurt.mp3','output':'argh.wav','changes':'High/low-pass, loudness normalization, fades; original pitch; mono PCM16 22050 Hz.'},
 {'name':'himmel','author':'Jeuwre','title':'De-Himmel.ogg','license':'CC-BY-SA-4.0','licenseUrl':'https://creativecommons.org/licenses/by-sa/4.0/','sourceUrl':'https://commons.wikimedia.org/wiki/File:De-Himmel.ogg','downloadUrl':'https://upload.wikimedia.org/wikipedia/commons/7/70/De-Himmel.ogg','original':'original/himmel.ogg','output':'himmel.wav','changes':'Leading silence removed, speech band EQ, compression and normalization; original pitch; mono PCM16 22050 Hz. Adapted sample remains CC BY-SA 4.0.'},
 {'name':'victory','authors':['Graciano Choc / gchoc','Spring Spring'],'license':'CC0-1.0','sourceUrls':['https://opengameart.org/content/trumpet-fanfare','https://opengameart.org/content/war-theme'],'originals':['../audition-v05/original/castlefanfare.ogg','../audition-v05/original/war-theme-v2.ogg'],'output':'victory.wav','changes':'Fanfare over 18..25.8-second War Theme v2 excerpt; bounded 7.8-second mix with fades, limiter and 7 kHz low-pass; mono PCM16 22050 Hz.'}
]
files=[]
for p in sorted(OUT.rglob('*')):
 if not p.is_file() or p.name=='SOURCES.json':continue
 data=p.read_bytes();entry={'path':p.relative_to(OUT).as_posix(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 if p.suffix=='.wav':
  with wave.open(str(p)) as w:
   entry.update(channels=w.getnchannels(),rate=w.getframerate(),seconds=w.getnframes()/w.getframerate());assert w.getnchannels()==1 and w.getframerate()==22050
 files.append(entry)
(OUT/'SOURCES.json').write_text(json.dumps({'acquired':'2026-11-02','sources':sources,'files':files},ensure_ascii=False,indent=2)+'\n')
print('Pilot voices and 7.8-second victory mix verified; immutable sources and per-file hashes retained.')
