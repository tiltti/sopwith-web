// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const scope={window:{}};vm.runInNewContext(await readFile(new URL('../dist/rainbow-stages.js',import.meta.url),'utf8'),scope);
const stages=new scope.window.RainbowStages(),scene=new Int32Array(28);scene[3]=3000;scene[1]=1;scene[13]=1;scene[17]=1;scene[9]=5;
let now=0,last=stages.update(scene,now);const advance=(ms,paused=false)=>{for(let n=0;n<ms;n+=100){now+=Math.min(100,ms-n);last=stages.update(scene,now,paused);}return last;};
assert.equal(last.blocked,true);advance(1000);assert.equal(last.blocked,true);
const remaining=stages.remaining;advance(2000,true);assert.equal(stages.remaining,remaining);
advance(1400);assert.equal(last.blocked,true);advance(100);assert.equal(last.blocked,false);assert.equal(last.lives,5);
advance(5000);assert.equal(last.takeoffHint,true);stages.noteInput();advance(100);assert.equal(last.takeoffHint,false);
scene[11]=1;advance(100);scene[11]=0;advance(6000);assert.equal(last.takeoffHint,false,'A flown first life never shows takeoff help again.');
scene[13]=4;advance(100);scene[13]=3;advance(100);scene[13]=1;scene[9]=4;advance(100);
assert.equal(last.blocked,true);assert.equal(last.lives,4);assert.equal(stages.remaining,2500);advance(6000);assert.equal(last.takeoffHint,false);
scene[13]=4;advance(100);scene[13]=1;advance(100);assert.equal(last.blocked,true,'Trainer respawns work without decrementing lives.');
scene[12]=1;advance(100);assert.equal(stages.remaining,0);scene[12]=0;scene[18]=1;scene[1]=0;advance(100);assert.equal(last.blocked,false);
scene[1]=1;advance(100);assert.equal(last.level,2);assert.equal(stages.remaining,2500);
console.log('READY: 2.5 seconds per spawn, lives, pause-safe countdown, trainer/new levels and first-life idle help verified.');
