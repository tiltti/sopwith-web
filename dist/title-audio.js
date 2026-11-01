// Splash music stays opt-in and leaves before the game starts. GPL-2.0-or-later.
(() => {
  if(document.body.dataset.edition!=='rainbow')return;
  const toggle=document.getElementById('title-sound'),mute=document.getElementById('mute');
  let music=null,muted=mute.getAttribute('aria-pressed')==='true';
  function update(){
    toggle.textContent=muted?'ÄÄNET: POIS':'ÄÄNET: PÄÄLLÄ';toggle.setAttribute('aria-pressed',String(!muted));
    const active=!muted&&document.body.dataset.gameState==='idle'&&!document.hidden;
    if(active){
      if(!music){music=new Audio('assets/audio/audition-v05/title-theme.m4a');music.loop=true;music.preload='none';music.volume=.17;}
      if(music.paused)music.play().then(()=>{if(!music.paused)document.body.dataset.titleMusic='playing';}).catch(()=>{document.body.dataset.titleMusic='blocked';});
    }else if(music){music.pause();music.currentTime=0;document.body.dataset.titleMusic='off';}
  }
  toggle.addEventListener('click',()=>mute.click());
  window.addEventListener('sopwith-mute',event=>{muted=event.detail.muted;update();});
  window.addEventListener('sopwith-layer',update);document.addEventListener('visibilitychange',update);
  update();
})();
