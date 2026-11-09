// Shared/local high scores, opt-in nickname publishing. GPL-2.0-or-later.
(() => {
  const panel=document.getElementById('leaderboard');if(!panel)return;
  const $=id=>document.getElementById(id),frame=$('game');
  const edition=document.body.dataset.edition==='rainbow'?'rainbow':'classic';
  let wingman=false,endpoint=null,ticket=null,runKey='',pending=null,trainerUsed=false,suppliesUsed=false,demoRun=false,mode='practice',difficulty='normal',loading=0,boardRows=[],savedRun='';
  const arcade=document.body.dataset.layout==='arcade';
  const status=text=>{$('scores-status').textContent=text;if($('arcade-score-status'))$('arcade-score-status').textContent=text;};
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
  const selectedDifficulty=()=>arcade&&$('scores-difficulty')?.value==='easy'?'easy':'normal';
  const selectedCrew=()=>arcade&&$('scores-crew')?.value==='wingman'?'wingman':'solo';
  const selectedRules=()=>arcade&&$('scores-rules')?.value==='supplies'?'supplies':'standard';
  const localKey=(selected=$('scores-mode').value,diff=selectedDifficulty(),crew=selectedCrew(),rules=selectedRules())=>`sopwith.scores.${edition}.${selected}`+(diff==='easy'?'.easy':'')+(crew==='wingman'?'.wingman':'')+(rules==='supplies'?'.supplies':'');
  function selectRunBoard(){if(arcade){$('scores-mode').value=mode;$('scores-difficulty').value=difficulty;if($('scores-crew'))$('scores-crew').value=wingman?'wingman':'solo';if($('scores-rules'))$('scores-rules').value=suppliesUsed?'supplies':'standard';}}
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
    const body=$('entry-scores-rows'),editor=$('score-initials'),parking=$('initials-parking');
    const focused=editor?.contains?.(document.activeElement)?document.activeElement:null;
    if(editor&&parking)parking.append(editor);
    body.replaceChildren();if(!pending)return;
    const rows=[...boardRows,{...pending,nickname:$('score-name').value.toUpperCase().padEnd(3,'A').slice(0,3),runId:runKey,provisional:true}];
    rows.sort((a,b)=>b.score-a.score||Number(a.provisional)-Number(b.provisional));
    const rank=rows.findIndex(r=>r.provisional)+1;$('entry-rank').textContent=(suppliesUsed?'INFINITE SUPPLIES · RANK: ':'SIJOITUS: ')+rank;
    // Keep ten rows visible and include the editable score even below top ten.
    const offset=rank<=10?0:Math.min(Math.max(0,rank-5),Math.max(0,rows.length-10));
    rows.slice(offset,offset+10).forEach((row,i)=>{
      const tr=document.createElement('tr');
      if(row.provisional)tr.className='current';
      [offset+i+1,row.nickname,row.score].forEach((value,column)=>{
        const td=document.createElement('td');
        if(column===1&&row.provisional&&editor)td.append(editor);
        else {td.textContent=String(value);if(column===1)td.className='nickname';}
        tr.append(td);
      });
      body.append(tr);
    });
    focused?.focus({preventScroll:true});
  }
  async function refresh() {
    await ready;const id=++loading,selected=$('scores-mode').value,diff=selectedDifficulty(),crew=selectedCrew(),rules=selectedRules();
    try {
      const rows=endpoint&&crew==='solo'&&rules==='standard'?(await api(`/api/scores?edition=${edition}&mode=${selected}&difficulty=${diff}`)).scores:read(localKey(selected,diff,crew,rules),[]);
      if(id!==loading)return;$('scores-scope').textContent=rules==='supplies'?'INFINITE SUPPLIES · '+(crew==='wingman'?'WINGMAN · ':'')+'SCORES IN THIS BROWSER':crew==='wingman'?'WINGMAN · SCORES IN THIS BROWSER':endpoint?'SHARED LEADERBOARD':'SCORES IN THIS BROWSER';boardRows=rows;draw(rows);drawEntryBoard();status('');
      if(arcade&&savedRun){const index=rows.findIndex(row=>row.runId===savedRun);if(index>=0&&index<10)$('scores-rows').children[index].className='current';}
    }catch{if(id===loading)status('Listan lataaminen epäonnistui. Voit yrittää uudelleen.');}
  }
  async function begin() {
    const params=new URL(frame.src,location.href).searchParams;if(!params.get('run'))return;
    runKey=params.get('run');const key=runKey;
    wingman=edition==='rainbow'&&params.get('wingman')==='1';ticket=null;pending=null;mode=params.get('mode')==='combat'?'combat':'practice';
    difficulty=edition==='rainbow'&&params.get('difficulty')==='easy'?'easy':'normal';
    if($('result-score'))$('result-score').hidden=true;
    trainerUsed=params.get('trainer')==='1';suppliesUsed=edition==='rainbow'&&params.get('supplies')==='1';demoRun=params.get('demo')==='1';$('score-form').hidden=true;
    if(demoRun)return;
    $('scores-mode').value=mode;selectRunBoard();await ready;refresh();
    if(endpoint&&!wingman&&!suppliesUsed&&!trainerUsed)try{const result=await api('/api/runs',{edition,mode,difficulty});if(key===runKey)ticket=result;}
      catch{if(key===runKey)status('Pistetallennuksen yhteys ei auennut tälle lennolle.');}
  }
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow||!event.data?.sopwith)return;
    const msg=event.data;
    if(msg.type==='ready')begin();
    if(msg.type==='trainer-state'&&msg.enabled)trainerUsed=true;
    if(msg.type==='supplies-state'&&msg.enabled)suppliesUsed=true;
    if(msg.type==='score-ready') {
      if(demoRun)return;
      suppliesUsed=suppliesUsed||!!msg.suppliesUsed;
      trainerUsed=trainerUsed||msg.trainerUsed;
      if(trainerUsed){
        status('Trainer-lennon tulosta ei lisätä ennätyslistalle.');
        if(arcade&&msg.victory){
          const rows=$('entry-scores-rows');rows.replaceChildren();
          boardRows.slice(0,10).forEach((row,i)=>{const tr=document.createElement('tr');for(const value of [i+1,row.nickname,row.score]){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}rows.append(tr);});
          $('entry-rank').textContent='TRAINER';$('play-again').hidden=false;
        }else if(arcade)window.dispatchEvent(new CustomEvent('sopwith-score-saved'));return;
      }
      pending={score:msg.score,level:msg.level,ticks:msg.ticks,trainerUsed:false,...(suppliesUsed?{suppliesUsed:true}:{})};
      if(arcade){selectRunBoard();drawEntryBoard();refresh();}
      $('score-result').textContent=`Lennon tulos: ${msg.score} pistettä.`;
      $('score-consent').textContent=endpoint&&!wingman&&!suppliesUsed?'Nimimerkkisi ja tuloksesi näkyvät kaikille pelaajille.':suppliesUsed?'INFINITE SUPPLIES · SEPARATE SCORES IN THIS BROWSER':'Tulos tallennetaan tähän selaimeen.';
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
      if(endpoint&&!wingman&&!suppliesUsed) {
        if(!ticket)throw new Error('Run connection unavailable.');
        await api('/api/scores',{...result,nickname,runId:ticket.id},ticket.token);
      } else {
        const storageKey=localKey(mode,difficulty,wingman?'wingman':'solo',suppliesUsed?'supplies':'standard'),rows=read(storageKey,[]);
        if(!rows.some(r=>r.runId===key))rows.push({...result,nickname,runId:key,finished_at:Date.now()});
        rows.sort((a,b)=>b.score-a.score||a.finished_at-b.finished_at);
        if(!write(storageKey,rows.slice(0,20)))throw new Error('Browser storage unavailable.');
      }
      write('sopwith.score-name',nickname);
      if(runKey===key){pending=null;$('score-form').hidden=true;$('scores-mode').value=mode;selectRunBoard();}
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
  if(arcade)$('scores-crew')?.addEventListener('change',refresh);
  if(arcade)$('scores-rules')?.addEventListener('change',refresh);
  setInterval(()=>{if(!document.hidden&&endpoint)refresh();},30000);
  refresh();
})();
