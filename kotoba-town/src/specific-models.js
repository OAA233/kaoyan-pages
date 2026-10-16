// Concrete everyday objects: silhouettes, working parts and labels vary by purpose.
export function createSpecificModels({box,cyl,sphere,mesh,rod,label,group}){return(g,w)=>{
 const a=w.detail;if(!a)return false;const k=a.type,c=a.color||'#96b6ad',ink='#485c60',paper='#f7eed5',wood='#b8956e';
 const plate=()=>cyl(g,.55,.52,.045,paper,[0,.04,0]);
 const handle=(x,y,z,r=.17)=>mesh(g,'torus',[r,.035,8,20],ink,[x,y,z]);


 if(k==='card'){box(g,.8,.025,.5,c,[0,.03,0]);box(g,.74,.01,.08,paper,[0,.05,-.12]);for(let i=0;i<4;i++)box(g,.12,.008,.05,paper,[-.27+i*.18,.05,.14]);return true;}
 if(k==='cup-lid'){cyl(g,.38,.38,.035,paper,[0,.04,0]);cyl(g,.29,.33,.05,paper,[0,.08,0]);box(g,.12,.013,.045,ink,[0,.108,.23]);return true;}
 if(k==='hook'){box(g,.28,.55,.05,paper,[0,.3,0]);rod(g,[0,.12,.04],[0,.05,.25],.03,ink);rod(g,[0,.05,.25],[0,.18,.30],.03,ink);return true;}
 if(k==='shoehorn'){sphere(g,.18,wood,[0,.07,-.35],[1,.18,1.7]);rod(g,[0,.07,-.15],[0,.07,.70],.045,wood);handle(0,.07,.82,.08);return true;}
 if(k==='mic-charger'){box(g,1.15,.15,.55,ink,[0,.09,0]);for(const x of[-.3,.3]){cyl(g,.09,.075,.5,ink,[x,.43,0]);sphere(g,.14,'#a1b1ae',[x,.78,0]);sphere(g,.025,'#91c390',[x,.20,.18]);}return true;}
 if(k==='key'){mesh(g,'torus',[.16,.035,8,20],ink,[0,.06,0],[Math.PI/2,0,0]);rod(g,[0,.05,.12],[0,.05,.55],.04,ink);for(const z of[.38,.48])box(g,.14,.04,.045,ink,[.05,.055,z]);box(g,.25,.05,.18,c,[0,.055,-.22]);return true;}
 if(k==='poi'){cyl(g,.24,.24,.016,paper,[0,.06,0]);mesh(g,'torus',[.26,.024,8,24],c,[0,.06,0],[Math.PI/2,0,0]);rod(g,[0,.06,.25],[0,.06,.78],.025,c);return true;}
 if(k==='string-hook'){rod(g,[0,.07,-.4],[0,.07,.45],.016,paper);rod(g,[0,.07,.45],[.18,.07,.57],.016,ink);rod(g,[.18,.07,.57],[.23,.07,.40],.016,ink);return true;}
 if(k==='arrow'){rod(g,[0,.03,-.62],[0,.03,.65],.024,wood);for(const x of[-.12,.12])box(g,.20,.015,.38,paper,[x,.035,-.4],[0,x<0?-.3:.3,0]);mesh(g,'cone',[.07,.18,3],ink,[0,.03,.70],[Math.PI/2,0,0]);return true;}
 if(k==='tape-roll'){cyl(g,.28,.28,.26,'#b5946a',[0,.15,0]);cyl(g,.15,.15,.015,paper,[0,.29,0]);cyl(g,.11,.11,.02,ink,[0,.30,0]);return true;}
 if(k==='stamp'){box(g,.45,.09,.38,ink,[0,.06,0]);box(g,.37,.18,.3,c,[0,.18,0]);sphere(g,.18,c,[0,.35,0],[1,.6,1]);box(g,.70,.08,.52,ink,[.65,.07,0]);box(g,.55,.012,.38,'#a46f66',[.65,.117,0]);return true;}
 if(k==='bucket'){cyl(g,.40,.28,.7,c,[0,.37,0]);cyl(g,.35,.35,.015,'#547f85',[0,.73,0]);mesh(g,'torus',[.4,.025,8,20],ink,[0,.73,0]);return true;}
 if(k==='spray'){cyl(g,.24,.24,.6,c,[0,.33,0]);box(g,.45,.10,.14,paper,[.11,.75,0]);box(g,.1,.22,.08,paper,[.21,.64,0]);label(g,'除菌',.35,.17,[0,.39,.25]);return true;}
 if(k==='clear-box'){box(g,.95,.35,.65,'#cedcd2',[0,.2,0]);box(g,1,.045,.70,c,[0,.41,0]);box(g,.65,.02,.37,'#e5e9db',[0,.445,0]);return true;}
 if(k==='paperback'){const h=w.jp==='新書'?1.1:w.jp==='単行本'?1.0:.8;box(g,.7,.12,h,c,[0,.08,0]);box(g,.65,.07,h-.05,paper,[.02,.10,0]);box(g,.7,.025,h,c,[0,.15,0]);const l=label(g,w.jp,.6,.18,[0,.169,0]);l.rotation.x=-Math.PI/2;return true;}
 if(k==='bag'){box(g,.92,.85,.35,c,[0,.45,0]);for(const z of[-.16,.16])mesh(g,'torus',[.23,.025,8,20],c,[0,1,z]);return true;}
 if(k==='water-thermometer'){box(g,.12,1.05,.08,paper,[0,.55,0]);rod(g,[0,.10,.05],[0,.75,.05],.017,'#b47069');for(let y=.3;y<1;y+=.1)box(g,.07,.014,.02,ink,[0,y,.055]);return true;}
 if(k==='goshuin-book'){box(g,.84,.15,1.14,c,[0,.08,0]);box(g,.77,.1,1.08,paper,[.02,.095,0]);box(g,.84,.03,1.14,c,[0,.16,0]);const l=label(g,'御朱印帳',.65,.18,[0,.18,0]);l.rotation.x=-Math.PI/2;return true;}
 if(k==='return-box'){box(g,1.2,1.3,.8,wood,[0,.65,0]);box(g,1.3,.1,.9,ink,[0,1.35,0]);box(g,.80,.16,.025,ink,[0,1.13,.414]);label(g,'納札箱',.9,.25,[0,.7,.415]);return true;}
 if(k==='softserve-machine'){box(g,1.25,1.75,.9,paper,[0,.88,0]);box(g,1.1,.38,.07,c,[0,1.42,.47]);for(const x of[-.3,.3]){rod(g,[x,1.1,.55],[x,1.43,.62],.045,ink);cyl(g,.065,.10,.14,ink,[x,.95,.57]);}box(g,1.2,.07,.6,ink,[0,.45,.56]);label(g,'ソフトクリーム',1.08,.2,[0,1.48,.53]);return true;}
 if(k==='hourglass'){for(const y of[.07,.94])cyl(g,.3,.3,.08,wood,[0,y,0]);for(const x of[-.24,.24])rod(g,[x,.1,0],[x,.9,0],.03,wood);cyl(g,.04,.22,.35,'#a8c9c6',[0,.33,0]);cyl(g,.22,.04,.35,'#a8c9c6',[0,.69,0]);cyl(g,.04,.17,.23,'#dfc593',[0,.23,0]);return true;}
 if(k==='dual-monitor'){for(const x of[-.8,.8]){box(g,1.45,.95,.13,ink,[x,1.35,0]);box(g,1.32,.81,.02,'#b3cbd5',[x,1.35,.08]);label(g,'うたおう',1.15,.23,[x,1.47,.10]);rod(g,[x,.05,0],[x,.88,0],.06,ink);box(g,.7,.08,.55,ink,[x,.05,0]);}return true;}
 if(k==='kendama'){rod(g,[0,.05,0],[0,.75,0],.055,wood);rod(g,[-.28,.45,0],[.28,.45,0],.06,wood);for(const x of[-.3,.3])cyl(g,.12,.09,.07,wood,[x,.47,0]);sphere(g,.18,c,[0,.92,0]);rod(g,[0,.86,0],[.18,.45,0],.012,paper);return true;}
 if(k==='marbles'){for(let i=0;i<6;i++)sphere(g,.12,['#a3cbd2','#d4b193','#a6bf9a'][i%3],[(i%3-1)*.24,.14,Math.floor(i/3)*.25]);return true;}
 if(k==='gloves'){for(const x of[-.22,.22]){box(g,.28,.06,.32,paper,[x,.06,0]);for(let i=0;i<4;i++)box(g,.05,.05,.20,paper,[x-.09+i*.06,.06,-.23]);}return true;}
 if(k==='earplugs'){box(g,.6,.05,.48,paper,[0,.035,0]);for(const x of[-.15,.15])cyl(g,.055,.075,.24,c,[x,.09,0],[Math.PI/2,0,0]);return true;}
 if(k==='tape-measure'){cyl(g,.20,.20,.2,c,[0,.13,0]);box(g,.75,.018,.14,'#eddcaa',[.38,.03,0]);for(let x=.2;x<.75;x+=.08)box(g,.012,.01,.09,ink,[x,.045,0]);return true;}
 if(k==='bib'){box(g,.62,.06,.66,c,[0,.09,0]);for(const x of[-.23,.23])box(g,.16,.05,.30,c,[x,.09,-.40]);label(g,'12',.35,.25,[0,.14,0]).rotation.x=-Math.PI/2;return true;}
 if(k==='comb'){box(g,.62,.035,.12,c,[0,.08,0]);for(let x=-.29;x<.3;x+=.05)box(g,.024,.035,.27,c,[x,.08,.16]);return true;}
 if(k==='wax'){cyl(g,.27,.27,.28,c,[0,.16,0]);cyl(g,.28,.28,.05,ink,[0,.325,0]);label(g,'WAX',.35,.12,[0,.19,.27]);return true;}
 if(k==='brush'){box(g,.32,.12,.4,wood,[0,.1,0]);rod(g,[0,.1,.20],[0,.1,.65],.06,wood);for(const x of[-.10,0,.10])for(const z of[-.12,0,.12])rod(g,[x,.17,z],[x,.32,z],.018,ink);return true;}
 if(k==='shaker'){cyl(g,.22,.19,.65,c,[0,.34,0]);cyl(g,.24,.24,.10,ink,[0,.73,0]);box(g,.14,.06,.10,c,[.08,.81,0]);for(let j=0;j<4;j++)box(g,.1,.012,.014,paper,[0,.25+j*.1,.22]);return true;}
 if(k==='ema-rack'){for(const x of[-1.3,1.3])rod(g,[x,0,0],[x,2.2,0],.08,wood);for(const y of[.7,1.4,2.1]){rod(g,[-1.3,y,0],[1.3,y,0],.06,wood);for(const x of[-.8,0,.8]){box(g,.5,.35,.06,'#deba88',[x,y-.22,.1]);label(g,'絵馬',.38,.15,[x,y-.2,.14]);}}return true;}
 if(k==='flowers')return false;
 if(k==='dish'){
  const s=a.shape||'rice';plate();
  if(s==='egg'){for(const x of[-.25,.25]){sphere(g,.24,paper,[x,.18,0],[1,.60,1.25]);cyl(g,.13,.13,.018,'#e3b963',[x,.327,0]);}return true;}
  if(s==='pork-slices'){for(const x of[-.22,.22]){cyl(g,.25,.25,.06,'#c18e70',[x,.13,0]);mesh(g,'torus',[.15,.022,8,20],'#e1bb96',[x,.17,0],[Math.PI/2,0,0]);}return true;}
  if(s==='strips'){for(let j=0;j<7;j++)box(g,.08,.05,.5,c,[(j%4-1.5)*.13,.11+Math.floor(j/4)*.065,0],[0,(j%3-1)*.2,0]);return true;}
  if(s==='onion'){for(let j=0;j<9;j++)mesh(g,'torus',[.065,.02,6,12],'#99b679',[(j%3-1)*.16,.13,Math.floor(j/3)*.15-.15],[Math.PI/2,0,0]);return true;}
  if(s==='corn'){cyl(g,.17,.17,.75,'#cfab55',[0,.27,0],[Math.PI/2,0,0]);for(let j=0;j<7;j++)for(let i=0;i<8;i++){const a=i*Math.PI/4;sphere(g,.05,'#e1c568',[Math.sin(a)*.17,.27+Math.cos(a)*.17,-.3+j*.1]);}rod(g,[0,.27,.4],[0,.27,.70],.025,wood);return true;}
  if(s==='banana'){sphere(g,.18,'#795844',[0,.23,0],[.8,.7,2.1]);for(let j=0;j<8;j++)sphere(g,.018,['#e1acb6','#ddcd91'][j%2],[Math.sin(j)*.08,.36,-.26+j*.07]);rod(g,[0,.23,.35],[0,.23,.7],.02,wood);return true;}
  if(s==='mushroom-bowl'){cyl(g,.48,.31,.3,paper,[0,.20,0]);sphere(g,.50,'#bf7260',[0,.43,0],[1,.40,1]);for(const[x,z]of[[-.24,0],[.20,.16],[.09,-.24]])sphere(g,.09,paper,[x,.59,z],[1,.16,1]);return true;}
  if(s==='croissant'){for(let j=-3;j<=3;j++){let a=j*.30;sphere(g,.20-Math.abs(j)*.03,c,[Math.sin(a)*.48,.20,Math.cos(a)*.42-.30],[.95,.7,1]);}return true;}
  if(['sushi','roll','gunkan'].includes(s)){
   for(const x of[-.23,.23]){sphere(g,.24,paper,[x,.16,0],[.8,.55,1.25]);if(s==='gunkan'){cyl(g,.23,.23,.25,'#45584b',[x,.19,0]);for(let j=0;j<5;j++)sphere(g,.07,c,[x+Math.sin(j*3)*.10,.35,Math.cos(j*3)*.10]);}else if(s==='roll'){cyl(g,.22,.22,.28,'#465747',[x,.21,0]);cyl(g,.18,.18,.015,paper,[x,.358,0]);cyl(g,.08,.08,.018,c,[x,.37,0]);}else{box(g,.33,.09,.53,c,[x,.30,0]);for(const z of[-.18,-.04,.10])box(g,.30,.01,.025,'#eed7b4',[x,.351,z],[0,.12,0]);}}
  }else if(['skewer','tsukune'].includes(s)){for(const x of[-.25,.25]){rod(g,[x,.13,-.6],[x,.13,.68],.022,wood);for(const z of[-.28,0,.28])sphere(g,.16,c,[x,.23,z],[s==='tsukune'?1:1.1,.7,1]);}}
  else if(['bowl','noodles','rice','soup'].includes(s)){cyl(g,.49,.32,.3,ink,[0,.2,0]);cyl(g,.44,.44,.012,s==='soup'?c:'#ead7b0',[0,.36,0]);if(s==='noodles')for(let j=-4;j<=4;j++)rod(g,[-.3,.39,j*.07],[.3,.39,j*.07],.018,paper);else for(const[x,z,col]of[[-.2,-.1,c],[.16,.13,c],[.13,-.18,'#99b577'],[-.17,.20,'#d6ab69']])sphere(g,.16,col,[x,.41,z],[1,.25,1]);}
  else if(s==='fish'){sphere(g,.34,c,[0,.18,0],[1.4,.3,.65]);mesh(g,'cone',[.15,.3,3],c,[-.48,.17,0],[0,0,Math.PI/2]);for(const x of[-.2,0,.2])rod(g,[x,.29,-.13],[x+.08,.29,.13],.018,'#7e664e');}
  else if(s==='cutlet'){for(let x=-.3;x<=.3;x+=.15)box(g,.12,.14,.55,c,[x,.15,0]);for(let i=0;i<7;i++)rod(g,[.35,.1,-.2+i*.05],[.55,.22,-.2+i*.05],.012,'#b1c588');}
  else if(s==='sweets'){for(const x of[-.23,.23]){sphere(g,.22,c,[x,.2,0],[1,.7,1]);if(a.leaf)box(g,.37,.025,.5,'#91a078',[x,.16,.06]);}}
  else{for(let i=0;i<5;i++)sphere(g,.17,c,[Math.sin(i*2)*.3,.18,Math.cos(i*2)*.3],[1,.7,1]);}return true;
 }
 if(k==='envelope'||k==='form'){
  box(g,.85,.025,1.12,paper,[0,.025,0]);box(g,.82,.012,.2,c,[0,.044,-.41]);const l=label(g,a.label||w.jp,.72,.14,[0,.055,-.42]);l.rotation.x=-Math.PI/2;
  for(let j=0;j<5;j++)box(g,.62,.012,.018,'#97a9a1',[0,.05,-.15+j*.18]);if(k==='form')for(const x of[-.31,0,.31])box(g,.014,.012,.88,'#97a9a1',[x,.05,.06]);return true;
 }
 if(k==='box-product'){box(g,.8,.8,.36,c,[0,.42,0]);box(g,.67,.5,.015,paper,[0,.43,.19]);label(g,a.label||w.jp,.64,.21,[0,.53,.203]);for(let i=0;i<4;i++)box(g,.32,.02,.015,ink,[0,.33-i*.04,.205]);return true;}
 if(k==='microscope'){box(g,.8,.08,.65,ink,[0,.04,0]);rod(g,[-.22,.08,-.1],[-.22,.8,-.1],.09,c);box(g,.55,.07,.5,ink,[0,.48,0]);rod(g,[-.22,.80,-.1],[.2,1.10,0],.10,c);cyl(g,.075,.075,.30,ink,[.28,1.15,0],[0,0,-.4]);cyl(g,.05,.07,.2,ink,[0,.68,0]);sphere(g,.08,paper,[0,.24,0]);return true;}
 if(k==='globe'){cyl(g,.30,.30,.07,wood,[0,.04,0]);rod(g,[0,.07,0],[0,.48,0],.04,ink);sphere(g,.42,'#85b8ca',[0,.81,0]);for(let i=0;i<6;i++)sphere(g,.12,'#a3bd85',[Math.sin(i*1.3)*.33,.85+Math.cos(i*2)*.2,Math.cos(i*1.3)*.30],[1,.6,1]);return true;}
 if(k==='cart'){for(const y of[.35,1,1.6])box(g,1.75,.1,1,c,[0,y,0]);for(const x of[-.8,.8])for(const z of[-.43,.43]){rod(g,[x,.18,z],[x,1.7,z],.04,ink);sphere(g,.13,ink,[x,.12,z]);}for(const x of[-.45,.45]){cyl(g,.3,.3,.4,paper,[x,1.85,0]);cyl(g,.32,.32,.045,'#a8bbb6',[x,2.07,0]);}return true;}
 if(k==='aed'){box(g,.75,1,.25,paper,[0,.53,0]);box(g,.54,.62,.035,'#d5897b',[0,.56,.15]);label(g,'AED',.48,.22,[0,.68,.18]);box(g,.1,.32,.035,paper,[0,.43,.18]);box(g,.3,.1,.035,paper,[0,.43,.18]);return true;}
 if(k==='barrier'){for(const x of[-1,1]){cyl(g,.22,.22,.08,ink,[x,.04,0]);rod(g,[x,.08,0],[x,1.3,0],.045,ink);}rod(g,[-1,1.2,0],[1,1.2,0],.045,c);return true;}
 if(k==='kettle'){sphere(g,.35,c,[0,.38,0],[1,.85,1]);cyl(g,.19,.19,.08,ink,[0,.71,0]);rod(g,[.27,.36,0],[.58,.61,0],.07,c);handle(-.35,.48,0,.22);return true;}
 if(k==='tablet'){box(g,.9,.08,.68,ink,[0,.09,0]);box(g,.78,.012,.54,'#aecfd0',[0,.138,0]);for(let i=0;i<4;i++)box(g,.55,.008,.04,paper,[0,.15,-.15+i*.10]);return true;}
 if(k==='dispenser'){box(g,1.5,1.75,.8,c,[0,.875,0]);box(g,1.3,.55,.05,ink,[0,1.13,.43]);for(const x of[-.45,0,.45]){box(g,.28,.32,.03,['#d7b76e','#a3c183','#c58e91'][Math.round((x+.45)/.45)],[x,1.48,.46]);rod(g,[x,1.05,.44],[x,.85,.58],.025,ink);}box(g,1.3,.06,.38,ink,[0,.60,.49]);return true;}
 if(k==='shoe-washer'){box(g,1.3,1.1,1.2,c,[0,.55,0]);cyl(g,.5,.5,.07,'#455e61',[0,1.12,0]);cyl(g,.40,.40,.08,'#b9d6ce',[0,1.16,0]);rod(g,[0,1.18,0],[0,1.56,0],.12,'#d3b478');for(const x of[-.26,.26])sphere(g,.20,paper,[x,1.26,0],[1,.6,1.4]);label(g,'スニーカー',1.05,.2,[0,.8,.61]);return true;}
 if(k==='appliance'){box(g,1.5,1.9,1.05,c,[0,.95,0]);box(g,1.20,.40,.03,ink,[0,1.58,.54]);label(g,a.label||w.jp,1.12,.21,[0,1.6,.56]);cyl(g,.46,.46,.06,ink,[0,.70,.56],[Math.PI/2,0,0]);cyl(g,.37,.37,.065,'#a2c6c4',[0,.70,.60],[Math.PI/2,0,0]);return true;}
 if(k==='terminal'){box(g,1.1,1.2,.95,c,[0,.60,0]);box(g,1.2,.8,.13,ink,[0,1.67,-.1]);box(g,1,.62,.014,'#a4c9c5',[0,1.67,-.02]);label(g,a.label||w.jp,.9,.22,[0,1.75,0]);box(g,.55,.10,.04,ink,[0,.98,.49]);box(g,.4,.08,.04,ink,[0,.56,.49]);return true;}
 if(k==='incense'){cyl(g,.58,.40,.65,'#8f8877',[0,.43,0]);cyl(g,.52,.52,.04,'#c4c1ac',[0,.78,0]);for(let i=0;i<8;i++)rod(g,[Math.sin(i*2)*.22,.8,Math.cos(i*2)*.22],[Math.sin(i*2)*.22,1.18,Math.cos(i*2)*.22],.018,'#9b7460');for(const x of[-.3,.3])rod(g,[x,.1,0],[x,.35,0],.065,'#8f8877');return true;}
 if(k==='ladle'){cyl(g,.19,.19,.16,wood,[0,.1,0]);rod(g,[0,.12,0],[.85,.14,0],.035,wood);return true;}
 if(k==='omikuji'){cyl(g,.35,.35,.78,wood,[0,.4,0],[0,0,0],6);label(g,'おみくじ',.48,.18,[0,.45,.32]);for(const x of[-.12,0,.12])rod(g,[x,.7,0],[x,1.15,0],.023,'#e8d4a4');return true;}
 if(k==='ema'){box(g,.68,.5,.065,wood,[0,.3,0]);const roof=mesh(g,'cone',[.47,.3,3],wood,[0,.62,0],[0,0,0]);roof.scale.z=.12;label(g,a.label||'絵馬',.49,.18,[0,.32,.05]);handle(0,.82,0,.09);return true;}
 if(k==='bloodpressure'){box(g,.65,.24,.6,paper,[0,.18,0]);box(g,.42,.025,.25,'#a9c1b3',[0,.315,-.08]);const cuff=cyl(g,.26,.26,.42,c,[.65,.24,0],[0,0,Math.PI/2]);rod(g,[.28,.14,.2],[.5,.14,.2],.025,ink);return true;}
 if(k==='stethoscope'){for(const x of[-.16,.16]){rod(g,[x,1.05,0],[x*.8,.66,0],.023,ink);sphere(g,.04,paper,[x,1.05,0]);}rod(g,[0,.65,0],[.35,.20,0],.025,c);cyl(g,.14,.14,.04,ink,[.35,.18,0],[Math.PI/2,0,0]);return true;}
 if(k==='hairtools'){box(g,.8,.12,.42,c,[0,.09,0]);for(const x of[-.25,0,.25])rod(g,[x,.15,0],[x,.7,0],.045,ink);for(const x of[-.25,.25])handle(x,.80,0,.10);return true;}
 if(k==='flower'){cyl(g,.28,.20,.35,wood,[0,.2,0]);for(let i=0;i<5;i++){let x=Math.sin(i*2)*.23,z=Math.cos(i*2)*.23;rod(g,[0,.3,0],[x,.95,z],.017,'#7e9b66');for(let j=0;j<5;j++)sphere(g,.09,c,[x+Math.sin(j)*.1,1, z+Math.cos(j)*.1]);sphere(g,.05,'#d3af61',[x,1.04,z]);}return true;}
 if(k==='packet'){box(g,.62,.8,.18,c,[0,.43,0]);label(g,a.label||w.jp,.53,.22,[0,.48,.10]);for(const y of[.06,.80])box(g,.65,.045,.20,paper,[0,y,0]);return true;}
 if(k==='toy'){sphere(g,.28,c,[0,.36,0]);for(const x of[-.15,.15])sphere(g,.12,c,[x,.60,0]);for(const x of[-.09,.09])sphere(g,.025,ink,[x,.40,.26]);return true;}
 if(k==='roll'){cyl(g,.24,.24,.7,paper,[0,.38,0]);cyl(g,.10,.10,.025,ink,[0,.741,0]);box(g,.40,.35,.025,c,[.13,.55,.22]);return true;}
 if(k==='snack'){cyl(g,.25,.22,.65,c,[0,.36,0]);for(let i=0;i<10;i++)sphere(g,.10,paper,[Math.sin(i*2)*.18,.73+i%2*.08,Math.cos(i*2)*.18]);label(g,a.label||w.jp,.39,.14,[0,.37,.25]);return true;}
 if(k==='band'){mesh(g,'torus',[.28,.09,8,24],c,[0,.18,0],[Math.PI/2,0,0]);cyl(g,.16,.16,.06,paper,[0,.21,.28]);return true;}
 if(k==='basket'){box(g,1,.08,.7,c,[0,.04,0]);for(const x of[-.48,.48])for(const y of[.18,.32,.46])box(g,.04,.04,.7,c,[x,y,0]);for(const z of[-.33,.33])for(const y of[.18,.32,.46])box(g,1,.04,.04,c,[0,y,z]);for(const x of[-.45,.45])rod(g,[x,.5,0],[x,.85,0],.025,ink);rod(g,[-.45,.85,0],[.45,.85,0],.025,ink);return true;}
 return false;
};}
