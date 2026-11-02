// Rainbow Patrol five-voice sample mixer. GPL-2.0-or-later.
// Sources/licenses: assets/audio/README.md and audition-v05/SOURCES.json.
(() => {
  const SAMPLE={engine:'audition-v05/radial-idle',gun:'impactPunch_heavy_000',
    metal:'impactMetal_light_000',blast:'explosionCrunch_000',boom:'lowFrequency_explosion_000',moo:'audition-v05/moo',wah:'audition-v05/wah-wah',bird:'audition-v05/bird',startup:'audition-v05/startup',argh:'patrol-v06/argh',himmel:'patrol-v06/himmel',victory:'patrol-v06/victory'};
  class RainbowAudio {
    constructor(options={}) {
      this.Context=options.AudioContext||window.AudioContext||window.webkitAudioContext;
      this.fetch=options.fetch||window.fetch.bind(window);
      this.requested=false;this.enabled=false;this.voices=new Map();this.buffers={};
      this.initialStartupWanted=!!options.startup;this.player=null;this.pendingStartup=null;this.startupCount=0;this.lastBirdTick=-100;
      this.airplanes=new Map();this.lastTick=-1;this.lastEffect=0;this.lastBombs=null;this.status='off';
      this.winning=false;
    }
    async setEnabled(enabled) {
      this.requested=enabled;
      if(!enabled) {
        this.enabled=false;this.initialStartupWanted=false;this.pendingStartup=null;this.stopAll();this.status='off';
        if(this.context)await this.context.suspend();return;
      }
      try {
        if(!this.Context)throw new Error('Web Audio unavailable');
        if(!this.context) {
          this.context=new this.Context();
          this.master=this.context.createGain();this.master.gain.value=.55;
          this.filter=this.context.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=6500;
          this.master.connect(this.filter);this.filter.connect(this.context.destination);
          this.loading=Promise.all(Object.entries(SAMPLE).map(async([name,file])=>{
            const response=await this.fetch(`assets/audio/${file}.wav?v=20261102-patrol6`);
            if(!response.ok)throw new Error(`Sample unavailable: ${file}`);
            this.buffers[name]=await this.context.decodeAudioData(await response.arrayBuffer());
          }));
          this.makeCues();
        }
        await this.context.resume();await this.loading;
        if(!this.requested)return;
        this.enabled=this.context.state==='running';this.status=this.enabled?'samples':'blocked';
      } catch(error) {this.enabled=false;this.status='unavailable';console.warn('[Rainbow audio]',error);}
    }
    stop(channel) {
      const voice=this.voices.get(channel);if(!voice)return;
      this.voices.delete(channel);try{voice.source.stop();}catch{}
      voice.source.disconnect();voice.gain.disconnect();voice.pan?.disconnect();
    }
    stopAll() {for(const channel of [...this.voices.keys()])this.stop(channel);}
    makeCues() {
      const rate=22050,make=(name,seconds,fn)=>{
        const b=this.context.createBuffer(1,Math.ceil(rate*seconds),rate),data=b.getChannelData(0);
        let phase=0,seed=12345;
        for(let i=0;i<data.length;i++) {
          const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)|0;
          const noise=(seed>>>0)/2147483648-1;
          const value=fn(t,noise,frequency=>{phase+=frequency/rate;return Math.sin(phase*Math.PI*2);});
          data[i]=Math.round(Math.max(-1,Math.min(1,value))*127)/127;
        }
        this.buffers[name]=b;
      };
      make('whistle',3.2,(t,n,sine)=>{
        const clunk=t<.06?n*(1-t/.06)*.65:0;
        return clunk+sine(1600*Math.exp(-t*.7)+220+12*Math.sin(t*32))*Math.min(1,t/.025)*Math.max(0,1-t/3.2)*.42;
      });
      make('cannon',.85,(t,n,sine)=>(n*.55+sine(100*Math.exp(-t*12)+42)*.65)*Math.exp(-t*7)*Math.min(1,t/.003));
      // An original film-style dive: propeller harmonic, flutter and wind.
      make('dive',2.4,(t,n,sine)=>{
        const flutter=.7+.3*Math.sin(t*Math.PI*48),edge=Math.min(1,t/.025,(2.4-t)/.025);
        return (sine(460+70*Math.sin(t*Math.PI*2/2.4))*.34+n*.28)*flutter*Math.max(0,edge);
      });
    }
    play(channel,name,{gain=.2,rate=1,pan=0,duration,loop=false,priority=0}={}) {
      if(!this.enabled||!this.buffers[name])return null;
      if((this.voices.get(channel)?.priority??-1)>priority)return this.voices.get(channel);
      this.stop(channel);
      const source=this.context.createBufferSource(),level=this.context.createGain();
      source.buffer=this.buffers[name];source.playbackRate.value=rate;source.loop=loop;
      level.gain.value=gain;source.connect(level);
      const stereo=this.context.createStereoPanner?.();
      if(stereo){stereo.pan.value=Math.max(-1,Math.min(1,pan));level.connect(stereo);stereo.connect(this.master);}
      else level.connect(this.master);
      const voice={source,gain:level,pan:stereo,priority,name};this.voices.set(channel,voice);
      source.onended=()=>{if(this.voices.get(channel)===voice)this.stop(channel);};
      const now=this.context.currentTime;source.start(now);
      if(duration){level.gain.setValueAtTime(gain,now);level.gain.exponentialRampToValueAtTime(.001,now+duration);source.stop(now+duration+.01);}
      return voice;
    }
    step(scene,effects) {
      const tick=scene[1];if(tick===this.lastTick)return;
      const reset=tick<this.lastTick;this.lastTick=tick;
      if(reset){this.airplanes.clear();this.player=null;this.pendingStartup=null;this.stopAll();this.lastEffect=effects?.[1]||0;this.lastBombs=null;this.winning=false;}
      const camera=scene[2],audible=this.enabled&&scene[12]!==2;
      if(!audible)this.stopAll();
      if(scene[12]===1){
        if(!this.winning){this.stopAll();if(audible)this.play('jingle','victory',{gain:.35,priority:5});}
        this.winning=true;this.lastEffect=effects?.[1]||this.lastEffect;return;
      }
      this.winning=false;
      if(scene[3]>0){
        const alive=[1,6,8,9].includes(scene[13]);
        const spawn=alive&&scene[12]===0&&(!this.player||!this.player.alive||this.player.level!==scene[18]);
        // Native respawns reuse the same object pointer, and the trainer can
        // restore the life counter. Track the killed-to-live state transition.
        // Consume silent spawns too, so unmute/refuel cannot replay a startup.
        if(spawn){
          this.stop('engine');
          this.pendingStartup=this.requested||(!this.player&&this.initialStartupWanted)?tick:null;
        }
        this.player={alive,level:scene[18]};this.initialStartupWanted=false;
        if(!alive||scene[12]!==0||this.pendingStartup!==null&&tick-this.pendingStartup>20)this.pendingStartup=null;
        if(this.pendingStartup!==null&&audible){
          if(this.play('engine','startup',{gain:.32,rate:1}))this.startupCount++;
          this.pendingStartup=null;
        }
      }
      if(audible&&scene[12]===0&&[1,6,8,9].includes(scene[13])) {
        let engine=this.voices.get('engine');
        if(!engine)engine=this.play('engine','engine',{loop:true,gain:.08});
        if(engine?.name==='engine'){engine.source.playbackRate.setTargetAtTime(.6+scene[11]*.055,this.context.currentTime,.12);engine.gain.gain.setTargetAtTime(scene[17] ? .035 : .09,this.context.currentTime,.12);}
      } else this.stop('engine');
      if(audible) {
        let shot=null;
        for(let i=0;i<scene[14];i++) {
          const r=scene.subarray(348+i*18,348+(i+1)*18);
          if(r[0]===3&&r[17]<100&&r[11]>=9&&r[2]>=camera-40&&r[2]<=camera+360){shot=r;break;}
        }
        if(shot) {
          const pan=(shot[2]-camera-160)/180;
          this.play('gun','gun',{gain:.28,rate:1.8,pan,duration:.075});
        }
      }
      let diving=false;
      for(let i=0;i<scene[14];i++){
        const r=scene.subarray(348+i*18,348+(i+1)*18);if(r[0]!==1)continue;
        const id=r[16]||i,previous=this.airplanes.get(id),pan=(r[2]-camera-160)/180;
        if(audible&&Math.abs(pan)<2&&r[1]===4&&!diving){
          diving=true;
          let voice=this.voices.get('mechanical');
          if(voice?.name!=='dive')voice=this.play('mechanical','dive',{gain:.25,rate:.85,pan,loop:true,priority:4});
          if(voice?.name==='dive'){
            voice.source.playbackRate.setTargetAtTime(.85+Math.min(12,Math.abs(r[13]))*.09,this.context.currentTime,.25);
            voice.gain.gain.setTargetAtTime(.18+Math.min(12,Math.abs(r[13]))*.018,this.context.currentTime,.25);
          }
        }
        if(audible&&Math.abs(pan)<2.5&&r[1]===3&&previous!==3){
          this.stop('mechanical');this.play('mechanical','blast',{gain:.48,rate:.75,pan,priority:5});this.play('fx','boom',{gain:.32,rate:.75,pan,priority:2});
        }
        this.airplanes.set(id,r[1]);
      }
      if(!diving&&this.voices.get('mechanical')?.name==='dive')this.stop('mechanical');
      this.lastBombs=scene[8];
      if(effects?.[0]===1) {
        const pending=[];
        for(let i=0;i<32;i++) {
          const at=4+i*6,id=effects[at],age=tick-effects[at+1];
          if(id>this.lastEffect&&age>=0&&age<3&&Math.abs(effects[at+3]-camera-160)<500)
            pending.push({id,type:effects[at+2],x:effects[at+3],size:effects[at+5]});
        }
        this.lastEffect=effects[1];
        if(audible)for(const event of pending.sort((a,b)=>a.id-b.id)) {
          const pan=(event.x-camera-160)/180;
          if(event.type===4)this.play('mechanical','whistle',{gain:.2,pan,priority:3});
          if(event.type===5)this.play('fx','cannon',{gain:.45,rate:Math.abs(event.size)===4?.85:1.1,pan,priority:1});
          if(event.type===1) {
            this.stop('mechanical');this.play('mechanical','blast',{gain:.42,rate:1.05-event.size*.08,pan,priority:2});
            this.play('fx','boom',{gain:.24,rate:.9,pan,priority:1});
          }
          if(event.type===2&&tick-this.lastBirdTick>=3){this.lastBirdTick=tick;this.play('fx','bird',{gain:event.size>1?.4:.3,rate:1,pan,priority:4});}
          if(event.type===3)this.play('fx','moo',{gain:.65,rate:1,pan,priority:4});
          if(event.type===6&&event.size<0)this.play('jingle','wah',{gain:.32,priority:3});
          if(event.type===7||event.type===8)this.play('fx',event.type===8?'himmel':'argh',{gain:.48,pan,priority:5});
        }
      }
    }
  }
  window.RainbowAudio=RainbowAudio;
})();
