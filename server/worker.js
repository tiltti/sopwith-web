// Sopwith community leaderboard. GPL-2.0-or-later.
const EDITIONS=new Set(['classic','rainbow']),MODES=new Set(['practice','combat']),DIFFICULTIES=new Set(['normal','easy']);
const validBoard=(edition,mode,difficulty)=>EDITIONS.has(edition)&&MODES.has(mode)&&DIFFICULTIES.has(difficulty)&&(edition==='rainbow'||difficulty==='normal');
const MAX_BODY=2048;
const allowedOrigin=origin=>origin==='https://tiltti.github.io'||/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin);
const hash=async text=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');

export default {
  async fetch(request,env) {
    const origin=request.headers.get('Origin')||'';
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
    if(allowedOrigin(origin))headers['Access-Control-Allow-Origin']=origin;
    const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
    const fail=(message,status=400)=>json({error:message},status);
    try {
      const url=new URL(request.url),path=url.pathname;
      if(request.method==='OPTIONS') {
        if(!allowedOrigin(origin))return fail('Origin not allowed.',403);
        return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'}});
      }
      if(path==='/'||path==='/api/health')return json({service:'Sopwith high scores',version:1});
      if(!env.DB)return fail('Storage is not configured.',503);
      if(request.method==='GET'&&path==='/api/scores') {
        const edition=url.searchParams.get('edition'),mode=url.searchParams.get('mode'),difficulty=url.searchParams.get('difficulty')||'normal';
        if(!validBoard(edition,mode,difficulty))return fail('Unknown edition, mode or difficulty.');
        const {results}=await env.DB.prepare('SELECT nickname, score, level, finished_at FROM scores WHERE edition = ? AND mode = ? AND difficulty = ? ORDER BY score DESC, finished_at ASC LIMIT 20').bind(edition,mode,difficulty).all();
        return json({scores:results});
      }
      if(request.method!=='POST')return fail('Not found.',404);
      if(!allowedOrigin(origin))return fail('Origin not allowed.',403);
      if(!request.headers.get('Content-Type')?.startsWith('application/json'))return fail('JSON required.',415);
      if(Number(request.headers.get('Content-Length')||0)>MAX_BODY)return fail('Request too large.',413);
      const raw=await request.text();
      if(new TextEncoder().encode(raw).length>MAX_BODY)return fail('Request too large.',413);
      let body;try{body=JSON.parse(raw);}catch{return fail('Invalid JSON.');}
      if(!body||typeof body!=='object'||Array.isArray(body))return fail('Invalid request.');
      const now=Date.now();
      if(path==='/api/runs') {
        const difficulty=body.difficulty??'normal';
        if(!validBoard(body.edition,body.mode,difficulty))return fail('Unknown edition, mode or difficulty.');
        await env.DB.prepare('DELETE FROM runs WHERE expires_at < ?').bind(now-86400000).run();
        const recent=await env.DB.prepare('SELECT COUNT(*) AS n FROM runs WHERE started_at > ?').bind(now-60000).first();
        if(recent.n>=100)return fail('Try again shortly.',429);
        const id=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID();
        await env.DB.prepare('INSERT INTO runs (id, token_hash, edition, mode, difficulty, started_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(id,await hash(token),body.edition,body.mode,difficulty,now,now+86400000).run();
        return json({id,token},201);
      }
      if(path==='/api/scores') {
        const token=request.headers.get('Authorization')?.replace(/^Bearer /,'');
        if(!token||typeof body.runId!=='string')return fail('Missing run.',401);
        const run=await env.DB.prepare('SELECT * FROM runs WHERE id = ? AND token_hash = ? AND expires_at > ?')
          .bind(body.runId,await hash(token),now).first();
        if(!run)return fail('Run expired or invalid.',401);
        if(body.trainerUsed!==false)return fail('Trainer runs cannot be ranked.');
        const nickname=typeof body.nickname==='string'?body.nickname.trim().normalize('NFC'):'';
        if(!/^[\p{L}\p{N} _.-]{1,18}$/u.test(nickname))return fail('Use 1–18 letters, digits, spaces, dots or dashes.');
        if(!Number.isInteger(body.score)||body.score< -100000||body.score>1000000)return fail('Invalid score.');
        if(!Number.isInteger(body.level)||body.level<1||body.level>1000)return fail('Invalid level.');
        if(!Number.isInteger(body.ticks)||body.ticks<1||body.ticks>(now-run.started_at)/100+50)return fail('Invalid run duration.');
        await env.DB.prepare('INSERT OR IGNORE INTO scores (run_id, edition, mode, difficulty, nickname, score, level, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(run.id,run.edition,run.mode,run.difficulty,nickname,body.score,body.level,now).run();
        const saved=await env.DB.prepare('SELECT nickname, score, level, finished_at FROM scores WHERE run_id = ?').bind(run.id).first();
        return json({saved},201);
      }
      return fail('Not found.',404);
    } catch(error) {
      console.error('Leaderboard request failed:',error.message);
      return fail('Scores are temporarily unavailable.',503);
    }
  }
};
