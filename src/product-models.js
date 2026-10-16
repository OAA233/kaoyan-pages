// Recognizable teaching packages. Names refer to real products; geometry is an illustration.
export function createProductModels(ctx){
 const {box,cyl,sphere,mesh,textPlane}=ctx;
 return (g,w)=>{
  if(w.kind!=='retail-product')return false;
  const p=w.product,c=w.color||'#dbd4bc',ink='#203e50';let fw=.66,fh=.64,fy=.52,fz=.19;
  if(['bottle','pump'].includes(p.shape)){
   cyl(g,.27,.26,.70,c,[0,.36,0]);cyl(g,.13,.16,.19,'#f0eee1',[0,.80,0]);
   if(p.shape==='pump'){box(g,.42,.08,.15,'#edf2e6',[.05,.91,0]);}else cyl(g,.15,.15,.1,c,[0,.93,0]);fw=.46;fh=.39;fy=.42;fz=.274;
  }else if(p.shape==='cup'){
   cyl(g,.40,.29,.75,c,[0,.39,0]);cyl(g,.43,.43,.06,'#c84e47',[0,.8,0]);fw=.62;fh=.46;fy=.44;fz=.35;
  }else if(p.shape==='stick'){
   box(g,.40,1.05,.26,c,[0,.53,0]);for(const y of [.03,1.03])box(g,.42,.05,.29,'#f4e8c2',[0,y,0]);fw=.34;fh=.64;fy=.59;fz=.136;
  }else if(p.shape==='eraser'){
   box(g,.88,.30,.43,'#f7f4e7',[0,.15,0]);box(g,.57,.31,.44,'#3f6fba',[0,.155,0]);fw=.56;fh=.27;fy=.16;fz=.226;
  }else if(p.shape==='shirt'){
   box(g,.76,.10,.83,c,[0,.07,0]);for(const x of [-.48,.48])box(g,.30,.10,.35,c,[x,.07,-.17],[0,x,0]);cyl(g,.14,.14,.012,'#768f83',[0,.132,-.34]);fw=.56;fh=.38;fy=.133;fz=.06;
  }else if(p.shape==='socks'){
   for(const x of [-.21,.21]){box(g,.23,.10,.65,c,[x,.07,-.12]);box(g,.33,.10,.26,c,[x+.04,.07,.29]);}fw=.50;fh=.22;fy=.13;fz=-.1;
  }else if(p.shape==='book'){
   box(g,.82,.10,1.1,c,[0,.07,0]);box(g,.77,.045,1.04,'#fff7e3',[.014,.065,0]);box(g,.82,.016,1.1,c,[0,.132,0]);fw=.76;fh=.86;fy=.142;fz=0;
  }else if(p.shape==='carton'){
   box(g,.61,.80,.48,c,[0,.40,0]);box(g,.63,.25,.28,'#c5d8e8',[0,.90,0],[.5,0,0]);fw=.55;fh=.58;fy=.44;fz=.247;
  }else{
   const bag=p.shape==='bag';box(g,.84,bag?1.08:.91,bag?.32:.37,c,[0,bag?.54:.455,0]);if(bag)for(const y of [.03,1.05])box(g,.86,.065,.34,'#d6c8ad',[0,y,0]);fw=.77;fh=.79;fy=bag?.56:.47;fz=bag?.168:.192;
  }
  const face=textPlane(g,fw,fh,[0,fy,fz],0,(x,W,H)=>{
   x.fillStyle=p.shape==='eraser'?'#1a253a':'#fff5e5';x.fillRect(0,0,W,H);
   x.fillStyle=p.shape==='eraser'?'white':ink;x.textAlign='center';x.textBaseline='middle';
   x.font='700 '+Math.min(H*.14,W/Math.max(p.brand.length,4)*.88)+'px sans-serif';x.fillText(p.brand,W/2,H*.14,W*.94);
   const lines=p.label.length>12?[p.label.slice(0,12),p.label.slice(12)]:[p.label];x.font='900 '+Math.min(H*.23,W/Math.max(...lines.map(s=>s.length),4)*.91)+'px sans-serif';lines.forEach((s,i)=>x.fillText(s,W/2,H*(.40+i*.21),W*.95));
   x.fillStyle=c;x.fillRect(W*.12,H*.80,W*.76,H*.08);
  });
  if(['book','shirt','socks'].includes(p.shape))face.rotation.x=-Math.PI/2;
  // Embossed shape cues distinguish familiar snack packs even before opening the word card.
  if(p.action==='eat'&&['box','bag'].includes(p.shape)){
   if(p.key==='oreo'){for(const x of [-.19,.19]){const cookie=cyl(g,.125,.125,.045,'#322723',[x,.28,fz+.015]);cookie.rotation.x=Math.PI/2;}}
   if(p.key==='pocky')for(const x of [-.22,-.10,.02,.14,.26])box(g,.036,.29,.025,'#85513d',[x,.27,fz+.02],[0,0,-.2]);
  }
  return true;
 };
}
