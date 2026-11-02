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
  a separate, screen-filling Amiga-inspired arcade edition. A painted splash,
  pixel-font menus and three-character high-score entry surround a higher-detail
  renderer with a smooth camera, illustrated sprites and a dedicated bottom HUD.

The hub and info pages are separate from the game. Changing editions stops the
previous game. Audio starts disabled on every page load and can be enabled with
the sound button or S during flight. It never starts automatically.

## Rainbow Patrol renderer and variant rules

`web/scene.c` exports a read-only native snapshot: ABI v3 has a 28-integer header,
320 ground heights and up to 256 object records of 18 integers, including stable
object identity and projectile-owner kind. The C simulation remains at 10 Hz.
`dist/rainbow-timeline.js` interpolates camera, positions and aircraft angles on
requestAnimationFrame, without changing collision masks or native state. It
snaps across respawns and holds its clock while paused.

The Canvas 2D framebuffer is **1920 × 1404**: a logical 640 × 400 flight area,
plus a separate 68-pixel instrument strip, rendered at 3× detail. Higher-detail
atlas crops remain intact instead of first reducing them to a 34-pixel sprite.
Terrain strips are cached and slide smoothly. The original source landscape is
restored under buildings; foundations bridge slopes instead of cutting abrupt
platforms. Vehicles follow the slope. Cow collision masks are scaled with the art. The map plots true world altitude,
birds and ground objects below the flight area; no instruments hide targets.
The highest buildings at both map ends now sit on smoothly lowered hillsides,
leaving at least 32 native pixels of space above their roofs. Central airfields
and the outer map walls retain their original heights. Cows use slightly larger
9×7 collision silhouettes so low, level gunfire can hit them.
Aircraft artwork now keeps the same world dimensions through every rotation.
The scene includes soft drifting smoke, muzzle flashes, brass-colored tracers,
independent crewed ground AA emplacements, tank recoil, ballistic tank shells and animated cows
that topple and remain lying down. One level rainbow is masked by actual terrain.

The Sopwith flight model, AI, terrain and native collision masks remain the base.
Rainbow-only integration rules are in `web/variant.c`:

- Hold B/the screen bomb control to aim; release to drop **one** bomb. A quick
  tap does the same. Holding cannot spend the whole stock. Blur/pause cancel.
- Five starting bombs; returning to base replenishes supplies. Separate releases
  may leave several bombs airborne. The guide estimates terrain impact, without
  accounting for intervening buildings or other objects.
- A return-to-base wrapper captures the aircraft one flight step earlier, before
  collision checking can crash it into the runway during its final approach.
  The original autopilot remains in the classic edition.
- Ground tank shots have gravity and their own muzzle events. Target destruction
  gives a brief TARGET DESTROYED message without a repeating victory fanfare.
  Ground units have painted team panels and matching flags: mint/plus for friendly,
  red/bar for enemy, also explained in the HUD.
- In Rainbow settings, starting level 2 enables ground return fire without enemy
  aircraft when choosing YKSINPELI. Level 1 is quiet; level 3 increases aggression.
  The selection is saved for the next flight and does not change a flight underway.
  The splash's LEVEL 2 button starts that single-player mode directly.

`dist/rainbow-ui.js` supplies keyboard/mouse/touch arcade menus. Game over shows the current board and provisional rank behind
exactly three A–Z/0–9 initials, editable by typing or arrows. Saving ends on
the top-ten high-score list with qualifying submitted local runs highlighted.
Entry shows the provisional rank even below tenth place. The pause/settings
screens use the game's own style. Fullscreen transitions do not pause the game
through a transient visibility event; changing tabs normally still does.
The splash menu also has a KOKO NÄYTTÖ toggle before starting a game; its label
changes to IKKUNATILA while fullscreen is active.

`dist/rainbow-audio.js` uses five named Web Audio voice slots. Recorded CC0
gunfire, impacts, explosions, cow, bird and jingle cues are bundled alongside
a CC BY 4.0 radial-engine recording. Retained provider files, conversions and
attribution are documented in the audio README. Whistle/clunk and cannon cues
are synthesized by original code. Sounds follow native events, with priorities
protecting the cow reaction and friendly-target warning. No context or sample request exists
before explicit sound enable. Mute/pause/loss stop voices. The friendly-target
sad trombone has its own bounded jingle slot. A short real radial-engine startup
plays once for every sound-enabled player spawn, including respawns and new levels;
refueling, pause and unmute do not replay it. The natural-pitch moo uses a longer,
loudness-normalized excerpt and stronger mix gain. Disabled
aircraft descend with fire/smoke, crash audio and an occasional burning parachute
bailout. Bird/flock hits have grouped squawks and feather sprays. Classic retains its PC-speaker audio.

`dist/assets/ARTWORK.md` records all full imagegen PNGs and prompts. The arcade
font is Press Start 2P under OFL 1.1. Provenance/licenses are in `NOTICE.md` and
`dist/assets/`; `web/ASSET-LOCK.json` locks the complete asset roster. RETRY,
Rainbow Islands and Amiga-era games are references; none of their files is bundled.
WebGL or Three.js is not required for this measured 2D path. A separate flight
model and new obstacle courses are future work.

## Art-direction studies

[Compare A/B/C](https://tiltti.github.io/sopwith-web/look-lab.html) renders the
same composed scene at three environment pixel/detail levels. It includes
flat-color clouds, slope foundations, proportional animals and integrated AA
art. Airfield, hillside and bailout scenes, aircraft rotation, optional animation
and PNG export are provided. These are art-direction studies, not three playable
engines. The final live environment profile awaits the user's selection.

Splash music is Spring Spring's CC0 **War Theme (version 2)**, converted to
22050 Hz stereo AAC. It is an original military/orchestral/FM-style composition,
not a historical WWII recording. The splash sound button is opt-in; title music
stops before gameplay. Full source/license details are in the audio README.

## High scores

Both editions now have separate practice/combat boards. Without a shared
endpoint, scores persist in this browser and the UI explicitly says so. The
player saves a finished run with a nickname; runs that used the trainer are
excluded, even if the trainer was subsequently disabled.

The shared Worker/D1 service is implemented in `server/` and has been deployed
owner-private through Sites. Public service access requires explicit approval;
`dist/leaderboard-config.json` therefore currently has a null endpoint. After
public access is authorised, point that file at the approved service URL.
The service stores nicknames, scores, levels and submission dates, with no
player account or email required. See `server/README.md` for the API and limits.

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
The game is a static website. Native settings use IndexedDB; browser preferences
and high scores use localStorage when available. No backend or account is required
by the game itself.

## Controls

X / right arrow: increase throttle. Z / left arrow: decrease throttle.
Comma / up arrow: elevator up. Slash / down arrow: elevator down.
Period: roll. Space: fire. B: bomb (Rainbow: hold to aim, release to drop).
H: return home. P / Escape: pause.
On-screen buttons provide the same game inputs on touch devices.
S toggles sound during flight. In native game menus S remains the single-player
selection; menu navigation and text entry are handled by the original game.

## Playtest and console trainer

Rainbow settings temporarily expose a TRAINER (TESTI) toggle for playtesting.
It starts off on reload and can be changed before or during a flight. Its UI
must be removed before the final release; see `web/RELEASE-CHECKLIST.md`.

On the game page, enter `trainer()` in the browser's JavaScript developer
console. The player's bombs, gun ammunition, fuel and lives are replenished between
game ticks. Crashes, crash/respawn delays, firing rates and mission
outcomes retain their normal behavior. Use `trainer(false)` to disable it.
The setting carries over to new games on the same page but resets on reload.
It can also be enabled before starting a game. It affects only the player.

The [Info page](https://tiltti.github.io/sopwith-web/info.html) documents the
C / SDL2 / Emscripten / WASM architecture and source provenance.

## Validation

```sh
node tests/browser-controls.mjs
node tests/rainbow-renderer.mjs
node tests/rainbow-assets.mjs
node tests/rainbow-audio.mjs
node tests/rainbow-timeline.mjs
node tests/title-audio.mjs
node tests/leaderboard.mjs
node tests/leaderboard-ui.mjs
python3 scripts/test_trainer.py
python3 scripts/test_scene.py
python3 scripts/test_home.py
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
