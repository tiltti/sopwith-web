# Copyright, license and provenance

Sopwith Web is a browser adaptation of **SDL Sopwith 2.9.0**, which derives
from David L. Clark's original Sopwith source code. It is an independent
community project and is not presented as an official release by the original
author or the SDL Sopwith maintainers.

## Game and artwork

- **David L. Clark / BMB Compuscience Canada** — original Sopwith game,
  game logic and graphics. The upstream files retain their original
  copyright notices, including Copyright (C) 1984-2000 David L. Clark.
- **Simon Howard and SDL Sopwith contributors** — maintained portable C
  source port. The complete credited author list is preserved in
  [AUTHORS](third_party/sdl-sopwith/AUTHORS).
- **Sopwith Web contributors, 2026** — browser page, build integration,
  input bridge, pause, browser timer adaptation, read-only scene adapter,
  Rainbow Patrol pixel renderer and the Sopwith Tribute insignia.

Rainbow Patrol uses the original engine's collision and terrain data as its base.
New illustrated sprites are fitted around the native world positions;
their visual contours are separate from collision pixels. Aircraft masks remain
native. Rainbow 0.5 supplies smaller cow masks and independent ground AA masks.
Its background scenery, UI and insignia were created for this project.
The new sprite atlases and splash were created with the built-in OpenAI
imagegen tool. The full selected PNGs and final prompts are distributed in
`dist/assets/`, documented by `dist/assets/ARTWORK.md`.
Amiga-era games, Rainbow Islands and Rovio's
RETRY are visual references; no artwork, audio or code from those games is
distributed here. Rainbow Patrol is an independent tribute and is not an
official release from those games' creators.

Rainbow's sample audio uses five **Kenney** sounds from Sci-fi Sounds and
Impact Sounds, both **CC0-1.0**. The unmodified OGG originals, converted
8-bit PCM WAVs, full CC0 text and exact source/hash roster are distributed in
`dist/assets/audio/`. They were obtained from the pinned independent Open
Game SFX Index mirror after the official download returned HTTP 403. Official
license listings, mirror commit, verification scope and runtime changes are
recorded in its README and SOURCES.json. The classic edition's original
PC-speaker sound is unchanged. A CC0 cow recording by **Joseph SARDIN**, from
[BigSoundBank, Moo 0845](https://bigsoundbank.com/moo-s0845.html), is retained
as the previous cow reaction. Its replacement is credited below. The whistle
and cannon report are original synthesized cues in the GPL mixer code.

The arcade UI uses **Press Start 2P**, Copyright 2012 The Press Start 2P Project
Authors, under **SIL Open Font License 1.1**. Its unmodified font, source record
and full license are in `dist/assets/fonts/` and `licenses/PressStart2P-OFL.txt`.

Additional references discussed during development include Triplane Turmoil
and Super Sukkula. Their game files and artwork are not bundled. The new
edition-specific bomb release rules, visual events and score service are
original integration code in this repository, under the same GPL v2+ license.

The game and new adaptation code are licensed under **GNU General Public
License version 2 or, at your option, any later version**
(`SPDX-License-Identifier: GPL-2.0-or-later`). See [LICENSE](LICENSE),
[COPYING.md](COPYING.md), and individual source-file notices. Existing upstream
notices have not been removed or replaced.

Rainbow-only rules live in `web/variant.c`. `web/move.c` wraps the original
return-to-base call so the Rainbow edition can hand off to landing one flight
step earlier; the classic path calls the original function. Tank shells add
ballistic gravity only in Rainbow. Rainbow 0.5 restores continuous source terrain,
places buildings on foundations and gives them independent AA defenses. The vendored upstream source is unchanged and pinned to the
`sdl-sopwith-2.9.0` release. Its source URL and archive SHA-256 are recorded in
[web/UPSTREAM.json](web/UPSTREAM.json). The original DOS executable is retained
separately for local comparison; it is not distributed in this repository.

## Browser runtime dependencies

- **SDL 2.32.0**, compiled by Emscripten's SDL2 port — zlib license.
  See [licenses/SDL2-LICENSE.txt](licenses/SDL2-LICENSE.txt).
- **Emscripten 4.0.10 runtime** — MIT / University of Illinois-NCSA license.
  See [licenses/Emscripten-LICENSE.txt](licenses/Emscripten-LICENSE.txt).

These permissive dependency notices apply to their respective components;
they do not replace the GPL license for the game and adaptation.

The deployed site distributes its matching game/integration source archive,
GPL text, author list and dependency notices in `source/`, alongside the WASM
binary. Redistribution should retain all of them.

## Original projects

- <https://www.sopwith.org/>
- <https://github.com/fragglet/sdl-sopwith>
- <https://fragglet.github.io/sdl-sopwith/>


## Rainbow 0.5 additional artwork and audio

The defense/pilot atlas `dist/assets/rainbow-defense-pilots-v1.png` was created
with the built-in OpenAI imagegen tool. Its unmodified full output and exact
prompt are distributed in `dist/assets/ARTWORK.md`. Look studies A/B/C are
code-rendered scenes made from this project's own assets, not RETRY screenshots.

New CC0 sounds: Graciano Choc / gchoc, **Trumpet Fanfare** (OpenGameArt);
kirbydx, **wah wah sad trombone.wav** (Freesound); spurioustransients,
**Cow moo #8** (Freesound); Joseph SARDIN, **Crow #1 / 2764** (BigSoundBank).
Splash music: Spring Spring, **War Theme (version 2)**, OpenGameArt, CC0.

The radial engine startup and idle loop are adapted from **Flywheel starting
radial engine**, recorded by **Torsten Nilsson**, 7 July 2016, available from
[Sounds of Changes](https://www.soundsofchanges.eu/sound/flywheel-starting-radial-engine/),
under **[Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)**.
Edits: short excerpts, mono 22050 Hz PCM conversion, startup dynamics/fades and
an idle-loop crossfade. The provider MP3 is retained with the source/hash record
in `dist/assets/audio/audition-v05/`. Full CC BY 4.0 text is distributed in
`licenses/CC-BY-4.0.txt` and the deployed `source/` directory. It is a J22 / Twin
Wasp radial engine recording, not a recording of a Sopwith aircraft.

The external audio retains its stated CC0 / CC BY 4.0 license; those licenses
are separate from the GPL license of the game code. The exact credits, original
provider renditions, modifications, source URLs and hashes are recorded in
`dist/assets/audio/audition-v05/SOURCES.json` and `dist/assets/audio/README.md`.


## Rainbow mission and pilot update

Original rear-view aircraft SVG artwork is GPL-2.0-or-later, created as
project-native vector code by Sopwith Web contributors (2026). Ground pilot
poses were created with built-in OpenAI image_gen using the project's existing
pilot artwork as reference. The complete raw output, generation prompt and
provenance are distributed with the GPL-2.0-or-later game. Airborne pilots use
the original generated pilot atlas, unchanged.

Pilot hurt voice: **EZduzziteh, Hurt Sound Effects**, CC0,
https://opengameart.org/content/hurt-sound-effects .
German **De-Himmel.ogg**, by **Jeuwre**, is licensed **CC BY-SA 4.0**:
https://commons.wikimedia.org/wiki/File:De-Himmel.ogg . The adapted sample removes
leading silence and applies EQ, compression, normalization and mono 22050 Hz
conversion; original pitch is retained. The adaptation remains CC BY-SA 4.0.
License and author links are in `licenses/CC-BY-SA-4.0.txt` and deployed `source/`.
Source metadata and original bytes are retained in `assets/audio/patrol-v06/`.

The victory mix combines the previously credited CC0 Trumpet Fanfare and War
Theme v2, with bounded excerpts, gain mixing and fades. The earlier dive sound was an
original procedural cue, replaced in the current update below. Complete processing and hashes:
`dist/assets/audio/patrol-v06/SOURCES.json`, `scripts/prepare_audio_v06.py`.

## Painted flight update (2026-11-02)

New original imagegen artwork, exact prompts, immutable full outputs and hashes
are documented in `dist/assets/ARTWORK.md` and `web/flight-art-v08-files.json`.
It includes the painted coast/terrain, cockpit, wing badge, debrief background,
rear-view departure, animated canopy and faction-specific axial roll sheets.
These project images are distributed with the GPL-2.0-or-later game.

**Falling aircraft — generated with elevenlabs.io.** The project owner supplied
this self-created ElevenLabs sound for adaptation and inclusion in the game.
The audio is subject to [ElevenLabs Creative Platform Terms / Sound Effects
Terms](https://elevenlabs.io/creative-terms), checked 2026-11-02. It is not CC0
and is not relicensed as GPL audio. The functional audio runtime embeds the
four-second adaptation as integrated game content; no standalone original or
adapted sound file is distributed. Code around it remains GPL-2.0-or-later.
`web/user-dive-source.json` records the contributor statement, hashes and
processing. `scripts/prepare_user_dive.py` reproduces the embedded adaptation
when provided with the contributor's original file.

## Scoreboard and cockpit artwork (2026-11-03)

The original scoreboard frame/row/counter atlas and cockpit instrument atlas
were made with built-in OpenAI imagegen using this project's own artwork as
style references. Complete unmodified outputs and the exact prompts/hashes are
retained in `dist/assets/ARTWORK.md` and `web/score-cockpit-v09-*.json` and are
distributed with the GPL-2.0-or-later game. No external artwork was downloaded.

## Explosion and gauge artwork (2026-11-03)

The eight-frame explosion atlas, dashboard counter/tape atlas and layered
ornamental gauges are original built-in OpenAI imagegen outputs using this
project's own artwork and gauge concepts as references. Unmodified production
PNGs, exact prompts, dimensions and hashes are distributed in `dist/assets/`
and `web/effects-dashboard-v10-*.json` with the GPL-2.0-or-later game.

## Campaign artwork (2026-11-03)

Winter/storm scenery, snow/city targets, fossil/flag props, mission materials
and the medal-ceremony background are original built-in OpenAI imagegen outputs.
They use this project's own painted coast as a style reference. Unmodified
production PNGs and exact prompts/hashes are distributed in `dist/assets/` and
`web/campaign-v11-*.json` with the GPL-2.0-or-later game.

## Airfields, water and briefing boards (2026-11-04)

The two new original built-in imagegen atlases are documented in
`web/airfields-v12-prompts.json`, `web/airfields-v12-files.json` and
`dist/assets/ARTWORK.md`. Unmodified images are distributed with this
GPL-2.0-or-later game. The briefing boards use Patrick Hand by Patrick
Wagesreiter (Copyright 2010–2012), SIL Open Font License 1.1, from
https://github.com/google/fonts/tree/main/ofl/patrickhand . The unmodified
font, full license and source/hash record are in
`dist/assets/fonts/patrick-hand/`. The title screen keeps its existing font.
