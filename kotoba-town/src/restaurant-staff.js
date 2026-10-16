// Restaurant staff and explicit workstations. No automatic prop distribution here.
export const restaurantStaff={
 ramen:{id:'ramen-cook',character:'taki',jp:'ラーメン職人',reading:'ラーメンしょくにん',position:[-3.5,0,-8.05],activity:'麺をゆでています。',readingLine:'めんを ゆでています。',verb:'ゆでる → ゆでている',grammar:'麺【を】ゆでる。「を」は動作の対象を表します。',reply:'麺をゆでて、湯を切ります。どんぶりにスープと麺を入れて、具をのせます。',tools:['ゆで麺機','湯切りざる','寸胴鍋','お玉','麺','薬味','どんぶり','流し台'],pose:'cook'},
 yakiniku:{id:'yakiniku-server',character:'nijika',jp:'店員',reading:'てんいん',position:[-6,0,7],activity:'料理を運んでいます。',readingLine:'りょうりを はこんでいます。',verb:'運ぶ → 運んでいる',grammar:'料理【を】席【に】運ぶ。「を」は運ぶもの、「に」は届ける場所です。',reply:'お待たせしました。カルビです。ご注文はお決まりですか。',tools:['カルビ','トング','メニュー','おしぼり'],pose:'serve'},
 sushi:{id:'sushi-cook',character:'rana',jp:'寿司職人',reading:'すししょくにん',position:[-8,0,-.6],activity:'寿司を握っています。',readingLine:'すしを にぎっています。',verb:'握る → 握っている',grammar:'寿司【を】握る。「を」は作るものを表します。',reply:'いらっしゃいませ。お好きなネタを選んでください。',tools:['寿司','まぐろ','サーモン','メニュー'],pose:'sushi'},
 izakaya:{id:'izakaya-server',character:'rupa',jp:'店員',reading:'てんいん',position:[-11,0,2.7],activity:'ビールを注いでいます。',readingLine:'ビールを そそいでいます。',verb:'注ぐ → 注いでいる',grammar:'グラス【に】ビール【を】注ぐ。「に」は注ぐ先を表します。',reply:'いらっしゃいませ。まず、お飲み物はいかがですか。',tools:['ビール','枝豆','メニュー'],pose:'beer'},
 soba:{id:'soba-server',character:'soyo',jp:'店員',reading:'てんいん',position:[8,0,-12.3],activity:'そばを出しています。',readingLine:'そばを だしています。',verb:'出す → 出している',grammar:'お客様【に】そば【を】出す。「に」は相手を表します。',reply:'お待たせしました。ざるそばです。つゆにつけて召し上がってください。',tools:['ざるそば','つゆ','メニュー'],pose:'soba'},
 teishoku:{id:'teishoku-server',character:'yui',jp:'店員',reading:'てんいん',position:[0,0,-14.3],activity:'定食を運んでいます。',readingLine:'ていしょくを はこんでいます。',verb:'運ぶ → 運んでいる',grammar:'定食【を】席【に】運ぶ。「に」は届ける場所を表します。',reply:'お待たせしました。ご飯とみそ汁もどうぞ。',tools:['唐揚げ定食','味噌汁','メニュー'],pose:'meal'},
 kissaten:{id:'kissaten-barista',character:'umiri',jp:'店員',reading:'てんいん',position:[-8,0,-11.3],activity:'コーヒーをいれています。',readingLine:'コーヒーを いれています。',verb:'いれる → いれている',grammar:'コーヒー【を】いれる。「を」は作る飲み物を表します。',reply:'コーヒーをいれますね。お席で少々お待ちください。',tools:['コーヒー','コーヒーミル','メニュー'],pose:'coffee'},
 wagashi:{id:'wagashi-clerk',character:'komari',jp:'店員',reading:'てんいん',position:[-6,0,-11.2],activity:'お菓子を包んでいます。',readingLine:'おかしを つつんでいます。',verb:'包む → 包んでいる',grammar:'お菓子【を】紙【で】包む。「で」は使うものを表します。',reply:'贈り物ですか。こちらの箱にお包みします。',tools:['大福','どら焼き','紙袋'],pose:'wrap'}
};
export async function buildRestaurantStaff(world,data,characters){
 const spec=restaurantStaff[data.id];if(!spec||!characters?.length)return;
 if(data.id==='ramen'){
  // Continuous stainless line at the back; the middle is the cook's working aisle.
  const back=world.group(null,[0,0,0]);
  world.box(back,8.9,1.08,1.45,'#9fabaa',[-1.9,.54,-9.85]);
  world.box(back,9.05,.12,1.6,'#d2dcda',[-1.9,1.14,-9.85]);
  for(const x of [-5.3,-3.5,-1.7,.1,1.9]){world.box(back,1.62,.78,.025,'#b5c2bc',[x,.59,-9.11]);world.box(back,.45,.05,.04,'#6c7c78',[x,.88,-9.08]);}
  world.collider(-1.9,-9.85,9.05,1.6);
  // Pot burner; wall splashback sits against the wall, never across the cook's aisle.
  world.cyl(back,.52,.52,.045,'#485e61',[-4.8,1.225,-9.8]);
  world.box(back,13,.95,.055,'#d9e1da',[-3.15,1.55,-11.19]);
  for(const w of data.items.filter(w=>w.workPosition)){
   const g=world.group(null,w.workPosition);world.models.model(g,w);g.scale.setScalar(w.workScale||1);world.register(g,'word',w);
   if(['noodle-boiler','work-sink'].includes(w.kind)){const b=new world.THREE.Box3().setFromObject(g),s=b.getSize(new world.THREE.Vector3()),c=b.getCenter(new world.THREE.Vector3());world.collider(c.x,c.z,s.x,s.z);}
  }
 }
 const actor=characters.find(c=>c.id===spec.character)||characters[0],staff={...spec,character:actor};
 const g=await world.character(actor,spec.position,false,{kind:'staff',data:staff,label:spec.jp,height:2.75});
 // An action prop connects the role to its immediate task. Static, shared geometry.
 const props=world.group(null,[0,1.25,.38],0,g);world.register(props,'staff',staff);
 if(spec.pose!=='cook'){
  world.box(props,1.1,.07,.65,'#795e4c',[0,0,.20]);
  const m=world.group(null,[0,.05,.20],0,props);
  const kind={serve:'meat',sushi:'sushi',beer:'beer',soba:'soba-tray',meal:'set-meal',coffee:'mug',wrap:'gift'}[spec.pose];world.models.model(m,{kind,jp:''});m.scale.setScalar(spec.pose==='meal'?.48:.68);
  if(spec.pose==='serve'){
   // Separate raw-meat plate and tongs, not a sushi/fish serving.
   m.clear();world.cyl(m,.50,.48,.04,'#e9e1cc',[0,.025,0]);for(const x of [-.25,0,.25]){world.box(m,.18,.06,.35,'#ce8b8d',[x,.09,0]);world.box(m,.15,.012,.035,'#f0c4b0',[x,.124,0]);}world.rod(props,[.6,.09,-.1],[.66,.09,.42],.027,'#bec9c4');world.rod(props,[.6,.09,-.1],[.84,.09,.42],.027,'#bec9c4');
  }
 }
 world.request();
}

export function createWorkModels({box,cyl,sphere,rod}){
 return (g,w)=>{
 const k=w.kind,metal='#b7c8c5',dark='#526867';
 if(k==='luggage-basket'){
  box(g,1.25,.065,.82,'#a68a65',[0,.05,0]);
  for(const x of [-.61,.61]){for(const z of [-.39,.39])rod(g,[x,.07,z],[x,.61,z],.035,'#8d765a');for(const y of [.16,.31,.46,.59])box(g,.045,.04,.84,'#baa17e',[x,y,0]);}
  for(const z of [-.4,.4])for(const y of [.16,.31,.46,.59])box(g,1.22,.04,.04,'#baa17e',[0,y,z]);
  box(g,.65,.36,.28,'#5b8284',[0,.27,0]);for(const x of [-.23,.23])rod(g,[x,.4,0],[x,.53,0],.024,'#435c5b');rod(g,[-.23,.53,0],[.23,.53,0],.024,'#435c5b');return true;
 }
 if(k==='cup-shelf'){
  for(const x of [-1.05,1.05])box(g,.1,1.55,.55,'#ad8963',[x,.775,0]);for(const y of [.2,.8,1.4]){box(g,2.15,.08,.55,'#ddbb87',[0,y,0]);for(const x of [-.7,0,.7]){cyl(g,.13,.11,.23,'#d3e0d5',[x,y+.16,0]);cyl(g,.11,.11,.01,'#637e75',[x,y+.28,0]);}}return true;
 }
 if(k==='noodle-boiler'){
  box(g,2.45,1.06,1.42,metal,[0,.53,0]);box(g,2.55,.12,1.52,'#d3dfdb',[0,1.1,0]);
  box(g,2.15,.015,1.08,dark,[0,1.168,0]);
  for(const x of [-.68,0,.68])for(const z of [-.27,.27]){cyl(g,.245,.245,.035,'#aecad0',[x,1.195,z]);rod(g,[x,1.2,z],[x,1.60,z+.12],.025,'#d9e3dc');rod(g,[x,1.6,z+.12],[x,1.61,z+.35],.048,'#7a654d');}
  for(const x of [-.7,0,.7])cyl(g,.09,.09,.05,dark,[x,.89,.75],[Math.PI/2,0,0]);return true;
 }
 if(k==='noodle-strainer'){
  for(let i=0;i<12;i++){const a=i*Math.PI/6;rod(g,[Math.cos(a)*.18,.03,Math.sin(a)*.18],[Math.cos(a)*.27,.45,Math.sin(a)*.27],.016,metal);}
  for(const y of [.07,.18,.29,.43]){const r=.18+y*.2;for(let i=0;i<16;i++){const a=i*Math.PI/8,b=(i+1)*Math.PI/8;rod(g,[Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(b)*r,y,Math.sin(b)*r],.013,metal);}}
  for(let i=-2;i<=2;i++)rod(g,[-.14,.11,i*.045],[.14,.11,i*.045],.023,'#eed3a0');rod(g,[.24,.44,0],[.62,.75,0],.035,metal);rod(g,[.62,.75,0],[.89,.97,0],.06,'#8b6449');return true;
 }
 if(k==='soup-ladle'){sphere(g,.22,metal,[0,.13,0],[1,.45,1]);rod(g,[0,.2,0],[.65,.7,0],.028,metal);return true;}
 if(k==='raw-noodles'){
  box(g,.95,.10,.8,'#e1c38c',[0,.06,0]);for(let z=-.3;z<=.3;z+=.05)for(const x of [-.25,.25])rod(g,[x-.17,.15,z],[x+.17,.15,z+.015],.025,'#f0dbad');return true;
 }
 if(k==='topping-pans'){
  for(const [i,c]of ['#8cbd77','#bc8766','#eee1b9'].entries()){box(g,.43,.12,.7,metal,[(i-1)*.48,.06,0]);for(const z of [-.2,0,.2])sphere(g,.10,c,[(i-1)*.48,.15,z],[1,.45,1]);}return true;
 }
 if(k==='bowl-stack'){
  for(let i=0;i<4;i++){cyl(g,.35,.22,.16,'#f2e3c6',[0,.09+i*.12,0]);}cyl(g,.30,.28,.015,'#c6b48e',[0,.535,0]);return true;
 }
 if(k==='work-sink'){
  box(g,1.8,1.18,1.3,metal,[0,.59,0]);box(g,1.5,.02,1,'#657d7c',[0,1.19,0]);box(g,1.2,.01,.72,'#a5c4c2',[0,1.2,0]);rod(g,[.55,1.2,-.48],[.55,1.65,-.48],.045,metal);rod(g,[.55,1.65,-.48],[.55,1.65,-.1],.045,metal);return true;
 }
 if(k==='wall-vent'){
  box(g,1.1,1.05,.14,'#a9b5b0',[0,0,0]);cyl(g,.4,.4,.05,dark,[0,0,.10],[Math.PI/2,0,0]);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const x=Math.cos(a),y=Math.sin(a);rod(g,[0,0,.14],[x*.3,y*.3,.14],.095,'#d5dfd7');}return true;
 }
 return false;
 };
}
