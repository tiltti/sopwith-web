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

Rainbow Patrol keeps the original engine's collision masks and terrain data.
New illustrated sprites are fitted to the occupied native frame bounds;
their visual contours are separate from the unchanged collision pixels.
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
[BigSoundBank, Moo 0845](https://bigsoundbank.com/moo-s0845.html), is retained and
trimmed for the cow reaction. The whistle, cannon report and fanfare are
original synthesized cues in the GPL mixer code.

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
ballistic gravity only in Rainbow. The vendored upstream source is unchanged and pinned to the
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
