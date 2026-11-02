#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Fit a user-supplied dive recording and embed it in the game mixer.

The original and standalone preview stay in the private development workspace.
Only combined game runtime content and provenance are published.
"""
from pathlib import Path
import argparse,array,base64,hashlib,json,math,re,subprocess,tempfile,wave
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,required=True)
parser.add_argument('--preview',type=Path,required=True)
args=parser.parse_args()
source=args.source.read_bytes()
with wave.open(str(args.source)) as w: source_seconds=w.getnframes()/w.getframerate()
(ROOT/'build').mkdir(exist_ok=True)
args.preview.parent.mkdir(parents=True,exist_ok=True)
def ff(*cmd):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*map(str,cmd)],check=True)
with tempfile.TemporaryDirectory(prefix='dive-fit-',dir=ROOT/'build') as temp:
    filtered=Path(temp)/'filtered.wav'
    ff('-i',args.source,'-t','4.0','-af','highpass=f=90,lowpass=f=7000,afade=t=in:d=0.02,afade=t=out:st=3.8:d=0.2','-ac','1','-ar','22050','-c:a','pcm_s16le',filtered)
    with wave.open(str(filtered)) as w:pcm=array.array('h',w.readframes(w.getnframes()))
    peak=max(abs(x) for x in pcm)/32768
    rms=math.sqrt(sum(x*x for x in pcm)/len(pcm))/32768
    gain=min(10**(-2/20)/peak,10**(-18/20)/rms)
    ff('-i',filtered,'-af',f'volume={gain:.9f}','-c:a','pcm_s16le',args.preview)
data=args.preview.read_bytes()
with wave.open(str(args.preview)) as w:
    channels,rate,width,frames=w.getnchannels(),w.getframerate(),w.getsampwidth(),w.getnframes()
    pcm=array.array('h',w.readframes(frames))
peak_db=20*math.log10(max(abs(x) for x in pcm)/32768)
assert (channels,rate,width)==(1,22050,2) and peak_db<=-1.9
url='data:audio/wav;base64,'+base64.b64encode(data).decode('ascii')
path=ROOT/'dist/rainbow-audio.js';code=path.read_text()
replacement='/* USER_DIVE_SAMPLE_START */\n  const USER_DIVE_SAMPLE = '+json.dumps(url)+';\n  /* USER_DIVE_SAMPLE_END */'
code,n=re.subn(r'/\* USER_DIVE_SAMPLE_START \*/.*?/\* USER_DIVE_SAMPLE_END \*/',lambda _:replacement,code,flags=re.S)
assert n==1;path.write_text(code)
metadata={
 'date':'2026-11-02','title':'Falling aircraft — generated with elevenlabs.io',
 'creator':'Project owner; self-generated with ElevenLabs, as stated by the contributor',
 'sourceFilename':args.source.name,'sourceSha256':hashlib.sha256(source).hexdigest(),
 'sourceBytes':len(source),'sourceDurationSeconds':source_seconds,
 'termsUrl':'https://elevenlabs.io/creative-terms','termsChecked':'2026-11-02',
 'rightsNote':'User supplied this self-created sound for adaptation and use in Rainbow Patrol. Provider terms apply to the audio; it is not designated CC0 or relicensed as GPL audio. Only the integrated game runtime is distributed; the original and standalone adaptation are development files.',
 'runtime':'dist/rainbow-audio.js (embedded game content)',
 'processing':'First 4 seconds; 90 Hz high-pass / 7000 Hz low-pass; mono 22050 Hz PCM16; 20ms attack and 200ms tail fades; constant gain bounded to -2 dBFS peak and -18 dBFS RMS. No baked-in pitch change, time stretch or repeated loop.',
 'gainDb':round(20*math.log10(gain),3),'sampleSha256':hashlib.sha256(data).hexdigest(),
 'sampleBytes':len(data),'sampleDurationSeconds':frames/rate,'samplePeakDbfs':round(peak_db,3)
}
(ROOT/'web/user-dive-source.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
print(f'Integrated {frames/rate:.2f}s dive; gain {20*math.log10(gain):.2f} dB, peak {peak_db:.2f} dBFS, mono {rate} Hz. Standalone preview remains outside the repository.')
