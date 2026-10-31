// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const origin = 'https://example.test';
const event = (code, key = code) => ({ code, key, target:{tagName:'BODY'},
  preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; } });

async function runnerTests() {
  const handlers = {}, sent = [], pressed = [], trainerChanges = [];
  let inputMode = 0;
  const canvas = { dataset:{}, focus() {} };
  const engine = {
    FS:{ mkdir() {}, mount() {}, syncfs(initial, cb) { cb(null); }, mkdirTree() {},
      analyzePath() { return {exists:false}; }, writeFile() {}, readFile() { return 'conf_medals 0'; } },
    IDBFS:{}, _web_read:() => 0, _web_input_mode:() => inputMode,
    _web_key:(...args) => pressed.push(args), _web_sound() {}, _web_pause() {},
    _web_palette() {}, _web_trainer:value => trainerChanges.push(value), callMain() {},
  };
  const parent = { postMessage:message => sent.push(message) };
  const scope = { document:{getElementById:() => canvas}, location:{origin,search:''},
    parent, URLSearchParams, createSopwith:async () => engine, console,
    setInterval() {}, setTimeout() {}, addEventListener:(name, fn) => { handlers[name] = fn; } };
  scope.window = scope;
  vm.runInNewContext(await readFile(new URL('../dist/runner.js', import.meta.url), 'utf8'), scope);
  await new Promise(resolve => setImmediate(resolve));

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
  const elements = new Map(), documentHandlers = {}, windowHandlers = {}, sent = [];
  function element() { return { hidden:true, value:'0', dataset:{}, listeners:{}, lastElementChild:{},
    classList:{add() {},remove() {}}, setAttribute(name,value) { this[name] = value; },
    addEventListener(name,fn) { this.listeners[name] = fn; }, focus() {} }; }
  const get = id => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); };
  const child = { postMessage:msg => sent.push(msg), focus() {} };
  get('game').contentWindow = child;
  const scope = { document:{body:{dataset:{edition:'rainbow'}},getElementById:get, querySelector:() => ({value:'practice'}),querySelectorAll:() => [],
    addEventListener:(name,fn) => {documentHandlers[name] = fn;}}, location:{origin},
    matchMedia:() => ({matches:false}), localStorage:{getItem:() => null,setItem() {}},
    setTimeout:() => 1, clearTimeout() {}, console,
    addEventListener:(name,fn) => {windowHandlers[name] = fn;} };
  scope.window = scope;
  vm.runInNewContext(await readFile(new URL('../dist/app.js',import.meta.url),'utf8'),scope);
  assert.equal(get('mute')['aria-pressed'], 'true', 'Sound starts off.');
  scope.trainer(); get('start').listeners.click();
  assert.match(get('game').src,/trainer=1/);
  assert.match(get('game').src,/edition=rainbow/, 'The tribute page must request the new renderer.');
  const message = data => windowHandlers.message({origin,source:child,data:{sopwith:true,...data}});
  message({type:'ready',inputMode:0});
  documentHandlers.keydown(event('KeyS','s'));
  assert.equal(get('mute')['aria-pressed'], 'true', 'S outside the frame must not mute-toggle over a native menu.');
  message({type:'input-mode',mode:1});
  documentHandlers.keydown(event('KeyS','s'));
  assert.equal(get('mute')['aria-pressed'], 'false');
  scope.trainer(false); get('restart').listeners.click(); get('start').listeners.click();
  assert.match(get('game').src,/trainer=0/);
  console.log('Page: quiet default, console trainer on/off/new-game propagation and native-menu shortcut guard verified.');
}

await runnerTests();
await pageTests();
