// Sopwith Web, 2026-10-30. GNU GPL v2 or later; source/COPYING.md.
(() => {
  const $ = id => document.getElementById(id);
  const frame = $('game');
  const edition = document.body?.dataset.edition === 'rainbow' ? 'rainbow' : 'classic';
  const aimToggle = edition === 'rainbow' ? $('aim-toggle') : null;
  const startLevel = edition === 'rainbow' ? $('start-level') : null;
  const trainerToggle = edition === 'rainbow' ? $('settings-trainer') : null;
  const suppliesToggle = edition === 'rainbow' ? $('settings-supplies') : null;
  const difficultySelect=edition==='rainbow'?$('difficulty-select'):null;
  const enemyAircraft=edition==='rainbow'?$('enemy-aircraft'):null;
  const wingman=edition==='rainbow'?$('ai-wingman'):null;
  const keys = { ArrowUp:54, Comma:54, ArrowDown:56, Slash:56, ArrowRight:27, KeyX:27, ArrowLeft:29, KeyZ:29, Period:55, KeyB:5, Space:44, KeyH:11, KeyS:22 };
  let state = 'idle', muted = true, bootTimer, mode = 'practice';
  let inputMode = 0, trainerEnabled = edition==='rainbow';
  let fullscreenTransition = false;
  const loadPref = (name, fallback) => { try { return localStorage.getItem('sopwith.' + name) ?? fallback; } catch { return fallback; } };
  const savePref = (name, value) => { try { localStorage.setItem('sopwith.' + name, String(value)); } catch {} };
  let suppliesEnabled=edition==='rainbow'&&loadPref('rainbow.infinite-supplies','0')==='1',demoActive=false;
  const post = (type, extra = {}) => frame.contentWindow?.postMessage({ sopwith:true, type, ...extra }, location.origin);
  const setStatus = text => { $('status-text').textContent = text; };
  const focusGame = () => { if (state === 'playing') { frame.contentWindow?.focus(); post('focus'); } };
  function syncTrainer(){
    if(!trainerToggle)return;
    trainerToggle.textContent='TRAINER (TESTI): '+(trainerEnabled?'PÄÄLLÄ':'POIS');
    trainerToggle.setAttribute('aria-pressed',String(trainerEnabled));
    if(startLevel){startLevel.disabled=!trainerEnabled;if(!trainerEnabled)startLevel.value='1';}
  }
  window.trainer = (enabled = true) => {
    if (typeof enabled !== 'boolean') throw new TypeError('Use trainer() or trainer(false).');
    trainerEnabled = enabled;
    syncTrainer();
    post('trainer', { enabled });
    return { enabled, unlimitedLives:enabled, unlimitedBombs:enabled, unlimitedAmmo:enabled, unlimitedFuel:enabled, invincible:false };
  };
  function syncSupplies(){if(suppliesToggle){suppliesToggle.textContent='INFINITE SUPPLIES: '+(suppliesEnabled?'ON':'OFF');suppliesToggle.setAttribute('aria-pressed',String(suppliesEnabled));}}
  function setSupplies(enabled){suppliesEnabled=!!enabled;savePref('rainbow.infinite-supplies',suppliesEnabled?'1':'0');syncSupplies();post('supplies',{enabled:suppliesEnabled});}
  function stopDemo(){if(!demoActive)return;clearTimeout(bootTimer);inputMode=0;demoActive=false;if(document.body?.dataset)document.body.dataset.demo='false';state='idle';frame.src='about:blank';frame.hidden=true;$('screen').classList.remove('in-flight');if($('demo-exit'))$('demo-exit').hidden=true;showLayer('launch');setStatus('MAIN MENU');}
  function setMuted(value) {
    muted = value;
    $('mute').setAttribute('aria-pressed', String(value));
    $('sound-label').textContent = value ? 'Äänet pois' : 'Äänet päällä';
    if(edition==='rainbow')$('sound-icon').src='assets/sound-'+(value?'off':'on')+'.svg';
    else $('sound-icon').textContent = value ? '◖×' : '◖))';
    $('mute').setAttribute('aria-label', value ? 'Laita äänet päälle' : 'Mykistä äänet');
    post('mute', { value });
    if(document.body?.dataset.layout==='arcade')window.dispatchEvent?.(new CustomEvent('sopwith-mute',{detail:{muted:value}}));
  }
  function showLayer(id) {
    for (const layer of ['launch', 'loading', 'paused', 'error', 'complete']) {
      if($(layer))$(layer).hidden = layer !== id;
    }
    if(document.body?.dataset.layout==='arcade') {
      document.body.dataset.gameState=state;
      window.dispatchEvent?.(new CustomEvent('sopwith-layer',{detail:{layer:id,state}}));
    }
  }
  function start(demo=false) {
    demoActive=demo===true;
    mode = document.querySelector('input[name="mode"]:checked').value;
    if(enemyAircraft)mode=enemyAircraft.checked?'combat':'practice';
    if(document.body?.dataset){document.body.dataset.campaignComplete='false';document.body.dataset.demo=String(demoActive);}
    if($('honor-title'))$('honor-title').textContent='HIGH SCORES';
    if($('arcade-scores-title'))$('arcade-scores-title').textContent='HIGH SCORES';
    if($('debrief-title'))$('debrief-title').textContent='GAME OVER';
    state = 'loading'; inputMode = 0; $('screen').classList.add('in-flight'); showLayer('loading'); setStatus('Ladataan peliä');
    $('pause').disabled = true; $('restart').disabled = false;
    $('pause-label').textContent='Tauko';$('pause').setAttribute('aria-label','Aseta peli tauolle');
    $('loading-text').textContent = 'Ladataan peliä…';
    $('mode-label').textContent = mode === 'combat' ? '/ ILMATAISTELU' : edition==='rainbow'?'/ YKSINPELI':'/ HARJOITTELU';
    frame.hidden = false;
    const levelQuery=startLevel?'&level='+(trainerEnabled&&['1','2','3'].includes(startLevel.value)?startLevel.value:'1')+'&difficulty='+(difficultySelect?.value==='easy'?'easy':'normal')+'&wingman='+(wingman?.checked?'1':'0'):'';
    frame.src = demoActive?`runner.html?mode=combat&edition=rainbow&muted=${muted?1:0}&trainer=1&supplies=1&wingman=1&demo=1&level=1&difficulty=normal&run=${Date.now()}`:`runner.html?mode=${mode}&muted=${muted ? 1 : 0}&palette=${$('palette').value}&trainer=${trainerEnabled ? 1 : 0}&supplies=${suppliesEnabled?1:0}&edition=${edition}&aim=${aimToggle?.checked === false ? 0 : 1}&run=${Date.now()}${levelQuery}`;
    if($('demo-exit'))$('demo-exit').hidden=!demoActive;
    clearTimeout(bootTimer);
    bootTimer = setTimeout(() => fail('Pelin lataaminen kesti liian kauan. Tarkista yhteys ja yritä uudelleen.'), 45000);
  }
  function fail(message) {
    clearTimeout(bootTimer);if(document.body?.dataset)document.body.dataset.demo='false'; state = 'error'; $('screen').classList.remove('in-flight'); showLayer('error'); setStatus('Lataus epäonnistui');
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
    state = 'idle'; inputMode = 0; $('screen').classList.remove('in-flight'); showLayer('launch'); setStatus('Ei käynnissä');
    $('pause-label').textContent = 'Tauko';
    $('pause').disabled = true; $('restart').disabled = true;
    ($('open-flight')||$('start')).focus();
  }
  $('start').addEventListener('click', start);
  $('retry').addEventListener('click', start);
  $('restart').addEventListener('click', reset);
  $('pause').addEventListener('click', () => pause());
  $('resume').addEventListener('click', () => pause(false));
  if(edition==='rainbow')$('play-again')?.addEventListener('click',start);
  $('mute').addEventListener('click', () => { setMuted(!muted); focusGame(); });
  if(edition==='rainbow')$('title-fullscreen')?.addEventListener('click',()=>$('fullscreen').click());
  $('fullscreen').addEventListener('click', async () => {
    const column = document.querySelector('.game-column');
    fullscreenTransition=true;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
      else if (column.requestFullscreen) await column.requestFullscreen();
      else if (column.webkitRequestFullscreen) column.webkitRequestFullscreen();
      else setStatus('Koko näyttö ei ole käytettävissä tässä selaimessa');
      focusGame();
    } catch { setStatus('Selain esti koko näytön tilan'); }
    finally {
      const next=window.requestAnimationFrame||((fn)=>setTimeout(fn,0));
      next(()=>next(()=>{fullscreenTransition=false;}));
    }
  });
  const fullscreenLabel = () => {
    const active=!!(document.fullscreenElement || document.webkitFullscreenElement);
    const label=edition==='rainbow'?(active?'EXIT FULLSCREEN':'FULLSCREEN'):(active?'Poistu koko näytöstä':'Koko näyttö');
    $('fullscreen').lastElementChild.textContent=label;$('fullscreen').setAttribute('aria-label',label);
    if(edition==='rainbow'&&$('title-fullscreen')){
      $('title-fullscreen').lastElementChild.textContent=active?'WINDOWED':'FULLSCREEN';
      $('title-fullscreen').setAttribute('aria-pressed',String(active));
      $('title-fullscreen').setAttribute('aria-label',label);
    }
    if(edition==='rainbow'&&$('settings-fullscreen')){
      $('settings-fullscreen').textContent=active?'WINDOWED':'FULLSCREEN';
      $('settings-fullscreen').setAttribute('aria-pressed',String(active));
      $('settings-fullscreen').setAttribute('aria-label',label);
    }
  };
  document.addEventListener('fullscreenchange', fullscreenLabel);
  document.addEventListener('webkitfullscreenchange', fullscreenLabel);
  if(edition==='rainbow')fullscreenLabel();
  $('palette').value = loadPref('palette', '0');
  if (!$('palette').value) $('palette').value = '0';
  $('palette').addEventListener('change', () => { savePref('palette', $('palette').value); post('palette', { value:Number($('palette').value) }); });
  if(startLevel){
    const saved=loadPref('rainbow.campaign-start-level','1');startLevel.value=['1','2','3'].includes(saved)?saved:'1';
    startLevel.addEventListener('change',()=>savePref('rainbow.campaign-start-level',startLevel.value));
  }
  trainerToggle?.addEventListener('click',()=>window.trainer(!trainerEnabled));syncTrainer();
  suppliesToggle?.addEventListener('click',()=>setSupplies(!suppliesEnabled));syncSupplies();
  if(edition==='rainbow'){$('watch-demo')?.addEventListener('click',()=>start(true));$('demo-exit')?.addEventListener('click',stopDemo);}
  if(enemyAircraft){enemyAircraft.checked=loadPref('rainbow.enemy-aircraft','0')==='1';enemyAircraft.addEventListener('change',()=>savePref('rainbow.enemy-aircraft',enemyAircraft.checked?'1':'0'));}
  if(wingman){wingman.checked=loadPref('rainbow.ai-wingman','0')==='1';wingman.addEventListener('change',()=>savePref('rainbow.ai-wingman',wingman.checked?'1':'0'));}
  if(difficultySelect){
    difficultySelect.value=loadPref('rainbow.difficulty','normal')==='easy'?'easy':'normal';
    difficultySelect.addEventListener('change',()=>savePref('rainbow.difficulty',difficultySelect.value));
  }
  if(aimToggle) {
    aimToggle.checked=loadPref('rainbow.aim','1')!=='0';
    aimToggle.addEventListener('change',()=>{
      savePref('rainbow.aim',aimToggle.checked?'1':'0');
      post('aim',{enabled:aimToggle.checked});
    });
  }
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
    if(demoActive){event.preventDefault();stopDemo();return;}
    if (['SELECT','INPUT','TEXTAREA'].includes(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
    if(trainerEnabled&&edition==='rainbow'&&state==='playing'&&(event.code==='KeyE'||/^Digit[1-9]$/.test(event.code))){
      event.preventDefault();if(!event.repeat)post('trainer-action',{action:event.code==='KeyE'?0:Number(event.code[5])});return;
    }
    if (edition === 'rainbow' && state === 'idle' && event.code === 'Space' && event.target.tagName !== 'BUTTON') {
      event.preventDefault(); if (!event.repeat) start(); return;
    }
    if ((event.code === 'KeyP' || event.code === 'Escape') && (state === 'paused' || state === 'playing' && inputMode === 1)) {
      event.preventDefault(); if (!event.repeat) pause(); return;
    }
    if (event.code === 'KeyS' && (state === 'paused' || state === 'playing' && inputMode === 1)) {
      event.preventDefault(); if (!event.repeat) setMuted(!muted); return;
    }
    if (state === 'playing' && inputMode === 1 && keys[event.code] && event.target.tagName !== 'BUTTON') {
      event.preventDefault(); if (!event.repeat) post('key', { scan:keys[event.code], down:true });
    }
  });
  document.addEventListener('keyup', event => {
    if (state === 'playing' && keys[event.code]) { post('key', { scan:keys[event.code], down:false }); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing' && !fullscreenTransition) pause(true); });
  window.addEventListener('blur', () => post('release'));
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || !event.data?.sopwith) return;
    const msg = event.data;
    if(msg.type==='demo-exit'){stopDemo();return;}
    if(demoActive&&msg.type==='score-ready')return;
    if (msg.type === 'ready' && state === 'loading') {
      clearTimeout(bootTimer); state = 'playing'; inputMode = msg.inputMode; showLayer(null); setStatus('Peli käynnissä');
      $('pause').disabled = false; $('restart').disabled = false;
      post('mute', { value:muted }); focusGame();
    }
    if (msg.type === 'error' && state !== 'idle' && state !== 'error') fail('Pelin käynnistys epäonnistui. Voit yrittää uudelleen.');
    if (msg.type === 'pause-request') pause();
    if (msg.type === 'mute-request') setMuted(!muted);
    if (msg.type === 'input-mode') inputMode = msg.mode;
    if (msg.type === 'trainer-state'){trainerEnabled = msg.enabled;syncTrainer();}
    if (msg.type === 'supplies-state'){suppliesEnabled=msg.enabled;syncSupplies();}
    if (msg.type === 'round-ended' && edition==='rainbow' && ['playing','paused'].includes(state)) {
      if(document.body?.dataset)document.body.dataset.campaignComplete=msg.victory?'true':'false';
      if($('honor-title'))$('honor-title').textContent=msg.victory?'BADGE OF HONOR':'HIGH SCORES';
      if($('arcade-scores-title'))$('arcade-scores-title').textContent=msg.victory?'BADGE OF HONOR':'HIGH SCORES';
      if($('debrief-title'))$('debrief-title').textContent=msg.victory?'CAMPAIGN COMPLETE':'GAME OVER';
      state='ended';showLayer('complete');setStatus('Lento päättyi');
      $('complete-score').textContent='Pisteet: '+msg.score;
      $('pause').disabled=true;$('play-again').focus();
    }
    if (msg.type === 'manual') {
      pause(true);
      if(document.body?.dataset.layout==='arcade')window.dispatchEvent(new CustomEvent('sopwith-menu',{detail:'help'}));
      else $('ohjeet').scrollIntoView({ behavior:'smooth', block:'center' });
    }
    if (msg.type === 'ended') reset();
  });
  setMuted(true);
})();
