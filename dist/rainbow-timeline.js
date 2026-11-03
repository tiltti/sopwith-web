// Smooth display snapshots over the unchanged native clock. GPL-2.0-or-later.
(() => {
  const HEADER=28+320,STRIDE=18;
  class RainbowTimeline {
    constructor(){this.current=null;this.previous=null;this.at=0;this.frozenAt=null;this.nativeTick=-1;}
    push(scene,at) {
      if(scene[1]===this.nativeTick)return;
      const next=Float64Array.from(scene),old=this.current;
      const continuous=old&&next[1]>old[1]&&next[1]-old[1]<=3&&Math.abs(next[4]-old[4])<40;
      this.previous=continuous?old:next;this.current=next;this.at=at;this.nativeTick=scene[1];
      this.oldObjects=new Map();
      for(let i=0;i<this.previous[14];i++) {
        const r=this.previous.subarray(HEADER+i*STRIDE,HEADER+(i+1)*STRIDE);
        this.oldObjects.set(r[16]||i+1,r);
      }
    }
    sample(now) {
      if(!this.current)return null;
      const a=Math.max(0,Math.min(1,((this.frozenAt??now)-this.at)/100)),out=this.current.slice(),old=this.previous;
      for(const n of [2,4,5,11,27])out[n]=old[n]+(out[n]-old[n])*a;
      out[26]=old[1]+(out[1]-old[1])*a;
      for(let i=0;i<out[14];i++) {
        const start=HEADER+i*STRIDE,r=out.subarray(start,start+STRIDE),p=this.oldObjects.get(r[16]||i+1);
        if(!p||p[0]!==r[0]||Math.abs(p[2]-r[2])+Math.abs(p[3]-r[3])>80)continue;
        r[2]=p[2]+(r[2]-p[2])*a;r[3]=p[3]+(r[3]-p[3])*a;
        if(r[0]===1||r[0]===10)r[4]=((p[4]+(((r[4]-p[4]+24)%16)-8)*a)+16)%16;
      }
      return out;
    }
    pause(now){if(this.frozenAt===null)this.frozenAt=now;}
    resume(now){if(this.frozenAt!==null){this.at+=now-this.frozenAt;this.frozenAt=null;}}
  }
  window.RainbowTimeline=RainbowTimeline;
})();
