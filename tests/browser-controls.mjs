// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const origin = 'https://example.test';
const event = (code, key = code) => ({ code, key, target:{tagName:'BODY'},
  preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; } });

async function runnerTests(search='',expectedArgs=['-q'],onlyLaunch=false) {
  const handlers = {}, sent = [], pressed = [], trainerChanges = [];
  let inputMode = 0;const mainArgs=[],easyChanges=[];
  const canvas = { dataset:{}, focus() {} };
  const engine = {
    FS:{ mkdir() {}, mount() {}, syncfs(initial, cb) { cb(null); }, mkdirTree() {},
      analyzePath() { return {exists:false}; }, writeFile() {}, readFile() { return 'conf_medals 0'; } },
    IDBFS:{}, _web_read:() => 0, _web_input_mode:() => inputMode,
    _web_key:(...args) => pressed.push(args), _web_sound() {}, _web_pause() {},
    _web_palette() {}, _web_trainer:value => trainerChanges.push(value), _web_variant() {}, _web_easy:value=>easyChanges.push(value),callMain(args) {mainArgs.push(...args);},
  };
  const parent = { postMessage:message => sent.push(message) };
  const scope = { document:{getElementById:() => canvas}, location:{origin,search},
    parent, URLSearchParams, createSopwith:async () => engine, console,
    setInterval() {}, setTimeout() {}, addEventListener:(name, fn) => { handlers[name] = fn; } };
  scope.window = scope;
  vm.runInNewContext(await readFile(new URL('../dist/runner.js', import.meta.url), 'utf8'), scope);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(mainArgs,expectedArgs);assert.deepEqual(easyChanges,[search.includes('edition=rainbow')&&search.includes('difficulty=easy')?1:0]);if(onlyLaunch)return;

  inputMode = 2;
  for (const code of ['KeyS','KeyP','Escape','ArrowUp','ArrowDown','KeyX','Space']) {
    const key = event(code);
    handlers.keydown(key); handlers.keyup(key);
    assert.equal(key.prevented, undefined, `${code} must remain native text input`);
  }
  assert.equal(pressed.length, 0);
  inputMode = 0;
  for (const [code, scan] of [['KeyS',22],['Escape',41],['ArrowUp',82],['ArrowDown',81]]) {
    const key = event(code);
    handlers.keydown(key); handlers.keyup(key);
    assert.deepEqual(pressed.slice(-2), [[scan,1],[scan,0]], `${code} must reach the original menu without a flight remap.`);
  }
  assert.equal(sent.filter(x => x.type === 'mute-request').length, 0);

  inputMode = 1;
  const sound = event('KeyS', 's'); handlers.keydown(sound);
  assert.equal(sound.prevented, true);
  assert.equal(sent.at(-1).type, 'mute-request');
  const up = event('ArrowUp'); handlers.keydown(up); handlers.keyup(up);
  assert.deepEqual(pressed.slice(-2), [[54,1],[54,0]]);
  const slash = event('Digit7','/'); handlers.keydown(slash);
  handlers.keyup(event('Digit7','7'));
  assert.deepEqual(pressed.slice(-2), [[56,1],[56,0]], 'Release must follow the original key even when Shift changes.');
  const escape = event('Escape'); handlers.keydown(escape);
  assert.equal(sent.at(-1).type, 'pause-request');
  const ctrl = {...event('KeyS','s'),ctrlKey:true}; handlers.keydown(ctrl);
  assert.equal(ctrl.prevented, undefined);

  assert.equal(scope.trainer().enabled, true);
  assert.equal(scope.trainer(false).invincible, false);
  assert.deepEqual(trainerChanges.slice(-2), [1,0]);
  handlers.message({origin,source:parent,data:{sopwith:true,type:'trainer',enabled:true}});
  assert.equal(trainerChanges.at(-1), 1);
  handlers.message({origin:'https://wrong.test',source:parent,data:{sopwith:true,type:'trainer',enabled:false}});
  assert.equal(trainerChanges.at(-1), 1, 'An unrelated origin cannot control the engine.');
  console.log('Runner: native S/arrows/Esc/text entry, flight shortcuts, key release and trainer messaging verified.');
}

async function pageTests() {
  const elements = new Map(), documentHandlers = {}, windowHandlers = {}, sent = [], animationFrames=[];
  function element() { return { hidden:true, value:'0', dataset:{}, listeners:{}, lastElementChild:{},
    classList:{add() {},remove() {}}, setAttribute(name,value) { this[name] = value; },
    addEventListener(name,fn) { this.listeners[name] = fn; }, focus() {} }; }
  const get = id => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); };
  const child = { postMessage:msg => sent.push(msg), focus() {} };
  get('game').contentWindow = child;
  const scope = { document:{body:{dataset:{edition:'rainbow'}},getElementById:get, querySelector:() => ({value:'practice'}),querySelectorAll:() => [],
    addEventListener:(name,fn) => {documentHandlers[name] = fn;}}, location:{origin},
    matchMedia:() => ({matches:false}), localStorage:{getItem:key => key==='sopwith.rainbow.start-level'?'2':null,setItem() {}},
    setTimeout:() => 1, clearTimeout() {}, console,
    addEventListener:(name,fn) => {windowHandlers[name] = fn;} };
  scope.window = scope;
  scope.requestAnimationFrame=fn=>animationFrames.push(fn);
  vm.runInNewContext(await readFile(new URL('../dist/app.js',import.meta.url),'utf8'),scope);
  assert.equal(get('mute')['aria-pressed'], 'true', 'Sound starts off.');
  assert.equal(get('settings-trainer')['aria-pressed'],'true','The development trainer starts on in Rainbow.');
  get('settings-trainer').listeners.click();assert.equal(get('settings-trainer')['aria-pressed'],'false');
  assert.equal(scope.trainer().unlimitedFuel,true);get('start').listeners.click();
  assert.match(get('game').src,/trainer=1/);
  assert.match(get('game').src,/edition=rainbow/, 'The tribute page must request the new renderer.');
  assert.match(get('game').src,/aim=1/);
  assert.match(get('game').src,/level=1/);
  get('start-level').value='2';get('start-level').listeners.change();get('start').listeners.click();
  assert.match(get('game').src,/level=2/,'The selected level reaches the next game launch.');
  get('difficulty-select').value='easy';get('difficulty-select').listeners.change();get('start').listeners.click();
  assert.match(get('game').src,/difficulty=easy/,'Difficulty is selected for the next native game.');
  get('enemy-aircraft').checked=true;get('enemy-aircraft').listeners.change();get('start').listeners.click();assert.match(get('game').src,/mode=combat/);
  get('enemy-aircraft').checked=false;get('start').listeners.click();assert.match(get('game').src,/mode=practice/);
  get('aim-toggle').checked=false;get('aim-toggle').listeners.change();
  assert.equal(sent.at(-1).type,'aim');assert.equal(sent.at(-1).enabled,false);
  const message = data => windowHandlers.message({origin,source:child,data:{sopwith:true,...data}});
  message({type:'ready',inputMode:0});
  documentHandlers.keydown(event('KeyS','s'));
  assert.equal(get('mute')['aria-pressed'], 'true', 'S outside the frame must not mute-toggle over a native menu.');
  message({type:'input-mode',mode:1});
  documentHandlers.keydown(event('KeyS','s'));
  assert.equal(get('mute')['aria-pressed'], 'false');
  scope.trainer(false); get('restart').listeners.click(); get('start').listeners.click();
  assert.equal(get('settings-trainer')['aria-pressed'],'false','Console and menu trainer states stay synchronized.');
  assert.match(get('game').src,/trainer=0/);
  message({type:'ready',inputMode:1});
  scope.document.querySelector=()=>({requestFullscreen:async()=>{scope.document.hidden=true;documentHandlers.visibilitychange();}});
  const pauses=()=>sent.filter(x=>x.type==='pause'&&x.value).length;
  const beforeFullscreen=pauses();await get('fullscreen').listeners.click();
  assert.equal(pauses(),beforeFullscreen,'A transient fullscreen visibility event cannot pause the parked plane.');
  while(animationFrames.length)animationFrames.shift()();
  documentHandlers.visibilitychange();assert.equal(pauses(),beforeFullscreen+1,'Normal tab hiding still pauses.');
  scope.document.hidden=false;get('resume').listeners.click();
  message({type:'round-ended',score:250});
  assert.equal(get('complete').hidden,false);
  assert.equal(get('complete-score').textContent,'Pisteet: 250');
  get('play-again').listeners.click();assert.match(get('game').src,/edition=rainbow/);
  console.log('Page: quiet default, console trainer on/off/new-game propagation and native-menu shortcut guard verified.');
}

await runnerTests();
await runnerTests('?edition=rainbow&mode=practice&level=2',['-q','-s','-g1'],true);
await runnerTests('?edition=rainbow&mode=combat&level=3&difficulty=easy',['-q','-c','-g2'],true);
await runnerTests('?edition=rainbow&mode=practice&level=99',['-q','-s'],true);
await runnerTests('?edition=classic&mode=practice&level=2',['-q','-s'],true);
console.log('Starting level: single-player ground fire, combat difficulty, invalid input and unchanged classic launches verified.');
await pageTests();

// Regression: the native end screen has input mode zero, but must retain
// the tribute renderer rather than exposing the underlying CGA canvas.
{
  const handlers={},frames=[],sent=[],pauseChanges=[],aimFrames=[],bombChanges=[];
  let inputMode=1,end=0,tick=10;
  const normal={dataset:{},style:{},focus(){}},display={dataset:{}};
  const heap=new Int32Array(9000);heap[0]=3;heap[3]=2000;
  const engine={HEAP32:heap,HEAPU8:new Uint8Array(heap.buffer),IDBFS:{},
    FS:{mkdir(){},mount(){},syncfs(initial,cb){cb(null);},mkdirTree(){},
      analyzePath(){return {exists:false};},writeFile(){},readFile(){return '';}}
    ,_web_variant(){},_web_trainer(){},_web_palette(){},_web_key(){},_web_sound(){},
    _web_bomb:x=>bombChanges.push(x),_web_input_mode:()=>inputMode,_web_read:n=>n===9?end:n===0?tick:n===13?6250:160,
    _web_scene:()=>0,_web_effects:()=>20000,_web_pause:x=>pauseChanges.push(x),callMain(){}};
  const parent={postMessage:msg=>sent.push(msg)};
  class Renderer{static LENGTH=4444;drawScene(s){assert.equal(s[11],6.25,'Fractional native airspeed reaches the display without integer rounding.');aimFrames.push(this.bombHeld);return s[3]>0;}}
  const scope={document:{getElementById:id=>id==='canvas'?normal:display},
    location:{origin,search:'?edition=rainbow&muted=1'},parent,URLSearchParams,
    createSopwith:async()=>engine,RainbowRenderer:Renderer,console,
    setInterval(){},setTimeout(){},requestAnimationFrame:fn=>frames.push(fn),
    addEventListener:(name,fn)=>{handlers[name]=fn;}};
  scope.window=scope;
  vm.runInNewContext(await readFile(new URL('../dist/runner.js',import.meta.url),'utf8'),scope);
  await new Promise(resolve=>setImmediate(resolve));
  frames.shift()();assert.equal(display.hidden,false);
  assert.equal(aimFrames.at(-1),false,'Aim starts hidden.');
  handlers.keydown(event('KeyB','b'));handlers.keydown({...event('KeyB','b'),repeat:true});frames.shift()();
  assert.equal(bombChanges.filter(x=>x===1).length,0,'Holding B never launches a bomb.');
  assert.equal(aimFrames.at(-1),true,'Holding physical B repaints aim without waiting for a game tick.');
  handlers.keyup(event('KeyB','b'));frames.shift()();
  assert.equal(aimFrames.at(-1),false,'Releasing B immediately hides aim.');
  assert.equal(bombChanges.filter(x=>x===1).length,1,'One release launches exactly one bomb.');
  handlers.keyup(event('KeyB','b'));assert.equal(bombChanges.filter(x=>x===1).length,1);
  const touch=down=>handlers.message({origin,source:parent,data:{sopwith:true,type:'key',scan:5,down}});
  touch(true);frames.shift()();assert.equal(aimFrames.at(-1),true,'The screen bomb button also shows aim.');
  touch(false);frames.shift()();assert.equal(aimFrames.at(-1),false);
  touch(true);frames.shift()();handlers.blur();frames.shift()();
  assert.equal(aimFrames.at(-1),false,'Losing focus cannot leave aim or the bomb key stuck.');
  assert.equal(bombChanges.filter(x=>x===1).length,2,'Blur cancels the hold without dropping a bomb.');
  touch(true);frames.shift()();
  handlers.message({origin,source:parent,data:{sopwith:true,type:'pause',value:true}});frames.shift()();
  assert.equal(aimFrames.at(-1),false,'Pausing releases the aim control.');
  handlers.message({origin,source:parent,data:{sopwith:true,type:'pause',value:false}});
  inputMode=0;end=1;heap[12]=1;tick++;
  frames.shift()();assert.equal(display.hidden,false,'Mission complete retains Rainbow.');
  assert.equal(sent.some(x=>x.type==='round-ended'),false);
  end=2;heap[12]=2;heap[10]=750;tick++;
  frames.shift()();
  assert.equal(display.hidden,false,'THE END must not switch back to CGA.');
  assert.equal(normal.style.visibility,'hidden');
  assert.equal(sent.filter(x=>x.type==='round-ended').length,1);
  assert.equal(sent.at(-1).score,750);assert.equal(pauseChanges.at(-1),1);
  frames.shift()();assert.equal(sent.filter(x=>x.type==='round-ended').length,1);
  console.log('End screen: winner/loser retain Rainbow, native game freezes once, and the score reaches the retry page.');
  const jumps=[];engine._web_test=action=>{jumps.push(action);tick++;if(action){inputMode=1;end=0;heap[12]=0;heap[18]=action-1;}else{inputMode=0;end=1;heap[12]=1;heap[25]=72;}};
  handlers.keydown(event('Digit3'));assert.equal(jumps.length,0,'Level shortcuts are inert outside trainer mode.');
  scope.trainer(true);handlers.keydown(event('Digit1'));assert.deepEqual(jumps,[1]);frames.shift()();
  for(let mission=0;mission<2;mission++){
    handlers.keydown(event('KeyE'));frames.shift()();
    heap[25]=4;tick++;frames.shift()();
    assert.equal(sent.filter(x=>x.type==='round-ended'&&x.victory).length,0);
    // Native restart raises gamenum while the old plane still says WINNER.
    heap[18]=mission+1;heap[25]=0;tick++;frames.shift()();
    assert.equal(sent.filter(x=>x.type==='round-ended'&&x.victory).length,0,'E on missions 1/2 cannot award the campaign medal at the native restart boundary.');
    inputMode=1;end=0;heap[12]=0;tick=1;frames.shift()();
  }
  assert.equal(heap[18],2);handlers.keydown(event('KeyE'));frames.shift()();
  heap[9]=3;heap[10]=500;heap[25]=4;tick++;frames.shift()();
  const victory=sent.filter(x=>x.type==='round-ended'&&x.victory);assert.equal(victory.length,1);assert.equal(victory[0].score,650);
  assert.equal(sent.filter(x=>x.type==='score-ready'&&x.victory).length,1);frames.shift()();assert.equal(sent.filter(x=>x.type==='score-ready'&&x.victory).length,1);
  console.log('Trainer E advances 1→2→3 without early medals, including native boundary frames; mission-three departure freezes once and sends one campaign result including the native remaining-lives bonus.');

}
