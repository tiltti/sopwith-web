// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const scope={window:{}};vm.runInNewContext(await readFile(new URL('../dist/rainbow-stages.js',import.meta.url),'utf8'),scope);
const stages=new scope.window.RainbowStages(),scene=new Int32Array(28);scene[3]=3000;scene[1]=1;
assert.equal(stages.update(scene,0).blocked,true);assert.equal(stages.update(scene,100).level,1);
stages.update(scene,200);assert.equal(stages.remaining,500);
const remaining=stages.remaining;for(let t=300;t<=2000;t+=100)stages.update(scene,t,true);assert.equal(stages.remaining,remaining);
for(let t=2100;t<=2500;t+=100)stages.update(scene,t);assert.equal(stages.remaining,0);
scene[12]=1;stages.update(scene,4500);assert.equal(stages.remaining,0);
scene[12]=0;scene[18]=1;scene[1]=0;assert.equal(stages.update(scene,4600).blocked,false,'Native camera initialization must finish before the next READY hold.');
scene[1]=1;assert.equal(stages.update(scene,4700).level,2);assert.equal(stages.remaining,700);
console.log('READY: first/new level, 0.7-second native hold, pause-safe countdown and no win interruption verified.');
