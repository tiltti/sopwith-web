// Standalone arcade menus and three-character initials. GPL-2.0-or-later.
(() => {
  const $=id=>document.getElementById(id),panels=['help','settings','scores','flight'];
  if(window.PatrolSplash){const key=PatrolSplash.fromSearch(location.search);$('screen').dataset.splash=key;document.querySelector('.splash-art').src='assets/'+PatrolSplash.options[key].image;}
  let panel=null,selection=0,cursor=0,items=[],resumeAfterPanel=false;
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function menuItems() {
    const root=panel?$('panel-'+panel):!$('launch').hidden?$('launch'):!$('paused').hidden?$('paused'):null;
    return root?[...root.querySelectorAll('.pixel-menu button,.pixel-menu a,.pixel-menu input[type=checkbox],.pixel-menu select:not([hidden])')].filter(el=>!el.hidden&&!el.disabled):[];
  }
  function select(index,focus=false) {
    items=menuItems();if(!items.length)return;
    selection=(index+items.length)%items.length;
    items.forEach((item,i)=>item.classList.toggle('selected',i===selection));
    if(focus)items[selection].focus({preventScroll:true});
  }
  function closePanel() {
    panels.forEach(name=>{$('panel-'+name).hidden=true;});panel=null;
    $('launch').inert=false;$('paused').inert=false;$('complete').inert=false;
    select(0);if(!$('paused').hidden)$('resume').focus({preventScroll:true});
  }
  function openPanel(name) {
    if(!panels.includes(name))return;
    const wasPlaying=document.body.dataset.gameState==='playing';
    if(wasPlaying)$('pause').click();
    closePanel();resumeAfterPanel=wasPlaying;panel=name;$('panel-'+name).hidden=false;
    $('launch').inert=true;$('paused').inert=true;$('complete').inert=true;
    if(name==='flight')renderMission();scheduleLayout();
    if(name==='scores'){
      const ended=document.body.dataset.gameState==='ended';
      $('scores-new-flight').hidden=$('scores-main-menu').hidden=!ended;$('scores-back').hidden=ended;
    }
    const first=$('panel-'+name).querySelector('button:not([disabled]),input:not([disabled]),select:not([hidden]):not([disabled])');first?.focus({preventScroll:true});
    select(0);
  }
  const missionInfo=[
    {name:'1 · COAST',image:'rainbow-preview-coast-v1.jpg',objective:'Clear enemy depots and defenses along the sunny coast.'},
    {name:'2 · WINTER VALLEY',image:'rainbow-preview-winter-v1.jpg',objective:'Follow the snowy valleys and destroy the enemy rail depots.'},
    {name:'3 · STORM CITY',image:'rainbow-preview-storm-v1.jpg',objective:'Clear the enemy defenses in the storm-hit mountain city.'}
  ];
  let previousPilot=null,layoutPending=false,briefings=null;
  const honorAtlas=new Image();
  honorAtlas.onload=()=>{
    for(const [kind,crop] of Object.entries({row:[46,110,1444,103],current:[46,344,1444,103],header:[18,547,1500,190],aged:[46,843,1444,103]})){
      const canvas=document.createElement('canvas');canvas.width=crop[2];canvas.height=crop[3];canvas.getContext('2d').drawImage(honorAtlas,...crop,0,0,canvas.width,canvas.height);
      $('screen').style.setProperty('--honor-'+kind,'url("'+canvas.toDataURL()+'")');
    }
    $('screen').dataset.honorArt='original-bronze';scheduleLayout();
  };
  honorAtlas.src='assets/rainbow-honor-plates-v1.png';

  const svg=(tag,attrs)=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [name,value] of Object.entries(attrs))el.setAttribute(name,String(value));return el;};
  function drawBriefing(index){
    const chart=briefings?.missions?.[index];if(!chart)return;
    const x=world=>20+world/chart.width*560,y=height=>148-height/200*100;
    $('mission-profile').setAttribute('d','M20 160 '+chart.ground.map((h,i)=>(i?'L':'L')+(20+i/99*560)+' '+y(h)).join(' ')+' L580 160 Z');
    $('mission-target-marks').replaceChildren(...chart.targets.map(([wx,wy,kind])=>svg(kind===20?'rect':'circle',kind===20?{x:x(wx)-3,y:y(wy)-3,width:6,height:6}:{cx:x(wx),cy:y(wy),r:[0,1,2,7].includes(kind)?7:4})));
    const homeX=x(chart.home),homeY=y(chart.ground[Math.round(chart.home/chart.width*99)]);
    $('mission-base-mark').replaceChildren(svg('path',{d:`M${homeX-6} ${homeY} L${homeX} ${homeY-8} L${homeX+6} ${homeY} Z`}),svg('path',{d:`M${homeX} ${homeY-8} V${homeY-22} h11 l-3 4 h-8`,fill:'none'}));
    $('mission-route').setAttribute('d',`M${homeX} ${homeY-25} Q300 34 550 70`);
  }
  fetch('mission-briefings.json').then(r=>r.json()).then(data=>{if(data.version===1){briefings=data;renderMission();}}).catch(()=>{});
  function renderMission(){
    const level=$('start-level'),index=Math.max(0,Math.min(2,Number(level.value)-1)),info=missionInfo[index],value=$('difficulty-select').value==='easy'?'easy':'normal';
    $('mission-name').textContent=info.name;$('mission-objective').textContent=info.objective;
    drawBriefing(index);
    $('difficulty-briefing').textContent=value==='easy'?'ROOKIE: ground guns stay quiet. Optional enemy aircraft have shorter range, slower fire and spawn protection. Same flight model.':'ACE: ground guns and enemy pilots fire back from mission 1. Optional enemy aircraft use full range and fire rate. Same flight model.';
    $('mission-preview-image').setAttribute('href','assets/'+info.image);$('mission-preview').setAttribute('aria-label',info.name+' mission landscape');
    $('mission-prev').disabled=$('mission-next').disabled=level.disabled;
    $('mission-training').textContent=!level.disabled?'TRAINER · UNRANKED FLIGHT':$('settings-supplies')?.getAttribute('aria-pressed')==='true'?'INFINITE SUPPLIES · SEPARATE LOCAL SCOREBOARD':$('ai-wingman').checked?'WINGMAN · SEPARATE LOCAL SCOREBOARD':'RANKED CAMPAIGN · STARTS AT MISSION 1';
    $('ground-fire-toggle').setAttribute('aria-pressed',String(value==='normal'));$('ground-fire-state').textContent=value==='normal'?'ON':'OFF';
    $('panel-flight').dataset.selectedPilot=value;
    for(const actor of document.querySelectorAll('.pilot-actor')){
      const active=actor.dataset.pilot===value;actor.classList.toggle('selected',active);
      if(active&&previousPilot!==value){actor.classList.remove('saluting');void actor.offsetWidth;actor.classList.add('saluting');}
      if(!active)actor.classList.remove('saluting');
    }
    previousPilot=value;
  }
  function fitControls(){
    const room=$('panel-help'),surface=room.querySelector('.controls-surface'),w=room.clientWidth,h=room.clientHeight;if(!w||!h)return;
    const points=[[94,114],[854,190],[856,644],[94,670]].map(([x,y])=>[x/1536*w,y/1024*h]);
    surface.style.transform='matrix3d('+PatrolLayout.quadMatrix(760,620,points).join(',')+')';room.dataset.board='shared-perspective';
  }
  function fitScores(){
    for(const element of [$('leaderboard'),$('complete').querySelector('.entry-board')]){
      if(!element?.clientHeight)continue;element.style.setProperty('--score-scale','1');let scale=1;
      for(let attempt=0;attempt<6;attempt++){
        const next=PatrolLayout.scoreScale(scale,element.clientHeight,element.scrollHeight);if(next===scale)break;
        scale=next;element.style.setProperty('--score-scale',String(scale));
      }
      element.dataset.fit=String(element.scrollHeight<=element.clientHeight+1);
    }
  }
  function scheduleLayout(){if(layoutPending)return;layoutPending=true;requestAnimationFrame(()=>{layoutPending=false;fitControls();fitScores();});}
  for(const change of [-1,1])$('mission-'+(change<0?'prev':'next')).addEventListener('click',()=>{
    const level=$('start-level');if(level.disabled)return;level.value=String((Number(level.value)-1+change+3)%3+1);level.dispatchEvent(new Event('change'));
  });
  $('start-level').addEventListener('change',renderMission);
  $('ai-wingman').addEventListener('change',renderMission);
  $('ground-fire-toggle').addEventListener('click',()=>{const level=$('difficulty-select');level.value=level.value==='easy'?'normal':'easy';level.dispatchEvent(new Event('change'));});
  for(const actor of document.querySelectorAll('.pilot-actor'))actor.addEventListener('animationend',()=>actor.classList.remove('saluting'));
  new MutationObserver(renderMission).observe($('settings-trainer'),{attributes:true,attributeFilter:['aria-pressed']});
  new MutationObserver(renderMission).observe($('settings-supplies'),{attributes:true,attributeFilter:['aria-pressed']});
  new ResizeObserver(scheduleLayout).observe($('screen'));
  const boardChanges=new MutationObserver(scheduleLayout);
  for(const id of ['scores-rows','entry-scores-rows','score-form','arcade-score-status'])boardChanges.observe($(id),{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
  document.fonts?.ready.then(scheduleLayout);window.addEventListener('resize',scheduleLayout);
  window.addEventListener('sopwith-initials',scheduleLayout);window.addEventListener('sopwith-layer',scheduleLayout);
  const difficulty=$('difficulty-select');
  const syncDifficulty=()=>{for(const value of ['easy','normal'])$('flight-'+value).setAttribute('aria-pressed',String(difficulty.value===value));renderMission();};
  for(const value of ['easy','normal'])$('flight-'+value).addEventListener('click',()=>{difficulty.value=value;difficulty.dispatchEvent(new Event('change'));syncDifficulty();});
  difficulty.addEventListener('change',syncDifficulty);syncDifficulty();
  document.querySelectorAll('[data-open-panel]').forEach(button=>button.addEventListener('click',()=>openPanel(button.dataset.openPanel)));
  document.querySelectorAll('[data-close-panel]').forEach(button=>button.addEventListener('click',closePanel));
  window.addEventListener('sopwith-menu',event=>openPanel(event.detail));
  window.addEventListener('sopwith-layer',()=>{closePanel();select(0);});
  $('scores-new-flight').addEventListener('click',()=>{closePanel();$('play-again').click();});
  $('scores-main-menu').addEventListener('click',()=>{closePanel();$('restart').click();});
  window.addEventListener('sopwith-score-saved',()=>openPanel('scores'));
  $('settings-fullscreen').addEventListener('click',()=>{const resume=resumeAfterPanel;closePanel();if(resume)$('resume').click();$('fullscreen').click();});
  $('settings-sound').addEventListener('click',()=>{$('mute').click();syncSettings();});
  function syncSettings() {
    const muted=$('mute').getAttribute('aria-pressed')==='true';
    $('settings-sound-label').textContent='SOUND '+(muted?'OFF':'ON');
    $('settings-sound-icon').src='assets/sound-'+(muted?'off':'on')+'.svg';
    $('settings-sound').setAttribute('aria-pressed',String(!muted));
  }
  new MutationObserver(syncSettings).observe($('mute'),{attributes:true,attributeFilter:['aria-pressed']});
  function initials() {return $('score-name').value.toUpperCase().replace(/[^A-Z0-9]/g,'').padEnd(3,'A').slice(0,3);}
  function paintInitials() {
    $('score-name').value=initials();
    document.querySelectorAll('[data-initial-focus]').forEach((button,i)=>{
      button.textContent=$('score-name').value[i];button.parentElement.classList.toggle('active',i===cursor);
    });
    window.dispatchEvent(new CustomEvent('sopwith-initials'));
  }
  function setLetter(character) {
    const chars=[...initials()];chars[cursor]=character;$('score-name').value=chars.join('');paintInitials();
  }
  function stepLetter(step) {const index=alphabet.indexOf(initials()[cursor]);setLetter(alphabet[(index+step+alphabet.length)%alphabet.length]);}
  document.querySelectorAll('[data-initial-index]').forEach(button=>button.addEventListener('click',()=>{
    cursor=Number(button.dataset.initialIndex);stepLetter(Number(button.dataset.step));
  }));
  document.querySelectorAll('[data-initial-focus]').forEach(button=>button.addEventListener('click',()=>{
    cursor=Number(button.dataset.initialFocus);paintInitials();$('score-name').focus({preventScroll:true});
  }));
  $('score-name').addEventListener('input',paintInitials);
  new MutationObserver(()=>{
    if(!$('score-form').hidden){cursor=0;paintInitials();$('score-name').focus({preventScroll:true});}
    else if(!$('complete').hidden)$('play-again').focus({preventScroll:true});
  }).observe($('score-form'),{attributes:true,attributeFilter:['hidden']});
  document.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey)return;
    if(!$('complete').hidden&&!$('score-form').hidden&&!panel) {
      if(event.target===$('score-submit')||event.target===$('result-score'))return;
      if(/^[a-zA-Z0-9]$/.test(event.key)){event.preventDefault();event.stopImmediatePropagation();setLetter(event.key.toUpperCase());cursor=(cursor+1)%3;paintInitials();return;}
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter'].includes(event.code)) {
        event.preventDefault();event.stopImmediatePropagation();
        if(event.code==='ArrowLeft')cursor=(cursor+2)%3;
        if(event.code==='ArrowRight')cursor=(cursor+1)%3;
        if(event.code==='ArrowUp')stepLetter(1);
        if(event.code==='ArrowDown')stepLetter(-1);
        if(event.code==='Enter')$('score-form').requestSubmit();
        paintInitials();return;
      }
    }
    if(panel&&event.code==='Escape'){event.preventDefault();event.stopImmediatePropagation();const end=panel==='scores'&&document.body.dataset.gameState==='ended';closePanel();if(end)$('restart').click();return;}
    if(event.target.tagName==='SELECT'||event.target.tagName==='TEXTAREA'||event.target.tagName==='INPUT'&&event.target.type!=='checkbox')return;
    items=menuItems();if(!items.length)return;
    if(event.target.tagName==='BUTTON'||event.target.type==='checkbox'){
      const focused=items.indexOf(event.target);if(focused<0)return;selection=focused;
    }
    if(['ArrowUp','ArrowDown','Enter','Space'].includes(event.code)) {
      event.preventDefault();event.stopImmediatePropagation();if(event.repeat)return;
      if(event.code==='ArrowUp')select(selection-1,true);
      else if(event.code==='ArrowDown')select(selection+1,true);
      else items[selection]?.click();
    }
  },true);
  document.querySelectorAll('.title-menu button').forEach((button,i)=>button.addEventListener('pointerenter',()=>select(i)));
  select(0);syncSettings();paintInitials();
})();
