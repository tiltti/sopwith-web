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
converts them with ffmpeg to mono 22050 Hz 8-bit PCM WAV. The game layers short
punch/metal attacks for gunfire, mixes the two explosion samples and varies
the engine playback rate with native speed. Runtime gain, pitch, stereo pan,
short envelopes and a low-pass filter give an Amiga-era sample-player feel.
The original PC-speaker renderer remains in the classic edition.

The mixer has four named voice slots. It creates no AudioContext or sample
requests until sound is explicitly enabled. Pause, mute and round end stop
all voices. No third-party audio host is contacted during play.
