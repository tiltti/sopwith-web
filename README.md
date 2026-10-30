# Sopwith Web

**[Play in your browser](https://tiltti.github.io/sopwith-web/)** ·
[Original project](https://www.sopwith.org/) ·
[SDL Sopwith](https://github.com/fragglet/sdl-sopwith)

Playable browser tribute to David L. Clark's Sopwith II. The game runs as
WebAssembly compiled from C, using SDL Sopwith 2.9.0 as its maintained source
port. Original CGA artwork, terrain, physics and PC-speaker sound are provided
by that project. This is a work in progress; exact equivalence to the 1985 DOS
executable has not been established.

The current milestone is a working classic browser version. A separate custom
variant is planned later; its gameplay is not part of this first milestone.
The page contains the game, control instructions, CGA palette selection and
project/source links. Audio starts disabled on every page load and can be
enabled with the sound button or S. It never starts automatically.

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
in `web/bridge.c`, `web/config.h`, `scripts/build.py` and the top-level files in
`dist/`. The bridge supplies browser input, pause and a timer that excludes
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

## GitHub Pages and continued development

The [Pages workflow](.github/workflows/pages.yml) builds the C game from source
with Emscripten 4.0.10 and deploys `dist/` after a successful push to `main`.
Pull requests run the build and release checks without deploying.

Development continues in this repository. First, verify the classic game's
behavior against the original DOS release. A custom gameplay variant can then
be developed alongside it while preserving the classic mode and author credits.

## Other static hosting

Copy the contents of `dist/` onto an HTTPS static host, preserving relative
paths. Serve `.wasm` as `application/wasm`. This supports installation under
a subdirectory such as `/play/` on sopwith.org. Ship the source archive,
license and credits together with the game.

GitHub Pages hosts the public version. No external account or login is needed
to play it. Any local `.openai/` metadata is unrelated to this public release.
