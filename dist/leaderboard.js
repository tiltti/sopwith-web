// Shared/local high scores, opt-in nickname publishing. GPL-2.0-or-later.
(() => {
  const panel=document.getElementById('leaderboard');if(!panel)return;
  const $=id=>document.getElementById(id),frame=$('game');
  const edition=document.body.dataset.edition==='rainbow'?'rainbow':'classic';
  let endpoint=null,ticket=null,runKey='',pending=null,trainerUsed=false,mode='practice',difficulty='normal',loading=0,boardRows=[],savedRun='';
  const arcade=document.body.dataset.layout==='arcade';
  const status=text=>{$('scores-status').textContent=text;if($('arcade-score-status'))$('arcade-score-status').textContent=text;};
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
  const selectedDifficulty=()=>arcade&&$('scores-difficulty')?.value==='easy'?'easy':'normal';
  const localKey=(selected=$('scores-mode').value,diff=selectedDifficulty())=>`sopwith.scores.${edition}.${selected}`+(diff==='easy'?'.easy':'');
  async function api(path,body,token) {
    const response=await fetch(endpoint+path,{method:body?'POST':'GET',cache:'no-store',
      headers:body?{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})}:undefined,
      body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'Connection failed.');return data;
  }
  const ready=fetch('leaderboard-config.json?v=20261101-scores1',{cache:'no-store'})
    .then(r=>r.json()).then(config=>{if(typeof config.endpoint==='string'&&config.endpoint.startsWith('https://'))endpoint=config.endpoint.replace(/\/$/,'');})
    .catch(()=>{}).finally(()=>{$('scores-scope').textContent=endpoint?'Kaikkien pelaajien yhteinen lista':'Tulokset tässä selaimessa';});
  function draw(rows) {
    const body=$('scores-rows');body.replaceChildren();
    rows.slice(0,10).forEach((row,i)=>{
      const tr=document.createElement('tr');
      for(const value of [i+1,row.nickname,row.score,row.level]){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}
      body.append(tr);
    });
    if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='Ei vielä tuloksia tässä pelitilassa.';tr.append(td);body.append(tr);}
  }
  function drawEntryBoard(){
    if(!arcade||!$('entry-scores-rows'))return;
    const body=$('entry-scores-rows');body.replaceChildren();if(!pending)return;
    const rows=[...boardRows,{...pending,nickname:$('score-name').value.toUpperCase().padEnd(3,'A').slice(0,3),runId:runKey,provisional:true}];
    rows.sort((a,b)=>b.score-a.score||Number(a.provisional)-Number(b.provisional));
    const rank=rows.findIndex(r=>r.provisional)+1;$('entry-rank').textContent='SIJOITUS: '+rank;
    rows.slice(0,10).forEach((row,i)=>{
      const tr=document.createElement('tr');
      if(row.provisional)tr.className='current';
      for(const value of [i+1,row.nickname,row.score]){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}
      body.append(tr);
    });
  }
  if(arcade){window.addEventListener('sopwith-initials',drawEntryBoard);$('score-name').addEventListener('input',drawEntryBoard);}
  async function refresh() {
    await ready;const id=++loading,selected=$('scores-mode').value,diff=selectedDifficulty();
    try {
      const rows=endpoint?(await api(`/api/scores?edition=${edition}&mode=${selected}&difficulty=${diff}`)).scores:read(localKey(selected,diff),[]);
      if(id!==loading)return;boardRows=rows;draw(rows);drawEntryBoard();status('');
      if(arcade&&savedRun){const index=rows.findIndex(row=>row.runId===savedRun);if(index>=0&&index<10)$('scores-rows').children[index].className='current';}
    }catch{if(id===loading)status('Listan lataaminen epäonnistui. Voit yrittää uudelleen.');}
  }
  async function begin() {
    const params=new URL(frame.src,location.href).searchParams;
    runKey=params.get('run');const key=runKey;
    ticket=null;pending=null;mode=params.get('mode')==='combat'?'combat':'practice';
    difficulty=edition==='rainbow'&&params.get('difficulty')==='easy'?'easy':'normal';
    if($('result-score'))$('result-score').hidden=true;
    trainerUsed=params.get('trainer')==='1';$('score-form').hidden=true;
    $('scores-mode').value=mode;if(arcade)$('scores-difficulty').value=difficulty;await ready;refresh();
    if(endpoint)try{const result=await api('/api/runs',{edition,mode,difficulty});if(key===runKey)ticket=result;}
      catch{if(key===runKey)status('Pistetallennuksen yhteys ei auennut tälle lennolle.');}
  }
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow||!event.data?.sopwith)return;
    const msg=event.data;
    if(msg.type==='ready')begin();
    if(msg.type==='trainer-state'&&msg.enabled)trainerUsed=true;
    if(msg.type==='score-ready') {
      trainerUsed=trainerUsed||msg.trainerUsed;
      if(trainerUsed){status('Trainer-lennon tulosta ei lisätä ennätyslistalle.');if(arcade)window.dispatchEvent(new CustomEvent('sopwith-score-saved'));return;}
      pending={score:msg.score,level:msg.level,ticks:msg.ticks,trainerUsed:false};
      if(arcade){$('scores-mode').value=mode;$('scores-difficulty').value=difficulty;drawEntryBoard();refresh();}
      $('score-result').textContent=`Lennon tulos: ${msg.score} pistettä.`;
      $('score-consent').textContent=endpoint?'Nimimerkkisi ja tuloksesi näkyvät kaikille pelaajille.':'Tulos tallennetaan tähän selaimeen.';
      $('score-form').hidden=false;
      if($('result-score'))$('result-score').hidden=false;
    }
  });
  $('score-name').value=read('sopwith.score-name','');
  $('score-form').addEventListener('submit',async event=>{
    event.preventDefault();if(!pending)return;
    const nickname=arcade?$('score-name').value.trim().toUpperCase():$('score-name').value.trim().normalize('NFC');
    if(arcade?!/^[A-Z0-9]{3}$/.test(nickname):!/^[\p{L}\p{N} _.-]{1,18}$/u.test(nickname)){status(arcade?'SYÖTÄ KOLME KIRJAINTA TAI NUMEROA.':'Käytä nimimerkissä 1–18 kirjainta, numeroa, välilyöntiä, pistettä tai viivaa.');return;}
    const result=pending,key=runKey;$('score-submit').disabled=true;
    try {
      if(endpoint) {
        if(!ticket)throw new Error('Run connection unavailable.');
        await api('/api/scores',{...result,nickname,runId:ticket.id},ticket.token);
      } else {
        const storageKey=localKey(mode,difficulty),rows=read(storageKey,[]);
        if(!rows.some(r=>r.runId===key))rows.push({...result,nickname,runId:key,finished_at:Date.now()});
        rows.sort((a,b)=>b.score-a.score||a.finished_at-b.finished_at);
        if(!write(storageKey,rows.slice(0,20)))throw new Error('Browser storage unavailable.');
      }
      write('sopwith.score-name',nickname);
      if(runKey===key){pending=null;$('score-form').hidden=true;$('scores-mode').value=mode;if(arcade)$('scores-difficulty').value=difficulty;}
      savedRun=key;await refresh();status('Tulos tallennettu.');if(arcade)window.dispatchEvent(new CustomEvent('sopwith-score-saved'));
    } catch {status('Tulosta ei saatu tallennettua. Tulos säilyy lomakkeella uutta yritystä varten.');}
    finally{$('score-submit').disabled=false;}
  });
  $('scores-refresh').addEventListener('click',refresh);
  $('result-score')?.addEventListener('click',()=>{
    if(arcade)window.dispatchEvent(new CustomEvent('sopwith-menu',{detail:'scores'}));
    else {panel.scrollIntoView({behavior:'smooth',block:'center'});$('score-name').focus({preventScroll:true});}
  });
  $('scores-mode').addEventListener('change',refresh);
  if(arcade)$('scores-difficulty').addEventListener('change',refresh);
  setInterval(()=>{if(!document.hidden&&endpoint)refresh();},30000);
  refresh();
})();
