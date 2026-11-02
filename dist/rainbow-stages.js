// READY intermissions use display time and hold the native game clock.
// GPL-2.0-or-later.
(() => {
  class RainbowStages {
    constructor(){this.level=null;this.tick=-1;this.remaining=0;this.at=null;}
    update(scene,now,paused=false){
      const valid=scene[3]>0,playing=scene[12]===0;
      // Tick zero can expose initialized objects before native initdisp has
      // positioned the camera. Hold after the first complete flight step.
      if(valid&&playing&&scene[1]>=1&&(this.level!==scene[18]||scene[1]<this.tick)){
        this.level=scene[18];this.remaining=2200;this.at=now;
      }
      if(valid){this.tick=scene[1];if(!playing)this.remaining=0;}
      if(this.at!==null&&!paused)this.remaining=Math.max(0,this.remaining-Math.max(0,Math.min(100,now-this.at)));
      this.at=now;
      return {blocked:this.remaining>0,level:this.level+1,progress:1-this.remaining/2200};
    }
  }
  window.RainbowStages=RainbowStages;
})();
