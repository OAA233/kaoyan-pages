// Real uses determine the fixtures and circulation, rather than a table in every zone.
export function furnishVenue(world,data,zone,h){
 const {box,put,fixture,surface,shelf,carpet,counter,plant,sceneGroup,surfaces,register,find,used}=h,i=zone.index;
 const sign=(t,x,z,width=3,y=2.7)=>world.label(sceneGroup,t,width,.4,[x,y,z]);
 const bind=(g,jp)=>{const w=data.items.find(w=>w.jp===jp);if(w)register(g,w);return g;};
 const small=(jp,x,z,y=1.1,scale=.75)=>{const w=data.items.find(w=>w.jp===jp);if(!w)return;const g=world.group(null,[x,y,z],0,sceneGroup);world.models.model(g,w);g.scale.setScalar(scale);register(g,w);return g;};
 if(data.id==='koban'){
  if(i===0){surface(0,-2,6,1.8,1.1);put('chair',0,-3.6,1,['椅子']).rotation.y=Math.PI;put('chair',-2,-.4);put('telephone',2,-2,.65,[],1.16);sign('交番',0,-5,3);shelf(-5,-4,2.5,2.1);}
  if(i===1){const board=box(6,3,.12,'#d8cdb4',0,2,-3.5);bind(board,'地図');const g=world.group(null,[0,2,-3.39],0,sceneGroup);for(let j=-2;j<=2;j++){world.box(g,5.7,.08,.02,'#b89d7d',[0,j*.45,0]);world.box(g,.08,2.6,.02,'#b89d7d',[j,0,0]);}for(const [x,y]of[[-1.5,.7],[1.2,-.3],[.1,.6]])world.box(g,.55,.30,.024,'#88b6a3',[x,y,.025]);bind(g,'案内用の地図');put('bench',0,1.7,1.2,['ベンチ']);}
  if(i===2){shelf(0,-3.5,7,2.8);surface(0,.2,6,1.4,1);sign('お預かりしたもの',0,-4.7,4);}
  if(i===3){const road=carpet(0,1,13,5,'#879c97');bind(road,'道路');bind(carpet(0,-2.4,13,1.8,'#d2d1bd'),'歩道');const g=world.group(null,[0,.1,1],0,sceneGroup);for(let j=-2;j<=2;j++)world.box(g,.7,.015,4.2,'#f0e4c9',[j*1.25,0,0]);bind(g,'横断歩道');put('bicycle',-4,-3.4,1.1,['自転車']);small('ヘルメット',-4,-3.4,1.3,.7);small('反射材',-4,-3.4,1.75,.5);put('trafficlight',4.8,-2.6,1,['信号']);}
  return true;
 }
 if(data.id==='clothing'){
  if(i===0){
   const clothes=data.items.filter(w=>w.zone===0&&['shirt','tshirt','blouse','sweater','cardigan','jacket','coat','dress','skirt','pants','suit','pajamas'].includes(w.kind));
   for(const [r,z]of[-3.5,1].entries()){const rack=world.group(null,[0,0,z],0,sceneGroup);for(const x of[-5,5]){world.rod(rack,[x,.1,0],[x,2.55,0],.055,'#708e8c');world.box(rack,.5,.10,1.1,'#708e8c',[x,.1,0]);}world.rod(rack,[-5,2.55,0],[5,2.55,0],.055,'#708e8c');bind(rack,'ハンガーラック');world.collider(zone.x,zone.z+z,10.3,1.2);
    for(const [j,w]of clothes.slice(r*7,r*7+7).entries()){const x=(j-3)*1.25;const g=world.group(null,[x,.75,z],0,sceneGroup);world.models.model(g,w);g.scale.setScalar(.95);register(g,w);const a=world.group(null,[x,2.2,z],0,sceneGroup);world.models.model(a,{kind:'hanger',jp:'ハンガー'});a.scale.setScalar(.5);bind(a,'ハンガー');}
   }surface(-3,4,4.8,1.6,.8);surface(3,4,4.8,1.6,.8);
  }else if(i===1){shelf(0,-3.8,9,2.3);put('bench',0,1.4,1.5);put('mirror',5,0,1.1,['姿見']);small('靴べら',2.2,1.4,.85,.8);}
  else if(i===2){shelf(-3.5,-3.5,5,2.5);surface(3,-.5,4,2,.85);put('sofa',-3.5,2,1.2,['ソファ']);}
  else if(i===3){for(const x of[-3.6,3.6]){box(.12,2.5,3.5,'#ded2c6',x-1.6,1.25,-2);box(.12,2.5,3.5,'#ded2c6',x+1.6,1.25,-2);put('curtain',x,-.3,1.1,['カーテン']);put('mirror',x,-3.6,1,['鏡']);}put('mannequin',-5.4,3,1,['マネキン']);surface(3.7,3.5,3,1,.9);}
  else{counter(0,-2,8,1.7);put('register',2,-2,.95,['レジ'],1.35);surface(-3,2.5,4,1.6,.95);put('chair',-3,4,1,['椅子']);shelf(-5.6,-4.5,2,2);}
  return true;
 }
 if(data.id==='festival'){
  if(i===0){for(const x of[-4,3.5]){fixture('stall',x,-3,1.65);surfaces.push({x,z:-2.5,w:4.5,d:1.3,y:1.66});}sign('たこ焼き',-4,-2,3);sign('焼きそば',3.5,-2,3);surface(-3.6,2.4,4.7,1.5,.85);surface(3.4,2.4,4.7,1.5,.85);}
  else if(i===1){fixture('stall',0,-3,1.65);surfaces.push({x:0,z:-2.5,w:4.5,d:1.3,y:1.66});sign('ラムネ・冷たい飲み物',0,-2,4);const tub=world.group(null,[0,0,1.5],0,sceneGroup);world.box(tub,5,.65,1.8,'#8bb9c5',[0,.33,0]);world.box(tub,4.8,.03,1.65,'#b3d5d9',[0,.68,0]);for(let x=-1.8;x<=1.8;x+=.9){const g=world.group(null,[x,.72,0],0,tub);world.models.model(g,{kind:'bottle',jp:'ラムネ'});g.scale.setScalar(.6);}world.collider(zone.x,zone.z+1.5,5,1.8);}
  else if(i===2){for(const [x,jp]of[[-3.5,'金魚'],[3.5,'ヨーヨー']]){const tub=world.group(null,[x,0,-1.8],0,sceneGroup);world.box(tub,5,.7,3.4,'#88b9cb',[0,.35,0]);world.box(tub,4.8,.02,3.2,'#b1d4d8',[0,.73,0]);world.collider(zone.x+x,zone.z-1.8,5,3.4);for(let n=0;n<5;n++)small(jp,x+(n%3-1)*1.2,-2.3+Math.floor(n/3),.83,.55);sign(jp==='金魚'?'金魚すくい':'ヨーヨー釣り',x,-4,3);}surface(0,2.1,8,1.2,.8);}
  else if(i===3){const platform=box(10,.7,7,'#bb7c67',0,.35,-1);bind(platform,'やぐら');world.collider(zone.x,zone.z-1,10,7);for(const x of[-4.5,4.5])for(const z of[-3.8,1.8])box(.16,3,.16,'#9e7156',x,2,z);box(10.5,.14,7.5,'#c78d7b',0,3.5,-1);small('太鼓',0,-1,.85,2);small('浴衣',-3,-1,.8,1.1);small('はっぴ',3,-1,.8,1.1);for(const x of[-4,-2,0,2,4])put('lantern',x,2.3,.8,['提灯'],2.7);}
  else{put('bench',-3,-2,1.5,['ベンチ']);put('bench',3,-2,1.5,['ベンチ']);surface(0,1.5,7,2,.8);put('trash',5,3,1,['ごみ箱']);}
  return true;
 }
 if(data.id==='sento'){
  if(i===0){fixture('cabinet',-4,-3,1.5,['下足箱']);counter(2,-2,6,1.5);put('register',2,-2,.75,[],1.35);put('noren',0,-5,1,['暖簾'],1.8);sign('ゆ',0,-4,1.2);}
  else if(i===1){for(const x of[-5,-2.5,0,2.5,5])fixture('locker',x,-4,1,['ロッカー']);put('bench',-3,1,1.5);counter(3,2.4,5,1.3);put('mirror',3,1.7,1.2);surface(-3,3.5,4,1.3,.75);small('体重計',4.8,-1,0,1);}
  else if(i===2){for(const x of[-4.5,0,4.5]){fixture('shower',x,-4.5,1.1,['シャワー']);put('mirror',x,-4.8,.85);put('stool',x,-2.8,.9,['風呂椅子']);put('tub',x+.8,-2.7,.7,['湯おけ']);small('カラン',x,-3.8,.55,.7);for(const [j,jp]of['シャンプー','コンディショナー','ボディーソープ'].entries())small(jp,x-.8+j*.42,-3.6,.3,.65);}surface(5,1.3,2,1,.5);}
  else if(i===3){fixture('bathtub',-2.4,-2.5,1.7,['浴槽']);fixture('pool',4,0,1.3,['水風呂']);const g=world.group(null,[-2.5,0,2.6],0,sceneGroup);world.box(g,5,.15,2.1,'#ac8662',[0,.15,0]);world.box(g,5,.14,1,'#c4a17a',[0,.65,-.5]);world.box(g,5,1.5,.12,'#c4a17a',[0,.9,-1.1]);world.collider(zone.x-2.5,zone.z+2.6,5,2.2);small('サウナマット',-2.4,2.6,.27,1.2);small('サウナ用砂時計',-.4,1.5,1,.8);small('水風呂の温度計',4.8,-1,1,.9);sign('サウナ',-2.5,1.3,2.5);}
  else{put('sofa',-3,-2,1.6);fixture('vending',5,-3,1.2);surface(0,1.5,6,2,.65);put('bench',-4,3.5,1.2);}
  return true;
 }
 if(data.id==='station'){
  if(i===0){counter(-3,-2.5,5,1.4);put('vending',5,-3.5,1.2,['自動販売機']);fixture('locker',-6,1.2,1.3,['コインロッカー']);put('bench',2.5,2.5,1.5,['ベンチ']);put('trash',6,2.5,.9,['ごみ箱']);sign('ご案内',-3,-3.5,3);}
  else if(i===1){for(const x of[-4,0,4])fixture('ticket-machine',x,-3.2,1.2,['券売機']);counter(0,1.8,5,1.3);sign('きっぷ・定期券',0,-4.5,4);}
  else if(i===2){for(const x of[-4,-2,0,2,4]){const g=world.group(null,[x,0,-1],0,sceneGroup);world.box(g,.7,1.05,2.6,'#86ada8',[0,.54,0]);world.box(g,.72,.08,2.65,'#dce1c8',[0,1.13,0]);world.box(g,.40,.035,.45,'#83b6c9',[0,1.19,.60]);bind(g,'改札口');world.collider(zone.x+x,zone.z-1,.7,2.6);}sign('改札口',0,-2.9,3);}
  else if(i===3){const plat=carpet(1,0,13,11.5,'#c6cfc4');bind(plat,'ホーム');const tr=world.group(null,[-5.3,.1,0],0,sceneGroup);for(const x of[-.6,.6])world.box(tr,.10,.10,12,'#738986',[x,0,0]);for(let z=-5.5;z<6;z+=.65)world.box(tr,2,.04,.18,'#a69074',[0,-.05,z]);bind(tr,'線路');bind(carpet(-3.6,0,.65,12,'#e4c971'),'黄色い線');put('bench',2,2.5,1.2,['ベンチ']);put('departure-board',2,-3,1.2,['電光掲示板'],1.4);small('乗車位置案内',-2,1.3,.10,1);}
  else if(i===4){const car=world.group(null,[0,0,0],0,sceneGroup);world.box(car,11,.2,11,'#c8d6d0',[0,.1,0]);bind(car,'電車');for(const x of[-5.3,5.3]){world.box(car,.15,1.5,11,'#dce3d7',[x,.92,0]);for(const z of[-3.4,1.1]){const b=put('bench',x<0?-4:4,z,1.15,['座席']);b.rotation.y=x<0?Math.PI/2:-Math.PI/2;bind(b,z<0?'座席':'優先席');}for(const z of[-3,0,3]){const win=world.box(car,.08,1.1,2.1,'#b1d0d0',[x,1.65,z]);bind(win,'窓');}const rack=world.box(car,1,.08,8,'#b8c7bc',[x<0?-4.5:4.5,2.65,0]);bind(rack,'荷物棚');bind(rack,'網棚');}
   for(const x of[-2.8,2.8]){const pole=world.rod(car,[x,.2,-4.5],[x,3,-4.5],.04,'#8aaba7');bind(pole,'手すり');for(const z of[-3,0,3]){const ring=world.mesh(car,'torus',[.17,.035,8,20],'#f0dfbb',[x,2.6,z]);bind(ring,'つり革');world.rod(car,[x,2.77,z],[x,3.1,z],.025,'#a6b9ae');}}
   const door=world.box(car,3,2.6,.12,'#b5c9c4',[0,1.45,-5.5]);bind(door,'ドア');small('非常ボタン',2,-5.3,1.7,.8);small('車内広告',0,-5.25,2.65,1.2);
  }return true;
 }
 return false;
}
