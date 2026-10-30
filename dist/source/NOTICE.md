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
  input bridge, pause and browser timer adaptation.

The game and new adaptation code are licensed under **GNU General Public
License version 2 or, at your option, any later version**
(`SPDX-License-Identifier: GPL-2.0-or-later`). See [LICENSE](LICENSE),
[COPYING.md](COPYING.md), and individual source-file notices. Existing upstream
notices have not been removed or replaced.

The vendored upstream source is unchanged and pinned to the
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
