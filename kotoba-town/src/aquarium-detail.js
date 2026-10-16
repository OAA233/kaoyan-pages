// Species silhouettes and patterns for the teaching aquarium, not scale replicas.
export function createAquariumModels(ctx){
 const {box,cyl,sphere,mesh,rod}=ctx;
 const fin=(g,x,y,z,r,h,c,rot=[0,0,0],scale=[1,1,.15])=>{const m=mesh(g,'cone',[r,h,3],c,[x,y,z],rot);m.scale.set(...scale);return m;};
 return(g,w)=>{
  if(w.aquatic&&['coral','seaweed'].includes(w.kind)){
   for(let i=0;i<6;i++){const x=(i-2.5)*.12,h=.35+(i%3)*.17,c=w.kind==='coral'?'#d3998f':'#739e7d';rod(g,[x*.4,.03,0],[x,h,(i%2-.5)*.16],.035,c);if(w.kind==='coral')rod(g,[x,h*.5,0],[x+.14,h*.85,.13],.026,c);else sphere(g,.12,c,[x,h*.7,.02],[.38,1.9,.24]);}return true;
  }
  if(w.kind==='seahorse'){
   sphere(g,.16,'#dea857',[0,.57,0],[.8,1.7,.55]);sphere(g,.14,'#dea857',[.07,.87,0]);rod(g,[.15,.86,0],[.34,.83,0],.035,'#dea857');mesh(g,'torus',[.13,.031,7,18],'#dea857',[-.08,.23,0]);rod(g,[0,.43,0],[-.11,.28,0],.035,'#dea857');sphere(g,.025,'#24384b',[.12,.92,.10]);fin(g,-.14,.59,0,.10,.22,'#e7ce99');return true;
  }
  const k=w.species?.variant||(w.kind==='shark'?'reef-shark':null);if(!k)return false;
  const eye=(x,y,z)=>{for(const a of [-1,1]){sphere(g,.065,'#faf5d8',[x,y,a*z]);sphere(g,.037,'#24384b',[x+.015,y,a*(z+.037)]);}};
  if(k==='garden-eel'||k==='orange-eel'){
   cyl(g,.25,.29,.04,'#dac7a0',[0,.025,0]);rod(g,[0,.05,0],[.02,1.05,0],.075,k==='orange-eel'?'#e39541':'#eee3bd');rod(g,[.02,1.05,0],[.20,1.18,0],.075,k==='orange-eel'?'#e39541':'#eee3bd');sphere(g,.095,k==='orange-eel'?'#e39541':'#eee3bd',[.21,1.18,0]);
   if(k==='orange-eel')for(const y of [.24,.53,.82])cyl(g,.08,.08,.12,'#fff0d8',[.01,y,0]);else for(const [y,z]of[[.2,.073],[.5,.073],[.7,-.073],[.92,.073]])sphere(g,.038,'#474245',[.01,y,z],[1,1,.3]);eye(.235,1.20,.075);return true;
  }
  if(k==='boxfish'){
   box(g,.77,.61,.46,'#e8c869',[0,.42,0]);for(const x of [-.25,0,.25])for(const y of [.26,.47,.65])for(const z of [-.239,.239])sphere(g,.023,'#4d493c',[x,y,z],[1,1,.3]);eye(.31,.56,.25);fin(g,-.59,.4,0,.22,.31,'#e4d59d',[0,0,Math.PI/2]);return true;
  }
  if(k==='puffer'){
   sphere(g,.45,'#d6bd83',[0,.52,0],[1.2,1,.8]);for(let i=0;i<22;i++){const a=i*2.4,y=Math.cos(i*1.6),v=[Math.sin(a)*.47,.52+y*.36,Math.cos(a)*.31];rod(g,v,[v[0]*1.28,.52+y*.49,v[2]*1.3],.017,'#9f8457');}eye(.32,.63,.25);fin(g,-.6,.5,0,.19,.27,'#bda373',[0,0,Math.PI/2]);return true;
  }
  if(k==='sunfish'){
   sphere(g,.48,'#b0c6c8',[0,.7,0],[1.1,1.35,.36]);fin(g,-.05,1.59,0,.22,.80,'#8ba7b0');fin(g,-.05,-.12,0,.2,.64,'#8ba7b0',[0,0,Math.PI]);box(g,.14,.76,.15,'#819da8',[-.48,.7,0]);eye(.39,.85,.14);return true;
  }
  const large=['whaleshark','hammerhead','reef-shark'].includes(k),long=['arowana','pirarucu','cleaner','neon'].includes(k);
  const col={clownfish:'#ee9e45','blue-tang':'#3389d1',lionfish:'#e8d1a1',cleaner:'#61b4da',snapper:'#eacb46',angelfish:'#e6bf4b',arowana:'#b9cecd',neon:'#7ad1cd',pirarucu:'#89967d','reef-shark':'#86a5b0',hammerhead:'#9aafb2',whaleshark:'#6b9cae'}[k]||'#cea683';
  const L=large?1.65:long?1.38:1,H=large?.58:long?.41:.72,Z=large?.65:.36;
  sphere(g,.55,col,[0,.7,0],[L,H,Z]);fin(g,-.69*L,.7,0,large?.34:.23,large?.50:.32,col,[0,0,Math.PI/2]);
  if(k==='hammerhead'){box(g,.37,.23,1.35,col,[.83,.72,0]);eye(.89,.75,.66);}else eye(.40*L,.77,.18*(large?1.65:1));
  fin(g,-.08,large?1.26:1.13,0,large?.28:.18,large?.55:.25,col);for(const a of [-1,1])fin(g,.07,.56,a*(large?.47:.21),large?.34:.17,large?.6:.28,col,[a*Math.PI/2,0,0],[1,1,.2]);
  if(k==='blue-tang'){
   for(const a of [-1,1]){sphere(g,.31,'#243953',[-.13,.74,a*.175],[1.2,.71,.11]);sphere(g,.16,col,[-.12,.77,a*.215],[1.2,.65,.12]);}fin(g,-.70,.7,0,.24,.33,'#f4d74e',[0,0,Math.PI/2]);
  }
  if(k==='clownfish'||k==='lionfish'||k==='angelfish'){
   const xs=k==='clownfish'?[-.28,.10,.35]:[-.35,-.19,-.03,.13,.29];for(const x of xs)for(const a of [-1,1])box(g,k==='clownfish'?.085:.045,.48,.012,k==='angelfish'?'#4c92ba':k==='lionfish'?'#96523c':'#fff2db',[x,.71,a*.187],[0,0,k==='lionfish'?.24:0]);
   if(k==='lionfish')for(let i=0;i<7;i++){const x=(i-3)*.14;rod(g,[x,.92,0],[x*1.65,1.45+(3-Math.abs(i-3))*.07,0],.025,'#a26a48');for(const a of [-1,1])rod(g,[x,.63,a*.1],[x*1.6,.45,a*(.65+Math.sin(i*.7)*.14)],.025,'#b18861');}
  }
  if(k==='snapper')for(const a of [-1,1])for(const y of [.48,.62,.76,.90])box(g,.8,.025,.015,'#68a6c5',[0,y,a*.19]);
  if(k==='cleaner'||k==='neon')for(const a of [-1,1]){box(g,1.17,.06,.018,k==='cleaner'?'#253b4c':'#299deb',[0,.72,a*.19]);if(k==='neon')box(g,.55,.075,.018,'#d6574f',[-.28,.61,a*.16]);}
  if(k==='arowana')for(const a of [-1,1])rod(g,[.60,.7,a*.07],[.91,.85,a*.13],.018,'#c5d6d0');
  if(k==='pirarucu')for(const a of [-1,1])for(let i=0;i<5;i++)rod(g,[-.58+i*.095,.53,a*.12],[-.50+i*.095,.8,a*.18],.023,'#cc866f');
  if(k==='whaleshark')for(let i=0;i<32;i++){const x=((i%8)-3.5)*.19,z=(Math.floor(i/8)-1.5)*.15;sphere(g,.025,'#e4e9d7',[x,.91-Math.abs(x)*.07,z],[1,.3,1]);}
  return true;
 };
}

export function furnishAquarium(world,data,zone,h){
 if(data.id!=='aquarium'||![1,2,5,6,7].includes(zone.index))return false;
 const {sceneGroup,register,surface}=h,items=data.items.filter(w=>w.zone===zone.index);
 const living=new Set('aquarium-fish fish clownfish shark ray seahorse garden-eel squid octopus jellyfish urchin starfish crab shrimp turtle coral seaweed shell rock sand'.split(' '));
 const words=items.filter(w=>living.has(w.kind));
 const add=(w,x,z,y,scale=1)=>{const g=world.group(null,[x,y,z],0,sceneGroup);world.models.model(g,w);g.scale.setScalar(scale);register(g,w);return g;};
 function tank(x,z,W,D,title){
  const g=world.group(null,[x,0,z],0,sceneGroup);world.box(g,W,.45,D,'#517887',[0,.23,0]);world.box(g,W-.22,.05,D-.22,'#d5c79f',[0,.49,0]);
  world.box(g,W,.10,D,'#f2deaf',[0,.49,0]);world.box(g,W-.15,.025,D-.15,'#a4d5dc',[0,.55,0]);
  for(const a of [-1,1]){for(const b of [-1,1])world.box(g,.08,2.65,.08,'#84afba',[a*W/2,1.8,b*D/2]);world.box(g,W,.10,.09,'#c9e4e0',[0,3.15,a*D/2]);const glass=world.box(g,W-.10,2.52,.028,'#b2dfeb',[0,1.8,a*D/2]);glass.material=glass.material.clone();glass.material.transparent=true;glass.material.opacity=.10;glass.material.depthWrite=false;const gw=items.find(w=>w.kind==='glass');if(gw)register(glass,gw);}
  world.collider(zone.x+x,zone.z+z,W,D);const tw=items.find(w=>w.kind==='tank');if(tw)register(g,tw);
  world.label(sceneGroup,title,Math.min(W,4.6),.38,[x,.75,z+D/2+.08],0,'#294e64','#eef7e8');return g;
 }
 if(zone.index===1){
  tank(0,-1,14,10,'海の大きな生きもの');let i=0;
  for(const w of words){if(['rock','sand'].includes(w.kind)){add(w,-5+i%3,-4,.62,1);i++;continue;}const n=i++;add(w,((n%3)-1)*4.25,-3.8+Math.floor(n/3)*3.0,1.2,w.species?.variant==='whaleshark'?1.65:w.kind==='shark'?1.25:1.1);}
 }else if(zone.index===2){
  // Independent tanks keep jellyfish and other invertebrates out of the fish tanks.
  words.forEach((w,i)=>{const x=(i%3-1)*4.25,z=-3.5+Math.floor(i/3)*3.45;tank(x,z,3.5,2.8,w.jp);add(w,x,z,.8,['coral','seaweed'].includes(w.kind)?.8:1.0);});
 }else if(zone.index===5){
  const fish=words.filter(w=>!['coral','seaweed'].includes(w.kind));
  for(let t=0;t<4;t++){const x=(t%2-.5)*7.2,z=-3.0+Math.floor(t/2)*5.6;tank(x,z,6.2,4.6,t===0?'サンゴ礁':t===1?'しま模様':t===2?'ひれと体の形':'海の小さな魚');
   for(const [i,w]of fish.slice([0,3,5,7][t],[3,5,7,9][t]).entries())add(w,x+(i-1)*1.85,z+.25,1.18,.95);
   for(const [j,w]of words.filter(w=>['coral','seaweed'].includes(w.kind)).entries())add(w,x+(j?2:-2),z-1.3,.58,.8);
  }
 }else if(zone.index===6){
  tank(0,-1,11,6,'砂から顔を出す魚');for(const [i,w]of words.entries())for(let k=0;k<5;k++)add(w,(i-.5)*5+(k%3-1)*.7,-2+Math.floor(k/3)*1.1,.60,1.1);
 }else{
  for(const [i,w]of words.entries()){const x=(i-1)*4.8;tank(x,-1,4.2,8,w.jp+' · 淡水');const count=w.species?.variant==='neon'?7:1;for(let n=0;n<count;n++){const g=add(w,x+(count>1?(n%2-.5)*1.2:0),-1+(count>1?(Math.floor(n/2)-1.5)*1.2:0),1.15,w.species?.variant==='pirarucu'?1.5:count>1?.65:1.3);if(count===1)g.rotation.y=Math.PI/2;}}
 }
 // Information displays remain outside the water.
 surface(0,7.4,4,1,.8);const guide=world.label(sceneGroup,'魚の名前を調べよう',3.6,.65,[0,.89,7.4]);guide.rotation.x=-Math.PI/2;return true;
}
