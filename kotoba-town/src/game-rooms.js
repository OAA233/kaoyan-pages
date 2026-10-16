import {furnishConnected} from './connected-furniture.js';
import {buildDetailedRoom} from './detail-rooms.js';
// Purpose-built overhead rooms. Fixtures, display surfaces and walking paths are laid out together.
export function buildGameRoom(world,data,zone){
 const {x:ox,z:oz,index}=zone,R=world.root,T=world.camera.constructor;
 const sceneGroup=world.group(null,[ox,0,oz]);const used=new Set(),surfaces=[],fixtureGroups=[];
 const words=data.items.filter(w=>w.zone===index&&!w.workPosition&&!w.menuOnly),outdoor=['temple','street','festival','park'].includes(data.layout);
 const box=(w,h,d,c,x,y,z,rot)=>world.box(sceneGroup,w,h,d,c,[x,y,z],rot);
 const localGroup=(x,z,y=0)=>world.group(null,[x,y,z],0,sceneGroup);
 const register=(g,w)=>{if(w){used.add(w.id);world.register(g,'word',w);}return g;};
 const find=(kind,names=[])=>words.find(w=>names.includes(w.jp))||data.items.find(w=>names.includes(w.jp))||words.find(w=>w.kind===kind&&!used.has(w.id))||words.find(w=>w.kind===kind);
 function put(kind,x,z,scale=1,names=[],y=0){const w=find(kind,names),g=localGroup(x,z,y);world.models.model(g,w?{...w,kind}: {kind,jp:({display:'ショーケース',board:'黒板'})[kind]||''});g.scale.setScalar(scale);register(g,w);fixtureGroups.push({kind,g});return g;}
 function fixture(kind,x,z,scale=1,names=[],y=0){const g=put(kind,x,z,scale,names,y);if(['fridge','washer','sofa','bed','exam-bed','locker','wardrobe','vending','train','claw-machine','arcade-machine','photo-booth'].includes(kind)){const b=new world.THREE.Box3().setFromObject(g),v=b.getSize(new world.THREE.Vector3());world.collider(ox+x,oz+z,v.x*.8,v.z*.8);}return g;}
 function surface(x,z,w=3,d=1.3,y=1.1,color='#d9b084'){const top=box(w,.15,d,color,x,y-.075,z);fixtureGroups.push({kind:'table',g:top});register(top,find('table'));for(const dx of [-w*.42,w*.42])for(const dz of [-d*.32,d*.32])box(.12,y,.12,'#b4906c',x+dx,y/2,z+dz);surfaces.push({x,z,w,d,y,g:top});world.collider(ox+x,oz+z,w,d);return surfaces.at(-1);}
 function shelf(x,z,w=4,h=2.6,color='#a8c2ad'){const frame=box(w,h,.10,color,x,h/2,z-1.05);fixtureGroups.push({kind:'shelf',g:frame},{kind:'bookshelf',g:frame},{kind:'shelf-support',g:frame});register(frame,find('shelf')||find('bookshelf'));for(const dx of [-w/2,w/2])box(.12,h,.75,color,x+dx,h/2,z-.72);for(const [y,offset] of [[.38,.8],[1.12,0],[1.87,-.8]]){box(w+.1,.10,.85,'#efdfbd',x,y-.05,z+offset);surfaces.push({x,z:z+offset,w:w-.25,d:.64,y});}world.collider(ox+x,oz+z,w,2.45);}
 function plant(x,z,scale=1){return put('flowerpot',x,z,scale);}
 function windowPanel(x,z,angle=0){const g=localGroup(x,z);g.rotation.y=angle;world.box(g,3.5,2.4,.10,'#ead4b1',[0,1.8,0]);const panel=new world.THREE.Group();panel.name='opening-panel';g.add(panel);world.box(panel,3.15,1.9,.04,'#a9d4d0',[0,1.84,.075]);g.userData.movingPart='opening-panel';g.userData.sliding=true;for(const dx of [-1.55,0,1.55])world.box(g,.09,2,.10,'#fff1d1',[dx,1.84,.11]);world.box(g,3.3,.12,.35,'#e1be91',[0,.91,.16]);fixtureGroups.push({kind:'window-shell',g});register(g,find('window-shell'));}
 let groundLayer=0;function carpet(x,z,w,d,c){return box(w,.035,d,c,x,.026+groundLayer++*.013,z);}
 function seat(x,z,angle=0){const g=fixture('chair',x,z,.95);g.rotation.y=angle;return g;}
 function counter(x,z,w=6,d=1.25){const base=box(w,1.2,d,'#bf9270',x,.6,z);fixtureGroups.push({kind:'counter',g:base});register(base,find('counter'));box(w+.15,.15,d+.16,'#efd0a2',x,1.25,z);world.collider(ox+x,oz+z,w,d);surfaces.push({x,z,w:w-.25,d:d-.2,y:1.33});return surfaces.at(-1);}
 function dining(x,z,yakiniku=false){surface(x,z,3,1.7,1.05);seat(x-1.05,z+1.25);seat(x+1.05,z+1.25);seat(x-1.05,z-1.25,Math.PI);seat(x+1.05,z-1.25,Math.PI);for(const dx of [-.8,.8]){put('plate',x+dx,z,.65,[],1.14);put('cup',x+dx,z+.45,.52,[],1.14);put('chopsticks',x+dx,z-.5,.65,[],1.14);}if(yakiniku){const g=localGroup(x,z,1.06);world.cyl(g,.53,.53,.08,'#5d6a67');for(let i=-3;i<=3;i++)world.rod(g,[-.42,.06,i*.13],[.42,.06,i*.13],.018,'#b9c8bd');world.cyl(g,.20,.46,.70,'#a0b7ad',[0,2.1,0]);}}
 const floors={restaurant:'#d8b68c',retail:'#e7dac4',school:'#d8bc8e',sports:'#d5be90',aquarium:'#b7d6d4',temple:'#c4cba3',home:'#d4bd92',bath:'#bfdbd7',arcade:'#c5c1d6',karaoke:'#d0bfd0',netcafe:'#c1ccb9',clinic:'#dde5d2',station:'#d3d8c7',service:'#dfcba9',laundry:'#d8e1d3',street:'#b6c998',festival:'#cdd0a9',park:'#b7ce9b'};
 const floor=world.buildingFloor;
 if(words.some(w=>w.kind==='floor'||w.kind==='ground'))register(floor,find('floor')||find('ground'));
 const title=world.spriteLabel(zone.jp,[ox,2.9,oz-5.2],Math.min(3.8,zone.jp.length*.32+1));title.userData.zone=index;
 const l=data.layout,name=zone.jp;
 const bespoke=furnishConnected(world,data,zone,{box,localGroup,put,fixture,surface,shelf,carpet,counter,plant,register,find,sceneGroup,surfaces,used})||buildDetailedRoom(world,data,zone,{box,localGroup,put,fixture,surface,shelf,carpet,counter,plant,register,find,sceneGroup,surfaces,used});
 if(bespoke){}else if(l==='restaurant'){
  if(/調理|厨房/.test(name)){counter(-.5,-4.5,10.5,1.7);fixture('fridge',5.8,-4.5,1.05);fixture('sink',-5.5,-.8,1);fixture('stove',-1.4,-4.5,1,[],1.35);shelf(3.3,-.2,4);surface(-3,2.4,4,1.6,1.05);}
  else if(/会計|券売|包装/.test(name)){counter(1,-3,6.5,1.5);fixture('register',1.8,-3,1,[],1.33);plant(-5,-4.5,1.4);surface(-3,1.6,3.8,1.5);fixture('bench',4,3,1.2);}
  else if(/食材|料理|ショーケース/.test(name)){counter(-3.1,-3.9,6,2);counter(3.2,-3.9,6,2);counter(-3.1,1,6,2);counter(3.2,1,6,2);for(const x of [-5.8,5.8])plant(x,4.7,1.1);}
  else if(/座敷|茶席/.test(name)){for(const x of [-3.6,3.6]){carpet(x,-1.4,5.5,5.3,'#b8c79b');surface(x,-1.3,2.9,1.7,.56);for(const z of [-3.1,.6])for(const xx of [-.9,.9])put('cushion',x+xx,z,1.2);}shelf(0,-5.9,4);plant(5.8,4,1.2);}
  else{counter(0,-4.2,11,1.65);for(const x of [-4,-2,0,2,4])seat(x,-2.6);dining(-3.4,1.3,data.id==='yakiniku');dining(3.4,1.3,data.id==='yakiniku');plant(-6.2,4.5,1.2);plant(6.2,4.5,1.2);if(data.id==='sushi'){const display=fixture('display',0,-4.2,1,['食材ケース'],1.34);display.scale.y=.7;}}
 }else if(l==='retail'){
  if(/レジ/.test(name)){counter(1,-2.7,6,1.8);fixture('register',1.3,-2.7,1,[],1.36);shelf(-4.4,-4.5,3.4);fixture('bench',3.8,3.5,1.1);plant(-5.5,3.5,1.2);}
  else if(data.id==='clothing'){
   if(/試着/.test(name)){for(const x of [-4,0,4]){fixture('partition',x,-4.5,1);fixture('curtain',x,-3.5,.9);}fixture('mirror',5.5,1,1);surface(-3.8,1.7,4,2,.8);}
   else{shelf(-3.5,-4.5,5.5,2.6,'#acb9c1');shelf(3.5,-4.5,5.5);surface(-3,1.3,4.8,2.3,.85);surface(3,1.3,4.8,2.3,.85);}
  }else{shelf(-4.8,-4.8,3.8);shelf(-.1,-4.8,3.8);shelf(4.6,-4.8,3.8);shelf(-3.6,-.8,5.1);shelf(3.4,-.8,5.1);surface(4.3,3,3.4,1.6,.86);plant(-5.8,4.5,1.2);}
 }else if(l==='school'){
  if(index===0){box(7,1.55,.15,'#558c76',0,2,-6.5);world.label(sceneGroup,'きょうのことば',4.6,.6,[0,2.2,-6.4],0,'#558c76','#fff2d4');fixtureGroups.push({kind:'board',g:sceneGroup.children.at(-2)});surface(0,-4.5,2.8,1.5,1.15);for(const x of [-4,0,4])for(const z of [-1.5,2]){surface(x,z,2.2,1.35,.93);seat(x,z+1.05);}}
  else if(index===1){shelf(-4.8,-4.5,3.6);shelf(0,-4.5,3.6);shelf(4.8,-4.5,3.6);dining(-3,1);dining(3,1);}
  else if(index===2){fixture('exam-bed',-3,-1,1.15);fixture('exam-bed',3,-1,1.15);shelf(-4.7,-5,3);counter(1,-5,5.5);fixture('firstaid',1,-5,1,[],1.35);}
  else if(index===4){carpet(0,0,12.5,10.3,'#cfc899');fixture('rail',-4,-3,1.3,['鉄棒']);carpet(3,-2,5,4,'#e7d4a7');plant(-5,3,1.4);fixture('bench',3,4,1.2);surface(-3,1,4,1.4,.60);}
  else{for(const x of [-5,-2.5,2.5,5])fixture(index===5?'locker':'cabinet',x,-4.5,1);fixture('bench',0,1.5,1.4);surface(0,-1.5,4,1.3,.8);}
 }else if(l==='sports'){
  if([2,3,4,5,8,9].includes(index)){
   carpet(0,0,12.5,10.5,index===8?'#8fbe92':index===9?'#d8aa94':'#c9c69c');for(const x of [-5.9,5.9])box(.065,.015,9.8,'#fff1d2',x,.06,0);for(const z of [-4.9,0,4.9])box(11.8,.015,.065,'#fff1d2',0,.061,z);
   if(index===2){fixture('basketgoal',0,-4,1);fixture('basketgoal',0,4,1).rotation.y=Math.PI;}
   if(index===3||index===4)fixture('net',0,0,1.9);
   if(index===5)for(const x of [-3,3])fixture('pingpong',x,0,1.15);
   if(index===8)for(const z of [-4,4])fixture('net',0,z,1.2);
   surface(5.7,0,1.1,3.2,.7);
  }else if(index===1){for(const x of [-4.5,0,4.5])fixture('treadmill',x,-3,1.05);fixture('bike',-4,1.3,1);surface(.4,2.2,5,1.5,.7);carpet(4.3,2.3,2.3,3.3,'#b2c5ca');}
  else if(index===6){fixture('pool',0,-1.6,2.7);surface(5.8,3.7,2,2,.65);fixture('bench',-4.6,4,1);}
  else if(index===7){for(const x of [-5,-2.5,0,2.5,5])fixture('locker',x,-4,1);fixture('bench',-3,1.3,1.4);fixture('bench',3,1.3,1.4);surface(0,3.7,3.5,1.2,.7);}
  else{counter(0,-3.8,9);fixture('bench',-4.2,1.8,1.6);fixture('bench',4.2,1.8,1.6);surface(0,1,3,2,.8);plant(-5.9,-4.3,1.3);}
 }else if(l==='aquarium'){
  if(index===0){counter(1,-3,7);fixture('register',2,-3,1,[],1.34);plant(-5,-4,1.5);surface(-3,1.7,4,2,1);fixture('bench',4,3,1.3);}
  else if(index===4){shelf(-4,-4.5,5);shelf(3.5,-4.5,5);surface(-3,1,5,2,1);surface(3,1,5,2,1);}
  else if(index===3){carpet(0,-2,11,6.7,'#aed4dc');carpet(0,.4,9,4.2,'#f2f0dc');fixture('rock',-4,-1.4,2);fixture('rock',4,-2.5,2);surface(5.8,3.6,1.8,2,.8);}
  else{const tank=fixture('tank',0,-3,2.2);tank.scale.z=1.6;const glassWord=find('glass');if(glassWord)tank.traverse(o=>{if(o.userData.surfaceKind==='glass')register(o,glassWord);});carpet(0,-.9,11,5,'#9bcdd4');surface(5.8,3.6,1.8,2,.8);if(index===1){for(const [i,w]of data.items.filter(w=>['fish','shark','ray','turtle'].includes(w.kind)).entries()){const fish=localGroup(-3+i*2, -2.8,1.4+i%2*.7);world.models.model(fish,w);world.register(fish,'word',w);}}}
 }else if(l==='temple'){
  carpet(0,1,3.6,12.4,'#ded2b3');
  if(index===0){fixture(data.id==='shrine'?'torii':'templegate',0,-1.8,2.1);for(const x of [-4.8,4.8])fixture('stone-lantern',x,2,1.3);}
  else if((data.id==='temple'&&index===1)||(data.id==='shrine'&&index===2)){fixture(data.id==='temple'?'templehall':'shrinehall',0,-2.5,2.1);fixture('offering',0,2.3,1.3);surface(-4.8,2.2,2.7,1.7,.8);}
  else if(data.id==='temple'&&index===3){fixture('bellhouse',0,-1.5,1.9);fixture('bell',0,-1.5,2.2,[],1.15);surface(4.5,2.7,3.3,1.4,.75);}
  else if(data.id==='shrine'&&index===3){fixture('bellhouse',0,-1.5,1.8);fixture('basin',0,-1.5,2);surface(4.8,2.5,3,1.6,.7);}
  else if(index===4){fixture('stall',0,-3,2.1);surfaces.push({x:0,z:-2.8,w:5,d:1.4,y:2.1});surface(-4.1,2,4.7,2,.6);surface(3.6,2,4.7,2,.6);}
  else{if(data.id==='temple'&&index===2)fixture('basin',4,1.3,1.2);fixture('pond',-2,-1,1.8);fixture('bridge',-2,0,1.2);fixture('bench',4.5,2.5,1.1);for(const [x,z]of[[-5,2],[5,-3],[-4,-4]])fixture('rock',x,z,1.6);surface(3,-4,4,1.6,.7);}
 }else if(l==='home'){
  if(/和室|居間|寝室/.test(name)){carpet(0,0,12.2,10.1,'#bfc99e');for(let x=-4;x<6;x+=3)box(.045,.025,10.1,'#8da885',x,.06,0);if(/寝室/.test(name)){fixture('bed',-3,-1,1.5);fixture('wardrobe',4,-4,1.4);surface(3,1.2,4,1.6,.8);}else{fixture('sofa',0,-4,1.5);fixture('tv',5,-1.5,1.5,[],.7);surface(0,-.6,4,2,.6);for(const x of [-4,4])put('cushion',x,.5,1.8);shelf(-5,-4,3);}plant(-5.7,4,1.4);}
  else if(/台所|食事/.test(name)){counter(0,-4.5,10);fixture('sink',-3.7,-4.5,1,[],1.35);fixture('stove',.6,-4.5,1,[],1.36);fixture('fridge',5.5,-3,1.2);dining(0,1.3);}
  else if(/浴|洗面/.test(name)){fixture('bathtub',-2,-2,1.9);fixture('shower',4,-3,1.2);fixture('sink',4,0,1);surface(1,3.6,6,1.5,1);}
  else if(/庭|ベランダ/.test(name)){for(const x of [-4,0,4])plant(x,-4,1.7);fixture('clothesrack',0,0,1.4);surface(-3.2,3,5,1.5,.7);}
  else{fixture('cabinet',-4,-4,1.4,['靴箱']);counter(2,-4,6);carpet(0,1.8,4,3,'#aec4ac');fixture('umbrella-stand',5.5,3,1.2);surface(-3.7,.6,4,1.6,.8);}
 }else if(l==='bath'){
  if(index===2){for(const x of [-4.5,0,4.5]){fixture('shower',x,-4.5,1.1);fixture('stool',x,-2.8,.9);fixture('tub',x-.8,-2.5,.9);}surface(0,2,9,1.6,.7);}
  else if(index===3){fixture('bathtub',0,-2,2.4);fixture('bench',-4.7,3.9,1.2);surface(3.4,3.4,4.5,1.4,.7);}
  else if(index===1){for(const x of [-5,-2.5,0,2.5,5])fixture('locker',x,-4.5,1.05);surface(0,1.4,6.6,2,.9);}
  else{counter(0,-3.8,7);fixture('sofa',-3,1.3,1.3);fixture('vending',5,-2.5,1.2);surface(3,2.5,4,1.5,.8);}
 }else if(l==='arcade'){
  const kind=index===0?'claw-machine':index===3?'photo-booth':'arcade-machine';
  for(const x of [-4.5,-1.5,1.5,4.5])fixture(kind,x,-4,1.12);
  for(const x of [-4.5,4.5])fixture(kind,x,.6,1.12);
  surface(0,2,4.8,1.5,.9);carpet(0,0,3.3,9,'#d9c9da');
 }else if(l==='karaoke'){
  if(index===1){fixture('sofa',0,-4,2);fixture('sofa',-5,0,1.2).rotation.y=Math.PI/2;fixture('tv',5,-1.5,1.8,[],.6);surface(0,-.7,5,2.7,.7);shelf(4,3.4,4);}
  else if(index===2){counter(0,-4,11,1.8);fixture('coffee-machine',-4,-4,.7,[],1.35);surface(-3,1.2,5,2);surface(3,1.2,5,2);}
  else{counter(0,-4.1,8);fixture('sofa',-3,1.5,1.3);fixture('sofa',3,1.5,1.3);surface(0,-.4,3.3,1.5,.65);}
 }else if(l==='netcafe'){
  if(index===1){for(const x of [-4.5,0,4.5])shelf(x,-4.6,3.4);fixture('sofa',-3,1.8,1.3);fixture('sofa',3,1.8,1.3);surface(0,-.4,3,1.5,.7);}
  else if(index===2||index===3){for(const x of [-4.5,0,4.5]){box(3.5,1.4,.14,'#b5c4ae',x,.7,-4.6);for(const dx of [-1.8,1.8])box(.14,1.4,4,'#b5c4ae',x+dx,.7,-2.7);surface(x,-3.5,3,1.4,1.05);fixture('tv',x,-3.7,.8,[],1.12);seat(x,-1.8);}surface(0,2.9,4,1.4,.8);}
  else if(index===4){counter(0,-3.9,11);fixture('coffee-machine',-4,-3.9,.8,[],1.36);shelf(-3.4,.1,5);shelf(3.4,.1,5);}
  else{counter(0,-3.3,9);fixture('register',1,-3.3,1,[],1.36);surface(-3,1.5,4.5,1.7,.9);fixture('sofa',3,2.3,1.3);}
 }else if(l==='clinic'){
  if(index===4){for(const x of [-4.5,0,4.5])shelf(x,-4.8,3.6);counter(0,.2,11,1.6);fixture('register',4,.2,.85,[],1.36);}
  else if(index===2||index===3){fixture('exam-bed',-3,-1,1.4);fixture('ivstand',-5.2,-2,1.1);counter(3,-4.5,5.8);fixture('tv',2,-4.5,.8,[],1.34);surface(3,1.8,4,2,1);seat(3,3.2);}
  else if(index===1){for(const z of [-3.5,0,3.5])for(const x of [-3.5,3.5])fixture('bench',x,z,1.35);surface(0,-5.5,2.5,1.3,.8);}
  else{counter(0,-3,10,1.7);fixture('register',3,-3,1,[],1.35);surface(-3,1,4.5,1.6,1);fixture('bench',3.5,2,1.4);plant(-5.8,-4.8,1.3);}
 }else if(l==='station'){
  if(index===3||index===4){const train=fixture('train',-3,0,1.55);train.rotation.y=0;carpet(1.8,0,1.0,12,'#edcf7c');fixture('bench',4.2,2.8,1.2);surface(4,-3.4,4.2,2,.95);}
  else if(index===2){for(const x of [-4,-2,0,2,4]){box(.8,1.1,2.4,'#8db8b0',x,.6,-1);box(.82,.08,2.45,'#dbe1c5',x,1.2,-1);}surface(0,-5,8,1.5,1);}
  else if(index===1){for(const x of [-4,0,4])fixture('ticket-machine',x,-4,1.2);surface(0,1.3,8,1.8,1);}
  else{fixture('busstop',-5,-3,1.3);fixture('vending',5,-4,1.15);surface(0,-3.5,6,1.5,.95);fixture('bench',0,2.5,1.6);}
 }else if(l==='laundry'){
  if(index<2){for(const x of [-4.8,-1.6,1.6,4.8])fixture(index===1?'dryer':'washer',x,-4,1.35);surface(-3,1,5,2,.95);surface(3,1,5,2,.95);}
  else{surface(0,-2,9,2.7,1);fixture('bench',-3,2,1.4);fixture('bench',3,2,1.4);}
 }else if(data.id==='barber'){
  if(index===1||index===2){for(const x of [-4.3,0,4.3]){fixture('mirror',x,-5,1.2);fixture(index===2?'shampoo-chair':'barber-chair',x,-2.4,1.25);surface(x,-4.1,2.8,1,1.1);}surface(0,2.8,5,1.5,.9);}
  else{counter(1,-4,7);fixture('sofa',-3,1,1.4);surface(3,1,4,2,.7);plant(-5.8,-4,1.2);}
 }else if(l==='festival'){
  for(const x of [-4,3.5]){fixture('stall',x,-3,1.65);surfaces.push({x,z:-2.5,w:4.5,d:1.3,y:1.66});}
  for(const x of [-6,0,6])put('lantern',x,1.8,.8,[],2.8);surface(-3.6,2.5,4.7,1.8,.85);surface(3.4,2.5,4.7,1.8,.85);
 }else if(l==='street'){
  if(index===0||index===1){fixture('shop',-4,-3,1.25);fixture('shop',3.8,-3,1.25);carpet(0,2,13,3.3,'#bdc2b0');surface(0,-.8,2.8,1.4,.8);}
  else if(index===3){carpet(0,-1,12,3.5,'#99cbd0');fixture('bridge',0,-1,2);fixture('bench',-4,3,1.3);surface(4,3,4,1.5,.8);}
  else if(index===4){carpet(0,0,13,5,'#acb6ad');for(let i=-3;i<4;i++)box(.6,.03,4.2,'#f7e8c6',i*1.15,.07,0);fixture('trafficlight',-5,3.5,1.3);fixture('trafficlight',5,-3.5,1.3);surface(4,4.2,4,1.1,.6);}
  else{fixture('bench',-4,1.5,1.3);fixture('bench',4,1.5,1.3);carpet(0,-2,8,4,'#a1c38c');surface(0,3.5,4,1.5,.7);}
 }else if(l==='park'){world.buildParkZone?.(data,zone,sceneGroup,{put,surface,counter,carpet,shelf,plant});}
 else{counter(0,-3.8,10,1.6);fixture('register',3,-3.8,1,[],1.34);surface(-3.3,1.3,5,2,.95);surface(3.3,1.3,5,2,.95);shelf(-5,-5.5,3);plant(5.8,4,1.2);}
 for(const w of words.filter(w=>w.detail?.place&&!used.has(w.id))){const a=w.detail.place,g=localGroup(a[0],a[2],a[1]);world.models.model(g,w);g.scale.setScalar(a[3]||1);if(a[4])g.rotation.x=a[4];register(g,w);}
 for(const w of words.filter(w=>w.detail?.floor&&!used.has(w.id))){const a=w.detail.floor,g=localGroup(a[0],a[1]);world.models.model(g,w);g.scale.setScalar(a[2]||1);register(g,w);world.collider(ox+a[0],oz+a[1],(w.detail.width||1.7)*(a[2]||1),(w.detail.depth||1.3)*(a[2]||1));}
 // Bind architectural words to real parts of the room instead of putting miniature rooms on tables.
 for(const item of words){const shell=world.shellFixtures?.get(item.kind);if(shell&&!used.has(item.id)){world.entities.set(item.id,shell);used.add(item.id);if(!shell.userData.target)world.register(shell,'word',item);}}
 const largeKinds=new Set('private-room floor-mattress recliner footrest side-table luggage-rack shower-booth dryer water-dispenser power-rack dumbbell-rack weight-bench plate-rack bench-press lat-pulldown cable-machine chest-press leg-press weight-stack spin-bike elliptical rower floor-chair oshiire andon bamboo-blind barber-chair shampoo-chair hot-case fish-counter change-machine mic-stand aircon cart stroller door entryfloor elevator ticketgate menu sign room-sign exit-sign station-sign lamp lighting-shell lantern clock alarmclock board roof wall wall-shell floor ground garden path road tracks platform deck pillar window-shell lighting-shell shelf-support templegate templehall shrinehall torii bellhouse train bench table counter chair shelf cabinet bookshelf locker wardrobe bed exam-bed sofa fridge freezer washer tank pool bathtub basketgoal pingpong net court treadmill partition fittingroom'.split(' '));
 for(const w of words.filter(w=>!used.has(w.id)&&largeKinds.has(w.kind)&&!(w.kind==='net'&&w.jp==='網'))){
  const match=fixtureGroups.find(f=>f.kind===w.kind&&!f.g.userData.target)||fixtureGroups.find(f=>f.kind===w.kind);
  if(match){world.entities.set(w.id,match.g);used.add(w.id);if(!match.g.userData.target)register(match.g,w);}
 }
 // A few standalone fixtures belong against the sides, never on a tabletop.
 let extraFixture=0;
 for(const w of words.filter(w=>!used.has(w.id)&&largeKinds.has(w.kind)&&!(w.kind==='net'&&w.jp==='網'))){
  if(['floor','ground','path','road','tracks','platform','garden','deck','court'].includes(w.kind)){world.entities.set(w.id,floor);used.add(w.id);continue;}
  const isSign=['menu','sign','room-sign','exit-sign','station-sign','clock','alarmclock','board','lamp','lighting-shell','lantern'].includes(w.kind);
  const g=localGroup(extraFixture%2?6.2:-6.2,4.0-Math.floor(extraFixture/2)*1.9,isSign&&w.kind!=='menu'&&w.kind!=='lamp'?1.8:0);extraFixture++;
  try{world.models.model(g,w);g.scale.setScalar(w.kind==='door'?1:isSign?.7:.85);register(g,w);}catch(e){world.modelErrors.push({id:w.id,kind:w.kind,message:e.message});}
 }
 const remaining=words.filter(w=>!used.has(w.id)).sort((a,b)=>Number(!!b.product)-Number(!!a.product));
 const aquatic=l==='aquarium'&&index===3;
 if(remaining.length&&!surfaces.length&&!aquatic)surface(0,3.3,10,1.6,.85);
 let slots=[];
 for(const sf of surfaces){const columns=Math.max(2,Math.floor(sf.w/.83)),rows=sf.d>1.6?2:1;for(let r=0;r<rows;r++)for(let c=0;c<columns;c++)slots.push({x:sf.x+(c-(columns-1)/2)*Math.min(.85,sf.w/columns),z:sf.z+(r-(rows-1)/2)*.66,y:sf.y,scale:sf.d<1?.55:.65});}
 if(remaining.length>slots.length&&!aquatic){shelf(5.6,3.5,2.5);const sf=surfaces.slice(-3);for(const a of sf)for(let j=0;j<3;j++)slots.push({x:a.x+(j-1)*.75,z:a.z,y:a.y,scale:.55});}
 let placed=[];
 remaining.forEach((w,i)=>{
  const slot=aquatic?(index===3?{x:-3+i*2.6,z:.1,y:.06,scale:1.4}:{x:-4.2+(i%6)*1.65,z:-3.6+(Math.floor(i/6)%3)*.65,y:1.2+(i%3)*.7,scale:.8}):slots[i%slots.length];
  const g=localGroup(slot.x,slot.z,slot.y);
  try{world.models.model(g,w);g.scale.setScalar(slot.scale);if(!aquatic)world.fitDisplayItem(g,{...slot,width:.76,depth:slot.scale===.55?.56:.60});register(g,w);placed.push({w,g,slot});}
  catch(e){world.modelErrors.push({id:w.id,kind:w.kind,message:e.message});}
 });
 // Stock duplicate packages for a full shop, with the same learning target.
 const stock=placed.filter(p=>!['menu','sign','room-sign','exit-sign','paper','card','lamp','lantern','door'].includes(p.w.kind)&&(['bookstore','dagashi'].includes(data.id)||p.w.kind!=='book'));if((l==='retail'||data.id==='clinic'&&index===4)&&stock.length){for(let i=placed.length;i<slots.length;i++){const {w,g,slot}=stock[i%stock.length],a=slots[i],copy=g.clone(true);copy.position.set(a.x+g.position.x-slot.x,a.y+g.position.y-slot.y,a.z+g.position.z-slot.z);sceneGroup.add(copy);register(copy,w);}}
 return {group:sceneGroup,surfaces,used,words};
}
