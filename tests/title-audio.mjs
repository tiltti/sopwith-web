// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const events={},documentEvents={},elements={},created=[];
for(const id of ['title-sound','mute'])elements[id]={listeners:{},addEventListener(n,f){this.listeners[n]=f;},setAttribute(){},getAttribute(){return 'true';},click(){}};
class Audio{constructor(src){this.src=src;this.paused=true;created.push(this);}async play(){this.paused=false;}pause(){this.paused=true;}}
const scope={Audio,document:{body:{dataset:{edition:'rainbow',gameState:'idle'}},hidden:false,getElementById:id=>elements[id],addEventListener:(n,f)=>documentEvents[n]=f},window:{addEventListener:(n,f)=>events[n]=f}};
vm.runInNewContext(await readFile(new URL('../dist/title-audio.js',import.meta.url),'utf8'),scope);
assert.equal(created.length,0,'A silent splash does not even create a media request.');
events['sopwith-mute']({detail:{muted:false}});assert.equal(created.length,1);assert.equal(created[0].paused,false);assert.equal(created[0].loop,true);
scope.document.body.dataset.gameState='loading';events['sopwith-layer']();assert.equal(created[0].paused,true,'Starting the game stops title music before the engine cue.');
scope.document.body.dataset.gameState='idle';events['sopwith-layer']();assert.equal(created[0].paused,false);
scope.document.hidden=true;documentEvents.visibilitychange();assert.equal(created[0].paused,true);
events['sopwith-mute']({detail:{muted:true}});assert.equal(created[0].paused,true);
console.log('Title music: silent opt-in, lazy request, splash-only playback and game/tab/mute cleanup verified.');
