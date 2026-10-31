# Validation

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
- A custom gameplay variant is deferred until the classic version is accepted.
- The compiler reports an upstream signed-char warning in SDL video text input.
- SDL prints a non-fatal warning about main-loop vsync timing. The explicit
  browser timer still runs the original game logic at its defined 10 ticks/s.
- A clean Linux rebuild and deployment were completed successfully by GitHub
  Actions for the initial public release.
