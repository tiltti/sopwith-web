# Sopwith Tribute

**[Play in your browser](https://tiltti.github.io/sopwith-web/)** ·
[Original project](https://www.sopwith.org/) ·
[SDL Sopwith](https://github.com/fragglet/sdl-sopwith)

Playable browser tribute to David L. Clark's Sopwith II. The game runs as
WebAssembly compiled from C, using SDL Sopwith 2.9.0 as its maintained source
port. Original CGA artwork, terrain, physics and PC-speaker sound are provided
by that project. This is a work in progress; exact equivalence to the 1985 DOS
executable has not been established.

The collection homepage links two separately playable editions:

- **[Sopwith II](https://tiltti.github.io/sopwith-web/classic.html)**: the classic
  SDL/CGA renderer, two palettes and original PC-speaker sound.
- **[Sopwith: Rainbow Patrol](https://tiltti.github.io/sopwith-web/rainbow.html)**:
  an Amiga-inspired 640×400 pixel renderer with shaded sprites, bright skies,
  parallax clouds, a rainbow, flight trails and new instruments. Its first
  release retains the classic game's controls, physics, AI, terrain and combat.

The common navigation links are normal pages, so changing editions stops the
previous game. More editions can be added without changing either engine path.
Audio starts disabled on every page load and can be
enabled with the sound button or S. It never starts automatically.

## Rainbow Patrol renderer

`web/scene.c` exports a read-only snapshot of the current C game state. Its
versioned integer ABI is documented in `web/scene.h`: a 24-integer header,
320 ground heights and up to 256 object records of 16 integers. Sprite bytes
remain owned by the original engine. `dist/rainbow-renderer.js` reads a fresh
heap view when a native tick changes and draws at twice the native resolution.
The terrain and sprite silhouettes use the same data as native collisions.
Menus, text entry and end screens fall back to the original SDL display.

The scene adapter does not change game state or upstream sources. Artwork in
`dist/assets/tribute-mark.svg` and the background renderer is original to this
project. Amiga-era pixel games, Rainbow Islands and Rovio's RETRY are visual
references; their assets and code are not included. A separate flight model or
new obstacle courses are not implemented in this first visual edition.

## Source and credits

- Original game: David L. Clark / BMB Compuscience Canada.
- SDL source port: Simon Howard and the contributors in
  `third_party/sdl-sopwith/AUTHORS`.
- Upstream: <https://github.com/fragglet/sdl-sopwith>
- Pinned release: `sdl-sopwith-2.9.0`.
- Download: <https://codeload.github.com/fragglet/sdl-sopwith/tar.gz/refs/tags/sdl-sopwith-2.9.0>
- License: **GPL-2.0-or-later**. See [LICENSE](LICENSE),
  [copyright and dependency notices](NOTICE.md), and upstream headers.

The vendored upstream directory is unchanged. The new browser integration is
in `web/`, `scripts/` and the top-level files in
`dist/`. The bridge supplies browser input, pause, trainer controls and a timer that excludes
paused time. All new integration files are also GPL v2 or later.

## Build

Requires Python 3.10+ and Emscripten 4.0.10. Install emsdk in `.tools/emsdk`,
then run from this directory:

```sh
git clone https://github.com/emscripten-core/emsdk.git .tools/emsdk
python3 .tools/emsdk/emsdk.py install 4.0.10
python3 .tools/emsdk/emsdk.py activate 4.0.10
python3 scripts/build.py
```

Use a Python 3.10+ executable explicitly if the system `python3` is older.
The compiler, SDK and caches remain inside `.tools/`, which is ignored by Git.
The build emits `dist/engine/sopwith.js`, `dist/engine/sopwith.wasm` and the
complete corresponding source archive at `dist/source/sopwith-web-source.tar.gz`.

## Play locally

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Open <http://127.0.0.1:8080>. An HTTP server is required for WASM loading.
The game is a static website. Its settings and high scores are stored locally
in the browser's IndexedDB when available. No backend or account is required
by the game itself.

## Controls

X / right arrow: increase throttle. Z / left arrow: decrease throttle.
Comma / up arrow: elevator up. Slash / down arrow: elevator down.
Period: roll. Space: fire. B: bomb. H: return home. P / Escape: pause.
On-screen buttons provide the same game inputs on touch devices.
S toggles sound during flight. In native game menus S remains the single-player
selection; menu navigation and text entry are handled by the original game.

## Console trainer

On the game page, enter `trainer()` in the browser's JavaScript developer
console. The player's bombs, gun ammunition and lives are replenished between
game ticks. Crashes, crash/respawn delays, fuel use, firing rates and mission
outcomes retain their normal behavior. Use `trainer(false)` to disable it.
The setting carries over to new games on the same page but resets on reload.
It can also be enabled before starting a game. It affects only the player.

The [Info page](https://tiltti.github.io/sopwith-web/info.html) documents the
C / SDL2 / Emscripten / WASM architecture and source provenance.

## Validation

```sh
node tests/browser-controls.mjs
node tests/rainbow-renderer.mjs
python3 scripts/test_trainer.py
python3 scripts/test_scene.py
python3 scripts/verify_release.py
```

The native trainer test requires a C compiler, `pkg-config` and SDL2 development
files. It runs the original crash/respawn and weapon functions with SDL's dummy
video/audio drivers. GitHub Actions runs these tests before building/deploying.

## GitHub Pages and continued development

The [Pages workflow](.github/workflows/pages.yml) builds the C game from source
with Emscripten 4.0.10 and deploys `dist/` after a successful push to `main`.
Pull requests run the build and release checks without deploying.

Development continues in this repository. The classic path remains available
alongside Rainbow Patrol. Future custom mechanics and levels can be developed
in that edition while retaining the classic mode and original author credits.

## Other static hosting

Copy the contents of `dist/` onto an HTTPS static host, preserving relative
paths. Serve `.wasm` as `application/wasm`. This supports installation under
a subdirectory such as `/play/` on sopwith.org. Ship the source archive,
license and credits together with the game.

GitHub Pages hosts the public version. No external account or login is needed
to play it. Any local `.openai/` metadata is unrelated to this public release.
