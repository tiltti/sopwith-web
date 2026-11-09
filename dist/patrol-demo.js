// Attract-mode pilot: normal flight inputs, real native weapons/collisions.
// GPL-2.0-or-later.
(() => {
  class PatrolDemo {
    constructor(){this.tick=-1;this.mission=-1;this.started=0;this.direction=1;this.lastBomb=-100;}
    update(s,ground){
      const tick=s[1],mission=s[18],x=s[4],y=s[5];
      if(mission!==this.mission||tick<this.tick){this.mission=mission;this.started=tick;this.direction=s[20]?-1:1;this.lastBomb=-100;}
      this.tick=tick;
      if(tick-this.started>=400)return {level:(mission+1)%3+1,scans:[],bomb:false};
      if(s[12]!==0||![1,6,8,9].includes(s[13]))return {scans:[],bomb:false};
      if(x>s[3]-230)this.direction=-1;else if(x<230)this.direction=1;
      let floor=0;
      for(let ahead=0;ahead<=200;ahead+=10){const wx=Math.max(0,Math.min(ground.length-1,Math.round(x+this.direction*ahead)));floor=Math.max(floor,ground[wx]||0);}
      const height=Math.min(182,Math.max(110,floor+68));
      const desired=((Math.round(Math.atan2(height-y,this.direction*120)*8/Math.PI)%16)+16)%16;
      const error=((desired-s[19]+24)%16)-8,scans=[27];
      if(s[17]||s[11]<5.4)scans.push(54);else if(error)scans.push(error*(s[20]?-1:1)>0?54:56);
      // Fire in bursts. Bomb actual hostile architecture when passing over it.
      let bomb=false,hostileAhead=false;
      for(let i=0;i<s[14];i++){
        const r=s.subarray(348+i*18,366+i*18);
        const ahead=(r[2]-x)*this.direction;
        if(r[6]>0&&r[6]!==1&&((r[0]===1&&[1,6,8,9].includes(r[1]))||(r[0]===4&&r[1]===5))
            &&ahead>0&&ahead<240&&Math.abs(r[3]-y)<35)hostileAhead=true;
        if(r[0]===4&&r[1]===5&&r[6]!==1&&Math.abs(r[2]-x-this.direction*65)<55&&tick-this.lastBomb>16&&!s[17]){bomb=true;this.lastBomb=tick;break;}
      }
      if(hostileAhead&&tick%14<7)scans.push(44);
      return {scans,bomb};
    }
  }
  window.PatrolDemo=PatrolDemo;
})();
