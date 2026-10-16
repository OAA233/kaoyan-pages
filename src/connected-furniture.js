import {furnishVenue} from './venue-furniture.js';
import {furnishArcade} from './arcade-interior.js';
import {furnishDrugstoreCheckout} from './drugstore-checkout.js';
import {furnishCafeDisplays} from './cafe-menu.js';
import {furnishAquarium} from './aquarium-detail.js';
import {furnishRestaurant} from './restaurant-interior.js';
import {furnishConvenience} from './convenience-interior.js';
// Furnishing departments in a shared interior: no repeated mini-room walls or windows.
export function furnishConnected(world,data,zone,h){
 if(furnishVenue(world,data,zone,h)||furnishArcade(world,data,zone,h)||furnishDrugstoreCheckout(world,data,zone,h)||furnishCafeDisplays(world,data,zone,h)||furnishAquarium(world,data,zone,h)||furnishConvenience(world,data,zone,h)||furnishRestaurant(world,data,zone,h))return true;
 const {box,put,fixture,surface,shelf,carpet,counter,plant,sceneGroup,surfaces,register,find}=h;
 const n=zone.jp,i=zone.index;
 const sign=(t,x,z,w=3)=>world.label(sceneGroup,t,w,.4,[x,2.5,z]);
 function dining(x,z,low=false,grill=false){
  const y=low?.5:1;surface(x,z,3.4,1.9,y);
  for(const dx of [-1.1,1.1])for(const dz of [-1.4,1.4]){
   const a=put(low?'cushion':'chair',x+dx,z+dz,low?1.1:.9);if(dz<0)a.rotation.y=Math.PI;
  }
  for(const dx of [-1,1]){put('plate',x+dx,z,.6,[],y+.04);put('chopsticks',x+dx,z+.6,.6,[],y+.04);}
  if(grill){world.cyl(sceneGroup,.55,.55,.07,'#556264',[x,y+.09,z]);for(let j=-3;j<=3;j++)world.rod(sceneGroup,[x-.43,y+.14,z+j*.12],[x+.43,y+.14,z+j*.12],.018,'#bac3c0');world.cyl(sceneGroup,.19,.42,.65,'#a1b8b6',[x,3,z]);}
 }
 if(data.id==='home'&&i===4){
  counter(-2,-3,7,1.6);put('sink',-3,-3,1,[],1.35);put('mirror',-3,-3.8,1.2);fixture('washer',4,-3,1.2);put('toilet',4,2,1.2,['便器']);box(.12,1.6,4,'#d6dfd3',6, .8,2);box(3.9,1.6,.12,'#d6dfd3',4,.8,.4);surface(-3,2,4,1.3,.9);return true;
 }
 if(data.id==='home'&&i===5){
  carpet(0,0,14,12,'#d2e4df');fixture('bathtub',-2,-2,1.15);fixture('shower',3,-3,1);fixture('stool',3,-1,.9);put('tub',4,-1,.8);surface(0,3,8,1,.55);return true;
 }
 if(data.id==='school'&&i===1){
  for(const x of [-4.8,0,4.8])shelf(x,-4.5,3.6);
  for(const x of [-3.6,3.6]){surface(x,1,4.6,2,1);for(const dx of [-1,1])for(const dz of [-1.5,1.5]){const c=put('chair',x+dx,1+dz,.9);if(dz<0)c.rotation.y=Math.PI;}}
  return true;
 }
 if(data.id==='station'&&i===4){
  const car=world.group(null,[0,0,0],0,sceneGroup);world.box(car,11,.25,12,'#c4d5d1',[0,.15,0]);
  for(const x of [-5.3,5.3])world.box(car,.13,1.5,12,'#d9e3dc',[x,.95,0]);
  const w=find('train');if(w)register(car,w);
  for(const x of [-4,4])for(const z of [-3.5,1]){const bench=put('bench',x,z,1.1);bench.rotation.y=x<0?Math.PI/2:-Math.PI/2;}
  for(const x of [-2.8,2.8])world.rod(sceneGroup,[x,.3,-5],[x,2.7,-5],.05,'#8ca5a3');
  surface(0,-4.5,3.4,1.2,.8);return true;
 }
 if(data.id==='post'){
  if(i===0){counter(0,0,12,1.8);for(const x of [-4,0,4]){put('tablet',x,0,.7,[],1.36);sign(String(x/4+2)+' 窓口',x,-.6,2);}put('scale',4,0,.7,['料金秤'],1.36);shelf(-3,-4,5);}
  if(i===1){surface(0,0,8,2.2,1.05);for(const x of [-3,0,3])put('pen',x,0,.8,[],1.09);fixture('bench',0,4,1.3);}
  if(i===2){counter(0,0,9,2.3);shelf(0,-4,9);sign('ゆうパック',0,-3);put('scale',2,0,1,[],1.36);}
  if(i===3){fixture('postbox',-2,1,1.3);shelf(2,-2,4);fixture('bench',2,4,1.1);sign('切手・はがき',2,-2);}
  return true;
 }
 if(data.id==='bank'){
  if(i===0){for(const x of [-3,0,3]){fixture('atm',x,-1,1.15,['ATM']);box(.14,1.7,1.8,'#d5d8d2',x+1.3,.85,-.8);}sign('ATM',0,-2);}
  if(i===1){counter(0,0,13,1.8);for(const x of [-4,0,4]){put('tablet',x,0,.75,[],1.36);sign(String(x/4+2)+' 窓口',x,-.6,2);}shelf(0,-4,7);}
  if(i===2){surface(0,-1,7,2,1.05);fixture('bench',-2,3,1.1);fixture('bench',2,3,1.1);put('ticket-machine',-5,1,.7,['番号札発券機']);}
  if(i===3){surface(0,-1,6,2.4,1);for(const x of [-2,2]){put('chair',x,1,1);put('chair',x,-3,1).rotation.y=Math.PI;}shelf(0,-5,6);sign('ご相談',0,-4);}
  return true;
 }
 if(data.layout==='retail'&&data.id!=='clothing'){
  if(/レジ|会計/.test(n)){
   if(data.id==='convenience'){
    counter(0,0,9,1.8);for(const x of [-2,2])put('register',x,0,.75,[],1.35);
    counter(0,-3,9,1.2);put('microwave',-3,-3,.8,[],1.35);put('hot-case',0,-3,.8,[],1.35);put('coffee-machine',3,-3,.7,[],1.35);
    return true;
   }
   for(const x of (data.id==='aeon'?[-8,-4,0,4,8]:[-2.6,2.6])){
    counter(x,0,2.4,3.2);put('register',x,-.7,.8,[],1.35);box(1.9,.04,1.7,'#59716b',x,1.35,.5);
   }
   surface(-5,4.8,4,1.6,.9);surface(5,4.8,4,1.6,.9);put('cart',-6,3,1,['ショッピングカート']);return true;
  }
  if(data.id==='convenience'&&/飲み物/.test(n)){
   for(const x of [-3,0,3])fixture('fridge',x,-3,1.3);
   shelf(0,1.5,8,2.2,'#a3c4c2');
  }else if(/青果/.test(n)){
   for(const z of [-3,1])surface(0,z,8,2.4,.65,'#a7b584');
  }else if(/鮮魚|精肉|冷凍|乳製品|飲み物/.test(n)){
   counter(0,-3,8,1.9);box(8,.7,.10,'#a7c9cb',0,1.65,-3.9);shelf(0,1.7,7,2.3,'#b6cac5');
  }else if(/惣菜|ベーカリー/.test(n)){
   counter(0,-3,8,2.2);put('display',0,-3,1.2,[],1.34);surface(0,1.7,8,2.2,.9);
  }else{
   shelf(0,-3,8,2.5,data.id==='drugstore'?'#99b8b6':'#a9b4a0');
   shelf(0,1.8,8,2.5,data.id==='bookstore'?'#ae977c':'#b6beae');
  }
  return true;
 }
 return false;
}
