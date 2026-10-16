// Guest furniture and explicit floor storage; open-counter workstations are built separately.
export function furnishRestaurant(world,data,zone,h){
 if(data.layout!=='restaurant')return false;
 const {box,put,surface,counter,sceneGroup,surfaces,register,used}=h, words=data.items.filter(w=>w.zone===zone.index&&!w.workPosition&&!w.menuOnly&&!w.detail?.floor), n=zone.jp;
 const color=data.id==='izakaya'?'#805942':data.id==='ramen'?'#b66c49':'#b79767';
 const get=jp=>words.find(w=>w.jp===jp&&!used.has(w.id));
 const bind=(g,jp)=>{const w=get(jp);if(w)register(g,w);return g;};
 const item=(w,x,y,z,s=.8)=>{if(!w)return;const g=world.group(null,[x,y,z],0,sceneGroup);world.models.model(g,w);g.scale.setScalar(s);register(g,w);return g;};
 const sign=(text,x,z,width=3)=>world.label(sceneGroup,text,width,.38,[x,2.25,z]);
 const block=(x,z,w,d,height=.85)=>{const g=box(w,height,d,color,x,height/2,z);world.collider(zone.x+x,zone.z+z,w,d);return g;};
 function tatami(){
  const floor=box(14,.18,11,'#7e674c',0,.09,0);bind(floor,'座敷');
  for(const x of [-5.25,-1.75,1.75,5.25])for(const z of [-3.6,0,3.6]){const m=box(3.38,.025,3.48,'#b3c39a',x,.20,z);bind(m,'畳');for(const dx of [-1.60,1.60])box(.065,.01,3.4,'#6e8264',x+dx,.22,z);}
  // Rails mark the room edge without enclosing the central aisle.
  block(-7,-.6,.12,9.8,.85);block(7,-.6,.12,9.8,.85);block(0,-5.4,14,.12,1.6);
  const step=box(5,.09,1,'#9e7850',0,.045,5.4);bind(step,'上がり框');
  const shoji=words.find(w=>['shoji','fusuma'].includes(w.kind));if(shoji){const g=item(shoji,0,.2,-5.1,1.4);g.rotation.y=0;}
 }
 function table(x,z,{low=false,grill=false,hori=false,small=false,booth=false}={}){
  const y=low?.77:1.05,W=small?2.7:4.8,D=small?1.8:2.55;
  const t=surface(x,z,W,D,y,color);bind(t.g,low?'座卓':'テーブル');
  if(hori){const well=box(W+.1,.04,D+1.2,'#494942',x,.235,z);bind(well,'掘りごたつ');for(const dx of [-W/2-.28,W/2+.28])box(.35,.13,D+1.6,'#8a6f52',x+dx,.27,z);}
  for(const side of [-1,1])for(const dx of small?[-.75,.75]:[-1.5,1.5]){const seat=put(low?'cushion':booth?'floor-chair':'chair',x+dx,z+side*(D/2+.8),low?1.25:.95,[],low?.23:0);if(side<0)seat.rotation.y=Math.PI;}
  if(booth){for(const dz of [-2.8,2.8])bind(block(x,z+dz,6,.18,1.05),'仕切り');}
  if(grill){const g=world.group(null,[x,y+.03,z],0,sceneGroup);world.models.model(g,{kind:'grill-net',jp:'焼き網'});bind(g,'網');bind(g,'焼き網');
   const duct=world.group(null,[x,y+1.8,z],0,sceneGroup);world.models.model(duct,{kind:'exhaust-duct',jp:'排煙ダクト'});duct.scale.setScalar(.75);bind(duct,'排煙ダクト');
  }
  // Reserve tabletop edges for food and tableware. The grill/serving centre remains visible.
  t.foodSlots=[];const cols=small?3:5,rows=grill?[-D/2+.25,D/2-.25]:[-D/2+.25,0,D/2-.25];for(let c=0;c<cols;c++)for(const dz of rows)t.foodSlots.push({x:x+(c-(cols-1)/2)*(W-.9)/(cols-1),z:z+dz,y,scale:.55});
  // Set meals are placed from their registered words below, avoiding invisible duplicate food.
  return t;
 }
 function counterSeats(count=5){
  const width=data.id==='ramen'?13:11;counter(0,-2,width,1.7);
  for(let j=0;j<count;j++){const x=(j-(count-1)/2)*(width-1.3)/count;put('stool',x,-.2,.95);}
  // No decorative partition across the cook's work aisle.
  if(data.id!=='ramen')sign(data.id==='sushi'?'おまかせ・お好み':'お品書き',0,-4,4);
  if(data.id==='ramen'){
   const sf=counter(-6,1.5,1.5,5.4);for(const z of [0,1.9,3.8]){const chair=put('stool',-4.5,z,.95);chair.rotation.y=-Math.PI/2;}sf.foodSlots=[{x:-6,y:1.34,z:0,scale:.6},{x:-6,y:1.34,z:2,scale:.6},{x:-6,y:1.34,z:4,scale:.6}];
  }
 }
 if(/靴を脱ぐ/.test(n)){
  box(5,.018,5,'#a2a09a',0,.014,0);const cabinet=put('shoe-cabinet',-3.8,0,1.2);world.collider(zone.x-3.8,zone.z,2.7,1);
  const step=box(5,.13,1.1,'#a08059',0,.065,-2.4);bind(step,'上がり框');item(get('靴'),1.2,.08,0,1.1);sign('座敷は靴を脱いで',0,-2.6,3.6);
  // Noren belongs over the guest route, not on a display table.
  const noren=get('暖簾');if(noren)item(noren,0,1.6,-2.5,1.2);
  surfaces.push({x:0,z:0,w:2,d:1,y:.05});
 }else if(/券売機/.test(n)){
  put('ticket-machine',0,0,1.05,['券売機']);world.collider(zone.x,zone.z,1.7,1.2);sign('食券をお買い求めください',0,-.7,3.4);surface(2.2,0,1.3,1,.9);put('umbrella-stand',-1.9,0,.7);
 }else if(/セルフサービス/.test(n)){
  put('water-dispenser',0,0,1,['給水機']);world.collider(zone.x,zone.z,1.6,1.3);surface(1.9,0,1.8,1.1,1);sign('お冷はセルフサービス',0,-1,3.4);
 }else if(/会計/.test(n)){
  counter(0,0,data.id==='ramen'?2.3:4,1.35);put('register',.7,0,.65,['レジ'],1.36);put('bench',4,1,.8);put('umbrella-stand',-3,1,.8);sign('お会計',0,-1,2.2);
 }else if(/包装/.test(n)){
  counter(0,0,8,1.9);sign('お包みします',0,-1,3);
 }else if(/ショーケース|ネタケース/.test(n)){
  counter(0,0,10,1.8);const display=put('display',0,0,1.6,[],1.34);display.scale.y=.75;
  if(data.id==='wagashi'){counter(0,3.4,10,1.6);sign('季節の和菓子',0,-1,4);}
  else sign('本日のおすすめ',0,-1,3);
 }else if(/カウンター/.test(n)){
  counterSeats(data.id==='ramen'?7:5);
  if(data.id==='kissaten'){put('coffee-grinder',-4,-3,.9,[],1.33);put('coffee-siphon',3,-3,.9,[],1.33);}
 }else if(/読書/.test(n)){
  h.shelf(0,-3.7,6,2.3,'#997553');put('sofa',0,.8,1);surface(0,2.8,4,1.6,.65);sign('ご自由にどうぞ',0,-3.8,2.8);
 }else if(/座敷|掘りごたつ|茶席/.test(n)){
  tatami();const hori=/掘りごたつ/.test(n);for(const x of [-3.4,3.4])table(x,0,{low:true,hori,grill:data.id==='yakiniku'});
  // Shoe storage directly adjoins the raised seating entrance in smaller restaurants.
  if(['soba','sushi'].includes(data.id)){put('shoe-cabinet',-4.3,5.2,.9);item(get('靴'),-2.6,.05,5.6,.8);}
 }else if(data.id==='ramen'){
  table(0,-2.3,{small:true});table(0,3.3,{small:true});
 }else if(data.id==='teishoku'||data.id==='soba'){
  for(const z of [-3,3])table(0,z);
 }else if(data.id==='kissaten'){
  table(0,-2.4,{small:true});table(0,3.3,{small:true});
 }else{
  for(const z of [-3,3])table(0,z,{grill:data.id==='yakiniku',booth:/半個室/.test(n)});
 }
 // Storage is not tableware: place it on the floor beside seats, away from the main aisle.
 for(const w of words.filter(w=>!used.has(w.id)&&w.kind==='luggage-basket')){
  const tatami=/座敷|掘りごたつ/.test(n);item(w,data.id==='ramen'?3.5:tatami?-5.9:3.1,tatami?.235:.015,data.id==='ramen'?.9:tatami?2.7:-3,1);
 }
 if(data.id==='ramen'&&zone.index===2){const shelf=get('棚');if(shelf){item(shelf,2.3,0,-1.5,1);world.collider(zone.x+2.3,zone.z-1.5,2.2,.55);}}
 // Menu and venue signs remain readable and clickable beside the customer route.
 let signIndex=0;
 for(const w of words.filter(w=>!used.has(w.id)&&['menu','sign','exit-sign','noren','lantern','lamp','umbrella-stand','bench','shelf-support','bookshelf','partition','hanger','trash'].includes(w.kind))){
  const j=words.filter(x=>used.has(x.id)&&['menu','sign','exit-sign'].includes(x.kind)).length;
  if(w.kind==='menu'&&['wagashi','teishoku'].includes(data.id)){
   const g=world.group(null,[-4.6,0,4.6],0,sceneGroup);
   for(const x of [-1.05,1.05])world.box(g,.12,2.7,.14,color,[x,1.35,0]);
   world.box(g,2.7,2.15,.16,color,[0,1.85,0]);world.box(g,2.6,.08,.65,color,[0,.12,0]);
   const samples=(data.menus?.[0]?.items||[]).slice(0,3).map(id=>data.items.find(a=>a.id===id)?.jp).filter(Boolean);
   world.textPlane(g,2.45,1.92,[0,1.85,.10],0,(ctx,W,H)=>{
    ctx.fillStyle='#fff1d1';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#376958';ctx.font='bold 64px "Yu Gothic",sans-serif';ctx.fillText('お品書き',W/2,79);
    ctx.font='35px "Yu Gothic",sans-serif';samples.forEach((jp,i)=>ctx.fillText(jp,W/2,145+i*52));ctx.fillStyle='#946331';ctx.font='27px "Yu Gothic",sans-serif';ctx.fillText('タップして選ぶ',W/2,H-25);
   });
   register(g,w);world.collider(zone.x-4.6,zone.z+4.6,2.6,.65);
   world.spriteLabel('お品書き',[zone.x-4.6,3.2,zone.z+4.6],3.2);
  }else if(w.kind==='menu')item(w,-2+j*1.2,0,data.id==='ramen'?2:4.5,.65);
  else if(['noren','lantern','lamp','sign','exit-sign'].includes(w.kind))item(w,3-(signIndex++%3)*2,1.8,-4.5,.65);
  else if(['shelf-support','bookshelf'].includes(w.kind)){const shelf=block(-5.5,-3.5,2,.8,1);register(shelf,w);}
  else if(w.kind==='partition'){register(block(6,-1,.15,6,1.1),w);}
  else if(w.kind==='bench')item(w,4.5,0,3.8,.75);
  else item(w,-4.8,0,3.8,.65);
 }
 // Architectural words keep their shell binding. Every small target uses a real dining surface.
 const remaining=words.filter(w=>!used.has(w.id)&&!world.shellFixtures?.has(w.kind));
 const baskets=surfaces.map(sf=>sf.foodSlots||Array.from({length:Math.max(1,Math.floor(sf.w/.85))},(_,i)=>({x:sf.x-sf.w/2+.45+i*.85,z:sf.z,y:sf.y,scale:.6}))),slots=[];
 for(let row=0;row<Math.max(0,...baskets.map(a=>a.length));row++)for(const a of baskets)if(a[row])slots.push(a[row]);
 if(remaining.length>slots.length){
  // A service tray next to occupied seating, never a full extra room or kitchen.
  const sf=surface(data.id==='ramen'?0:5.8,data.id==='ramen'?3.5:3.9,data.id==='ramen'?2.4:2,1.5,.85);
  for(const x of [-.55,.55])for(const z of [-.4,.4])slots.push({x:sf.x+x,z:sf.z+z,y:sf.y,scale:.55});
 }
 remaining.forEach((w,i)=>{const s=slots[i];if(!s){world.modelErrors.push({id:w.id,message:'餐饮陈列位不足，请调整词条分区'});return;}const g=item(w,s.x,s.y+.03,s.z,s.scale);if(g)world.fitDisplayItem(g,{...s,width:.76,depth:.64});});
 return true;
}

export function createRestaurantModels({box,cyl,sphere,group,rod,label}){
 return (g,w)=>{
 const k=w.kind;
 if(k==='shoe-cabinet'){
  box(g,2.4,1.6,.9,'#a37b54',[0,.8,0]);for(const x of [-.75,0,.75])for(const y of [.35,.95]){box(g,.64,.48,.055,'#574f43',[x,y,.48]);box(g,.62,.06,.56,'#cbb18a',[x,y-.26,.3]);}label(g,'下駄箱',1.8,.26,[0,1.53,.5]);return true;
 }
 if(k==='entry-step'){box(g,2,.14,.8,'#b5946d',[0,.07,0]);return true;}
 if(k==='lowtable'||k==='horigotatsu'){
  if(k==='horigotatsu'){box(g,3.2,.08,2.5,'#aebd90',[0,.04,0]);box(g,2,.025,1.8,'#4e5143',[0,.085,0]);}
  box(g,2.7,.12,1.5,'#ae845b',[0,.62,0]);for(const x of [-1,1])for(const z of [-.5,.5])box(g,.12,.60,.12,'#826a50',[x,.30,z]);return true;
 }
 if(k==='grill-net'){
  cyl(g,.66,.66,.08,'#4d5657',[0,.04,0]);cyl(g,.59,.59,.02,'#7a4e40',[0,.087,0]);for(let i=-4;i<=4;i++)rod(g,[-.47,.12,i*.11],[.47,.12,i*.11],.018,'#adb6b1');return true;
 }
 if(k==='spoon'||k==='fork'){
  box(g,.075,.035,.65,'#d0d4c8',[0,.06,.22]);if(k==='spoon')sphere(g,.18,'#e8e5d3',[0,.07,-.22],[.8,.2,1.4]);else for(const x of [-.09,0,.09])box(g,.035,.025,.28,'#d0d4c8',[x,.06,-.24]);return true;
 }
 if(k==='ramen-bowl'){
  cyl(g,.53,.34,.4,'#e8d9b8',[0,.23,0]);cyl(g,.49,.49,.02,'#b98153',[0,.44,0]);for(let i=-3;i<=3;i++)rod(g,[-.28,.465,i*.065],[.28,.465,i*.065],.024,'#eed5a0');
  for(const x of [-.24,0,.24])cyl(g,.12,.12,.045,'#b7826f',[x,.50,-.20]);sphere(g,.16,'#f6ebd1',[.2,.51,.15],[1,.22,1.2]);sphere(g,.085,'#e3b853',[.2,.55,.15],[1,.12,1]);return true;
 }
 if(k==='soba-tray'){
  box(g,1.2,.10,.85,'#574e42',[0,.06,0]);for(let x=-.5;x<=.5;x+=.1)box(g,.05,.025,.74,'#bdab7d',[x,.125,0]);for(let i=0;i<10;i++)rod(g,[-.4,.17+i%2*.018,-.26+i*.055],[.4,.17+i%2*.018,-.24+i*.055],.023,'#998d70');cyl(g,.18,.15,.23,'#786d61',[.82,.13,0]);return true;
 }
 if(k==='set-meal'){
  box(g,1.9,.09,1.28,'#745746',[0,.05,0]);const meal=group(null,[-.52,.1,.32],0,g);cyl(meal,.28,.18,.24,'#f0e1bc',[0,.12,0]);sphere(meal,.24,'#ffedd0',[0,.27,0],[1,.4,1]);
  cyl(g,.26,.19,.2,'#775247',[.5,.22,.35]);cyl(g,.22,.22,.012,'#ac8a52',[.5,.325,.35]);cyl(g,.42,.4,.04,'#e8dac0',[0,.12,-.24]);sphere(g,.27,'#b48252',[0,.21,-.24],[1.25,.25,.65]);sphere(g,.14,'#95b36f',[.37,.2,-.3],[1,.3,1]);return true;
 }
 return false;
 };
}