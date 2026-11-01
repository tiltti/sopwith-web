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
  createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length),duration:length/22050};}
  createBufferSource(){return {...node(),playbackRate:param(),start(){started++;},stop(){stopped++;}};}
  async decodeAudioData(){return {duration:1};}
  async suspend(){this.state='suspended';}async resume(){this.state='running';}
}
const scope={window:{AudioContext:Context,fetch:async()=>{fetched++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(1)};}},console};
vm.runInNewContext(await readFile(new URL('../dist/rainbow-audio.js',import.meta.url),'utf8'),scope);
const mixer=new scope.window.RainbowAudio();
assert.equal(created,0,'No audio context exists before explicit sound enable.');
await mixer.setEnabled(false);assert.equal(fetched,0);
await mixer.setEnabled(true);assert.equal(created,1);assert.equal(fetched,6);assert.equal(mixer.status,'samples');
assert.equal(Object.keys(mixer.buffers).length,9,'Six CC0 samples and three original synthesized cues load.');
const scene=new Int32Array(5000);scene[1]=10;scene[3]=2000;scene[8]=5;scene[11]=5;scene[13]=1;scene[14]=1;
scene.set([3,0,170,100,0,0,1,1,1,0,0,9,12,0,1,0,123,1],348);
const effects=new Int32Array(196);effects.set([1,0,0,6]);let id=0;
function emit(type,size=1){scene[1]++;id++;effects[1]=id;effects[2]=Math.min(32,id);effects.set([id,scene[1],type,190,80,size],4+((id-1)%32)*6);mixer.step(scene,effects);}
emit(4);assert.equal(mixer.voices.get('mechanical').name,'whistle');
emit(1,2);assert.equal(mixer.voices.get('mechanical').name,'blast');assert.equal(mixer.voices.get('fx').name,'boom');
assert.equal(mixer.voices.size,4,'Engine, gun, mechanical and FX stay within four voices.');
const before=started;mixer.step(scene,effects);assert.equal(started,before,'Repaint cannot replay effects.');
emit(3);assert.equal(mixer.voices.get('fx').name,'moo');
emit(5,4);assert.equal(mixer.voices.get('fx').name,'moo','A cannon does not cut off a cow reaction.');
mixer.stop('fx');emit(5,4);assert.equal(mixer.voices.get('fx').name,'cannon');
emit(6,4);assert.equal(mixer.voices.get('gun').name,'fanfare');
scene[1]++;mixer.step(scene,effects);assert.equal(mixer.voices.get('gun').name,'fanfare','Gunfire cannot cut off the short fanfare.');
await mixer.setEnabled(false);assert.equal(mixer.voices.size,0);assert.ok(stopped>=4);
scene[14]=0;emit(1);await mixer.setEnabled(true);scene[1]++;mixer.step(scene,effects);
assert.equal(mixer.voices.size,1,'Unmuting cannot replay events that happened while muted.');
assert.equal(fetched,6,'Resume reuses decoded samples.');
scene[1]++;scene[12]=2;mixer.step(scene,effects);assert.equal(mixer.voices.size,0);
console.log('Audio: silent/lazy default, bomb whistle/impact, cow moo, cannon/fanfare priority, four-voice bound, dedup and mute/end cleanup verified.');
