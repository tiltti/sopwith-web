// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const scope={window:{},URLSearchParams};
vm.runInNewContext(await readFile(new URL('../dist/splash-options.js',import.meta.url),'utf8'),scope);
const {fromSearch,options}=scope.window.PatrolSplash;
assert.equal(fromSearch(''),'current','Producing variants must not silently replace the chosen default.');
assert.equal(fromSearch('?splash=airfield'),'airfield');assert.equal(fromSearch('?splash=campaign'),'campaign');
for(const key of ['missing','__proto__','constructor','https://example.com/other.png'])assert.equal(fromSearch('?splash='+encodeURIComponent(key)),'current','Only the three local art choices are allowed.');
for(const option of Object.values(options))assert.ok((await readFile(new URL('../dist/assets/'+option.image,import.meta.url))).length>0);
console.log('Splash choices: unchanged default, two explicit local previews and safe fallback for invalid/external keys verified.');
