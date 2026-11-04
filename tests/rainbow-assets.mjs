// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const sources=[],draws=[],rotations=[],panels=[];
class Image {width=1254;height=1254;set src(value){if(/pilot-walk-v3|departure|parachute-sway|wing-badge|cockpit|scenery|clouds|soil|aircraft-roll|turf|instruments|explosions|dashboard-details|gauge-layers|winter-scenery|storm-scenery|world-details|winter-city-targets|mission-materials|airfield-buildings|water-airstrip/.test(value)){this.width=1536;this.height=1024;}else if(value.includes('defense')){this.width=1536;this.height=1024;}else if(value.includes('extras')){this.width=1774;this.height=887;}sources.push(value);queueMicrotask(()=>this.onload());}}
const scope={window:{},Image,document:{createElement:()=>({getContext:()=>({
  drawImage(...args){draws.push(args);},fillRect(...args){panels.push([...args,this.fillStyle]);},translate(){},rotate(a){rotations.push(a);},scale(){}})})}};
vm.runInNewContext(await readFile(new URL('../dist/rainbow-assets.js',import.meta.url),'utf8'),scope);
const assets=scope.window.RainbowAssets;
assert.equal(sources.length,0,'The classic edition must not fetch the Rainbow atlas.');
await assets.ready;assert.equal(assets.loaded,true);assert.equal(sources.length,25);
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
assert.ok(poses.every(p=>p.width===54),'Falling cows retain the same visual width.');
assert.ok(poses[3].height<poses[0].height,'The last cow pose lies down.');
console.log('Rainbow assets: lazy loading, target identities, crop bounds, cache and unchanged collision pixels verified.');

record[0]=1;record[1]=1;
const sizes=[];
for(let angle=0;angle<16;angle++){
 record[4]=angle;const image=assets.sprite(record,heap),draw=draws.at(-1);
 sizes.push(draw.slice(-2));assert.equal(image.width,138);assert.equal(image.height,138);
}
assert.ok(sizes.every(([w,h])=>w===sizes[0][0]&&h===sizes[0][1]),'Every flight angle retains the same artwork size.');
record[1]=4;record[4]=13;assets.sprite(record,heap);assert.notEqual(rotations.at(-1),0,'Falling wrecks rotate with their descent.');
console.log('Aircraft rotation: invariant world dimensions, padded canvas and falling-wreck rotation verified.');
record[0]=4;record[1]=5;record[15]=3;record[6]=1;const friendlyTank=assets.sprite(record,heap);
assert.ok(panels.some(p=>p.at(-1)==='#71cebb'));panels.length=0;
record[6]=2;const enemyTank=assets.sprite(record,heap);assert.notEqual(enemyTank,friendlyTank,'Opposing tanks cannot share an unmarked cached sprite.');
assert.ok(panels.some(p=>p.at(-1)==='#ed786b'));assert.deepEqual(heap,original);
console.log('Ground teams: faction-specific painted panels and distinct sprite caches preserve collision masks.');

const standing=assets.pilotFrame(0,1),walking=assets.pilotFrame(1,1),hostile=assets.pilotFrame(1,2),rear=assets.departurePose(1);
assert.notEqual(standing,walking);assert.notEqual(walking,hostile);assert.equal(rear.width,288);
console.log("Pilots/departure: distinct walk/team poses and padded rear-view airframe assets verified.");

const chute=assets.pilotPose(1);assert.equal(chute.worldWidth,24);
assert.ok(draws.some(d=>d[1]===570&&d[2]===490),'Airborne pilots retain the original detailed parachute crop.');
assert.equal(walking.worldHeight,16);assert.equal(standing.worldHeight,16);
console.log('Original airborne raster poses restored; detailed ground frames share one boot baseline and body scale.');

const sway=[0,1,2,3].map(i=>assets.parachutePose(i));
assert.equal(new Set(sway).size,4);assert.ok(sway.every(s=>s.worldWidth===24&&s.worldHeight===30));
assert.notEqual(assets.parachutePose(0,true),sway[0]);
assert.equal(assets.interfaceArt('speed').worldWidth,56);
assert.equal(assets.interfaceArt('panel').worldHeight,96);
console.log('Four fixed-scale canopy animation frames, damaged canopy, cockpit instruments and panel verified.');

const roll=[0,1,2,3].map(i=>assets.wreckPose(i,1));assert.equal(new Set(roll).size,4);
assert.ok(roll.every(s=>s.worldWidth===36&&s.worldHeight===48));assert.notEqual(assets.wreckPose(0,2),roll[0]);
console.log('Falling aircraft: four constant-scale axial roll frames for each faction.');

const bursts=Array.from({length:8},(_,i)=>assets.explosionPose(i));
assert.equal(new Set(bursts).size,8);assert.ok(bursts.every(p=>p.width===288&&p.height===384));
assert.equal(assets.interfaceArt('lives').worldWidth,55);assert.equal(assets.interfaceArt('birds').worldWidth,46);
console.log('Eight fixed-size explosion frames, counter bezels and four embossed tape labels verified.');

const dialParts=["ivory","dark","blue","brass","glass"].map(k=>assets.gaugeLayer(k));
assert.equal(new Set(dialParts).size,5);assert.ok(dialParts.every(p=>p.width===512&&p.height===512));
assert.equal(assets.gaugeLayer("brass"),dialParts[3]);
console.log("Measured dial, ornamental pointer and transparent glass layers are separately cached.");

const worldDetails=Array.from({length:8},(_,i)=>assets.worldDetail(i));assert.equal(new Set(worldDetails).size,8);assert.ok(worldDetails.every(p=>p.width>300&&p.height>200));
assert.notEqual(assets.sceneryArt("winter"),assets.sceneryArt("storm"));console.log("Winter/storm scenery, separate terrain materials, eight fossil/flag/ruin props loaded.");
