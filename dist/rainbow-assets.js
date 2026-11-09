// Rainbow Patrol artwork adapter. GPL-2.0-or-later; provenance: assets/ARTWORK.md.
(() => {
  const DETAIL=3,atlas=new Image(),extras=new Image(),cows=new Image(),pilots=new Image(),actors=new Image(),departure=new Image(),canopies=new Image(),badge=new Image(),cockpit=new Image(),scenery=new Image(),clouds=new Image(),soil=new Image(),roll=new Image(),turf=new Image(),instruments=new Image(),details=new Image(),blasts=new Image(),gauges=new Image(),winter=new Image(),storm=new Image(),worldDetails=new Image(),missionTargets=new Image(),materials=new Image(),airfields=new Image(),water=new Image(),ruins=new Image(),flags=new Image(),damaged=new Image(),extraRuins=new Image(),cityRelics=new Image(),winterRelics=new Image(),throttleArt=new Image(),cockpitWeather=new Image(),cache=new Map(),footprints=new Map();
  // Measured opaque-component bounds in the immutable 1254×1254 atlas.
  // Explicit rectangles avoid neighbouring art bleeding into a sprite.
  const frames=[[17,95,290,190],[339,89,277,199],[642,94,272,194],[936,113,304,171],
    [6,413,320,171],[344,342,270,257],[634,411,320,193],[984,381,260,223],
    [12,704,321,182],[344,722,306,162],[653,702,323,175],[984,628,240,274],
    [26,916,286,299],[450,956,85,257],[682,952,233,243],[965,1031,263,174]];
  const extraFrames=[[58,89,306,443],[467,93,252,438],[758,128,493,403],[1267,332,490,199],
    [16,633,529,197],[622,691,295,110],[1060,624,162,206],[1447,586,261,249]];
  const defenseFrames=[[46,62,451,376],[576,65,431,375],[1066,205,449,244]];
  const cowFrames=[[39,172,542,455],[670,266,532,361],[25,879,583,214],[641,915,593,183]];
  // Middle-state building identities: the eight airfield cells, then field
  // tent, winter cottage, winter supply shed and city crane workshop.
  const damageFrames=[[6,90,378,233],[398,45,361,278],[773,85,354,237],[1157,54,369,269],[10,475,376,238],[408,328,341,385],[771,391,364,322],[1158,473,367,240],[16,808,359,187],[391,755,355,240],[761,817,359,179],[1135,766,392,229]];
  let loaded=false;
  function frameFor(r) {
    const [type,state,,,,orient,faction]=r;
    if(type===1)return state===3||state===4?3:faction===1?0:1;
    if(type===2)return 13;
    if(type===10)return 21;
    if(type===11)return 22;
    if(type===4) {
      if(r[15]===20)return state!==5?26:r[4]===8?25:24;
      if(state!==5)return r[15]===3?20:r[15]===0?19:18;
      return ({0:4,1:5,2:7,3:6,4:8,5:9,6:16,7:10,18:11,19:17})[r[15]]??-1;
    }
    if(type===9)return 2;
    if(type===8||type===7)return orient?15:14;
    if(type===12)return 12;
    return -1;
  }
  let ready;
  function load() { return ready ||= new Promise(resolve=>{
    let remaining=33,okay=true;
    const done=valid=>{okay=okay&&valid;if(--remaining===0){loaded=okay;resolve(loaded);}};
    atlas.onload=()=>done(atlas.width===1254&&atlas.height===1254);
    extras.onload=()=>done(extras.width===1774&&extras.height===887);
    cows.onload=()=>done(cows.width===1254&&cows.height===1254);
    pilots.onload=()=>done(pilots.width===1536&&pilots.height===1024);
    actors.onload=()=>done(actors.width===1536&&actors.height===1024);
    departure.onload=()=>done(departure.width===1536&&departure.height===1024);
    canopies.onload=()=>done(canopies.width===1536&&canopies.height===1024);
    badge.onload=()=>done(badge.width===1536&&badge.height===1024);
    cockpit.onload=()=>done(cockpit.width===1536&&cockpit.height===1024);
    details.onload=()=>done(details.width===1536&&details.height===1024);
    blasts.onload=()=>done(blasts.width===1536&&blasts.height===1024);
    for(const img of [winter,storm,worldDetails,missionTargets,materials,airfields,water,ruins,flags,damaged,extraRuins,cityRelics,winterRelics]){img.onload=()=>done(img.width===1536&&img.height===1024);img.onerror=()=>done(false);}
    cockpitWeather.onload=()=>done(cockpitWeather.width===1536&&cockpitWeather.height===1024);cockpitWeather.onerror=()=>done(false);cockpitWeather.src='assets/rainbow-cockpit-weather-v25.png';
    throttleArt.onload=()=>done(throttleArt.width===1536&&throttleArt.height===1024);throttleArt.onerror=()=>done(false);
    throttleArt.src='assets/rainbow-throttle-lever-v1.png';
    gauges.onload=()=>done(gauges.width===1536&&gauges.height===1024);
    instruments.onload=()=>done(instruments.width===1536&&instruments.height===1024);
    turf.onload=()=>done(turf.width===1536&&turf.height===1024);
    roll.onload=()=>done(roll.width===1536&&roll.height===1024);
    scenery.onload=()=>done(scenery.width===1536&&scenery.height===1024);
    clouds.onload=()=>done(clouds.width===1536&&clouds.height===1024);
    soil.onload=()=>done(soil.width===1536&&soil.height===1024);
    winter.onerror=storm.onerror=worldDetails.onerror=missionTargets.onerror=materials.onerror=gauges.onerror=details.onerror=blasts.onerror=instruments.onerror=turf.onerror=roll.onerror=scenery.onerror=clouds.onerror=soil.onerror=atlas.onerror=extras.onerror=cows.onerror=pilots.onerror=actors.onerror=departure.onerror=canopies.onerror=badge.onerror=cockpit.onerror=()=>done(false);
    winter.src='assets/rainbow-winter-scenery-v1.png';storm.src='assets/rainbow-storm-scenery-v1.png';worldDetails.src='assets/rainbow-world-details-v1.png';missionTargets.src='assets/rainbow-winter-city-targets-v1.png';materials.src='assets/rainbow-mission-materials-v1.png';
    airfields.src='assets/rainbow-airfield-buildings-v2.png';water.src='assets/rainbow-water-airstrip-v1.png';
    ruins.src='assets/rainbow-airfield-ruins-v1.png';flags.src='assets/rainbow-mounted-flags-v1.png';
    damaged.src='assets/rainbow-buildings-damaged-v1.png';extraRuins.src='assets/rainbow-small-building-ruins-v1.png';cityRelics.src='assets/rainbow-city-relics-v1.png';winterRelics.src='assets/rainbow-winter-relics-v1.png';
    gauges.src='assets/rainbow-gauge-layers-v1.png';
    details.src='assets/rainbow-dashboard-details-v3.png';blasts.src='assets/rainbow-explosions-v2.png';
    instruments.src='assets/rainbow-cockpit-instruments-v2.png';
    turf.src='assets/rainbow-turf-v1.png';
    roll.src='assets/rainbow-aircraft-roll-v1.png';
    scenery.src='assets/rainbow-scenery-v1.png';clouds.src='assets/rainbow-clouds-v1.png';soil.src='assets/rainbow-soil-v1.png';
    atlas.src='assets/rainbow-sprites-v1.png';
    extras.src='assets/rainbow-extras-v1.png';
    cows.src='assets/rainbow-cow-reaction-v1.png';pilots.src='assets/rainbow-defense-pilots-v1.png';
    actors.src='assets/rainbow-pilot-walk-v3.png';departure.src='assets/rainbow-departure-v2.png';
    canopies.src='assets/rainbow-parachute-sway-v4.png';badge.src='assets/rainbow-wing-badge-v1.png';cockpit.src='assets/rainbow-cockpit-v1.png';
  }); }
  function sprite(r,heap,mission=0) {
    if(!loaded){load();return null;}
    const index=frameFor(r),[type,state,,,,orient,,w,h,ptr]=r,angle=Math.round(r[4]*8)/8;
    if(index<0||w<1||h<1||w>256||h>256||ptr<0||ptr+w*h>heap.length)return null;
    const building=type===4&&[0,1,2,7].includes(r[15]);
    const damageStage=building?(state!==5?2:r[11]>0&&r[11]<=12?1:0):0;
    const buildingCell=!building?-1:r[15]===0?mission:r[15]===1?[6,4,5][mission]:r[15]===2?[3,10,11][mission]:[8,9,7][mission];
    const key=[mission,index,type,state,damageStage,buildingCell,angle,orient,r[6],r[15],w,h,ptr,r[12]<0].join(':');
    if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');
    const rotating=type===1||type===10,worldSize=type===1?46:type===10?30:0;
    out.worldWidth=rotating?worldSize:w*2+2;out.worldHeight=rotating?worldSize:h*2+2;
    out.width=out.worldWidth*DETAIL;out.height=out.worldHeight*DETAIL;
    const c=out.getContext('2d');c.imageSmoothingEnabled=true;c.scale(DETAIL,DETAIL);
    let sheet=index<16?atlas:index<24?extras:pilots,crop=index<16?frames[index]:index<24?extraFrames[index-16]:defenseFrames[index-24];
    if(mission&&type===4&&[0,1,2,7].includes(r[15])){
      const building=({0:0,1:2,2:3,7:1})[r[15]],row=mission===2||state!==5?4:0;
      const bounds=[[10,200,365,218],[400,170,355,248],[780,125,365,293],[1160,220,370,198],[10,680,365,268],[400,600,355,348],[780,600,365,348],[1160,700,370,248]];
      sheet=missionTargets;crop=bounds[row+building];
    }
    if(type===4&&([0,1].includes(r[15])||r[15]===2&&mission===0||r[15]===7&&mission===2)){
      const cell=r[15]===0?mission:r[15]===1?[6,4,5][mission]:r[15]===2?3:7;
      const bounds=[[6,204,378,223],[384,161,384,266],[768,192,381,235],[1174,156,341,271],[8,702,376,236],[384,520,363,418],[774,593,367,345],[1161,681,365,257]];
      const destroyed=[[8,295,373,159],[390,278,374,176],[773,277,373,177],[1156,248,372,206],[7,787,374,189],[390,667,374,309],[773,720,373,256],[1156,790,373,186]];
      sheet=state===5?airfields:ruins;crop=(state===5?bounds:destroyed)[cell];
    }
    if(building&&damageStage===2&&buildingCell>=8){
      const bounds=[[43,306,686,148],[789,281,705,173],[44,809,682,150],[779,755,716,204]];
      sheet=extraRuins;crop=bounds[buildingCell-8];
    }
    let left=w,top=h,right=0,bottom=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(heap[ptr+y*w+x]) {
      left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);
    }
    if(right<=left||bottom<=top)return null;
    const bx=left*2+1,by=top*2+1,bw=(right-left)*2,bh=(bottom-top)*2;
    const footKey=[mission,r[15],w,h].join(':');
    if(building&&state!==5){
      const intact=footprints.get(footKey),dw=intact?.width??w*2-2,dh=dw*crop[3]/crop[2],dx=intact?.x??w+1-dw/2,dy=(intact?intact.y+intact.height:h*2+1)-dh;
      c.drawImage(sheet,...crop,dx,dy,dw,dh);out.artBounds={x:dx,y:dy,width:dw,height:dh};
    }else if(rotating) {
      // Keep aircraft/missile dimensions constant through a turn. The native
      // mask's changing axis-aligned bounds must never rescale the artwork.
      const a=state===3&&type===1?0:-angle*Math.PI/8;
      const fw=type===10?24:32,fh=type===10?8:fw*crop[3]/crop[2];
      c.translate(worldSize/2,worldSize/2);c.rotate(a);c.scale(1,type===1&&orient&&state!==3?-1:1);
      c.drawImage(sheet,...crop,-fw/2,-fh/2,fw,fh);
    } else if(type===7) {
      for(const [x,y] of [[.05,.15],[.4,0],[.7,.3],[.2,.65],[.6,.75]])
        c.drawImage(sheet,...crop,Math.round(bx+x*bw*.75),Math.round(by+y*bh*.7),Math.ceil(bw*.3),Math.ceil(bh*.3));
    } else {
      if(type===8&&r[12]<0){c.translate(w*2+2,0);c.scale(-1,1);}
      const scale=Math.min(bw/crop[2],bh/crop[3]),dw=crop[2]*scale,dh=crop[3]*scale;
      const bounds={x:Math.round(bx+(bw-dw)/2),y:Math.round(by+bh-dh),width:Math.round(dw),height:Math.round(dh)};
      if(building){
        footprints.set(footKey,bounds);out.artBounds=bounds;
        if(damageStage===1){const hit=damageFrames[buildingCell],height=Math.min(bounds.height,bounds.width*hit[3]/hit[2]);out.artBounds={...bounds,y:bounds.y+bounds.height-height,height};sheet=damaged;crop=hit;}
        const b=out.artBounds;c.drawImage(sheet,...crop,b.x,b.y,b.width,b.height);
      }else c.drawImage(sheet,...crop,bounds.x,bounds.y,bounds.width,bounds.height);
      if(type===4&&state===5&&r[6]&&[3,4,5,20].includes(r[15])){
        // Painted hull/shield panels belong to the unit, with the same
        // mint/red team colours used by the map and its ground pennant.
        const px=bx+(bw-dw)/2+dw*.28,py=by+bh-dh*.38,pw=dw*.43,ph=Math.max(2.4,dh*.16);
        c.globalCompositeOperation='source-atop';c.fillStyle='#263b55';c.fillRect(px-.7,py-.7,pw+1.4,ph+1.4);
        c.fillStyle=r[6]===1?'#71cebb':'#ed786b';c.fillRect(px,py,pw,ph);
        c.fillStyle='#fff2ce';c.fillRect(px+pw*.46,py+.3,.8,ph-.6);
        if(r[6]===1)c.fillRect(px+pw*.25,py+ph*.45,pw*.5,.8);
        c.globalCompositeOperation='source-over';
      }
    }
    if(type===1&&r[15]===22){
      out.livery='blue-teal';
      if(c.getImageData&&c.putImageData){
        const image=c.getImageData(0,0,out.width,out.height),pixels=image.data;
        for(let i=0;i<pixels.length;i+=4){const r=pixels[i],g=pixels[i+1],b=pixels[i+2];
          if(pixels[i+3]&&r>g*1.25&&r>b*1.35&&r-g>30){const l=.3*r+.59*g+.11*b;pixels[i]=Math.min(255,l*.55);pixels[i+1]=Math.min(255,l*1.15);pixels[i+2]=Math.min(255,l*1.27);}}
        c.putImageData(image,0,0);
      }
    }
    if(building)out.damageStage=damageStage;
    if(type===1&&c.getImageData){
      const pixels=c.getImageData(0,0,out.width,out.height).data;let bottom=0;
      for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++)if(pixels[(y*out.width+x)*4+3]>30)bottom=y+1;
      out.contactY=bottom/DETAIL;
    }
    if(cache.size>700)cache.clear();cache.set(key,out);return out;
  }
  function cowPose(frame) {
    if(!loaded)return null;
    frame=Math.max(0,Math.min(3,frame));const key='cow:'+frame;
    if(cache.has(key))return cache.get(key);
    const crop=cowFrames[frame],out=document.createElement('canvas');
    out.width=18*DETAIL;out.height=Math.ceil(18*crop[3]/crop[2]*DETAIL);
    out.getContext('2d').drawImage(cows,...crop,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  function pilotPose(frame) {
    if(!loaded)return null;
    const bounds=[[99,671,336,276],[570,490,398,503],[1068,483,430,513]],crop=bounds[frame],width=frame===0?14:24;
    const key='pilot:'+frame;if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');out.width=width*DETAIL;out.height=Math.ceil(width*crop[3]/crop[2]*DETAIL);
    out.worldWidth=width;out.worldHeight=out.height/DETAIL;out.getContext('2d').drawImage(pilots,...crop,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  function pilotFrame(frame,faction=1){
    if(!loaded)return null;frame=Math.max(0,Math.min(7,frame));
    const key=`actor:${frame}:${faction}`;if(cache.has(key))return cache.get(key);
    // Fixed cell coordinates and the measured common boot baseline preserve
    // proportions and contact. No bobbing or crop-centre changes per stride.
    const out=document.createElement('canvas');out.worldHeight=16;out.worldWidth=384/374*16;
    out.width=Math.ceil(out.worldWidth*DETAIL);out.height=16*DETAIL;
    out.getContext('2d').drawImage(actors,(frame%4)*384,Math.floor(frame/4)*512+64,384,374,0,0,out.width,out.height);
    cache.set(key,out);return out;
  }
  function departurePose(frame){
    if(!loaded)return null;frame=Math.max(0,Math.min(3,frame));const key='departure:'+frame;if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');out.width=96*DETAIL;out.height=64*DETAIL;
    out.getContext('2d').drawImage(departure,(frame%2)*768+30,Math.floor(frame/2)*512+80,708,350,0,8*DETAIL,out.width,48*DETAIL);cache.set(key,out);return out;
  }
  function parachutePose(frame,burning=false){
    if(!loaded)return null;frame=((frame%4)+4)%4;const key=`canopy:${frame}:${burning}`;if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');out.worldWidth=24;out.worldHeight=30;out.width=24*DETAIL;out.height=30*DETAIL;
    out.getContext('2d').drawImage(canopies,frame*384,burning?512:0,384,480,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  function interfaceArt(kind){
    if(!loaded)return null;const key='ui:'+kind;if(cache.has(key))return cache.get(key);
    const pieces={fuel:[[22,20,460,450],56,56],map:[[526,101,488,281],246,62],score:[[1047,112,467,267],100,46],bomb:[[153,538,207,464],9,20],ammo:[[520,647,491,194],64,28],home:[[1074,541,415,419],14,14]};
    const detailPieces={lives:[[18,177,352,195],55,23],level:[[439,178,280,194],34,23],counter:[[786,177,352,195],54,27],bombRack:[[1171,180,351,183],55,30],you:[[15,714,356,93],33,9],friend:[[399,714,356,93],48,9],enemy:[[783,714,356,93],46,9],birds:[[1167,714,356,93],46,9]};
    let sheet,crop,w,h;
    if(kind==='throttleBase'){sheet=throttleArt;crop=[34,430,1173,266];w=92;h=14;}
    else if(kind==='throttleLever'){sheet=throttleArt;crop=[1269,216,195,430];w=7;h=15.44;}
    else if(detailPieces[kind]){[crop,w,h]=detailPieces[kind];sheet=details;}
    else if(pieces[kind]){[crop,w,h]=pieces[kind];sheet=instruments;}
    else [sheet,crop,w,h]=kind==='badge'?[badge,[12,200,1512,600],360,360*600/1512]
      :kind==='panel'?[cockpit,[0,0,1536,512],640,96]
      :kind==='plate'?[cockpit,[1030,662,500,188],110,42]
      :[cockpit,[kind==='altitude'?536:24,524,459,468],56,56];
    const out=document.createElement('canvas');out.worldWidth=w;out.worldHeight=h;out.width=Math.ceil(w*DETAIL);out.height=Math.ceil(h*DETAIL);
    const context=out.getContext('2d');
    if(['panel','map','score','lives','level','counter','bombRack','throttleBase'].includes(kind)){
      // Uniformly scaled corner pieces keep rivets circular. Only the wood
      // and straight border centres stretch to the cockpit's wide aspect.
      const [sx,sy,sw,sh]=crop,edge=Math.min(sw,sh)*.24,scale=out.height/sh,pad=edge*scale;
      const xs=[sx,sx+edge,sx+sw-edge,sx+sw],ys=[sy,sy+edge,sy+sh-edge,sy+sh];
      const dx=[0,pad,out.width-pad,out.width],dy=[0,pad,out.height-pad,out.height];
      for(let y=0;y<3;y++)for(let x=0;x<3;x++)context.drawImage(sheet,xs[x],ys[y],xs[x+1]-xs[x],ys[y+1]-ys[y],dx[x],dy[y],dx[x+1]-dx[x],dy[y+1]-dy[y]);
    }else context.drawImage(sheet,...crop,0,0,out.width,out.height);
    cache.set(key,out);return out;
  }
  function explosionPose(frame){
    if(!loaded)return null;frame=Math.max(0,Math.min(7,frame));const key='blast:'+frame;if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');out.width=96*DETAIL;out.height=128*DETAIL;
    out.getContext('2d').drawImage(blasts,(frame%4)*384,Math.floor(frame/4)*512,384,512,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  function gaugeLayer(kind){
    if(!loaded)return null;const key='gauge:'+kind;if(cache.has(key))return cache.get(key);
    // Measured pivots, rather than cell centres, keep the ornamental hands
    // concentric as they turn. Transparent glass stays above live markings.
    const centres={ivory:[256,244],dark:[768,244],blue:[1274,244],brass:[256,768],glass:[768,762],cap:[1274,758]};
    const pivot=centres[kind];if(!pivot)return null;
    const out=document.createElement('canvas');out.width=out.height=512;
    out.getContext('2d').drawImage(gauges,pivot[0]-256,pivot[1]-256,512,512,0,0,512,512);cache.set(key,out);return out;
  }
  function cockpitLayer(kind){
    if(!loaded)return null;const crops={frostRing:[32,24,448,456],frostFrame:[532,136,464,248],frostEdge:[1040,154,480,188],nightDial:[24,532,464,464],nightGlass:[544,536,448,448],nightFrame:[1040,654,480,208]},crop=crops[kind];if(!crop)return null;
    const key='climate:'+kind;if(cache.has(key))return cache.get(key);const out=document.createElement('canvas');out.width=crop[2];out.height=crop[3];out.getContext('2d').drawImage(cockpitWeather,...crop,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  function wreckPose(frame,faction=1){
    if(!loaded)return null;frame=((frame%4)+4)%4;const row=faction===1?0:1,key=`roll:${row}:${frame}`;if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');out.worldWidth=36;out.worldHeight=48;out.width=108;out.height=144;
    out.getContext('2d').drawImage(roll,frame*384,row*512,384,512,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  function worldDetail(index){
    if(!loaded)return null;index=Math.max(0,Math.min(7,index));const key='detail:'+index;if(cache.has(key))return cache.get(key);
    const crops=[[8,156,370,270],[392,176,370,250],[776,156,370,280],[1160,145,370,285],[32,620,330,308],[416,620,330,308],[780,560,365,370],[1160,660,370,288]],crop=crops[index];
    const out=document.createElement('canvas');out.width=crop[2];out.height=crop[3];out.getContext('2d').drawImage(worldDetails,...crop,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  function sceneryArt(kind,index=0){
    if(!loaded)return null;if(kind==='water')return water;if(kind==='winter')return winter;if(kind==='storm')return storm;if(kind==='materials')return materials;if(kind==='background')return scenery;if(kind==='soil')return soil;if(kind==='turf')return turf;
    const crops=[[35,195,430,150],[0,165,512,195],[18,105,490,280],[35,805,440,160],[535,785,470,180],[1060,830,430,150]];
    index=((index%6)+6)%6;const key='scenery:'+index;if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas'),crop=crops[index];out.width=crop[2];out.height=crop[3];out.getContext('2d').drawImage(clouds,...crop,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  function debrisPose(index){
    if(!loaded)return null;index=((index%8)+8)%8;const key='debris:'+index;if(cache.has(key))return cache.get(key);
    const crops=[[63,132,82,83],[842,101,97,46],[467,106,74,47],[1022,116,50,43],[587,161,46,58],[1229,114,64,37],[272,169,56,47],[1383,109,43,42]],crop=crops[index];
    const out=document.createElement('canvas');out.width=crop[2];out.height=crop[3];out.getContext('2d').drawImage(ruins,...crop,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  function mountedFlag(style,faction){
    if(!loaded)return null;style=Math.max(0,Math.min(2,style));const index=style+(faction===1?0:3),key='mount:'+index;if(cache.has(key))return cache.get(key);
    const crop=[[72,30,401,445],[544,51,451,426],[1079,98,400,327],[73,534,401,448],[544,556,451,430],[1079,605,401,335]][index];
    const out=document.createElement('canvas');out.width=crop[2];out.height=crop[3];out.getContext('2d').drawImage(flags,...crop,0,0,out.width,out.height);out.mountAnchor=style===0?{x:.183,y:.99}:style===1?{x:.04,y:.92}:{x:.5,y:.1};cache.set(key,out);return out;
  }
  function buriedRelic(mission,index){
    if(!loaded)return null;if(!mission)return worldDetail(index%4);
    index=((index%8)+8)%8;const key=`relic:${mission}:${index}`;if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');out.width=384;out.height=310;
    out.getContext('2d').drawImage(mission===1?winterRelics:cityRelics,index%4*384,Math.floor(index/4)*512+135,384,310,0,0,384,310);cache.set(key,out);return out;
  }
  function flagAnchor(art,style,building){
    if(!art)return null;art.flagAnchors ||= {};const key=style+':'+building;if(art.flagAnchors[key])return art.flagAnchors[key];
    const b=art.artBounds||{x:1,y:1,width:art.width/DETAIL-2,height:art.height/DETAIL-2};
    let x=b.x+b.width*(style===2?.5:style===0?.28:.22),y=b.y+b.height*(style===2?.44:.62);
    const context=art.getContext('2d');
    if(context.getImageData){
      const data=context.getImageData(0,0,art.width,art.height).data,px=Math.max(1,Math.min(art.width-2,Math.round(x*DETAIL)));
      if(style===0){
        for(let row=0;row<art.height-2;row++)if([0,1,2].every(d=>data[((row+d)*art.width+px)*4+3]>160)){y=(row+2)/DETAIL;break;}
      }else{
        let nearest=Infinity;
        for(let row=0;row<art.height;row++)for(let col=0;col<art.width;col++)if(data[(row*art.width+col)*4+3]>190){
          const distance=(col/DETAIL-x)**2+(row/DETAIL-y)**2;if(distance<nearest){nearest=distance;art.flagAnchors[key]={x:col/DETAIL,y:row/DETAIL};}
        }
        if(art.flagAnchors[key])return art.flagAnchors[key];
      }
    }
    return art.flagAnchors[key]={x,y};
  }
  window.RainbowAssets={DETAIL,cockpitLayer,buriedRelic,flagAnchor,debrisPose,mountedFlag,worldDetail,gaugeLayer,explosionPose,wreckPose,sceneryArt,pilotPose,pilotFrame,parachutePose,interfaceArt,departurePose,get ready(){return load();},sprite,cowPose,frameFor,get loaded(){return loaded;}};
})();
