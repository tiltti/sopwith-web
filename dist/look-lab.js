// Isolated art-direction study. No game state or gameplay is changed here.
// GPL-2.0-or-later. Atlas crops/provenance: assets/ARTWORK.md.
(() => {
  const W=640,H=400,HUD=68,D=3,$=id=>document.getElementById(id),canvas=$('preview'),c=canvas.getContext('2d',{alpha:false});
  const profiles={
    a:{grid:1.5,detail:0,description:'A · Bold pixel clusters, two-tone clouds and restrained terrain detail.'},
    b:{grid:.75,detail:1,description:'B · Finer outlines, three-tone clouds and more terrain detail.'},
    c:{grid:1/3,detail:2,description:'C · Smaller environment pixels, finer clouds and denser grass.'}
  };
  const capture=new URLSearchParams(location.search).get('capture');
  if(capture&&profiles[capture])document.body.classList.add('capture');
  let selected=profiles[capture]?capture:'b',scene='airfield',angle=-20,moving=false,time=0,last=0,loaded=false;
  const images={},crops={
    plane:[17,95,290,190],enemy:[339,89,277,199],cow:[642,94,272,194],wreck:[936,113,304,171],
    hangar:[6,413,320,171],factory:[344,342,270,257],tank:[634,411,320,193],fuel:[984,381,260,223],
    truck:[12,704,321,182],tent:[653,702,323,175],
    aa:[46,62,451,376],aaLeft:[576,65,431,375],aaWreck:[1066,205,449,244],
    pilot:[99,671,336,276],chute:[570,490,398,503],burningChute:[1068,483,430,513]
  };
  const descriptions=$('description');
  function q(n){const g=profiles[selected].grid;return Math.round(n/g)*g;}
  function shape(points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(q(x),q(y)):c.moveTo(q(x),q(y)));c.closePath();c.fill();}
  function rectangle(x,y,w,h,color){c.fillStyle=color;c.fillRect(q(x),q(y),q(w),q(h));}
  function ellipse(x,y,rx,ry,color){const pts=[],n=profiles[selected].detail===0?28:profiles[selected].detail===1?52:96;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;pts.push([x+Math.cos(a)*rx,y+Math.sin(a)*ry]);}shape(pts,color);}
  function rng(n){return ((Math.sin(n*17.37+4.19)*12345.67)%1+1)%1;}
  const knots={airfield:[[-60,355],[65,306],[200,306],[280,324],[400,282],[520,320],[700,306]],slope:[[-50,362],[120,296],[230,330],[385,234],[480,260],[700,350]]};
  function ground(x){const list=knots[scene==='slope'?'slope':'airfield'];for(let i=1;i<list.length;i++)if(x<=list[i][0]){const a=list[i-1],b=list[i],t=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t;}return list.at(-1)[1];}
  function groundAngle(x,w=16){return Math.atan2(ground(x+w/2)-ground(x-w/2),w);}
  function sprite(name,x,y,w,{rotation=0,anchor='bottom',alpha=1}={}){
    const crop=crops[name],sheet=['aa','aaLeft','aaWreck','pilot','chute','burningChute'].includes(name)?images.defense:images.main;
    const h=w*crop[3]/crop[2];c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(rotation);
    c.drawImage(sheet,...crop,-w/2,anchor==='center'?-h/2:-h,w,h);c.restore();return h;
  }
  function cloud(x,y,s=1,seed=0){
    // Flat color clusters. Shading follows individual lobes, never a gradient.
    const lobes=[[16,21,18,10],[36,13,21,17],[62,15,23,15],[85,23,22,9],[106,27,15,5]];
    const outline=[];
    for(let px=0;px<=122;px+=profiles[selected].grid){let top=31;for(const [cx,cy,rx,ry] of lobes){const d=(px-cx)/rx;if(Math.abs(d)<=1)top=Math.min(top,cy-ry*Math.sqrt(1-d*d));}outline.push([x+px*s,y+top*s]);}
    shape([[x,y+33*s],...outline,[x+122*s,y+33*s]],'#edfff1');
    shape([[x+6*s,y+31*s],[x+21*s,y+24*s],[x+40*s,y+27*s],[x+55*s,y+20*s],[x+72*s,y+26*s],[x+90*s,y+24*s],[x+112*s,y+29*s],[x+122*s,y+31*s],[x+122*s,y+35*s],[x+7*s,y+35*s]],'#c5f4ee');
    if(profiles[selected].detail>0)shape([[x+7*s,y+33*s],[x+31*s,y+30*s],[x+42*s,y+32*s],[x+67*s,y+29*s],[x+84*s,y+33*s],[x+116*s,y+32*s],[x+122*s,y+35*s],[x+8*s,y+36*s]],'#9de4e9');
    if(profiles[selected].detail===2){rectangle(x+30*s,y+8*s,11*s,1*s,'#fffde7');rectangle(x+59*s,y+5*s,8*s,1*s,'#fffde7');}
  }
  function sky(){
    for(const [y,h,color] of [[0,105,'#4eb5e9'],[105,85,'#63c6ee'],[190,86,'#80d8f1'],[276,124,'#a8ebef']])rectangle(0,y,W,h,color);
    const drift=moving?time*1.5:0;
    // Broad distant cloud bank with broken, flat underside clusters.
    for(let i=-1;i<7;i++)cloud(i*114-drift%114,165+(i%2)*7,.98,i);
    cloud(30-drift*.45,54,.95);cloud(291-drift*.3,37,1.05);cloud(520-drift*.2,106,.65);
    for(let i=0;i<7;i++){
      const x=i*121-35,top=282+(i%3)*15;
      shape([[x-50,H],[x,top],[x+32,top+29],[x+60,top-8],[x+130,H]],i%2?'#80c6c5':'#92d6ce');
      if(profiles[selected].detail>0)shape([[x,top],[x+7,top+23],[x+24,top+20],[x+32,top+29]],'#b8e6d2');
    }
    // A sun reads as a light source: radial rays, flat disc, no shiny spot.
    const sx=558,sy=57;
    for(let i=0;i<12;i++){const a=i*Math.PI/6,rx=Math.cos(a),ry=Math.sin(a),px=-ry,py=rx;shape([[sx+rx*19+px,sy+ry*19+py],[sx+rx*24+px*.5,sy+ry*24+py*.5],[sx+rx*24-px*.5,sy+ry*24-py*.5],[sx+rx*19-px,sy+ry*19-py]],'#ffe996');}
    ellipse(sx,sy,15.5,15.5,'#ffe99b');ellipse(sx,sy,12.5,12.5,'#fff2ba');
    rainbow();
  }
  function rainbow(){
    const cx=233,base=Math.max(ground(55),ground(411))+6,rx=178,ry=130,colors=['#eb8778','#f8c779','#f5ed86','#a4dfbb','#78b4d1','#9896cf'];
    for(let band=0;band<6;band++){
      const pts=[],r=rx-band*4.2,h=ry-band*4.2,ri=r-4.3,hi=h-4.3,n=profiles[selected].detail===0?120:profiles[selected].detail===1?240:480;
      for(let j=0;j<=n;j++){const a=Math.PI-j/n*Math.PI;pts.push([cx+Math.cos(a)*r,base-Math.sin(a)*h]);}
      pts.push([cx+r,H],[cx+ri,H]);
      for(let j=0;j<=n;j++){const a=j/n*Math.PI;pts.push([cx+Math.cos(a)*ri,base-Math.sin(a)*hi]);}
      pts.push([cx-ri,H],[cx-r,H]);shape(pts,colors[band]);
    }
  }
  function terrain(){
    const top=[];for(let x=-1;x<=W+1;x+=1)top.push([x,ground(x)]);
    shape([...top,[W+1,H],[-1,H]],'#cfa568');
    c.save();c.beginPath();top.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.clip();
    for(let i=0;i<160+profiles[selected].detail*110;i++){
      const x=rng(i+10)*W,y=ground(x)+12+rng(i+200)*(H-ground(x)-14),s=profiles[selected].detail===0?1.5:1;
      rectangle(x,y,s,s,i%3?'#deb675':'#be945b');
    }
    for(let i=0;i<22+profiles[selected].detail*13;i++){
      const x=rng(i+1200)*W,y=ground(x)+19+rng(i+1800)*(H-ground(x)-22);
      shape([[x-2,y+1],[x,y-1],[x+4,y-1],[x+5,y+2],[x+1,y+1]],'#b28a55');
    }
    c.restore();
    for(const [offset,width,color] of [[7,3,'#759949'],[4,4,'#b0d45e'],[1,3,'#e2ef92']]){
      c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.beginPath();top.forEach(([x,y],i)=>i?c.lineTo(q(x),q(y+offset)):c.moveTo(q(x),q(y+offset)));c.stroke();
    }
    if(profiles[selected].detail>0)for(let i=0;i<46+profiles[selected].detail*27;i++){
      const x=rng(i+3000)*W,y=ground(x)+1,h=1+rng(i+3400)*2.5;
      shape([[x-1,y],[x-.5,y-h],[x+.5,y-.7],[x+1.5,y-h*.6],[x+1,y]],i%3?'#a1c955':'#f0f4ae');
    }
  }
  function foundation(x,width,base){
    const left=x-width/2,right=x+width/2,pts=[[left,base],[right,base]];
    for(let px=right;px>=left;px-=1)pts.push([px,ground(px)+3]);shape(pts,'#ad996f');
    c.save();c.beginPath();pts.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.clip();
    for(let y=base+3;y<base+45;y+=4){rectangle(left,y,width,.5,'#87795c');for(let px=left+((Math.floor(y/4)%2)*4);px<right;px+=8)rectangle(px,y-4,.5,4,'#c8b58b');}
    c.restore();rectangle(left,base,width,1.3,'#ded3a0');
  }
  function building(name,x,w){let base=Infinity;for(let px=x-w/2;px<=x+w/2;px++)base=Math.min(base,ground(px));foundation(x,w,base);sprite(name,x,base,w);}
  function tank(x){const a=groundAngle(x,28),y=ground(x);sprite('tank',x,y-1,32,{rotation:a});}
  function emplacement(x,left=false){const a=groundAngle(x,18),y=ground(x)-1;
    sprite(left?'aaLeft':'aa',x,y,25,{rotation:a*.35});
    // A muzzle flash and barrel recoil are previewed only in the animation.
    if(moving&&time%2.2<.13){const d=left?-1:1;shape([[x+d*8,y-14],[x+d*16,y-21],[x+d*13,y-13],[x+d*20,y-16],[x+d*11,y-8]],'#ffe7a5');}
  }
  function smoke(x,y,seed=0){
    for(let i=10;i>=0;i--){const age=i/10,dx=-i*4+Math.sin(i*1.7+time)*2,dy=-i*2,r=2+i*.35;c.save();c.globalAlpha=.7-age*.35;ellipse(x+dx,y+dy,r,r*.85,i%2?'#728b99':'#a8b8ba');c.restore();}
  }
  function flames(x,y,rotation=0){
    c.save();c.translate(x,y);c.rotate(rotation);
    for(let i=0;i<6;i++){const ox=i*2.4-10,l=6+(Math.sin(time*18+i*2)+1)*3;
      shape([[ox,-2],[ox-4,-l],[ox+2,-l*.6],[ox+2,-l-3],[ox+5,-2]],'#e5764f');shape([[ox+1,-1],[ox,-l*.6],[ox+4,-2]],'#ffd77e');}
    c.restore();
  }
  function plane(x,y,rotation,{parked=false,wreck=false}={}){
    const name=wreck?'wreck':'plane',crop=crops[name],w=36,h=w*crop[3]/crop[2];
    c.save();c.translate(x,y);c.rotate(rotation);
    // A fixed world-size illustration is rotated; its bounding box never
    // participates in scaling. Parked planes pivot around the main wheels.
    c.drawImage(images.main,...crop,parked?-w*.78:-w/2,parked?-h:-h/2,w,h);c.restore();
  }
  function hud(){
    rectangle(0,H,W,HUD,'#263b55');rectangle(0,H,W,1.5,'#74b8bd');rectangle(0,H+50,W,18,'#1c3046');
    const text=(s,x,y,color='#f9f0cf',scale=1)=>window.RainbowRenderer.text(c,s,x,H+y,color,scale);
    text('SCORE',10,9,'#9ce3e5');text('001250',10,21,'#fff2ce',2);text('LIVES',88,9,'#9ce3e5');text('4',88,21,'#ffdc86',2);text('LV',140,9,'#9ce3e5');text('1',140,21,'#fff2ce',2);
    rectangle(183,H+4,264,44,'#1c3147');rectangle(185,H+6,260,40,'#407a8c');
    for(let i=0;i<260;i++){const x=i/260*640,y=(ground(x)-200)/200*39;c.fillStyle='#85a16e';c.fillRect(185+i,H+6+y,1,40-y);}
    for(const [x,y,color] of [[.18,.75,'#75cfbd'],[.42,.45,'#ffe39a'],[.65,.76,'#ed8775'],[.85,.85,'#ed8775'],[.77,.22,'#fff7dc']])rectangle(185+x*260,H+6+y*39,3,2,color);
    c.strokeStyle='#9ce3e5';c.lineWidth=.7;c.strokeRect(274,H+6,62,40);
    text('FUEL',458,9,'#9ce3e5');rectangle(486,H+8,60,7,'#243449');rectangle(487,H+9,55,5,'#75cfbd');text('AMMO',458,24,'#9ce3e5');text('180',486,23,'#fff2ce',2);text('BOMB',557,9,'#9ce3e5');text('5',598,8,'#ffdc86',2);text('HOME',557,25,'#9ce3e5');text('<',598,24,'#fff2ce',2);
    if(scene==='crash')text('PLANE LOST',274,55,'#f4a376',2);
  }
  function draw(){
    if(!loaded)return;c.setTransform(D,0,0,D,0,0);c.imageSmoothingEnabled=true;c.save();c.beginPath();c.rect(0,0,W,H);c.clip();
    sky();terrain();
    if(scene==='slope'){
      building('factory',301,39);building('fuel',526,29);tank(401);emplacement(255);emplacement(462,true);emplacement(118);sprite('cow',571,ground(571)-1,16,{rotation:groundAngle(571,12)*.15});
      plane(220,152,angle*Math.PI/180);cloud(340,89,.55);
    } else {
      building('hangar',132,46);building('fuel',82,25);building('factory',490,38);emplacement(235);emplacement(548,true);tank(409);
      sprite('cow',351,ground(351)-1,16,{rotation:groundAngle(351,12)*.15});sprite('cow',369,ground(369)-1,14,{rotation:groundAngle(369,12)*.15});
      const roll=moving?Math.max(0,Math.min(1,(time%10-1)/2)):0;
      plane(176+roll*26,ground(176+roll*26)+1,-Math.PI/12*(1-roll),{parked:true});
      if(scene==='crash'){
        const drop=moving?(time%5)*10:0;smoke(347,190+drop);plane(343,193+drop,Math.PI*.37,{wreck:true});flames(337,187+drop,-Math.PI*.25);
        sprite('chute',278,158+(moving?(time%5)*3:0),29);sprite('burningChute',443,200+(moving?(time%5)*3:0),25);
      } else {
        const px=300+(moving?Math.sin(time*.45)*16:0),py=153+(moving?Math.sin(time*.8)*5:0);
        for(let i=0;i<40;i++){const x=px-20-i*2.5,y=py+7+Math.sin(i*.035)*18;c.save();c.globalAlpha=(1-i/45)*.48;ellipse(x,y,1.2+i*.018,.75+i*.015,'#effbf5');c.restore();}
        plane(px,py,angle*Math.PI/180);sprite('enemy',520,131,28,{rotation:.15});
      }
    }
    c.restore();hud();canvas.dataset.look=selected;canvas.dataset.scene=scene;canvas.dataset.planeWidth='36';canvas.dataset.environmentGrid=String(profiles[selected].grid);canvas.dataset.ready='true';
  }
  function select(value){selected=value;document.querySelectorAll('[data-look]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.look===value)));$('static-image').href=`assets/previews/rainbow-look-${value}.png`;descriptions.textContent=profiles[value].description;canvas.setAttribute('aria-label',`Rendered game view ${value.toUpperCase()}`);draw();}
  document.querySelectorAll('[data-look]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.look)));
  $('scene').addEventListener('change',()=>{scene=$('scene').value;time=0;draw();});
  $('angle').addEventListener('input',()=>{angle=Number($('angle').value);$('angle-value').value=angle+'°';draw();});
  $('motion').addEventListener('click',()=>{moving=!moving;$('motion').setAttribute('aria-pressed',String(moving));$('motion').textContent=moving?'STOP':'ANIMATE';last=0;if(moving)requestAnimationFrame(frame);else draw();});
  function frame(now){if(!moving)return;if(last)time+=Math.min(.05,(now-last)/1000);last=now;draw();requestAnimationFrame(frame);}
  document.addEventListener('keydown',event=>{if(['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName))return;const look={Digit1:'a',Digit2:'b',Digit3:'c'}[event.code];if(look){event.preventDefault();select(look);}});
  $('export').addEventListener('click',()=>canvas.toBlob(blob=>{if(!blob)return;const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=`rainbow-look-${selected}-${scene}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);},'image/png'));
  let audio;
  function stopAudio(){if(audio){audio.pause();audio.currentTime=0;}}
  document.querySelectorAll('[data-sound]').forEach(button=>button.addEventListener('click',()=>{stopAudio();audio=new Audio(`assets/audio/audition-v05/${button.dataset.sound}.${button.dataset.sound==='title-theme'?'m4a':'wav'}?v=20261101-moo2`);audio.volume=.5;audio.play().catch(()=>{});}));
  $('stop-audio').addEventListener('click',stopAudio);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
  Promise.all(Object.entries({main:'rainbow-sprites-v1.png',defense:'rainbow-defense-pilots-v1.png'}).map(([name,file])=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[name]=img;resolve();};img.onerror=reject;img.src='assets/'+file;}))).then(()=>{loaded=true;select(selected);}).catch(()=>{descriptions.textContent='Artwork could not load. Reload this page.';});
})();
