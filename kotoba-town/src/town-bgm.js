// Session-only BGM: no autoplay or media request before an explicit user gesture.
export const sceneTracks = {
 tobita:13,school:8,sports:26,sushi:33,izakaya:33,yakiniku:33,ramen:8,soba:33,teishoku:8,
 kissaten:37,wagashi:33,convenience:8,supermarket:8,clothing:31,dagashi:14,hundred:31,
 drugstore:31,bookstore:6,aquarium:5,temple:11,shrine:12,ryokan:13,sento:33,arcade:14,
 karaoke:28,netcafe:28,home:37,clinic:3,station:41,post:41,koban:41,laundry:8,barber:37,
 street:2,festival:26,disney:14,usj:14,aeon:31,bank:41
};
export function trackFor(scene='town',season='spring',night=false){
 const n=scene==='town'?(night&&season!=='winter'?6:({spring:8,summer:2,autumn:13,winter:4}[season]||8)):(sceneTracks[scene]||8);
 return new URL('./audio/maple-'+String(n).padStart(2,'0')+'.mp3',import.meta.url).href;
}
export class TownBGM {
 constructor(onChange=()=>{},onError=()=>{}){
  this.enabled=false;this.volume=8;this.currentTrack=trackFor();this.loadedTrack='';this.phase='off';this.onChange=onChange;this.onError=onError;
  this.audio=new Audio();this.audio.preload='none';this.audio.loop=true;this.audio.setAttribute('playsinline','');this.audio.volume=0;
  this.context=null;this.gain=null;this.source=null;this.revision=0;this.switchTimer=0;this.duckToken=0;this.ducked=false;this.duckTimer=0;
  this.audio.addEventListener('error',()=>{if(this.enabled)this.fail();});
  this.visibility=()=>{if(document.hidden){this.stopPlayback();if(this.enabled){this.phase='paused';this.notify();}}else if(this.enabled)this.play();};
  this.pagehide=()=>this.disable();
  document.addEventListener('visibilitychange',this.visibility);window.addEventListener('pagehide',this.pagehide);
 }
 notify(){this.onChange(this);}
 setup(){
  if(this.context)return;
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C)throw new Error('AudioContext unavailable');
  const context=new C();this.context=context;
  this.gain=context.createGain();this.gain.gain.value=0;
  this.source=context.createMediaElementSource(this.audio);this.source.connect(this.gain);this.gain.connect(context.destination);
  // Web Audio gain also controls volume on iOS, where HTMLMediaElement.volume is fixed.
  this.audio.volume=1;
 }
 target(){return this.enabled&&!document.hidden?(this.volume/100)*(this.ducked?.18:1):0;}
 ramp(value,seconds=.3){
  if(!this.gain)return;
  const g=this.gain.gain,t=this.context.currentTime;
  if(g.cancelAndHoldAtTime)g.cancelAndHoldAtTime(t);else{const v=g.value;g.cancelScheduledValues(t);g.setValueAtTime(v,t);}
  if(seconds)g.linearRampToValueAtTime(value,t+seconds);else g.setValueAtTime(value,t);
 }
 setVolume(value){const n=Number(value);if(!Number.isFinite(n))return;this.volume=Math.round(Math.max(0,Math.min(100,n)));this.ramp(this.target(),.15);this.notify();}
 enable(){if(this.enabled)return;this.enabled=true;this.play();}
 disable(){this.enabled=false;this.stopPlayback();this.phase='off';this.notify();}
 toggle(){this.enabled?this.disable():this.enable();}
 stopPlayback(){++this.revision;clearTimeout(this.switchTimer);this.switchTimer=0;this.ramp(0,0);this.audio.pause();}
 fail(){this.disable();this.loadedTrack='';this.onError('BGMを再生できませんでした。もう一度オンにしてください。');}
 play(){
  if(!this.enabled||document.hidden)return;
  clearTimeout(this.switchTimer);this.switchTimer=0;const revision=++this.revision;
  try{
   this.setup();this.ramp(0,0);
   if(this.loadedTrack!==this.currentTrack){this.audio.pause();this.audio.src=this.currentTrack;this.loadedTrack=this.currentTrack;}
   this.phase='loading';this.notify();
   // Both calls occur within the click handler to preserve mobile user activation.
   const resume=this.context.resume(),play=this.audio.play();
   Promise.all([resume,play]).then(()=>{if(revision!==this.revision||!this.enabled||document.hidden)return;this.phase='playing';this.ramp(this.target(),1.1);this.notify();}).catch(()=>{if(revision===this.revision&&this.enabled)this.fail();});
  }catch{if(revision===this.revision)this.fail();}
 }
 setScene(scene,season,night){
  const track=trackFor(scene,season,night);if(track===this.currentTrack)return;
  this.currentTrack=track;this.notify();if(!this.enabled||document.hidden)return;
  ++this.revision;clearTimeout(this.switchTimer);this.ramp(0,.22);
  this.switchTimer=setTimeout(()=>{this.switchTimer=0;this.play();},240);
 }
 duck(){
  const token=++this.duckToken;clearTimeout(this.duckTimer);this.ducked=true;this.ramp(this.target(),.1);
  const finish=()=>{if(token!==this.duckToken)return;clearTimeout(this.duckTimer);this.ducked=false;this.ramp(this.target(),.6);};
  this.duckTimer=setTimeout(finish,60000);return finish;
 }
 dispose(){this.disable();clearTimeout(this.duckTimer);document.removeEventListener('visibilitychange',this.visibility);window.removeEventListener('pagehide',this.pagehide);this.audio.removeAttribute('src');this.audio.load();this.context?.close();}
}
