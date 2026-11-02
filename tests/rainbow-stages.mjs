// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const scope={window:{}};vm.runInNewContext(await readFile(new URL('../dist/rainbow-stages.js',import.meta.url),'utf8'),scope);
const stages=new scope.window.RainbowStages(),scene=new Int32Array(28);scene[3]=3000;scene[1]=1;
assert.equal(stages.update(scene,0).blocked,true);assert.equal(stages.update(scene,100).level,1);
for(let t=200;t<=1000;t+=100)stages.update(scene,t);
const remaining=stages.remaining;for(let t=1100;t<=3000;t+=100)stages.update(scene,t,true);assert.equal(stages.remaining,remaining);
for(let t=3100;t<=4400;t+=100)stages.update(scene,t);assert.equal(stages.remaining,0);
scene[12]=1;stages.update(scene,4500);assert.equal(stages.remaining,0);
scene[12]=0;scene[18]=1;scene[1]=0;assert.equal(stages.update(scene,4600).blocked,false,'Native camera initialization must finish before the next READY hold.');
scene[1]=1;assert.equal(stages.update(scene,4700).level,2);assert.equal(stages.remaining,2200);
console.log('READY: first/new level, 2.2-second native hold, pause-safe countdown and no win interruption verified.');
