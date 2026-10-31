// Sopwith Web, 2026-10-30. GNU GPL v2 or later; source/COPYING.md.
(() => {
  const canvas = document.getElementById('canvas');
  const params = new URLSearchParams(location.search);
  const held = new Set();
  const physicalHeld = new Map();
  let game, paused = false, storage = false;
  let trainerEnabled = params.get('trainer') === '1';
  let lastInputMode = -1;
  const send = (type, extra = {}) => parent.postMessage({ sopwith: true, type, ...extra }, location.origin);
  const keyMap = {
    ArrowUp:54, Comma:54, ArrowDown:56, Slash:56, ArrowRight:27, KeyX:27,
    ArrowLeft:29, KeyZ:29, Period:55, KeyB:5, Space:44, KeyH:11, KeyS:22,
    Escape:41, Enter:40, Backspace:42, KeyC:6, KeyN:17, KeyE:8, KeyO:18,
  };
  const menuKeys = { Enter:40, Escape:41, Backspace:42, Tab:43, Space:44,
    ArrowRight:79, ArrowLeft:80, ArrowDown:81, ArrowUp:82 };
  function menuScancode(event) {
    if (/^Key[A-Z]$/.test(event.code)) return event.code.charCodeAt(3) - 65 + 4;
    if (/^Digit[1-9]$/.test(event.code)) return Number(event.code[5]) + 29;
    if (event.code === 'Digit0') return 39;
    return menuKeys[event.code];
  }
  function key(scancode, down) {
    if (!game || paused || !scancode) return;
    if (down) held.add(scancode); else held.delete(scancode);
    game._web_key(scancode, down ? 1 : 0);
  }
  function release() {
    if (game) for (const scan of held) game._web_key(scan, 0);
    held.clear();
    physicalHeld.clear();
  }
  function audio() {
    const silent = params.get('muted') !== '0' || paused;
    game?._web_sound(silent ? 0 : 1);
    const ctx = game?.SDL2?.audioContext;
    if (!ctx) return;
    (silent ? ctx.suspend() : ctx.resume()).catch(() => {});
  }
  function pause(value) {
    release();
    paused = value;
    game?._web_pause(value ? 1 : 0);
    audio();
  }
  window.trainer = (enabled = true) => {
    if (typeof enabled !== 'boolean') throw new TypeError('Use trainer() or trainer(false).');
    trainerEnabled = enabled;
    game?._web_trainer(enabled ? 1 : 0);
    send('trainer-state', { enabled });
    return { enabled, unlimitedLives:enabled, unlimitedBombs:enabled, unlimitedAmmo:enabled, invincible:false };
  };
  window.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    // Text entry stays with SDL's native text-input handling. In menus send
    // actual SDL scancodes, never the flight remaps or browser sound shortcut.
    const inputMode = game?._web_input_mode();
    if (inputMode === 2 || !game) return;
    if (inputMode === 0) {
      const scan = menuScancode(event);
      if (scan) {
        event.preventDefault(); event.stopImmediatePropagation();
        if (!event.repeat) { physicalHeld.set(event.code, scan); key(scan, true); }
      }
      return;
    }
    if (event.code === 'KeyS') {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!event.repeat) send('mute-request');
      return;
    }
    if (event.code === 'KeyP' || event.code === 'Escape') {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!event.repeat) send('pause-request');
      return;
    }
    const scan = ({ ',':54, '/':56, '.':55 })[event.key] || keyMap[event.code];
    if (scan) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!event.repeat) { physicalHeld.set(event.code, scan); key(scan, true); }
    }
  }, true);
  window.addEventListener('keyup', event => {
    const scan = physicalHeld.get(event.code);
    if (scan) { event.preventDefault(); event.stopImmediatePropagation(); physicalHeld.delete(event.code); key(scan, false); }
  }, true);
  window.addEventListener('blur', release);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent || !event.data?.sopwith) return;
    const msg = event.data;
    if (msg.type === 'key') key(msg.scan, msg.down);
    if (msg.type === 'release') release();
    if (msg.type === 'pause') pause(msg.value);
    if (msg.type === 'mute') { params.set('muted', msg.value ? '1' : '0'); audio(); }
    if (msg.type === 'palette' && game) game._web_palette(msg.value);
    if (msg.type === 'trainer') window.trainer(msg.enabled);
    if (msg.type === 'focus') { canvas.focus({preventScroll:true}); audio(); }
  });
  window.openManual = () => send('manual');
  window.promptForInstall = () => send('manual');
  window.addEventListener('error', event => send('error', { message:event.message }));
  window.addEventListener('unhandledrejection', event => send('error', { message:String(event.reason) }));
  async function boot() {
    game = await createSopwith({
      canvas,
      locateFile: name => 'engine/' + name + '?v=20261031-rainbow1',
      print: line => console.info('[Sopwith]', line),
      printErr: line => console.warn('[Sopwith]', line),
      onAbort: reason => send('error', { message:String(reason) }),
      onExit: () => send('ended'),
      setStatus: () => {},
    });
    const { FS, IDBFS } = game;
    FS.mkdir('/libsdl');
    FS.mount(IDBFS, {}, '/libsdl');
    await new Promise(resolve => FS.syncfs(true, error => { storage = !error; resolve(); }));
    FS.mkdirTree('/libsdl/SDL Sopwith');
    // Keep the classic settings on first launch. Later in-game changes persist.
    const cfg = '/libsdl/SDL Sopwith/sopwith.cfg';
    if (!FS.analyzePath(cfg).exists) {
      FS.writeFile(cfg, 'conf_medals 0\nconf_video_palette 0');
    }
    FS.writeFile(cfg, FS.readFile(cfg, { encoding:'utf8' }).trimEnd());
    if (storage) setInterval(() => FS.syncfs(false, () => {}), 1500);
    window.sopwith = game;
    game._web_trainer(trainerEnabled ? 1 : 0);
    if (params.get('edition') === 'rainbow' && window.RainbowRenderer) {
      const display = document.getElementById('rainbow');
      const renderer = new RainbowRenderer(display);
      let renderedTick = -1, wasActive = false;
      const draw = () => {
        const active = game._web_input_mode() === 1;
        display.hidden = !active;
        canvas.style.visibility = active ? 'hidden' : 'visible';
        const tick = game._web_read(0);
        if (active && (tick !== renderedTick || !wasActive)) {
          const ptr = game._web_scene() >>> 2;
          const scene = game.HEAP32.subarray(ptr,ptr+RainbowRenderer.LENGTH);
          renderer.drawScene(scene,game.HEAPU8,trainerEnabled);
          renderedTick = scene[1];
        }
        wasActive = active;
        requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    }
    setInterval(() => {
      canvas.dataset.tick = String(game._web_read(0));
      canvas.dataset.planeX = String(game._web_read(1));
      canvas.dataset.planeY = String(game._web_read(2));
      canvas.dataset.bombs = String(game._web_read(3));
      canvas.dataset.ammo = String(game._web_read(7));
      canvas.dataset.crashes = String(game._web_read(8));
      canvas.dataset.trainer = String(trainerEnabled);
      canvas.dataset.audio = game.SDL2?.audioContext?.state || 'unavailable';
      canvas.dataset.paused = String(paused);
      const inputMode = game._web_input_mode();
      canvas.dataset.inputMode = String(inputMode);
      if (inputMode !== lastInputMode) {
        lastInputMode = inputMode;
        send('input-mode', { mode:inputMode });
      }
    }, 200);
    const readyPoll = setInterval(() => {
      if (game._web_read(1) >= 0) {
        clearInterval(readyPoll);
        game._web_palette(Number(params.get('palette') || 0));
        send('ready', { inputMode:game._web_input_mode() }); canvas.focus({preventScroll:true}); audio();
      }
    }, 100);
    // The original game loop yields through Asyncify; no DOS emulation is used.
    const args = ['-q'];
    if (params.get('mode') === 'combat') args.push('-c');
    else if (params.get('mode') === 'practice') args.push('-s');
    // Opening the runner directly preserves the original game's native menu.
    game.callMain(args);
  }
  boot().catch(error => send('error', { message: String(error) }));
})();
