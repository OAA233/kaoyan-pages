// Real machine families, illustrated for vocabulary learning rather than emulated games.
export function createArcadeModels({box,cyl,sphere,mesh,rod,label,group}){return(g,w)=>{
 if(w.kind==='pedal'){box(g,.45,.07,.8,'#a4b4b1',[0,.1,0],[-.35,0,0]);return true;}
 if(w.kind==='sticks'){for(const x of[-.18,.18])rod(g,[x,.05,-.5],[x,.05,.5],.04,'#caa16a');return true;}
 if(w.kind==='puck'){cyl(g,.3,.3,.08,'#d6ae4d',[0,.05,0]);return true;}
 const a=w.arcade;if(!a)return false;const type=a.type,body=a.color||'#df9283',dark='#455863',white='#f4ead4';
 const part=(m,jp)=>{m.userData.partName=jp;return m;};
 const screen=(x,y,z,width=1.5,height=.95)=>{box(g,width+.18,height+.18,.18,dark,[x,y,z]);const s=box(g,width,height,.025,'#9bc9cd',[x,y,z+.104]);for(let i=0;i<3;i++)box(g,width*.65,.05,.015,'#dcedd2',[x,y+.22-i*.20,z+.13]);part(s,'モニター');return s;};
 const coin=(x,y,z)=>part(box(g,.12,.25,.06,dark,[x,y,z]),'コイン投入口');
 if(type==='racer'){
  box(g,2.2,.18,4,body,[0,.10,0]);box(g,2.1,1.3,.65,body,[0,.82,-1.5]);screen(0,2,-1.45,1.85,1.1);
  box(g,1.95,.16,.90,dark,[0,1.34,-.80],[-.2,0,0]);part(mesh(g,'torus',[.37,.07,8,24],dark,[0,1.56,-.3],[.32,0,0]),'ハンドル');
  for(const x of[-.25,.25])part(box(g,.20,.08,.43,'#adb8b1',[x,.30,-.3],[-.4,0,0]),x<0?'ブレーキ':'アクセル');
  box(g,1.1,.18,1.05,dark,[0,.65,1]);box(g,1.1,1.1,.22,body,[0,1.2,1.45],[-.15,0,0]);rod(g,[.7,1,-.1],[.7,1.5,-.1],.05,dark);part(sphere(g,.12,dark,[.7,1.5,-.1]),'シフトレバー');coin(.75,.95,-1.1);
 }else if(type==='claw'){
  box(g,2.5,1,1.9,body,[0,.5,0]);box(g,2.5,.20,1.9,white,[0,2.9,0]);
  for(const x of[-1.18,1.18])for(const z of[-.87,.87])box(g,.13,1.9,.13,white,[x,1.95,z]);box(g,2.3,1.8,.07,'#b9d7cb',[0,1.9,-.9]);
  box(g,2.3,.12,1.8,'#e8d5b4',[0,1.07,0]);for(const x of[-.7,0,.7]){part(sphere(g,.23,'#b7c69f',[x,1.34,.16]),'ぬいぐるみ');sphere(g,.18,'#dec49c',[x,1.57,.16]);}
  rod(g,[0,2.8,0],[0,2.3,0],.04,dark);for(const x of[-.25,.25]){rod(g,[0,2.32,0],[x,2.05,0],.04,'#95a6a3');part(rod(g,[x,2.05,0],[x*.4,1.94,0],.04,'#95a6a3'),'アーム');}
  part(box(g,.9,.4,.06,dark,[0,.42,1]),'取り出し口');box(g,1.9,.12,.5,white,[0,1.12,1.1]);part(sphere(g,.12,'#d1827b',[-.55,1.27,1.1]),'操作レバー');part(cyl(g,.11,.11,.06,'#eccb78',[.5,1.23,1.1]),'ボタン');coin(.86,.83,1);
 }else if(type==='maimai'){
  box(g,2.2,2.6,.85,white,[0,1.3,0]);part(cyl(g,.86,.86,.13,'#84bed0',[0,1.75,.51],[Math.PI/2,0,0]),'タッチパネル');
  for(let i=0;i<8;i++){let a=i*Math.PI/4;part(cyl(g,.13,.13,.15,i%2?'#d592b3':'#e7c35f',[Math.cos(a)*.95,1.75+Math.sin(a)*.95,.58],[Math.PI/2,0,0]),'ボタン');}coin(.6,.6,.5);
 }else if(type==='taiko'){
  box(g,2.7,1.5,.75,body,[0,.75,-.55]);screen(0,2.15,-.5,2,1);for(const x of[-.67,.67]){part(cyl(g,.52,.52,.6,'#b77346',[x,1.1,.55],[.62,0,0]),'太鼓');part(cyl(g,.5,.5,.04,'#edce94',[x,1.365,.74],[.62,0,0]),'太鼓');part(rod(g,[x-.25,1.05,1.05],[x+.25,1.25,1.5],.04,'#ad7e52'),'バチ');}
 }else if(type==='medal'){
  box(g,3.2,.85,2.3,body,[0,.43,0]);box(g,3.2,1.5,.12,white,[0,1.65,-1.1]);screen(0,2,-.99,2.6,.7);
  for(const x of[-1.5,1.5])box(g,.1,1.7,2,white,[x,1.7,-.1]);
  for(const [y,z] of[[1.12,.28],[1.52,-.42]]){part(box(g,2.85,.1,.8,'#e2cc97',[0,y,z]),'プッシャー');for(let i=0;i<18;i++)part(cyl(g,.11,.11,.035,'#d5b467',[(i%6-2.5)*.36,y+.075,z+(Math.floor(i/6)-1)*.20]),'メダル');}
  part(box(g,1.4,.20,.1,dark,[0,.58,1.19]),'メダル受け皿');coin(1,.90,1.2);
 }else if(type==='hockey'){
  box(g,2.4,.16,4.2,'#bdd9d1',[0,1,0]);for(const x of[-1.25,1.25])box(g,.1,.24,4.3,body,[x,1.10,0]);for(const z of[-2.15,2.15])box(g,2.5,.24,.1,body,[0,1.10,z]);for(const x of[-.9,.9])for(const z of[-1.6,1.6])box(g,.18,.9,.18,dark,[x,.45,z]);for(const z of[-1.4,1.4]){cyl(g,.18,.18,.08,body,[0,1.14,z]);sphere(g,.1,body,[0,1.25,z]);}part(cyl(g,.13,.13,.045,'#d6ae4d',[.2,1.12,.5]),'パック');
 }else if(type==='photo'){
  box(g,2.7,2.8,.18,body,[0,1.4,-1.2]);for(const x of[-1.35,1.35])box(g,.12,2.8,2.4,white,[x,1.4,0]);box(g,2.7,.3,2.4,body,[0,2.8,0]);screen(0,1.7,-1.08,1,.7);part(cyl(g,.1,.1,.08,dark,[0,2.3,-.95],[Math.PI/2,0,0]),'カメラ');box(g,1.1,2.3,.04,'#d4b2c2',[-.65,1.25,1.2]);
 }else{
  box(g,2,1.25,1.05,body,[0,.63,0]);screen(0,2,-.3,1.75,1.25);box(g,2,.10,1.1,white,[0,1.30,.35]);for(let i=0;i<10;i++)part(box(g,.16,.04,.55,['#e8c66e','#b8d7ca'][i%2],[-.81+i*.18,1.37,.5]),'鍵盤');coin(.6,.85,.56);
 }
 label(g,w.jp,Math.min(type==='medal'?3:2.5,2.7),.30,[0,type==='racer'?2.80:type==='claw'?3.10:type==='hockey'?1.28:3.03,type==='hockey'?0:.15]);return true;
};}
export function furnishArcade(world,data,zone,h){
 if(data.id!=='arcade')return false;
 const {put,surface,counter,sceneGroup,register,used}=h,words=data.items.filter(w=>w.zone===zone.index),machines=words.filter(w=>w.arcade);
 machines.forEach((w,i)=>{const pos=w.arcade.local||[(i-(machines.length-1)/2)*4,0,-2],g=world.group(null,pos,0,sceneGroup);world.models.model(g,w);register(g,w);world.collider(zone.x+pos[0],zone.z+pos[2],w.arcade.type==='medal'?3.3:2.8,w.arcade.type==='racer'||w.arcade.type==='hockey'?4.3:2.8);
  g.traverse(o=>{const jp=o.userData.partName;if(!jp)return;const part=data.items.find(x=>x.jp===jp);if(part)register(o,part);});
 });
 if(zone.index===4){counter(0,-2,9,1.7);put('register',1,-2,1,[],1.33);put('change-machine',-5.5,1.4,1.2,['両替機']);put('bench',3,3,.9,['ベンチ']);}
 // Bind general machine vocabulary to the appropriate real example; names remain separately learnable.
 const aliases={0:['クレーンゲーム'],1:['ゲーム機','ハンドル'],2:['音楽ゲーム'],3:['プリントシール機','プリクラ']};
 for(const jp of aliases[zone.index]||[]){const w=words.find(w=>w.jp===jp);if(w&&!used.has(w.id)&&machines.length){const g=world.entities.get(machines[0].id);world.entities.set(w.id,g);used.add(w.id);}}
 // A service desk holds maintenance supplies; game floors have no display tables.
 const bindings={0:['景品','プライズ'],1:['ハンドル','レバー','ボタン'],2:['スピーカー'],3:['写真']};
 for(const jp of bindings[zone.index]||[]){const w=words.find(w=>w.jp===jp);if(w&&!used.has(w.id)&&machines.length){world.entities.set(w.id,world.entities.get(machines[0].id));used.add(w.id);}}
 if(zone.index===4){surface(-.8,-5.4,6,1.3,.95);put('tv',-.8,-5.4,.75,['パソコン'],1.02);h.shelf(-6.4,-3.8,2.2,2);}
 if(zone.index===0){put('change-machine',-5.8,1.5,1,['両替機']);put('umbrella-stand',-5.8,4,.8,['傘立て']);}
 if(zone.index===1){put('camera',-5.8,-4,.9,['防犯カメラ'],2.7);}
 if(zone.index===2){put('headphones',-5,0,1,['ヘッドホン'],1.2);}

 return true;
}
