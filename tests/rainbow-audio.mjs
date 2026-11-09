// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
let created=0,fetched=0,started=0,stopped=0;const fetchedUrls=[];
const param=()=>({value:0,setValueAtTime(){},setTargetAtTime(value){this.value=value;},exponentialRampToValueAtTime(){}});
function node(){return {connect(){},disconnect(){},gain:param(),frequency:param(),pan:param()};}
class Context {
  constructor(){created++;this.state='suspended';this.currentTime=0;this.destination={};}
  createGain(){return node();}createBiquadFilter(){return node();}createStereoPanner(){return node();}
  createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length),duration:length/22050};}
  createBufferSource(){return {...node(),playbackRate:param(),start(){started++;},stop(){stopped++;}};}
  async decodeAudioData(){return {duration:1};}
  async suspend(){this.state='suspended';}async resume(){this.state='running';}
}
const scope={window:{AudioContext:Context,fetch:async url=>{fetched++;fetchedUrls.push(url);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(1)};}},console};
vm.runInNewContext(await readFile(new URL('../dist/rainbow-audio.js',import.meta.url),'utf8'),scope);
const mixer=new scope.window.RainbowAudio();
assert.equal(created,0,'No audio context exists before explicit sound enable.');
await mixer.setEnabled(false);assert.equal(fetched,0);
await mixer.setEnabled(true);assert.equal(created,1);assert.equal(fetched,13);assert.equal(mixer.status,'samples');
assert.equal(fetchedUrls.filter(url=>url.includes('victory-v23/victory.wav')).length,1,'The new recorded fanfare replaces the old layered victory mix.');
assert.equal(fetchedUrls.filter(url=>url.includes('pilot-v24/enemy-argh.wav')).length,1,'Enemy pilots use the real yell WAV in place of spoken Himmel.');
assert.equal(Object.keys(mixer.buffers).length,16,'Thirteen samples and three original synthesized cues load.');
const scene=new Int32Array(5000);scene[1]=10;scene[3]=2000;scene[8]=5;scene[11]=5;scene[13]=1;scene[14]=1;
scene.set([3,0,170,100,0,0,1,1,1,0,0,9,12,0,1,0,123,1],348);
const effects=new Int32Array(196);effects.set([1,0,0,6]);let id=0;
function emit(type,size=1){scene[1]++;id++;effects[1]=id;effects[2]=Math.min(32,id);effects.set([id,scene[1],type,190,80,size],4+((id-1)%32)*6);mixer.step(scene,effects);}
emit(4);assert.equal(mixer.voices.get('mechanical').name,'whistle');
emit(1,2);assert.equal(mixer.voices.get('mechanical').name,'blast');assert.equal(mixer.voices.get('fx').name,'boom');
assert.equal(mixer.voices.size,4,'Engine, gun, mechanical and FX stay within four voices.');
const before=started;mixer.step(scene,effects);assert.equal(started,before,'Repaint cannot replay effects.');
emit(2);assert.equal(mixer.voices.get('fx').name,'bird');
emit(3);assert.equal(mixer.voices.get('fx').name,'moo');
emit(5,4);assert.equal(mixer.voices.get('fx').name,'moo','A cannon does not cut off a cow reaction.');
mixer.stop('fx');emit(5,4);assert.equal(mixer.voices.get('fx').name,'cannon');
emit(6,4);assert.equal(mixer.voices.has('jingle'),false,'Normal target destruction does not repeat a fanfare.');
emit(6,-1);assert.equal(mixer.voices.get('jingle').name,'wah','Friendly targets play the recorded sad trombone.');
scene[1]++;mixer.step(scene,effects);assert.equal(mixer.voices.get('jingle').name,'wah','Gunfire cannot cut off the friendly-target warning.');
assert.ok(mixer.voices.size<=5);
await mixer.setEnabled(false);assert.equal(mixer.voices.size,0);assert.ok(stopped>=4);
scene[14]=0;emit(1);await mixer.setEnabled(true);scene[1]++;mixer.step(scene,effects);
assert.equal(mixer.voices.size,1,'Unmuting cannot replay events that happened while muted.');
assert.equal(fetched,13,'Resume reuses decoded samples.');
scene[1]++;scene[12]=2;mixer.step(scene,effects);assert.equal(mixer.voices.size,0);
console.log('Audio: silent/lazy default, bomb whistle/impact, cow moo, cannon/warning priority and no repeated victory fanfare, five-voice bound, dedup and mute/end cleanup verified.');

const startup=new scope.window.RainbowAudio({startup:true});
const parked=scene.slice();parked[1]=1;parked[12]=0;parked[13]=1;parked[14]=0;parked[17]=1;
startup.step(parked,null);assert.equal(startup.voices.size,0);
await startup.setEnabled(true);parked[1]++;startup.step(parked,null);assert.equal(startup.voices.get('engine').name,'startup');
assert.equal(startup.startupCount,1);
parked[1]++;startup.step(parked,null);assert.equal(startup.startupCount,1,'A parked plane does not restart every tick.');
function playerState(state,atHome=0){parked[1]++;parked[13]=state;parked[17]=atHome;startup.step(parked,null);}
playerState(4);playerState(3);playerState(1,1);
assert.equal(startup.startupCount,2,'A respawn restarts the engine even when the trainer preserves lives and identity.');
assert.equal(startup.voices.get('engine').name,'startup');
startup.step(parked,null);assert.equal(startup.startupCount,2,'The same respawn snapshot is consumed once.');
playerState(1,0);playerState(6,0);playerState(1,1);
assert.equal(startup.startupCount,2,'Returning home/refueling or recovering from damage is not a new aircraft.');
await startup.setEnabled(false);await startup.setEnabled(true);parked[1]++;startup.step(parked,null);assert.equal(startup.voices.get('engine').name,'engine','Unmute does not replay startup.');
await startup.setEnabled(false);playerState(4);playerState(3);playerState(1,1);
assert.equal(startup.startupCount,2,'Muted respawns remain silent.');
await startup.setEnabled(true);playerState(1,1);assert.equal(startup.startupCount,2,'Unmute cannot replay a muted respawn.');
playerState(4);playerState(3);playerState(1,1);assert.equal(startup.startupCount,3,'Enabling sound mid-game enables the next genuine respawn.');
parked[18]++;playerState(1,1);assert.equal(startup.startupCount,4,'A new level starts its new aircraft.');
parked[1]=1;startup.step(parked,null);assert.equal(startup.startupCount,5,'A native level-clock reset also starts the new aircraft.');
parked[12]=2;playerState(3);playerState(1,1);assert.equal(startup.startupCount,5,'Game over cannot start an engine.');
console.log('Radial startup: initial spawn, repeated/trainer respawns and new levels play once each; silent spawns, refueling and mute/resume never replay.');

await mixer.setEnabled(true);scene[12]=0;scene[14]=1;scene[13]=4;scene[1]++;
scene.set([1,4,170,120,12,0,1,16,16,0,1,20,0,-8,1,0,567,1],348);
mixer.step(scene,effects);assert.equal(mixer.voices.get('mechanical').name,'dive');
const diveVoice=mixer.voices.get('mechanical');assert.equal(diveVoice.source.loop,false);
diveVoice.source.onended();scene[1]++;mixer.step(scene,effects);
assert.equal(mixer.voices.has('mechanical'),false,'A completed falling sample never loops or restarts during the same fall.');
scene[1]++;scene[349]=1;mixer.step(scene,effects);scene[1]++;scene[349]=4;mixer.step(scene,effects);
assert.equal(mixer.voices.get('mechanical').name,'dive','A new fall can play its own sample.');
scene[1]++;scene[349]=3;mixer.step(scene,effects);assert.equal(mixer.voices.get('mechanical').name,'blast');
emit(7,-1000);assert.equal(mixer.voices.get('fx').name,'argh');
mixer.stop('fx');emit(8,-1000);assert.equal(mixer.voices.get('fx').name,'himmel');
scene[1]++;scene[12]=1;const beforeVictory=started;mixer.step(scene,effects);
assert.equal(mixer.voices.size,1);assert.equal(mixer.voices.get('jingle').name,'victory');
assert.equal(mixer.voices.get('jingle').source.loop,false,'The recorded victory cue plays once, without looping.');
scene[1]++;mixer.step(scene,effects);assert.equal(started,beforeVictory+1,'The level fanfare/march starts only once.');
await mixer.setEnabled(false);await mixer.setEnabled(true);scene[1]++;mixer.step(scene,effects);assert.equal(mixer.voices.size,0,'Unmuting does not replay a consumed victory.');
console.log('One-shot dive/crash handoff, separate human/German pilot reactions, once-per-level victory music and silent-win dedup verified.');

const rpm=new scope.window.RainbowAudio();await rpm.setEnabled(true);
const flight=new Int32Array(5000);flight[1]=1;flight[3]=3000;flight[13]=1;flight[17]=1;
rpm.step(flight,null);rpm.voices.get('engine').source.onended();flight[1]++;rpm.step(flight,null);
const idleRate=rpm.voices.get('engine').source.playbackRate.value;
flight[1]++;flight[17]=0;flight[11]=16;flight[27]=100;flight[14]=1;flight.set([1,1,100,150,0,0,1,16,16,0,1,1,14,-8],348);rpm.step(flight,null);
assert.ok(rpm.voices.get('engine').source.playbackRate.value>idleRate);
assert.ok(rpm.voices.get('engine').gain.gain.value<=.16,'The continuous engine remains below the weapon/effect mix.');
flight[1]=77;flight[18]=2;rpm.step(flight,null);assert.equal(rpm.voices.get('fx').name,'thunder');assert.equal(rpm.voices.get('fx').source.playbackRate.value,1);
await rpm.setEnabled(false);flight[1]=224;rpm.step(flight,null);assert.equal(rpm.voices.size,0);
console.log('Quiet engine RPM/gain follow throttle, speed and descent; storm thunder shares an existing effect voice and stays muted by default.');
