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
  original chalkboard/brass lettering and three-character high-score entry surround a higher-detail
  renderer with a smooth camera, illustrated sprites and a dedicated bottom HUD.

The hub and info pages are separate from the game. Changing editions stops the
previous game. Audio starts disabled on every page load and can be enabled with
the sound button or S during flight. It never starts automatically.

Mission-clear music uses a recorded orchestral **Victory Fanfare** by
humanoide9000 / Luis Humanoide (CC BY 4.0), adapted to a 6.816-second stereo
WAV that fits the departure. Source, license and transformations are retained
in `dist/assets/audio/victory-v23/`.

New flights wait on the refueling screen until START FLIGHT is pressed.
Takeoff cover stays ready while parked, then lasts ten simulation seconds
from initial movement. It protects against object collisions, including
hostile fire and wreckage, and prevents nearby hostile bomb releases. The home runway is kept at
its prepared terrain profile so repeated crashes cannot dig a respawn pit.
Landing/refueling does not renew the cover; normal terrain collisions remain.

Settings also offers **Infinite supplies** (ammo, fuel and bombs) independently
of Trainer. Lives stay limited when Trainer is off. These runs have their own
local high-score filter and storage, separate from Standard; using the option
at any time keeps the run in that category, even after disabling it.

**WATCH DEMO** starts a real autonomous combat flight. It takes off, steers,
fires and drops bombs, cycling coast/winter/storm after forty simulation
seconds per mission. Click the return prompt or press a key to leave. Demo
runs never create score tickets or save results. The AI wingman has a blue-teal
paint scheme in place of a floating number over the aircraft.

## Rainbow Patrol renderer and variant rules

`web/scene.c` exports a read-only native snapshot: ABI v3 has a 28-integer header,
320 ground heights and up to 256 object records of 18 integers, including stable
object identity and projectile-owner kind. The C simulation remains at 10 Hz.
`dist/rainbow-timeline.js` interpolates camera, positions and aircraft angles on
requestAnimationFrame, without changing collision masks or native state. It
snaps across respawns and holds its clock while paused.

The Canvas 2D framebuffer is **1920 × 1488**: a logical 640 × 400 flight area,
plus a separate 96-pixel instrument strip, rendered at 3× detail. Higher-detail
atlas crops remain intact instead of first reducing them to a 34-pixel sprite.
Terrain strips are cached and slide smoothly. The original source landscape is
restored under buildings; foundations bridge slopes instead of cutting abrupt
platforms. Vehicles follow the slope. Cow collision masks are scaled with the art. The analog altimeter uses a traditional 0–9 face with separate hundreds and
thousands hands and a numeric FT AGL readout. The airspeed dial marks nominal
level-flight stall speed (52 MPH) and takeoff (60 MPH); climbs can stall sooner.
Winter adds separate frost sprites on the gauge glass and panel edges;
storm missions use dark instrument faces with glowing amber lamps and plaques,
animated rain, visible lightning and delayed original synthesized thunder.
The map plots true world altitude,
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
  Ground units have painted team panels and British Union Jack / Imperial German black-white-red cloth flags. The map
  retains mint/red team markers.
- The campaign has three different landscapes: coast, winter valleys and
  mountainous storm city. Easy ground defenses stay quiet; Normal fires back
  from mission one. Enemy aircraft are a separate optional extra in Mission Setup.
  Completing the third mission ends at the medal ceremony and Badge of Honor board.


`dist/rainbow-ui.js` supplies keyboard/mouse/touch arcade menus. Game over shows the current board and provisional rank behind
exactly three A–Z/0–9 initials, editable by typing or arrows. Saving ends on
the top-ten high-score list with qualifying submitted local runs highlighted.
Entry shows the provisional rank even below tenth place. The pause/settings
screens use the game's own style. Fullscreen transitions do not pause the game
through a transient visibility event; changing tabs normally still does.
The splash menu has a FULLSCREEN toggle. PLAY opens Mission Setup: actual landscape previews, objectives, Rookie/Easy and
Ace/Normal pilots, ground fire and optional enemy aircraft before START FLIGHT.
The selected pilot briefly salutes. The framed paper briefing charts use
actual native terrain profiles, home positions and hostile target locations.
A short Rookie/Ace summary explains return fire and enemy firing behaviour. Controls share one perspective-mapped classroom
board with the student pilot and instructor. Settings keeps audio, display, sight
and trainer/supply controls; starting-mission selection stays trainer-only. The website and game UI are
English-only; old stored language preferences are ignored.
Sound controls use matching speaker-on/muted SVG images on the splash, rail and
settings screen, with a visible on/off label and a gold enabled state.

Normal ground defenses fire in every mission. Easy disables all ground and pilot
return fire; optional enemy aircraft keep their shorter range, per-owner shot
interval and spawn grace. Friendly defenses engage hostile aircraft on Normal.
Rainbow has sixteen throttle steps with gradual acceleration and up to 18 native
speed units (roughly 200 arcade MPH in a dive), while Classic keeps its original
flight rules. Returning home uses native steering with current-terrain sampling, an approach
speed cap, terrain/building clearance assistance and the earlier landing handoff.


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

`dist/assets/ARTWORK.md` records all full imagegen PNGs and prompts. The live Rainbow
menus/HUD use original Patrol Chalk and Patrol Engraved WOFF2 fonts under GPL v2+.
Honor boards use engraved bronze nameplates mounted on timber, with a polished
row for the current score. Controls shares the classroom's physical slate;
the Back control is outside the board and text stays clear of the instructor.
The older Press Start 2P and Patrick Hand assets remain with their OFL 1.1 notices. Provenance/licenses are in `NOTICE.md` and
`dist/assets/`; `web/ASSET-LOCK.json` locks the complete asset roster. RETRY,
Rainbow Islands and Amiga-era games are references; none of their files is bundled.
WebGL or Three.js is not required for this measured 2D path. Further flight-model changes and new obstacle courses can be explored separately.

## Optional AI wingman

Enable **AI WINGMAN** in Mission Setup. A separate friendly aircraft (mint “2”)
waits for takeoff, rolls out after a short delay, joins behind/above the player,
and engages nearby hostile aircraft. It returns when the player heads home,
lands, crashes or completes the mission, or when its own supplies run low.
It takes normal hostile/terrain damage and uses the existing crash/bailout art.
Friendly formation contacts and escort friendly fire cannot harm the player.
A base visit/new player aircraft restores a lost escort; trainer replenishes
the escort's supplies too. The first version escorts against aircraft; it does
not bomb ground targets. Human player two remains future work.

Wingman results have a separate **local** scoreboard, selected with SOLO/WINGMAN.
They never enter solo or shared-score submissions. Each crew still has separate
Easy/Normal and single-player/air-combat boards.

Rainbow automatically turns back before either world edge, using a short
climbing arc without an artificial boundary stall. Storm City's airfield has
a gently graded departure corridor before its mountain/city terrain.

## Manual flight and cockpit throttle

X/Z moves a mechanical brass/bakelite throttle through sixteen power settings.
Touch mode provides a horizontal throttle slider from idle to full power;
keyboard/autopilot changes keep its position synchronized. Setting power
does not instantly change airspeed.
Takeoff still needs about 60 MPH; a slow climb can stall and recovery requires
lowering the nose and adding power. Idle descents now exchange altitude for
speed, including a stable shallow glide. Power blends continuously out of idle
so adding a little throttle cannot slow a settled dive. Full-power level speed,
the dive cap and original pitch/roll controls are retained. The display gets
fractional speed through read-only `web_read(13)` (native units ×1000), avoiding
the previous whole-unit steps without changing the integer scene ABI.
Pause has its own shelter scene, with controls on the left-hand physical slate.

## Art-direction studies

[Compare title artwork A/B/C](https://tiltti.github.io/sopwith-web/splash-lab.html).
Three Fronts is the selected default, also used on the home-page game card.
The earlier art can be tried with `?splash=current` and `?splash=airfield`;
the optional choice is not stored. Startup has a separate ground-crew refueling
illustration, with live loading status on its quiet lower-left canvas area.
Fullscreen remains accessible before takeoff as a top-right icon
beside sound, outside the four-item game list. Settings provides the same
toggle during play, and both controls reflect the actual fullscreen state.

Winter hostile AA is placed beyond the player's departure/approach corridor.
The first added hill gun moves farther ahead, keeping the same target count
and real collision/fire/map location. The other mission rosters are retained.

[Compare A/B/C](https://tiltti.github.io/sopwith-web/look-lab.html) renders the
same composed scene at three environment pixel/detail levels. It includes
flat-color clouds, slope foundations, proportional animals and integrated AA
art. Airfield, hillside and bailout scenes, aircraft rotation, optional animation
and PNG export are provided. These are art-direction studies, not three playable
engines. The final live environment profile awaits the user's selection.

Splash music is Spring Spring's CC0 **War Theme (version 2)**, converted to
22050 Hz stereo AAC. It is an original military/orchestral/FM-style composition,
not a historical WWII recording. The splash sound button is opt-in; menu music
stops before gameplay and returns at a lower gain on the initials/high-score debrief. Full source/license details are in the audio README.

## High scores

Both editions now have separate practice/combat boards. Without a shared
endpoint, scores persist in this browser and the UI explicitly says so. The
player saves a finished run with a nickname; runs that used the trainer are
excluded, even if the trainer was subsequently disabled.
Rainbow Easy and Normal boards are also separate. Existing browser scores keep
their original key and appear on Normal; Easy uses a new local key.

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
paused time. All new integration files are also GPL v2 or later. `web/video.c` clips Rainbow
sprites and pixels to the native framebuffer: fast upward flight must not
read/write outside the old SDL image. Classic delegates to its original raster.

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
The build emits `dist/engine/sopwith.js`, `dist/engine/sopwith.wasm` and four
matching source downloads in `dist/source/`: `sopwith-web-source.tar.gz`
(game, integration, fonts, prompts and asset records),
`sopwith-web-artwork-1.tar.gz` and `sopwith-web-artwork-2.tar.gz` (all original
raster artwork, balanced between two parts), and
`sopwith-web-audio-source.tar.gz` (recordings, adaptations and audio licenses).
Extract all four into the same directory; together they form the complete
source/media tree. Each part stays below GitHub's 100 MiB file limit.

The checked-in original WOFF2 fonts need no build dependency. To regenerate
them from the unchanged glyph PNGs, create a local virtual environment, install
`scripts/typography-requirements.txt` there, then run `scripts/build_patrol_fonts.py`
using that environment's Python. `web/patrol-fonts-v15.json` records their hashes.

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
During development it starts ON in Rainbow after every page reload, and can be disabled in Settings before a ranked flight. Classic remains off by default. Its UI
must be removed before the final release; see `web/RELEASE-CHECKLIST.md`.

On the game page, enter `trainer()` in the browser's JavaScript developer
console. The player's bombs, gun ammunition, fuel and lives are replenished between
game ticks. Crashes, crash/respawn delays, firing rates and mission
outcomes retain their normal behavior. Use `trainer(false)` to disable it.
The setting carries over to new games on the same page but resets on reload.
It can also be enabled before starting a game. It affects only the player.

The [Info page](https://tiltti.github.io/sopwith-web/info.html) documents the
C / SDL2 / Emscripten / WASM architecture and source provenance.

## Rainbow mission transitions and pilots

A brief 2.5-second READY PLAYER / LEVEL text cue holds the native simulation before
level 1 and every new level. Victory keeps the normal 72-tick native countdown,
with original rear-view aircraft artwork receding toward the horizon and a
single 7.8-second licensed fanfare/march mix. Game-over still ends on high scores.

Pilots are native Rainbow objects, not timed visual overlays. They open their
canopies, descend to the real terrain, stand briefly and walk slowly to the
nearest airfield of their own faction. Arrival removes them safely. Aircraft,
bullets, bombs and debris can hit them. A player-caused airborne casualty is
**−1000** regardless of faction. On foot, friendly casualties cost **−500** and
hostile casualties award **+100**. On Normal, grounded pilots defend themselves from mission one
against hostile aircraft and other grounded pilots; they do not shoot parachutes.
Human/German vocal reactions and a procedural cinematic dive loop respect mute.

Rainbow filters direct collisions between a plane and its own released bombs,
and between those bombs and its own ordnance. This prevents rapid salvos from
self-detonating on the rack. Ground blasts and debris remain dangerous to the
plane. Classic continues to use the complete original collision step.

## Validation

```sh
node tests/browser-controls.mjs
node tests/rainbow-renderer.mjs
node tests/rainbow-assets.mjs
node tests/rainbow-audio.mjs
node tests/rainbow-timeline.mjs
node tests/rainbow-stages.mjs
node tests/title-audio.mjs
node tests/i18n.mjs
node tests/leaderboard.mjs
node tests/leaderboard-ui.mjs
python3 scripts/test_trainer.py
python3 scripts/test_patrol.py
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
a subdirectory such as `/play/` on sopwith.org. Ship all four source archives,
license and credits together with the game.

GitHub Pages hosts the public version. No external account or login is needed
to play it. Any local `.openai/` metadata is unrelated to this public release.

### Painted flight update — 2026-11-02

The selected detailed coastal concept now supplies real scrolling scenery,
painted cloud sprites, soil material and meadow details at the aircraft art's
raster density. Soil remains clipped to the mutable native ground, including
craters. The 96-pixel wood/leather/brass cockpit holds live analogue airspeed
and altitude needles, score/resources and a map below the unobstructed flight
area. Readouts are arcade calibrations: native speed × 18 km/h converted to MPH and native
height above current terrain × 10 m converted to feet; they are not a physical flight simulator.

Pause and score screens share the painted airfield; top-ten scores retain their
visible navigation. Victory has an original winged badge and dedicated rear
biplane frames. Descending canopies sway through four raster poses; falling
planes roll around the fuselage with separate faction sprites. A quick pilot
run/boarding animation fits inside the existing 2.5-second READY hold. Friendly
walking pilots cannot destroy parked/taxiing aircraft at their home runway;
hostile and airborne contacts keep their rules. Bomb artwork leaves parallel
to its aircraft and eases toward actual ballistic velocity over four ticks,
without modifying its path.

The contributor's own ElevenLabs falling-aircraft sample replaces the procedural
dive. Its four-second adaptation plays once per fall; separate media terms and
reproduction metadata are recorded in the audio README and NOTICE.

### Inline arcade score entry — 2026-11-03

The three-character editor occupies the provisional score's name cell. The
selected character is highlighted; type letters/digits, use left/right to move,
up/down to change a character, and Enter to save. Touch/mouse arrows remain
available. The scene uses one left-hand board, leaving the pilot visible.
Ten rows are shown; a run below rank ten temporarily shows a contiguous window
around its actual position. Saving returns to the normal top-ten board.
The same CC0 War Theme used by the splash plays at a lower gain on the debrief,
only after sound has been enabled. It continues through save/score panels and
stops on a new flight, mute or a hidden tab. One media player is reused.

### Cockpit layout / spawn help — 2026-11-03

The navigation image is clipped inside its measured brass aperture. Player,
friendly, hostile, bird and destroyed-site markers use the actual player faction.
The score fits its own window. Airspeed (MPH) and altitude (FT AGL) have intermediate
numbered graduations, while a separate fuel needle reads E / 1/2 / F. The bomb
rack shows only the remaining bombs; spent slots are empty. The scoreboard is
narrower/taller and uses painted wooden/brass frames and mechanical name tiles.

Every new aircraft, including trainer respawns, gets a 2.5-second READY / level
and lives-left intermission. On the first life only, five idle seconds while
parked shows throttle and takeoff key instructions. Input clears the hint timer;
takeoff disables it for the rest of that run. All of this uses the display clock
and leaves native physics/collision masks unchanged.

### Explosion / instrument detail pass — 2026-11-03

Explosions use eight original painted animation frames from ignition to smoke.
Native explosion debris is hidden when the replacement artwork is available;
collision and damage calculations remain native. LIVES, LVL and AMMO have their
own sprite bezels. Bombs are clipped to a five-slot magazine; the navigation
image fills a larger bevel-clipped aperture and its legend uses embossed tapes.

All three analogue instruments use a blank charcoal/brass dial, separately
rotating ornamental brass hand and transparent glass reflection. Graduations,
units and counter values use higher-resolution live type at the 3× framebuffer
scale. An ivory dial/blued-steel hand alternative is available in the development
visual fixture for comparison. Exact prompts and immutable raw-image hashes are
in `web/effects-dashboard-v10-*.json`.

### Three-mission campaign / development build — 2026-11-03

- Mission terrain is generated in `web/variant.c`, blending new valleys/mountains
  into preserved native airfields. Targets are re-grounded on the new surface.
  Craters use a mission baseline and never raise terrain back to the DOS map.
- Friendly walking crew are safe beside any low departing/taxiing friendly plane,
  including beyond the old 32-pixel airfield exemption. Airborne/hostile contacts
  keep their existing rules.
- Trainer starts on during development. With it enabled, 1–9 rebuild a selected
  level, while E clears targets and invokes the native 72-tick departure. The
  three visual themes cycle for level numbers beyond three as test previews.
  The normal campaign ends after three. Trainer actions are gated again in C.
- Every spawn gets a 2.5-second winged READY/lives badge; the short boarding
  animation finishes within its first 0.9 seconds. Completion labels share the
  badge's blank face. The native remaining-lives bonus is preserved; its old
  busy-wait presentation is skipped in Rainbow to avoid blocking the browser.
- Six new immutable PNGs supply winter/storm backgrounds, eight building sprites,
  eight archaeology/flag/prop sprites, four material tiles and the medal ceremony.
  `web/campaign-v11-*.json` records exact built-in imagegen prompts and hashes.
- The cockpit uses aspect-preserving bezel corners, a wider clipped map, full
  altitude numerals and a visible throttle strip. Speed/throttle interpolate and
  the airspeed pointer is damped. The quiet radial loop follows speed, throttle
  and descent; storm thunder shares an existing low-frequency effect sample.
- Menus follow PLAY → Flight Setup → START FLIGHT. Controls and setup use painted
  scoreboard frames. The English-only home page presents equal-size game cards.
