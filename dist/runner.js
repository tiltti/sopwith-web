// Sopwith Web, 2026-10-30. GNU GPL v2 or later; source/COPYING.md.
(() => {
  const canvas = document.getElementById('canvas');
  const params = new URLSearchParams(location.search);
  const held = new Set();
  const physicalHeld = new Map();
  let game, paused = false, storage = false;
  const send = (type, extra = {}) => parent.postMessage({ sopwith: true, type, ...extra }, location.origin);
  const keyMap = {
    ArrowUp:54, Comma:54, ArrowDown:56, Slash:56, ArrowRight:27, KeyX:27,
    ArrowLeft:29, KeyZ:29, Period:55, KeyB:5, Space:44, KeyH:11, KeyS:22,
    Escape:41, Enter:40, Backspace:42, KeyC:6, KeyN:17, KeyE:8, KeyO:18,
  };
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
  window.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    // Native SDL text input must receive all letters when entering a high score.
    if (game?._web_read(6)) return;
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
    const scan = physicalHeld.get(event.code) || keyMap[event.code];
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
    if (msg.type === 'focus') { canvas.focus(); audio(); }
  });
  window.openManual = () => send('manual');
  window.promptForInstall = () => send('manual');
  window.addEventListener('error', event => send('error', { message:event.message }));
  window.addEventListener('unhandledrejection', event => send('error', { message:String(event.reason) }));
  async function boot() {
    game = await createSopwith({
      canvas,
      locateFile: name => 'engine/' + name,
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
    setInterval(() => {
      canvas.dataset.tick = String(game._web_read(0));
      canvas.dataset.planeX = String(game._web_read(1));
      canvas.dataset.planeY = String(game._web_read(2));
      canvas.dataset.bombs = String(game._web_read(3));
      canvas.dataset.audio = game.SDL2?.audioContext?.state || 'unavailable';
      canvas.dataset.paused = String(paused);
    }, 200);
    const readyPoll = setInterval(() => {
      if (game._web_read(1) >= 0) {
        clearInterval(readyPoll);
        game._web_palette(Number(params.get('palette') || 0));
        send('ready'); canvas.focus(); audio();
      }
    }, 100);
    // The original game loop yields through Asyncify; no DOS emulation is used.
    game.callMain([params.get('mode') === 'combat' ? '-c' : '-s', '-q']);
  }
  boot().catch(error => send('error', { message: String(error) }));
})();
