// Rainbow menu localization. GPL-2.0-or-later. Game state and nicknames stay untouched.
(() => {
  if(document.body.dataset.edition!=='rainbow')return;
  const pairs=[
    ['YKSINPELI','SINGLE PLAYER'],['KENTTÄ 2','LEVEL 2'],['ILMATAISTELU','AIR COMBAT'],['OHJAUS','CONTROLS'],['ASETUKSET','SETTINGS'],['ENNÄTYKSET','HIGH SCORES'],
    ['KOKO NÄYTTÖ','FULLSCREEN'],['IKKUNATILA','WINDOWED'],['PÄÄVALIKKO','MAIN MENU'],['TAUKO','PAUSED'],['JATKA','RESUME'],['JATKA LENTOA','RESUME FLIGHT'],
    ['TAKAISIN','BACK'],['TAKAISIN SIVUSTOLLE','BACK TO WEBSITE'],['SIVUSTOLLE','WEBSITE'],['PELIVALINNAT','GAME MENU'],['PELIN PAINIKKEET','GAME BUTTONS'],
    ['ALOITUSKENTTÄ','STARTING LEVEL'],['1 · EI VASTATULTA','1 · NO RETURN FIRE'],['2 · MAAKOHTEET AMPUVAT','2 · GROUND RETURN FIRE'],['3 · VOIMAKAS VASTATULI','3 · HEAVY RETURN FIRE'],
    ['KIELI','LANGUAGE'],['SELAIMEN KIELI','BROWSER LANGUAGE'],['VAIKEUSTASO','DIFFICULTY'],['NORMAALI','NORMAL'],['HELPPO','EASY'],
    ['KENTTÄ JA VAIKEUSTASO: SEURAAVA LENTO.','LEVEL AND DIFFICULTY APPLY TO THE NEXT FLIGHT.'],['YKSINPELI: EI VIHOLLISKONEITA.','SINGLE PLAYER: NO ENEMY AIRCRAFT.'],
    ['ÄÄNET: POIS','SOUND OFF'],['ÄÄNET: PÄÄLLÄ','SOUND ON'],
    ['Laita äänet päälle','Enable sound'],['Mykistä äänet','Mute sound'],['Poistu koko näytöstä','Exit fullscreen'],
    ['TRAINER (TESTI): POIS','TRAINER (TEST): OFF'],['TRAINER (TESTI): PÄÄLLÄ','TRAINER (TEST): ON'],
    ['Rajattomat elämät, pommit, ammukset ja polttoaine. Kuoleminen toimii normaalisti. Ei ennätyslistalle.','Unlimited lives, bombs, ammunition and fuel. Crashes remain normal. Unranked runs.'],
    ['↑ ↓ VALITSE · VÄLILYÖNTI / ENTER','↑ ↓ SELECT · SPACE / ENTER'],['NÄYTTÖOHJAIMET','TOUCH CONTROLS'],['Näytön peliohjaimet','On-screen controls'],
    ['KAASU + / −','THROTTLE + / −'],['NOKKA YLÖS / ALAS','PITCH UP / DOWN'],['KÄÄNNÄ KONE','ROLL'],['KONEKIVÄÄRI','MACHINE GUN'],
    ['POMMITÄHTÄIN','BOMB SIGHT'],['B POHJASSA','HOLD B'],['PUDOTA POMMI','DROP BOMB'],['VAPAUTA B','RELEASE B'],['PALAA TUKIKOHTAAN','RETURN TO BASE'],['TAUKO / ÄÄNI','PAUSE / SOUND'],
    ['MYÖS NUOLINÄPPÄIMET TOIMIVAT.','ARROW KEYS ALSO WORK.'],['TUKIKOHTA TÄYDENTÄÄ VARUSTEET.','YOUR BASE REPLENISHES SUPPLIES.'],
    ['Nokka ylös','Pitch up'],['Nokka alas','Pitch down'],['Lisää kaasua','Increase throttle'],['Vähennä kaasua','Decrease throttle'],
    ['Käännä kone ympäri','Roll aircraft'],['Pommitähtäin ja pudotus','Aim and drop bomb'],['Ammu','Fire'],
    ['NIMI','NAME'],['PISTEET','SCORE'],['KENTTÄ','LEVEL'],['NIMIMERKKI','INITIALS'],['TALLENNA','SAVE'],['OHITA TALLENNUS','SKIP SAVE'],['UUSI LENTO','NEW FLIGHT'],
    ['↑ ↓ KIRJAIN · ← → PAIKKA · ENTER TALLENNA','↑ ↓ LETTER · ← → POSITION · ENTER SAVE'],
    ['Kolmen merkin nimimerkki','Three-character initials'],['Nimimerkki, kolme kirjainta tai numeroa','Initials, three letters or digits'],
    ['Pistetilaston pelitila','Scoreboard game mode'],['Pistetilaston vaikeustaso','Scoreboard difficulty'],['Päivitä pisteet','Refresh scores'],
    ['TULOKSET TÄSSÄ SELAIMESSA','SCORES IN THIS BROWSER'],['Kaikkien pelaajien yhteinen lista','SHARED LEADERBOARD'],['Ei vielä tuloksia tässä pelitilassa.','No scores for this mode yet.'],
    ['Tulos tallennetaan tähän selaimeen.','This score is saved in this browser.'],['Nimimerkkisi ja tuloksesi näkyvät kaikille pelaajille.','Your initials and score will be public.'],
    ['Tulos tallennettu.','Score saved.'],['Trainer-lennon tulosta ei lisätä ennätyslistalle.','Trainer runs are not ranked.'],['SYÖTÄ KOLME KIRJAINTA TAI NUMEROA.','ENTER THREE LETTERS OR DIGITS.'],
    ['Listan lataaminen epäonnistui. Voit yrittää uudelleen.','Could not load scores. Please try again.'],['Pistetallennuksen yhteys ei auennut tälle lennolle.','Score submission is unavailable for this flight.'],
    ['Tulosta ei saatu tallennettua. Tulos säilyy lomakkeella uutta yritystä varten.','Could not save the score. Your entry is kept for another attempt.'],
    ['LATAUSVIRHE','LOADING ERROR'],['YRITÄ UUDELLEEN','TRY AGAIN'],['LADATAAN…','LOADING…'],['Ladataan peliä…','Loading game…'],['Ladataan peliä','Loading game'],
    ['Pelin lataaminen kesti liian kauan. Tarkista yhteys ja yritä uudelleen.','Loading timed out. Check your connection and try again.'],
    ['Pelin käynnistys epäonnistui. Voit yrittää uudelleen.','The game could not start. Please try again.'],['Lataus epäonnistui','Loading failed'],
    ['Koko näyttö ei ole käytettävissä tässä selaimessa','Fullscreen is unavailable in this browser'],['Selain esti koko näytön tilan','The browser blocked fullscreen'],
    ['Peli käynnissä','Game running'],['Lento päättyi','Flight ended'],['Ei käynnissä','Not running'],
    ['Aseta peli tauolle','Pause game'],['Jatka peliä','Resume game'],['Sopwith Tribute -sivustolle','Sopwith Tribute website'],
    ['Aloita yksinpeli','Start single player'],['Aloita yksinpeli kentästä 2, maakohteet ampuvat','Start single player at level 2 with ground return fire'],
    ['Rainbow Patrol -peli','Rainbow Patrol game'],['Klassisen version paletti','Classic palette'],['PELAAMINEN VAATII JAVASCRIPTIN JA WEBASSEMBLY-TUEN.','JAVASCRIPT AND WEBASSEMBLY ARE REQUIRED.']
  ];
  const key=text=>text.trim().toLocaleLowerCase('fi'),lookup=new Map();
  for(const pair of pairs)for(const text of pair)lookup.set(key(text),pair);
  lookup.set(key('Äänet pois'),['ÄÄNET: POIS','SOUND OFF']);lookup.set(key('Äänet päällä'),['ÄÄNET: PÄÄLLÄ','SOUND ON']);
  lookup.set(key('PAUSE'),['TAUKO','PAUSED']);
  let preference='auto';try{const saved=localStorage.getItem('sopwith.language');if(['auto','en','fi'].includes(saved))preference=saved;}catch{}
  const resolve=value=>value==='auto'?(/^fi\b/i.test(navigator.languages?.[0]||navigator.language||'en')?'fi':'en'):value;
  let language=resolve(preference);
  function translate(value){
    const trimmed=value.trim(),pair=lookup.get(key(trimmed));let result;
    if(pair)result=pair[language==='fi'?0:1];
    else {
      let match;
      if((match=trimmed.match(/^(?:SIJOITUS|RANK):\s*(\d+)$/i)))result=(language==='fi'?'SIJOITUS: ':'RANK: ')+match[1];
      else if((match=trimmed.match(/^(?:PISTEET|SCORE):\s*(-?\d+)$/i)))result=(language==='fi'?'PISTEET: ':'SCORE: ')+match[1];
      else if((match=trimmed.match(/^(?:Lennon tulos:|Flight score:)\s*(-?\d+)(?: pistettä)?\.$/i)))result=language==='fi'?`Lennon tulos: ${match[1]} pistettä.`:`Flight score: ${match[1]}.`;
      else if((match=trimmed.match(/^(?:Merkki (\d+) (eteenpäin|taaksepäin)|Character (\d+) (next|previous))$/i))){const number=match[1]||match[3],up=/eteenpäin|next/i.test(match[2]||match[4]);result=language==='fi'?`Merkki ${number} ${up?'eteenpäin':'taaksepäin'}`:`Character ${number} ${up?'next':'previous'}`;}
      else if((match=trimmed.match(/^(?:Muokkaa merkkiä|Edit character) (\d+)$/i)))result=(language==='fi'?'Muokkaa merkkiä ':'Edit character ')+match[1];
      else if(trimmed.startsWith('/ ')){const inner=translate(trimmed.slice(2));if(inner!==trimmed.slice(2))result='/ '+inner;}
    }
    return result===undefined?value:value.replace(trimmed,result);
  }
  const protectedText='script,style,code,pre,#scores-rows td:nth-child(2),#entry-scores-rows td.nickname';
  function localize(root){
    if(root.nodeType===3){if(!root.parentElement?.closest(protectedText)){let next=translate(root.nodeValue);if(language==='en'&&root.parentElement?.id==='pause-label'&&next==='PAUSED')next='PAUSE';if(next!==root.nodeValue)root.nodeValue=next;}return;}
    if(root.nodeType!==1||root.closest?.(protectedText))return;
    for(const el of [root,...root.querySelectorAll('[aria-label],[title],[placeholder]')])for(const attr of ['aria-label','title','placeholder']){
      const value=el.getAttribute(attr);if(value){const next=translate(value);if(next!==value)el.setAttribute(attr,next);}
    }
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode()))localize(node);
  }
  function apply(){document.documentElement.lang=language;localize(document.body);const select=document.getElementById('language-select');if(select)select.value=preference;}
  function set(value){if(!['auto','en','fi'].includes(value))return;preference=value;language=resolve(value);try{localStorage.setItem('sopwith.language',value);}catch{}apply();}
  window.PatrolLanguage={set,translate,get language(){return language;},get preference(){return preference;}};
  document.getElementById('language-select')?.addEventListener('change',event=>set(event.target.value));
  apply();
  new MutationObserver(records=>{for(const record of records){if(record.type==='attributes')localize(record.target);else if(record.type==='characterData')localize(record.target);else for(const node of record.addedNodes)localize(node);}})
    .observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
})();
