// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const scope={window:{}};vm.runInNewContext(await readFile(new URL('../dist/patrol-demo.js',import.meta.url),'utf8'),scope);
const demo=new scope.window.PatrolDemo(),s=new Int32Array(5000),ground=new Int32Array(3000).fill(30);
s[3]=3000;s[4]=1000;s[5]=46;s[13]=1;s[17]=1;
let action=demo.update(s,ground);assert.ok(action.scans.includes(27)&&action.scans.includes(54),'The real aircraft accelerates and raises its nose for departure.');
s[17]=0;s[11]=12;s[5]=140;s[1]=20;action=demo.update(s,ground);assert.ok(action.scans.includes(56),'A high aircraft levels towards a safe cruise height.');
s[14]=1;s.set([4,5,1065,50,0,0,2],348);action=demo.update(s,ground);assert.equal(action.bomb,true);
s[1]++;assert.equal(demo.update(s,ground).bomb,false,'Bombs are paced, not emitted on every paint.');
s[1]=28;s.set([1,1,1120,140,0,0,2],348);assert.ok(demo.update(s,ground).scans.includes(44),'A live hostile aircraft ahead triggers gunfire.');
s[354]=1;assert.equal(demo.update(s,ground).scans.includes(44),false,'A friendly plane does not trigger demonstration gunfire.');
s[1]=400;assert.equal(demo.update(s,ground).level,2);
s[18]=1;s[1]=0;assert.equal(demo.update(s,ground).level,undefined);s[1]=400;assert.equal(demo.update(s,ground).level,3);
s[18]=2;s[1]=0;demo.update(s,ground);s[1]=400;assert.equal(demo.update(s,ground).level,1);
console.log('Demo: takeoff inputs, terrain-aware cruise, paced real bombs and coast/winter/storm loop verified.');
