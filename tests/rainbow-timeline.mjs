// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const scope={window:{}};
vm.runInNewContext(await readFile(new URL('../dist/rainbow-timeline.js',import.meta.url),'utf8'),scope);
const timeline=new scope.window.RainbowTimeline(),a=new Int32Array(348+18*2);
a[1]=10;a[2]=100;a[4]=152;a[5]=100;a[14]=2;
a.set([1,1,152,100,15,0,1,16,16,0,1,9000,4,0,1,0,123,1],348);
a.set([3,0,180,100,0,0,1,1,1,0,0,9,12,0,1,0,456,1],366);
timeline.push(a,1000);
const b=a.slice();b[1]=11;b[2]+=4;b[4]+=4;b[348+2]+=4;b[348+4]=0;
// Object order can change when native objects are allocated/deleted.
b.set(a.subarray(366,384),348);b[350]=192;
b.set([1,1,156,100,0,0,1,16,16,0,1,9000,4,0,1,0,123,1],366);
timeline.push(b,1100);
const middle=timeline.sample(1150);
assert.equal(middle[2],102);assert.equal(middle[4],154);assert.equal(middle[368],154);
assert.equal(middle[370],15.5,'Plane rotation follows the short path through angle zero.');
assert.equal(middle[350],186,'Object identity survives changes in list order.');
assert.equal(middle[26],10.5);assert.equal(middle[1],11,'Interpolation never changes the simulation tick.');
timeline.pause(1150);assert.equal(timeline.sample(5000)[4],154);
timeline.resume(6000);assert.equal(timeline.sample(6025)[4],155);
const teleport=b.slice();teleport[1]=12;teleport[4]=900;teleport[2]=740;
timeline.push(teleport,6200);assert.equal(timeline.sample(6200)[4],900,'Respawn snaps instead of crossing the level.');
assert.equal(a[4],152);assert.equal(b[4],156,'Snapshots remain read-only.');
console.log('Display timeline: camera/object interpolation, stable identity, angle wrap, paused clock and respawn snapping verified.');
