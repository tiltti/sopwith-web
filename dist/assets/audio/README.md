# Rainbow Patrol sound samples

Author: **Kenney**. License: **CC0 1.0 Universal**, with the full text in
`LICENSE.txt`. The original source listings explicitly mark these packs CC0:

- [Sci-fi Sounds 1.0](https://kenney.nl/assets/sci-fi-sounds):
  `engineCircular_000.ogg`, `explosionCrunch_000.ogg`,
  `lowFrequency_explosion_000.ogg`.
- [Impact Sounds 1.0](https://kenney.nl/assets/impact-sounds):
  `impactPunch_heavy_000.ogg`, `impactMetal_light_000.ogg`.

Acquired 2026-11-01. The original download returned HTTP 403; these five files
were obtained from the independent
[Open Game SFX Index mirror](https://github.com/Mcamento8/open-game-sfx-index)
at commit `34bbe8b525b5ceff3804915ea745532af11f6055`. Their Git blob hashes
were checked against that pinned tree. `SOURCES.json` records exact URLs,
original blob hashes, file sizes and SHA-256 hashes for the closed file roster.
This verifies the mirror bytes; it is not a byte comparison to the unavailable
official ZIP. No code from the mirror is used.

Original OGG files are retained in `original/`. `scripts/prepare_audio.py`
converts them with ffmpeg to mono 22050 Hz 8-bit PCM WAV. The game uses a short
punch attack for gunfire, mixes the two explosion samples and varies
the engine playback rate with native speed. Runtime gain, pitch, stereo pan,
short envelopes and a low-pass filter give an Amiga-era sample-player feel.
The original PC-speaker renderer remains in the classic edition.

The current mixer has five named voice slots. It creates no AudioContext or sample
requests until sound is explicitly enabled. Pause, mute and round end stop
all voices. No third-party audio host is contacted during play.


Joseph SARDIN's [Moo (0845), BigSoundBank](https://bigsoundbank.com/moo-s0845.html)
is also **CC0 1.0**, explicitly stated on its original download page. The original
24-second WAV is retained as `original/moo-0845.wav`. The first moo is trimmed
from 0.15 seconds for 1.95 seconds, amplified 1.7×, and converted to mono 22050 Hz
8-bit PCM as `cow-moo.wav`. Exact source URL/hash and conversion are recorded in
`web/moo-source.json` and `SOURCES.json`.

The bomb's falling whistle and release clunk and cannon report are synthesized
by original GPL code in `rainbow-audio.js`. They use 22050 Hz and 8-bit
quantization. Cannon bursts and machine guns cannot cut off a cow reaction;
the friendly-target trombone uses a separate jingle slot. Muted events
are consumed silently and never replayed when sound is enabled later.


## v0.5 recorded cues and splash music

The currently used new cues are in `audition-v05/`, with retained provider source
files, exact source URLs, licenses, conversion details and SHA-256 in
`audition-v05/SOURCES.json`. The older cow source above remains for provenance.

- Fanfare (retained for provenance/audition; removed from target destruction):
  **Graciano Choc / gchoc**, “Trumpet Fanfare”, OpenGameArt, CC0.
- Friendly-target disappointment: **kirbydx**, “wah wah sad trombone.wav”,
  Freesound, CC0. The downloaded public HQ MP3 rendition is retained.
- Cow: **spurioustransients**, “Cow moo #8”, Freesound, CC0. A 2.5-second
  excerpt at original pitch, with rumble filtering, loudness normalization and
  stronger mix gain, replaces the previous quiet excerpt.
- Bird impact: **Joseph SARDIN**, “Crow #1 / 2764”, BigSoundBank, CC0.
- Startup/idle: **Torsten Nilsson**, “Flywheel starting radial engine”,
  [Sounds of Changes](https://www.soundsofchanges.eu/sound/flywheel-starting-radial-engine/),
  **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.
  Recorded 7 July 2016; Swedish J22 / STWC-3 Twin Wasp radial engine.
  Adapted from the provider MP3: a compressed/faded 2.4-second startup excerpt
  and a crossfaded 2.88-second idle loop. This is not a Sopwith Camel recording.
  Full license text: `licenses/CC-BY-4.0.txt`, also distributed in `source/`.
- Splash: **Spring Spring**, “War Theme (version 2)”,
  [OpenGameArt](https://opengameart.org/content/war-theme), CC0.
  Original composition with military/orchestral/FM character; not a historical
  WWII recording. Full piece converted to 22050 Hz stereo AAC at 64 kbps,
  low-passed at 7 kHz. Original OGG retained.

The game mixer has five bounded slots, with the friendly-target warning separate
from gunfire. The current version loads thirteen samples and synthesizes three cues. Splash music uses a
single opt-in HTML audio player and stops before play. The same CC0 War Theme
returns on the initials/high-score debrief at gain 0.13 (splash: 0.17), continues
through score saving, and stops on a new flight, mute or tab hiding. Startup plays once for
each sound-enabled player spawn, including respawns and new levels; refueling,
pause and unmute cannot replay it. The game still creates no audio requests or contexts on a
muted launch. The look study page has explicit audition buttons only.

Regenerate from retained sources with `python scripts/prepare_audio_v05.py`
(requires ffmpeg's native AAC encoder). No runtime audio comes from third parties.


## Mission / pilot samples (2026-11-02)

`patrol-v06/` retains the original human hurt recording (EZduzziteh, CC0,
[Hurt Sound Effects](https://opengameart.org/content/hurt-sound-effects)) and
[De-Himmel.ogg](https://commons.wikimedia.org/wiki/File:De-Himmel.ogg) by
[Jeuwre](https://commons.wikimedia.org/wiki/User:Jeuwre),
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The modified
Himmel sample retains that license. EQ/dynamics, silence trimming, mono
conversion and 22050 Hz resampling are recorded in `patrol-v06/SOURCES.json`;
original pitch is preserved. The earlier victory fanfare/march is a 7.8-second mix of
the existing gchoc and Spring Spring CC0 recordings. Rebuild using
`scripts/prepare_audio_v06.py`. The earlier synthesized dive has been replaced by the user-created sample
documented below; it is not a recording of a specific aircraft. All playback remains opt-in.

## Recorded victory fanfare (2026-11-08)

**Victory Fanfare** by **humanoide9000 / Luis Humanoide**,
[Freesound 466133](https://freesound.org/people/humanoide9000/sounds/466133/),
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), replaces the earlier
layered mix during each successful mission departure. The retained source is
the official HQ MP3 preview (44.1 kHz stereo), not the login-only original WAV.
The game adaptation remains CC BY 4.0.

Processing: trim 0.20–9.80 s, pitch-preserving 1.4x tempo, loudness normalization
to -16 LUFS / -1.5 dBTP, 15 ms attack and 400 ms tail fades, stereo PCM16 at
32 kHz. The resulting 6.816-second cue fits the unchanged 7.2-second departure
without clipping its musical ending. No other music is mixed into it.
It plays once per victory; mute, pause and a new flight stop it. Source bytes,
transformation details and SHA-256 hashes: `victory-v23/SOURCES.json`.
Rebuild offline with `python3 scripts/prepare_victory_v23.py` (ffmpeg required).
Full CC BY 4.0 text is distributed at `../../source/CC-BY-4.0.txt`.

## User-created falling aircraft sample (2026-11-02)

**Falling aircraft — generated with elevenlabs.io** by the project owner, supplied
for this game. Provider [Sound Effects terms](https://elevenlabs.io/creative-terms)
apply to this audio, separately from the GPL code; it is not designated CC0.
Only the integrated functional runtime in `rainbow-audio.js` is distributed,
not a standalone sound library or source WAV. The local contributor original
and preview remain development files outside the public repository.

Adaptation: first 4 seconds, mono PCM16 / 22050 Hz, 90 Hz high-pass / 7 kHz
low-pass, 20 ms attack and 200 ms tail fades, constant +11.905 dB gain bounded
to −2 dBFS peak. Natural pitch/envelope preserved. During play a small velocity
pitch adjustment and pan follow the falling aircraft. It plays once per fall,
never loops/restarts at sample end, and hands off to an impact on ground contact.
Mute consumes falls silently. Exact hashes and contributor provenance:
`web/user-dive-source.json`; processing: `scripts/prepare_user_dive.py`.
The mixer currently decodes thirteen samples (twelve local WAV URLs plus the
embedded sample) and generates three cues. Sound remains off on first launch.
