// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

let created=0,fetched=0,started=0,stopped=0;
const param=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},exponentialRampToValueAtTime(){}});
function node(){return {connect(){},disconnect(){},gain:param(),frequency:param(),pan:param()};}
class Context {
  constructor(){created++;this.state='suspended';this.currentTime=0;this.destination={};}
  createGain(){return node();}createBiquadFilter(){return node();}createStereoPanner(){return node();}
  createBufferSource(){return {...node(),playbackRate:param(),start(){started++;},stop(){stopped++;}};}
  async decodeAudioData(){return {duration:1};}
  async suspend(){this.state='suspended';}async resume(){this.state='running';}
}
const scope={window:{AudioContext:Context,fetch:async()=>{fetched++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(1)};}},console};
vm.runInNewContext(await readFile(new URL('../dist/rainbow-audio.js',import.meta.url),'utf8'),scope);
const mixer=new scope.window.RainbowAudio();
assert.equal(created,0,'No audio context is created before explicit sound enable.');
await mixer.setEnabled(false);assert.equal(fetched,0,'Muted starts do not fetch or decode samples.');
await mixer.setEnabled(true);assert.equal(created,1);assert.equal(fetched,5);assert.equal(mixer.status,'samples');
const scene=new Int32Array(4600);scene[1]=10;scene[3]=2000;scene[8]=5;scene[11]=5;scene[13]=1;scene[14]=1;
scene.set([3,0,170,100,0,0,1,1,1,0,0,9,12,0],348);
const effects=new Int32Array(196);effects.set([1,1,1,6,1,10,1,190,80,2]);
mixer.step(scene,effects);
assert.equal(mixer.voices.size,4,'Engine, gun, mechanism and blast share four bounded voices.');
const before=started;mixer.step(scene,effects);assert.equal(started,before,'Repainting a tick cannot replay a shot or explosion.');
await mixer.setEnabled(false);assert.equal(mixer.voices.size,0);assert.ok(stopped>=4);assert.equal(mixer.context.state,'suspended');
scene[1]++;scene[14]=0;effects[1]=2;effects[4]=2;effects[5]=scene[1];mixer.step(scene,effects);
await mixer.setEnabled(true);scene[1]++;mixer.step(scene,effects);
assert.equal(mixer.voices.size,1,'Unmuting must not replay explosions that happened while muted.');
assert.equal(fetched,5,'Pause/unmute reuses decoded buffers.');
scene[1]++;scene[12]=2;mixer.step(scene,effects);assert.equal(mixer.voices.size,0,'The round end stops the engine and effects.');
console.log('Rainbow audio: silent default, lazy sample loading, four voices, tick deduplication, mute/resume and end cleanup verified.');
