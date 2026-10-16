// Refrigerated shop fixtures, distinct from the household refrigerator model.
export function createConvenienceModels({box,cyl,sphere,label,group}){
 return (g,w)=>{
  const k=w.kind;
  if(k==='beverage-cooler'||k==='chilled-case'){
   const H=k==='beverage-cooler'?3.45:2.5;
   box(g,8.6,.30,2.4,'#b5d7d5',[0,.15,0]);box(g,8.6,H,.12,'#aac9cd',[0,H/2,-1.16]);
   for(const x of [-4.23,4.23])box(g,.14,H,2.4,'#eef3e9',[x,H/2,0]);
   const shelves=k==='beverage-cooler'?[.42,1.23,2.04]:[.42,1.1,1.78];
   for(const y of shelves)box(g,8.25,.045,2.1,'#d9eeeb',[0,y,-.01],undefined,{transparent:true,opacity:.27,depthWrite:false});
   // An open top and clear front keep products visible from the overhead learning view.
   for(const x of [-2.8,0,2.8])box(g,.07,H-.25,.09,'#eaf1e7',[x,H/2,1.2]);
   const doors=group(null,[0,0,0],0,g);doors.name='opening-panel';
   for(const x of [-2.8,0,2.8]){
    box(doors,2.68,H-.4,.025,'#c6eeee',[x,H/2,1.18],undefined,{transparent:true,opacity:.10,depthWrite:false});
    box(doors,.065,.65,.09,'#486f79',[x+1.17,1.5,1.25]);
   }
   g.userData.movingPart='opening-panel';g.userData.sliding=true;
   label(g,k==='beverage-cooler'?'冷たい飲み物':'お弁当・チルド',7,.42,[0,H+.05,-1.08],0,'#517e8c','#fffdf0');
   return true;
  }
  if(k==='ice-freezer'||k==='chest-freezer'){
   const color=k==='ice-freezer'?'#83bdbb':'#8cb2ce';
   box(g,5.2,.22,3.4,color,[0,.11,0]);
   for(const x of [-2.53,2.53])box(g,.14,1.2,3.4,color,[x,.66,0]);
   for(const z of [-1.63,1.63])box(g,5.2,1.2,.14,color,[0,.66,z]);
   box(g,4.9,.07,3.1,'#eaf6ec',[0,.50,0]);
   for(const x of [-1.25,0,1.25])box(g,.055,.30,3,'#e4f0de',[x,.7,0]);
   const lid=group(null,[0,0,0],0,g);lid.name='opening-panel';g.userData.movingPart='opening-panel';g.userData.sliding=true;
   box(lid,4.92,.024,3.10,'#cff3ec',[0,1.3,0],undefined,{transparent:true,opacity:.08,depthWrite:false});
   box(lid,.07,.06,3.14,'#eff5e9',[0,1.33,0]);box(lid,.65,.055,.10,'#487384',[.4,1.35,.2]);
   label(g,k==='ice-freezer'?'アイス':'冷凍食品',3.9,.38,[0,.69,1.71],0,color,'#ffffff');
   return true;
  }
  if(k==='ice-cup'){
   cyl(g,.37,.27,.47,w.color||'#e7b29f',[0,.24,0]);cyl(g,.39,.39,.045,'#fff3d7',[0,.5,0]);sphere(g,.16,'#e8c895',[0,.53,0],[1,.2,1]);label(g,'アイス',.46,.19,[0,.26,.335],0,'#fff0dd','#735443');return true;
  }
  if(k==='wrapped-ice'){
   box(g,.55,.18,1.0,'#efc298',[0,.13,0]);box(g,.42,.025,.58,'#f5eaca',[0,.23,0]);cyl(g,.08,.08,.45,'#c19561',[0,.09,.61],[Math.PI/2,0,0]);return true;
  }
  if(k==='frozen-pack'){
   box(g,1.05,.25,.77,w.color||'#c6dfa6',[0,.15,0]);box(g,.72,.015,.47,'#fff4d7',[0,.29,0]);
   for(const x of [-.24,0,.24])sphere(g,.12,'#dbaa71',[x,.32,0],[1,.3,1]);
   label(g,w.jp.replace('冷凍',''),.85,.21,[0,.15,.401],0,'#fff4d7','#466376');return true;
  }
  if(k==='indoor-postbox'){
   box(g,1.0,1.13,.64,'#d66a63',[0,.63,0]);box(g,.72,.085,.04,'#624c49',[0,.91,.34]);
   label(g,'〒',.50,.40,[0,.60,.345],0,'#d66a63','#fff4e6');box(g,1.04,.09,.68,'#f0d2b1',[0,.08,0]);return true;
  }
  return false;
 };
}
export function furnishConvenience(world,data,zone,h){
 if(data.id!=='convenience')return false;
 const {box,put,fixture,surface,shelf,carpet,counter,register,find,sceneGroup,surfaces,used}=h;
 const i=zone.index,words=data.items.filter(w=>w.zone===i);
 const solid=(x,z,w,d)=>world.collider(zone.x+x,zone.z+z,w,d);
 const item=(w,x,y,z,scale=1,parent=sceneGroup)=>{
  const g=world.group(null,[x,y,z],0,parent);world.models.model(g,w);g.scale.setScalar(scale);register(g,w);return g;
 };
 function stock(cabinet,products,freezer=false){
  if(!products.length)return;
  const count=freezer?Math.max(products.length,8):Math.max(products.length,21);
  for(let n=0;n<count;n++){
   const w=products[n%products.length],c=freezer?n%4:n%7,r=freezer?Math.floor(n/4)%2:Math.floor(n/7)%3;
   const x=freezer?(c-1.5)*1.16:(c-3)*1.1;
   const y=freezer?.56:([.46,1.27,2.08][r]);
   const z=freezer?(r-.5)*1.42:.70-r*.57;
   item(w,x,y,z,freezer?.94:.9,cabinet);
  }
 }
 if(i===0){
  const c=fixture('chilled-case',0,-2,1,['冷蔵ショーケース']);solid(0,-2,8.6,2.4);
  const foods=words.filter(w=>['bento','onigiri','sandwich','yogurt','tofu','cheese','eggs','meat','fish'].includes(w.kind)||w.product?.key==='milk');
  // Chilled trays have two low tiers so the food remains visible from above.
  foods.forEach((w,n)=>item(w,(n%7-3)*1.12,.50+Math.floor(n/7)*.77,.62-Math.floor(n/7)*.8,.73,c));
  shelf(0,3,8,2.4);
  return true;
 }
 if(i===1){shelf(0,-3,8,2.5);shelf(0,2,8,2.5);return true;}
 if(i===2){
  const c=fixture('beverage-cooler',0,-2,1,['冷蔵ケース']);solid(0,-2,8.6,2.4);
  stock(c,words.filter(w=>!['beverage-cooler','sign'].includes(w.kind)));
  // Mark this area as fully furnished: no extra display table outside the cold case.
  surfaces.push({x:0,z:-1.8,w:7,d:.8,y:1.2});
  return true;
 }
 if(i===3){shelf(0,-3,8,2.5);shelf(0,2,8,2.5);return true;}
 if(i===4){
  counter(0,0,9,1.8);for(const x of [-2,2])put('register',x,0,.75,[],1.35);
  counter(0,-3,9,1.2);put('microwave',-3,-3,.8,['電子レンジ'],1.35);put('hot-case',0,-3,.8,[],1.35);put('coffee-machine',3,-3,.7,[],1.35);
  fixture('atm',6,-2,.9,['ATM']);solid(6,-2,1.5,1);fixture('copier',6,1.3,.85,['コピー機']);
  put('indoor-postbox',-5.4,1.8,1,['店内ポスト']);solid(-5.4,1.8,1,.64);
  put('oden-pot',-3,0,.8,[],1.35);surface(0,4.4,6,1.25,.95);
  return true;
 }
 if(i===5){
  for(const [x,kind]of[[-3.7,'ice-freezer'],[3.7,'chest-freezer']]){
   const c=fixture(kind,x,0,1);solid(x,0,5.2,3.4);
   stock(c,words.filter(w=>kind==='ice-freezer'?['ice-cup','wrapped-ice','ice'].includes(w.kind):w.kind==='frozen-pack'),true);
  }
  surfaces.push({x:0,z:0,w:1,d:1,y:.55});return true;
 }
 if(i===6){
  carpet(0,0,8,10,'#dde9df');
  const wall=(x,z,w,d,H=1.4)=>{box(w,H,d,'#eaf0e6',x,H/2,z);solid(x,z,w,d);};
  wall(0,-5,8,.14,2.5);wall(-4,0,.14,10);wall(4,0,.14,10);wall(-2.9,5,2.2,.14);wall(2.9,5,2.2,.14);
  const toilet=fixture('toilet',1.2,-2.6,1.6,['便器']);solid(1.2,-2.6,1.5,1.6);
  put('remote',2.5,-2.8,.9,['温水洗浄便座の操作パネル'],1.0);put('paperroll',2.7,-1.5,1,['トイレットペーパー'],.85);
  const sink=fixture('sink',-2.2,0,.8,['洗面台']);solid(-2.2,0,1.8,1.1);
  put('mirror',-3.5,0,1,['鏡']);put('pumpbottle',-2.6,-.1,.65,['ハンドソープ'],1.15);put('tissue',-2.0,.1,.65,['ペーパータオル'],1.15);
  put('trash',2.5,2,.7,['サニタリーボックス']);put('key',2.8,4.9,.6,['鍵'],1.0);
  const door=put('door',-1.7,4.8,1,['トイレのドア']);door.rotation.y=Math.PI/2;
  const sign=world.label(sceneGroup,'トイレ',2.6,.5,[0,2.3,4.98],0,'#587f89','#fffaf0');register(sign,find('sign',['トイレ']));
  surfaces.push({x:0,z:-4.5,w:3,d:.6,y:1.1});return true;
 }
 return false;
}
