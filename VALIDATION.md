# Validation

## 2026-11-01: Level rainbow and clearer bomb marker

- The rainbow uses one horizontal baseline below both endpoint ground heights.
  Terrain clips its feet without shearing the arch. A regression test compares
  mirrored column heights in every band over uneven ground.
- The bomb marker has a 21-pixel bright bracket with a dark outline (23 pixels
  overall), up from 13 pixels. Prediction and collision behaviour are unchanged.
- Browser QA at the native starting location inspected the level arch and
  ground masking, then flew to display the marker at world x=1308, y=64.
  The aim switch still hides/restores it while paused. Audio remained off.

## 2026-11-01: Rainbow combat/visual fixes and score persistence

- The rainbow is one world landmark, with feet extending underneath the true
  ground mask. Both ends were inspected at the native starting location.
- Coastal cliffs, shrubs, strata and stones replace the repeated triangle
  skyline. Pixel blast rings, sparks and feather puffs use native event state.
- Rainbow-only rules allow a 200 ms bomb interval. A downward release impulse
  separates the salvo. Native integration tests keep five bombs simultaneously
  airborne through actual collision checks, consume five bombs, reject an empty
  stock and preserve enemy/classic cooldowns.
- Bomb impact prediction uses native launch angles, integer velocity and falling
  steps. It estimates terrain impact; buildings/other objects may intercept.
- Browser QA saw multiple bombs in flight and a ground estimate at world
  x=1387, y=64. The switch hides/shows it even while the native clock is paused.
- Five real player crashes reach the Rainbow end screen without revealing CGA;
  the native clock freezes once and the retry button starts a fresh game.
- Browser QA saved a finished -250-point test run to the local board and
  reloaded the page; the entry remained. The test data uses localhost only.
- Leaderboard API tests use a real SQLite file, reopen the database, and check
  persistent records, separate boards, invalid/expired tickets, trainer flags,
  payload bounds and idempotent submissions.
- The shared Sites Worker was deployed owner-private. Production D1 has the
  migrated `runs` and `scores` tables. Public access was rejected by automatic
  review pending explicit permission; the published client stays local-only
  until that permission is granted. No test entries were added to production.

## 2026-10-31: Tribute collection and Rainbow Patrol

- The homepage now links separate Rainbow Patrol, Sopwith II and Info pages.
  Ordinary page navigation destroys the previous game's iframe/engine.
- Rainbow Patrol uses the same unmodified upstream C game, with a new read-only
  scene adapter and a 640×400 Canvas 2D pixel renderer. Classic uses the original
  SDL renderer. Both use the same WASM build and browser input integration.
- Native scene-adapter tests cover terrain bounds, player resources, object
  fields, missing symbols, uninitialised state and unchanged game objects.
- Renderer tests check native world-to-screen alignment, ground heights,
  unchanged sprite/collision bytes and trail sampling by native game tick.
- Existing keyboard/trainer integration tests pass with the edition selector.
- Browser QA: both practice and combat start in Rainbow Patrol. Throttle and
  elevator inputs produce real native movement; firing uses ammunition (200 to
  197) and dropping a bomb consumes one (5 to 4). Audio remains unavailable/off.
- Pause holds both native and rendered ticks at 82; the scene remains frozen.
- Switching through the shared navigation opens the classic edition, which
  starts with its original SDL/CGA image. No fullscreen or audible tests were run.
- The shared home page and the Rainbow Patrol game were visually inspected.
  The source archive includes the new renderer, scene adapter, assets and tests.
- This first edition adds graphics, not a separate flight model or new levels.
  Physical mobile-device testing has not been performed for this revision.

## 2026-10-31: trainer, native input and Info page

- Native C integration tests use the real upstream crash, respawn and weapon
  functions with SDL's headless driver. The normal fifth crash ends the game;
  trainer mode passes eight full crash/respawn cycles with the normal delay.
- The normal gun exhausts 200 rounds; trainer mode fires 220. The normal bomb
  supply exhausts five bombs; trainer mode drops ten. Bomb cooldown stays at
  ten ticks. Fuel and mission outcomes are not modified.
- Disabling trainer restores normal resource consumption.
- JavaScript event tests confirm that S, arrows, Esc and letters remain native
  in game menus and text entry, while flight shortcuts still function during
  active flight. Shifted slash key release is also checked.
- Top-level trainer commands propagate into new games; sound starts muted.
- Info-page and source-archive links are included in release verification.
- Browser verification: S opens the native single-player submenu, Esc returns
  to the main menu, and S followed by E starts a game while audio remains off.
- With trainer enabled in the real WASM engine, firing and dropping a bomb
  leave the replenished ammunition/bomb counters at 200/5.
- The Info page was rendered and inspected in the browser.

## 2026-10-30: initial browser version

## Build and provenance

- SDL Sopwith 2.9.0 compiles locally with Emscripten 4.0.10.
- The output has a valid WebAssembly binary header.
- Every vendored upstream file was compared byte for byte with the pinned
  upstream release archive. No upstream files were changed.
- `node --check` passes for `dist/app.js` and `dist/runner.js`.
- Complete corresponding game and integration sources, build instructions,
  GPL license and original author credits are included with the static site.

## Browser checks

Checked in the Codex in-app browser:

- Practice and computer-opponent modes start and the game clock advances.
- Held throttle and elevator inputs move the plane and increase its altitude.
- Gunfire appears and dropping a bomb reduces the player's bomb supply.
- Pause holds the game tick constant; resume advances it again.
- The mute control suspends the audio context and can resume it.
- Restart returns to game selection and another mode can be started.
- CGA/amber palette changes worked during development. The final UI retains
  only the original CGA and green/red/yellow CGA palettes requested by the user.
- Layout was checked at the normal desktop size and a 390x844 viewport.
  The phone-width page has no horizontal overflow and includes the full game
  image, status bar and on-screen controls. No physical mobile device was used.
- Fullscreen entry worked. WebKit exit handling was corrected; further
  fullscreen tests were stopped at the user's request.

The final UI revision was checked to contain the game and control/source links,
with slogans removed and sound shown as off. The final engine always starts
with `-q` so no audio device is created until sound is explicitly enabled.
Sound enabling was not tested audibly again after the user requested quiet.

## Original DOS comparison

The archived SOPWITH.EXE was run locally in js-dos for visual reference.
The runway, landscape, player plane, hangar, animals and status bar match
visually at the starting location. This is not a pixel-by-pixel or deterministic
verification of the whole game. Exact physics/AI equivalence to the DOS release
has not been established.

## Known limits

- Multiplayer is not part of this browser milestone.
- Rainbow Patrol currently shares the classic flight model and levels; custom
  mechanics and new obstacle courses are not implemented yet.
- The compiler reports an upstream signed-char warning in SDL video text input.
- SDL prints a non-fatal warning about main-loop vsync timing. The explicit
  browser timer still runs the original game logic at its defined 10 ticks/s.
- A clean Linux rebuild and deployment were completed successfully by GitHub
  Actions for the initial public release.
