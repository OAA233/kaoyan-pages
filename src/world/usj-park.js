// USJ layout study: main area relationships, original simplified cartoon geometry.
// Area roster: https://www.usj.co.jp/web/ja/jp/areas
// Layout cross-check: Shinyusha USJP002-003 (2024); names checked against current official map.
export async function buildUSJPark(w,data,character,npc){
 const T=w.THREE;w.clear();w.canvas.parentElement.dataset.usjPark='true';w.worldMode='interior';w.data=data;w.modelErrors=[];w.bounds=[-75,83,-81,78];w.camera.far=700;
 const positions=[[0,43],[-38,1],[-27,-21],[27,-5],[-6,-40],[52,18],[-45,-31],[27,39],[56,-46],[30,-45]];
 w.zones=data.zones.map((z,i)=>({...z,index:i,x:positions[i][0],z:positions[i][1],entry:positions[i]}));w.interiorLayout={size:[136,144],zones:w.zones,entrance:[0,73],npc:[7,61],overviewDistance:215,overviewWidth:165,overviewPitch:.9,zoneDistance:42,zoomMax:480};
 const root=w.root,box=(g,a,b,c,col,p,r,extra)=>w.box(g,a,b,c,col,p,r,extra),group=(x=0,z=0,y=0)=>w.group(null,[x,y,z]);
 const bind=(g,jp)=>{if(!g)return;const word=data.items.find(a=>a.jp===jp);if(word)w.register(g,'word',word);return g;};
 const prop=(kind,jp,x,z,scale=1,y=0)=>{const g=group(x,z,y),word=data.items.find(a=>a.jp===jp);w.models.model(g,{...(word||{}),kind,jp});g.scale.setScalar(scale);if(word)w.register(g,'word',word);return g;};
 const plaque=(text,x,z,width=7,y=5)=>{const g=group(x,z,y),m=w.label(g,text,width,2);m.material.depthTest=false;m.renderOrder=20;g.userData.billboard=true;g.userData.labelSize=[width,2];g.userData.screenLabel=true;w.labels.push(g);return g;};
 let serial=0;
 function polygon(points,color,y=0,depth=0){const s=new T.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();const geom=depth?new T.ExtrudeGeometry(s,{depth,bevelEnabled:false}):new T.ShapeGeometry(s);geom.rotateX(-Math.PI/2);w.geometries.set('usj-poly-'+serial++,geom);const m=new T.Mesh(geom,w.mat(color));m.position.y=y;m.receiveShadow=true;root.add(m);return m;}
 function route(points,width=5,color='#e6d2ad',y=.085,closed=false){y+=serial*.001;const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],y,p[1])),closed,'catmullrom',.25),pts=curve.getPoints(points.length*12),v=[],idx=[];pts.forEach((p,i)=>{const d=pts[Math.min(i+1,pts.length-1)].clone().sub(pts[Math.max(0,i-1)]).normalize(),side=new T.Vector3(-d.z,0,d.x).multiplyScalar(width/2);v.push(...p.clone().add(side).toArray(),...p.clone().sub(side).toArray());if(i<pts.length-1){const j=i*2;idx.push(j,j+2,j+1,j+1,j+2,j+3);}});const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(v,3));geom.setIndex(idx);geom.computeVertexNormals();w.geometries.set('usj-route-'+serial++,geom);const m=new T.Mesh(geom,w.mat(color,{side:T.DoubleSide}));root.add(m);return m;}
 function water(cx,cz,rx,rz){const ps=Array.from({length:42},(_,i)=>{const a=i/42*Math.PI*2,r=1+.05*Math.sin(i*1.7);return[cx+Math.cos(a)*rx*r,cz+Math.sin(a)*rz*r]});polygon(ps.map(([x,z])=>[cx+(x-cx)*1.08,cz+(z-cz)*1.08]),'#e3cfac',.035);const lake=polygon(ps,'#63bdc7',.07);for(let z=cz-rz+2;z<cz+rz;z+=3){const half=rx*Math.sqrt(Math.max(0,1-((z-cz)/rz)**2))*.86;w.collider(cx,z,half*2,2.8);}for(let i=0;i<9;i++){const x=cx+Math.sin(i*3)*rx*.62,z=cz+(i-4)*rz*.17;box(root,2.1,.015,.09,'#a2dde0',[x,.095,z]);}return lake;}
 function tree(x,z,h=4,pine=false){if(w.colliders.some(c=>Math.abs(x-c.x)<c.w/2+1&&Math.abs(z-c.z)<c.d/2+1))return group(x,z);const g=group(x,z);w.cyl(g,.17,.28,h*.55,'#926744',[0,h*.28,0]);if(pine){for(let j=0;j<3;j++)w.mesh(g,'cone',[1.4-j*.22,h*.65,7],'#397c61',[0,h*.54+j*.5,0]);}else{w.sphere(g,h*.3,'#64a777',[0,h*.78,0],[1,.95,.88]);w.sphere(g,h*.23,'#82b878',[.6,h*.64,.1]);}return g;}
 function palm(x,z,h=5){const g=group(x,z);w.cyl(g,.17,.28,h,'#a08254',[0,h/2,0]);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;w.sphere(g,1,'#4b9571',[Math.cos(a)*1.1,h,Math.sin(a)*1.1],[1.6,.13,.55]).rotation.y=-a;}return g;}
 function lamp(x,z){const g=group(x,z);w.cyl(g,.07,.11,2.6,'#52645c',[0,1.3,0]);w.sphere(g,.25,'#ffe8ac',[0,2.8,0]);}
 function building(x,z,width,depth,height,col,style='flat',face=''){const g=group(x,z);box(g,width,height,depth,col,[0,height/2,0]);box(g,width+.3,.28,depth+.3,'#f0dcaf',[0,height+.04,0]);for(let yy=1.5;yy<height-.7;yy+=1.65)for(let xx=-width/2+1;xx<width/2-.4;xx+=1.5){box(g,.75,1.05,.06,'#4e747a',[xx,yy,depth/2+.05]);box(g,.95,.12,.15,'#f7e4bf',[xx,yy-.6,depth/2+.09]);}if(style==='gable'){for(const k of[-1,1])box(g,width+.6,.20,depth*.67,'#655970',[0,height+.65,k*depth*.23],[k*.55,0,0]);}if(style==='snow'){for(const k of[-1,1])box(g,width+.6,.22,depth*.77,'#eee8da',[0,height+1,k*depth*.23],[k*.72,0,0]);}if(face)w.label(g,face,width*.9,.6,[0,.85,depth/2+.12],0,'#36595c','#fff0c9');w.collider(x,z,width,depth);return g;}
 function tower(g,x,z,y,h,r,col,roof='#566274'){w.cyl(g,r,r*1.06,h,col,[x,y+h/2,z],[0,0,0],10);w.mesh(g,'cone',[r*1.4,r*2.7,10],roof,[x,y+h+r*1.3,z]);for(const a of[-.5,.5])box(g,.35,.8,.1,'#56717c',[x+a,y+h*.66,z+r]);}
 function track(points,color='#77aabb',rad=.15){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const geom=new T.TubeGeometry(curve,120,rad,6,false);w.geometries.set('usj-track-'+serial++,geom);const m=new T.Mesh(geom,w.mat(color));m.castShadow=true;root.add(m);for(let i=0;i<points.length;i+=2){const [x,y,z]=points[i];w.rod(root,[x,.1,z],[x,y-.1,z],.12,'#c5c9b3');}return m;}
 // One connected park with a central lagoon; no square grid of detached rooms.
 polygon([[-66,26],[-67,-32],[-55,-62],[-18,-73],[29,-75],[73,-64],[79,-32],[78,16],[68,48],[36,64],[11,79],[-15,75],[-40,54]],'#bad19a',-1.5,1.5);
 w.buildingFloor=root.children[0];polygon([[-12,76],[12,76],[13,56],[7,42],[-7,42],[-14,56]],'#d5b898',.02);
 water(0,-10,20,20);
 route([[0,66],[0,42],[-14,23],[-29,9],[-30,-14],[-18,-33],[4,-37],[23,-26],[28,-6],[21,15],[4,29],[0,42]],7.4,'#e8d5b5');
 const branches=[[[0,40],[-19,20],[-35,11],[-44,3]],[[-29,9],[-43,-9],[-45,-30],[-44,-46]],[[-30,-14],[-30,-27],[-45,-30]],[[-18,-33],[-9,-44],[-8,-59]],[[23,-26],[30,-41],[33,-54]],[[30,-41],[42,-36],[46,-48],[61,-53]],[[28,-6],[38,3],[44,13],[53,23],[62,35]],[[21,15],[24,29],[28,42],[41,48]]];branches.forEach(a=>route(a,5));
 // Gate, globe plaza and covered Hollywood street.
 const globe=prop('globe','地球儀',-6,68,3.4);w.collider(-6,68,3.7,3.7);
 const gate=group(0,61);for(const x of[-10,-5,5,10])box(gate,.8,5,.85,'#b9ac79',[x,2.5,0]);for(const x of[-7.5,0,7.5]){const arch=w.mesh(gate,'torus',[2.2,.23,6,24,Math.PI],'#bfa76c',[x,4.5,0]);}box(gate,22,.65,1.4,'#ac9261',[0,5.25,0]);w.label(gate,'UNIVERSAL STUDIOS JAPAN',18,.65,[0,5.3,.73],0,'#b19964','#fff1bb');bind(gate,'入口');
 for(const x of[-10,10]){building(x,56,5,5,3.4,'#e2c092','flat','TICKETS');}
 for(let i=0;i<3;i++){for(const s of[-1,1]){building(s*12,44-i*7,8,5.8,4.8+i*.7,['#e8bd80','#cc8870','#94b9bc'][i],'flat',['STUDIO STORE','CINEMA','CAFE'][i]);palm(s*5,46-i*7,4.6);}}
 const canopy=group(0,47);for(const x of[-4,4])for(const z of[-7,0,7]){w.cyl(canopy,.12,.18,5,'#c9c8ad',[x,2.5,z]);}for(let i=-8;i<=8;i+=1){const a=w.mesh(canopy,'torus',[4,.055,5,20,Math.PI],'#f2ead2',[0,5,i]);}box(canopy,8,.10,16,'#a5d0cc',[0,6.6,0],[0,0,0],{transparent:true,opacity:.36});
 track([[13,3,49],[20,8,45],[20,12,30],[14,9,23],[9,5,30],[16,3,37]],'#e4d1a0');
 // New York streets and Gramercy Park.
 route([[-17,24],[-24,14],[-38,4],[-43,-7]],6,'#bfa998');for(let i=0;i<4;i++){const x=-25-i*5;building(x,4+i*3,4.8,6,7+(i%2)*2,['#bc8067','#c9af85','#93928b','#c08c6e'][i],'flat',i===1?'FINNEGAN’S':'');}for(let i=0;i<3;i++)building(-39-i*6,-9,5.8,8,7+i,'#a99c84','flat',i===1?'NEW YORK':'');
 polygon([[-27,16],[-35,12],[-40,19],[-31,25]],'#78a974',.06);for(const [x,z]of[[-30,18],[-36,18],[-31,23]])tree(x,z,2.5);bind(root.children.find(g=>Math.abs(g.position.x+25)<.01&&Math.abs(g.position.z-4)<.01),'建物');
 // San Francisco wharf, warehouse roofs and small piers on the west shore.
 for(let i=0;i<3;i++)building(-37,-19-i*6,7,4.8,4.5,['#c08772','#d7bd94','#b9aa85'][i],'gable',i===1?'WHARF CAFE':'');
 const pier=box(root,9,.22,3.5,'#b5946c',[-20,.22,-13]);bind(pier,'桟橋');for(let z=-26;z<-7;z+=5)box(root,5,.2,2,'#af9270',[-21,.17,z]);prop('boat','港',-18,-23,1.8);
 // Minion Park: Gru's steep-roofed house, colorful frontage and yellow plaza.
 polygon([[-56,-29],[-36,-29],[-35,-48],[-54,-48]],'#e5c460',.06);const gru=building(-46,-49,8,7,8,'#818888','gable','MINION PARK');tower(gru,0,0,8,3.3,1.5,'#767e7e','#56626b');for(const x of[-56,-36])building(x,-41,6,7,5,x===-56?'#dc9d7f':'#a4bcc1','gable');prop('icecream','アイスクリーム',-48,-33,2);prop('banana','バナナ',-40,-34,2.3);
 // Jurassic jungle and two distinctive rides.
 for(const x of[-15,-1]){const g=group(x,-43);box(g,2.3,8,2.3,'#997b57',[0,4,0]);w.mesh(g,'cone',[1.6,1.5,6],'#b58c58',[0,8.6,0]);}box(root,16,1.35,2,'#9b7d53',[-8,8,-43]);w.label(root,'JURASSIC PARK',13,1,[-8,8,-41.9],0,'#7b6244','#ffe09a');
 const dino=prop('dinosaur','恐竜',-16,-52,3.8);prop('waterfall','水しぶき',5,-54,3.6);const coaster=track([[-20,3,-61],[-15,11,-60],[-5,15,-55],[4,10,-46],[-4,4,-41],[-18,7,-49],[-20,3,-61]],'#509b94',.24);bind(coaster,'ジェットコースター');
 const dome=group(10,-38);w.cyl(dome,4.5,5,3,'#d2b782',[0,1.5,0]);w.sphere(dome,4.5,'#ba9270',[0,3,0],[1,.5,1]);w.collider(10,-38,9,8);
 // Amity fishing village and hanging shark photo landmark.
 for(const [x,z,col]of[[34,-17,'#d9ddcf'],[39,-8,'#c89178'],[32,1,'#b6c0b5']])building(x,z,6,5,4,col,'gable',z===-17?'AMITY':'');
 const shark=prop('shark','サメ',30,-9,2.7,2.2);shark.rotation.z=.9;for(const x of[27.6,32.4])box(root,.3,4.8,.3,'#8a7053',[x,2.4,-9]);box(root,5.4,.3,.3,'#8a7053',[30,4.8,-9]);prop('boat','船',22,-16,2);prop('lifering','浮き輪',30,-14,1.4,1.5);
 // WaterWorld amphitheatre: semicircular seating opens toward the tank and industrial set.
 water(30,-59,10,7);for(let j=0;j<4;j++)for(let i=0;i<11;i++){const a=Math.PI*.10+i/10*Math.PI*.80,r=10+j*1.2;box(root,2,.55,1,'#b86f4f',[30+Math.cos(a)*r,.4+j*.48,-59+Math.sin(a)*r],[0,-a,0]);}
 const stage=group(30,-63);box(stage,11,.6,4,'#736f5f',[0,1,0]);for(const x of[-5,5]){box(stage,.4,7,.4,'#986744',[x,3.6,0]);box(stage,3,.3,2,'#94785b',[x,6,0]);}w.cyl(stage,1,1,3,'#a18968',[0,3,0]);bind(stage,'舞台');
 // Nintendo terraces: Mario land and Donkey Kong extension beyond it.
 polygon([[47,-33],[72,-33],[74,-65],[45,-65]],'#83bc59',.1);for(let i=0;i<3;i++)box(root,25-i*3,2.3,5,'#69a644',[59,i*2.2+1.2,-58-i*3]);
 const peach=building(50,-42,7,5,4,'#fae8cf','flat');for(const x of[-3.4,3.4])tower(peach,x,0,0,5,1,'#f5e2cc','#e293a7');w.label(peach,'PEACH',4,.55,[0,3.5,2.6],0,'#f4d8d5','#785e73');
 const bowser=building(67,-52,10,8,7,'#58615c','flat');for(const x of[-4,4])tower(bowser,x,0,0,8,1.4,'#6b7770','#61766e');w.label(bowser,'MARIO KART',8,.9,[0,5,4.1],0,'#b64945','#fff4c7');
 for(const [x,z,c]of[[51,-51,'#eb5d42'],[61,-40,'#e9b943'],[68,-39,'#ea6c4a']]){const m=prop('mushroom','キノコ',x,z,2.4);}
 for(let i=0;i<5;i++){const x=49+i*3.6;box(root,1.4,1.4,1.4,i%2?'#f3cb45':'#b17a41',[x,4,-37]);w.label(root,'?',.7,.9,[x,4,-36.27],0,'#e5b63c','#fff3b4');}prop('kart','カート',57,-43,1.8);prop('coins','コイン',60,-43,1.6);
 const dk=group(58,-69);for(let i=0;i<4;i++)box(dk,10-i*2,1.7,7-i,'#c9a254',[0,i*1.6+.85,0]);w.label(dk,'DK',2,1.5,[0,6,-.9],0,'#c6a050','#775326');track([[48,2,-65],[45,4,-71],[55,8,-74],[68,5,-71],[69,2,-65]],'#9c7245',.23);
 // Wizarding World: woodland approach, Hogsmeade and Hogwarts beside its lake.
 route([[40,5],[50,12],[55,23],[57,33]],4,'#b6aaa0');for(let i=0;i<3;i++){building(47,17+i*6,5,5,4.8+i*.3,'#a9a7a0','snow',i===0?'HOGSMEADE':'');building(61,16+i*6,5,5,5.4,'#afaca0','snow');}
 water(66,38,8,5);const castle=group(67,26);polygon([[58,29],[62,20],[73,19],[78,29],[71,34]],'#7f8a87',.1,2);box(castle,9,6,6,'#ada99a',[0,5,0]);for(const [x,z,h,r]of[[-4,0,9,1.4],[4,0,11,1.5],[0,-2,14,1.8],[3,4,8,1.1],[-3,4,7,1]])tower(castle,x,z,2,h,r,'#b6b09d','#5c7280');bind(castle,'城');w.collider(68,27,13,11);prop('steamtrain','ホグワーツ特急',41,11,1.8);
 // Universal Wonderland: low pastel buildings and family rides near Hollywood.
 polygon([[22,33],[42,33],[48,51],[28,58],[18,48]],'#e3c7b7',.06);building(36,49,9,7,4,'#e3b2c0','gable','WONDERLAND');prop('carousel','メリーゴーランド',28,43,2.4);prop('slide','滑り台',39,37,2);prop('pinwheel','風車',22,38,2,1);

 // Distinctive silhouettes remain readable from the game camera.
 const gruroof=group(-46,-49,8.4);w.mesh(gruroof,'cone',[4.8,10,4],'#535b69',[0,5,0],[0,Math.PI/4,0]);box(gruroof,1.4,7,1.4,'#9b9588',[2,3.5,-1]);
 for(const x of[47,61])for(let i=0;i<3;i++){const z=17+i*6;box(root,.7,4,.8,'#7e7970',[x-1.3,7.2,z-1.5]);}
 const jawsSign=group(30,-12);w.label(jawsSign,'JAWS',4.5,1,[0,4.8,0],0,'#fff2da','#9e4943');
 const nintendoPipe=group(45,-34);w.cyl(nintendoPipe,1.3,1.3,3.2,'#329852',[0,1.6,0]);w.cyl(nintendoPipe,1.6,1.6,.6,'#51ac57',[0,3.1,0]);w.cyl(nintendoPipe,1.15,1.15,.05,'#205a36',[0,3.42,0]);
 for(let i=0;i<33;i++){const x=-23+(i%9)*5,z=-68+Math.floor(i/9)*5;if((x>-14&&x<-2)||(x>2&&x<10&&z>-59))continue;tree(x,z,4.3+(i%3)*.6,i%3===0);}
 for(let i=0;i<20;i++){const x=38+(i%5)*7,z=1+Math.floor(i/5)*3.3;if((x>40&&x<55)||(x>54&&z>5))continue;tree(x,z,4.6,true);}
 // Trees define the boundary and woodlands; the paths remain wide and unobstructed.
 for(let i=0;i<47;i++){const a=i/47*Math.PI*2,x=5+Math.cos(a)*67,z=2+Math.sin(a)*69;if(z>58&&Math.abs(x)<20)continue;tree(x,z,3.7+(i%4)*.35,i%3===0);}
 for(const [x,z]of[[-22,-47],[-22,-54],[-14,-65],[0,-65],[8,-64],[18,-65],[17,-55],[19,-46],[40,0],[43,-3],[46,2],[43,34],[48,40],[54,42],[72,7],[72,13],[35,23],[38,29],[-57,-20],[-57,-10],[-55,0]])tree(x,z,4.8,true);
 for(const [x,z]of[[-6,22],[0,21],[6,23],[10,19],[-5,17]])tree(x,z,3.1);
 for(const [x,z]of[[-5,35],[5,35],[-23,13],[-32,-5],[-22,-31],[17,-30],[29,-2],[19,21],[39,-31],[45,12]])lamp(x,z);
 // Bind vocabulary to real landmarks; small learning objects sit on a local service cart.
 const used=new Set(w.entities.keys());for(const zone of w.zones){const missing=data.items.filter(a=>a.zone===zone.index&&!used.has(a.id));if(!missing.length)continue;const spots=[[-24,55],[-51,20],[-47,-17],[46,-19],[-30,-44],[58,7],[-56,-30],[47,42],[73,-30],[44,-43]];const [x,z]=spots[zone.index],g=group(x,z);box(g,2.7,.85,1.2,'#bca17c',[0,.425,0]);box(g,3,.12,1.4,'#e5cba1',[0,.90,0]);w.collider(x,z,3,1.4);for(let i=0;i<missing.length;i++){const word=missing[i];const big=['locker','counter','stall','shop','door','bench','stroller','queue','room-sign','exit-sign','sign'].includes(word.kind);const a=group(x+(i%4-.5)*1.1,z+Math.floor(i/4)*1.55,big?0:1);w.models.model(a,word);a.scale.setScalar(big?.5:.7);w.register(a,'word',word);if(!big)w.fitDisplayItem(a,{x:a.position.x,y:1,z:a.position.z,width:.8,depth:.75});}}
 for(const zone of w.zones){const short={0:'ハリウッド',1:'ニューヨーク',2:'サンフランシスコ',3:'アミティ・ビレッジ',4:'ジュラシック・パーク',5:'ハリー・ポッター',6:'ミニオン・パーク',7:'ワンダーランド',8:'ニンテンドー・ワールド',9:'ウォーターワールド'}[zone.index];const label=plaque(short,zone.x,zone.z-4,Math.min(23,short.length*1.35+2),8);label.userData.zone=zone.index;}
 plaque('ラグーン',0,-10,8,.5);
 await w.character(npc,[7,0,62],false);await w.character(character,[0,0,68],true);w.entrances=[{x:0,z:74,data:{id:'town',jp:'町'}}];w.focus.copy(w.playerPos);w.distance=36;w.yaw=0;w.pitch=1.02;w.applyLight();w.request();
}
