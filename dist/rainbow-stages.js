// Spawn intermissions and first-flight help use display time. GPL-2.0-or-later.
(() => {
  const READY_MS=2500;
  class RainbowStages {
    constructor(){this.level=null;this.tick=-1;this.remaining=0;this.at=null;this.alive=false;this.spawns=0;this.idle=0;this.tookOff=false;}
    noteInput(){this.idle=0;}
    update(scene,now,paused=false){
      const valid=scene[3]>0,playing=scene[12]===0,alive=[1,6,8,9].includes(scene[13]);
      let delta=this.at===null?0:Math.max(0,Math.min(100,now-this.at));
      // Tick zero precedes native camera placement. A killed-to-live transition
      // also catches trainer respawns, whose life count/pointer can stay equal.
      if(valid&&playing&&alive&&scene[1]>=1&&(this.level!==scene[18]||scene[1]<this.tick||!this.alive)){
        this.level=scene[18];this.remaining=READY_MS;this.spawns++;this.idle=0;delta=0;
      }
      if(valid){this.tick=scene[1];this.alive=alive;if(!playing)this.remaining=0;}
      if(!paused)this.remaining=Math.max(0,this.remaining-delta);
      const blocked=this.remaining>0;
      if(valid&&playing&&this.spawns===1&&!this.tookOff){
        if(!scene[17]||scene[11]>0){this.tookOff=true;this.idle=0;}
        else if(!paused&&!blocked)this.idle+=delta;
      }else this.idle=0;
      this.at=now;
      return {blocked,level:(this.level??scene[18])+1,lives:scene[9],progress:1-this.remaining/READY_MS,takeoffHint:playing&&!blocked&&this.idle>=5000};
    }
  }
  window.RainbowStages=RainbowStages;
})();
