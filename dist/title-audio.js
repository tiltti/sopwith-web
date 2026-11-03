// Opt-in splash/debrief music; shared licensed War Theme. GPL-2.0-or-later.
(() => {
  if(document.body.dataset.edition!=='rainbow')return;
  const toggle=document.getElementById('title-sound'),mute=document.getElementById('mute');
  let music=null,section=null,muted=mute.getAttribute('aria-pressed')==='true';
  function status(value){
    document.body.dataset.menuMusic=section?section+':'+value:'off';
    document.body.dataset.titleMusic=section==='title'?value:'off';
    document.body.dataset.debriefMusic=section==='debrief'?value:'off';
  }
  function update(){
    document.getElementById('title-sound-label').textContent=muted?'ÄÄNET: POIS':'ÄÄNET: PÄÄLLÄ';
    document.getElementById('title-sound-icon').src='assets/sound-'+(muted?'off':'on')+'.svg';
    toggle.setAttribute('aria-pressed',String(!muted));toggle.setAttribute('aria-label',muted?'Laita äänet päälle':'Mykistä äänet');
    const state=document.body.dataset.gameState;
    const wanted=!muted&&!document.hidden?(state==='idle'?'title':state==='ended'?'debrief':null):null;
    if(section!==wanted){if(music){music.pause();music.currentTime=0;}section=wanted;status('off');}
    if(!section)return;
    if(!music){music=new Audio('assets/audio/audition-v05/title-theme.m4a');music.loop=true;music.preload='none';}
    music.volume=section==='debrief'?.13:.17;
    if(music.paused){
      const requested=section;
      music.play().then(()=>{if(section===requested&&!music.paused)status('playing');})
        .catch(()=>{if(section===requested)status('blocked');});
    }
  }
  toggle.addEventListener('click',()=>mute.click());
  window.addEventListener('sopwith-mute',event=>{muted=event.detail.muted;update();});
  window.addEventListener('sopwith-layer',update);document.addEventListener('visibilitychange',update);
  update();
})();
