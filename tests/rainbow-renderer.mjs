// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const calls=[];
function context() { return {setTransform(){},scale(){},translate(){},rotate(){},save(){},restore(){},beginPath(){},ellipse(){},fill(){},strokeRect(){},createRadialGradient(){return {addColorStop(){}};},fillRect(...args){calls.push(['rect',...args,this.fillStyle]);},drawImage(...args){calls.push(['image',...args]);}}; }
function canvas() { const c=context();return {dataset:{},getContext:()=>c}; }
const scope={window:{},document:{querySelectorAll:()=>[],createElement:()=>canvas()},Int32Array,Math};
vm.runInNewContext(await readFile(new URL('../dist/rainbow-renderer.js',import.meta.url),'utf8'),scope);
const Renderer=scope.window.RainbowRenderer;
const display=canvas(),renderer=new Renderer(display);
const scene=new Int32Array(Renderer.LENGTH),heap=new Uint8Array(64);
assert.equal(renderer.drawScene(scene,heap),false,'No scene is drawn before the C game has initialised.');
scene.set([3,10,100,2000,152,100,9000,200,5,5,0,5,0,1,1,100]);
scene[21]=100;scene[22]=40;scene[23]=40;
scene.fill(40,Renderer.HEADER,Renderer.HEADER+320);
const r=Renderer.HEADER+320;
scene.set([1,1,152,100,0,0,1,2,2,16,1,9000,4,0,1,0],r);
heap.set([0,1,2,3],16);
const beforeScene=scene.slice(),beforeHeap=heap.slice();
assert.equal(renderer.drawScene(scene,heap),true);
assert.equal(display.dataset.renderer,'rainbow');
assert.equal(display.width,1920);assert.equal(display.height,1404);
assert.ok(Renderer.mapPoint(100,199,2000).y>=400,'The entire minimap is outside the flight area.');
assert.ok(Renderer.mapPoint(100,199,2000).y<Renderer.mapPoint(100,0,2000).y,'Real altitude determines map height.');
assert.equal(display.dataset.tick,'10');
assert.equal(display.dataset.objects,'1');
assert.deepEqual(scene,beforeScene,'The renderer must not alter game state.');
assert.deepEqual(heap,beforeHeap,'Original sprite/collision masks must remain unchanged.');
assert.ok(calls.some(x=>x[0]==='image'&&x[2]===103&&x[3]===197),'Native world position must map to the same screen position at 2x resolution.');
assert.ok(calls.some(x=>x[0]==='rect'&&x[1]===0&&x[2]===318&&x[3]===2&&x[4]===82),'The ground edge must match the native height field.');
assert.equal(renderer.trail.length,1);
renderer.drawScene(scene,heap);
assert.equal(renderer.trail.length,1,'Repeated animation frames must not add extra trail samples.');
scene[1]=11;scene[4]=300;renderer.drawScene(scene,heap);
assert.equal(renderer.trail.length,1,'A respawn/teleport must not draw a trail across the level.');
assert.equal(display.dataset.rainbow,'true');
scene[2]=600;renderer.drawScene(scene,heap);
assert.equal(display.dataset.rainbow,'false','The landmark must not repeat farther across the map.');
// Different ground heights must clip a level arch, never shear its shape.
scene[2]=100;scene[22]=20;scene[23]=80;calls.length=0;
renderer.landmark(scene);
const archColumns=new Map();
for(const [,x,y,,,color] of calls) {
  const key=`${color}:${x}`;
  archColumns.set(key,Math.min(y,archColumns.get(key)??Infinity));
}
assert.ok(archColumns.size>100);
for(const [key,top] of archColumns) {
  const [color,x]=key.split(':');
  assert.equal(archColumns.get(`${color}:${440-Number(x)}`),top,
    'Every rainbow band must have equal heights on opposite sides of its centre.');
}
assert.ok(calls.some(c=>c[2]>=398),'The feet extend below terrain so its mask can cover them.');
const ground=new Int32Array(2000).fill(40);
const plane=scene.subarray(r,r+Renderer.STRIDE);
const hit=Renderer.predictBomb(plane,ground);
assert.ok(hit&&hit.x>plane[2]&&hit.y===40&&hit.ticks>5);
const smoothPlane=Float64Array.from(plane);smoothPlane[2]+=.5;
assert.ok(Renderer.predictBomb(smoothPlane,ground),'The interpolated plane must retain a stable bomb guide between native ticks.');
plane[12]=-4;
assert.ok(Renderer.predictBomb(plane,ground).x<plane[2],'The impact estimate follows the actual launch velocity.');
plane[12]=4;plane[3]=180;
assert.ok(Renderer.predictBomb(plane,ground).ticks>hit.ticks,'A higher release takes longer to reach the ground.');
calls.length=0;renderer.aim(scene,[plane],ground);
assert.equal(calls.length,0,'The guide stays hidden until the bomb control is held.');
renderer.bombHeld=true;renderer.aim(scene,[plane],ground);
assert.ok(display.dataset.aimX,'An airborne plane with bombs has an impact marker.');
const marker=calls.filter(c=>['#fff2ce','#ffdb81','#263b55'].includes(c[5]));
const markerWidth=Math.max(...marker.map(c=>c[1]+c[3]))-Math.min(...marker.map(c=>c[1]));
assert.ok(markerWidth>=23,'The outlined impact marker must remain large enough to see.');
assert.ok(marker.some(c=>c[5]==='#fff2ce')&&marker.some(c=>c[5]==='#263b55'),
  'The marker needs both a bright face and a dark outline for sky/grass contrast.');
renderer.aimEnabled=false;calls.length=0;renderer.aim(scene,[plane],ground);
assert.equal(calls.length,0,'The optional aim switch still hides the entire guide.');
renderer.aimEnabled=true;
renderer.bombHeld=false;calls.length=0;renderer.aim(scene,[plane],ground);
assert.equal(calls.length,0,'Releasing the bomb control hides the guide.');
assert.equal(display.dataset.aimX,undefined,'Releasing also clears the impact diagnostic.');
scene[2]=100;scene[1]=12;
const effects=new Int32Array(196);effects.set([1,1,1,6,1,12,1,200,80,2]);
renderer.drawScene(scene,heap,false,effects,ground);assert.equal(renderer.effects.length,1);
renderer.drawScene(scene,heap,false,effects,ground);assert.equal(renderer.effects.length,1,'Animation repaint must not duplicate a blast.');
scene[1]=29;renderer.drawScene(scene,heap,false,effects,ground);assert.equal(renderer.effects.length,0);
scene[12]=1;renderer.drawScene(scene,heap,false,effects,ground);
assert.equal(display.dataset.renderer,'rainbow','Winning must keep the same renderer.');
console.log('Rainbow renderer: alignment, level grounded arch, visible optional bomb marker, bomb estimate, effect deduplication/expiry and unchanged masks verified.');
