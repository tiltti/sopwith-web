## Three-mission campaign / English menus — 2026-11-03

- All ten JavaScript suites passed, including trainer-only number/E actions,
  one-shot campaign completion with the remaining-lives bonus, English-only
  legacy text handling, interpolated throttle/speed, variable engine mix and
  muted thunder. New renderer/asset checks cover winter/storm layers and flags.
- Real C patrol checks passed: runway pilot overlap beyond the old safe radius,
  distinct winter/city height fields and preserved runways, ten real crater
  impacts on ground below the DOS baseline without any upward terrain change,
  sixteen throttle steps, gradual acceleration beyond the old maximum and
  sustained half-throttle speed. Trainer gating and E departure passed.
- Native trainer/rules and read-only scene tests passed. Return-to-base audit
  passed 90/90 Rainbow scenarios across all three terrain profiles with ground return fire disabled to isolate
  navigation. Navigation samples the current landscape and adds approach speed/clearance assistance. Classic remains the known 28/30 baseline; its rules are unchanged.
- Campaign start-level preferences use a new key: an old saved level-two
  shortcut cannot silently skip the coast after the menu update.
- Browser launch through PLAY → Flight Setup confirmed Easy/Normal, optional
  aircraft, English labels, sound off and trainer on by default. Real takeoff
  with X, comma and partial Z throttle stayed in flying state, showed around
  50 percent throttle and 517 ft AGL, with 120 FPS reported on this local device.
  Audio stayed off with zero voices; no fullscreen switching was used.
- Trainer keys 2 and 3 loaded visibly different terrain, buildings, materials
  and skies. Mission 3 has animated rain and gentle spaced lightning. E cleared
  targets, ran departure and stopped at the medal-ceremony Badge of Honor board;
  a trainer result was explicitly excluded from storage. Native bonus animation
  busy-waits are skipped only in Rainbow while the exact score is preserved.
- Controls and Flight Setup fit their sprite-backed panels. English home cards
  measured exactly equal: 580 × 524.84 CSS pixels each at the test viewport.
  Local review JPEGs: campaign-v11-home.jpg, campaign-v11-controls.jpg,
  campaign-v11-winter.jpg, campaign-v11-storm.jpg, campaign-v11-medal.jpg.
- Six original generated PNGs were displayed and copied unchanged. Exact prompts,
  dimensions and hashes: web/campaign-v11-prompts.json and campaign-v11-files.json.
  Release verification locks all runtime assets and byte-matching source files.

## Explosion sprites / instrument layers — 2026-11-03

- All ten JavaScript suites passed: assets, renderer, stages, browser controls,
  timeline, audio, title audio, language, leaderboard and leaderboard UI.
- READY holds each new aircraft for 1.5 seconds; its virtual-clock regression
  covers paused time, respawns, trainer, new levels and first-life takeoff help.
- Explosion regression advances frames 0→2→7 and expires without looping.
  Eight immutable sprite frames share a fixed centre. Native damage is unchanged.
- Pointer regression covers calibrated/clamped 270-degree sweep, separate
  ivory/blue and charcoal/brass layers, glass above the pointer. Five bomb icons
  fit completely inside their own clipped tray. Full and two-bomb inventory
  views were checked in the browser; no icons extend into the outer dashboard.
- Native-scene visual fixture checked peak flame, new counters, enlarged clipped
  navigation, embossed team tapes and both complete gauge alternatives at full
  width. Review JPEGs are in the local research/validation folder as
  effects-cockpit-v10-a.jpg and effects-cockpit-v10-b.jpg.
- Real local Rainbow launch rendered 1920×1488, loaded all art, reported 60 FPS,
  five bombs, map aperture 208/25/203/39, correct units and first-life idle help.
  Audio stayed off with zero voices; no fullscreen switch was used.
- Three production PNGs were shown to the owner and preserved unchanged.
  Exact prompts/hashes/dimensions are in web/effects-dashboard-v10-*.json.
  The two finished gauge mockups are review-only local research images.
- Corresponding source is packaged by scripts/build.py --source-only; release
  verification checks the closed asset roster and byte-matching source archive.

## Scoreboard sprites / cockpit / spawn help — 2026-11-03

- Renderer, assets, stages, timeline, controls, leaderboard UI, language and
  title/debrief-music suites pass. New tests cover map clipping and actual player
  faction, counted bomb icons, MPH/FT AGL values, one-second holds on every
  respawn (including trainer), lives-left and first-life five-second idle help.
- Browser: actual throttle/down/crash/respawn advanced crashes 0→1 and consumed
  READY lives 5→4. The new parked aircraft had no first-life help. Audio stayed off.
- Actual initial idle displayed takeoff key instructions after five seconds;
  throttle input removed them. Snapshot fixture at fuel 30%, two bombs,
  78 MPH / 1969 FT AGL verified needle movement and empty bomb rack slots.
- Navigation terrain, markers and viewport stay inside their measured brass
  aperture. Scores, team legend, fuel and bomb artwork fit their reserved areas.
- Scoreboard: narrower painted frame, row slats, title plate and flip-character
  sprites checked in browser. SFX + Enter saved at rank 6; final top ten had
  scrollHeight == clientHeight (443 px), panel width 422 px, navigation visible.
- Assets were displayed in chat as generated. Immutable raw outputs, exact
  prompts and hashes are in `web/score-cockpit-v09-*.json` and ARTWORK.md.
- Proof files in parent research directory: `scoreboard-sprites-entry-v2.png`,
  `scoreboard-sprites-final-v2.png`, `cockpit-v2-takeoff-help.png`.

## Inline initials / debrief music — 2026-11-03

- Leaderboard UI, menu music, localization and browser-control suites pass.
- Browser fixture: the real three-character editor occupies rank 6's name cell.
  Typing RPT, cursor movement, up/down changes and Enter save passed; the input
  retains focus and belongs to the score form while inside the table.
- Saving returned to the top ten with RPT at rank 6. The final panel had
  scrollHeight == clientHeight (377 px), with navigation visible.
- Lower-rank check: exactly ten contiguous rows (12–21), with the editor at
  actual rank 21; the entry panel had no vertical overflow (425 px).
- Debrief music was tested with a clearly labelled silent HTMLAudio stub in the
  local fixture: the existing War Theme starts at volume 0.13 and remains active
  after saving. Lifecycle tests cover mute, hidden tabs and a new flight. No
  actual speaker playback or fullscreen transitions were used.
- Desktop proof: parent workspace `research/inline-initials-desktop.png`.

## Painted flight / cockpit update — 2026-11-02

- Ten JavaScript suites pass: browser controls, renderer, atlas crops, audio,
  timeline, READY staging, title music, language, leaderboard and leaderboard UI.
  New assertions cover canopy frames, constant-scale faction roll frames,
  calibrated instrument values, texture clipping without ground mutation,
  boarding progress and bomb heading easing from airframe to ballistic velocity.
- Native patrol tests pass, including a friendly ground pilot beside parked /
  taxiing home aircraft, active airborne and hostile contacts, and untouched
  Classic filtering. Existing real rapid-salvo and pilot-collision tests pass.
- Native trainer and scene tests pass. Return-to-base audit remains Rainbow
  30/30 successes, Classic baseline 28/30 (the two existing failures retained).
- Final turf edge uses an immutable painted sprite strip, warped onto the
  same height field; the earlier striped procedural fringe was removed.
- Fresh local WASM build passed. The existing upstream signed-char warning is
  unchanged. All media remain local; no actual speaker output or fullscreen
  transitions were used during this round of QA.
- In-app browser: painted-coast environment, 1920×1464 canvas, moving instruments,
  quiet default, takeoff and B hold/release verified. One release spent exactly
  one bomb (5→4), left one bomb in flight and reported a changing heading.
- OfflineAudioContext fixture decoded all 13 samples plus 2 cues without a
  speaker context. The embedded dive decoded as 4 seconds, mono / 22050 Hz;
  one-shot completion and crash handoff passed. This is decode/state validation,
  not an audible listening test.
- Browser UI fixture: 20 seeded local scores, 3-character initials entry and
  save-to-top-ten end flow passed. The final table had 10 rows and equal
  scroll/client height (377 px), with New flight / Main menu visible.
- Browser visual fixture covers victory wings, rear aircraft, canopy sway,
  grounded walk, READY boarding and axial fall frames. It renders copies of
  native snapshots; actual collision rules are covered by the C tests above.
- Captures in the parent workspace research directory: `painted-flight-local.png`,
  `painted-pause-local.png`, `painted-scores-local.png`. These are actual browser
  captures, not the environment concept images.

# Validation

## 2026-11-02: Restore pilot artwork, ground contact and compact READY

- Restored airborne pilots from the unchanged original defense/pilot raster
  atlas. New ground poses use built-in image_gen with the same aviator identity
  and painted detail. Raw RGBA output, exact prompt and source/output digests
  are retained; the rejected geometric pilot SVG is removed.
- Native foot altitude is now exactly the terrain height. Ground rendering
  samples current terrain at the interpolated foot position, avoiding altitude
  interpolation gaps on slopes. Fixed sprite cell/sole coordinates remove
  transparent bottom padding and per-frame anchor shifts. Tests cover slopes
  and both native factions reaching their own airfields.
- Pilot hurt events produce audio only. No AARGH/HIMMEL text or floating score
  popup is drawn; score changes and voiced reactions remain functional.
- READY is a small shadowed text line, without a panel, dimmer or progress bar;
  its native hold is reduced from 2.2 seconds to 0.7 seconds. The pause-safe
  timer, first-tick camera ordering and absence of large rectangles are tested.
- Rainbow loads its sprite images before beginning the first native flight, so
  the shorter READY cue does not expose temporary native-art fallback frames.
- Browser previews checked the restored original canopy, the new raster walk
  cycle and foot contact on both the ascending and descending runway slopes.

## 2026-11-02: Mission transitions, real pilots and rapid-salvo fix

- Native tests run five-bomb release/movement/collision salvos for 16 heading/
  orientation cases. The plane survives; hostile bombs still collide and the
  classic collision step is unchanged. Existing trainer and home tests pass
  (Rainbow 30/30; unchanged classic baseline 28/30).
- Real pilot objects open canopies, reach terrain, stand, walk to the nearest
  allied airfield and are safely removed there. Tests cover both factions,
  aircraft/parachute and bullet/parachute collisions, one-time score changes
  (air −1000; grounded friendly −500 / hostile +100), and level 2 rifle fire.
- Native victory completes its 72-tick countdown and enters the next native
  level with the bonus preserved. READY unit tests cover initial/new levels,
  the 2.2-second simulation hold and pause-safe display time.
- Original SVG sheets supply separate rear-view aircraft and faction-specific
  pilot poses. Browser checks use a paused native scene plus explicitly edited
  preview copies; those preview copies are not a gameplay simulation. Actual
  runner inspection separately verified READY LEVEL 1, then
  advancing ticks after release, loaded artwork, and silent audio. Public QA
  caught tick-zero camera initialization; READY now waits for the first
  complete native flight tick and a regression test covers that ordering.
- Mock mixer tests verify licensed human/German vocal samples, cinematic dive
  loop/crash handoff, once-per-win fanfare/march and no mute/repaint replay.
  Sample format/source digests are verified; no audible review was performed.
- Speaker buttons stay gold in both states. The gear is drawn symmetrically
  around its SVG centre, LVL labels the level, and the sun has a plain luminous
  disc with soft haze instead of spiked/ringed balloon artwork.

## 2026-11-02: Sound icons, languages, friendly AA and Easy combat

- Matching original SVG speaker/mute images and explicit labels are used for
  all Rainbow audio controls. Silent default and opt-in splash playback tests
  still pass; switching language does not enable audio.
- English/Finnish menu selection follows the browser initially, with English
  fallback and a saved override. Tests cover switching both ways, dynamic
  scores/ranks, browser fallback, invalid preferences and unchanged nicknames.
- Friendly ground tanks/AA now acquire hostile computer aircraft in single
  player. Native tests check both weapon types, actual aiming direction and
  exclusion of friendly/dead planes; classic acquisition is unchanged.
- Easy combat bounds hostile aircraft/ground firing to 4/6 native ticks,
  reduces their firing range, and delays new hostile fire for 30 ticks after
  a player spawn. Native tests verify those limits, respawns, unchanged player
  fire and restoration of Normal rules. Flight/collision physics are unchanged.
- Easy/Normal scores are separated. Frontend tests preserve existing Normal
  scores and verify Easy filtering. Server SQLite tests migrate legacy scores
  to Normal and bind the board to the run ticket. The private backend has not
  been redeployed or made public; the live frontend still uses local storage.
- Browser QA verified English fallback, Finnish/English switching and saved
  language/difficulty after reload. The complete settings panel fits without
  scrolling (459px client and scroll height). Enter on the trainer toggles that
  control while sound remains off. A Level 2 launch reached the actual WASM with
  difficulty=easy, practice mode, five bombs and audio off. The native return-home
  audit remains Rainbow 30/30, classic baseline 28/30; scene ABI checks pass.

## 2026-11-02: Lower end targets and temporary playtest trainer

- Highest end targets and their terrain are lowered with a smooth 128-pixel
  falloff, leaving roofs at or below native Y=168. Tests verify both map ends,
  unchanged central terrain/boundary walls, and bounded adjacent height changes.
  New AA emplacements are rejected above the same reachable ceiling.
- Cow art increases from 16 to 18 logical pixels, with matching 9×7 native
  silhouettes. A bullet from the real native level gun initializer intersects
  the cow at six native pixels above its ground level.
- The temporary trainer settings toggle stays synchronized with console and
  engine state and resets off on page reload. A final-release removal checklist
  is included. Trainer runs remain ineligible after turning it off mid-flight.
- Trainer fuel refills live aircraft only: falling/crash timers and the native
  QUIT sentinel are preserved. Real crash/respawn, weapon, fuel and mission tests
  pass. The return-home audit remains Rainbow 30/30, classic baseline 28/30.
- LEVEL 2 is directly available on the splash, using the existing single-player
  launch and saved starting-level selection; enemy aircraft are not enabled.
- Browser inspection of native WASM snapshots showed both end factory roofs at
  Y=168. Settings had equal 574px client/scroll height with Back fully visible.
  A trainer-enabled LEVEL 2 launch used practice mode, level=2 and trainer=1;
  native diagnostics showed fuel=9000 and audio off. Disabling trainer mid-flight
  synchronized the menu and runner to false. No fullscreen transitions were used.

## 2026-11-01: Splash fullscreen option

- The title menu delegates its fullscreen button to the existing fullscreen
  handler without starting a flight or toggling sound. Fullscreen-change events
  synchronize the title label and pressed state, including Escape/browser exit.
- Existing browser-control/fullscreen visibility regressions pass. The splash
  layout is checked without repeatedly entering/exiting fullscreen on the user's
  display.

## 2026-11-01: Respawn startup, ground-fire selection and top ten

- Startup follows the native player's killed-to-live transition and level changes,
  including trainer runs that preserve the life counter. Tests cover repeated
  respawns, tick resets, silent spawns, refueling and pause/unmute deduplication.
- Rainbow settings launch native single-player at levels 1–3. Integration tests
  verify CLI arguments and classic isolation. A native test verifies that AA
  stays quiet at level 1 and fires at level 2 in PLAYMODE_SINGLE.
- Cows are 16 logical pixels wide instead of 14; masks grow from 7×5 to 8×6
  occupied pixels. Their natural-pitch moo is now a 2.5-second filtered and
  normalized excerpt with stronger gain. Source bytes and license are retained.
- Enemy/friendly ground vehicles have different cached painted panels and
  matching red/mint flags, with a HUD legend. Tests preserve native collision data.
- Ordinary target destruction no longer triggers or loads a victory fanfare.
  The visual announcement and explosions remain, as does the friendly warning.
- Both score displays render at most ten entries; an outside-top-ten provisional
  rank is still visible. Final actions stay below the compact list. Saving a
  lower-ranked run cannot index a nonexistent highlighted table row.
- Browser fixture seeded 20 local runs: only ten rows were displayed, the panel
  had equal 521px client/scroll height and its Back button was inside the panel.
  A new rank-20 result showed ten background rows and saved to the final top-ten
  screen with New flight/Main menu visible. A real muted level-2 single-player
  boot showed the new flags, larger cow and LV 2, with audio=off and zero voices.
- The additional level selector initially made Settings too tall. Its spacing
  was reduced; browser measurement then showed equal 514px client/scroll height,
  with Back fully inside the panel and no page/fullscreen resize.

## 2026-11-01: Rainbow 0.5 bug fixes and A/B/C art studies

- Aircraft art uses invariant world dimensions in a padded rotation canvas.
  Tests compare all 16 headings and verify that a falling wreck rotates.
  Resting aircraft use a tail-down pose that lifts progressively during roll.
- Cow art is 14 logical pixels wide, including its four falling poses. Native
  Rainbow-only cow masks are independently resampled to 7×5 occupied pixels;
  upstream masks stay untouched and classic uses the original mask.
- Rainbow restores the continuous source ground instead of native per-building
  flattening. Buildings have visible foundations; tanks/vehicles follow slope.
  Independent AA units have their own native collision masks, target counts and
  firing. Building shots are suppressed, so no invisible rooftop shooter remains.
  Tests cover hill placements, runway clearance, native target counts and firing.
- The minimap uses red only for active enemy objects; inactive/destroyed locations
  retain a subdued cross marker. Marker-state and continuous-arch symmetry
  regression tests pass.
- Disabled planes have rotating wrecks, animated smoke/fire, descending crash
  audio and one bailout per plane. Canopy motion is time-based, with an occasional
  burning-canopy variation. Tests check one-time ejection and repaint deduplication.
- Bird/flock hits emit a grouped native feather event, a short recorded corvid
  cry and 12/28 feather/debris particles. Sound is rate-limited to one per 3 ticks.
- Recorded trumpet, sad trombone and normal-pitch moo replace earlier synthesized
  or slowed cues. A short 2.4-second real radial startup is armed only for a new
  sound-enabled run. Recorded idle follows it; mute/resume cannot replay startup.
  Five in-game voice slots keep jingles independent from gunfire.
- Splash music is opt-in, has no request before explicit sound enable, stops on
  play/tab hiding/mute and uses a retained CC0 orchestral/FM composition. Tests
  verify the lifecycle without speaker output. Radial audio is CC BY 4.0 with
  complete attribution, modifications, provider source bytes and license text.
- Three look studies use identical positions/assets at background grid/detail
  levels 1.5, 0.75 and 1/3 logical pixels. They are static art-direction compositions,
  not captures of native gameplay. The live final profile awaits user selection.
  Native browser screenshots are saved for comparison without changing fullscreen.
- Browser end-screen fixture showed the previous Q7Z/1234 entry and provisional
  rank 2 behind the initials. Typing Z05 and saving opened the final board
  automatically, retaining the new local entry and the new-game/main-menu actions.
- Browser audio harness decoded all ten WAVs plus two synthesized cues. An
  OfflineAudioContext mix reached peak 0.1274 and RMS 0.0221 without speaker
  output; the AAC splash track reported 283.7 seconds of playable metadata.
- Classic browser smoke test with the same WASM build displayed the original
  SDL canvas and kept the Rainbow canvas hidden. Native classic rule tests pass.
  The existing early main-loop-timing warning is still logged during boot.
- Actual audio quality still needs the user's subjective listening review; no
  claim of a listening test or authentic Amiga hardware emulation is made.


## 2026-11-01: Rainbow 0.4 arcade UI, smooth display and combat feedback

- Production framebuffer is 1920×1404. The 640×400 logical world is separate
  from its 68-pixel bottom HUD. Browser telemetry measured 60.0–60.1 fps with
  about 1.0–2.0 ms draw time at the normal desktop viewport. This is a local
  observation, not a performance guarantee. Native simulation remains 10 Hz.
- Timeline tests cover camera/object interpolation, stable native IDs, angle
  wrapping, pause/resume timing and respawn snapping. Rendering remains read-only.
- Browser QA: a 1.4-second physical B hold produced one aim activation and spent
  one bomb on release (5 to 4), not a salvo. The screen bomb control also spent
  one bomb. No sound was enabled; active audio voices remained zero. A regression
  fixes fractional-coordinate terrain indexing that initially made aim flicker.
- Headless native rules tests cover queued release/cancel, simultaneous bombs,
  unchanged classic weapon timing, event deduplication, cow hits, destroyed
  ground targets/enemy aircraft, ballistic shells and a shell-expiry burst.
- Autopilot audit starts from 30 positions/altitudes/headings clear of scenery,
  with animals/enemies disabled. Classic baseline: 28 successes, 2 crashes.
  Rainbow's earlier landing handoff: 30 successes, 0 crashes. This isolates the
  final-approach issue; it does not guarantee avoidance of every moving obstacle.
- Standalone splash and pause menus were visually inspected in the browser.
  A development-only end-screen fixture exercised the production UI: Q7Z/1234
  was entered, saved and read back after reload from the local practice board.
  Actual native five-life game-over behavior and Rainbow end-renderer retention
  are independently covered by C and browser integration tests.
- The six real WAVs and three original synthetic cues all contain nonzero data.
  Production four-voice mixer output rendered into OfflineAudioContext without
  a speaker: peak 0.1247, RMS 0.0227. Cue selection, priority, deduplication and
  silent/default/mute/end behavior pass automated tests. No listening test is
  claimed. BigSoundBank CC0 moo and Press Start 2P OFL provenance are included.
- Fullscreen was not repeatedly exercised on the user's display. Synthetic
  integration coverage confirms transient fullscreen visibility changes do not
  pause, while a normally hidden tab still does. There is a direct rail button.
- The sprite gallery displays all four full-color cow reaction poses at constant
  width. Browser QA also inspected the 390-pixel portrait menu in an embedded
  viewport, without changing the user's browser size.
- Classic browser smoke test with the new WASM build: original canvas visible,
  Rainbow canvas hidden, supplies 5 bombs/200 rounds, zero active sound voices.
- Public score service remains private; release config still has endpoint=null.
  No shared-score deployment or game-dev CLI admission receipt is claimed.


## 2026-11-01: Amiga artwork, splash and sample audio

- Three imagegen PNGs are retained with their final prompts. Explicit atlas
  rectangles eliminate neighbouring-frame bleed. New aircraft, cow, targets,
  vehicles, birds, bombs, missiles and ruin art fit occupied native bounds.
  Tests verify identities, lazy loading, aspect fitting and unchanged masks.
- Native C sources and gameplay rules were not changed in this revision.
  Browser QA started with five bombs and 200 rounds, flew, fired four rounds
  and dropped two bombs. Two bombs were visible in flight; the HUD read 3/196.
- Aim starts hidden. Holding B rendered it once; releasing removed its impact
  coordinates immediately. Synthetic integration tests cover physical keys,
  screen-button press/release, blur and pause at a frozen native tick.
- Space starts from the new splash. The 390 px iframe preview has no horizontal
  overflow and displays the title and start controls without resizing the
  user's browser. Rounded cloud contours and native shot tracers were inspected.
- Five Kenney CC0 originals were checked against a pinned mirror's Git blob
  hashes, converted to 22050 Hz 8-bit mono WAV, and entered in a closed SHA-256
  roster. Official CC0 listings, license text and original bytes are included.
  The optional `game-dev` executable was unavailable; local hashing and browser
  checks were used instead. No CLI admission or engine-import receipt is claimed.
- Mixer tests cover lazy opt-in, four bounded voice slots, event deduplication,
  mute/resume and round-end cleanup. The actual production mixer rendered all
  five real WAVs through four Web Audio voices into an OfflineAudioContext:
  peak 0.1098, RMS 0.0197. No speaker was connected and no audible test was run.
- Actual gameplay remained at audio=off with zero active voices. Sample loading
  only starts after explicit sound enable. No fullscreen tests were performed.
- Browser QA also started the classic edition: its original black/CGA canvas
  remains active, Rainbow is hidden, and the initial supplies remain 5/200.

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
