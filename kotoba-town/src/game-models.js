import {createSpecificModels} from './specific-models.js';
import {createArcadeModels} from './arcade-interior.js';
import {createCheckoutModels} from './drugstore-checkout.js';
import {createCafeModels} from './cafe-menu.js';
import {createAquariumModels} from './aquarium-detail.js';
import {createProductModels} from './product-models.js';
import {createWorkModels} from './restaurant-staff.js';
import {createRestaurantModels} from './restaurant-interior.js';
import {createConvenienceModels} from './convenience-interior.js';
import {createDetailModels} from './detail-models.js';
// Models designed for the overhead game. No legacy first-person or brick geometry.
export function createGameModels(ctx){
 const {T,box,cyl,sphere,mesh,group,rod,label}=ctx; const detailModel=createDetailModels(ctx);const convenienceModel=createConvenienceModels(ctx);const restaurantModel=createRestaurantModels(ctx);const workModel=createWorkModels(ctx);const productModel=createProductModels(ctx);const aquariumModel=createAquariumModels(ctx);const specificModel=createSpecificModels(ctx);const arcadeModel=createArcadeModels(ctx);const checkoutModel=createCheckoutModels(ctx);const cafeModel=createCafeModels(ctx);
 const colors={wood:'#bf8966',lightwood:'#e3bb84',cream:'#fff1d1',ink:'#425c66',mint:'#83b9a3',blue:'#7ab5cb',pink:'#e9a5ae',red:'#d98070',yellow:'#efd183'};
 const family=(keys,k)=>keys.split(' ').includes(k);
 function bowl(g,c=colors.cream,r=.38){cyl(g,r,r*.7,.23,c,[0,.14,0]);cyl(g,r*.86,r*.86,.014,'#ad876b',[0,.263,0]);}
 function plate(g){cyl(g,.43,.39,.055,colors.cream,[0,.04,0]);cyl(g,.35,.35,.012,'#f7e5c1',[0,.075,0]);}
 function cup(g,c=colors.cream){cyl(g,.24,.20,.48,c,[0,.25,0]);cyl(g,.205,.205,.018,'#8a9869',[0,.50,0]);}
 function table(g,w=2,h=1,d=1.2){box(g,w,.15,d,colors.lightwood,[0,h,0]);for(const x of [-w*.42,w*.42])for(const z of [-d*.37,d*.37])box(g,.15,h,.15,colors.wood,[x,h/2,z]);}
 function chair(g,back=true){box(g,.85,.14,.82,colors.lightwood,[0,.65,0]);for(const x of [-.32,.32])for(const z of [-.31,.31])box(g,.11,.63,.11,colors.wood,[x,.31,z]);if(back){box(g,.92,.67,.12,colors.wood,[0,1.02,-.38]);for(const x of [-.35,.35])box(g,.09,.75,.09,colors.wood,[x,.92,-.38]);}}
 function plant(g,flower=false){cyl(g,.33,.24,.45,colors.red,[0,.25,0]);for(let i=0;i<5;i++){const a=i*1.9;rod(g,[0,.35,0],[Math.sin(a)*.35,.8+i*.07,Math.cos(a)*.25],.025,'#709675');sphere(g,.23,flower?['#eca9b1','#f0d295'][i%2]:'#88b18a',[Math.sin(a)*.35,.8+i*.07,Math.cos(a)*.25],[1,.55,.8]);}}
 function roof(g,w=3.8,d=2.8,y=3,c='#688d98'){for(const a of [-1,1])box(g,w+.5,.20,d*.62,c,[0,y,a*d*.25],[a*.42,0,0]);box(g,w+.6,.18,.22,c,[0,y+.56,0]);}
 function building(g,type){box(g,3.5,2.3,2.6,type==='koban'?'#c0d2c9':'#e5c99e',[0,1.18,0]);roof(g,3.5,2.6,2.7);box(g,1.05,1.9,.13,'#83aaab',[0,1,1.37]);for(const x of [-1.15,1.15])box(g,.8,.95,.12,'#add0d0',[x,1.45,1.4]);}
 function bottle(g,w,pump=false){const c=w.color||colors.mint;cyl(g,.22,.22,.65,c,[0,.34,0]);cyl(g,.13,.14,.20,colors.cream,[0,.76,0]);box(g,.33,.31,.015,'#fff4d9',[0,.37,.223]);if(pump){box(g,.35,.07,.12,colors.cream,[.05,.89,0]);}else cyl(g,.15,.15,.10,colors.cream,[0,.86,0]);}
 function screen(g,w=1.1,h=.7){box(g,w+.13,h+.12,.12,colors.ink,[0,h/2+.23,0]);box(g,w,h,.018,colors.blue,[0,h/2+.24,.073]);box(g,.13,.22,.13,colors.ink,[0,.13,0]);box(g,.55,.06,.36,colors.ink,[0,.03,0]);for(let i=0;i<3;i++)box(g,w*.63,.04,.006,'#d7ece6',[-w*.08,h*.68-i*.14,.087]);}
 function animal(g,k,c){const fishy=family('fish clownfish shark ray seahorse garden-eel squid octopus jellyfish urchin starfish crab shrimp seal penguin turtle dog cat stone-dog plush',k);if(!fishy)return;
  if(family('fish clownfish shark',k)){const size=k==='shark'?1.5:.9;sphere(g,.4,c||'#e6b278',[0,.44,0],[size, .62,.54]);mesh(g,'cone',[.30,.4,3],c||'#e6b278',[-.48*size,.44,0],[0,0,Math.PI/2]);sphere(g,.047,colors.ink,[.28*size,.49,.21]);sphere(g,.025,'#ffffff',[.30*size,.51,.24]);return;}
  if(k==='jellyfish'){sphere(g,.46,c||'#c5b0d6',[0,.83,0],[1,.65,1]);for(const x of [-.25,0,.25])rod(g,[x,.63,0],[x+.04,.15,.08],.035,'#ceb6d9');return;}
  if(family('octopus squid',k)){sphere(g,.32,c||'#dca0a0',[0,.60,0],[1,k==='squid'?1.5:1,1]);for(let i=0;i<8;i++){const a=i*Math.PI/4;rod(g,[0,.40,0],[Math.cos(a)*.48,.08,Math.sin(a)*.48],.08,c||'#dca0a0');}for(const x of [-.13,.13])sphere(g,.055,colors.ink,[x,.60,.30]);return;}
  if(k==='crab'){sphere(g,.4,'#db8c76',[0,.25,0],[1,.48,.75]);for(const a of [-1,1])for(let i=0;i<3;i++)rod(g,[a*.2,.23,(i-1)*.13],[a*.57,.07,(i-1)*.27],.045,'#db8c76');for(const x of [-.14,.14]){rod(g,[x,.3,.1],[x,.46,.1],.024,'#db8c76');sphere(g,.04,colors.ink,[x,.46,.1]);}return;}
  if(k==='starfish'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod(g,[0,.05,0],[Math.sin(a)*.5,.05,Math.cos(a)*.5],.12,'#e4b776');}return;}
  if(k==='urchin'){sphere(g,.25,'#8c718e',[0,.27,0]);for(let i=0;i<20;i++){const a=i*2.4;rod(g,[0,.27,0],[Math.sin(a)*.4,.27+Math.cos(i)*.2,Math.cos(a)*.4],.02,'#8c718e');}return;}
  if(k==='garden-eel'||k==='seahorse'){rod(g,[0,.06,0],[0,.9,0],.085,'#ddb891');sphere(g,.12,'#ddb891',[0,.97,0]);sphere(g,.025,colors.ink,[.06,.98,.08]);return;}
  if(k==='ray'){sphere(g,.58,'#9bb6c0',[0,.2,0],[1.3,.22,1]);rod(g,[0,.19,-.3],[0,.13,-1],.045,'#9bb6c0');return;}
  if(k==='shrimp'){for(let i=0;i<5;i++)sphere(g,.16,'#e7ad98',[(i-2)*.19,.15+Math.sin(i*.7)*.06,0]);return;}
  if(k==='turtle'){sphere(g,.45,'#8dab8b',[0,.30,0],[1,.65,1.2]);sphere(g,.17,'#b6c19a',[0,.26,.58]);for(const a of [-1,1])for(const b of [-1,1])sphere(g,.18,'#b6c19a',[a*.4,.14,b*.28],[1.4,.3,.7]);return;}
  const plush=k==='plush',seal=k==='seal',bird=k==='penguin',color=c||(bird?'#566f82':seal?'#afc1c7':plush?'#dcb797':'#d5b49b');
  sphere(g,.45,color,[0,.5,0],[1,bird?1.3:.8,.8]);sphere(g,.33,color,[0,.98,.04]);if(bird){sphere(g,.34,'#fff0d6',[0,.54,.20],[.9,1.2,.6]);mesh(g,'cone',[.1,.22,4],'#e5b476',[0,.99,.36],[Math.PI/2,0,0]);}else{sphere(g,.13,'#f4d9bd',[0,.91,.31],[1,.75,.5]);if(!seal)for(const x of [-.22,.22])sphere(g,.13,color,[x,1.24,0],[1,1.3,.5]);else for(const x of [-.42,.42])sphere(g,.18,color,[x,.27,.05],[1.4,.3,.75]);}for(const x of [-.12,.12])sphere(g,.04,colors.ink,[x,1.01,.315]);
 }
 function food(g,w){const k=w.kind,j=w.jp;plate(g);
  if(k==='sushi'){box(g,.56,.16,.28,'#fff3dc',[0,.17,0]);
   if(/うに/.test(j)){box(g,.60,.25,.33,'#587660',[0,.23,0]);for(const x of [-.18,0,.18])sphere(g,.12,'#e8b569',[x,.38,0],[.8,.5,1]);}
   else if(/えび/.test(j)){for(let i=0;i<5;i++)sphere(g,.11,i%2?'#f8dbc2':'#e8a080',[(i-2)*.1,.3,0],[.7,.6,1.5]);mesh(g,'cone',[.12,.18,3],'#e8a080',[-.32,.29,0],[0,0,Math.PI/2]);}
   else{const c=/まぐろ/.test(j)?'#d97984':/玉子/.test(j)?'#eed07d':/いか|ほたて/.test(j)?'#f5e5c9':/うなぎ/.test(j)?'#ad8260':/さば/.test(j)?'#8ba8b1':'#edb397';box(g,.62,.10,.32,c,[0,.29,0]);for(const x of [-.18,0,.18])box(g,.025,.006,.3,/うなぎ/.test(j)?'#806750':'#fae0c7',[x,.345,0],[0,0,-.25]);if(/玉子/.test(j))box(g,.13,.035,.34,'#5b795f',[0,.36,0]);}
  }
  else if(k==='roll'){for(const x of [-.21,.21]){cyl(g,.18,.18,.24,'#638276',[x,.18,0]);cyl(g,.145,.145,.015,'#fff1cc',[x,.308,0]);cyl(g,.06,.06,.02,'#93b679',[x,.32,0]);}}
  else if(k==='onigiri'){mesh(g,'cone',[.32,.46,3],'#fff4d6',[0,.32,0],[0,Math.PI/2,Math.PI]);box(g,.23,.25,.08,'#647c64',[0,.22,.18]);}
  else if(k==='meat'||k==='sashimi'){for(const x of [-.25,0,.25]){box(g,.21,.10,.44,k==='meat'?'#d58f92':'#eca79b',[x,.14,0],[0,.15,0]);box(g,.02,.006,.42,'#f4d9c9',[x+.02,.194,0],[0,.15,0]);}}
  else if(k==='edamame'){for(const [x,z] of [[-.22,0],[.12,.1],[0,-.15]])sphere(g,.2,'#9ec077',[x,.14,z],[1.4,.5,.4]);}
  else if(family('rice soup bowl cupnoodle',k)){bowl(g,k==='bowl'?'#cd8a78':colors.cream);if(/そば|うどん|ラーメン|焼きそば/.test(j)){for(let i=0;i<6;i++)mesh(g,'torus',[.15+i*.018,.015,6,20],'#f6dba2',[0,.28,0],[Math.PI/2,0,0]);}else sphere(g,.26,/カレー/.test(j)?'#c99562':'#f9eaca',[0,.32,0],[1,.3,1]);}
  else if(family('fried eggroll bread bun sandwich sweet chocolate candy icecream ice',k)){const c=/チョコ/.test(j)?'#98725a':/大福/.test(j)?'#eec3d0':/プリン/.test(j)?'#e7c274':/かき氷/.test(j)?'#b9dce1':'#e0b184';for(let i=0;i<(k==='fried'?4:1);i++)sphere(g,.25,c,[(i%2-.5)*.3,.24,Math.floor(i/2)*.23-.1],[1,k==='icecream'?1.7:.75,1]);if(/ケーキ/.test(j)){box(g,.45,.25,.4,'#fff0d6',[0,.23,0]);sphere(g,.095,'#d78a7d',[0,.42,0]);}}
  else if(k==='skewer'){for(const z of [-.17,0,.17])sphere(g,.11,/団子/.test(j)?'#e6c7bd':'#d3a170',[0,.18,z]);rod(g,[0,.17,-.38],[0,.17,.4],.018,'#bc9871');}
  else if(k==='eggs'){for(const x of [-.22,0,.22])sphere(g,.14,'#fff0d6',[x,.17,0],[.8,1.2,.8]);}
  else if(k==='tofu'||k==='cheese'){box(g,.48,.20,.37,k==='tofu'?'#fff4d7':'#f3d186',[0,.19,0]);}
  else if(family('ginger pickles petals paste roe seaweed sheet',k)){for(let i=0;i<5;i++)sphere(g,.11,k==='paste'?'#a7bd80':k==='roe'?'#e59c75':k==='sheet'?'#688b6e':'#e0b99d',[(i%3-1)*.16,.15,Math.floor(i/3)*.15],[1,.35,1]);}
  else if(k==='vegetables'){for(const x of [-.2,0,.2])sphere(g,.17,['#91b784','#e2b381','#d3917d'][Math.round((x+.2)*5)],[x,.17,0],[1,.5,1]);}
 }
 function model(g,w){ if(specificModel(g,w)||arcadeModel(g,w)||checkoutModel(g,w)||cafeModel(g,w)||aquariumModel(g,w)||productModel(g,w)||workModel(g,w)||restaurantModel(g,w)||convenienceModel(g,w)||detailModel(g,w))return;
  if(w.kind==='telephone'){box(g,.7,.18,.6,'#dddccb',[0,.12,0]);box(g,.65,.12,.16,'#52666b',[0,.28,-.15]);for(const x of [-.24,.24])box(g,.20,.20,.22,'#52666b',[x,.26,-.15]);for(let r=0;r<3;r++)for(let c=0;c<3;c++)box(g,.09,.025,.065,'#8daba9',[(c-1)*.15,.23,.02+r*.09]);return;}
  if(w.kind==='calculator'){box(g,.55,.08,.75,'#708991',[0,.05,0]);box(g,.43,.02,.18,'#afc8b0',[0,.10,-.21]);for(let r=0;r<4;r++)for(let c=0;c<3;c++)box(g,.105,.022,.08,'#efe5c9',[(c-1)*.14,.10,-.04+r*.1]);return;}

  const k=w.kind||'packet',j=w.jp||'',c=w.color||colors.mint;

  if(j==='お好み焼き'){plate(g);cyl(g,.32,.32,.10,'#b98e5d',[0,.14,0]);for(let i=-2;i<=2;i++)rod(g,[-.22,.20,i*.10],[.22,.20,i*.10],.014,'#f0dfba');for(const x of [-.17,0,.17])sphere(g,.027,'#86a168',[x,.22,.10]);return;}
  if(j==='焼き魚'){plate(g);sphere(g,.31,'#bba67c',[0,.18,0],[1.1,.35,.5]);mesh(g,'cone',[.13,.20,3],'#a99771',[-.39,.18,0],[0,0,Math.PI/2]);for(const x of [-.16,0,.16])rod(g,[x,.295,-.10],[x+.05,.295,.1],.012,'#8d8064');return;}
  if(j==='鍋料理'){cyl(g,.40,.36,.25,'#7f8c80',[0,.16,0]);cyl(g,.36,.36,.02,'#d2ae7c',[0,.29,0]);for(const [x,z]of[[-.15,0],[.1,.1],[0,-.16]])sphere(g,.10,'#a4bd89',[x,.33,z],[1,.4,1]);box(g,.15,.07,.14,'#f2e5c9',[-.07,.34,.18]);return;}
  if(k==='trash'){cyl(g,.38,.32,.90,'#a5c0b3',[0,.46,0]);cyl(g,.40,.40,.09,'#d4dec5',[0,.95,0]);cyl(g,.19,.19,.02,'#68877a',[0,1.004,0]);return;}
  if(k==='board'){if(j==='黒板'){box(g,3.5,1.6,.10,'#507e6c',[0,1.7,0]);box(g,3.6,.13,.2,'#c29d76',[0,.9,.03]);}else box(g,.95,.06,.62,'#dabb91',[0,.06,0]);return;}
  if(k==='bento'||k==='oden'){box(g,1,.13,.72,k==='bento'?'#bb8c79':'#b6c3b4',[0,.1,0]);for(let a=0;a<4;a++){const col=k==='bento'?['#fff0d5','#9fb681','#d39d79','#e5ba83'][a]:'#dbc19b';sphere(g,.18,col,[(a%2-.5)*.45,.25,(Math.floor(a/2)-.5)*.31],[1,.55,1]);}return;}
  if(k==='wateringcan'){cyl(g,.28,.3,.46,'#99bfa9',[0,.25,0]);rod(g,[.23,.23,0],[.65,.46,0],.06,'#99bfa9');mesh(g,'torus',[.23,.035,7,20],'#91b69f',[-.24,.42,0],[0,Math.PI/2,0]);return;}
  if(k==='basin'){cyl(g,.8,.55,.65,'#acb7a3',[0,.37,0]);cyl(g,.68,.68,.025,'#9dcbd0',[0,.70,0]);return;}
  if(k==='shaker'){cyl(g,.17,.18,.5,'#e5ccb2',[0,.28,0]);sphere(g,.19,'#d7a383',[0,.56,0],[1,.4,1]);return;}
  if(k==='mannequin'){cyl(g,.3,.3,.09,'#aeae97',[0,.06,0]);rod(g,[0,.10,0],[0,1.75,0],.04,'#ac9e82');sphere(g,.27,'#d7c7a5',[0,1.33,0],[1,1.65,.6]);return;}
  if(k==='shell'){sphere(g,.38,'#ddbeb4',[0,.12,0],[1,.35,.8]);for(let a=-2;a<=2;a++)rod(g,[0,.15,-.25],[Math.sin(a*.3)*.38,.16,.25],.016,'#caa99c');return;}
  if(k==='coral'){for(let a=-2;a<=2;a++){rod(g,[a*.1,.1,0],[a*.18,.7-Math.abs(a)*.08,0],.045,'#d79c9e');rod(g,[a*.14,.42,0],[a*.14+.13,.55,.06],.035,'#d79c9e');}return;}
  if(k==='entryfloor'){box(g,2.8,.16,2.2,'#c9bca0',[0,.1,0]);box(g,2.8,.12,.6,'#dcc09a',[0,.24,-.8]);return;}
  if(k==='elevator'){box(g,2.8,2.8,.2,'#b7c6ba',[0,1.4,0]);for(const x of [-.67,.67])box(g,1.2,2.5,.10,'#d2d9c7',[x,1.3,.16]);return;}
  if(k==='ticketgate'){box(g,.85,1.0,2.6,'#a6c5ba',[0,.55,0]);box(g,.9,.10,2.7,'#d2d4ba',[0,1.11,0]);box(g,.18,.04,.22,'#9bb3c2',[0,1.18,1]);return;}
  if(family('table lowtable counter bench stool chair',k)){if(k==='chair'||k==='stool')chair(g,k==='chair');else if(k==='counter'){box(g,3,1.2,1.1,colors.wood,[0,.6,0]);box(g,3.15,.15,1.2,colors.lightwood,[0,1.23,0]);}else table(g,k==='bench'?2.4:2,k==='lowtable'?.55:k==='bench'?.65:1,k==='bench'?.7:1.3);return;}
  if(family('shelf bookshelves bookshelf cabinet locker wardrobe clothesrack luggage-rack shelf-support',k)){
   const W=k==='locker'?1.3:2.6,H=2.5;
   box(g,W,.14,.85,colors.lightwood,[0,.08,0]);box(g,W,.14,.85,colors.lightwood,[0,H,0]);box(g,W,H,.10,'#afbe9f',[0,H/2,-.4]);for(const x of [-W/2,W/2])box(g,.12,H,.85,colors.wood,[x,H/2,0]);
   if(k==='clothesrack'){rod(g,[-1,2.1,0],[1,2.1,0],.055,'#a2b6b7');}
   else if(k==='locker'||k==='wardrobe'){const panel=new T.Group();panel.name='opening-panel';panel.position.set(-W/2+.08,0,.44);g.add(panel);box(panel,W-.15,H-.23,.10,'#b6c8b4',[(W-.15)/2,H/2,0]);box(panel,.06,.35,.08,colors.cream,[W*.77-.08,H/2,.07]);g.userData.movingPart='opening-panel';}
   else for(const y of [.75,1.5])box(g,W,.08,.85,colors.lightwood,[0,y,0]);return;
  }
  if(family('sofa train-seat',k)){box(g,2.8,.6,1.2,'#93bab0',[0,.36,0]);box(g,2.8,1.0,.28,'#93bab0',[0,.95,-.45]);for(const x of [-1.28,1.28])box(g,.25,.7,1.25,'#83aa9c',[x,.71,0]);for(const x of [-.64,.64])box(g,1.17,.18,.92,'#b5cdb2',[x,.72,.06]);return;}
  if(family('bed exam-bed futon',k)){box(g,2,.45,3.2,colors.wood,[0,.24,0]);box(g,1.95,.35,3.1,'#fbefda',[0,.61,0]);box(g,1.95,.10,1.8,k==='exam-bed'?'#aeced0':'#aabdb0',[0,.83,.53]);box(g,1.3,.22,.60,'#fff4df',[0,.89,-.98]);if(k==='bed')box(g,2.15,1.0,.16,colors.wood,[0,.57,-1.6]);return;}
  if(family('tv tablet remote payment-terminal register selfcheckout copier coffee-machine atm ticket-machine vending arcade-machine claw-machine photo-booth display',k)){
   if(k==='display'&&/ショー|食材/.test(j)){box(g,2.4,.9,1.1,'#9ec0bd',[0,.45,0]);box(g,2.45,.14,1.15,colors.cream,[0,.94,0]);box(g,2.4,.7,.06,'#b1d8d9',[0,1.35,-.45]);return;}
   if(k==='claw-machine'||k==='display'&&/クレーン/.test(j)){box(g,1.8,.5,1.4,'#c1acd4',[0,.25,0]);box(g,1.8,.22,1.4,'#c1acd4',[0,2.2,0]);for(const x of [-.83,.83])for(const z of [-.63,.63])box(g,.10,1.85,.10,'#c1acd4',[x,1.3,z]);box(g,1.6,1.45,.07,'#b3d7d7',[0,1.25,-.62]);for(const x of [-.4,0,.4])sphere(g,.22,'#e6bb85',[x,.55,0]);rod(g,[0,2.1,0],[0,1.55,0],.035,colors.ink);for(const x of [-.17,.17])rod(g,[0,1.55,0],[x,1.31,0],.035,colors.ink);return;}
   if(k==='photo-booth'||k==='display'){box(g,2.6,2.6,.16,'#d1b8d3',[0,1.3,-1]);for(const x of [-1.2,1.2])box(g,.15,2.6,2,'#d1b8d3',[x,1.3,0]);box(g,2.6,.2,2.2,'#d1b8d3',[0,2.7,0]);label(g,'PHOTO',2,.3,[0,2.32,1.12]);return;}
   if(family('atm ticket-machine vending arcade-machine selfcheckout coffee-machine',k)){box(g,1.6,2.1,1.0,k==='vending'?'#9cc8b7':k==='arcade-machine'?'#bfaaca':'#8bbac5',[0,1.06,0]);box(g,1.15,.94,.06,colors.ink,[0,1.39,.53]);box(g,1.03,.8,.025,'#b6d7d5',[0,1.4,.57]);for(const x of [-.35,0,.35])box(g,.20,.16,.08,colors.cream,[x,.67,.56]);if(k==='vending')for(let n=0;n<6;n++){const b=group(null,[n%3*.31-.31,1.16+Math.floor(n/3)*.33,.60],0,g);b.scale.setScalar(.22);bottle(b,{color:['#e4a38f','#b4c892','#e5c782'][n%3]});}return;}
   if(k==='copier'){box(g,1.1,.65,.85,'#d3ded0',[0,.35,0]);box(g,1.0,.12,.77,colors.ink,[0,.74,0]);return;}
   if(k==='tablet'||k==='remote'){box(g,k==='tablet'?.75:.3,.075,k==='tablet'?.52:.6,colors.ink,[0,.07,0]);box(g,k==='tablet'?.65:.22,.015,k==='tablet'?.43:.46,'#aacbc9',[0,.118,0]);return;}
   screen(g,k==='register'?.7:1.4,k==='register'?.45:.87);return;
  }
  if(family('bottle pumpbottle sakeflask eyedrops',k)){bottle(g,w,k==='pumpbottle');return;}
  if(family('packet carton parcel gift ricebag tissue paperroll tube yogurt capsules medicine pills bandage bandage-strip battery smallblock',k)){
   if(k==='paperroll'||k==='bandage'){cyl(g,.3,.3,.40,'#fff0d7',[0,.22,0],[Math.PI/2,0,0]);cyl(g,.08,.08,.41,'#b49d80',[0,.22,0],[Math.PI/2,0,0]);}
   else if(k==='pills'||k==='capsules'||k==='medicine'){box(g,.64,.08,.44,'#dce2d6',[0,.06,0]);for(const x of [-.21,0,.21])for(const z of [-.11,.11])sphere(g,.07,k==='capsules'?'#d5a6b4':'#f8ebd4',[x,.13,z],[.7,.5,1.4]);}
   else if(k==='tube'){box(g,.25,.64,.15,c,[0,.34,0]);box(g,.28,.13,.17,colors.cream,[0,.075,0]);box(g,.20,.26,.016,'#fff1d2',[0,.4,.088]);}
   else{const color=w.color||['#aac6ab','#e7b99d','#b6bed6','#e2c689'][Array.from(j).reduce((n,c)=>n+c.charCodeAt(0),0)%4];box(g,k==='smallblock'?.55:.62,k==='smallblock'?.17:.72,.40,color,[0,k==='smallblock'?.12:.39,0]);if(k!=='smallblock')box(g,.43,.35,.018,'#fff4db',[0,.4,.214]);}
   return;
  }
  if(family('tea mug cup beer kettle teapot',k)){if(k==='kettle'||k==='teapot'){sphere(g,.39,c,[0,.40,0],[1,.8,1]);cyl(g,.15,.15,.08,colors.cream,[0,.74,0]);rod(g,[.2,.4,0],[.6,.5,0],.07,c);mesh(g,'torus',[.25,.04,8,20],c,[-.3,.4,0],[0,Math.PI/2,0]);}else{cup(g,k==='beer'?'#e1c88a':c);if(k==='mug'||k==='beer')mesh(g,'torus',[.17,.04,8,20],c,[.26,.3,0],[0,Math.PI/2,0]);}return;}
  if(family('sushi roll onigiri meat sashimi edamame rice soup bowl cupnoodle fried eggroll bread bun sandwich sweet chocolate candy icecream ice skewer eggs tofu cheese ginger pickles petals paste roe seaweed sheet vegetables',k)){food(g,w);return;}
  if(family('apple banana carrot cabbage cucumber daikon eggplant grapes leafygreen lemon lettuce onion orange peach pear pepper potato strawberry tomato watermelon',k)){plate(g);if(k==='banana'){for(const x of [-.13,.13])sphere(g,.24,'#eed07b',[x,.23,0],[.6,.55,1.8]);}else if(family('carrot cucumber daikon eggplant',k)){sphere(g,.24,k==='carrot'?'#dc9c64':k==='eggplant'?'#9684ac':k==='daikon'?'#f5e9cb':'#8caf78',[0,.2,0],[.65,.55,1.8]);}else if(k==='grapes'){for(let i=0;i<8;i++)sphere(g,.12,'#b09cbd',[(i%3-1)*.16,.18+Math.floor(i/3)*.12,(i%2-.5)*.12]);}else{const col=family('tomato apple strawberry',k)?'#da9186':family('lemon orange peach',k)?'#ebbc78':'#a9bb80';sphere(g,.30,col,[0,.33,0],[1,.95,1]);rod(g,[0,.59,0],[.04,.71,0],.025,'#7c986d');}return;}
  if(family('plate tray pan pot bucket tub basket',k)){if(k==='plate')plate(g);else if(k==='tray')box(g,.95,.08,.62,colors.wood,[0,.05,0]);else if(k==='pan'){cyl(g,.39,.33,.12,colors.ink,[0,.09,0]);rod(g,[.3,.13,0],[.95,.15,0],.065,colors.wood);}else if(k==='pot'){cyl(g,.40,.4,.46,colors.ink,[0,.25,0]);cyl(g,.43,.43,.05,colors.cream,[0,.51,0]);for(const x of [-.47,.47])box(g,.2,.1,.15,colors.wood,[x,.38,0]);}else{box(g,.86,.55,.65,k==='basket'?'#c5b38e':'#acd1c7',[0,.3,0]);box(g,.75,.07,.54,'#667d6c',[0,.61,0]);for(const x of [-.4,.4])rod(g,[x,.5,0],[x,.9,0],.035,colors.wood);rod(g,[-.4,.9,0],[.4,.9,0],.035,colors.wood);}return;}
  if(family('chopsticks tongs pen straw thermometer brush toothbrush knife ladle dipper scissors opener ruler',k)){
   if(k==='scissors'){for(const x of [-1,1]){mesh(g,'torus',[.1,.022,6,16],'#91b6bb',[x*.13,.04,.22],[Math.PI/2,0,0]);rod(g,[x*.1,.03,.13],[-x*.07,.03,-.35],.018,'#98aeb1');}}
   else if(family('ladle dipper',k)){rod(g,[0,.07,-.4],[0,.08,.3],.032,colors.wood);sphere(g,.18,'#c6b79d',[0,.075,.38],[1,.22,1]);}
   else if(k==='knife'){box(g,.11,.04,.6,'#b6c7c2',[0,.04,-.09]);box(g,.13,.07,.28,colors.wood,[0,.05,.35]);}
   else{for(const x of k==='chopsticks'||k==='tongs'?[-.09,.09]:[0])rod(g,[x,.06,-.42],[x,.06,.42],k==='ruler'?.055:.025,k==='toothbrush'?'#94bbca':colors.wood);if(k==='toothbrush')box(g,.11,.055,.23,colors.cream,[0,.10,-.32]);}return;
  }
  if(family('book paper card menu sign room-sign exit-sign station-sign price poster route-map schedule departure-board scoreboard eye-chart xray scroll barcode roadsign parking-sign woodtablet ema',k)){
   if(k==='book'){box(g,.66,.14,.89,c,[0,.09,0]);box(g,.6,.09,.83,'#f8eed7',[.02,.1,.01]);box(g,.66,.03,.89,c,[0,.17,0]);box(g,.36,.005,.13,'#efe1bb',[0,.189,-.2]);}
   else if(k==='paper'||k==='card'){box(g,k==='card'?.56:.72,.02,k==='card'?.34:.93,'#fff0d6',[0,.025,0]);for(let i=0;i<3;i++)box(g,.40,.004,.015,'#91a698',[0,.039,-.1+i*.1]);}
   else{const W=k==='menu'?1.0:1.8,H=k==='menu'?1.25:1.1;box(g,W+.1,H+.1,.08,colors.wood,[0,H/2+.2,0]);label(g,j,W,H,[0,H/2+.2,.06],0,'#fff0d3','#46665c');for(const x of [-W*.35,W*.35])box(g,.07,.3,.08,colors.wood,[x,.15,0]);}
   return;
  }
  if(family('headphones glasses goggles ring lifering beads belt strap leash wire sacredrope bellrope rope',k)){mesh(g,'torus',[k==='lifering'?.58:.3,k==='lifering'?.12:.045,9,26],c,[0,.12,0],[Math.PI/2,0,0]);if(k==='headphones')for(const x of [-.3,.3])box(g,.13,.18,.2,colors.ink,[x,.15,0]);if(k==='glasses'||k==='goggles'){mesh(g,'torus',[.17,.025,7,20],colors.ink,[.25,.04,0],[Math.PI/2,0,0]);}return;}
  if(family('shirt blouse coat tshirt sweater cardigan jacket suit dress kimono yukata pajamas underwear pants skirt swimsuit socks shoes slippers boots cap hat helmet tie gloves scarf blanket towel cushion pillow mask fan backpack handbag wallet shoppingbag suitcase',k)){
   if(family('shirt blouse coat tshirt sweater cardigan jacket suit dress kimono yukata pajamas',k)){box(g,.68,.86,.17,c,[0,.48,0]);for(const x of [-1,1])box(g,.36,.48,.16,c,[x*.42,.7,0],[0,0,x*.35]);box(g,.04,.72,.018,colors.cream,[0,.48,.10]);if(family('kimono yukata',k))box(g,.75,.12,.2,colors.pink,[0,.4,0]);}
   else if(family('pants skirt swimsuit underwear',k)){box(g,.6,.38,.18,c,[0,.65,0]);for(const x of [-.16,.16])box(g,.28,.56,.2,c,[x,.26,0]);}
   else if(family('shoes slippers boots socks',k)){for(const x of [-.22,.22]){box(g,.31,.23,.7,c,[x,.14,0]);box(g,.31,k==='boots'?.6:.13,.3,c,[x,k==='boots'?.45:.26,-.18]);}}
   else if(family('hat helmet cap',k)){cyl(g,.5,.5,.06,c,[0,.04,0]);sphere(g,.33,c,[0,.14,0],[1,.75,1]);}
   else if(family('backpack handbag shoppingbag suitcase wallet',k)){box(g,.76,.88,.32,c,[0,.49,0]);mesh(g,'torus',[.21,.045,8,20],colors.wood,[0,.91,0]);box(g,.46,.24,.08,colors.cream,[0,.40,.2]);}
   else{box(g,k==='blanket'?1.2:.73,.12,k==='blanket'?.95:.55,c,[0,.09,0]);if(k==='mask')for(const x of [-.42,.42])mesh(g,'torus',[.11,.016,6,14],colors.cream,[x,.08,0],[Math.PI/2,0,0]);}return;
  }
  if(family('ball basketball volleyball soccerball paddle racket shuttle dumbbell barbell log floatboard whistle stopwatch',k)){
   if(family('ball basketball volleyball soccerball',k)){sphere(g,.35,k==='basketball'?'#d9a16c':k==='soccerball'?'#e6e1cf':c,[0,.38,0]);if(k==='soccerball')for(const x of [-.17,.17])sphere(g,.1,colors.ink,[x,.54,.25],[1,.6,.45]);}
   else if(k==='racket'||k==='paddle'){mesh(g,'torus',[.27,.04,8,24],'#dfaa86',[0,.06,-.15],[Math.PI/2,0,0]);for(let i=-2;i<=2;i++)rod(g,[-.23,.055,-.15+i*.085],[.23,.055,-.15+i*.085],.008,'#d4ded0');rod(g,[0,.06,.11],[0,.06,.65],.035,'#9db3b3');}
   else if(k==='shuttle'){mesh(g,'cone',[.23,.4,10],'#f2e8d2',[0,.27,0],[0,0,Math.PI]);sphere(g,.11,'#c2b89e',[0,.08,0]);}
   else if(k==='dumbbell'||k==='barbell'){const w=k==='barbell'?1.8:.65;rod(g,[-w/2,.23,0],[w/2,.23,0],.045,colors.ink);for(const x of [-w*.42,w*.42])cyl(g,.23,.23,.18,'#7d919c',[x,.23,0],[0,0,Math.PI/2]);}
   else if(k==='stopwatch'){cyl(g,.25,.25,.09,colors.cream,[0,.1,0],[Math.PI/2,0,0]);rod(g,[0,.13,0],[0,.13,-.15],.012,colors.ink);}
   else cyl(g,.16,.16,.7,c,[0,.18,0],[Math.PI/2,0,0]);return;
  }
  if(family('fish clownfish shark ray seahorse garden-eel squid octopus jellyfish urchin starfish crab shrimp seal penguin turtle dog cat stone-dog plush',k)){animal(g,k,w.color);return;}
  if(family('flowerpot planter bouquet vase tree pine bamboo branch garden moss',k)){
   if(k==='tree'||k==='pine'){cyl(g,.20,.30,2,'#ab8061',[0,1,0]);for(const [x,y,z,r]of[[0,2.7,0,1.1],[-.55,2.4,0,.7],[.6,2.35,.3,.8]])sphere(g,r,c,[x,y,z]);}
   else if(k==='bamboo'){for(const x of [-.3,0,.3]){cyl(g,.065,.065,2.6,'#91b38a',[x,1.3,0]);for(let h=.3;h<2.6;h+=.4)cyl(g,.074,.074,.05,'#739876',[x,h,0]);}}
   else plant(g,k==='bouquet');return;
  }
  if(family('fridge freezer washer microwave ricecooker stove sink toilet bathtub pool pond tank shower tap vacuum scale bloodpressure stethoscope syringe ivstand firstaid heightmeter',k)){
   if(k==='fridge'||k==='freezer'){const h=2;box(g,1.5,.12,1.3,'#d7dfcd',[0,.06,0]);box(g,1.5,.12,1.3,'#d7dfcd',[0,h-.06,0]);box(g,1.5,h,.12,'#c4d4ca',[0,h/2,-.6]);for(const x of [-.69,.69])box(g,.12,h,1.3,'#d7dfcd',[x,h/2,0]);for(const y of [.5,1.05,1.55])box(g,1.3,.055,1.16,'#edf0d9',[0,y,0]);for(const x of [-.37,.05,.4])cyl(g,.1,.1,.32,'#b8c992',[x,.68,.25]);const panel=new T.Group();panel.name='opening-panel';panel.position.set(-.7,0,.69);g.add(panel);box(panel,1.4,h-.12,.11,'#e2e4d2',[.70,h/2,0]);box(panel,.06,.42,.08,colors.wood,[1.18,h/2,.11]);g.userData.movingPart='opening-panel';return;}
   if(family('washer microwave',k)){const h=k==='microwave'?.8:2;box(g,1.5,h,1.3,k==='washer'?'#b1c9ca':'#d7dfcd',[0,h/2,0]);if(k==='washer'){cyl(g,.51,.51,.13,colors.cream,[0,.95,.7],[Math.PI/2,0,0]);cyl(g,.39,.39,.145,'#86b0be',[0,.95,.76],[Math.PI/2,0,0]);}else{box(g,1.35,h-.18,.06,k==='microwave'?'#6c929b':'#e2e4d2',[0,h/2,.69]);box(g,.06,.42,.08,colors.wood,[.45,h/2,.75]);}return;}
   if(k==='ricecooker'){sphere(g,.55,'#e1e2ca',[0,.43,0],[1,.8,.9]);box(g,.9,.08,.72,colors.cream,[0,.74,0]);return;}
   if(k==='stove'){box(g,1.9,.28,1.1,colors.ink,[0,.17,0]);for(const x of [-.5,.5])mesh(g,'torus',[.3,.035,8,20],colors.cream,[x,.33,0],[Math.PI/2,0,0]);return;}
   if(k==='sink'||k==='bathtub'||k==='pool'||k==='pond'||k==='tank'){const W=k==='sink'?2:k==='tank'?4.8:4,D=k==='tank'?1.6:k==='sink'?1.2:2.8,H=k==='tank'?2.4:k==='sink'?1.05:.55;box(g,W,.16,D,'#a8c8c0',[0,.1,0]);for(const x of [-W/2,W/2])box(g,.18,H,D,'#a8c8c0',[x,H/2,0]);for(const z of k==='tank'?[-D/2]:[-D/2,D/2])box(g,W,H,.15,'#a8c8c0',[0,H/2,z]);box(g,W-.3,.07,D-.25,'#8fc5d4',[0,k==='tank'?.2:H*.72,0]);if(k==='tank'){box(g,W-.25,H-.25,.05,'#75afbd',[0,H/2,-D/2+.12]);const glass=box(g,W-.2,H-.2,.025,'#aadbdc',[0,H/2,D/2],undefined,{transparent:true,opacity:.13,depthWrite:false});glass.userData.surfaceKind='glass';for(const y of [.1,H-.04])box(g,W,.08,.10,'#bad5ce',[0,y,D/2]);}if(k==='sink')rod(g,[.65,1.1,-.3],[.65,1.5,0],.055,colors.ink);return;}
   if(k==='shower'||k==='tap'){rod(g,[0,.1,0],[0,2.2,0],.055,'#a1b9bc');rod(g,[0,2.2,0],[0,2.2,.5],.055,'#a1b9bc');cyl(g,.18,.18,.05,'#afc7c3',[0,2.17,.5]);return;}
   if(k==='toilet'){sphere(g,.4,colors.cream,[0,.4,0],[1,.5,1.4]);box(g,.75,.9,.3,colors.cream,[0,.5,-.45]);return;}
   if(k==='ivstand'||k==='heightmeter'){rod(g,[0,.1,0],[0,2,0],.04,'#a1b9bc');box(g,.55,.1,.55,colors.ink,[0,.06,0]);box(g,.35,.5,.12,'#d4e4d9',[.2,1.65,0]);return;}
   if(k==='firstaid'){box(g,.9,.6,.5,colors.cream,[0,.32,0]);box(g,.4,.1,.025,colors.red,[0,.35,.27]);box(g,.1,.4,.025,colors.red,[0,.35,.27]);return;}
   if(k==='stethoscope'){mesh(g,'torus',[.3,.025,8,20],colors.ink,[0,.06,0],[Math.PI/2,0,0]);cyl(g,.11,.11,.05,'#aec4ba',[.3,.05,.2]);return;}
   if(k==='syringe'){cyl(g,.065,.065,.5,'#a7c6bf',[0,.08,0],[Math.PI/2,0,0]);rod(g,[0,.08,.2],[0,.08,.5],.007,colors.ink);return;}
   box(g,.65,.12,.55,'#b0c6b7',[0,.08,0]);box(g,.35,.015,.15,colors.cream,[0,.15,-.1]);return;
  }
  if(family('bicycle bike wheelchair cart',k)){for(const z of [-.7,.7])mesh(g,'torus',[.47,.055,9,24],colors.ink,[0,.50,z],[0,Math.PI/2,0]);rod(g,[0,.5,-.7],[0,1.05,0],.055,c);rod(g,[0,1.05,0],[0,.5,.7],.055,c);box(g,.48,.1,.32,colors.wood,[0,1.25,-.15]);rod(g,[0,1.2,.6],[0,1.5,.6],.04,c);if(k==='cart'||k==='wheelchair')box(g,.9,.65,1.1,'#9cbabd',[0,.87,0]);return;}
  if(k==='net'&&j==='網'){box(g,.92,.035,.65,'#9aafa7',[0,.03,0]);for(let a=-3;a<=3;a++){rod(g,[-.43,.056,a*.095],[.43,.056,a*.095],.008,'#edf0dc');rod(g,[a*.13,.056,-.30],[a*.13,.056,.30],.008,'#edf0dc');}return;}
  if(family('basketgoal pingpong treadmill net court',k)){if(k==='basketgoal'){rod(g,[0,0,0],[0,3.7,0],.10,'#a8bcb8');box(g,1.7,1.1,.10,colors.cream,[0,3.4,.1]);mesh(g,'torus',[.4,.045,8,28],colors.red,[0,2.95,.65],[Math.PI/2,0,0]);}else if(k==='pingpong'){box(g,3.5,.17,2.2,'#7fb0b6',[0,1,0]);box(g,.05,.6,2.2,'#e4e5d4',[0,1.34,0]);for(const x of [-1.4,1.4])for(const z of [-.8,.8])box(g,.1,.95,.1,colors.ink,[x,.48,z]);}else if(k==='net'){for(const x of [-2,2])rod(g,[x,0,0],[x,2,0],.06,'#a7bab4');for(let y=.7;y<=1.95;y+=.2)rod(g,[-2,y,0],[2,y,0],.012,'#eff1dd');for(let x=-2;x<=2;x+=.25)rod(g,[x,.7,0],[x,2,0],.012,'#eff1dd');}else if(k==='treadmill'){box(g,1.4,.20,2.8,colors.ink,[0,.16,0]);box(g,1.0,.025,2.1,'#80978c',[0,.28,.25]);for(const x of [-.55,.55])rod(g,[x,.2,-1],[x,1.6,-.9],.055,colors.mint);box(g,1.3,.4,.16,colors.blue,[0,1.7,-.95]);}else box(g,4,.025,2.8,'#87b9a6',[0,.025,0]);return;}
  if(family('door shoji fusuma',k)){const W=1.9,H=2.6;for(const x of [-W/2,W/2])box(g,.12,H+.16,.22,colors.wood,[x,H/2,0]);box(g,W+.2,.14,.22,colors.wood,[0,H+.03,0]);const panel=new T.Group();panel.name='opening-panel';g.add(panel);const sliding=k!=='door';panel.position.set(sliding?0:-W/2+.08,0,0);const cx=sliding?0:(W-.16)/2;box(panel,W-.16,H-.05,.08,k==='shoji'?'#eee9cd':k==='fusuma'?'#d8cbbb':'#a6c9c2',[cx,H/2,0]);if(k==='shoji'){for(const y of [.6,1.2,1.8,2.4])box(panel,W-.16,.04,.095,colors.wood,[cx,y,0]);for(const dx of [-.5,0,.5])box(panel,.04,H,.095,colors.wood,[cx+dx,H/2,0]);}box(panel,.07,.18,.07,colors.wood,[cx+.61,1.2,.08]);g.userData.movingPart='opening-panel';g.userData.sliding=sliding;return;}
  if(family('train-door gateleaf fittingroom partition window-shell train-window mirror roundmirror curtain noren',k)){
   if(k==='mirror'||k==='roundmirror'){box(g,1.6,2.2,.10,colors.wood,[0,1.2,0]);box(g,1.4,2,.03,'#b6d9d6',[0,1.2,.07]);}
   else{const width=k==='partition'?2.8:1.9,height=k==='noren'?1.2:2.6;box(g,width,height,.08,k==='noren'||k==='curtain'?'#b5b4cd':'#a6c9c2',[0,height/2,0]);for(const x of [-width/2,0,width/2])box(g,.08,height+.1,.15,colors.wood,[x,height/2,.025]);box(g,width+.2,.12,.18,colors.wood,[0,height+.02,0]);}
   return;
  }
  if(family('lamp lighting-shell lantern candle candlestand bell drum microphone speaker hairdryer clock alarmclock camera',k)){
   if(k==='lamp'||k==='lighting-shell'){rod(g,[0,0,0],[0,2.6,0],.075,colors.wood);mesh(g,'cone',[.52,.6,12],colors.cream,[0,2.65,0]);}
   else if(k==='lantern'){cyl(g,.43,.43,.85,colors.pink,[0,.5,0]);for(const y of [.09,.93])cyl(g,.35,.35,.09,colors.wood,[0,y,0]);for(let y=.2;y<.9;y+=.13)mesh(g,'torus',[.436,.009,5,24],'#d9979c',[0,y,0],[Math.PI/2,0,0]);}
   else if(k==='bell'){cyl(g,.23,.39,.55,'#c8b274',[0,.37,0]);sphere(g,.07,colors.wood,[0,.06,0]);}
   else if(k==='drum'){cyl(g,.42,.42,.55,colors.wood,[0,.33,0]);for(const y of [.055,.61])cyl(g,.44,.44,.05,colors.cream,[0,y,0]);}
   else if(k==='clock'||k==='alarmclock'){cyl(g,.52,.52,.12,'#bdd0b8',[0,.60,0],[Math.PI/2,0,0]);cyl(g,.46,.46,.014,colors.cream,[0,.60,.075],[Math.PI/2,0,0]);rod(g,[0,.60,.091],[0,.91,.091],.018,colors.ink);rod(g,[0,.60,.095],[.24,.50,.095],.018,colors.ink);}
   else if(k==='speaker'){box(g,.6,1,.5,colors.ink,[0,.52,0]);for(const y of [.34,.75])cyl(g,.18,.18,.03,'#8ba8a6',[0,y,.27],[Math.PI/2,0,0]);}
   else if(k==='camera'){box(g,.68,.42,.33,colors.ink,[0,.24,0]);cyl(g,.17,.17,.18,'#a8c2bb',[.1,.24,.22],[Math.PI/2,0,0]);}
   else if(k==='hairdryer'){cyl(g,.15,.19,.52,c,[0,.45,0],[Math.PI/2,0,0]);box(g,.13,.39,.15,c,[0,.24,0]);}
   else if(k==='microphone'){cyl(g,.07,.07,.5,colors.ink,[0,.27,0]);sphere(g,.15,'#93a9b0',[0,.61,0]);}
   else{cyl(g,.09,.1,.7,colors.cream,[0,.38,0]);sphere(g,.09,'#edbd79',[0,.80,0],[.6,1.6,.6]);}return;
  }
  if(family('broom dustpan umbrella umbrella-stand hanger rake cane pole rod ladder rail',k)){
   if(k==='umbrella'){rod(g,[0,0,0],[0,1.6,0],.035,colors.wood);mesh(g,'cone',[.65,.3,12],colors.blue,[0,1.68,0]);}
   else if(k==='umbrella-stand'){box(g,.65,.78,.6,'#aac2b3',[0,.42,0]);for(const x of [-.17,.17])rod(g,[x,.5,0],[x,1.2,.08],.025,colors.wood);}
   else if(k==='hanger'){rod(g,[-.4,.06,0],[0,.34,0],.025,colors.wood);rod(g,[0,.34,0],[.4,.06,0],.025,colors.wood);rod(g,[-.4,.06,0],[.4,.06,0],.025,colors.wood);}
   else if(k==='ladder'||k==='rail'){for(const x of [-.5,.5])rod(g,[x,0,0],[x,2,0],.045,colors.wood);for(let y=.2;y<2;y+=.35)rod(g,[-.5,y,0],[.5,y,0],.035,colors.wood);}
   else{rod(g,[0,.1,0],[0,1.3,0],.03,colors.wood);box(g,k==='dustpan'?.6:.55,.16,k==='dustpan'?.5:.12,'#c9bb82',[0,.10,.1]);}return;
  }
  if(family('train bus car',k)){const L=k==='train'?6.8:k==='bus'?4.5:3.5;box(g,1.8,1.9,L,'#e8e7d2',[0,1.05,0]);box(g,1.86,.35,L+.05,'#93bbab',[0,.88,0]);for(const x of [-.94,.94])for(let i=0;i<Math.floor(L/1.2);i++)box(g,.03,.68,.85,'#83b0bf',[x,1.6,-L/2+.7+i*1.2]);for(const x of [-.88,.88])for(const z of [-L*.33,L*.33])cyl(g,.30,.30,.14,colors.ink,[x,.31,z],[0,0,Math.PI/2]);return;}
  if(family('templegate torii shrinehall templehall bellhouse roof arch',k)){if(k==='shrinehall'||k==='templehall'){building(g,k);roof(g,4.3,3.3,3.2,'#6e8e89');for(const x of [-1.6,1.6])cyl(g,.12,.12,2.3,colors.wood,[x,1.3,1.5]);}else if(k==='roof')roof(g,3.8,2.8,1);else{for(const x of [-1.5,1.5])cyl(g,.14,.18,2.8,k==='torii'?'#d98d77':colors.wood,[x,1.4,0]);box(g,3.7,.22,.25,k==='torii'?'#d98d77':colors.wood,[0,2.8,0]);box(g,3.3,.15,.20,k==='torii'?'#d98d77':colors.wood,[0,2.3,0]);if(k!=='torii')roof(g,3.7,1.3,3.05);}return;}
  if(family('stall shop koban alcove emarack deck plinth platform steps bridge offering offeringtray fortunebox monument buddha stone-lantern incense-bowl incense fortunebox fortune',k)){
   if(k==='stall'){box(g,3,1,1.3,colors.wood,[0,.5,0]);for(const x of [-1.4,1.4])box(g,.12,2.5,.12,colors.wood,[x,1.25,-.5]);roof(g,3,1.5,2.65,'#dca489');}
   else if(k==='shop'||k==='koban')building(g,k);
   else if(k==='steps'||k==='bridge'||k==='deck'||k==='platform'){for(let i=0;i<3;i++)box(g,2.6,.2,1.4,'#c8b18c',[0,.1+i*.18,-i*.5]);}
   else if(k==='buddha'){sphere(g,.58,'#d3bb77',[0,.55,0],[1,.75,.75]);sphere(g,.34,'#d3bb77',[0,1.22,0]);for(const x of [-.12,.12])box(g,.09,.016,.02,'#967d54',[x,1.22,.32]);}
   else if(k==='stone-lantern'){box(g,.6,.15,.6,'#afbdac',[0,.1,0]);box(g,.18,.85,.18,'#afbdac',[0,.55,0]);box(g,.58,.5,.5,'#b3c0ae',[0,1.10,0]);roof(g,.75,.65,1.53,'#9bab9b');}
   else if(k==='incense-bowl'){bowl(g,'#baab86');for(const x of [-.12,0,.12])rod(g,[x,.2,0],[x,.6,0],.012,'#947665');}
   else if(k==='incense'){for(const x of [-.08,0,.08])rod(g,[x,.05,-.3],[x,.05,.3],.009,colors.wood);}
   else if(k==='monument'){box(g,.8,1.8,.3,'#b4bdaa',[0,.94,0]);label(g,j,.6,1.0,[0,1,.17]);}
   else{box(g,1.4,.85,1,colors.wood,[0,.45,0]);for(let x=-.5;x<=.5;x+=.15)box(g,.06,.08,.86,colors.cream,[x,.91,0]);}return;
  }
  if(family('floor ground wall wall-shell path road tatami mat sand gravel rock roof-tile line tactile drain manhole gutter pillar glass crosswalk tracks bike-rack utilitypole trafficlight postbox mailbox busstop flag paper-streamer footprint footprints outlet button key coins stamp ribbon opener awning cart',k)){
   if(k==='wall'||k==='wall-shell')box(g,2.6,1.3,.2,'#e5d7ba',[0,.68,0]);
   else if(k==='postbox'||k==='mailbox'){box(g,.8,1,.65,'#d98f80',[0,.95,0]);cyl(g,.10,.14,.6,'#929d89',[0,.3,0]);label(g,'〒',.5,.3,[0,1,.34],0,'#d98f80','#fff1dc');box(g,.5,.065,.03,colors.ink,[0,1.24,.35]);}
   else if(k==='trafficlight'){rod(g,[0,0,0],[0,2.7,0],.065,colors.ink);box(g,1.0,.4,.24,colors.ink,[0,2.6,0]);for(const [x,c]of[[-.3,'#9dc5a7'],[0,'#e7c688'],[.3,'#d99789']])sphere(g,.12,c,[x,2.6,.14],[1,1,.4]);}
   else if(k==='utilitypole'||k==='pillar'){cyl(g,.12,.17,3,'#a6b3a1',[0,1.5,0]);if(k==='utilitypole')for(const y of [2.4,2.8])box(g,1.6,.12,.12,colors.ink,[0,y,0]);}
   else if(k==='rock'||k==='sand'||k==='gravel'){sphere(g,.55,k==='rock'?'#b4baa5':'#ddc694',[0,.30,0],[1,.55,1.2]);}
   else if(k==='coins'||k==='stamp'||k==='button'||k==='manhole')cyl(g,.24,.24,.07,k==='coins'?'#d9bb79':colors.wood,[0,.05,0]);
   else{box(g,1.5,.06,1.1,k==='tatami'?'#b9c49b':k==='glass'?'#b1d4d0':colors.lightwood,[0,.05,0]);if(k==='crosswalk'||k==='tracks')for(let i=-2;i<3;i++)box(g,.11,.02,1.0,'#fff0d4',[i*.28,.10,0]);}
   return;
  }

  if(k==='amulet'){box(g,.42,.63,.14,'#d2abc2',[0,.34,0]);label(g,'守',.27,.32,[0,.37,.08],0,'#d2abc2','#fff0d2');mesh(g,'torus',[.09,.012,6,18],colors.cream,[0,.74,0]);return;}
  if(k==='castle'||k==='tower'){
   if(k==='castle'){box(g,3.6,2.5,2.0,'#f0d6c6',[0,1.25,0]);box(g,.9,1.7,.15,'#b89f9e',[0,.9,1.1]);}
   for(const x of k==='castle'?[-2,-.8,.8,2]:[0]){const h=Math.abs(x)>1?2.8:4.2;cyl(g,.43,.49,h,'#edd8c2',[x,h/2,-.1]);mesh(g,'cone',[.65,1.15,16],'#90abc8',[x,h+.53,-.1]);box(g,.25,.62,.05,'#a5bfd0',[x,h-.7,.34]);rod(g,[x,h+1,-.1],[x,h+1.55,-.1],.025,'#b49c7b');box(g,.35,.20,.035,'#e6a6ae',[x+.17,h+1.46,-.1]);}
   return;
  }
  if(k==='coaster'){
   const pts=[];for(let i=0;i<48;i++){const a=i/47*Math.PI*2;pts.push([Math.cos(a)*3,1.25+Math.sin(a*2)*.85,Math.sin(a)*1.7]);}
   for(let i=1;i<pts.length;i++)for(const dx of [-.18,.18])rod(g,[pts[i-1][0]+dx,pts[i-1][1],pts[i-1][2]],[pts[i][0]+dx,pts[i][1],pts[i][2]],.04,'#bba3c7');
   for(let i=0;i<pts.length;i+=6)rod(g,[pts[i][0],0,pts[i][2]],pts[i],.07,'#adbdaf');
   box(g,.7,.34,1,'#e2b48d',[3,1.47,0]);return;
  }
  if(k==='carousel'){
   cyl(g,2.0,2.0,.18,'#d9b8c5',[0,.14,0]);cyl(g,.16,.20,2.8,'#d8b985',[0,1.5,0]);mesh(g,'cone',[2.2,.85,20],'#a3c7c3',[0,3,0]);
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=Math.cos(a)*1.4,z=Math.sin(a)*1.4;rod(g,[x,.2,z],[x,2.85,z],.04,'#dec496');const h=group(null,[x,.55,z],0,g);h.scale.setScalar(.55);model(h,{kind:'horse'});}return;
  }
  if(k==='horse'||k==='dinosaur'){
   const d=k==='dinosaur',col=d?'#97b59a':'#d6b99a';sphere(g,.6,col,[0,.85,0],[d?1.25:.85,.7,1.5]);sphere(g,.34,col,[0,1.5,.65],[.7,1,.95]);for(const x of [-.33,.33])for(const z of [-.5,.4])rod(g,[x,.65,z],[x,.08,z],.09,col);rod(g,[0,.85,-.6],[0,d?.5:1.1,-1.4],d?.12:.055,col);for(const x of [-.18,.18])sphere(g,.035,colors.ink,[x,1.58,.9]);return;
  }
  if(k==='boat'||k==='harbor'){
   box(g,1.7,.34,3.6,'#acbaae',[0,.35,0]);for(const x of [-.85,.85])box(g,.15,.65,3.1,'#d1b18a',[x,.6,0]);for(const z of [-1.6,1.6])box(g,1.8,.65,.16,'#d1b18a',[0,.6,z]);for(const z of [-.7,.5])box(g,1.6,.12,.42,'#dfc398',[0,.64,z]);return;
  }
  if(k==='rocket'||k==='spaceship'){
   cyl(g,.6,.6,1.9,'#e4e4cf',[0,1.25,0]);mesh(g,'cone',[.6,.9,18],'#dcb0b9',[0,2.65,0]);for(const x of [-.66,.66])box(g,.25,.7,.7,'#a2bbc9',[x,.5,0],[0,0,x*.25]);cyl(g,.28,.28,.07,'#8fb9c3',[0,1.7,.57],[Math.PI/2,0,0]);return;
  }
  if(k==='globe'){sphere(g,1.4,'#93c4d0',[0,1.9,0]);for(let i=0;i<8;i++){const a=i*2.4;sphere(g,.40,'#b4c999',[Math.sin(a)*1.17,1.9+Math.cos(i)*.63,Math.cos(a)*1.06],[1,.55,.25]);}cyl(g,1,1.2,.45,'#c9cdb3',[0,.26,0]);return;}
  if(k==='mushroom'){cyl(g,.3,.32,.8,'#efe2c4',[0,.42,0]);sphere(g,.74,'#d6a395',[0,.94,0],[1,.57,1]);for(const x of [-.34,.2])sphere(g,.14,'#fff1d4',[x,1.16,.36],[1,.25,1]);return;}
  if(k==='stroller'||k==='kart'){
   box(g,.85,.35,1.2,c,[0,.55,0]);for(const x of [-.47,.47])for(const z of [-.43,.43])cyl(g,.22,.22,.12,colors.ink,[x,.25,z],[0,0,Math.PI/2]);box(g,.8,.58,.18,'#d1c3d5',[0,.86,-.42]);if(k==='stroller')rod(g,[-.43,.9,-.5],[-.43,1.4,-.8],.035,colors.wood);return;
  }
  if(k==='fountain'){cyl(g,1.7,1.8,.33,'#cfceb4',[0,.2,0]);cyl(g,1.55,1.55,.035,'#a6d1d0',[0,.4,0]);cyl(g,.4,.5,1.3,'#dcd2b2',[0,.8,0]);for(let i=0;i<7;i++){const a=i*6.28/7;rod(g,[0,1.6,0],[Math.cos(a)*.9,.55,Math.sin(a)*.9],.03,'#c1e2d8');}return;}
  if(k==='waterfall'||k==='river'||k==='splash'){if(k==='waterfall'){box(g,2.3,2.5,.6,'#a4b99c',[0,1.25,0]);box(g,1.8,2.5,.07,'#9ac9d1',[0,1.30,.36]);}else box(g,3,.06,1.5,'#9bcbd3',[0,.05,0]);for(let i=-2;i<3;i++)sphere(g,.12,'#d6e9dd',[i*.35,.20,.55]);return;}
  if(k==='mountain'){mesh(g,'cone',[2,3,7],'#b5b598',[0,1.5,0]);return;}
  if(k==='steamtrain'){box(g,1.2,.8,2.8,'#b99cbe',[0,.75,0]);cyl(g,.4,.4,1.7,'#8aafb6',[0,1.3,.4],[Math.PI/2,0,0]);cyl(g,.17,.23,.60,'#a2b9b1',[0,1.95,.8]);box(g,1.5,.14,1.2,'#d4b18d',[0,1.9,-.9]);for(const x of [-.65,.65])for(const z of [-1,0,1])cyl(g,.3,.3,.12,colors.ink,[x,.35,z],[0,0,Math.PI/2]);return;}
  if(k==='slide'){for(const x of [-.6,.6])rod(g,[x,0,-1],[x,2,-1],.05,'#91b9b3');box(g,1.3,.12,3,'#e5b992',[0,1.1,.1],[-.65,0,0]);return;}
  if(k==='balloon'){sphere(g,.37,'#e1afbe',[0,1.13,0],[.9,1.1,.9]);rod(g,[0,.78,0],[.02,.03,0],.008,'#bca681');return;}
  if(k==='owl'){sphere(g,.32,'#bdbaac',[0,.48,0],[1,1.35,.8]);for(const x of [-.13,.13]){sphere(g,.12,colors.cream,[x,.61,.22]);sphere(g,.055,colors.ink,[x,.61,.33]);}return;}
  if(k==='barrel'){cyl(g,.42,.42,.85,'#c19d74',[0,.45,0]);for(const y of [.2,.75])mesh(g,'torus',[.43,.032,6,24],colors.ink,[0,y,0],[Math.PI/2,0,0]);return;}
  if(k==='popcorn'){box(g,.57,.57,.49,'#e1b498',[0,.32,0]);for(let i=0;i<8;i++)sphere(g,.095,'#f8e6b9',[(i%3-1)*.15,.62+Math.floor(i/4)*.1,(Math.floor(i/3)-1)*.12]);return;}
  if(k==='queue'){for(const x of [-.8,.8]){rod(g,[x,0,0],[x,.9,0],.035,colors.ink);cyl(g,.17,.17,.05,colors.ink,[x,.04,0]);}rod(g,[-.8,.85,0],[.8,.85,0],.035,'#c2a3ba');return;}
  if(k==='telescope'){cyl(g,.13,.22,.7,'#d3b796',[0,.85,0],[.8,0,0]);for(const x of [-.3,0,.3])rod(g,[0,.8,0],[x,.03,Math.abs(x)],.03,'#a6b9b3');return;}
  if(k==='wand'){rod(g,[0,.05,-.45],[0,.05,.45],.022,'#aa8465');return;}
  if(k==='stage'){table(g,4,.5,2.4);return;}
  if(k==='sail'||k==='pinwheel'||k==='star'||k==='film'||k==='block'){if(k==='sail'){rod(g,[0,0,0],[0,1.6,0],.03,colors.wood);box(g,1.1,1.0,.02,'#f5dfb8',[.3,1.1,0]);}else if(k==='star'){for(let i=0;i<5;i++){const a=i*6.28/5;rod(g,[0,.05,0],[Math.sin(a)*.4,.05,Math.cos(a)*.4],.11,'#edc97e');}}else{box(g,.62,.4,.62,k==='film'?'#809a9f':'#e3c498',[0,.23,0]);}return;}
  throw new Error('New game model missing: '+k);
 }
 return {model,table,chair,plant,roof,building,bottle,plate,bowl,screen};
}
