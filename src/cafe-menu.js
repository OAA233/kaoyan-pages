// Food and drink silhouettes for the menu and the cafe's labeled sample cases.
export function createCafeModels({T,box,cyl,sphere,mesh,group,rod}){
 const cream='#fff0d2',coffee='#684637',plate='#efe4ca';
 const dish=g=>cyl(g,.62,.56,.055,plate,[0,.035,0]);
 function topping(g,y){for(let i=0;i<5;i++){const a=i*2.4;sphere(g,.14,cream,[Math.cos(a)*.1,y+i*.04,Math.sin(a)*.1],[1,.8,1]);}}
 function slice(g,color,layers=1){
  for(let i=0;i<layers;i++){const m=cyl(g,.55,.55,.12,i%2?cream:color,[0,.1+i*.12,0],[0,Math.PI,0],3);m.scale.z=1.15;}

 }
 return (g,w)=>{
  if(w.kind==='cafe-case'){box(g,2,.7,1,'#ad9a7e',[0,.35,0]);box(g,2,.06,1.1,'#f3e5cb',[0,.75,0]);for(const x of[-.95,.95])box(g,.06,.8,1,'#bfd5cc',[x,1.12,0]);box(g,2,.08,1.1,'#e2e8da',[0,1.55,0]);return true;}
  const a=w.cafe;if(!a)return false;const c=a.color||coffee,f=a.form;
  if(a.type==='drink'){
   if(f==='iced'||f==='float'){
    cyl(g,.32,.24,.90,c,[0,.49,0]);cyl(g,.34,.34,.04,'#c9ded5',[0,.95,0]);
    for(const x of[-.16,.12])for(const z of[-.10,.13])box(g,.16,.12,.14,'#cde5df',[x,.90,z],[0,x,0]);
    rod(g,[.18,.80,0],[.3,1.43,0],.023,'#f3e4cb');if(f==='float'){sphere(g,.27,cream,[-.04,1.14,0]);sphere(g,.055,'#c76359',[.12,1.35,.02]);}
    for(const x of[-.2,.2])rod(g,[x,.12,.19],[x,.85,.25],.018,'#d9ebe2');
   }else{
    dish(g);const r=f==='espresso'?.22:.34,h=f==='espresso'?.28:.48;
    cyl(g,r,r*.8,h,'#e8e0c9',[0,h/2+.09,0]);cyl(g,r*.88,r*.88,.018,c,[0,h+.095,0]);
    const handle=mesh(g,'torus',[r*.40,.047,8,14],'#e8e0c9',[r+.07,h*.57+.08,0]);
    if(a.milk){cyl(g,r*.66,r*.66,.012,cream,[0,h+.108,0]);for(const x of[-.10,0,.10])sphere(g,.035,c,[x,h+.12,0],[1,.1,2]);}
    if(a.cream)topping(g,h+.12);
   }return true;
  }
  dish(g);
  if(['crepe','cheesecake','tiramisu','applepie'].includes(f)){
   slice(g,c,f==='crepe'?7:4);
   if(f==='applepie')for(let i=-2;i<3;i++)rod(g,[-.3,.59,i*.1],[.3,.59,i*.1],.022,'#dfb878');
   if(f==='cheesecake')for(let i=0;i<5;i++)sphere(g,.04,'#ad8355',[-.24+i*.1,.60,-.22],[1,.2,1]);
  }else if(f==='montblanc'){
   cyl(g,.42,.42,.12,'#be925a',[0,.13,0]);sphere(g,.34,c,[0,.37,0],[1,1.1,1]);
   for(let j=0;j<9;j++){const y=.23+j*.04,r=.34*(1-j/12);for(let i=0;i<16;i++){const a=i*Math.PI/8,b=(i+1)*Math.PI/8;rod(g,[Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(b)*r,y,Math.sin(b)*r],.02,'#d4b186');}}
   sphere(g,.12,'#aa7954',[0,.65,0]);
  }else if(f==='tart'){
   cyl(g,.47,.44,.17,'#b9834f',[0,.17,0]);cyl(g,.40,.40,.10,c,[0,.3,0]);topping(g,.4);
  }else if(f==='pudding'){
   cyl(g,.28,.4,.48,'#efd194',[0,.33,0]);cyl(g,.28,.29,.038,'#9b613d',[0,.59,0]);topping(g,.63);sphere(g,.055,'#cb655d',[.15,.8,0]);
  }else if(f==='jelly'){
   cyl(g,.35,.24,.43,'#8d6752',[0,.31,0]);for(const x of[-.15,.12])for(const z of[-.12,.1])box(g,.22,.16,.2,coffee,[x,.52,z],[0,x,0]);topping(g,.64);
  }else if(f==='softserve'||f==='danish'){
   if(f==='danish'){cyl(g,.48,.46,.24,'#c19352',[0,.22,0]);for(let i=0;i<6;i++){let a=i*Math.PI/3;rod(g,[0,.35,0],[Math.cos(a)*.42,.35,Math.sin(a)*.42],.025,'#9e6d40');}}
   for(let i=0;i<7;i++)cyl(g,.26-i*.032,.29-i*.032,.10,cream,[0,(f==='danish'?.43:.18)+i*.085,0]);
  }else if(f==='pancake'){
   for(let i=0;i<3;i++){cyl(g,.46,.46,.12,'#bd9056',[0,.16+i*.14,0]);cyl(g,.43,.43,.015,'#dfb776',[0,.226+i*.14,0]);}box(g,.20,.07,.18,'#f0d07f',[0,.56,0]);
  }else if(f==='icecream'){for(const[x,c]of[[-.2,'#ffefcf'],[.2,'#d5a18c']])sphere(g,.26,c,[x,.34,0]);}
  else if(f==='ice'){sphere(g,.45,'#f0f2dc',[0,.40,0],[1,.9,1]);sphere(g,.35,'#d99da2',[0,.60,0],[1,.25,1]);}
  return true;
 };
}
export function furnishCafeDisplays(world,data,zone,h){
 if(data.id!=='kissaten'||![4,5].includes(zone.index))return false;
 const {box,sceneGroup,register,surfaces}=h,words=data.items.filter(w=>w.zone===zone.index),drinks=zone.index===5;
 const make=(w,x,y,z)=>{const g=world.group(null,[x,y,z],0,sceneGroup);world.models.model(g,w);g.scale.setScalar(.95);register(g,w);return g;};
 // Stepped, open-front sample case. Back row is higher and set back, keeping each item clickable.
 const width=drinks?12:12,cols=drinks?13:8;
 const base=box(width,.84,3.5,drinks?'#9f7958':'#ad9a7e',0,.42,-1);
 const caseWord=words.find(w=>w.kind==='cafe-case');if(caseWord)register(base,caseWord);
 box(width+.1,.1,3.6,'#f3e5cb',0,.88,-1);
 box(width,.10,1.55,'#e4d6b9',0,1.66,-1.9);
 box(width,1.2,.08,'#d0dace',0,1.45,-2.75);
 for(const x of[-width/2,width/2])box(.07,1.25,2.8,'#b7cebf',x,1.49,-1.4);
 world.collider(zone.x,zone.z-1,width,3.6);
 world.label(sceneGroup,drinks?'ドリンク見本':'ケーキ・デザート見本',7,.48,[0,.54,.81],0,drinks?'#9f7958':'#ad9a7e','#fff9e4');
 const food=words.filter(w=>w.cafe);
 food.forEach((w,i)=>{const row=Math.floor(i/cols),col=i%cols;const spacing=(width-1)/cols,x=(col-(cols-1)/2)*spacing,z=row===0?-.05:-1.9,y=row===0?.95:1.72;make(w,x,y,z);
  // Small readable nameplates follow each sample, with no hidden extra text in the geometry.
  const label=world.label(sceneGroup,w.jp,spacing*.96,.17,[x,y+.11,z+.66]);label.rotation.x=-.40;register(label,w);
 });
 const menu=words.find(w=>w.kind==='menu');if(menu){const g=make(menu,-5.3,0,2.6);g.scale.setScalar(.85);}
 // Suppress generic furniture stocking; every visible sample is explicitly registered.
 surfaces.push({x:0,z:-1,w:width,d:3,y:.95});return true;
}
