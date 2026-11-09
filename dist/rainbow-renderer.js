// Sopwith: Rainbow Patrol. Original pixel renderer, GPL-2.0-or-later.
// The native C engine remains responsible for simulation and collision masks.
(() => {
  const W = 640, H = 400, HUD = 96, DETAIL = 3, HEADER = 28, STRIDE = 18, GROUND = 320;
  const P = {
    outline:'#34365b', blue:'#458fcb', sky:'#54b8e1', pale:'#98e6ed',
    cloud:'#e5fff0', cloudShade:'#9ce3e5', cloudDeep:'#76cddc',
    grass:'#ddf16e', green:'#a4cf40', grassShade:'#678343',
    sand:'#e7bd73', soil:'#d3ab6b', soilShade:'#c39961', rock:'#a77e55',
    red:'#ed786b', redShade:'#c65368', gold:'#ffdb81', yellow:'#f7be68',
    mint:'#71cebb', teal:'#399baf', purple:'#8984c6', cream:'#fff2ce',
    ink:'#263b55', white:'#f2fff5', smoke:'#d6eff0', darkSmoke:'#8193a7',
  };
  const FONT = {
    '0':['111','101','101','101','111'],'1':['010','110','010','010','111'],
    '2':['111','001','111','100','111'],'3':['111','001','111','001','111'],
    '4':['101','101','111','001','001'],'5':['111','100','111','001','111'],
    '6':['111','100','111','101','111'],'7':['111','001','010','010','010'],
    '8':['111','101','111','101','111'],'9':['111','101','111','001','111'],
    A:['010','101','111','101','101'],B:['110','101','110','101','110'],
    C:['111','100','100','100','111'],D:['110','101','101','101','110'],
    E:['111','100','110','100','111'],F:['111','100','110','100','100'],
    G:['111','100','101','101','111'],H:['101','101','111','101','101'],
    I:['111','010','010','010','111'],J:['001','001','001','101','111'],
    K:['101','101','110','101','101'],L:['100','100','100','100','111'],
    M:['10001','11011','10101','10101','10101'],N:['1001','1101','1011','1001','1001'],
    O:['111','101','101','101','111'],P:['111','101','111','100','100'],
    Q:['111','101','101','111','001'],R:['110','101','110','101','101'],
    S:['111','100','111','001','111'],T:['111','010','010','010','010'],
    U:['101','101','101','101','111'],V:['101','101','101','101','010'],
    W:['10101','10101','10101','11011','10001'],X:['101','101','010','101','101'],
    Y:['101','101','010','010','010'],Z:['111','001','010','100','111'],
    ':':['0','1','0','1','0'],'.':['0','0','0','0','1'],
    '/':['001','001','010','100','100'],'-':['000','000','111','000','000'],
    '%':['11001','11010','00100','01011','10011'],
    '+':['000','010','111','010','000'],' ':['000','000','000','000','000'],
    '<':['001','010','100','010','001'],'>':['100','010','001','010','100'],
  };
  function rect(c,x,y,w,h,color) { c.fillStyle=color; c.fillRect(Math.round(x),Math.round(y),w,h); }
  function text(c,str,x,y,color=P.white,scale=1) {
    for (const ch of String(str).toUpperCase()) {
      const glyph=FONT[ch] || FONT[' '];
      glyph.forEach((row,dy) => [...row].forEach((bit,dx) => {
        if (bit==='1') rect(c,x+dx*scale,y+dy*scale,scale,scale,color);
      }));
      x += (glyph[0].length+1)*scale;
    }
    return x;
  }
  function cloud(c,x,y,s=1) {
    // One-pixel rounded contours and a short shade ramp, like a painted
    // Amiga background, rather than the old stair-step cloud blocks.
    const lobes=[[15,25,15,10],[32,17,17,16],[51,21,18,13],[69,25,18,9],[82,28,13,6]];
    const ramp=['#fffce5','#f1fff0','#e5fff2','#d2f7ef','#b9ede9','#9edfe3','#88d1db'];
    for(let row=1;row<35;row++) {
      let left=Infinity,right=-Infinity;
      for(const [cx,cy,rx,ry] of lobes) {
        const dy=(row-cy)/ry;if(Math.abs(dy)>1)continue;
        const dx=rx*Math.sqrt(1-dy*dy);left=Math.min(left,cx-dx);right=Math.max(right,cx+dx);
      }
      if(right<left)continue;
      const l=Math.round(left*s),r=Math.round(right*s),top=Math.round(row*s),bottom=Math.round((row+1)*s);
      rect(c,x+l,y+top,r-l,Math.max(1,bottom-top),row>29?'#9de4e9':row>25?'#c5f4ee':'#edfff1');
    }
  }
  function polygon(c,points,color) {
    // Rasterise the distant hills by rows, keeping diagonals on whole pixels.
    const minY=Math.floor(Math.min(...points.map(p=>p[1]))),maxY=Math.ceil(Math.max(...points.map(p=>p[1])));
    for(let y=minY;y<maxY;y++) {
      const cuts=[];
      for(let i=0;i<points.length;i++) {
        const [x1,y1]=points[i],[x2,y2]=points[(i+1)%points.length];
        if(y1<=y&&y2>y||y2<=y&&y1>y)cuts.push(x1+(y-y1)/(y2-y1)*(x2-x1));
      }
      cuts.sort((a,b)=>a-b);
      for(let i=0;i<cuts.length;i+=2)rect(c,Math.round(cuts[i]),y,Math.round(cuts[i+1])-Math.round(cuts[i]),1,color);
    }
  }
  function rainbow(c,xLeft,yLeft,xRight,yRight) {
    const colors=[P.red,P.yellow,P.grass,P.mint,P.blue,P.purple];
    const rx=(xRight-xLeft)/2,cx=xLeft+rx,ry=65,base=Math.max(yLeft,yRight);
    for(let band=0;band<6;band++){
      const outerX=rx-band*2,innerX=outerX-2,outerY=ry-band*2,innerY=outerY-2;
      c.fillStyle=colors[band];c.beginPath();
      for(let i=0;i<=240;i++){const a=Math.PI-i/240*Math.PI,x=cx+Math.cos(a)*outerX,y=base-Math.sin(a)*outerY;i?c.lineTo(x,y):c.moveTo(x,y);}
      c.lineTo(cx+outerX,H);c.lineTo(cx+innerX,H);
      for(let i=0;i<=240;i++){const a=i/240*Math.PI;c.lineTo(cx+Math.cos(a)*innerX,base-Math.sin(a)*innerY);}
      c.lineTo(cx-innerX,H);c.lineTo(cx-outerX,H);c.closePath();c.fill();
    }
  }
  const MAP={x:201,y:19,w:216,h:45};
  function mapPoint(x,y,width) {return {x:MAP.x+1+Math.max(0,Math.min(1,x/width))*(MAP.w-2),y:H+MAP.y+MAP.h-1-Math.max(0,Math.min(199,y))/199*(MAP.h-2)};}
  function textWidth(str,scale=1){return Math.max(0,[...String(str).toUpperCase()].reduce((n,ch)=>n+((FONT[ch]||FONT[' '])[0].length+1)*scale,0)-scale);}
  function centred(c,str,x,y,color=P.cream,scale=1){hudType(c,str,x,y,{size:scale*7,color,align:'center',width:W-40});}

  function hudType(c,str,x,y,{size=7,color=P.cream,align='left',width,serif=false}={}){
    str=String(str);c.save();c.font=`${size}px "Patrol Engraved",Georgia,serif`;
    if(width){const measured=c.measureText(str).width;if(measured>width)c.font=`${size*width/measured}px "Patrol Engraved",Georgia,serif`;}
    c.fillStyle=color;c.textAlign=align;c.textBaseline='top';c.fillText(str,x,y);c.restore();
  }
  const SINE=[0,98,181,237,256,237,181,98,0,-98,-181,-237,-256,-237,-181,-98];
  function predictBomb(plane,ground) {
    if(!plane||!ground?.length)return null;
    const a=(plane[4]+(plane[5]?4:12))&15;
    let x=plane[2]+((SINE[(a+4)&15]*10)>>8)+4;
    let y=plane[3]+((SINE[a]*10)>>8)-4,dx=plane[12],dy=plane[13],life=5;
    const path=[];
    for(let tick=1;tick<=180;tick++) {
      if(--life<=0) {
        if(dy<0)dx-=Math.sign(dx);
        if(dy>-10)dy--;
        life=5;
      }
      x=Math.max(0,Math.min(ground.length-10,x+dx));y+=dy;
      // The edition ejects a new bomb after its first native move.
      if(tick===1)dy-=4;
      const cx=Math.max(0,Math.min(ground.length-1,Math.round(x+4))),cy=y-4;
      if(tick%3===0)path.push({x:cx,y:cy});
      if(cy<=ground[cx]+3)return {x:cx,y:ground[cx],ticks:tick,path};
    }
    return null;
  }
  function ring(c,x,y,r,color) {
    for(let py=-r;py<=r;py+=2)for(let px=-r;px<=r;px+=2) {
      const d=px*px+py*py;
      if(d<=r*r && d>(r-2)*(r-2))rect(c,x+px,y+py,2,2,color);
    }
  }
  function demoPlane(c,x,y,scale=1,angle=-.28) {
    const rows=[
      '        oo                ',
      '    oooooooooooooo        ',
      '    oggggggggggggo        ',
      '        o   o         w   ',
      ' oo     o   o    oo   w   ',
      'orro    o   o   odoo  w   ',
      'orrrroooooooooooorrrroy   ',
      ' orrrrrrrrrrrrrrrrrrrroy  ',
      '  osssssssssssssssssso y  ',
      '    oooooooooooooooo  w   ',
      '     oggggggggggo     w   ',
      '     oooooooooooo         ',
      '         o     o          ',
      '        odo   odo         ',
    ];
    const colors={o:P.outline,r:P.red,s:P.redShade,g:P.gold,d:P.ink,w:P.cream,y:P.yellow};
    // Inverse nearest-neighbour sampling avoids antialiased rotated pixels.
    const co=Math.cos(angle),si=Math.sin(angle),radius=Math.ceil(16*scale);
    for(let py=-radius;py<radius;py++)for(let px=-radius;px<radius;px++) {
      const sx=Math.floor((px*co+py*si)/scale+13),sy=Math.floor((-px*si+py*co)/scale+7);
      const color=colors[rows[sy]?.[sx]];if(color)rect(c,x+px,y+py,1,1,color);
    }
  }

  class RainbowRenderer {
    constructor(canvas) {
      this.canvas=canvas; canvas.width=W*DETAIL; canvas.height=(H+HUD)*DETAIL;
      this.c=canvas.getContext('2d',{alpha:false});this.c.setTransform(DETAIL,0,0,DETAIL,0,0);this.c.imageSmoothingEnabled=true;
      this.sprites=new Map(); this.trail=[]; this.lastTick=-1;
      this.effects=[];this.lastEffectId=0;this.aimEnabled=true;this.bombHeld=false;
      this.aimVisible=false;this.aimActivations=0;
      this.cowDeaths=new Map();this.terrainCache=null;this.smokeBrush=null;
      this.bombs=new Map();this.airplanes=new Map();this.bailouts=[];this.darkSmokeBrush=null;
    }
    background(camera=0,tick=0) {
      const c=this.c;
      const art=window.RainbowAssets?.sceneryArt?.(this.mission===1?'winter':this.mission===2?'storm':'background');
      if(art){
        // Mirrored distant tiles join continuously; the flight camera remains
        // native while scenery moves more slowly, at fractional coordinates.
        rect(c,0,0,W,H,['#258eb5','#597480','#283e4d'][this.mission||0]);
        const span=960,offset=camera*.12,first=Math.floor(offset/span);
        for(let i=first;i<=first+1;i++){
          c.save();c.translate(i*span-offset,0);
          if(i%2){c.translate(span,0);c.scale(-1,1);}c.drawImage(art,0,-105,span,H);c.restore();
        }
        // The original painting ended at y=295. Continue it with a real
        // distant water surface all the way behind even the deepest ravine.
        const water=window.RainbowAssets.sceneryArt('water'),waterTop=282;
        if(water){
          const drift=camera*.12+tick*.12,tileWidth=300,firstTile=Math.floor(drift/tileWidth);
          for(let y=waterTop;y<H;y+=2){
            c.globalAlpha=Math.min(1,(y-waterTop+2)/12);
            for(let i=firstTile;i<=firstTile+3;i++)c.drawImage(water,(this.mission||0)*512,Math.min(510,(y-waterTop)*4),512,8,i*tileWidth-drift,y,tileWidth,2);
          }
          c.globalAlpha=1;
          this.canvas.dataset.water=['coastal-inlet','icy-river','storm-lake'][this.mission||0];
        }
        if(!this.mission)for(let i=-1;i<4;i++){
          const x=i*260-((camera*.19+tick*.035)%260),index=((i+99)%3);
          const image=window.RainbowAssets.sceneryArt('decoration',index),width=index===2?120:145;
          if(image)c.drawImage(image,x,38+((i+6)%3)*65,width,width*image.height/image.width);
        }
        this.canvas.dataset.environment=['painted-coast','winter-valley','storm-city'][this.mission||0];return;
      }
      rect(c,0,0,W,H,'#4f9bd7');
      for(let i=-1;i<5;i++)cloud(c,i*210-(camera*.11%210),62+((i+5)%3)*39,1.05);
    }
    airstrip(scene,ground){
      const c=this.c,art=window.RainbowAssets?.sceneryArt?.('water');if(!art||!ground?.length)return;
      const home=scene[15],camera=scene[2],left=home-45,right=home+60;
      for(let wx=Math.max(left,camera);wx<Math.min(right,camera+320);wx+=.5){
        const i=Math.max(0,Math.min(ground.length-1,Math.floor(wx))),f=wx-Math.floor(wx);
        const height=ground[i]*(1-f)+ground[Math.min(ground.length-1,i+1)]*f;
        c.globalAlpha=Math.min(1,(wx-left)/5,(right-wx)/5)*.85;
        c.drawImage(art,(this.mission||0)*512+((wx-left)*5%508),700,3,160,(wx-camera)*2,(199-height)*2-1,1.1,5);
      }
      c.globalAlpha=1;this.canvas.dataset.airstrip='grass-field';
    }
    terrain(ground,camera) {
      const c=this.c,soil=window.RainbowAssets?.sceneryArt?.(this.mission?'materials':'soil');
      if(soil){
        // Clip a world-anchored painted texture to the actual mutable height
        // field. Nothing in this layer can alter native collision geometry.
        const top=x=>(199-ground[Math.max(0,Math.min(ground.length-1,x))])*2;
        c.save();c.beginPath();c.moveTo(0,top(0));
        for(let x=1;x<ground.length;x++)c.lineTo(x*2,top(x));
        c.lineTo(ground.length*2,H);c.lineTo(0,H);c.closePath();c.clip();
        const span=512,tileFirst=Math.floor(camera*2/span);
        for(let tile=tileFirst;tile*span-camera*2<ground.length*2;tile++)for(let row=0;row<1;row++){
          const x=tile*span-camera*2,y=0;
          c.save();c.translate(x+((tile+row)&1?span:0),y);if((tile+row)&1)c.scale(-1,1);
          if(this.mission)c.drawImage(soil,this.mission===2?768:0,0,768,512,0,0,span,H);
          else c.drawImage(soil,0,0,span,H);c.restore();
        }
        for(let cell=Math.floor(camera/150)-1;cell<(camera+ground.length)/150+1;cell++){
          const seed=Math.imul(cell+131,92821)>>>0,wx=cell*150+20+seed%65,i=Math.floor(wx-camera);
          if(i<0||i>=ground.length)continue;
          const fossil=window.RainbowAssets?.buriedRelic?.(this.mission||0,seed%8)||window.RainbowAssets?.worldDetail?.(seed%4),w=48+seed%27;
          const origin=this.geologyGround?.[Math.max(0,Math.min(this.geologyGround.length-1,wx))]??ground[i];
          const y=Math.min(H-42,(199-origin)*2+27+(seed>>>3)%80);
          if(fossil){c.save();c.globalAlpha=.8;c.drawImage(fossil,i*2-w/2,y,w,w*fossil.height/fossil.width);c.restore();}
        }
        c.restore();
        // Warp the painted sod strip column by column, using one world-fixed
        // texture coordinate and the same continuous native surface as soil.
        const turf=window.RainbowAssets?.sceneryArt?.(this.mission?'materials':'turf');
        if(turf)for(let x=0;x<ground.length*2;x++){
          const i=Math.floor(x/2),f=x/2-i,y=top(i)*(1-f)+top(i+1)*f;
          const sx=((camera*2+x)%512+512)%512*3;
          if(this.mission)c.drawImage(turf,(this.mission===2?768:0)+(sx%768),528,3,180,x,y-2,1,10);
          else c.drawImage(turf,sx,400,3,320,x,y-4.5,1,16);
        }
        const first=Math.ceil(camera/37)*37;
        for(let wx=first;wx<camera+ground.length;wx+=37){
          const i=Math.floor(wx-camera);if(i<3||i>=ground.length-3||Math.abs(ground[i-2]-ground[i+2])>4)continue;
          const seed=Math.abs(Math.imul(wx,31)),image=this.mission?window.RainbowAssets?.worldDetail?.(this.mission===1?6:7):window.RainbowAssets.sceneryArt('decoration',3+seed%3),w=this.mission?22:seed%3===1?22:18;
          if(image)c.drawImage(image,i*2-w/2,top(i)-w*image.height/image.width+1,w,w*image.height/image.width);
        }
        return;
      }
      for(let x=0;x<ground.length;x++) {
        const y=Math.max(0,(199-ground[x])*2), wx=(camera+x)*2;
        rect(c,x*2,y,2,H-y,P.soil);
        for(let dy=13;dy<H-y;dy+=13) {
          const hash=(Math.floor(wx/2)*17+Math.floor(dy/13)*31)%37;
          if(hash<3)rect(c,x*2,y+dy,2,2,hash===0?P.sand:P.soilShade);
        }
        const stratum=(Math.floor(wx/42)*7)%18;
        for(let sy=350+stratum;sy<H;sy+=29)if(sy>y+14)rect(c,x*2,sy,2,2,'#c39760');
        for(let sy=319;sy<H;sy+=32) {
          const tile=Math.floor(wx/34),lx=wx%34;
          if(sy>y+17 && (tile+Math.floor(sy/32))%5===0 && lx>=9&&lx<20) {
            rect(c,x*2,sy+(lx<12?2:0),2,4,P.rock);
            if(lx>11&&lx<18)rect(c,x*2,sy,2,1,P.sand);
          }
        }
        rect(c,x*2,y,2,2,P.outline);
        rect(c,x*2,y+2,2,3,P.grass);
        rect(c,x*2,y+5,2,3,P.green);
        rect(c,x*2,y+8,2,2,P.grassShade);
        if((camera+x)%13===0)rect(c,x*2,y+11,2,3,P.rock);
      }
    }
    terrainWorld(ground,camera,tick) {
      const anchor=Math.floor(camera/32)*32-32;
      let hash=0;
      for(let i=0;i<384;i++)hash=(hash*31+ground[Math.max(0,Math.min(ground.length-1,anchor+i))])|0;
      if(!this.terrainCache||this.terrainCache.anchor!==anchor||this.terrainCache.hash!==hash) {
        const layer=this.terrainCache?.canvas||document.createElement('canvas');layer.width=768*DETAIL;layer.height=H*DETAIL;
        const c=layer.getContext('2d');c.setTransform(DETAIL,0,0,DETAIL,0,0);
        const visible=Int32Array.from({length:384},(_,i)=>ground[Math.max(0,Math.min(ground.length-1,anchor+i))]);
        const old=this.c;this.c=c;this.terrain(visible,anchor);this.c=old;
        this.terrainCache={canvas:layer,anchor,hash};
      }
      this.c.drawImage(this.terrainCache.canvas,(anchor-camera)*2,0,768,H);
    }
    drawTrail(camera,time,scene) {
      if(!this.smokeBrush) {
        const brush=document.createElement('canvas');brush.width=brush.height=64;
        const c=brush.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);
        g.addColorStop(0,'rgba(245,255,250,.8)');g.addColorStop(.45,'rgba(224,247,244,.45)');g.addColorStop(1,'rgba(224,247,244,0)');
        c.fillStyle=g;c.fillRect(0,0,64,64);this.smokeBrush=brush;
      }
      const points=this.trail.filter(p=>p.tick<=time);
      if(!scene[17]&&[1,6,8,9].includes(scene[13]))points.push({x:scene[4]+8,y:scene[5]-8,tick:time});
      const c=this.c;c.save();
      for(let i=1;i<points.length;i++) {
        const a=points[i-1],b=points[i],distance=Math.hypot(b.x-a.x,b.y-a.y)*2,steps=Math.max(1,Math.ceil(distance/2));
        if(distance>70)continue;
        for(let j=0;j<=steps;j++) {
          const t=j/steps,age=Math.max(0,time-(a.tick+(b.tick-a.tick)*t)),r=1.25+age*.12;
          const x=(a.x+(b.x-a.x)*t-camera)*2,y=(199-(a.y+(b.y-a.y)*t))*2-age*.15;
          c.globalAlpha=Math.max(0,1-age/35)*.48;c.drawImage(this.smokeBrush,x-r,y-r,r*2,r*2);
        }
      }
      c.restore();
    }
    landmark(scene) {
      const left=(scene[21]-scene[2])*2,right=left+260;
      const visible=left<W && right>0;
      if(visible){this.c.save();this.c.globalAlpha=.32;rainbow(this.c,left,(199-scene[22])*2+10,right,(199-scene[23])*2+10);this.c.restore();}
      this.canvas.dataset.rainbow=String(visible);
      return visible;
    }
    readEffects(data,tick) {
      if(!data||data[0]!==1)return;
      for(let i=0;i<32;i++) {
        const at=4+i*6,id=data[at];
        if(id<=this.lastEffectId||id===0)continue;
        const age=tick-data[at+1];
        if(age>=0&&age<(data[at+2]===10?36:data[at+2]===6?28:data[at+2]===9?10:16))this.effects.push({id,tick:data[at+1],type:data[at+2],x:data[at+3],y:data[at+4],size:data[at+5]});
      }
      this.lastEffectId=data[1];
      this.effects=this.effects.filter(e=>tick-e.tick>=0&&tick-e.tick<(e.type===10?36:e.type===6?28:e.type===9?10:16)).slice(-32);
    }
    drawEffects(camera,tick,ground) {
      const c=this.c;delete this.canvas.dataset.explosionFrame;let debris=0;
      for(const e of this.effects) {
        const age=Math.max(0,tick-e.tick),x=(e.x-camera)*2,y=(199-e.y)*2;
        if(x < -100 || x>W+100)continue;
        if(e.type===10){debris+=this.drawDebris(e,camera,age,ground,192-debris);continue;}
        if(e.type===9){if(this.smokeBrush&&age<10){c.save();c.globalAlpha=(1-age/10)*.5;const w=8+age*2;c.drawImage(this.smokeBrush,x-w/2,y-w/2-age,w,w);c.restore();}continue;}
        if(e.type===7||e.type===8)continue;
        if(e.type===2) {
          const count=e.size>1?28:12;
          for(let i=0;i<count;i++) {
            const a=i*2.399+e.id,spread=3+age*(e.size>1?2:1.4),px=x+Math.cos(a)*spread,py=y+Math.sin(a)*spread*.55+age*age*.13;
            c.save();c.translate(px,py);c.rotate(a+age*.16);
            c.fillStyle=i%4===0?P.darkSmoke:P.cream;c.beginPath();c.ellipse(0,0,i%3===0?3:2,.7,0,0,Math.PI*2);c.fill();
            c.fillStyle=P.teal;c.fillRect(-2,0,4,.3);c.restore();
          }
          continue;
        }
        if(e.type===5) {
          if(age<2){const d=Math.sign(e.size)||1;polygon(c,[[x-d*5,y],[x+d*12,y-3],[x+d*5,y-10],[x+d*17,y-7],[x+d*8,y+3]],P.gold);rect(c,x+(d>0?3:-9),y-5,6,4,P.cream);}
          continue;
        }
        if(e.type===1||e.type===6){
          const image=window.RainbowAssets?.explosionPose?.(Math.min(7,Math.floor(age/2)));
          if(image){
            if(age<16){const scale=e.type===6?.9:Math.min(1.05,.48+Math.abs(e.size)*.14);c.save();c.globalAlpha=age>13?Math.max(0,(16-age)/3):1;c.drawImage(image,x-48*scale,y-64*scale,96*scale,128*scale);c.restore();this.canvas.dataset.explosionFrame=String(Math.min(7,Math.floor(age/2)));}
            continue;
          }
        }
        if(e.type!==1)continue;
        if(age<7)ring(c,x,y,8+age*4+e.size*2,age<3?P.gold:P.smoke);
        const r=age<3?8+e.size*4+age*4:Math.max(0,18+e.size*4-(age-2)*6);
        if(r>0) {
          const points=[];
          for(let i=0;i<16;i++) {
            const a=i*Math.PI/8,rr=r*(i%2?.58:1);
            points.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);
          }
          polygon(c,points,P.red);ring(c,x,y,Math.max(2,r-5),P.yellow);
          rect(c,x-3,y-3,7,7,P.cream);
        }
        for(let i=0;i<9;i++) {
          const a=i*2.399+e.id,spread=(2+e.size)*age;
          const px=x+Math.cos(a)*spread,py=y+Math.sin(a)*spread+age*age*.18;
          rect(c,px,py,age<8?3:2,2,age<5?P.yellow:age<10?P.soilShade:P.darkSmoke);
        }
      }
      this.canvas.dataset.debris=String(debris);
    }
    drawDebris(event,camera,age,ground,budget){
      if(!window.RainbowAssets?.debrisPose||budget<=0)return 0;
      if(!event.fragments)event.fragments=Array.from({length:Math.min(34,Math.max(22,event.size))},(_,i)=>{
        const seed=Math.sin((event.id*137+i*73)*12.9898)*43758.5453,f=seed-Math.floor(seed);
        return {x:event.x*2+(f-.5)*event.size*1.4,y:(199-event.y)*2+(i%4-2)*2,vx:(f-.5)*8,vy:-5-(i%7)*1.3,spin:(f-.5)*.65,size:4+i%5,pose:i%8};
      });
      const c=this.c;c.save();c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.clip();
      let drawn=0;
      for(const f of event.fragments){
        if(drawn>=budget)break;
        const image=window.RainbowAssets.debrisPose(f.pose);if(!image)continue;
        let wx=f.x+f.vx*age,y=f.y+f.vy*age+.5*age*age;
        if(ground?.length&&!f.landed){const i=Math.max(0,Math.min(ground.length-1,Math.floor(wx/2))),floor=(199-ground[i])*2;if(age>2&&y>=floor-f.size/3)f.landed={x:wx,y:floor-f.size/3,angle:age*f.spin};}
        if(f.landed){wx=f.landed.x;y=f.landed.y;}
        c.save();c.globalAlpha=Math.min(1,(36-age)/10);c.translate(wx-camera*2,y);c.rotate(f.landed?f.landed.angle:age*f.spin);
        const h=f.size*image.height/image.width;c.drawImage(image,-f.size/2,-h/2,f.size,h);c.restore();drawn++;
      }
      c.restore();return drawn;
    }
    aim(scene,objects,ground) {
      delete this.canvas.dataset.aimX;delete this.canvas.dataset.aimY;
      if(!this.aimEnabled||!this.bombHeld||scene[17]||scene[8]<=0||![1,6,8,9].includes(scene[13]))return;
      const player=objects.find(r=>r[10]===1),hit=predictBomb(player,ground);
      if(!hit)return;
      const c=this.c,camera=scene[2],x=(hit.x-camera)*2,y=(199-hit.y)*2;
      if(x<12||x>W-12)return;
      this.canvas.dataset.aimX=String(hit.x);this.canvas.dataset.aimY=String(hit.y);
      for(let i=1;i<hit.path.length;i+=2) {
        const p=hit.path[i],px=(p.x-camera)*2,py=(199-p.y)*2;
        if(px>3&&px<W-3&&py>43&&py<y-9)rect(c,px,py,2,2,P.cloudDeep);
      }
      // A compact 21-pixel bracket, outlined on both sky and bright grass.
      for(const side of [-1,1]) {
        const left=x+(side<0?-10:5),edge=x+(side<0?-10:9);
        for(const top of [y-13,y-5]) {
          rect(c,left-1,top-1,8,4,P.ink);rect(c,left,top,6,2,P.cream);
        }
        rect(c,edge-1,y-14,4,12,P.ink);rect(c,edge,y-13,2,10,P.cream);
      }
      rect(c,x-4,y-9,9,4,P.ink);rect(c,x-1,y-12,3,10,P.ink);
      rect(c,x-3,y-8,7,2,P.gold);rect(c,x,y-11,1,8,P.gold);
      rect(c,x-2,y-1,5,2,P.ink);rect(c,x-1,y-1,3,1,P.gold);
    }
    sprite(record,heap) {
      const artwork=window.RainbowAssets?.sprite(record,heap,this.mission||0);
      if(artwork)return artwork;
      const [type,state,,,,,faction,w,h,ptr,,life,,,,orient]=record;
      const key=`${ptr}:${type}:${faction}:${w}:${h}:${state===3}:${orient}`;
      if(this.sprites.has(key))return this.sprites.get(key);
      if(w<1||h<1||w>256||h>256||ptr<0||ptr+w*h>heap.length)return null;
      const out=document.createElement('canvas'); out.width=w*2+2; out.height=h*2+2;
      const c=out.getContext('2d'); c.imageSmoothingEnabled=false;
      const data=heap.subarray(ptr,ptr+w*h);
      const friendly=faction===1;
      function color(value,x,y) {
        if(type===1) {
          if(state===3)return value===3?P.rock:P.darkSmoke;
          if(value===3)return P.cream;
          if(value===2)return friendly?P.gold:P.mint;
          return friendly?P.red:P.purple;
        }
        if(type===4) {
          if(state===3)return y<h/2?P.rock:P.soilShade;
          if(value===3)return P.cream;
          if(value===2)return friendly?P.mint:P.red;
          return y<h/2?(friendly?P.teal:P.redShade):P.sand;
        }
        if(type===2||type===10)return value===3?P.gold:P.ink;
        if(type===5)return value===3?P.cream:(value===2?P.yellow:P.red);
        if(type===7||type===8)return value===3?P.cream:P.outline;
        if(type===9)return value===3?P.cream:P.soilShade;
        if(type===12)return value===3?P.cream:(value===2?P.yellow:P.red);
        return value===3?P.cream:P.gold;
      }
      // Preserve the actual collision silhouette, then give its 2x pixels
      // separate highlight/shadow texels. No rotated-canvas antialiasing.
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[y*w+x]) {
        rect(c,x*2,y*2,4,4,P.outline);
      }
      for(let y=0;y<h;y++)for(let x=0;x<w;x++) {
        const v=data[y*w+x]; if(!v)continue;
        const base=color(v,x,y); rect(c,x*2+1,y*2+1,2,2,base);
        if(!data[(y-1)*w+x] && v!==3)rect(c,x*2+1,y*2+1,2,1,
          type===1?(v===2?P.cream:P.yellow):(type===4?P.pale:P.gold));
        if(type===4 && y>h/3 && ((x+y)%6===0))rect(c,x*2+1,y*2+2,2,1,P.soilShade);
      }
      if(this.sprites.size>600)this.sprites.clear();
      this.sprites.set(key,out); return out;
    }
    foundation(r,camera,ground){
      if(!ground?.length||r[0]!==4||[3,4,5,6].includes(r[15]))return;
      const c=this.c,left=r[2],base=r[3]-r[8],sx=(left-camera)*2,top=(199-base)*2,width=r[7]*2;
      const stone=window.RainbowAssets?.sceneryArt?.('materials');
      if(stone){
        let bottom=top;c.save();c.beginPath();c.moveTo(sx,top);c.lineTo(sx+width,top);
        for(let x=r[7];x>=0;x--){const y=(199-ground[Math.max(0,Math.min(ground.length-1,Math.round(left+x)))])*2;bottom=Math.max(bottom,y);c.lineTo(sx+x*2,Math.max(top,y));}
        c.closePath();c.clip();
        if(bottom>top)c.drawImage(stone,768,0,768,512,sx,top,width,bottom-top+1);
        c.restore();rect(c,sx,top,width,1.3,'#8b8571');return;
      }
      for(let x=0;x<r[7];x++){
        const g=ground[Math.max(0,Math.min(ground.length-1,Math.round(left+x)))],bottom=(199-g)*2;
        if(bottom<=top)continue;
        rect(c,sx+x*2,top,2,bottom-top+1,'#a89470');
        for(let y=top+4;y<bottom;y+=4)rect(c,sx+x*2,y,2,.7,'#7d765e');
        if(x%4===0)rect(c,sx+x*2,top,.7,bottom-top,'#d0bc91');
      }
      rect(c,sx,top,width,1,'#ddd3a5');
    }
    teamMark(r,camera,artwork){
      if(r[0]!==4||r[1]!==5||!r[6]||r[15]===6)return;
      const c=this.c,x=(r[2]-camera)*2-9,base=(199-r[3]+r[8])*2;
      const building=[0,1,2,7].includes(r[15]),style=r[15]===0?0:r[15]===1?2:1;
      const fixture=window.RainbowAssets?.mountedFlag?.(style,r[6]);
      if(fixture){
        const b=artwork?.artBounds||{x:1,y:1,width:r[7]*2,height:r[8]*2},dw=artwork?.worldWidth??r[7]*2+2,dh=artwork?.worldHeight??r[8]*2+2;
        const left=(r[2]-camera)*2+r[7]-dw/2+b.x,top=(199-r[3])*2+r[8]-dh/2+b.y;
        const width=building?Math.max(10,Math.min(15,b.width*.24)):9,height=width*fixture.height/fixture.width;
        const anchor=window.RainbowAssets.flagAnchor?.(artwork,style,building),mount=fixture.mountAnchor||{x:.18,y:1};
        const originX=(r[2]-camera)*2+r[7]-dw/2,originY=(199-r[3])*2+r[8]-dh/2;
        const ax=anchor?.x??b.x+b.width*.28,ay=anchor?.y??b.y+b.height*.6;
        const fx=originX+ax-mount.x*width,fy=originY+ay-mount.y*height;
        c.drawImage(fixture,fx,fy,width,height);this.canvas.dataset.flagMount='surface-anchored';return;
      }
      const flag=window.RainbowAssets?.worldDetail?.(r[6]===1?4:5);
      if(flag)c.drawImage(flag,x,base-18,18,18*flag.height/flag.width);
      else{rect(c,x,base-16,1,16,P.ink);rect(c,x+1,base-16,10,6,r[6]===1?'#15386b':'#15151d');}

    }
    observeAircraft(objects,time,tick,ground) {
      const active=new Set();
      for(const r of objects)if(r[0]===1){
        const id=r[16]||r[2],old=this.airplanes.get(id);active.add(id);
        const trail=old?.trail||[];
        if((r[1]===4||r[1]===3)&&old?.tick!==tick)trail.push({x:r[2]+r[7]/2,y:r[3]-r[8]/2,tick});
        this.airplanes.set(id,{state:r[1],tick,trail:trail.filter(p=>tick-p.tick<28).slice(-28)});
      }
      for(const id of this.airplanes.keys())if(!active.has(id))this.airplanes.delete(id);

    }
    drawPlaneFire(r,camera,time) {
      if(![3,4].includes(r[1]))return;
      if(!this.darkSmokeBrush){
        const b=document.createElement('canvas');b.width=b.height=64;const c=b.getContext('2d'),g=c.createRadialGradient(32,32,1,32,32,31);
        g.addColorStop(0,'rgba(52,62,76,.8)');g.addColorStop(.55,'rgba(90,105,116,.5)');g.addColorStop(1,'rgba(90,105,116,0)');c.fillStyle=g;c.fillRect(0,0,64,64);this.darkSmokeBrush=b;
      }
      const c=this.c,id=r[16]||r[2],trail=this.airplanes.get(id)?.trail||[];
      for(const p of trail){const age=Math.max(0,time-p.tick),size=5+age*.7;c.save();c.globalAlpha=Math.max(0,.8-age/40);c.drawImage(this.darkSmokeBrush,(p.x-camera)*2-size,(199-p.y)*2-size-age*1.6,size*2,size*2);c.restore();}
      const x=(r[2]-camera)*2+r[7],y=(199-r[3])*2+r[8];
      for(let i=0;i<5;i++){
        const dx=(i-2)*2.6,h=5+(Math.sin(time*2.7+i*1.8)+1)*5;
        polygon(c,[[x+dx-3,y+3],[x+dx-2,y-h],[x+dx+1,y-h*.55],[x+dx+3,y-h-2],[x+dx+4,y+2]],P.red);
        polygon(c,[[x+dx-1,y+2],[x+dx,y-h*.6],[x+dx+2,y+1]],P.gold);
      }
    }
    drawPilots(objects,camera,time,ground){
      const c=this.c;let count=0;
      for(const r of objects)if(r[15]===21){
        count++;const phase=r[5],air=phase<2,shooting=(r[14]&2)!==0;
        const frame=phase===4?7:shooting?5:phase===3?[1,2,3,4][Math.floor(time/2)%4]:0;
        const swing=(time+(r[16]%17))/4;
        const image=phase===1?window.RainbowAssets?.parachutePose(Math.floor(swing),(r[14]&1)!==0):air?window.RainbowAssets?.pilotPose(0):window.RainbowAssets?.pilotFrame(frame,r[6]);if(!image)continue;
        const x=(r[2]-camera)*2+r[7],w=image.worldWidth,h=image.worldHeight;
        const footX=Math.max(0,Math.min((ground?.length||1)-1,Math.floor(r[2]+r[7]/2)));
        // Walking sprites follow the rendered terrain, including slopes, instead
        // of interpolating their feet through the previous tick's altitude.
        const y=!air&&phase!==4&&ground?.length?(199-ground[footX])*2+2:(199-r[3]+r[8])*2;
        if(x< -30||x>W+30)continue;
        c.save();c.translate(x,y);if(r[4]===8)c.scale(-1,1);
        if(phase===1){c.translate(Math.sin(swing*Math.PI/2)*1.2,0);c.rotate(Math.sin(swing*Math.PI/2)*.045);}
        else if(air)c.rotate(Math.sin(time*.45+r[16])*.14);
        c.drawImage(image,-w/2,-h,w,h);
        if(!air&&phase!==4)rect(c,-.5,-9,2,1.2,r[6]===1?P.mint:P.red);
        if(shooting){rect(c,9,-12,5,2,P.gold);rect(c,12,-13,2,4,P.cream);}
        c.restore();
      }
      this.canvas.dataset.parachutes=String(objects.filter(r=>r[15]===21&&r[5]<2).length);
      this.canvas.dataset.pilots=String(count);
    }
    drawDeparture(scene,time,ground){
      const c=this.c;
      if(scene[12]!==1){this.departure=null;delete this.canvas.dataset.departure;return;}
      if(!this.departure)this.departure={start:time,x:(scene[4]-scene[2])*2+16,y:(199-scene[5])*2+16,camera:scene[2]};
      const age=Math.max(0,time-this.departure.start),t=Math.max(0,Math.min(1,age/69)),ease=1-Math.pow(1-t,2);
      const gx=Math.max(0,Math.min((ground?.length||1)-1,Math.round(this.departure.camera+W*.34)));
      const horizon=Math.max(60,Math.min(H*.6,ground?.length?(199-ground[gx])*2-24:H*.6));
      const x=this.departure.x+(W*.68-this.departure.x)*ease,y=this.departure.y+(horizon-this.departure.y)*ease;
      const image=window.RainbowAssets?.departurePose(t<.2?0:t>.8?3:t>.55?2:1),w=68*Math.pow(1-t,1.4)+1.5;
      if(image){c.save();c.globalAlpha=Math.min(1,(1-t)*8);c.drawImage(image,x-w/2,y-w/3,w,w*2/3);c.restore();}
      this.flightBadge('MISSION COMPLETE','LEVEL '+(scene[18]+1)+' CLEARED',8);
      this.canvas.dataset.departure=t.toFixed(3);
    }
    drawBoarding(scene,objects,camera,ground){
      delete this.canvas.dataset.boarding;
      if(!this.readyLevel||!ground?.length||!window.RainbowAssets?.pilotFrame)return;
      const t=Math.max(0,Math.min(1,(this.readyProgress||0)*2.5/.9)),plane=objects.find(r=>r[0]===1&&r[10]);if(!plane)return;
      const hangar=objects.filter(r=>r[0]===4&&r[15]===0&&r[6]===plane[6]).sort((a,b)=>Math.abs(a[2]-plane[2])-Math.abs(b[2]-plane[2]))[0];
      const end=plane[2]+plane[7]/2,start=hangar?hangar[2]+hangar[7]*.6:end-28,run=Math.min(1,t/.78),wx=start+(end-start)*run;
      const frame=run<1?[1,2,3,4][Math.floor(t*18)%4]:6,image=window.RainbowAssets.pilotFrame(frame,plane[6]);if(!image)return;
      const w=image.worldWidth,h=image.worldHeight,foot=ground[Math.max(0,Math.min(ground.length-1,Math.floor(wx)))];
      const jump=run<1?0:Math.sin((t-.78)/.22*Math.PI/2)*12;
      this.c.save();this.c.translate((wx-camera)*2,(199-foot)*2+2-jump);if(end<start)this.c.scale(-1,1);
      this.c.globalAlpha=t>.92?Math.max(0,(1-t)/.08):1;this.c.drawImage(image,-w/2,-h,w,h);this.c.restore();
      this.canvas.dataset.boarding=String(Math.round(t*100));
    }
    drawBomb(r,objects,camera,time,heap){
      const id=r[16]||r[9]||r[2];let birth=this.bombs.get(id);
      if(!birth){
        const planes=objects.filter(p=>p[0]===1&&(r[17]!==1||p[10]));
        const owner=planes.sort((a,b)=>Math.hypot(a[2]-r[2],a[3]-r[3])-Math.hypot(b[2]-r[2],b[3]-r[3]))[0];
        birth={time,angle:owner?Math.atan2(-owner[13],owner[12]||.001):Math.atan2(-r[13],r[12]||.001)};this.bombs.set(id,birth);
      }
      const goal=Math.atan2(-r[13],r[12]||.001),delta=Math.atan2(Math.sin(goal-birth.angle),Math.cos(goal-birth.angle));
      const t=Math.max(0,Math.min(1,(time-birth.time)/4)),angle=birth.angle+delta*(t*t*(3-2*t)),image=this.sprite(r,heap);if(!image)return;
      const w=image.worldWidth??r[7]*2+2,h=image.worldHeight??r[8]*2+2;
      const c=this.c;c.save();c.translate((r[2]-camera)*2+r[7],(199-r[3])*2+r[8]);c.rotate(angle-Math.PI/2);c.drawImage(image,-w/2,-h/2,w,h);c.restore();
      this.canvas.dataset.bombHeading=String(angle);
    }
    flightNotice(text,color=P.gold){
      const c=this.c,badge=window.RainbowAssets?.interfaceArt?.('badge'),w=220,h=w*600/1512;
      c.save();c.translate(0,-H);
      if(badge)c.drawImage(badge,8,2,w,h);
      hudType(c,text,8+w/2,2+h*.54,{size:8,color,align:'center',width:108});c.restore();
      this.canvas.dataset.notification=text;this.canvas.dataset.notificationArea='flight';
    }
    flightBadge(title,subtitle,y=45){
      const c=this.c,badge=window.RainbowAssets?.interfaceArt?.('badge'),w=340,h=w*600/1512;
      if(badge)c.drawImage(badge,(W-w)/2,y,w,h);
      hudType(c,title,W/2,y+h*.48,{size:14,color:P.cream,align:'center',serif:true,width:155});
      hudType(c,subtitle,W/2,y+h*.615,{size:8.5,color:P.gold,align:'center',width:156});
    }
    weather(camera,time){
      delete this.canvas.dataset.lightning;
      if(this.mission!==2)return;
      const c=this.c;c.save();c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.clip();
      c.globalAlpha=.12;rect(c,0,0,W,H,'#122440');c.globalAlpha=.35;
      for(let i=0;i<75;i++){
        const x=((i*97-camera*.45-time*9)%700+700)%700-30,y=((i*53+time*23)%420+420)%420-10;
        polygon(c,[[x,y],[x+1,y],[x-5,y+13],[x-6,y+13]],'#a6c5df');
      }
      const flash=((time%150)+150)%150;
      if(flash>=70&&flash<74){
        const cycle=Math.floor(time/150),x=100+(cycle*137)%430;
        c.globalAlpha=flash<71?.24:flash<72?.08:flash<72.8?.30:.06;rect(c,0,0,W,H,'#d8e6ff');
        c.globalAlpha=flash<71.2||flash>=72&&flash<73?.85:.25;
        const points=[[x,0],[x-14,35],[x+6,33],[x-24,79],[x-5,72],[x-42,134]];
        for(let i=1;i<points.length;i++){const [a,b]=[points[i-1],points[i]];polygon(c,[[a[0]-1.5,a[1]],[a[0]+1.5,a[1]],[b[0]+.5,b[1]],[b[0]-.5,b[1]]],'#f1f6ff');}
        polygon(c,[[x-17,64],[x+8,85],[x+1,82],[x+24,118],[x+11,96]],'#dcecff');
        this.canvas.dataset.lightning='true';
      }else delete this.canvas.dataset.lightning;
      c.restore();this.canvas.dataset.weather='rain-thunder';
    }
    drawReady(){
      delete this.canvas.dataset.takeoffHint;
      if(this.readyLevel){
        this.flightBadge('READY PLAYER 1','LEVEL '+this.readyLevel+'   '+(this.readyLives??5)+' LIVES LEFT',45);
        this.canvas.dataset.readyLevel=String(this.readyLevel);this.canvas.dataset.readyLives=String(this.readyLives??5);
      }else if(this.takeoffHint){
        this.flightBadge('ADD THROTTLE','X / RIGHT · UP AT 60 MPH',80);
        this.canvas.dataset.takeoffHint='true';
      }
    }
    drawScene(scene,heap,trainer=false,effects=null,ground=null) {
      if(scene[0]!==3||scene[3]===0)return false;
      const c=this.c,tick=scene[1],time=scene[26]||tick;
      const mission=((Math.floor(scene[18])%3)+3)%3;
      if(this.mission!==mission||tick<this.lastTick){this.mission=mission;this.terrainCache=null;this.geologyGround=ground?.slice();this.instrumentSpeed=0;this.instrumentAt=time;}
      delete this.canvas.dataset.weather;
      if(scene[12]!==1)this.departure=null;
      const camera=this.departure?.camera??scene[2];
      if(this.departure){scene=scene.slice();scene[2]=camera;}
      if(tick<this.lastTick){this.effects=[];this.lastEffectId=effects?.[1]||0;this.cowDeaths.clear();this.airplanes.clear();this.bombs.clear();this.bailouts=[];}
      this.readEffects(effects,tick);
      if(tick!==this.lastTick) {
        const last=this.trail.at(-1);
        if(tick<this.lastTick || last&&Math.abs(last.x-scene[4])>32)this.trail=[];
        if([1,6,8,9].includes(scene[13])&&!scene[17]&&scene[11]>1) {
          this.trail.push({x:scene[4]+8,y:scene[5]-8,tick});
        }
        this.trail=this.trail.filter(p=>tick-p.tick<35).slice(-35);
        this.lastTick=tick;
      }
      this.background(camera,time);
      if(!this.mission)this.landmark(scene);else this.canvas.dataset.rainbow='false';
      this.drawTrail(camera,time,scene);
      const objects=[];
      for(let i=0;i<scene[14];i++) {
        const r=scene.subarray(HEADER+GROUND+i*STRIDE,HEADER+GROUND+(i+1)*STRIDE);objects.push(r);
        if(r[0]===9&&r[1]!==5&&!this.cowDeaths.has(r[16]||r[2]))this.cowDeaths.set(r[16]||r[2],tick);
      }
      const activeBombs=new Set(objects.filter(r=>r[0]===2).map(r=>r[16]||r[9]||r[2]));
      for(const id of this.bombs.keys())if(!activeBombs.has(id))this.bombs.delete(id);
      delete this.canvas.dataset.bombHeading;delete this.canvas.dataset.wreckRoll;
      this.observeAircraft(objects,time,tick,ground);
      for(const r of objects)this.foundation(r,camera,ground);
      for(const r of objects) {
        const [type,,x,y,,,,w,h]=r, sx=(x-camera)*2,sy=(199-y)*2;
        if(sx < -w*2-3||sx>W||sy>H||sy < -h*2-3)continue;
        if(r[15]===21||(type===1&&r[10]&&scene[12]===1))continue;
        if(type===4&&r[15]===6&&window.RainbowAssets?.worldDetail){
          const flag=window.RainbowAssets.mountedFlag?.(0,r[6])||window.RainbowAssets.worldDetail(r[6]===1?4:5);if(flag)c.drawImage(flag,sx,sy,14,14*flag.height/flag.width);continue;
        }
        if(type===1&&r[1]===4&&window.RainbowAssets?.wreckPose){
          const frame=Math.floor((time+(r[16]%7))/1.8)%4,image=window.RainbowAssets.wreckPose(frame,r[6]);
          if(image){c.save();c.translate(sx+w,sy+h);c.rotate(Math.atan2(-r[13],r[12]||.001));c.drawImage(image,-image.worldWidth/2,-image.worldHeight/2,image.worldWidth,image.worldHeight);c.restore();this.drawPlaneFire(r,camera,time);this.canvas.dataset.wreckRoll=String(frame);continue;}
        }
        if(type===2){this.drawBomb(r,objects,camera,time,heap);continue;}
        if(type===3) {
          if(r[17]>=100) {
            const angle=Math.atan2(-r[13],r[12]),dx=Math.cos(angle),dy=Math.sin(angle);
            c.save();c.translate(sx,sy);c.rotate(angle);
            c.fillStyle='#344552';c.beginPath();c.ellipse(0,0,4,2.1,0,0,Math.PI*2);c.fill();
            c.fillStyle='#c6d9da';c.fillRect(0,-1.5,2.5,1);c.fillStyle='#f9c46c';c.fillRect(-4,-1,1.5,2);c.restore();
            c.globalAlpha=.35;for(let k=1;k<4;k++)c.drawImage(this.smokeBrush,sx-dx*k*4-2,sy-dy*k*4-2,4+k,4+k);c.globalAlpha=1;
            continue;
          }
          const speed=Math.hypot(r[12],r[13])||1,dx=r[12]/speed,dy=-r[13]/speed,len=8;
          polygon(c,[[sx-dx*len-dy,sy-dy*len+dx],[sx+dx*2-dy,sy+dy*2+dx],
            [sx+dx*2+dy,sy+dy*2-dx],[sx-dx*len+dy,sy-dy*len-dx]],P.yellow);
          rect(c,sx-1,sy-1,3,2,P.cream);
          if(r[11]>=9) {
            const mx=sx-r[12]*2,my=sy+r[13]*2;
            polygon(c,[[mx-dx*2,my-dy*2],[mx+dy*3,my-dx*3],[mx+dx*8,my+dy*8],
              [mx-dy*3,my+dx*3]],P.red);
            rect(c,mx-1,my-1,4,3,P.gold);rect(c,mx,my,2,1,P.white);
          }
          continue;
        }
        if(type===6) {
          const age=Math.max(0,10-r[11]),size=4+age*.75,brush=this.darkSmokeBrush||this.smokeBrush;
          c.save();c.globalAlpha=Math.max(0,.5-age*.035);if(brush)c.drawImage(brush,sx-size/2+Math.sin(time*.3+x)*1.2,sy-size/2-age*.25,size,size);c.restore();
          this.canvas.dataset.smokeStyle='soft-puffs';continue;
        }
        if(type===5) {if(window.RainbowAssets?.loaded&&window.RainbowAssets?.explosionPose)continue;rect(c,sx-2,sy,4,2,P.redShade);rect(c,sx,sy-1,2,3,P.yellow);rect(c,sx+1,sy,1,1,P.cream);continue;}
        if(type===9&&r[1]!==5&&window.RainbowAssets?.loaded) {
          const age=Math.max(0,time-this.cowDeaths.get(r[16]||r[2])),pose=window.RainbowAssets.cowPose(Math.min(3,Math.floor(age/2)));
          const g=ground?.[Math.max(0,Math.min(ground.length-1,Math.floor(x+8)))]??199-(sy+h*2)/2;
          if(pose)c.drawImage(pose,sx+w-pose.width/(DETAIL*2),(199-g)*2-pose.height/DETAIL,pose.width/DETAIL,pose.height/DETAIL);
          continue;
        }
        let visualRecord=r,groundBlend=0,groundFoot=null;
        if(type===1&&r[1]===1&&r[10]===1&&ground?.length){
          const floor=ground[Math.max(0,Math.min(ground.length-1,Math.round(r[2]+w/2)))];
          if(r[3]-floor<=18&&Math.abs(r[13])<.5){groundFoot=(199-floor)*2;groundBlend=scene[17]?1:Math.max(0,1-scene[11]/6);visualRecord=Float64Array.from(r);visualRecord[4]+=(r[5]?-.67:.67)*groundBlend;}
        }
        if(type===1&&r[1]===4) {
          visualRecord=Float64Array.from(r);
          visualRecord[4]=(Math.atan2(r[13],r[12])*8/Math.PI+16)%16;
        }
        const sprite=this.sprite(visualRecord,heap);
        if(sprite){
          const dw=sprite.worldWidth??w*2+2,dh=sprite.worldHeight??h*2+2;
          if(type===4&&[3,4,5,20].includes(r[15])&&ground?.length){
            const l=Math.max(0,Math.min(ground.length-1,Math.round(x))),right=Math.min(ground.length-1,l+w-1);
            const slope=Math.atan2(-(ground[right]-ground[l]),w-1);
            const shot=this.effects.find(e=>e.type===5&&Math.abs(e.x-x-w/2)<20&&tick-e.tick<2),kick=shot?Math.max(0,2-(time-shot.tick)*1.5):0;
            c.save();c.translate(sx+w,sy+h*2);c.rotate(slope*(r[15]===20?.35:1));
            if(r[15]===3&&r[4]===8)c.scale(-1,1);
            c.drawImage(sprite,-dw/2-kick,-dh+1,dw,dh);c.restore();
          }else c.drawImage(sprite,sx+w-dw/2,groundFoot!==null&&sprite.contactY?groundFoot-sprite.contactY:sy+h-dh/2+groundBlend*3.2,dw,dh);
        }
        if(type===4){this.teamMark(r,camera,sprite);if(r[11]>0&&r[11]<=12&&[0,1,2,7].includes(r[15])&&this.smokeBrush){c.save();c.globalAlpha=.35;for(let p=0;p<3;p++){const t=(time+p*4)%16,s=5+t*.7;c.drawImage(this.smokeBrush,sx+w-s/2+Math.sin(t*.4)*2,sy-t*2-s/2,s,s);}c.restore();}}
        if(type===1)this.drawPlaneFire(r,camera,time);
        if(type===1 && r[10]===0 && r[1]!==3) {
          if(r[15]!==22) {rect(c,sx+w-1,sy-6,3,2,P.redShade);rect(c,sx+w,sy-7,1,4,P.redShade);}
        }
      }
      if(ground?.length)this.terrainWorld(ground,camera,tick);
      else this.terrain(scene.subarray(HEADER,HEADER+GROUND),camera);
      this.airstrip(scene,ground);
      this.aim(scene,objects,ground);
      const aimVisible=this.canvas.dataset.aimX!==undefined;
      if(aimVisible&&!this.aimVisible)this.aimActivations++;
      this.aimVisible=aimVisible;
      this.canvas.dataset.aimActivations=String(this.aimActivations);
      this.drawEffects(camera,time,ground);
      this.drawPilots(objects,camera,time,ground);
      this.weather(camera,time);
      this.drawDeparture(scene,time,ground);
      this.drawBoarding(scene,objects,camera,ground);
      delete this.canvas.dataset.readyLevel;this.drawReady();
      // Native low-altitude collision geometry is preserved all the way down
      // to the original bottom edge; the information strip lives below the world.
      this.hud(scene,objects,trainer,ground);
      this.canvas.dataset.renderer='rainbow';this.canvas.dataset.lettering='original-engraved';
      this.canvas.dataset.artwork=window.RainbowAssets?.loaded?'amiga':'native';
      this.canvas.dataset.tick=String(tick);
      this.canvas.dataset.objects=String(objects.length);
      const buildings=objects.filter(r=>r[0]===4&&[0,1,2,7].includes(r[15]));
      this.canvas.dataset.buildingsIntact=String(buildings.filter(r=>r[1]===5&&(r[11]>12||r[11]<=0)).length);
      this.canvas.dataset.buildingsDamaged=String(buildings.filter(r=>r[1]===5&&r[11]>0&&r[11]<=12).length);
      this.canvas.dataset.buildingsRuined=String(buildings.filter(r=>r[1]!==5).length);
      this.canvas.dataset.bombsInAir=String(objects.filter(r=>r[0]===2).length);
      this.canvas.dataset.effects=String(this.effects.length);
      this.canvas.dataset.framebuffer=`${this.canvas.width}x${this.canvas.height}`;
      return true;
    }
    gauge(cx,cy,kind,value,max,label,unit){
      const c=this.c,climate=kind=>window.RainbowAssets?.cockpitLayer?.(kind),layer=kind=>window.RainbowAssets?.gaugeLayer?.(kind),ivory=this.mission!==2&&this.gaugeStyle==='ivory',fuel=kind==='fuel',radius=fuel?27:37;
      const face=(this.mission===2?climate('nightDial'):null)||layer(ivory?'ivory':'dark'),ink=ivory?'#392c23':this.mission===2?'#f6ce83':P.cream,diameter=radius*2.24,alt=kind==='altitude';
      if(face)c.drawImage(face,cx-diameter/2,cy-diameter/2,diameter,diameter);
      else {c.fillStyle=P.ink;c.beginPath();c.ellipse(cx,cy,radius,radius,0,0,Math.PI*2);c.fill();}
      c.save();if(this.mission===2){c.shadowColor='#f6a147';c.shadowBlur=1.3;}
      const steps=fuel?8:alt?50:20,major=alt?5:4,outer=fuel?19:27,labels=fuel?12.5:20;
      for(let i=0;i<=steps;i++){
        if(alt&&i===steps)continue;
        const a=((alt?-90:135)+i/steps*(alt?360:270))*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),inner=outer-(i%major===0?4:2);
        polygon(c,[[cx+dx*inner-dy*.25,cy+dy*inner+dx*.25],[cx+dx*outer-dy*.25,cy+dy*outer+dx*.25],[cx+dx*outer+dy*.25,cy+dy*outer-dx*.25],[cx+dx*inner+dy*.25,cy+dy*inner-dx*.25]],ink);
        if(i%major===0){const n=alt?i/5:Math.round(i/steps*max),t=fuel?(i===0?'E':i===steps?'F':'1/2'):String(n);hudType(c,t,cx+dx*labels,cy+dy*labels-3,{size:fuel?5.2:alt?5.7:5.7,color:ink,align:'center',serif:true});}
      }
      if(kind==='speed'){
        for(let n=0;n<52;n+=2){const a=(135+n/max*270)*Math.PI/180,b=(135+(n+2)/max*270)*Math.PI/180;polygon(c,[[cx+Math.cos(a)*29,cy+Math.sin(a)*29],[cx+Math.cos(b)*29,cy+Math.sin(b)*29],[cx+Math.cos(b)*30.5,cy+Math.sin(b)*30.5],[cx+Math.cos(a)*30.5,cy+Math.sin(a)*30.5]],'#ba6857');}
        const a=(135+60/max*270)*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a);polygon(c,[[cx+dx*26,cy+dy*26],[cx+dx*32-dy*2,cy+dy*32+dx*2],[cx+dx*32+dy*2,cy+dy*32-dx*2]],'#80bca7');
        hudType(c,'VS 52 · TO 60',cx,cy+16,{size:3.8,color:ink,align:'center',width:44});this.canvas.dataset.speedMarks='stall-52-takeoff-60';
      }
      hudType(c,label,cx,cy-9,{size:fuel?5:6,color:ivory?'#725026':P.gold,align:'center',serif:true});if(unit)hudType(c,unit,cx,cy+8,{size:5.2,color:ink,align:'center',serif:true});
      const a=(alt?-90+((value%1000+1000)%1000)/1000*360:135+Math.max(0,Math.min(1,value/max))*270)*Math.PI/180,hand=layer(ivory?'blue':'brass');
      if(alt&&hand){c.save();c.translate(cx,cy);c.rotate((-90+((value%10000+10000)%10000)/10000*360)*Math.PI/180+Math.PI/2);c.drawImage(hand,-radius*.48,-radius*.48,radius*.96,radius*.96);c.restore();this.canvas.dataset.altimeter='two-hand-hundreds-thousands';}
      if(hand){c.save();c.translate(cx,cy);c.rotate(a+Math.PI/2);c.drawImage(hand,-radius*.8,-radius*.8,radius*1.6,radius*1.6);c.restore();}
      else{const dx=Math.cos(a),dy=Math.sin(a);polygon(c,[[cx-dy,cy+dx],[cx+dx*radius*.65,cy+dy*radius*.65],[cx+dy,cy-dx]],P.gold);}
      c.restore();
      const glass=(this.mission===2?climate('nightGlass'):null)||layer('glass');if(glass){c.save();c.globalAlpha=.7;c.drawImage(glass,cx-diameter/2,cy-diameter/2,diameter,diameter);c.restore();}
      const frost=this.mission===1?climate('frostRing'):null;if(frost)c.drawImage(frost,cx-diameter*.51,cy-diameter*.51,diameter*1.02,diameter*1.02);
      hudType(c,fuel?(this.unlimitedSupplies?'INF':Math.round(value)+'%'):alt?String(Math.round(value)).padStart(4,'0')+' FT':Math.round(value),cx,cy+radius+4,{size:6,align:'center'});
    }
    climatePlate(image,x,y,w,h){
      const c=this.c,b=5,sb=60,sx=[0,sb,image.width-sb,image.width],sy=[0,sb,image.height-sb,image.height],dx=[x,x+b,x+w-b,x+w],dy=[y,y+b,y+h-b,y+h];
      for(let row=0;row<3;row++)for(let col=0;col<3;col++)c.drawImage(image,sx[col],sy[row],sx[col+1]-sx[col],sy[row+1]-sy[row],dx[col],dy[row],dx[col+1]-dx[col],dy[row+1]-dy[row]);
    }
    hud(s,objects,trainer,ground) {
      const c=this.c,art=kind=>window.RainbowAssets?.interfaceArt?.(kind);c.save();c.translate(0,H);
      const panel=art('panel');rect(c,0,0,W,HUD,'#3b281e');if(panel)c.drawImage(panel,0,0,W,HUD);
      if(this.mission===2){
        c.globalAlpha=.54;rect(c,0,0,W,HUD,'#0a182a');c.globalAlpha=1;
        for(const x of [144,472,542]){const glow=c.createRadialGradient(x,10,1,x,30,52);glow.addColorStop(0,'rgba(247,166,62,.28)');glow.addColorStop(1,'rgba(247,166,62,0)');c.fillStyle=glow;c.fillRect(x-52,0,104,90);}
      }
      const climate=kind=>window.RainbowAssets?.cockpitLayer?.(kind),nightPlate=this.mission===2?climate('nightFrame'):null;
      const score=art('score'),nav=art('map'),ammo=art('counter');
      if(nightPlate)this.climatePlate(nightPlate,6,3,100,46);else if(score)c.drawImage(score,6,3,100,46);else rect(c,10,8,92,34,P.ink);
      hudType(c,'SCORE',56,17,{size:6,color:P.gold,align:'center',serif:true});
      const digits=s[10]<0?'-'+String(-s[10]).padStart(5,'0'):String(s[10]).padStart(6,'0');
      hudType(c,digits,56,27,{size:12,align:'center',width:78});
      const lives=art('lives'),level=art('level');if(nightPlate){this.climatePlate(nightPlate,10,49,55,23);this.climatePlate(nightPlate,70,49,34,23);}else {if(lives)c.drawImage(lives,10,49,55,23);if(level)c.drawImage(level,70,49,34,23);}
      hudType(c,'LIVES '+(trainer?'INF':s[9]),37.5,57,{size:8,color:P.gold,align:'center',width:44});
      hudType(c,'LVL '+(s[18]+1),87,57,{size:8,color:P.gold,align:'center',width:27});
      if(nav)c.drawImage(nav,186,3,246,70);
      c.save();c.beginPath();for(const [i,[x,y]] of [[MAP.x+3,MAP.y],[MAP.x+MAP.w-3,MAP.y],[MAP.x+MAP.w,MAP.y+3],[MAP.x+MAP.w,MAP.y+MAP.h-3],[MAP.x+MAP.w-3,MAP.y+MAP.h],[MAP.x+3,MAP.y+MAP.h],[MAP.x,MAP.y+MAP.h-3],[MAP.x,MAP.y+3]].entries())i?c.lineTo(x,y):c.moveTo(x,y);c.closePath();c.clip();
      rect(c,MAP.x,MAP.y,MAP.w,MAP.h,this.mission===2?'#10242b':this.mission===1?'#647c85':'#263d43');
      if(ground?.length)for(let x=0;x<MAP.w;x++){
        const y=MAP.h-1-ground[Math.min(ground.length-1,Math.floor(x/MAP.w*ground.length))]/200*(MAP.h-2);
        c.fillStyle=this.mission===2?'#3c4e4c':this.mission===1?'#cfdfdf':'#70854c';c.fillRect(MAP.x+x,MAP.y+y,1,MAP.h-y);
      }
      const faction=objects.find(r=>r[0]===1&&r[10])?.[6]||1;
      for(const r of objects)if([1,4,7,8,9,12].includes(r[0])){
        const point=mapPoint(r[2]+r[7]/2,r[3]-r[8]/2,s[3]),y=point.y-H;
        const inactive=r[0]===4?r[1]!==5:r[0]===1?![1,6,8,9].includes(r[1]):r[0]===12?r[1]!==1:r[0]===9?r[1]!==5:false;
        if(inactive){rect(c,point.x-1,y,3,1,'#b2c1b7');rect(c,point.x,y-1,1,3,'#526d78');}
        else {const color=r[10]?P.gold:r[0]===7||r[0]===8?P.white:r[0]===9?P.sand:r[6]===faction?P.mint:r[6]?P.red:P.white;rect(c,point.x-(r[10]?2:1),y,r[10]?5:r[0]===4?3:2,r[0]===1?3:2,color);}
      }
      c.strokeStyle='#e2d7b5';c.lineWidth=.6;c.strokeRect(MAP.x+s[2]/s[3]*MAP.w,MAP.y+1,320/s[3]*MAP.w,MAP.h-2);c.restore();
      for(const [kind,x,w] of [['you',206,33],['friend',246,48],['enemy',301,46],['birds',355,46]]){const tape=art(kind);if(tape)c.drawImage(tape,x,73,w,10);else hudType(c,kind.toUpperCase(),x+3,75,{size:5.5});}
      const wx=Math.max(0,Math.min((ground?.length||1)-1,Math.floor(s[4]+8)));
      const speed=Math.max(0,s[11])*18/1.609344,altitude=Math.max(0,s[5]-16-(ground?.[wx]||0))*10*3.28084,fuel=Math.max(0,Math.min(100,s[6]/9000*100));
      const dt=Math.max(0,Math.min(5,(s[26]||s[1])-(this.instrumentAt??(s[26]||s[1]))));this.instrumentAt=s[26]||s[1];
      this.instrumentSpeed=this.instrumentSpeed===undefined?speed:this.instrumentSpeed+(speed-this.instrumentSpeed)*(1-Math.exp(-dt/2.5));
      this.gauge(144,43,'speed',this.instrumentSpeed,200,'AIR','MPH');this.gauge(472,43,'altitude',altitude,6000,'ALT','FT AGL');this.gauge(542,40,'fuel',fuel,100,'FUEL','');
      this.canvas.dataset.airspeed=String(Math.round(speed));this.canvas.dataset.airspeedUnit='MPH';this.canvas.dataset.altitude=String(Math.round(altitude));this.canvas.dataset.altitudeUnit='FT AGL';this.canvas.dataset.fuelPercent=String(Math.round(fuel));
      this.canvas.dataset.pitch=String(s[19]*22.5);this.canvas.dataset.clearance=String(s[5]-16-(ground?.[wx]||0));
      const throttle=Math.max(0,Math.min(100,s[27]||0)),leverX=35+throttle*.46;
      const throttleBase=art('throttleBase'),throttleLever=art('throttleLever');
      if(throttleBase)c.drawImage(throttleBase,12,81,92,14);
      else {rect(c,12,81,92,14,'#a57c40');rect(c,32,87,50,2,'#2e2117');}
      hudType(c,'IDLE',17,85,{size:4.8,color:'#302116',serif:true});hudType(c,'FULL',99,85,{size:4.8,color:'#302116',align:'right',serif:true});
      if(throttleLever)c.drawImage(throttleLever,leverX-3.5,73,7,15.44);
      else {rect(c,leverX-1,80,2,9,P.gold);rect(c,leverX-3,73,6,8,'#21180f');}
      this.canvas.dataset.throttle=String(Math.round(throttle));this.canvas.dataset.throttleControl='mechanical-lever';this.canvas.dataset.throttleLeverX=String(leverX);
      this.canvas.dataset.mapWindow=[MAP.x,MAP.y,MAP.w,MAP.h].join(',');
      if(nightPlate)this.climatePlate(nightPlate,574,10,54,27);else if(ammo)c.drawImage(ammo,574,10,54,27);else rect(c,578,15,45,18,P.ink);
      hudType(c,'AMMO',580,23,{size:5.8,serif:true});hudType(c,trainer||this.unlimitedSupplies?'INF':s[7],623,23,{size:6,color:P.gold,align:'right',width:17});
      hudType(c,trainer||this.unlimitedSupplies?'BOMBS INF':'BOMBS',602,39,{size:5.8,align:'center',serif:true});
      const rack=art('bombRack');if(rack)c.drawImage(rack,574,45,54,27);
      const bomb=art('bomb'),count=trainer||this.unlimitedSupplies?5:Math.max(0,Math.min(5,s[8]));
      c.save();c.beginPath();c.moveTo(578,47);c.lineTo(624,47);c.lineTo(624,68);c.lineTo(578,68);c.closePath();c.clip();
      for(let i=0;i<5;i++){if(i<count){if(bomb)c.drawImage(bomb,580+i*8.4,49,6.5,16);else rect(c,581+i*8.4,50,4,15,P.gold);}else rect(c,582+i*8.4,49,2,1,'#7d6948');}c.restore();
      this.canvas.dataset.bombIcons=String(count);
      const home=art('home');if(home)c.drawImage(home,517,77,13,13);hudType(c,'HOME '+(s[17]?'ON':s[4]<s[15]?'>':'<'),550,81,{size:6,color:P.gold,align:'center'});
      const target=this.effects.filter(e=>e.type===6&&s[1]-e.tick<28).at(-1);
      const stalled=[6,9].includes(s[13]),minimum=4.6+2.8*Math.max(0,Math.sin(s[19]*Math.PI/8));
      this.canvas.dataset.flightCondition=s[13]===3?'crashed':s[13]===4?'falling':stalled?'stall':altitude<10?'taxi':s[11]<minimum?'low-airspeed':'flying';
      let note='',noteColor=P.gold;
      if(stalled){note='STALL · LOWER NOSE';noteColor=P.red;}
      else if(s[12]===0&&[1,8].includes(s[13])&&altitude>50&&s[11]<minimum)note='AIRSPEED LOW · ADD POWER';
      else if(target){const building=[1,2,3,8].includes(Math.abs(target.size));note=target.size<0?'FRIENDLY TARGET HIT':building?'BUILDING DESTROYED':'TARGET DESTROYED';noteColor=target.size<0?P.red:P.gold;}
      else if(s[12]===0&&this.spawnProtection>0&&!this.readyLevel){note='TAKEOFF COVER · '+Math.ceil(this.spawnProtection/10)+'s';noteColor=P.mint;}
      else if(s[13]===3){note='PLANE LOST';noteColor=P.red;}
      else if(s[16]){note='RETURNING TO BASE';noteColor=P.cream;}
      if(objects.some(r=>r[10]&&r[15]===23))note='TURNING BACK';
      if(note)this.flightNotice(note,noteColor);else{delete this.canvas.dataset.notification;delete this.canvas.dataset.notificationArea;}
      const escort=objects.find(r=>r[15]===22),separation=escort?Math.hypot(escort[2]-s[4],escort[3]-s[5]):0;
      this.canvas.dataset.wingman=escort?escort[14]===3&&separation>110?'JOINING':['OFF','WAITING','TAKEOFF','FORMATION','ENGAGING','RETURNING','LOST'][escort[14]]||'FORMATION':'OFF';
      this.canvas.dataset.wingmanSeparation=String(Math.round(separation));
      if(escort)hudType(c,'2 '+this.canvas.dataset.wingman,420,88,{size:4.5,color:P.mint,align:'right',width:100});

      if(this.mission===1){
        const edge=climate('frostEdge'),bezel=climate('frostFrame');
        if(edge){c.save();c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(W,12);c.lineTo(0,12);c.closePath();c.clip();for(let x=-20;x<W;x+=180)c.drawImage(edge,x,-27,210,82);c.restore();}
        if(bezel){this.climatePlate(bezel,574,10,54,27);}
        for(let i=0;i<60;i++){
          const x=(i*113)%W,y=i%3===0?1:HUD-2,w=2+(i%4);
          c.globalAlpha=.24+(i%3)*.08;polygon(c,[[x-w,y],[x,y+(y<10?1:-1)*(3+i%5)],[x+w,y],[x+1,y+(y<10?-2:2)]],'#d6eff3');
        }c.globalAlpha=1;
        for(const x of [144,472,542]){c.globalAlpha=.16;polygon(c,[[x-23,20],[x-15,15],[x-7,17],[x-18,27],[x-29,32]],'#e1f4f7');c.globalAlpha=1;}
      }
      this.canvas.dataset.cockpitClimate=['clear','frost','night-lit'][this.mission||0];
      c.restore();
    }
    demo() {
      this.background(420,32);
      const g=new Int32Array(320);
      for(let x=0;x<320;x++) g[x]=Math.round(16+Math.max(0,48-Math.abs(x-250)*.65));
      rainbow(this.c,80,(199-g[40])*2+10,520,(199-g[260])*2+10);
      this.terrain(g,420);
      const c=this.c;
      // Small, original biplane emblem, also used for the collection poster.
      for(let i=0;i<50;i++) {
        const x=115+i*3.3,y=228-Math.sin(i*.027)*44;
        rect(c,x,y,i%3===0?2:1,2,P.cloud);
      }
      demoPlane(c,295,177,2.1,-.34);
      demoPlane(c,485,118,1.1,.23);
      // Mint hangar, windsock and runway are preview scenery only.
      rect(c,61,336,70,36,P.outline);rect(c,64,327,64,42,P.teal);
      rect(c,71,321,50,6,P.mint);rect(c,76,317,40,5,P.pale);
      rect(c,83,345,24,24,P.outline);rect(c,86,347,18,22,P.ink);
      rect(c,65,332,5,28,P.mint);rect(c,121,333,5,28,P.mint);
      rect(c,142,318,2,52,P.outline);rect(c,144,318,22,8,P.cream);
      rect(c,145,318,7,8,P.red);rect(c,158,319,7,6,P.red);
      rect(c,45,370,154,4,P.outline);for(let x=49;x<190;x+=16)rect(c,x,371,9,1,P.cream);
      text(c,'RAINBOW PATROL',20,20,P.cream,2);
    }
  }
  RainbowRenderer.mapPoint=mapPoint; RainbowRenderer.WIDTH=W; RainbowRenderer.HEIGHT=H+HUD; RainbowRenderer.DETAIL=DETAIL;
  RainbowRenderer.HEADER=HEADER; RainbowRenderer.STRIDE=STRIDE;
  RainbowRenderer.LENGTH=HEADER+GROUND+256*STRIDE;
  RainbowRenderer.text=text;
  RainbowRenderer.predictBomb=predictBomb;
  window.RainbowRenderer=RainbowRenderer;
  document.querySelectorAll('canvas[data-rainbow-preview]').forEach(canvas=>new RainbowRenderer(canvas).demo());
})();
