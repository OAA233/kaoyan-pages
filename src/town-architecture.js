import {lots,streets,entryFor} from './town-layout.js';
export async function buildJapaneseTown(w,catalog,character){
 const roadPaths=[];
 const T=w.THREE,snow=w.season==='winter',roofColor=snow?'#e9eeea':'#596775';
 w.clear();w.worldMode='town';w.data=null;w.townCatalog=catalog;w.bounds=[-85,86,-88,87];w.buildingStyles=[];
 const box=(g,a,b,c,col,x=0,y=0,z=0,r)=>w.box(g,a,b,c,col,[x,y,z],r);
 const cyl=(g,a,b,h,col,x=0,y=0,z=0,r)=>w.cyl(g,a,b,h,col,[x,y,z],r);
 const group=(g,x=0,y=0,z=0)=>w.group(null,[x,y,z],0,g);
 const sign=(g,text,a,b,x,y,z,bg='#ece3c7',col='#374b4d')=>w.label(g,text,a,b,[x,y,z],0,bg,col);
 function path(points,width,color,y=.03,curve=true){const pts=curve?new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],y,p[1])),false,'centripetal').getPoints(Math.max(12,points.length*12)):points.map(p=>new T.Vector3(p[0],y,p[1]));const vertices=[],indices=[];pts.forEach((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],v=b.clone().sub(a).normalize(),n=new T.Vector3(-v.z,0,v.x).multiplyScalar(width/2);vertices.push(p.x+n.x,y,p.z+n.z,p.x-n.x,y,p.z-n.z);if(i)indices.push(i*2-2,i*2-1,i*2,i*2-1,i*2+1,i*2);});const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new T.Mesh(geo,w.mat(color,{side:T.DoubleSide}));mesh.receiveShadow=true;w.root.add(mesh);w.geometries.set('street-'+w.geometries.size,geo);mesh.userData.pathPoints=pts;mesh.userData.width=width;return mesh;}
 function tileRoof(g,W,D,y,col=roofColor,angle=.43){const length=(D/2+.38)/Math.cos(angle);for(const side of [-1,1]){const p=group(g,0,y+D*Math.tan(angle)/4,side*D/4);p.rotation.x=side*angle;box(p,W+.8,.14,length,col);for(let x=-W/2;x<=W/2+.01;x+=.68)w.rod(p,[x,.095,-length/2],[x,.095,length/2],.034,snow?'#f6f8f0':'#7e8d99');box(p,W+.9,.14,.16,snow?'#eef2ed':'#485768',0,0,length/2*side);}box(g,W+.85,.24,.34,col,0,y+D*Math.tan(angle)/2,0);}
 function lattice(g,W,H,x,y,z,dark='#695447'){box(g,W,H,.10,'#a6bebb',x,y,z);for(let a=-W/2;a<=W/2+.01;a+=.30)box(g,.055,H+.06,.13,dark,x+a,y,z+.07);for(const b of [-H/2,H/2])box(g,W+.13,.09,.16,dark,x,y+b,z+.07);}
 function glass(g,W,H,x,y,z){const m=box(g,W,H,.08,'#a5c8c7',x,y,z,undefined);m.material=w.mat('#a5c8c7',{emissive:'#b99152',emissiveIntensity:0});w.nightLights.push(m);for(const a of [-W/2,W/2])box(g,.09,H,.13,'#f1e8cf',x+a,y,z+.055);box(g,W,.08,.13,'#ece3cf',x,y,z+.07);}
 function door(g,x=0,z=4,y=1.25){lattice(g,1.8,2.3,x,y,z);box(g,.07,.3,.08,'#d4ba8d',x+.65,y,z+.17);}
 function lantern(g,x,y,z,text=''){cyl(g,.24,.28,.68,'#d67b60',x,y,z);for(const h of [-.35,.35])cyl(g,.24,.24,.055,'#695447',x,y+h,z);if(text)sign(g,text,.28,.44,x,y,z+.28,'#d67b60','#fff2cf');}
 function noren(g,text,W=2.8,col='#536c83',y=2.6,z=4.25){for(let i=0;i<4;i++)box(g,W/4-.035,.75,.04,col,(i-1.5)*W/4,y,z);if(text)sign(g,text,W*.8,.44,0,y,z+.03,col,'#fff2db');}
 function trim(g,W,H,D){for(const x of [-W/2,0,W/2])box(g,.15,H,.16,'#694d3d',x,H/2,D/2+.05);for(const y of [.18,2.75,H])box(g,W+.15,.14,.18,'#715744',0,y,D/2+.05);}
 function machiya(g,s,W=9.5,H=4.8,D=7.4,cloth='#687c71'){box(g,W,H,D,s.id==='yakiniku'?'#7b695b':'#e1d3b9',0,H/2,0);trim(g,W,H,D);tileRoof(g,W,D,H+.08);tileRoof(group(g,0,0,D/2-.35),W,1.65,2.8,roofColor,.24);door(g,0,D/2+.12);lattice(g,W*.28,1.55,-W*.31,1.55,D/2+.1);lattice(g,W*.26,1.55,W*.31,1.55,D/2+.1);if(H>4)for(const x of [-W*.28,W*.28])lattice(g,W*.32,1.05,x,H-.9,D/2+.08);noren(g,'',2.8,cloth,2.24,D/2+.35);for(const x of [-W/2+.4,W/2-.4])lantern(g,x,2.4,D/2+.65,s.id==='izakaya'?'酒':'');box(g,1.5,.8,.9,'#825f43',-W/2-.45,.4,2.4);w.sphere(g,.5,'#7d9468',[-W/2-.45,1.15,2.4]);}
 function modern(g,s,W=10,H=5,D=7.5,col='#e3dfcb',accent='#749b96',levels=1){box(g,W,H,D,col,0,H/2,0);box(g,W+.25,.22,D+.3,'#c6c5b7',0,H+.08,0);for(let floor=0;floor<levels;floor++){const y=(floor+.5)*H/levels;for(const x of [-W*.30,W*.30])glass(g,W*.31,H/levels*.52,x,y,D/2+.05);box(g,W,.20,.2,accent,0,(floor+1)*H/levels-.30,D/2+.15);}door(g,0,D/2+.1);box(g,1.4,.65,1.3,'#a9b6b1',W*.28,H+.5,-D*.26);}
 function model(g,k,x,y,z,scale=1,jp=''){const a=group(g,x,y,z);w.models.model(a,{kind:k,jp});a.scale.setScalar(scale);return a;}
 function parking(g,x,z){for(let a=0;a<3;a++){box(g,1.25,.02,2.8,'#bdc4b7',x+a*1.5,.12,z);box(g,.06,.03,2.7,'#f8f2da',x+a*1.5-.63,.14,z);}model(g,'bicycle',x,0,z,1);}
 // Terrain, curved streets and the river define the neighbourhood instead of a repeating grid.
 box(w.root,176,.18,180,snow?'#e6eeeb':'#99bc87',0,-.20,0);
 path([[44,-88],[43,-63],[45,-39],[42,-14],[44,16],[43,45],[48,87]],10.8,'#a1b9a3',-.015);
 path([[44,-88],[43,-63],[45,-39],[42,-14],[44,16],[43,45],[48,87]],7.5,'#83bec9',.005);
 for(const r of streets){path(r.points,r.width+3.4,snow?'#d9e2db':'#d7c7aa',.018);roadPaths.push(path(r.points,r.width,'#909e9c',.025));}
 function nearestRoad(x,z){let best=[x,z],dist=Infinity;for(const r of roadPaths){const pts=r.userData.pathPoints;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz))),q=[a.x+dx*t,a.z+dz*t],d=Math.hypot(x-q[0],z-q[1]);if(d<dist){dist=d;best=q;}}}return best;}
 // Station forecourt, little stone plazas, and quiet footpaths.
 box(w.root,34,.04,12,snow?'#e4e8df':'#ded0b3',4,.05,63);
 for(let z=-82;z<85;z+=5)if(Math.abs(z-20)>6&&Math.abs(z+35)>6)w.collider(44,z,6,4.9);
 for(const z of [20,-35]){box(w.root,13,.12,5,'#bca886',44,.11,z);for(const side of [-1,1]){w.rod(w.root,[38,.88,z+side*2.35],[50,.88,z+side*2.35],.07,'#755f4c');for(const x of [38,40,42,44,46,48,50])box(w.root,.1,.9,.1,'#826b56',x,.46,z+side*2.35);}}
 const restaurantStyle={sushi:[10,3.5,7.5,'#4f6a80'],izakaya:[8.7,5.9,7.3,'#a95248'],yakiniku:[9,5.3,8,'#79554d'],ramen:[7.7,3.4,7,'#ba5b43'],soba:[8,4.3,7.2,'#6b756e'],teishoku:[9.2,5.1,7,'#9e8953'],kissaten:[7.8,6.2,7,'#824f51'],wagashi:[10,3.9,7.8,'#68845a']};
 for(const s of catalog){
  const [x,z,angle]=lots[s.id],g=group(w.root,x,0,z);g.rotation.y=angle;let style='';box(g,12,.18,11,'#d4c3a4',0,.005,0);
  if(s.id==='tobita'){style='街並み入口・木造町家';machiya(g,s,9,5.8,7.4,'#805845');for(const y of[3.5,4.25])box(g,8.6,.14,.13,'#b6513d',0,y,3.95);for(let xx=-4;xx<=4;xx+=.65)box(g,.08,.8,.1,'#b6513d',xx,3.87,3.95);}
  else if(restaurantStyle[s.id]){style='町家・'+s.id;machiya(g,s,...restaurantStyle[s.id]);
   if(s.id==='sushi'){sign(g,'鮨',1.6,1.6,-3.4,2,4.1,'#eee0bd');model(g,'display',3.8,.35,4.5,.75);}
   if(s.id==='izakaya'){for(let n=0;n<3;n++)model(g,'barrel',-4.8+n*.7,.2,4.7,.55);sign(g,'旬の肴',1.2,1.6,3.9,2.1,4.02,'#e9d5ad');}
   if(s.id==='yakiniku'){for(const dx of [-2.7,2.7])cyl(g,.22,.22,2,'#8f9b9b',dx,6.5,-1.8);sign(g,'炭火',1.7,1,-2.9,1.8,4.15,'#554b42','#f2e3b9');}
   if(s.id==='ramen'){model(g,'bowl',-3.2,3.8,3.2,2.5);sign(g,'らーめん',3.8,.6,0,3.05,4,'#b85745','#fff1ce');}
   if(s.id==='soba'){cyl(g,.6,.6,.38,'#989d8d',-4.4,.75,4.3,[Math.PI/2,0,0]);w.sphere(g,.53,'#779363',[3.9,3.0,4]);}
   if(s.id==='teishoku'){model(g,'menu',3.3,0,4.6,.85);model(g,'display',-3.6,.15,4.4,.65);}
   if(s.id==='kissaten'){for(const dx of [-2.1,2.1])glass(g,2.3,1.5,dx,4.7,3.64);sign(g,'喫茶',1.6,.8,-2.6,1.7,3.73,'#80584a','#f0ddba');}
   if(s.id==='wagashi'){model(g,'bench',-2.7,0,4.6,.9);model(g,'bamboo',4.5,0,4.4,.95);sign(g,'和菓子',2,.65,2.7,2.1,4.05,'#eee2c4');}
  }else if(s.id==='temple'||s.id==='shrine'){style=s.id==='temple'?'寺院・本堂と山門':'神社・鳥居と社殿';
   box(g,10,.65,7.5,'#a6a293',0,.33,-1);box(g,8.5,3.2,6.4,'#d8c5a0',0,2.1,-1);trim(g,8.5,3.9,6.4);tileRoof(group(g,0,0,-1),10.5,8.2,4.0,s.id==='shrine'?'#877050':roofColor,.50);
   for(const a of [-3.6,-1.2,1.2,3.6])box(g,.24,3.3,.24,'#82593f',a,2.2,2.6);for(let j=0;j<3;j++)box(g,4,.18,1.7-j*.45,'#b7b3a2',0,j*.18,3.1-j*.25);
   if(s.id==='shrine'){model(g,'torii',0,.10,4.6,1.65);for(const q of [-1,1])w.rod(g,[q*1.3,6,-1.2],[-q*.35,7.2,-1.2],.075,'#c4a678');}
   else{model(g,'stone-lantern',-4.9,.1,4.2,1.1);model(g,'stone-lantern',4.9,.1,4.2,1.1);sign(g,'清音寺',2,.65,0,3.1,2.71,'#624c39','#efddb8');}
  }else if(s.id==='ryokan'){style='旅館・二階建て和風棟と庭';machiya(g,s,10.5,5.7,8,'#6c7f68');const wing=group(g,4.3,0,-1.4);box(wing,3.2,4.0,6.8,'#ddceb1',0,2,0);tileRoof(wing,3.3,7,4.1);for(const xx of [-3.5,-1.2,1.2,3.5])lattice(g,1.65,1.4,xx,4.3,4.05);model(g,'stone-lantern',-5,0,4.6,.85);model(g,'bamboo',5,0,4.7,1);sign(g,'旅館 こもれび',4.1,.6,0,3.3,4.26);}
  else if(s.id==='sento'){style='銭湯・千鳥破風と煙突';machiya(g,s,10.3,3.8,8,'#557b9a');const portico=group(g,0,0,3.5);tileRoof(portico,4.8,2.6,4.0);cyl(g,.37,.5,8,'#c0b2a0',-4.4,4,-2.6);sign(g,'ゆ',2,1.2,0,3.1,4.97,'#d8d2b4','#3e6076');}
  else if(s.id==='home'){style='住宅・切妻屋根と玄関';box(g,8.5,5.7,7.4,'#e1d7bf',-.6,2.85,0);tileRoof(group(g,-.6,0,0),8.8,7.7,5.8);box(g,3.2,2.8,3.5,'#c5b294',4.4,1.4,1.5);tileRoof(group(g,4.4,0,1.5),3.3,3.6,2.9);door(g,3.8,3.4);for(const xx of [-3,0]){glass(g,2,1.3,xx,4.1,3.76);lattice(g,2,1.8,xx,1.65,3.76);}box(g,4,.1,1.1,'#b99f7b',-1.4,.2,4.25);for(const xx of [-4.8,-3.6,-2.4,-1.2,0])box(g,.10,1.1,.15,'#9eac91',xx,.55,5.2);}
  else if(s.id==='school'){style='学校・教室棟と昇降口';modern(g,s,12,7.5,7.5,'#e4ddc5','#a08066',3);for(let row=0;row<3;row++)for(const xx of [-4.9,-2.7,2.7,4.9])glass(g,1.5,1.35,xx,1.55+row*2.3,3.82);box(g,2.6,8.0,2.1,'#d4c3a3',0,4,2.9);sign(g,'時計',1.2,.6,0,7.0,4.02);box(g,5,.15,1.8,'#98aaa4',0,2.55,4.35);}
  else if(s.id==='sports'){style='体育館・大屋根とガラスホール';box(g,12,4.7,8,'#bccaba',0,2.35,0);w.sphere(g,1,roofColor,[0,4.3,0],[6.6,2.4,4.8]);for(const xx of [-4.5,-2.3,0,2.3,4.5])glass(g,1.8,3,xx,2.2,4.04);sign(g,'市民スポーツセンター',8,.65,0,4.45,4.35,'#718f86','#f6edcf');model(g,'basketball',4.5,.05,4.8,1.2);}
  else if(s.id==='station'){style='駅舎・切妻とホーム上屋';box(g,12,3.5,6.5,'#ded6bc',0,1.75,0);tileRoof(g,12.5,7.3,3.65);for(const xx of [-4.5,-2.2,2.2,4.5])lattice(g,1.6,2.0,xx,1.6,3.31);sign(g,'ことば町駅',5,1,0,3.15,3.75);for(const xx of [-5.2,5.2])box(g,.16,2.3,.16,'#755a43',xx,1.15,5);tileRoof(group(g,0,0,4.3),11.5,2.2,2.6);model(g,'vending',-4.1,.05,4.1,.8);model(g,'clock',4,3.7,3.8,.6);}
  else if(s.id==='netcafe'){style='ネットカフェ・個室の商業ビル';modern(g,s,8.3,9.2,8,'#d7d3c5','#76826d',3);box(g,1.6,7.3,.32,'#576854',3.5,5.1,4.2);sign(g,'個室',1.35,1.8,3.5,7.3,4.41,'#576854','#f2e8bc');sign(g,'24 H',1.35,.8,3.5,4.5,4.42,'#576854','#f2e8bc');sign(g,'コミック・シャワー',6.6,.65,-.5,3.2,4.25,'#8d9e79','#fff0d3');box(g,5,.18,1.4,'#839572',-.5,2.65,4.5);}
  else if(s.id==='aquarium'){style='水族館・青いホールと波形屋根';modern(g,s,12,5.4,8,'#c9dcce','#5b95a2',1);for(const xx of [-4.4,-2.2,2.2,4.4])glass(g,1.7,3.2,xx,2.35,4.08);w.sphere(g,1,'#74a7b5',[0,5.0,-.5],[5.8,1.2,4.5]);model(g,'fish',0,5.3,4.4,2.5);sign(g,'海のいきもの',5,.6,0,3.8,4.38,'#76a6ae','#fff1d6');}
  else if(s.id==='disney'){style='遊園地・城とゲート';model(g,'castle',0,.2,-1,2.6);for(const xx of [-5,5]){model(g,'balloon',xx,.1,3.5,1.7);model(g,'tree',xx,.1,-3,1.2);}sign(g,'テーマパーク',6,.8,0,2.6,4.8);}
  else if(s.id==='usj'){style='テーマパーク・地球儀とゲート';for(const xx of [-4.6,4.6])box(g,1.4,5.2,2,'#c5bcab',xx,2.6,0);box(g,10.5,1.2,2,'#ccbfaa',0,5.4,0);model(g,'globe',0,.15,2.4,1.7);sign(g,'STUDIOS',7,.75,0,5.4,1.07,'#ccbfaa','#4d6570');}
  else if(s.id==='street'){style='商店街・アーケードの入口';for(const xx of [-4.8,4.8])box(g,.22,4.8,.22,'#76694f',xx,2.4,0);box(g,10,1.0,.5,'#ebe0bd',0,4.6,0);sign(g,'ことば商店街',7,.68,0,4.6,.3);for(const xx of [-4.7,4.7]){model(g,'bench',xx,0,2,.7);model(g,'tree',xx,0,-3,1);}}
  else if(s.id==='festival'){style='祭り・やぐらと露店';model(g,'stage',0,.2,-1,1.8);for(const xx of [-4.5,4.5])model(g,'stall',xx,.15,2,.9);for(let i=0;i<7;i++)lantern(g,-4.5+i*1.5,4.6,1.2);w.rod(g,[-6,5,1.2],[6,5,1.2],.03,'#786a50');}
  else if(s.id==='koban'){style='交番・小さな警察施設';modern(g,s,6.8,3.5,6,'#e2e2d5','#6d7d89',1);box(g,2,1.4,2,'#e1e2d8',0,4.1,0);w.sphere(g,.25,'#c96558',[0,4.95,0]);sign(g,'交番',2,.7,0,3,3.24);model(g,'bicycle',4,.1,2.8,.95);}
  else if(s.id==='aeon'){style='イオン風・大型総合スーパー';modern(g,s,19,5.8,12,'#e5dddf','#a45783',1);sign(g,'AEON',9,1.7,0,4.3,6.18,'#a45783','#fff7ef');for(const xx of [-7,-5,5,7])model(g,'cart',xx,.1,6.8,.85);}
  else if(s.id==='bank'){style='三菱UFJ風・銀行支店';modern(g,s,11,5.4,8,'#ebe8df','#b34e53',1);sign(g,'三菱UFJ銀行',8,.9,0,4.25,4.2,'#b34e53','#fff4e6');for(const xx of [-3.4,3.4])model(g,'atm',xx,.1,4.5,.6);}
  else if(s.id==='post'){style='郵便局・白壁と赤い軒';modern(g,s,10,3.9,7,'#e9e3ce','#b5614b',1);sign(g,'〒',1.4,1.4,-3.6,2.1,3.75,'#b5614b','#fff0d3');model(g,'postbox',-4.6,.15,4.7,1.1);}
  else if(s.id==='clinic'){style='診療所・二階建ての白い建物';modern(g,s,10,6.7,8,'#e6e8dc','#96b6ac',2);for(const [a,b]of[[1.1,.25],[.25,1.1]])box(g,a,b,.12,'#b7726d',3.4,5.6,4.15);box(g,6,.16,1.8,'#98b4ad',0,2.7,4.6);}
  else if(s.id==='bookstore'||s.id==='dagashi'){style=s.id==='bookstore'?'書店・白壁の蔵造り':'駄菓子屋・低い木造の店';machiya(g,s,s.id==='bookstore'?8.5:8,s.id==='bookstore'?5.7:3.1,7.5,s.id==='bookstore'?'#6c7886':'#bd7763');if(s.id==='bookstore'){for(const xx of [-4.3,4.3])box(g,.38,5.8,.28,'#dad4bd',xx,2.9,3.85);model(g,'bookshelf',-3.3,.15,4.6,.6);}else{for(const xx of [-2.6,2.6])model(g,'display',xx,.1,4.4,.55);sign(g,'だがし',2.6,.7,0,2.9,4.15,'#e8cc95','#875b45');}}
  else{
   const styles={convenience:[12,3.1,8,'#eee9d7','#6e9e89',1],supermarket:[13,4.2,8,'#dedfc6','#759f8a',1],clothing:[8,7.5,7,'#e0c8b3','#966d61',2],hundred:[9.3,4.5,7.5,'#e8dbbd','#c68d58',1],drugstore:[10,6.0,7.5,'#e2e5d4','#819f9d',2],arcade:[9,7,8,'#b79ca9','#986377',2],karaoke:[8,8.2,7.5,'#c0b6ca','#817399',3],laundry:[9.5,3.5,7.5,'#dfdfc9','#78a1a6',1],barber:[7.8,4.8,7,'#dfd5c2','#947f68',1]};
   const a=styles[s.id]||[9,4,7,'#e1d8c1','#819489',1];modern(g,s,...a);style=s.id+'・専用店舗';
   if(s.id==='convenience'){box(g,12.4,.65,.3,'#79a58e',0,2.65,4.18);model(g,'trash',-4.8,.12,4.8,.85);}
   if(s.id==='supermarket'){model(g,'cart',-4.6,.1,4.5,1);model(g,'cart',-3,.1,4.5,1);sign(g,'食品',2,.75,3.3,3.3,4.2);}
   if(s.id==='hundred')sign(g,'100',3.5,1.3,0,3.4,3.94,'#c98c5c','#fff0cf');
   if(s.id==='drugstore')sign(g,'薬',1.6,1.6,3.3,4.7,3.98,'#83a092','#fff1d4');
   if(s.id==='clothing'){model(g,'shirt',-2.2,.6,3.8,1.5);box(g,3.2,.2,1.3,'#a77968',0,2.9,4);}
   if(s.id==='arcade'){sign(g,'GAME',6,1.5,0,5.5,4.2,'#9c6177','#f7dda1');model(g,'claw-machine',3.2,.1,4.6,.65);}
   if(s.id==='karaoke')sign(g,'カラオケ',1.4,4.6,3.5,5.8,4.0,'#7a719a','#fff0cf');
   if(s.id==='laundry'){for(const xx of [-3.2,3.2])model(g,'washer',xx,.3,3.8,.9);sign(g,'コインランドリー',7,.6,0,2.9,4.05);}
   if(s.id==='barber'){for(let i=0;i<6;i++)cyl(g,.13,.13,.18,i%2?'#678b9e':'#d0806f',-3.6,1.5+i*.18,4.1);model(g,'bench',2.4,.1,4.4,.7);}
  }
  let footprint;
  if(!['street','festival','disney','usj','temple','shrine'].includes(s.id)){
   footprint=restaurantStyle[s.id]?[restaurantStyle[s.id][0],restaurantStyle[s.id][2]]:({aeon:[19,12],bank:[11,8],school:[12,7.5],sports:[12,8],ryokan:[10.5,8],sento:[10.3,8],home:[8.5,7.4],station:[12,6.5],netcafe:[8.3,8],aquarium:[12,8],koban:[6.8,6],post:[10,7],clinic:[10,8],bookstore:[8.5,7.5],dagashi:[8,7.5],convenience:[12,8],supermarket:[13,8],clothing:[8,7],hundred:[9.3,7.5],drugstore:[10,7.5],arcade:[9,8],karaoke:[8,7.5],laundry:[9.5,7.5],barber:[7.8,7]})[s.id]||[9,7.5];
   const sides=group(g);for(const side of [-1,1]){const panel=group(sides,side*(footprint[0]/2+.04),0,0);panel.rotation.y=side*Math.PI/2;for(const zz of [-1.8,1.2])glass(panel,1.35,1.05,zz,1.95,.04);}
   // Back windows and an outdoor air-conditioning unit keep rear views legible.
   const back=group(g,0,0,-footprint[1]/2-.04);back.rotation.y=Math.PI;
   for(const xx of [-2.4,2.4])glass(back,1.65,1.15,xx,2.0,0);
   model(g,'aircon',3.8,.10,-4.1,1.2);
  }
  if(!['street','festival'].includes(s.id)){const ca=Math.abs(Math.cos(angle)),sa=Math.abs(Math.sin(angle));const [fw,fd]=footprint||[10,8];w.collider(x,z,fw*ca+fd*sa,fd*ca+fw*sa);}
  const epos=entryFor(s.id),p=nearestRoad(epos[0],epos[2]);const vx=epos[0]-p[0],vz=epos[2]-p[1],dist=Math.hypot(vx,vz);if(dist>3){p[0]+=vx/dist*2.7;p[1]+=vz/dist*2.7;}path([[epos[0],epos[2]],p],2.5,snow?'#e5e9df':'#d9caab',.065,false);
  const e=group(w.root,epos[0],0,epos[2]);w.cyl(e,.65,.65,.025,'#e4c378',[0,.12,0]);w.register(e,'entrance',s);w.entrances.push({x:epos[0],z:epos[2],data:s});// A single location label sits above the actual building bounds, readable from every angle.
  g.updateWorldMatrix(true,true);const roofTop=new T.Box3().setFromObject(g).max.y;
  const badge=w.spriteLabel(s.jp,[x,roofTop+1.05,z],3.8);badge.userData.entrance=s.id;badge.userData.screenLabel=true;badge.userData.labelPixelHeight=20;badge.userData.roofTop=roofTop;w.register(badge,'entrance',s);
  w.register(g,'entrance',s);w.buildingStyles.push({id:s.id,style,position:[x,z],rotation:angle});
 }
 for(const [x,z]of[[-78,-65],[-75,-40],[-76,11],[-77,47],[-53,-70],[10,-70],[33,-71],[39,75],[54,73],[80,50],[82,-13],[80,-80],[-38,11],[-40,31],[-9,48],[31,10],[32,-10],[30,-28],[34,-44]])w.tree(x,z);
 for(let z=-70;z<72;z+=13){w.tree(49,z);if(z%2)w.tree(39,z+3);}
 for(const [x,z]of[[-18,44],[9,60],[14,-34],[-48,43],[-49,-35]]){const g=group(w.root,x,0,z);cyl(g,.065,.1,5,'#71827b',0,2.5,0);box(g,1.2,.1,.12,'#71827b',.45,4.8,0);box(g,.6,.16,.5,w.night?'#ecd8a7':'#e1d7b8',.8,4.65,0);sign(g,'止まれ',.7,.7,0,1.9,.13,'#b96554','#fff0d4');}

 // Utility poles, narrow gutters, small gardens and pavement furniture.
 for(const [x,z]of[[-17,33],[-22,8],[-19,-24],[9,43],[10,7],[-54,28],[-54,-12],[32,-21]]){
  const g=group(w.root,x,0,z);cyl(g,.10,.14,7,'#999f91',0,3.5,0);box(g,2.8,.12,.14,'#7e877d',0,6.3,0);
  for(const q of [-1,0,1]){cyl(g,.10,.12,.25,'#c4cabe',q,6.46,0);w.rod(g,[q,6.6,0],[q,6.0,5.5],.018,'#66776c');}
 }
 for(const [x,z,a]of[[-25,29,.4],[-29,-8,0],[-10,-31,0],[-56,9,1.57],[8,28,-1.57],[20,43,0]]){
  const g=group(w.root,x,0,z);g.rotation.y=a;
  box(g,3.8,.35,.8,'#9d9d82',0,.18,0);for(const xx of [-1.3,-.45,.45,1.3])w.sphere(g,.47,'#83a271',[xx,.7,0],[1,.7,.8]);
 }
 for(const [x,z]of[[-24,32],[8,30],[-53,38],[-52,-5],[29,47]]){model(w.root,'bicycle',x,0,z,1.1);model(w.root,'bicycle',x+1,0,z,1);}
 // A few ordinary homes fill the quiet streets, with no separate learning entrance.
 for(const [x,z,a]of[[-77,25,Math.PI/2],[-76,-9,Math.PI/2],[-39,22,-Math.PI/2],[-37,-23,-Math.PI/2],[-70,-72,0]]){
  const g=group(w.root,x,0,z);g.rotation.y=a;box(g,6.8,3.9,6.4,'#d8cbb0',0,1.95,0);tileRoof(g,7,6.7,4.0);door(g,1.5,3.27);lattice(g,2.8,1.3,-1.4,1.9,3.27);w.collider(x,z,6.8,6.8);
 }
 const spawn=[-12,0,26];await w.character(character,spawn,true);w.focus.copy(w.playerPos);w.distance=43;w.yaw=.55;w.pitch=.90;w.applyLight();w.request();
}
