// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const scope={window:{}};vm.runInNewContext(await readFile(new URL('../dist/patrol-layout.js',import.meta.url),'utf8'),scope);
const {quadMatrix,scoreScale}=scope.window.PatrolLayout;
for(const points of [[[0,0],[760,0],[760,620],[0,620]],[[94,114],[854,190],[856,644],[94,670]],[[18,15],[520,60],[500,450],[30,500]]]){
 const m=quadMatrix(760,620,points);
 for(const [index,[x,y]] of [[0,0],[760,0],[760,620],[0,620]].entries()){
  const z=m[3]*x+m[7]*y+m[15],actual=[(m[0]*x+m[4]*y+m[12])/z,(m[1]*x+m[5]*y+m[13])/z];
  assert.ok(Math.abs(actual[0]-points[index][0])<1e-7&&Math.abs(actual[1]-points[index][1])<1e-7,'All four live-text corners land on the one physical classroom board.');
 }
}
assert.equal(scoreScale(1,600,580),1,'A fitting ten-row board keeps its full lettering size.');
assert.ok(scoreScale(1,587,615)<1,'The observed title-screen overflow requests a smaller fit.');
assert.ok(scoreScale(.9,500,520)<.9);assert.equal(scoreScale(.6,200,600),.6,'The fit has a bounded minimum.');
for(const name of ['Chalk','Engraved']){
 const data=await readFile(new URL('../dist/assets/fonts/patrol/Patrol'+name+'-Regular.woff2',import.meta.url));
 assert.equal(data.toString('ascii',0,4),'wOF2');assert.ok(data.length>1000);
}
console.log('One-board perspective maps all corners exactly; score overflow fitting is bounded; both original WOFF2 fonts are present.');
