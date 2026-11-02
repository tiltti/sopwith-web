// Standalone arcade menus and three-character initials. GPL-2.0-or-later.
(() => {
  const $=id=>document.getElementById(id),panels=['help','settings','scores'];
  let panel=null,selection=0,cursor=0,items=[],resumeAfterPanel=false;
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function menuItems() {
    const root=panel?$('panel-'+panel):!$('launch').hidden?$('launch'):!$('paused').hidden?$('paused'):null;
    return root?[...root.querySelectorAll('.pixel-menu button,.pixel-menu a')].filter(el=>!el.hidden&&!el.disabled):[];
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
    if(name==='scores'){
      const ended=document.body.dataset.gameState==='ended';
      $('scores-new-flight').hidden=$('scores-main-menu').hidden=!ended;$('scores-back').hidden=ended;
    }
    const first=$('panel-'+name).querySelector('button,input,select');first?.focus({preventScroll:true});
    select(0);
  }
  let combat=false;
  $('level-two-start').addEventListener('click',()=>{
    $('start-level').value='2';$('start-level').dispatchEvent(new Event('change'));
    combat=false;$('start').click();
  });
  $('combat-start').addEventListener('click',()=>{
    combat=true;document.querySelector('input[name="mode"][value="combat"]').checked=true;$('start').click();
  });
  $('start').addEventListener('click',()=>{
    if(!combat)document.querySelector('input[name="mode"][value="practice"]').checked=true;
    combat=false;
  },true);
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
    $('settings-sound-label').textContent='ÄÄNET: '+(muted?'POIS':'PÄÄLLÄ');
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
      if(event.target===$('score-submit'))return;
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
    if(['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName))return;
    items=menuItems();if(!items.length)return;
    if(event.target.tagName==='BUTTON'){
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
