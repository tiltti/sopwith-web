// Sopwith: Rainbow Patrol. Original pixel renderer, GPL-2.0-or-later.
// The native C engine remains responsible for simulation and collision masks.
(() => {
  const W = 640, H = 400, HUD = 68, DETAIL = 3, HEADER = 28, STRIDE = 18, GROUND = 320;
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
    const rx=(xRight-xLeft)/2,cx=xLeft+rx,ry=145,base=Math.max(yLeft,yRight);
    for(let band=0;band<6;band++){
      const outerX=rx-band*5,innerX=outerX-5,outerY=ry-band*5,innerY=outerY-5;
      c.fillStyle=colors[band];c.beginPath();
      for(let i=0;i<=240;i++){const a=Math.PI-i/240*Math.PI,x=cx+Math.cos(a)*outerX,y=base-Math.sin(a)*outerY;i?c.lineTo(x,y):c.moveTo(x,y);}
      c.lineTo(cx+outerX,H);c.lineTo(cx+innerX,H);
      for(let i=0;i<=240;i++){const a=i/240*Math.PI;c.lineTo(cx+Math.cos(a)*innerX,base-Math.sin(a)*innerY);}
      c.lineTo(cx-innerX,H);c.lineTo(cx-outerX,H);c.closePath();c.fill();
    }
  }
  function mapPoint(x,y,width) {return {x:185+Math.max(0,Math.min(1,x/width))*259,y:H+6+39-Math.max(0,Math.min(199,y))/199*39};}
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
      this.airplanes=new Map();this.bailouts=[];this.darkSmokeBrush=null;
    }
    background(camera=0,tick=0) {
      const c=this.c;
      const bands=['#3b9bd6','#40a6e1','#49b2e7','#56bfed','#68cbef','#82d8ef','#a4e8ee','#c9f5ef'];
      bands.forEach((color,i) => rect(c,0,i*50,W,51,color));
      const sunX=552-Math.round(camera*.035)%95;
      // A quiet luminous solar disc, without the old balloon-like rim/rays.
      const glow=c.createRadialGradient(sunX,63,9,sunX,63,35);
      glow.addColorStop(0,'rgba(255,242,180,.22)');glow.addColorStop(1,'rgba(255,242,180,0)');
      c.fillStyle=glow;c.fillRect(sunX-36,27,72,72);
      c.fillStyle='#fff2bd';c.beginPath();c.ellipse(sunX,63,16,16,0,0,Math.PI*2);c.fill();
      for (let i=-1;i<5;i++) {
        let x=i*210-((camera*.11+tick*.12)%210);
        cloud(c,x,62+((i+5)%3)*39,i%2===0?1.5:1.05);
      }
      for(let i=-1;i<6;i++)cloud(c,i*145-(camera*.19%145),225+(i%2)*14,.75);
      // A coastal skyline of weathered columns, shrubs and an occasional
      // lighthouse. Muted colours separate scenery from collidable terrain.
      const far=camera*.27,chunk=Math.floor(far/150);
      for(let i=chunk-1;i<chunk+6;i++) {
        const x=i*150-far,seed=((i*73+919)%97+97)%97,top=282+seed%42;
        polygon(c,[[x,400],[x,top+31],[x+12,top+31],[x+12,top+9],[x+35,top+9],
          [x+35,top],[x+92,top],[x+92,top+11],[x+119,top+11],[x+119,top+35],
          [x+150,top+35],[x+150,400]],'#7ab8ad');
        rect(c,x+36,top,55,4,'#afd3a2');
        rect(c,x+39,top+4,13,H-top,'#92c4b4');
        rect(c,x+83,top+5,7,H-top,'#66aaac');
        for(let y=top+22;y<H;y+=21)rect(c,x+36,y,55,2,'#6eadab');
        for(let t=0;t<3;t++) {
          const tx=x+43+t*16,ty=top-8-(t+seed)%3*3;
          rect(c,tx+4,ty+3,2,8,'#6eadab');rect(c,tx,ty,10,6,'#78b59f');
          rect(c,tx+2,ty-3,6,3,'#9bcea8');
        }
        if(seed%5===0) {
          rect(c,x+66,top-36,9,36,'#d5e4c6');rect(c,x+66,top-22,9,5,'#96c1b2');
          rect(c,x+64,top-39,13,4,'#719ca4');rect(c,x+67,top-43,7,5,'#f6e9b5');
          rect(c,x+63,top-44,15,2,'#719ca4');
        }
      }
      rect(c,0,375,W,25,'#68c8c9');
      for(let i=0;i<15;i++) rect(c,(i*53-Math.floor(camera*.3)%53),371+(i%3)*8,18,1,'#a8e6cf');
    }
    terrain(ground,camera) {
      const c=this.c;
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
      const left=(scene[21]-scene[2])*2,right=left+440;
      const visible=left<W && right>0;
      if(visible)rainbow(this.c,left,(199-scene[22])*2+10,right,(199-scene[23])*2+10);
      this.canvas.dataset.rainbow=String(visible);
      return visible;
    }
    readEffects(data,tick) {
      if(!data||data[0]!==1)return;
      for(let i=0;i<32;i++) {
        const at=4+i*6,id=data[at];
        if(id<=this.lastEffectId||id===0)continue;
        const age=tick-data[at+1];
        if(age>=0&&age<(data[at+2]===6?28:16))this.effects.push({id,tick:data[at+1],type:data[at+2],x:data[at+3],y:data[at+4],size:data[at+5]});
      }
      this.lastEffectId=data[1];
      this.effects=this.effects.filter(e=>tick-e.tick>=0&&tick-e.tick<(e.type===6?28:16)).slice(-32);
    }
    drawEffects(camera,tick) {
      const c=this.c;
      for(const e of this.effects) {
        const age=Math.max(0,tick-e.tick),x=(e.x-camera)*2,y=(199-e.y)*2;
        if(x < -100 || x>W+100)continue;
        if(e.type===7||e.type===8){
          const label=e.type===8?'HIMMEL':'AARGH',yy=y-age*1.5;
          rect(c,x-26,yy-19,55,11,P.ink);text(c,label,x-22,yy-16,P.cream);
          if(e.size)text(c,(e.size>0?'+':'')+e.size,x-17,yy-3,e.size>0?P.mint:P.red,2);
          continue;
        }
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
      const artwork=window.RainbowAssets?.sprite(record,heap);
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
      for(let x=0;x<r[7];x++){
        const g=ground[Math.max(0,Math.min(ground.length-1,Math.round(left+x)))],bottom=(199-g)*2;
        if(bottom<=top)continue;
        rect(c,sx+x*2,top,2,bottom-top+1,'#a89470');
        for(let y=top+4;y<bottom;y+=4)rect(c,sx+x*2,y,2,.7,'#7d765e');
        if(x%4===0)rect(c,sx+x*2,top,.7,bottom-top,'#d0bc91');
      }
      rect(c,sx,top,width,1,'#ddd3a5');
    }
    teamMark(r,camera){
      if(r[0]!==4||r[1]!==5||!r[6]||r[15]===6)return;
      const c=this.c,x=(r[2]-camera)*2-4,base=(199-r[3]+r[8])*2;
      rect(c,x,base-16,1.5,16,P.ink);rect(c,x+1,base-16,11,8,P.ink);
      rect(c,x+2,base-15,9,6,r[6]===1?P.mint:P.red);
      rect(c,x+5.5,base-14,1,4,P.cream);
      if(r[6]===1)rect(c,x+4,base-12.5,4,1,P.cream);
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
    drawPilots(objects,camera,time){
      const c=this.c;let count=0;
      for(const r of objects)if(r[15]===21){
        count++;const phase=r[5],air=phase<2,shooting=(r[14]&2)!==0;
        let frame=phase===0?7:phase===1?8+(Math.floor(time/4)%2):phase===4?5:shooting?4:phase===3?[1,0,2,0][Math.floor(time/2)%4]:0;
        const image=window.RainbowAssets?.pilotFrame(frame,r[6]);if(!image)continue;
        const x=(r[2]-camera)*2+r[7],y=(199-r[3]+r[8])*2,w=image.worldWidth,h=image.worldHeight;
        if(x< -30||x>W+30)continue;
        c.save();c.translate(x,y);if(r[4]===8)c.scale(-1,1);
        if(air)c.rotate(Math.sin(time*.21+r[16])*.055);
        c.drawImage(image,-w/2,-h,w,h);
        if(phase===1&&(r[14]&1)){polygon(c,[[-8,-h+8],[-10,-h-1],[-6,-h+3],[-4,-h-3],[-2,-h+9]],P.red);rect(c,-7,-h+3,3,5,P.gold);}
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
      const image=window.RainbowAssets?.departurePose(t<.2?0:t>.8?2:1),w=58*Math.pow(1-t,1.4)+1.5;
      if(image){c.save();c.globalAlpha=Math.min(1,(1-t)*8);c.drawImage(image,x-w/2,y-w/3,w,w*2/3);c.restore();}
      rect(c,184,37,272,37,P.ink);rect(c,186,39,268,1,P.gold);
      text(c,'MISSION COMPLETE',205,48,P.gold,3);text(c,'LEVEL '+(scene[18]+1)+' CLEARED',257,65,P.cream);
      this.canvas.dataset.departure=t.toFixed(3);
    }
    drawReady(){
      if(!this.readyLevel)return;
      const c=this.c;c.fillStyle='rgba(24,52,73,.35)';c.fillRect(0,0,W,H);
      rect(c,168,137,304,106,P.ink);rect(c,171,140,298,100,'#3678ac');rect(c,171,140,298,2,P.pale);
      text(c,'READY PLAYER',214,158,P.gold,3);text(c,'LEVEL '+this.readyLevel,260,191,P.cream,3);
      rect(c,205,224,230,3,'#284b6c');rect(c,205,224,230*Math.min(1,this.readyProgress||0),3,P.gold);
      this.canvas.dataset.readyLevel=String(this.readyLevel);
    }
    drawScene(scene,heap,trainer=false,effects=null,ground=null) {
      if(scene[0]!==3||scene[3]===0)return false;
      const c=this.c,tick=scene[1],time=scene[26]||tick;
      if(scene[12]!==1)this.departure=null;
      const camera=this.departure?.camera??scene[2];
      if(this.departure){scene=scene.slice();scene[2]=camera;}
      if(tick<this.lastTick){this.effects=[];this.lastEffectId=effects?.[1]||0;this.cowDeaths.clear();this.airplanes.clear();this.bailouts=[];}
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
      this.landmark(scene);
      this.drawTrail(camera,time,scene);
      const objects=[];
      for(let i=0;i<scene[14];i++) {
        const r=scene.subarray(HEADER+GROUND+i*STRIDE,HEADER+GROUND+(i+1)*STRIDE);objects.push(r);
        if(r[0]===9&&r[1]!==5&&!this.cowDeaths.has(r[16]||r[2]))this.cowDeaths.set(r[16]||r[2],tick);
      }
      this.observeAircraft(objects,time,tick,ground);
      for(const r of objects)this.foundation(r,camera,ground);
      for(const r of objects) {
        const [type,,x,y,,,,w,h]=r, sx=(x-camera)*2,sy=(199-y)*2;
        if(sx < -w*2-3||sx>W||sy>H||sy < -h*2-3)continue;
        if(r[15]===21||(type===1&&r[10]&&scene[12]===1))continue;
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
        if(type===6) {ring(c,sx,sy,3+(r[11]%3),P.darkSmoke);rect(c,sx-1,sy-1,3,3,P.smoke);continue;}
        if(type===5) {rect(c,sx-2,sy,4,2,P.redShade);rect(c,sx,sy-1,2,3,P.yellow);rect(c,sx+1,sy,1,1,P.cream);continue;}
        if(type===9&&r[1]!==5&&window.RainbowAssets?.loaded) {
          const age=Math.max(0,time-this.cowDeaths.get(r[16]||r[2])),pose=window.RainbowAssets.cowPose(Math.min(3,Math.floor(age/2)));
          const g=ground?.[Math.max(0,Math.min(ground.length-1,Math.floor(x+8)))]??199-(sy+h*2)/2;
          if(pose)c.drawImage(pose,sx+w-pose.width/(DETAIL*2),(199-g)*2-pose.height/DETAIL,pose.width/DETAIL,pose.height/DETAIL);
          continue;
        }
        let visualRecord=r,groundBlend=0;
        if(type===1&&r[1]===1&&r[10]===1&&ground?.length){
          const floor=ground[Math.max(0,Math.min(ground.length-1,Math.round(r[2]+w/2)))];
          if(r[3]-floor<15){groundBlend=scene[17]?1:Math.max(0,1-scene[11]/4);visualRecord=Float64Array.from(r);visualRecord[4]+=(r[5]?-.67:.67)*groundBlend;}
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
          }else c.drawImage(sprite,sx+w-dw/2,sy+h-dh/2+groundBlend*3.2,dw,dh);
        }
        if(type===4)this.teamMark(r,camera);
        if(type===1)this.drawPlaneFire(r,camera,time);
        if(type===1 && r[10]===0 && r[1]!==3) {
          rect(c,sx+w-1,sy-6,3,2,P.redShade);rect(c,sx+w,sy-7,1,4,P.redShade);
        }
      }
      if(ground?.length)this.terrainWorld(ground,camera,tick);
      else this.terrain(scene.subarray(HEADER,HEADER+GROUND),camera);
      this.aim(scene,objects,ground);
      const aimVisible=this.canvas.dataset.aimX!==undefined;
      if(aimVisible&&!this.aimVisible)this.aimActivations++;
      this.aimVisible=aimVisible;
      this.canvas.dataset.aimActivations=String(this.aimActivations);
      this.drawEffects(camera,time);
      this.drawPilots(objects,camera,time);
      this.drawDeparture(scene,time,ground);
      delete this.canvas.dataset.readyLevel;this.drawReady();
      // Native low-altitude collision geometry is preserved all the way down
      // to the original bottom edge; the information strip lives below the world.
      this.hud(scene,objects,trainer,ground);
      this.canvas.dataset.renderer='rainbow';
      this.canvas.dataset.artwork=window.RainbowAssets?.loaded?'amiga':'native';
      this.canvas.dataset.tick=String(tick);
      this.canvas.dataset.objects=String(objects.length);
      this.canvas.dataset.bombsInAir=String(objects.filter(r=>r[0]===2).length);
      this.canvas.dataset.effects=String(this.effects.length);
      this.canvas.dataset.framebuffer=`${this.canvas.width}x${this.canvas.height}`;
      return true;
    }
    hud(s,objects,trainer,ground) {
      const c=this.c;c.save();c.translate(0,H);
      rect(c,0,0,W,HUD,P.ink);rect(c,0,0,W,2,P.teal);rect(c,0,50,W,18,'#1d3048');
      text(c,'SCORE',10,9,P.pale);text(c,s[10]<0?'-'+String(-s[10]).padStart(5,'0'):String(s[10]).padStart(6,'0'),10,21,P.cream,2);
      text(c,'LIVES',88,9,P.pale);text(c,trainer?'INF':s[9],88,21,P.gold,2);
      text(c,'LVL',140,9,P.pale);text(c,s[18]+1,140,21,P.cream,2);
      rect(c,183,4,264,44,P.outline);rect(c,185,6,260,40,'#34718a');
      if(ground?.length)for(let x=0;x<260;x++) {
        const y=39-Math.round(ground[Math.min(ground.length-1,Math.floor(x/260*ground.length))]/200*39);
        rect(c,185+x,6+y,1,40-y,'#75965d');
      }
      for(const r of objects)if([1,4,7,8,9,12].includes(r[0])) {
        const point=mapPoint(r[2]+r[7]/2,r[3]-r[8]/2,s[3]);
        const inactive=r[0]===4?r[1]!==5:r[0]===1?![1,6,8,9].includes(r[1]):r[0]===12?r[1]!==1:r[0]===9?r[1]!==5:false;
        if(inactive){
          rect(c,point.x-1,point.y-H,3,1,'#b2c1b7');rect(c,point.x,point.y-H-1,1,3,'#526d78');
        }else{
          const color=r[10]?P.gold:r[0]===1?P.red:r[0]===7||r[0]===8?P.white:r[0]===9?P.sand:r[6]===1?P.mint:P.red;
          rect(c,point.x-(r[10]?2:1),point.y-H,r[10]?5:r[0]===4?3:2,r[0]===1?3:2,color);
        }
      }
      c.strokeStyle='#9ce3e5';c.lineWidth=.6;c.strokeRect(185+s[2]/s[3]*260,6,320/s[3]*260,40);
      text(c,'FUEL',458,9,P.pale);rect(c,486,8,60,7,P.outline);rect(c,487,9,Math.max(0,Math.min(58,s[6]/9000*58)),5,P.mint);
      text(c,'AMMO',458,24,P.pale);text(c,s[7],486,23,P.cream,2);
      text(c,'BOMB',557,9,P.pale);text(c,s[8],598,8,P.gold,2);
      text(c,'HOME',557,25,P.pale);text(c,s[16]?'ON':s[4]<s[15]?'>':'<',598,24,P.cream,2);
      rect(c,10,56,5,4,P.mint);text(c,'OMA',19,56,P.cream);
      rect(c,49,56,5,4,P.red);text(c,'VIHOLLINEN',58,56,P.cream);
      const target=this.effects.filter(e=>e.type===6&&s[1]-e.tick<28).at(-1);
      if(target){
        const label=target.size<0?'FRIENDLY TARGET HIT':'TARGET DESTROYED';
        const x=target.size<0?244:256,color=target.size<0?P.red:P.gold;
        text(c,'> '+label+' <',x-16,54,color,2);this.canvas.dataset.notification=label;
      }
      else {delete this.canvas.dataset.notification;

      if(s[12]===1)text(c,'MISSION COMPLETE',244,56,P.gold);
      else if(s[13]===3)text(c,'PLANE LOST',280,56,P.red);
      else if(s[16])text(c,'RETURNING TO BASE',244,56,P.cream);
      }
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
