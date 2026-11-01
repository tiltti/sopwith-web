// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const sources=[],draws=[];
class Image {width=1254;height=1254;set src(value){if(value.includes('extras')){this.width=1774;this.height=887;}sources.push(value);queueMicrotask(()=>this.onload());}}
const scope={window:{},Image,document:{createElement:()=>({getContext:()=>({
  drawImage(...args){draws.push(args);},translate(){},rotate(){},scale(){}})})}};
vm.runInNewContext(await readFile(new URL('../dist/rainbow-assets.js',import.meta.url),'utf8'),scope);
const assets=scope.window.RainbowAssets;
assert.equal(sources.length,0,'The classic edition must not fetch the Rainbow atlas.');
await assets.ready;assert.equal(assets.loaded,true);assert.equal(sources.length,3);
const record=new Int32Array(18);record[1]=5;record[6]=1;record[7]=record[8]=16;
const cases=[[1,0,0],[4,0,4],[4,1,5],[4,2,7],[4,3,6],[4,4,8],[4,5,9],[4,6,16],[4,7,10],[4,18,11],[4,19,17],[9,0,2],[12,0,12],[2,0,13],[10,0,21],[11,0,22]];
for(const [type,kind,frame] of cases){record[0]=type;record[15]=kind;assert.equal(assets.frameFor(record),frame);}
const heap=new Uint8Array(256);
for(let y=6;y<15;y++)for(let x=1;x<15;x++)heap[y*16+x]=1;
const original=heap.slice();record[0]=9;record[1]=5;
const sprite=assets.sprite(record,heap),draw=draws.at(-1),[dx,dy,dw,dh]=draw.slice(-4);
assert.equal(sprite.width,102);assert.equal(sprite.height,102);
assert.ok(dx>=3&&dx+dw<=31&&dy>=13&&dy+dh<=31,
  'New artwork must fit the occupied native mask bounds, including its transparent frame padding.');
assert.deepEqual(heap,original,'Sampling art must never modify collision pixels.');
assert.equal(assets.sprite(record,heap),sprite,'Identical native frames reuse the prepared canvas.');
const poses=[0,1,2,3].map(i=>assets.cowPose(i));
assert.ok(poses.every(p=>p.width===102),'Falling cows retain the same visual width.');
assert.ok(poses[3].height<poses[0].height,'The last cow pose lies down.');
console.log('Rainbow assets: lazy loading, target identities, crop bounds, cache and unchanged collision pixels verified.');
