// Rainbow Patrol artwork adapter. GPL-2.0-or-later; provenance: assets/ARTWORK.md.
(() => {
  const atlas=new Image(),extras=new Image(),cache=new Map();
  // Measured opaque-component bounds in the immutable 1254×1254 atlas.
  // Explicit rectangles avoid neighbouring art bleeding into a sprite.
  const frames=[[17,95,290,190],[339,89,277,199],[642,94,272,194],[936,113,304,171],
    [6,413,320,171],[344,342,270,257],[634,411,320,193],[984,381,260,223],
    [12,704,321,182],[344,722,306,162],[653,702,323,175],[984,628,240,274],
    [26,916,286,299],[450,956,85,257],[682,952,233,243],[965,1031,263,174]];
  const extraFrames=[[58,89,306,443],[467,93,252,438],[758,128,493,403],[1267,332,490,199],
    [16,633,529,197],[622,691,295,110],[1060,624,162,206],[1447,586,261,249]];
  let loaded=false;
  function frameFor(r) {
    const [type,state,,,,orient,faction]=r;
    if(type===1)return state===3||state===4?3:faction===1?0:1;
    if(type===2)return 13;
    if(type===10)return 21;
    if(type===11)return 22;
    if(type===4) {
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
    let remaining=2,okay=true;
    const done=valid=>{okay=okay&&valid;if(--remaining===0){loaded=okay;resolve(loaded);}};
    atlas.onload=()=>done(atlas.width===1254&&atlas.height===1254);
    extras.onload=()=>done(extras.width===1774&&extras.height===887);
    atlas.onerror=extras.onerror=()=>done(false);
    atlas.src='assets/rainbow-sprites-v1.png';
    extras.src='assets/rainbow-extras-v1.png';
  }); }
  function sprite(r,heap) {
    if(!loaded){load();return null;}
    const index=frameFor(r),[type,state,,,angle,orient,,w,h,ptr]=r;
    if(index<0||w<1||h<1||w>256||h>256||ptr<0||ptr+w*h>heap.length)return null;
    const key=[index,type,state,angle,orient,w,h,ptr,r[12]<0].join(':');
    if(cache.has(key))return cache.get(key);
    const out=document.createElement('canvas');out.width=w*2+2;out.height=h*2+2;
    const c=out.getContext('2d');c.imageSmoothingEnabled=false;
    const sheet=index<16?atlas:extras,crop=index<16?frames[index]:extraFrames[index-16];
    let left=w,top=h,right=0,bottom=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(heap[ptr+y*w+x]) {
      left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);
    }
    if(right<=left||bottom<=top)return null;
    const bx=left*2+1,by=top*2+1,bw=(right-left)*2,bh=(bottom-top)*2;
    if(type===1&&index!==3||type===10) {
      // Rotate the new artwork inside the original native frame bounds.
      // This canvas is visual only; original masks still own all collisions.
      const a=-angle*Math.PI/8,co=Math.abs(Math.cos(a)),si=Math.abs(Math.sin(a)),fw=type===10?24:32,fh=type===10?8:20;
      const scale=Math.min(bw/(fw*co+fh*si),bh/(fw*si+fh*co));
      c.translate(bx+bw/2,by+bh/2);c.rotate(a);c.scale(1,type===1&&orient?-1:1);
      c.drawImage(sheet,...crop,-fw/2*scale,-fh/2*scale,fw*scale,fh*scale);
    } else if(type===7) {
      for(const [x,y] of [[.05,.15],[.4,0],[.7,.3],[.2,.65],[.6,.75]])
        c.drawImage(sheet,...crop,Math.round(bx+x*bw*.75),Math.round(by+y*bh*.7),Math.ceil(bw*.3),Math.ceil(bh*.3));
    } else {
      const dead=type===9&&state!==5;
      if(dead){c.filter='grayscale(1) brightness(.55)';c.globalAlpha=.9;}
      if(type===8&&r[12]<0){c.translate(out.width,0);c.scale(-1,1);}
      const scale=Math.min(bw/crop[2],bh/crop[3]),dw=crop[2]*scale,dh=crop[3]*scale;
      c.drawImage(sheet,...crop,Math.round(bx+(bw-dw)/2),Math.round(by+bh-dh),Math.round(dw),Math.round(dh));
    }
    if(cache.size>700)cache.clear();cache.set(key,out);return out;
  }
  window.RainbowAssets={get ready(){return load();},sprite,frameFor,get loaded(){return loaded;}};
})();
