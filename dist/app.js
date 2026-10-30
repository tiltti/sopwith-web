// Sopwith Web, 2026-10-30. GNU GPL v2 or later; source/COPYING.md.
(() => {
  const $ = id => document.getElementById(id);
  const frame = $('game');
  const keys = { ArrowUp:54, Comma:54, ArrowDown:56, Slash:56, ArrowRight:27, KeyX:27, ArrowLeft:29, KeyZ:29, Period:55, KeyB:5, Space:44, KeyH:11, KeyS:22 };
  let state = 'idle', muted = true, bootTimer, mode = 'practice';
  const loadPref = (name, fallback) => { try { return localStorage.getItem('sopwith.' + name) ?? fallback; } catch { return fallback; } };
  const savePref = (name, value) => { try { localStorage.setItem('sopwith.' + name, String(value)); } catch {} };
  const post = (type, extra = {}) => frame.contentWindow?.postMessage({ sopwith:true, type, ...extra }, location.origin);
  const setStatus = text => { $('status-text').textContent = text; };
  const focusGame = () => { if (state === 'playing') { frame.contentWindow?.focus(); post('focus'); } };
  function setMuted(value) {
    muted = value;
    $('mute').setAttribute('aria-pressed', String(value));
    $('sound-label').textContent = value ? 'Äänet pois' : 'Äänet päällä';
    $('sound-icon').textContent = value ? '◖×' : '◖))';
    $('mute').setAttribute('aria-label', value ? 'Laita äänet päälle' : 'Mykistä äänet');
    post('mute', { value });
  }
  function showLayer(id) {
    for (const layer of ['launch', 'loading', 'paused', 'error']) $(layer).hidden = layer !== id;
  }
  function start() {
    mode = document.querySelector('input[name="mode"]:checked').value;
    state = 'loading'; $('screen').classList.add('in-flight'); showLayer('loading'); setStatus('Ladataan peliä');
    $('pause').disabled = true; $('restart').disabled = false;
    $('loading-text').textContent = 'Ladataan peliä…';
    $('mode-label').textContent = mode === 'combat' ? '/ ILMATAISTELU' : '/ HARJOITTELU';
    frame.hidden = false;
    frame.src = `runner.html?mode=${mode}&muted=${muted ? 1 : 0}&palette=${$('palette').value}&run=${Date.now()}`;
    clearTimeout(bootTimer);
    bootTimer = setTimeout(() => fail('Pelin lataaminen kesti liian kauan. Tarkista yhteys ja yritä uudelleen.'), 45000);
  }
  function fail(message) {
    clearTimeout(bootTimer); state = 'error'; $('screen').classList.remove('in-flight'); showLayer('error'); setStatus('Lataus epäonnistui');
    $('error-text').textContent = message;
    $('pause').disabled = true; $('restart').disabled = false;
    frame.src = 'about:blank'; frame.hidden = true;
    $('retry').focus();
  }
  function pause(value = state === 'playing') {
    if (state !== 'playing' && state !== 'paused') return;
    state = value ? 'paused' : 'playing';
    post('pause', { value }); showLayer(value ? 'paused' : null);
    $('pause-label').textContent = value ? 'Jatka' : 'Tauko';
    $('pause').setAttribute('aria-label', value ? 'Jatka peliä' : 'Aseta peli tauolle');
    setStatus(value ? 'Tauko' : 'Peli käynnissä');
    if (value) $('resume').focus(); else focusGame();
  }
  function reset() {
    clearTimeout(bootTimer); post('release');
    frame.src = 'about:blank'; frame.hidden = true;
    state = 'idle'; $('screen').classList.remove('in-flight'); showLayer('launch'); setStatus('Ei käynnissä');
    $('pause-label').textContent = 'Tauko';
    $('pause').disabled = true; $('restart').disabled = true;
    $('start').focus();
  }
  $('start').addEventListener('click', start);
  $('retry').addEventListener('click', start);
  $('restart').addEventListener('click', reset);
  $('pause').addEventListener('click', () => pause());
  $('resume').addEventListener('click', () => pause(false));
  $('mute').addEventListener('click', () => { setMuted(!muted); focusGame(); });
  $('fullscreen').addEventListener('click', async () => {
    const column = document.querySelector('.game-column');
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
      else if (column.requestFullscreen) await column.requestFullscreen();
      else if (column.webkitRequestFullscreen) column.webkitRequestFullscreen();
      else setStatus('Koko näyttö ei ole käytettävissä tässä selaimessa');
      focusGame();
    } catch { setStatus('Selain esti koko näytön tilan'); }
  });
  const fullscreenLabel = () => {
    $('fullscreen').lastElementChild.textContent =
      document.fullscreenElement || document.webkitFullscreenElement ? 'Poistu koko näytöstä' : 'Koko näyttö';
  };
  document.addEventListener('fullscreenchange', fullscreenLabel);
  document.addEventListener('webkitfullscreenchange', fullscreenLabel);
  $('palette').value = loadPref('palette', '0');
  if (!$('palette').value) $('palette').value = '0';
  $('palette').addEventListener('change', () => { savePref('palette', $('palette').value); post('palette', { value:Number($('palette').value) }); });
  function touchVisible(value) {
    $('touch-controls').hidden = !value;
    $('touch-toggle').setAttribute('aria-pressed', String(value));
    $('touch-toggle').innerHTML = `Näyttöohjaimet <span aria-hidden="true">${value ? '−' : '＋'}</span>`;
    post('release');
  }
  $('touch-toggle').addEventListener('click', () => { touchVisible($('touch-controls').hidden); });
  touchVisible(matchMedia('(pointer: coarse)').matches);
  for (const button of document.querySelectorAll('[data-scan]')) {
    const scan = Number(button.dataset.scan);
    const release = () => { button.classList.remove('pressed'); post('key', { scan, down:false }); };
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      if (state !== 'playing') return;
      button.setPointerCapture(event.pointerId); button.classList.add('pressed');
      post('key', { scan, down:true });
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    button.addEventListener('contextmenu', event => event.preventDefault());
    button.addEventListener('click', event => {
      if (event.detail === 0 && state === 'playing') {
        post('key', { scan, down:true });
        setTimeout(() => post('key', { scan, down:false }), 120);
      }
    });
  }
  document.addEventListener('keydown', event => {
    if (['SELECT','INPUT','TEXTAREA'].includes(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
    if ((event.code === 'KeyP' || event.code === 'Escape') && ['playing','paused'].includes(state)) {
      event.preventDefault(); if (!event.repeat) pause(); return;
    }
    if (event.code === 'KeyS' && ['playing','paused'].includes(state)) {
      event.preventDefault(); if (!event.repeat) setMuted(!muted); return;
    }
    if (state === 'playing' && keys[event.code] && event.target.tagName !== 'BUTTON') {
      event.preventDefault(); if (!event.repeat) post('key', { scan:keys[event.code], down:true });
    }
  });
  document.addEventListener('keyup', event => {
    if (state === 'playing' && keys[event.code]) { post('key', { scan:keys[event.code], down:false }); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing') pause(true); });
  window.addEventListener('blur', () => post('release'));
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || !event.data?.sopwith) return;
    const msg = event.data;
    if (msg.type === 'ready' && state === 'loading') {
      clearTimeout(bootTimer); state = 'playing'; showLayer(null); setStatus('Peli käynnissä');
      $('pause').disabled = false; $('restart').disabled = false;
      post('mute', { value:muted }); focusGame();
    }
    if (msg.type === 'error' && state !== 'idle' && state !== 'error') fail('Pelin käynnistys epäonnistui. Voit yrittää uudelleen.');
    if (msg.type === 'pause-request') pause();
    if (msg.type === 'mute-request') setMuted(!muted);
    if (msg.type === 'manual') { pause(true); $('ohjeet').scrollIntoView({ behavior:'smooth', block:'center' }); }
    if (msg.type === 'ended') reset();
  });
  setMuted(true);
})();
