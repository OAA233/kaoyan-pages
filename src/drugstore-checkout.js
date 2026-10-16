// One staffed checkout by the entrance; every payment object has its own learning target.
export function furnishDrugstoreCheckout(world,data,zone,h){
 if(data.id!=='drugstore'||zone.index!==6)return false;
 const {box,put,surface,sceneGroup,register,find,surfaces}=h;
 const base=box(8,1.18,2.2,'#739d8a',-4,.59,0);register(base,find('counter',['レジカウンター']));
 box(8.15,.16,2.35,'#f2e5c9',-4,1.25,0);world.collider(zone.x-4,zone.z,8.15,2.35);
 world.label(sceneGroup,'お会計',3,.6,[-4,.64,1.18],0,'#739d8a','#fff7e4');
 const sign=world.spriteLabel('レジ・お会計',[zone.x-4,3.5,zone.z-1],5.4);sign.userData.zone=6;
 put('checkout-pos',-5.4,-.35,1.12,['レジ'],1.34);
 put('checkout-scanner',-3.9,.1,1,['バーコードリーダー'],1.34);
 put('cash-tray',-2.6,.62,1.12,['会計トレー'],1.34);
 put('checkout-terminal',-1.1,.5,1,['決済端末'],1.34);
 put('specific-object',-1.0,-.65,.8,['ポイントカード'],1.34);
 put('checkout-receipt',-5.25,.68,1,['レシート'],1.34);
 put('shoppingbag',-7,.2,1.08,['レジ袋'],1.34);
 put('coins',-2.6,.64,.55,['お釣り'],1.39);
 put('basket',-7,.7,1.3,['買い物かご'],0);
 // Bagging desk is separate from the register, leaving the entrance aisle clear.
 const desk=surface(5.8,1.8,4.5,1.5,.98,'#e3d6b9');register(desk.g,find('table',['テーブル']));
 world.label(sceneGroup,'袋詰め台',3,.4,[5.8,1.18,2.62]);
 put('bench',10,4.5,1.15,['ベンチ']);put('chair',-9.6,-2.2,1,['椅子']);
 put('trash',8.8,2.3,.85,['ごみ箱']);put('lamp',8.8,4.5,.8,['照明']);
 const storage=box(2.5,1.4,.8,'#bdc8b1',-9.7,.7,-.2);register(storage,find('bookshelf',['棚']));
 for(const y of [.4,.9])box(2.3,.045,.7,'#f5e6c9',-9.7,y,.22);
 box(3.5,.015,.16,'#cfa768',-4,.04,3);world.label(sceneGroup,'こちらでお待ちください',3.9,.4,[-4,.055,3.6]).rotation.x=-Math.PI/2;
 // All checkout words are explicit. No automatic product stocking on the counter.
 surfaces.push({x:-4,z:0,w:8,d:2,y:1.34});return true;
}
export async function buildDrugstoreCashier(world,data,characters){
 if(data.id!=='drugstore'||!characters.length)return;
 const actor=characters.find(c=>c.id==='nijika')||characters[0];
 const staff={id:'drugstore-cashier',jp:'レジの店員',reading:'レジのてんいん',character:actor,activity:'商品のバーコードを読み取っています。',readingLine:'しょうひんの バーコードを よみとっています。',verb:'読み取る → 読み取っている',grammar:'カード【で】支払う。「で」は支払いの方法です。',reply:'いらっしゃいませ。ポイントカードはお持ちですか。レジ袋はご入用ですか。',tools:['レジ','バーコードリーダー','会計トレー','決済端末','レシート','レジ袋']};
 await world.character(actor,[-4.7,0,14.7],false,{kind:'staff',data:staff,label:staff.jp,height:2.9});
}
export function createCheckoutModels({box,cyl,rod,label}){return(g,w)=>{
 const k=w.kind,dark='#3b5654';
 if(k==='checkout-pos'){
  box(g,1.1,.24,.83,'#e0e4da',[0,.12,0]);box(g,.88,.09,.035,dark,[0,.13,.43]);box(g,.14,.40,.16,dark,[0,.43,-.15]);
  box(g,1.12,.68,.14,dark,[0,.94,-.12],[-.12,0,0]);box(g,.98,.53,.015,'#83b7bc',[0,.94,-.027],[-.12,0,0]);label(g,'お会計',.85,.2,[0,1,-.005]);
  for(let x=-.28;x<.4;x+=.14)for(let z=.02;z<.34;z+=.12)box(g,.10,.035,.08,'#718a80',[x,.263,z]);
  box(g,.38,.31,.48,dark,[.83,.16,0]);box(g,.22,.18,.02,'#fff8e1',[.83,.37,.12]);return true;
 }
 if(k==='checkout-scanner'){box(g,.46,.05,.42,dark,[0,.03,0]);rod(g,[0,.06,0],[0,.38,-.05],.06,dark);box(g,.32,.23,.24,dark,[0,.44,-.04],[.35,0,0]);box(g,.25,.055,.018,'#dc8179',[0,.45,.09]);return true;}
 if(k==='cash-tray'){box(g,.8,.04,.55,'#628780',[0,.035,0]);for(const x of[-.41,.41])box(g,.04,.055,.6,'#abc5b8',[x,.06,0]);for(const z of[-.29,.29])box(g,.85,.055,.04,'#abc5b8',[0,.06,z]);return true;}
 if(k==='checkout-terminal'){box(g,.46,.20,.67,dark,[0,.12,0],[-.16,0,0]);box(g,.36,.018,.28,'#8dc3bd',[0,.246,-.13],[-.16,0,0]);for(const x of[-.12,0,.12])for(const z of[.12,.23])box(g,.065,.025,.06,'#e3dfbf',[x,.25,z]);return true;}
 if(k==='checkout-receipt'){box(g,.36,.012,.83,'#fff9e9',[0,.015,0]);for(let i=0;i<7;i++)box(g,i===6?.25:.2,.008,.014,dark,[0,.025,-.3+i*.08]);return true;}
 return false;
};}
