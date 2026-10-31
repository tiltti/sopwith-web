// Sopwith: Rainbow Patrol. Original pixel renderer, GPL-2.0-or-later.
// The native C engine remains responsible for simulation and collision masks.
(() => {
  const W = 640, H = 400, HEADER = 24, STRIDE = 16, GROUND = 320;
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
    const block=(a,b,w,h,color)=>rect(c,Math.round(x+a*s),Math.round(y+b*s),
      Math.round((a+w)*s)-Math.round(a*s),Math.round((b+h)*s)-Math.round(b*s),color);
    const steps = [[0,18,12,8],[7,10,14,17],[15,3,17,24],[20,0,11,27],
      [30,7,17,20],[44,13,16,14],[56,20,15,7],[65,24,12,3]];
    for (const [a,b,w,h] of steps) block(a,b,w,h,P.cloudShade);
    for (const [a,b,w] of steps) block(a,b,w,Math.max(2,26-b-5),P.cloud);
    block(1,27,76,2,P.cloudDeep);
    block(14,24,47,3,P.pale);
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
  function rainbow(c,cx,cy,r) {
    const colors=[P.red,P.yellow,P.grass,P.mint,P.blue,P.purple];
    // Stepped annuli, with no antialiasing, on a two-pixel grid.
    for(let y=-r;y<0;y+=2) for(let x=-r;x<=r;x+=2) {
      const d=Math.sqrt(x*x+y*y), band=Math.floor((r-d)/4);
      if(band>=0 && band<colors.length) rect(c,cx+x,cy+y,2,2,colors[band]);
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
      this.canvas=canvas; canvas.width=W; canvas.height=H;
      this.c=canvas.getContext('2d',{alpha:false}); this.c.imageSmoothingEnabled=false;
      this.sprites=new Map(); this.trail=[]; this.lastTick=-1;
    }
    background(camera=0,tick=0) {
      const c=this.c;
      const bands=['#40a6e1','#4cb8e9','#63c9f0','#86daf4','#a4e8f1','#c9f5ef'];
      bands.forEach((color,i) => rect(c,0,i*66,W,67,color));
      // The sun and rainbow remain distant; all hard-edged scenery below is
      // drawn from the actual collision terrain, not from this backdrop.
      const sunX=552-Math.round(camera*.035)%95;
      for(let y=-16;y<=16;y+=2) {
        const r=Math.floor(Math.sqrt(16*16-y*y)/2)*2;
        rect(c,sunX-r,63+y,r*2+2,2,P.gold);
      }
      rect(c,sunX-6,53,10,10,P.cream);
      rainbow(c,440-Math.round(camera*.06)%160,249,95);
      for (let i=-1;i<5;i++) {
        let x=i*190-((camera*.11+tick*.16)%190);
        cloud(c,x,64+(i%3)*34,i%2===0?1.9:1.05);
      }
      for(let i=-1;i<6;i++) cloud(c,i*140-(camera*.19%140),230+(i%2)*14,.9);
      // Teal silhouettes read as distant scenery rather than solid platforms.
      const shift=Math.floor(camera*.23)%240;
      for(let i=-1;i<4;i++) {
        const x=i*240-shift;
        polygon(c,[[x,347],[x+25,313],[x+53,313],[x+85,265],[x+102,265],
          [x+124,303],[x+145,303],[x+174,331],[x+203,331],[x+240,351],[x+240,400],[x,400]],'#65c4c6');
        polygon(c,[[x+85,265],[x+102,265],[x+117,293],[x+97,289],[x+78,284]],'#a8e6c6');
      }
      rect(c,0,363,W,37,'#68c8c9');
      for(let i=0;i<15;i++) rect(c,(i*53-Math.floor(camera*.3)%53),371+(i%3)*8,18,1,'#a8e6cf');
    }
    terrain(ground,camera) {
      const c=this.c;
      for(let x=0;x<320;x++) {
        const y=Math.max(0,(199-ground[x])*2), wx=(camera+x)*2;
        rect(c,x*2,y,2,H-y,P.soil);
        for(let dy=13;dy<H-y;dy+=13) {
          const hash=(Math.floor(wx/2)*17+Math.floor(dy/13)*31)%37;
          if(hash<3)rect(c,x*2,y+dy,2,2,hash===0?P.sand:P.soilShade);
        }
        rect(c,x*2,y,2,2,P.outline);
        rect(c,x*2,y+2,2,3,P.grass);
        rect(c,x*2,y+5,2,3,P.green);
        rect(c,x*2,y+8,2,2,P.grassShade);
        if((camera+x)%13===0)rect(c,x*2,y+11,2,3,P.rock);
      }
    }
    sprite(record,heap) {
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
    drawScene(scene,heap,trainer=false) {
      if(scene[0]!==1||scene[3]===0)return false;
      const c=this.c,tick=scene[1],camera=scene[2];
      if(tick!==this.lastTick) {
        const last=this.trail.at(-1);
        if(tick<this.lastTick || last&&Math.abs(last.x-scene[4])>32)this.trail=[];
        if([1,6,8,9].includes(scene[13])&&!scene[17]&&scene[11]>1) {
          this.trail.push({x:scene[4]+8,y:scene[5]-8,tick});
        }
        this.trail=this.trail.filter(p=>tick-p.tick<35).slice(-35);
        this.lastTick=tick;
      }
      this.background(camera,tick);
      for(const p of this.trail) {
        const age=tick-p.tick,sz=age>22?1:2;
        rect(c,(p.x-camera)*2,(199-p.y)*2,sz,sz,age>22?P.cloudShade:P.cloud);
      }
      const objects=[];
      for(let i=0;i<scene[14];i++)objects.push(scene.subarray(HEADER+GROUND+i*STRIDE,HEADER+GROUND+(i+1)*STRIDE));
      for(const r of objects) {
        const [type,,x,y,,,,w,h]=r, sx=(x-camera)*2,sy=(199-y)*2;
        if(sx < -w*2-3||sx>W||sy>H||sy < -h*2-3)continue;
        if(type===3) {rect(c,sx-3,sy,5,2,P.gold);rect(c,sx,sy,2,2,P.cream);continue;}
        if(type===6) {rect(c,sx,sy,3,3,P.smoke);rect(c,sx+1,sy-1,2,2,P.cloud);continue;}
        const sprite=this.sprite(r,heap);if(sprite)c.drawImage(sprite,sx-1,sy-1);
        if(type===1 && r[10]===0 && r[1]!==3) {
          rect(c,sx+w-1,sy-6,3,2,P.redShade);rect(c,sx+w,sy-7,1,4,P.redShade);
        }
      }
      this.terrain(scene.subarray(HEADER,HEADER+GROUND),camera);
      // Native low-altitude collision geometry is preserved all the way down
      // to the original bottom edge; the information strip lives at the top.
      this.hud(scene,objects,trainer);
      this.canvas.dataset.renderer='rainbow';
      this.canvas.dataset.tick=String(tick);
      this.canvas.dataset.objects=String(objects.length);
      return true;
    }
    hud(s,objects,trainer) {
      const c=this.c;
      rect(c,8,8,174,29,P.outline);rect(c,9,9,172,27,P.ink);
      const score=s[10]<0?'-'+String(-s[10]).padStart(5,'0'):String(s[10]).padStart(6,'0');
      text(c,'SCORE',15,14,P.pale);text(c,score,15,24,P.cream,2);
      text(c,'LIVES',88,14,P.pale);text(c,trainer?'INF':s[9],88,24,P.gold,2);
      text(c,'LV',137,14,P.pale);text(c,s[18]+1,137,24,P.cream,2);
      rect(c,445,8,187,29,P.outline);rect(c,446,9,185,27,P.ink);
      text(c,'FUEL',452,14,P.pale);
      rect(c,476,13,65,7,P.outline);rect(c,477,14,Math.max(0,Math.min(63,Math.round(s[6]/9000*63))),5,P.mint);
      text(c,'AMMO',452,25,P.pale);text(c,s[7],478,25,P.cream,2);
      text(c,'BOMB',554,14,P.pale);text(c,s[8],587,13,P.gold,2);
      text(c,'HOME',554,25,P.pale);
      text(c,s[16]?'ON':s[4]<s[15]?'>':'<',587,25,P.cream,2);
      // Navigation line is scaled to the real world width, with no fake
      // collection/currency counters or unavailable controls.
      rect(c,195,13,235,20,P.ink);rect(c,196,14,233,18,P.teal);
      for(const r of objects)if(r[0]===1||r[0]===4) {
        const x=197+Math.round(r[2]/s[3]*230);
        rect(c,x,r[0]===1?18:26,r[10]?4:2,r[10]?4:2,r[10]?P.gold:r[6]===1?P.cream:P.red);
      }
      if(s[16]) {rect(c,257,47,126,17,P.ink);text(c,'RETURNING TO BASE',269,53,P.cream);}
      if(s[13]===3) {rect(c,242,175,156,34,P.ink);text(c,'PLANE LOST',270,184,P.gold,2);}
    }
    demo() {
      this.background(420,32);
      const g=new Int32Array(320);
      for(let x=0;x<320;x++) g[x]=Math.round(16+Math.max(0,48-Math.abs(x-250)*.65));
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
  RainbowRenderer.HEADER=HEADER; RainbowRenderer.STRIDE=STRIDE;
  RainbowRenderer.LENGTH=HEADER+GROUND+256*STRIDE;
  RainbowRenderer.text=text;
  window.RainbowRenderer=RainbowRenderer;
  document.querySelectorAll('canvas[data-rainbow-preview]').forEach(canvas=>new RainbowRenderer(canvas).demo());
})();
