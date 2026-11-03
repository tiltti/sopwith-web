// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const calls=[];
function context() { return {measureText(s){return {width:String(s).length*Number(this.font?.match(/([0-9.]+)px/)?.[1]||7)*.6};},fillText(...a){calls.push(['type',...a,this.font,this.textAlign]);},setTransform(){},scale(){},translate(...a){calls.push(['translate',...a]);},rotate(a){calls.push(['rotate',a]);},save(){},restore(){},beginPath(){},clip(){calls.push(['clip']);},moveTo(...a){calls.push(['move',...a]);},lineTo(...a){calls.push(['line',...a]);},closePath(){},ellipse(){},fill(){},strokeRect(){},createRadialGradient(){return {addColorStop(){}};},fillRect(...args){calls.push(['rect',...args,this.fillStyle]);},drawImage(...args){calls.push(['image',...args]);}}; }
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
assert.equal(display.width,1920);assert.equal(display.height,1488);
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
// The continuous arch remains level and feet are clipped by foreground terrain.
scene[2]=100;scene[22]=20;scene[23]=80;calls.length=0;renderer.landmark(scene);
const arch=calls.filter(c=>c[0]==='move'||c[0]==='line').slice(0,241);
assert.equal(arch.length,241);
for(let i=0;i<arch.length;i++)assert.ok(Math.abs(arch[i][2]-arch[240-i][2])<1e-8,'Continuous rainbow bands stay level over uneven ground.');
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
scene[12]=0;scene[1]=30;effects.set([1,2,2,6,2,30,6,200,80,4]);
renderer.drawScene(scene,heap,false,effects,ground);
assert.equal(display.dataset.notification,'TARGET DESTROYED');
scene[1]=59;renderer.drawScene(scene,heap,false,effects,ground);assert.equal(display.dataset.notification,undefined);
console.log('Rainbow renderer: alignment, level grounded arch, visible optional bomb marker, bomb estimate, effect deduplication/expiry and unchanged masks verified.');

const activeTarget=new Int32Array([4,5,500,80,0,0,2,16,16]);
calls.length=0;renderer.hud(scene,[activeTarget],false,ground);
assert.ok(calls.some(r=>r[0]==='rect'&&r[1]>=208&&r[1]<=411&&r[2]>=25&&r[2]<64&&r.at(-1)==='#ed786b'),'Active enemy ground targets are red.');
activeTarget[1]=3;calls.length=0;renderer.hud(scene,[activeTarget],false,ground);
assert.ok(!calls.some(r=>r[0]==='rect'&&r[1]>=208&&r[1]<=411&&r[2]>=25&&r[2]<64&&r.at(-1)==='#ed786b'),'Destroyed targets cannot keep a red active marker.');
assert.ok(calls.some(r=>r[0]==='rect'&&r.at(-1)==='#526d78'),'Destroyed locations retain a subdued cross marker.');
activeTarget[1]=5;activeTarget[6]=1;calls.length=0;renderer.teamMark(activeTarget,100);
assert.ok(calls.some(r=>r[0]==='rect'&&r.at(-1)==='#71cebb'),'Friendly ground flags match the map.');
activeTarget[6]=2;calls.length=0;renderer.teamMark(activeTarget,100);
assert.ok(calls.some(r=>r[0]==='rect'&&r.at(-1)==='#ed786b'),'Enemy ground flags match the map.');
activeTarget[1]=3;calls.length=0;renderer.teamMark(activeTarget,100);assert.equal(calls.length,0,'Destroyed sites lose their active flag.');

// Pilots come from native objects; repaint never creates a duplicate actor.
scope.window.RainbowAssets={loaded:true,sprite:()=>null,interfaceArt:()=>null,parachutePose:()=>({worldWidth:24,worldHeight:30}),pilotPose:()=>({worldWidth:24,worldHeight:31}),pilotFrame:()=>({worldWidth:24,worldHeight:48}),departurePose:()=>({width:288,height:192})};
scene[14]=1;scene[1]=60;scene[26]=0;plane[0]=99;plane[1]=4;plane[5]=1;plane[15]=21;plane[16]=128;plane[3]=180;
renderer.drawScene(scene,heap,false,null,ground);assert.equal(display.dataset.parachutes,'1');
renderer.drawScene(scene,heap,false,null,ground);assert.equal(display.dataset.pilots,'1');
plane[1]=5;plane[5]=3;renderer.drawScene(scene,heap,false,null,ground);assert.equal(display.dataset.parachutes,'0');
renderer.readyLevel=2;renderer.readyProgress=.5;renderer.drawScene(scene,heap,false,null,ground);assert.equal(display.dataset.readyLevel,'2');
renderer.readyLevel=null;scene[12]=1;scene[1]=70;renderer.drawScene(scene,heap,false,null,ground);const first=Number(display.dataset.departure);
scene[1]=105;renderer.drawScene(scene,heap,false,null,ground);assert.ok(Number(display.dataset.departure)>first);
scene[12]=0;renderer.drawScene(scene,heap,false,null,ground);assert.equal(display.dataset.departure,undefined);
console.log('Native pilot rendering, grounded walking, READY level labels, receding departure progress and renderer continuity verified.');

// A walking pilot with a stale/interpolated altitude still has grounded soles.
const walker=new Float64Array([99,5,153.4,160,0,3,1,6,9,0,0,20,0,0,0,21,1234,0]);
const hill=new Int32Array(2000).fill(40);hill[156]=70;
calls.length=0;renderer.drawPilots([walker],100,10,hill);
assert.ok(calls.some(c=>c[0]==='translate'&&c[2]===(199-70)*2+2),'Walking feet follow the current terrain, not old actor altitude.');
// Pilot reaction events have audio only, with no speech text or point popup.
calls.length=0;renderer.effects=[{type:7,x:180,y:80,tick:10,id:1,size:-1000}];renderer.drawEffects(100,10);
assert.equal(calls.length,0);
renderer.readyLevel=1;calls.length=0;renderer.drawReady();
assert.ok(!calls.some(c=>c[0]==='rect'&&c[3]>20&&c[4]>20),'READY never creates a box or full-world dimmer.');
console.log('Ground contact on hills, audio-only reactions and compact READY text verified.');

scene[11]=8;scene[4]=152;scene[5]=100;renderer.hud(scene,[],false,ground);
assert.equal(display.dataset.airspeed,'89');assert.equal(display.dataset.altitude,'1444');
console.log('Cockpit instruments use native speed and height above the current terrain.');

const bomb=new Int32Array([2,1,160,120,0,0,1,4,8,16,0,5,4,-2,0,0,4321,1]);
const releasePlane=new Int32Array([1,1,154,126,0,0,1,16,16,16,1,9000,4,0,0,0,1234,0]);
scope.window.RainbowAssets.sprite=()=>({worldWidth:10,worldHeight:18});
renderer.drawBomb(bomb,[bomb,releasePlane],100,10,heap);assert.equal(Number(display.dataset.bombHeading),0);
bomb[13]=-8;renderer.drawBomb(bomb,[bomb,releasePlane],100,12,heap);const midway=Number(display.dataset.bombHeading);
assert.ok(midway>0&&midway<Math.atan2(8,4));renderer.drawBomb(bomb,[bomb,releasePlane],100,15,heap);
assert.ok(Math.abs(Number(display.dataset.bombHeading)-Math.atan2(8,4))<1e-9);
console.log('Bombs release along the airframe and smoothly align with actual ballistic velocity.');
renderer.readyLevel=1;renderer.readyProgress=.2;renderer.drawBoarding(scene,[releasePlane],100,ground);assert.equal(display.dataset.boarding,'20');
renderer.readyLevel=null;renderer.drawBoarding(scene,[releasePlane],100,ground);assert.equal(display.dataset.boarding,undefined);
console.log('Boarding crew follows READY progress only; it creates no physics objects or extra delay.');

scope.window.RainbowAssets.sceneryArt=()=>({width:1536,height:1024});
const terrainCopy=ground.slice();calls.length=0;renderer.terrain(ground.subarray(0,320),12);
assert.ok(calls.some(c=>c[0]==='clip'));assert.ok(calls.some(c=>c[0]==='image'));
assert.deepEqual(ground,terrainCopy,'Painted terrain never changes native crater geometry.');
scope.window.RainbowAssets.wreckPose=()=>({worldWidth:36,worldHeight:48});
plane[0]=1;plane[1]=4;plane[15]=0;plane[2]=152;plane[3]=160;scene[14]=1;scene[12]=0;renderer.readyLevel=null;
const rolls=new Set();for(let t=90;t<98;t+=2){scene[1]=t;renderer.drawScene(scene,heap,false,null,ground);rolls.add(display.dataset.wreckRoll);}
assert.ok(rolls.size>=3,'Falling aircraft advance through axial roll views.');
assert.equal(display.dataset.environment,'painted-coast');
console.log('Painted terrain follows native geometry; fractional scenery layers and falling axial frames render together.');

const localPlayer=new Int32Array([1,1,150,180,0,0,2,16,16,0,1]);
const friendly=new Int32Array([4,5,400,80,0,0,2,16,16]);
calls.length=0;renderer.hud(scene,[localPlayer,friendly],false,ground);
const inMap=r=>r[0]==='rect'&&r[1]>=208&&r[1]<=411&&r[2]>=25&&r[2]<64;
assert.ok(calls.some(r=>inMap(r)&&r.at(-1)==='#71cebb'),'The map compares teams with the actual player faction.');
assert.ok(!calls.some(r=>inMap(r)&&r.at(-1)==='#ed786b'));
assert.ok(calls.some(r=>r[0]==='clip'),'The navigation aperture is clipped before drawing terrain and markers.');
scene[8]=2;renderer.hud(scene,[],false,ground);assert.equal(display.dataset.bombIcons,'2');
assert.equal(display.dataset.airspeedUnit,'MPH');assert.equal(display.dataset.altitudeUnit,'FT AGL');
renderer.readyLevel=1;renderer.readyLives=4;renderer.drawReady();assert.equal(display.dataset.readyLives,'4');
renderer.readyLevel=null;renderer.takeoffHint=true;renderer.drawReady();assert.equal(display.dataset.takeoffHint,'true');
console.log('Clipped navigation, player-relative team legend, remaining bomb icons, MPH/FT readouts, respawn lives and idle instructions verified.');

scope.window.RainbowAssets.explosionPose=frame=>({frame,width:288,height:384});
renderer.effects=[{id:51,type:1,tick:20,x:160,y:140,size:2}];
renderer.drawEffects(100,20);assert.equal(display.dataset.explosionFrame,'0');
renderer.drawEffects(100,24);assert.equal(display.dataset.explosionFrame,'2');
renderer.drawEffects(100,34);assert.equal(display.dataset.explosionFrame,'7');
renderer.drawEffects(100,36);assert.equal(display.dataset.explosionFrame,undefined,'A finished sprite burst never loops.');
console.log('Sprite explosion advances through ignition, fire and smoke, then expires without replay.');

// Live pointers retain calibration; glass must cover the pointer, not the face alone.
const gaugeParts=Object.fromEntries(['dark','ivory','brass','blue','glass'].map(k=>[k,{kind:k}]));
scope.window.RainbowAssets.gaugeLayer=k=>gaugeParts[k];
const angles=[];
for(const value of [-20,0,200,240]){calls.length=0;renderer.gauge(144,43,'speed',value,200,'AIR','MPH');angles.push(calls.find(c=>c[0]==='rotate')[1]);
 const layers=calls.filter(c=>c[0]==='image').map(c=>c[1].kind);assert.deepEqual(layers,['dark','brass','glass']);}
assert.equal(angles[0],angles[1]);assert.equal(angles[2],angles[3]);assert.ok(Math.abs(angles[2]-angles[1]-Math.PI*1.5)<1e-9);
renderer.gaugeStyle='ivory';calls.length=0;renderer.gauge(144,43,'speed',80,200,'AIR','MPH');
assert.deepEqual(calls.filter(c=>c[0]==='image').map(c=>c[1].kind),['ivory','blue','glass']);renderer.gaugeStyle='dark';
const bombIcon={kind:'bomb'};scope.window.RainbowAssets.interfaceArt=k=>k==='bomb'?bombIcon:{kind:k};
scene[8]=5;calls.length=0;renderer.hud(scene,[],false,ground);
const inventory=calls.filter(c=>c[0]==='image'&&c[1]===bombIcon);assert.equal(inventory.length,5);
assert.ok(inventory.every(c=>c[2]>=578&&c[2]+c[4]<=624&&c[3]>=47&&c[3]+c[5]<=68),'The complete inventory fits inside its own clipped magazine.');
assert.ok(calls.some(c=>c[0]==='move'&&c[1]===578&&c[2]===47));
console.log('Ornamental pointers clamp to the calibrated sweep, glass stays on top, and five bombs fit their clipped tray.');
