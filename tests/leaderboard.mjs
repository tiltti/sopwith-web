// SPDX-License-Identifier: GPL-2.0-or-later
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import worker from '../server/worker.js';

const directory=mkdtempSync(join(tmpdir(),'sopwith-scores-test-')),filename=join(directory,'scores.sqlite');
let db=new DatabaseSync(filename);
const migrationDir=new URL('../server/drizzle/',import.meta.url);
for(const file of readdirSync(migrationDir).filter(n=>n.endsWith('.sql')).sort()){
  db.exec(readFileSync(new URL(file,migrationDir),'utf8'));
  if(file.startsWith('0000'))db.exec("INSERT INTO scores VALUES ('legacy','classic','combat','LEG',1,1,0)");
}
assert.equal(db.prepare("SELECT difficulty FROM scores WHERE run_id='legacy'").get().difficulty,'normal','Existing server scores migrate to normal difficulty.');
const DB={prepare(sql){const statement=db.prepare(sql);let args=[];return {
  bind(...values){args=values;return this;},async run(){return statement.run(...args);},
  async first(){return statement.get(...args)||null;},async all(){return {results:statement.all(...args)};}
};}};
async function call(path,{body,token,origin='https://tiltti.github.io',method=body?'POST':'GET'}={}) {
  const response=await worker.fetch(new Request('https://scores.test'+path,{method,
    headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},
    body:body?JSON.stringify(body):undefined}),{DB});
  return {status:response.status,data:response.status===204?null:await response.json(),headers:response.headers};
}
try {
  let r=await call('/api/scores?edition=rainbow&mode=practice');assert.deepEqual(r.data.scores,[]);
  r=await call('/api/runs',{body:{edition:'rainbow',mode:'practice'}});assert.equal(r.status,201);
  const ticket=r.data,entry={runId:ticket.id,nickname:'Testipilotti',score:500,level:1,ticks:10,trainerUsed:false};
  r=await call('/api/scores',{body:entry,token:ticket.token});assert.equal(r.status,201);assert.equal(r.data.saved.score,500);
  r=await call('/api/scores',{body:{...entry,score:999},token:ticket.token});assert.equal(r.data.saved.score,500,'A retry is idempotent; it cannot overwrite a submitted run.');
  r=await call('/api/scores',{body:entry,token:'wrong'});assert.equal(r.status,401);
  r=await call('/api/scores',{body:{...entry,trainerUsed:true},token:ticket.token});assert.equal(r.status,400);
  r=await call('/api/scores',{body:{...entry,nickname:'<script>'},token:ticket.token});assert.equal(r.status,400);
  r=await call('/api/scores',{body:{...entry,ticks:100000},token:ticket.token});assert.equal(r.status,400);
  r=await call('/api/runs',{body:{edition:'rainbow',mode:'practice'},origin:'https://wrong.test'});assert.equal(r.status,403);
  r=await call('/api/runs',{body:{edition:'rainbow',mode:'practice',large:'x'.repeat(3000)}});assert.equal(r.status,413);
  r=await call('/api/scores?edition=classic&mode=practice');assert.deepEqual(r.data.scores,[]);
  r=await call('/api/scores?edition=rainbow&mode=combat');assert.deepEqual(r.data.scores,[]);
  r=await call('/api/runs',{body:{edition:'rainbow',mode:'practice',difficulty:'easy'}});assert.equal(r.status,201);
  const easyTicket=r.data;r=await call('/api/scores',{body:{...entry,runId:easyTicket.id,nickname:'EAS',score:777,difficulty:'normal'},token:easyTicket.token});assert.equal(r.status,201);
  r=await call('/api/scores?edition=rainbow&mode=practice&difficulty=easy');assert.equal(r.data.scores.length,1);assert.equal(r.data.scores[0].score,777);
  r=await call('/api/scores?edition=rainbow&mode=practice');assert.equal(r.data.scores.length,1);assert.equal(r.data.scores[0].score,500);
  r=await call('/api/runs',{body:{edition:'classic',mode:'practice',difficulty:'easy'}});assert.equal(r.status,400);
  db.close();db=new DatabaseSync(filename);
  r=await call('/api/scores?edition=rainbow&mode=practice');assert.equal(r.data.scores.length,1);assert.equal(r.data.scores[0].nickname,'Testipilotti');
  db.prepare('UPDATE runs SET expires_at = 0 WHERE id = ?').run(ticket.id);
  r=await call('/api/scores',{body:entry,token:ticket.token});assert.equal(r.status,401);
  r=await call('/api/scores?edition=rainbow&mode=practice');assert.equal(r.data.scores[0].score,500,'An expired session must not erase a persisted score.');
  console.log('Leaderboard: SQLite persistence, separate boards, ticket validation, trainer rejection, bounded input and idempotent saves verified.');
} finally {db.close();rmSync(directory,{recursive:true,force:true});}
