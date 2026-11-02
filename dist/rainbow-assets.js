// Rainbow Patrol artwork adapter. GPL-2.0-or-later; provenance: assets/ARTWORK.md.
(() => {
  const DETAIL=3,atlas=new Image(),extras=new Image(),cows=new Image(),pilots=new Image(),actors=new Image(),departure=new Image(),cache=new Map();
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
    let remaining=6,okay=true;
    const done=valid=>{okay=okay&&valid;if(--remaining===0){loaded=okay;resolve(loaded);}};
    atlas.onload=()=>done(atlas.width===1254&&atlas.height===1254);
    extras.onload=()=>done(extras.width===1774&&extras.height===887);
    cows.onload=()=>done(cows.width===1254&&cows.height===1254);
    pilots.onload=()=>done(pilots.width===1536&&pilots.height===1024);
    actors.onload=()=>done(actors.width===320&&actors.height===128);
    departure.onload=()=>done(departure.width===288&&departure.height===64);
    atlas.onerror=extras.onerror=cows.onerror=pilots.onerror=actors.onerror=departure.onerror=()=>done(false);
    atlas.src='assets/rainbow-sprites-v1.png';
    extras.src='assets/rainbow-extras-v1.png';
    cows.src='assets/rainbow-cow-reaction-v1.png';pilots.src='assets/rainbow-defense-pilots-v1.png';
    actors.src='assets/patrol-pilots-v2.svg';departure.src='assets/patrol-departure-v1.svg';
  }); }
  function sprite(r,heap) {
    if(!loaded){load();return null;}
    const index=frameFor(r),[type,state,,,,orient,,w,h,ptr]=r,angle=Math.round(r[4]*8)/8;
    if(index<0||w<1||h<1||w>256||h>256||ptr<0||ptr+w*h>heap.length)return null;
    const key=[index,type,state,angle,orient,r[6],w,h,ptr,r[12]<0].join(':');
    if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');
    const rotating=type===1||type===10,worldSize=type===1?46:type===10?30:0;
    out.worldWidth=rotating?worldSize:w*2+2;out.worldHeight=rotating?worldSize:h*2+2;
    out.width=out.worldWidth*DETAIL;out.height=out.worldHeight*DETAIL;
    const c=out.getContext('2d');c.imageSmoothingEnabled=true;c.scale(DETAIL,DETAIL);
    const sheet=index<16?atlas:index<24?extras:pilots,crop=index<16?frames[index]:index<24?extraFrames[index-16]:defenseFrames[index-24];
    let left=w,top=h,right=0,bottom=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(heap[ptr+y*w+x]) {
      left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);
    }
    if(right<=left||bottom<=top)return null;
    const bx=left*2+1,by=top*2+1,bw=(right-left)*2,bh=(bottom-top)*2;
    if(rotating) {
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
      c.drawImage(sheet,...crop,Math.round(bx+(bw-dw)/2),Math.round(by+bh-dh),Math.round(dw),Math.round(dh));
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
    const bounds=[[99,671,336,276],[570,490,398,503],[1068,483,430,513]],crop=bounds[frame],width=frame===0?8:18;
    const key='pilot:'+frame;if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');out.width=width*DETAIL;out.height=Math.ceil(width*crop[3]/crop[2]*DETAIL);
    out.getContext('2d').drawImage(pilots,...crop,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  function pilotFrame(frame,faction=1){
    if(!loaded)return null;frame=Math.max(0,Math.min(9,frame));
    const key=`actor:${frame}:${faction}`;if(cache.has(key))return cache.get(key);
    const airborne=frame>=7,crop=airborne?[0,0,32,64]:frame===5?[0,32,32,32]:[6,31,26,33];
    const out=document.createElement('canvas');out.worldWidth=airborne?24:frame===5?20:15;
    out.worldHeight=out.worldWidth*crop[3]/crop[2];out.width=Math.ceil(out.worldWidth*DETAIL);out.height=Math.ceil(out.worldHeight*DETAIL);
    out.getContext('2d').drawImage(actors,frame*32+crop[0],(faction===1?0:64)+crop[1],crop[2],crop[3],0,0,out.width,out.height);
    cache.set(key,out);return out;
  }
  function departurePose(frame){
    if(!loaded)return null;frame=Math.max(0,Math.min(2,frame));const key='departure:'+frame;if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');out.width=96*DETAIL;out.height=64*DETAIL;
    out.getContext('2d').drawImage(departure,frame*96,0,96,64,0,0,out.width,out.height);cache.set(key,out);return out;
  }
  window.RainbowAssets={DETAIL,pilotPose,pilotFrame,departurePose,get ready(){return load();},sprite,cowPose,frameFor,get loaded(){return loaded;}};
})();
