// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const storage=new Map(),select={listeners:{},addEventListener(n,fn){this.listeners[n]=fn;}},nodes=[];let observe;
const text=(value,protectedName=false)=>({nodeType:3,nodeValue:value,parentElement:{closest:()=>protectedName?{}:null}});
nodes.push(text('Yksinpeli'),text('SIJOITUS: 21'),text('ÄÄNET: POIS'),text('BACK',true));
const pause=text('Tauko');pause.parentElement.id='pause-label';nodes.push(pause);
const body={nodeType:1,dataset:{edition:'rainbow'},closest:()=>null,querySelectorAll:()=>[],getAttribute:()=>null};
const scope={window:{},navigator:{languages:['fr-FR']},NodeFilter:{SHOW_TEXT:4},CustomEvent:class{},
 localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
 document:{body,documentElement:{},getElementById:()=>select,createTreeWalker(){let i=0;return {nextNode:()=>nodes[i++]};}},
 MutationObserver:class{constructor(fn){observe=fn;}observe(){}}};
vm.runInNewContext(await readFile(new URL('../dist/i18n.js',import.meta.url),'utf8'),scope);
const language=scope.window.PatrolLanguage;assert.equal(language.language,'en');assert.equal(nodes[0].nodeValue,'SINGLE PLAYER');
assert.equal(nodes[1].nodeValue,'RANK: 21');assert.equal(nodes[2].nodeValue,'SOUND OFF');assert.equal(nodes[3].nodeValue,'BACK','A player nickname is not translated.');
assert.equal(pause.nodeValue,'PAUSE','The running-game button is an action, not a paused-state label.');
language.set('fi');assert.equal(scope.document.documentElement.lang,'fi');assert.equal(nodes[0].nodeValue,'YKSINPELI');assert.equal(nodes[1].nodeValue,'SIJOITUS: 21');assert.equal(nodes[3].nodeValue,'BACK');
language.set('en');assert.equal(storage.get('sopwith.language'),'en');nodes[0].nodeValue='Lennon tulos: -50 pistettä.';
assert.equal(pause.nodeValue,'PAUSE');
observe([{type:'characterData',target:nodes[0]}]);assert.equal(nodes[0].nodeValue,'Flight score: -50.');
scope.navigator.languages=['fi-FI'];language.set('auto');assert.equal(language.language,'fi');
language.set('invalid');assert.equal(language.language,'fi');assert.equal(language.translate('Rainbow Patrol'),'Rainbow Patrol');
console.log('Menu language: browser fallback, explicit English/Finnish, persistence, dynamic scores and untouched nicknames verified.');
