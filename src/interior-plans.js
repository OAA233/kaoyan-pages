// Each plan describes one building. Department coordinates are not separate room tiles.
const plans={
 post:{size:[30,26],points:[[-7,-6],[-7,4],[7,-6],[7,4]],theme:'post'},
 bank:{size:[36,30],points:[[-11,6],[0,-7],[0,6],[11,-7]],theme:'bank'},
 drugstore:{size:[38,46],points:[[-11,-10],[0,-10],[11,-10],[-11,4],[0,4],[11,4],[0,17]],theme:'retail'},
 aeon:{size:[58,58],points:[[-20,-18],[-7,-18],[7,-18],[20,-18],[-20,-2],[-7,-2],[7,-2],[20,-2],[-20,14],[-7,14],[7,14],[20,14],[0,24]],theme:'retail'},
 supermarket:{size:[44,38],points:[[-14,-10],[0,-10],[14,-10],[-14,4],[0,4],[14,12],[-7,15]],theme:'retail'},
 convenience:{size:[40,40],points:[[-12,-11],[-11,2],[0,-12],[-11,14],[10,14],[6,0],[14,-14]],theme:'retail'},
 hundred:{size:[32,36],points:[[-9,-9],[4,-9],[-9,6],[4,6],[10,12]],theme:'retail'},
 bookstore:{size:[40,38],points:[[-13,-9],[0,-9],[13,-9],[-13,7],[0,7],[13,12]],theme:'retail'},
 dagashi:{size:[30,28],points:[[-8,-6],[5,-6],[-8,6],[7,7]],theme:'retail'},
 clothing:{size:[44,34],points:[[-14,-6],[0,-6],[-14,8],[14,-6],[7,10]],private:[3],theme:'retail'},
 sushi:{size:[36,30],points:[[-8,3],[9,5],[9,-9],[-8,-3],[-8,11]],theme:'restaurant'},
 izakaya:{size:[40,36],points:[[-11,7],[10,7],[-10,-10],[10,-10],[10,17],[0,-3]],theme:'restaurant'},
 yakiniku:{size:[40,36],points:[[-10,7],[10,7],[-10,-10],[10,-10],[-10,17],[0,-3]],theme:'restaurant'},
 ramen:{size:[22,17],points:[[-7,6],[-3,-4],[6,-9],[6,1]],theme:'restaurant'},
 soba:{size:[34,28],points:[[9,5],[-9,-8],[8,-8],[-9,11]],theme:'restaurant'},
 teishoku:{size:[30,28],points:[[-8,3],[8,3],[0,-10],[-8,12]],theme:'restaurant'},
 kissaten:{size:[32,28],points:[[-8,-7],[9,1],[7,-10],[-8,10],[-8,1],[8,10]],theme:'restaurant'},
 wagashi:{size:[28,24],points:[[-6,-2],[7,-5],[-6,-9],[6,9]],theme:'restaurant'},
 clinic:{size:[48,34],points:[[-14,8],[1,8],[-15,-9],[0,-9],[15,-9]],private:[2,3,4],theme:'clinic'},
 home:{size:[48,44],points:[[0,14],[-14,2],[0,-5],[-15,-14],[14,0],[14,-14],[-14,15]],private:[3,4,5],theme:'home'},
 school:{size:[62,38],points:[[-22,-9],[-7,-9],[8,-9],[0,9],[23,-3],[-20,9]],private:[0,1,2],theme:'school'},
 netcafe:{size:[48,52],points:[[0,17],[-15,13],[-15,-3],[1,-3],[15,13],[16,-19],[-15,-19]],private:[5],theme:'netcafe'},
 ryokan:{size:[58,52],points:[[0,18],[-19,-8],[19,6],[19,-13],[0,-9],[-1,-20],[-18,12]],private:[1,3,5],theme:'home'},
 sento:{size:[36,48],points:[[-9,15],[-9,-1],[-9,-17],[9,-17],[9,10]],private:[1],theme:'bath'},
 barber:{size:[36,30],points:[[-9,9],[-9,-6],[9,-6],[9,9]],theme:'service'},
 laundry:{size:[36,30],points:[[-9,-7],[9,-7],[-9,7],[9,7]],theme:'laundry'},
 koban:{size:[32,38],points:[[-8,-5],[7,-5],[-8,-13],[8,10]],theme:'service'},
 karaoke:{size:[36,34],points:[[-9,9],[9,-8],[-9,-8],[9,9]],private:[1],theme:'karaoke'},
 arcade:{size:[54,48],points:[[-18,-13],[0,-13],[18,-13],[18,10],[-18,12],[0,10],[0,-1]],theme:'arcade'},
 aquarium:{size:[60,56],points:[[0,18],[0,-13],[-19,-13],[19,-13],[19,18],[-19,4],[0,4],[19,4]],theme:'aquarium'},
 sports:{size:[92,78],points:[[0,28],[-32,-23],[0,-23],[16,-23],[32,-23],[16,-7],[-32,10],[0,10],[32,10],[32,28],[16,28],[-16,-23],[-32,-7],[-16,-7]],theme:'sports'},
 station:{size:[50,42],points:[[0,13],[-16,1],[0,0],[0,-14],[16,-14]],theme:'station'},
 temple:{size:[48,48],points:[[0,15],[0,-14],[-15,-1],[15,-9],[15,9]],theme:'outdoor'},
 shrine:{size:[48,52],points:[[0,18],[0,1],[0,-16],[-16,1],[16,1]],theme:'outdoor'},
 street:{size:[58,42],points:[[-18,8],[-17,-10],[0,-10],[18,-9],[0,10]],theme:'outdoor'},
 festival:{size:[48,40],points:[[-16,-7],[0,-7],[16,-7],[0,9],[16,9]],theme:'outdoor'},
 disney:{size:[70,60],points:[[0,19],[-22,6],[-24,-14],[-7,-18],[11,-18],[25,0],[20,20]],theme:'outdoor'},
 usj:{size:[88,68],points:[[0,23],[-18,15],[-34,1],[-28,-19],[-10,-22],[8,-22],[28,-19],[32,0],[18,15],[0,0]],theme:'outdoor'}
};
export function interiorPlan(data){
 const spec=plans[data.id];if(!spec||spec.points.length!==data.zones.length)throw Error('館内配置が見つかりません：'+data.id);
 const size=[...spec.size];if(['restaurant','retail','service','post','bank'].includes(spec.theme))size[1]+=6;
 const zones=data.zones.map((z,index)=>({...z,index,x:spec.points[index][0],z:spec.points[index][1],entry:[spec.points[index][0],spec.points[index][1]+5.6],private:spec.private?.includes(index)||false}));
 if(data.id==='kissaten'){zones[0].entry=[-8,-4];zones[4].entry=[-8,4];zones[5].entry=[8,13.5];}
 if(data.id==='koban')zones[2].entry=[-8,-10.4];
 if(data.id==='sushi'){zones[3].entry=[-8,-.5];}
 if(data.id==='ramen'){zones[0].entry=[-3.5,6];zones[1].entry=[-3,0];zones[2].entry=[6,-6.5];zones[3].entry=[3,3];}
 for(const z of zones)if(spec.theme==='restaurant'&&/会計/.test(z.jp))z.entry=[z.x,z.z+2.5];
 if(data.id==='yakiniku')zones[1].entry=[10,13.5];
 if(data.id==='wagashi')zones[2].entry=[-6,-6];
 return {...spec,size,zones,entrance:[0,size[1]/2-1.6],npc:[3,size[1]/2-3]};
}
export function buildInteriorShell(w,data,p){
 const [W,H]=p.size,out=p.theme==='outdoor';
 const floors={post:'#eadfd0',bank:'#e2e3df',retail:'#e7e5d9',restaurant:'#d3b28b',clinic:'#deece6',home:'#d2b98f',bath:'#d5bd99',school:'#d8bc91',sports:'#dbd6c2',netcafe:'#b4b3a6',aquarium:'#adcbd2',outdoor:'#afc899',arcade:'#b7bad1',karaoke:'#cbb9ca'};
 w.shellFixtures=new Map();
 const floor=w.box(w.root,W,.16,H,floors[p.theme]||'#ddccac',[0,-.1,0]);

 if(data.id==='sento')w.box(w.root,W-.3,.018,16.2,'#b5d8d3',[0,.002,-H/2+8.2]);
 if(data.id==='school')w.box(w.root,16,.02,H-.3,'#b1c692',[W/2-8,.01,0]);
 if(data.id==='sports'){
  w.box(w.root,31,.02,33,'#657b80',[-24,.008,-15]);
  w.box(w.root,30,.02,36,'#b1c994',[31,.008,20]);
 }
 if(data.id==='home')w.box(w.root,15,.018,12,'#cac4b1',[-14,.005,15]);
 w.buildingFloor=floor;for(const k of ['floor','ground','entryfloor','path','road','deck'])w.shellFixtures.set(k,floor);w.bounds=[-W/2+.6,W/2-.6,-H/2+.6,H/2-.6];
 function wall(x,z,ww,dd,h=1.3,color='#efe1c8'){
  const m=w.box(w.root,ww,h,dd,color,[x,h/2,z]);w.shellFixtures.set('wall-shell',m);w.shellFixtures.set('wall',m);w.collider(x,z,ww,dd);
  w.box(w.root,ww+.03,.08,dd+.03,'#c1ad8d',[x,h+.02,z]);
 }
 if(data.id==='koban'){
  w.box(w.root,W,.018,H/2-3,'#c1c8be',[0,.01,(H/2+3)/2]);
  wall(0,-H/2,W,.18,2.7);wall(-W/2,(-H/2+3)/2,.18,H/2+3,1.2);wall(W/2,(-H/2+3)/2,.18,H/2+3,1.2);
  wall(-W/4-1,3,W/2-2,.18,.7);wall(W/4+1,3,W/2-2,.18,.7);
  const door=w.group(null,[-2.3,0,3]);w.models.model(door,{kind:'door',jp:'入口'});w.shellFixtures.set('door',door);
  const win=w.group(null,[6,0,-H/2+.2]);w.models.model(win,{kind:'window-shell',jp:'窓'});w.shellFixtures.set('window-shell',win);
  return floor;
 }
 if(!out){
  wall(0,-H/2,W,.18,3);wall(-W/2,0,.18,H);wall(W/2,0,.18,H);
  wall(-W/4-1,H/2,W/2-2,.18,.5);wall(W/4+1,H/2,W/2-2,.18,.5);
  // Windows belong to the outer façade, not to every department.
  for(let x=-W/2+4;x<W/2-2;x+=8){const win=w.group(null,[x,0,-H/2+.13]);w.models.model(win,{kind:'window-shell',jp:'窓'});w.shellFixtures.set('window-shell',win);for(const dx of [-2,0,2])w.box(w.root,.08,1.7,.1,'#efe7d4',[x+dx,1.65,-H/2+.18]);}
  const trim=data.id==='aeon'?'#a45783':p.theme==='bank'?'#b34e53':p.theme==='post'?'#ba6d60':p.theme==='clinic'?'#81b5a9':p.theme==='netcafe'?'#78624d':'#a3997d';
  w.box(w.root,W-.4,.25,.07,trim,[0,1.05,-H/2+.12]);
  for(const z of p.zones.filter(z=>z.private)){
   const x=z.x,y=z.z;
   // Rear rooms share the hall; a three-metre doorway remains on the public side.
   if(data.id==='sento'&&z.index===1){wall(x-4.3,y-6.7,5.6,.15,1.2);wall(x+4.3,y-6.7,5.6,.15,1.2);wall(8,y-6.7,20,.15,1.2);wall(-17,y-6.7,2,.15,1.2);}else wall(x,y-6.7,14.4,.15,1.6);
   wall(x-7.1,y-.6,.15,12.1,1.05);wall(x+7.1,y-.6,.15,12.1,1.05);
   wall(x-4.3,y+5.5,5.6,.15,.8);wall(x+4.3,y+5.5,5.6,.15,.8);
   z.entry=[x,y+6.2];
  }
  const door=w.group(null,[-3.2,0,H/2-.3]);w.models.model(door,{kind:'door',jp:'入口'});w.shellFixtures.set('door',door);
  const ac=w.group(null,[W/2-3,2,-H/2+.25]);w.models.model(ac,{kind:'aircon',jp:'エアコン'});w.shellFixtures.set('aircon',ac);
  const light=w.box(w.root,4,.09,.45,'#ffedc7',[0,3.1,-H/2+1]);w.shellFixtures.set('lighting-shell',light);
  for(let x=-W/2+2;x<W/2;x+=2)w.box(w.root,.014,.005,H,'#c5bea8',[x,-.012,0]);
  w.box(w.root,3,.022,1.5,'#7e9f99',[0,.015,H/2-2.4]);
 }else{
  // A continuous promenade links outdoor learning areas.
  for(const z of p.zones){const a=new w.THREE.Vector3(0,.01,p.entrance[1]),b=new w.THREE.Vector3(z.entry[0],.01,z.entry[1]),d=a.distanceTo(b);w.box(w.root,2.8,.045,d,'#dccaa8',a.add(b).multiplyScalar(.5).toArray(),[0,Math.atan2(z.entry[0],z.entry[1]-p.entrance[1]),0]);}
 }
 return floor;
}
