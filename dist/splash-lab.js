// Compare raw title artwork with the same live-menu spacing as the game.
(() => {
  const $=id=>document.getElementById(id),{options,fromSearch}=window.PatrolSplash;
  const descriptions={current:'Original Rainbow Patrol title artwork',airfield:'Rainbow Patrol title artwork, sunny coastal airfield',campaign:'Rainbow Patrol title artwork, coast, winter valley and storm city'};
  function show(key){
    const option=options[key];$('preview').dataset.splash=key;$('preview').setAttribute('aria-label',option.label+' title artwork with menu placement');
    $('artwork').src='assets/'+option.image;$('artwork').alt=descriptions[key];$('selection').textContent=option.label;
    $('try-splash').href='rainbow.html'+(key==='current'?'':'?splash='+key);$('download-art').href='assets/'+option.image;
    for(const button of document.querySelectorAll('[data-splash]'))if(button.tagName==='BUTTON')button.setAttribute('aria-pressed',String(button.dataset.splash===key));
  }
  for(const button of document.querySelectorAll('button[data-splash]'))button.addEventListener('click',()=>show(button.dataset.splash));
  show(new URLSearchParams(location.search).has('splash')?fromSearch(location.search):'airfield');
})();
