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

The mixer has four named voice slots. It creates no AudioContext or sample
requests until sound is explicitly enabled. Pause, mute and round end stop
all voices. No third-party audio host is contacted during play.


Joseph SARDIN's [Moo (0845), BigSoundBank](https://bigsoundbank.com/moo-s0845.html)
is also **CC0 1.0**, explicitly stated on its original download page. The original
24-second WAV is retained as `original/moo-0845.wav`. The first moo is trimmed
from 0.15 seconds for 1.95 seconds, amplified 1.7×, and converted to mono 22050 Hz
8-bit PCM as `cow-moo.wav`. Exact source URL/hash and conversion are recorded in
`web/moo-source.json` and `SOURCES.json`.

The bomb's falling whistle and release clunk, cannon report and short target
fanfare are synthesized by original GPL code in `rainbow-audio.js`. They use
22050 Hz, 8-bit quantization and the same four voice slots. Cannon bursts and
machine guns cannot cut off a cow reaction or the short fanfare. Muted events
are consumed silently and never replayed when sound is enabled later.
