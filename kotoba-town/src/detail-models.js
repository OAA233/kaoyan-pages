// Recognizable fixtures and small objects for the detailed district interiors.
export function createDetailModels(ctx){
 const {T,box,cyl,sphere,mesh,rod,label}=ctx;
 const ink='#43565f',steel='#8eabae',wood='#a87952',cream='#f2e6cf',blue='#76a7bb',dark='#39454f';
 const b=(g,w,h,d,c,x=0,y=h/2,z=0,r)=>box(g,w,h,d,c,[x,y,z],r);
 const bar=(g,a,z,r=.055,c=steel)=>rod(g,a,z,r,c);
 const ring=(g,r,t,c,p,rot=[Math.PI/2,0,0])=>mesh(g,'torus',[r,t,8,24],c,p,rot);
 function seat(g,recline=false){b(g,.93,.20,1.05,dark,0,.65);b(g,.95,1.18,.2,dark,0,1.2,-.52,[-.28,0,0]);for(const x of [-.59,.59]){b(g,.16,.14,1.10,wood,x,.90);b(g,.12,.5,.65,ink,x,.45);}b(g,.6,.12,.8,ink,0,.1);if(recline)b(g,.82,.18,.75,dark,0,.50,.78,[.32,0,0]);}
 function weight(g,x,y,z,r=.35){cyl(g,r,r,.12,ink,[x,y,z],[0,0,Math.PI/2]);}
 function frame(g,w=1.8,h=2.6,d=1.6){for(const x of [-w/2,w/2]){b(g,.16,h,.16,steel,x,h/2,-d/2);b(g,.16,.13,d+.4,ink,x,.08,0);}bar(g,[-w/2,h,-d/2],[w/2,h,-d/2],.09);b(g,w,.12,.16,steel,0,.13,-d/2);}
 function stack(g,x=.65,z=-.60){for(let i=0;i<10;i++)b(g,.54,.09,.48,dark,x,.3+i*.10,z);bar(g,[x,.13,z],[x,2.45,z],.018,'#d7e2df');}
 function handle(g,a,z){bar(g,a,z,.04,ink);}
 function shelf(g,w=1.8,h=1.8){for(const x of [-w/2,w/2])b(g,.12,h,.8,wood,x,h/2);for(const y of [.12,.85,1.55])b(g,w,.1,.8,cream,0,y);}
 function mattress(g){b(g,1.4,.15,2.15,'#777b70',0,.12);for(const z of [-.75,0,.75])b(g,1.34,.03,.65,'#8c9484',0,.205,z);}
 function appliance(g,dryer=false){b(g,1.3,1.5,1.2,cream,0,.78);b(g,1.12,.24,.045,steel,0,1.36,.63);ring(g,.40,.065,ink,[0,.70,.635],[0,0,0]);cyl(g,.34,.34,.025,blue,[0,.70,.65],[Math.PI/2,0,0]);b(g,.36,.10,.03,ink,-.25,1.36,.66);if(dryer)label(g,'乾燥',.52,.20,[.28,1.35,.66]);}
 return function detail(g,w){
 const k=w.kind,j=w.jp||'',c=w.color||blue;
 if(k==='marbles'){for(let i=0;i<5;i++)sphere(g,.13,['#83bccc','#d998a5','#bbd198'][i%3],[(i%3-1)*.3,.14,Math.floor(i/3)*.3]);return true;}
 if(k==='kendama'){bar(g,[0,.05,0],[0,.85,0],.075,wood);bar(g,[-.3,.5,0],[.3,.5,0],.08,wood);sphere(g,.2,'#c77763',[.25,.20,0]);bar(g,[.25,.22,0],[0,.60,0],.01,cream);return true;}
 if(k==='spinning-top'){mesh(g,'cone',[.4,.32,24],'#ab8f62',[0,.2,0],[Math.PI,0,0]);cyl(g,.07,.07,.4,wood,[0,.4,0]);ring(g,.28,.035,'#ad6c61',[0,.28,0]);return true;}
 if(k==='computer'||k==='monitor'){b(g,1.3,.85,.10,ink,0,.8);b(g,1.14,.69,.015,blue,0,.82,.063);b(g,.13,.33,.13,steel,0,.23);b(g,.65,.06,.4,ink,0,.05);for(let n=0;n<3;n++)b(g,.6,.03,.012,cream,-.1,1-n*.16,.079);if(k==='computer'){b(g,.40,.95,.55,ink,1,.50);b(g,.3,.03,.015,steel,1,.8,.29);}return true;}
 if(k==='keyboard'){b(g,.85,.05,.32,ink,0,.04);for(let row=0;row<3;row++)for(let col=0;col<10;col++)b(g,.055,.015,.060,cream,(col-4.5)*.075,.08,(row-1)*.085);return true;}
 if(k==='mouse'){sphere(g,.15,ink,[0,.1,0],[.75,.6,1.2]);bar(g,[0,.1,-.18],[0,.08,-.45],.01);return true;}
 if(k==='charger'){b(g,.27,.22,.28,cream,0,.14);for(const x of [-.065,.065])b(g,.025,.16,.055,steel,x,.32);bar(g,[0,.1,.14],[.3,.05,.3],.012,ink);return true;}
 if(k==='printer'){b(g,1.1,.55,.85,cream,0,.32);b(g,1,.05,.70,ink,0,.62);b(g,.65,.02,.55,cream,0,.36,.55);b(g,.24,.1,.02,blue,.33,.44,.44);return true;}
 if(k==='eraser'){b(g,.55,.13,.28,wood,0,.12);b(g,.52,.08,.25,ink,0,.04);return true;}
 if(k==='scroll'){b(g,.90,1.8,.025,'#decdaa',0,1.0);b(g,.60,1.28,.008,'#f5ebd6',0,1.06,.022);for(const y of [.12,1.93])cyl(g,.04,.04,1.03,wood,[0,y,.02],[0,0,Math.PI/2]);for(let i=0;i<5;i++)bar(g,[-.13,1.56-i*.22,.034],[.16,1.50-i*.22,.034],.020,ink);return true;}
 if(k==='vase'){cyl(g,.14,.29,.5,'#739ba1',[0,.27,0]);cyl(g,.18,.14,.20,'#739ba1',[0,.60,0]);for(const x of [-.10,.12]){bar(g,[0,.5,0],[x,1.05,x],.014,'#648b63');sphere(g,.14,'#dfb29f',[x,1.1,x],[1,.5,1]);}return true;}
 if(k==='tea-chest'){cyl(g,.37,.37,.21,wood,[0,.14,0]);cyl(g,.39,.39,.055,'#cba772',[0,.28,0]);cyl(g,.07,.07,.065,wood,[0,.33,0]);return true;}
 if(k==='futon'){mattress(g);b(g,1.32,.08,1.4,'#afc2b3',0,.23,.3);b(g,.75,.14,.38,cream,0,.3,-.75);return true;}
 if(k==='floor-mattress'){mattress(g);return true;}
 if(k==='private-room'){b(g,2.7,.12,3.2,wood,0,.07);b(g,2.7,2.1,.12,cream,0,1.10,-1.54);for(const x of [-1.3,1.3])b(g,.12,1.2,3.2,cream,x,.64);b(g,.95,1.8,.10,wood,-.80,.97,1.5);const p=new T.Group();p.name='opening-panel';p.position.set(.26,.07,1.5);g.add(p);b(p,.90,1.8,.10,'#af845b',.45,.90);b(p,.08,.11,.09,ink,.77,.97,.08);g.userData.movingPart=p.name;return true;}
 if(k==='recliner'){seat(g,true);return true;}
 if(k==='footrest'){b(g,.85,.18,.7,dark,0,.5);bar(g,[-.3,.1,-.2],[.3,.48,.2]);bar(g,[.3,.1,-.2],[-.3,.48,.2]);return true;}
 if(k==='side-table'){b(g,.85,.1,.65,wood,0,.66);b(g,.1,.63,.1,ink,0,.32);b(g,.65,.05,.45,ink,0,.04);return true;}
 if(k==='reading-lamp'){cyl(g,.23,.23,.055,ink,[0,.04,0]);bar(g,[0,.05,0],[0,.65,0],.035);bar(g,[0,.65,0],[.3,.90,0],.035);mesh(g,'cone',[.22,.28,16],cream,[.33,.85,0],[0,0,-.5]);return true;}
 if(k==='keypad'||k==='terminal'||k==='ticket-number'||k==='change-machine'){const big=k==='change-machine';b(g,big?1.1:.62,big?1.75:.8,.28,cream,0,big?.90:.45);b(g,big?.78:.49,big?.45:.35,.022,blue,0,big?1.35:.6,.156);for(let i=0;i<9;i++)b(g,.07,.055,.018,ink,(i%3-1)*.11,(big?.80:.34)-Math.floor(i/3)*.09,.166);b(g,.28,.035,.024,ink,0,big?.35:.13,.17);return true;}
 if(['cardkey','clip','weight-collar','pin','slot','usb-outlet','powerstrip','outlet'].includes(k)){if(k==='weight-collar'){ring(g,.18,.045,'#c9d2c9',[0,.24,0],[0,0,0]);b(g,.20,.12,.08,'#db9269',.18,.25);return true;}b(g,k==='powerstrip'?.8:.42,.10,.24,cream,0,.07);for(let i=0;i<(k==='powerstrip'?3:1);i++){b(g,.06,.01,.07,ink,(i-1)*.21,.125);b(g,.018,.02,.10,ink,(i-1)*.21+.075,.126);}return true;}
 if(k==='telephone'){b(g,.6,.15,.44,ink,0,.1);b(g,.48,.10,.15,dark,0,.24,-.10);for(let i=0;i<9;i++)b(g,.045,.01,.045,cream,(i%3-1)*.09,.19,(Math.floor(i/3)-1)*.08+.08);bar(g,[-.30,.24,-.10],[-.40,.1,.12],.015,ink);return true;}
 if(k==='shoe-tray'){b(g,.8,.06,.5,ink,0,.04);for(const x of [-.43,.43])b(g,.045,.12,.54,steel,x,.08);return true;}
 if(k==='hanger'){bar(g,[0,.55,0],[-.45,.15,0],.03,wood);bar(g,[-.45,.15,0],[.45,.15,0],.03,wood);bar(g,[.45,.15,0],[0,.55,0],.03,wood);ring(g,.08,.02,steel,[.02,.65,0],[0,0,0]);return true;}
 if(k==='vent'){b(g,.7,.6,.07,cream,0,.5);for(let i=0;i<6;i++)b(g,.55,.025,.025,steel,0,.30+i*.08,.05);return true;}
 if(k==='luggage-rack'){for(const x of [-.65,.65]){bar(g,[x,.07,-.4],[x,.65,.4]);bar(g,[x,.07,.4],[x,.65,-.4]);}for(const x of [-.45,0,.45])b(g,.12,.03,.9,ink,x,.65);return true;}
 if(k==='shower-booth'){b(g,1.7,.14,1.6,cream,0,.1);for(const x of [-.8,.8])b(g,.07,2.4,1.6,'#b9d8d8',x,1.3);b(g,1.6,2.4,.07,'#8dafb1',0,1.3,-.8);bar(g,[.15,.7,-.72],[.15,2.3,-.72],.025,steel);bar(g,[.15,2.3,-.72],[.15,2.3,-.24],.025,steel);cyl(g,.18,.18,.06,steel,[.15,2.27,-.24]);b(g,.25,.08,.06,steel,0,1.1,-.7);return true;}
 if(k==='dryer'){appliance(g,true);return true;}
 if(k==='hairdryer'){cyl(g,.13,.14,.43,c,[0,.4,0],[0,0,Math.PI/2]);b(g,.11,.28,.12,ink,.08,.20);return true;}
 if(k==='scale'){b(g,.8,.10,.65,cream,0,.08);b(g,.30,.01,.14,blue,0,.139,-.15);return true;}
 if(k==='spin-bike'){bar(g,[-.45,.15,0],[.1,.85,0],.07);bar(g,[-.45,.15,0],[.65,.15,0],.07);bar(g,[.65,.15,0],[.1,.85,0],.07);cyl(g,.33,.33,.15,ink,[.55,.50,0],[Math.PI/2,0,0]);b(g,.42,.1,.32,dark,-.1,1);bar(g,[.55,.55,0],[.7,1.1,0]);bar(g,[.7,1.1,-.3],[.7,1.1,.3],.05,ink);for(const x of [-.55,.65])bar(g,[x,.10,-.45],[x,.10,.45],.07);return true;}
 if(k==='elliptical'||k==='rower'){b(g,1.05,.15,2.4,ink,0,.1);if(k==='elliptical'){cyl(g,.35,.35,.55,steel,[0,.55,-.55],[0,0,Math.PI/2]);for(const x of [-.30,.30]){b(g,.24,.10,1,ink,x,.25,.35);bar(g,[x,.35,-.2],[x,1.95,-.40],.04,steel);bar(g,[x,1.6,-.38],[x,2.15,-.25],.055,ink);}}else{b(g,.55,.14,.5,dark,0,.4,.5);cyl(g,.35,.35,.65,steel,[0,.55,-.9],[0,0,Math.PI/2]);bar(g,[0,.7,-.7],[0,.75,.2],.012,ink);bar(g,[-.30,.75,.2],[.30,.75,.2],.035,ink);}return true;}
 if(k==='power-rack'||k==='bench-press'){frame(g,2.1,2.7,1.8);for(const x of [-1.05,1.05]){b(g,.14,2.7,.14,steel,x,1.35,.8);for(let y=.45;y<2.6;y+=.2)b(g,.025,.045,.02,ink,x,y,-.70);bar(g,[x,.9,-.8],[x,.9,.8]);}bar(g,[-1.5,1.6,-.45],[1.5,1.6,-.45],.045,'#c8d3d3');for(const x of [-1.25,1.25])weight(g,x,1.6,-.45,.38);if(k==='bench-press'){b(g,.65,.15,1.9,dark,0,.6,.4);for(const z of [-.3,1])b(g,.14,.55,.7,steel,0,.30,z);}return true;}
 if(k==='weight-bench'){b(g,.65,.18,1.85,dark,0,.65,0);for(const z of [-.65,.65]){b(g,.12,.58,.12,steel,0,.3,z);b(g,1,.12,.22,ink,0,.09,z);}return true;}
 if(k==='dumbbell-rack'){for(const x of [-1.05,1.05])bar(g,[x,.1,.35],[x,1.2,-.28],.08);for(const y of [.55,1.02]){b(g,2.3,.08,.50,steel,0,y);for(const x of [-.8,-.25,.3,.85]){bar(g,[x,y+.15,-.16],[x,y+.15,.16],.04,steel);cyl(g,.13,.13,.14,ink,[x,y+.15,-.2],[Math.PI/2,0,0]);cyl(g,.13,.13,.14,ink,[x,y+.15,.2],[Math.PI/2,0,0]);}}return true;}
 if(k==='weight-plate'){cyl(g,.4,.4,.11,ink,[0,.43,0],[Math.PI/2,0,0]);cyl(g,.085,.085,.12,steel,[0,.43,0],[Math.PI/2,0,0]);return true;}
 if(k==='plate-rack'){b(g,.14,1.65,.14,steel,0,.85);bar(g,[-.7,.08,0],[.7,.08,0],.08);for(const y of [.45,1.05])for(const a of [-1,1]){bar(g,[0,y,0],[a*.5,y,0]);weight(g,a*.32,y,0,y<1?.34:.26);}return true;}
 if(k==='kettlebell'){sphere(g,.25,ink,[0,.27,0],[1,1, .85]);ring(g,.16,.045,steel,[0,.58,0],[0,0,0]);return true;}
 if(['lat-pulldown','cable-machine','leg-press','chest-press','weight-stack'].includes(k)){
 frame(g,1.7,2.6,1.8);stack(g,.60,-.65);
 if(k==='weight-stack')return true;
 b(g,.65,.18,.65,dark,-.25,.65,.15);b(g,.15,.6,.15,steel,-.25,.3,.15);
 if(k==='lat-pulldown'){bar(g,[0,2.55,-.8],[0,2.55,.65],.08);bar(g,[0,2.55,.65],[0,2.03,.65],.016,ink);bar(g,[-.7,2.03,.65],[.7,2.03,.65],.045,ink);b(g,.70,.12,.17,ink,-.25,.90,.50);}
 if(k==='cable-machine'){for(const x of [-.65,.65]){ring(g,.1,.025,ink,[x,2.3,-.62],[0,0,0]);bar(g,[x,2.3,-.6],[x,1.20,.30],.012,ink);handle(g,[x-.12,1.15,.3],[x+.12,1.15,.3]);}}
 if(k==='leg-press'){b(g,.70,1,.14,dark,-.25,1.15,-.25,[-.4,0,0]);for(const x of [-.6,.1])bar(g,[x,.30,.4],[x,1.5,1.35],.055);b(g,1.0,.8,.13,ink,-.25,1.25,1.4,[-.7,0,0]);}
 if(k==='chest-press'){b(g,.70,.95,.15,dark,-.25,1.15,-.18);for(const x of [-.8,.30]){bar(g,[x,2,-.5],[x,1.4,.4],.055);handle(g,[x,1.4,.4],[x,1.05,.4]);}}
 return true;
 }
 if(k==='balance-ball'){sphere(g,.58,c,[0,.59,0]);return true;}
 if(k==='foam-roller'){cyl(g,.17,.17,.85,c,[0,.18,0],[0,0,Math.PI/2]);return true;}
 if(k==='yoga-block'){b(g,.35,.24,.60,c,0,.14);return true;}
 if(k==='resistance-band'||k==='belt'){ring(g,.32,.035,k==='belt'?wood:c,[0,.08,0]);if(k==='belt')b(g,.13,.08,.20,steel,.28,.08);return true;}
 if(k==='grip'){bar(g,[-.27,.16,0],[.27,.16,0],.06,ink);return true;}
 if(k==='water-dispenser'){b(g,.65,1.25,.62,cream,0,.66);cyl(g,.29,.24,.65,'#93c6d4',[0,1.6,0]);for(const x of [-.13,.13])b(g,.065,.07,.14,x<0?'#d78775':blue,x,1,.33);return true;}
 if(k==='soccerball'){sphere(g,.28,'#f1edde',[0,.30,0]);for(const [x,y,z] of [[0,.53,0],[.2,.3,.17],[-.2,.3,.17],[0,.15,.22]])sphere(g,.09,ink,[x,y,z],[1,.4,1]);return true;}
 if(k==='floor-chair'){b(g,.8,.12,.9,wood,0,.13);b(g,.75,.8,.10,wood,0,.54,-.4,[-.15,0,0]);b(g,.68,.10,.70,'#b3c1a0',0,.24);return true;}
 if(k==='threshold'||k==='lintel'||k==='engawa'){b(g,k==='engawa'?2.6:1.8,k==='engawa'?.23:.12,k==='engawa'?1.3:.20,wood);if(k==='engawa')for(let i=0;i<6;i++)b(g,.012,.02,1.3,'#654c3b',i*.40-1,.24);return true;}
 if(k==='oshiire'){b(g,2.2,2.3,1,wood,0,1.2);for(const x of [-.54,.54]){const p=new T.Group();p.name=x<0?'opening-panel':'fixed-panel';g.add(p);b(p,1.06,2.05,.07,cream,x,1.2,.54);cyl(p,.055,.055,.015,ink,[x+(x<0?.35:-.35),1.2,.60],[Math.PI/2,0,0]);}g.userData.movingPart='opening-panel';g.userData.sliding=true;return true;}
 if(k==='bamboo-blind'||k==='shutter'){for(let i=0;i<14;i++)b(g,1.8,.09,.05,k==='shutter'?steel:wood,0,.15+i*.10);for(const x of [-.6,.6])bar(g,[x,.1,.05],[x,1.5,.05],.012,ink);return true;}
 if(k==='andon'){b(g,.65,1,.55,cream,0,.60);for(const x of [-.33,.33])for(const z of [-.28,.28])b(g,.06,1.2,.06,wood,x,.6,z);b(g,.74,.08,.66,wood,0,1.15);return true;}
 if(k==='stepping-stones'){for(const [x,z] of [[-.45,-.15],[.2,.3],[.65,-.2]])sphere(g,.32,steel,[x,.12,z],[1,.35,.8]);return true;}
 if(k==='barber-chair'||k==='shampoo-chair'){seat(g,k==='shampoo-chair');cyl(g,.16,.16,.4,steel,[0,.3,0]);cyl(g,.5,.5,.08,steel,[0,.06,0]);b(g,.6,.09,.4,steel,0,.2,.90);if(k==='shampoo-chair'){sphere(g,.52,cream,[0,1.4,-.85],[1,.5,.9]);sphere(g,.4,ink,[0,1.54,-.85],[1,.25,.9]);}return true;}
 if(k==='cart'){for(const x of [-.40,.40])for(const z of [-.5,.5])sphere(g,.11,ink,[x,.12,z]);for(const x of [-.40,.40])bar(g,[x,.15,.45],[x,1.15,.4]);bar(g,[-.40,1.15,.4],[.40,1.15,.4],.06,wood);b(g,.85,.06,1,steel,0,.28);for(const x of [-.43,.43])for(let z=-.45;z<.5;z+=.18)bar(g,[x,.50,z],[x,.94,z],.02);for(const z of [-.5,.5])bar(g,[-.43,.9,z],[.43,.9,z],.025);return true;}
 if(k==='sushi-tub'||k==='bamboo-tray'||k==='small-dish'){const r=k==='sushi-tub'?.55:.35;cyl(g,r,r*.95,k==='sushi-tub'?.26:.06,k==='small-dish'?cream:wood,[0,.15,0]);cyl(g,r*.85,r*.85,.012,cream,[0,k==='sushi-tub'?.29:.186,0]);return true;}
 if(k==='rice-paddle'||k==='shoehorn'){b(g,.085,.025,.46,wood,0,.03,.1);sphere(g,.16,cream,[0,.04,-.22],[.8,.13,1.3]);return true;}
 if(k==='sake-flask'){cyl(g,.24,.20,.37,cream,[0,.20,0]);cyl(g,.11,.24,.28,cream,[0,.5,0]);cyl(g,.11,.11,.15,cream,[0,.7,0]);return true;}
 if(k==='charcoal-grill'||k==='oden-pot'||k==='stockpot'){cyl(g,.52,.45,k==='stockpot'?.65:.30,k==='charcoal-grill'?wood:steel,[0,k==='stockpot'?.36:.2,0]);cyl(g,.46,.46,.02,k==='oden-pot'?'#bd9c6d':ink,[0,k==='stockpot'?.69:.37,0]);if(k==='charcoal-grill')for(let i=-3;i<=3;i++)bar(g,[-.38,.4,i*.12],[.38,.4,i*.12],.015,steel);if(k==='oden-pot')for(let i=0;i<6;i++)sphere(g,.09,cream,[(i%3-1)*.23,.4,Math.floor(i/3)*.20-.1]);return true;}
 if(k==='exhaust-duct'){cyl(g,.16,.16,1.8,steel,[0,1.4,0]);cyl(g,.17,.50,.45,steel,[0,.28,0]);return true;}
 if(k==='charcoal'){for(let i=0;i<3;i++)b(g,.17,.17,.6,ink,(i-1)*.20,.12,0,[0,i*.25,0]);return true;}
 if(k==='strainer'){mesh(g,'sphere',[.25,12,8],steel,[0,.16,0]);bar(g,[0,.16,.15],[0,.18,.7],.028,wood);return true;}
 if(k==='hot-case'||k==='fish-counter'){b(g,k==='fish-counter'?2.2:1.4,.55,.8,cream,0,.3);b(g,k==='fish-counter'?2.1:1.3,.035,.72,blue,0,.62);for(const x of [-.65,.65])b(g,.06,.70,.8,steel,x,.98);b(g,1.4,.08,.9,cream,0,1.36);if(k==='fish-counter')for(const x of [-.6,0,.6])sphere(g,.18,'#d9a6a0',[x,.75,0],[1.5,.35,.5]);return true;}
 if(k==='coffee-grinder'){b(g,.5,.65,.5,ink,0,.36);cyl(g,.25,.1,.4,'#d4bda2',[0,.91,0]);cyl(g,.26,.26,.035,ink,[0,1.14,0]);b(g,.15,.09,.30,steel,0,.55,.28);return true;}
 if(k==='coffee-siphon'){sphere(g,.24,'#95c4c7',[0,.45,0]);cyl(g,.18,.1,.5,'#a7c4bb',[0,.89,0]);bar(g,[-.3,.1,0],[-.3,.9,0]);bar(g,[-.3,.65,0],[0,.65,0]);cyl(g,.3,.3,.06,wood,[0,.06,0]);return true;}
 if(k==='tea-caddy'||k==='jar'||k==='pitcher'){cyl(g,.22,.21,k==='pitcher'?.6:.45,k==='tea-caddy'?'#769d78':cream,[0,.27,0]);cyl(g,.24,.24,.06,wood,[0,.54,0]);if(k==='pitcher')ring(g,.16,.035,wood,[.24,.30,0],[0,0,0]);return true;}
 if(k==='tea-whisk'){cyl(g,.08,.08,.15,wood,[0,.12,0]);for(let i=0;i<12;i++){const a=i*Math.PI/6;bar(g,[Math.sin(a)*.07,.18,Math.cos(a)*.07],[Math.sin(a)*.18,.42,Math.cos(a)*.18],.009,wood);}return true;}
 if(k==='incense-burner'){cyl(g,.40,.22,.38,steel,[0,.28,0]);cyl(g,.35,.35,.025,'#adaba0',[0,.49,0]);for(const x of [-.12,0,.12])bar(g,[x,.48,0],[x,.88,0],.014,wood);return true;}
 if(k==='incense'){for(const x of [-.08,0,.08])bar(g,[x,.04,-.3],[x,.04,.3],.012,wood);return true;}
 if(k==='wooden-fish'){sphere(g,.37,wood,[0,.32,0],[1,.7,.8]);bar(g,[-.2,.54,-.07],[.24,.54,.08],.012,ink);rod(g,[.3,.10,.1],[.6,.22,.45],.035,wood);return true;}
 if(k==='buddhist-altar'){b(g,1.5,.7,.65,wood,0,.36);for(const x of [-.64,.64])b(g,.10,1.1,.10,'#bb9660',x,1.25,-.2);b(g,1.5,.14,.7,'#be9960',0,1.8);sphere(g,.18,'#c7ac6b',[0,1.1,0]);sphere(g,.28,'#c7ac6b',[0,.82,0],[1,.7,.7]);return true;}
 if(k==='joystick'){b(g,.55,.1,.4,ink,0,.06);bar(g,[0,.1,0],[0,.4,0],.035);sphere(g,.09,'#dc9079',[0,.45,0]);return true;}
 if(k==='mic-stand'){bar(g,[0,.08,0],[0,1.8,0],.028);for(const x of [-1,0,1])bar(g,[0,.15,0],[x*.4,.03,x===0?-.4:.24],.025);bar(g,[0,1.8,0],[.3,1.95,0],.04,ink);return true;}
 if(k==='tambourine'){ring(g,.29,.045,wood,[0,.34,0],[0,0,0]);for(let i=0;i<6;i++){const a=i*Math.PI/3;cyl(g,.07,.07,.04,steel,[Math.cos(a)*.29,.34+Math.sin(a)*.29,0],[Math.PI/2,0,0]);}return true;}
 if(k==='aircon'){b(g,1.65,.48,.38,cream,0,.3);for(let i=0;i<4;i++)b(g,1.4,.018,.018,steel,0,.18+i*.045,.205);return true;}
 if(k==='fishbowl'){sphere(g,.42,'#94cad1',[0,.43,0],[1,.85,1]);ring(g,.27,.04,cream,[0,.76,0]);sphere(g,.1,'#df9477',[0,.44,.33],[1.3,.6,.3]);return true;}
 if(k==='poi'){ring(g,.18,.025,'#d69999',[0,.07,-.12]);bar(g,[0,.06,.03],[0,.06,.45],.025,'#d69999');return true;}
 if(k==='stroller'){seat(g);for(const x of [-.55,.55])for(const z of [-.5,.5])sphere(g,.13,ink,[x,.13,z]);sphere(g,.6,c,[0,1.45,-.23],[1,.5,.85]);bar(g,[-.5,1,-.5],[-.5,1.3,-.9]);bar(g,[-.5,1.3,-.9],[.5,1.3,-.9]);return true;}
 if(k==='book-stack'){for(let i=0;i<5;i++){b(g,.55,.075,.7,[blue,wood,'#a1b28b'][i%3],0,.05+i*.09);b(g,.50,.05,.67,cream,.015,.095+i*.09);}return true;}
 if(k==='clothes-pile'||k==='blanket'){for(let i=0;i<(k==='blanket'?1:3);i++)b(g,.7,.12,.55,[blue,'#bfb39b','#d5a4a5'][i%3],0,.09+i*.12);return true;}
 if(k==='comb'){b(g,.45,.07,.06,wood,0,.07);for(let i=0;i<10;i++)b(g,.022,.03,.18,wood,i*.044-.20,.06,.10);return true;}
 if(['toothbrush','swabs','clipper','baton','flashlight','lint-roller'].includes(k)){
 b(g,k==='baton'?.065:.12,.08,k==='baton'?.9:.45,k==='swabs'?cream:ink,0,.1);
 if(k==='toothbrush'||k==='swabs')b(g,.10,.10,.17,cream,0,.18,-.2);
 if(k==='clipper')for(let i=0;i<6;i++)b(g,.018,.04,.12,steel,i*.035-.09,.15,-.25);
 if(k==='flashlight')cyl(g,.13,.07,.18,cream,[0,.1,-.3],[Math.PI/2,0,0]);
 if(k==='lint-roller')cyl(g,.15,.15,.4,cream,[0,.25,-.3],[0,0,Math.PI/2]);return true;
 }
 if(k==='wrap-roll'){cyl(g,.09,.09,.7,cream,[0,.13,0],[0,0,Math.PI/2]);b(g,.6,.012,.28,'#c6d8d1',0,.09,.15);return true;}
 if(k==='sugar-cubes'){for(const x of [-.12,.12])for(const z of [-.12,.12])b(g,.19,.18,.19,cream,x,.1,z);return true;}
 if(['storage-box','cotton-box','mesh-bag','refill-pouch','apron','hatch'].includes(k)){
 if(k==='apron'){b(g,.55,.65,.025,c,0,.35);b(g,.32,.25,.025,c,0,.80);ring(g,.15,.025,c,[0,1.1,0],[0,0,0]);}
 else if(k==='hatch'){b(g,1.4,1,.10,cream,0,.6);b(g,1.15,.70,.02,blue,0,.65,.065);}
 else if(k==='refill-pouch'){b(g,.40,.58,.13,c,0,.30);b(g,.07,.12,.07,cream,.14,.63);}
 else{b(g,.65,.4,.5,c,0,.22);b(g,.69,.055,.54,cream,0,.45);if(k==='mesh-bag')for(let i=0;i<6;i++)b(g,.015,.37,.012,cream,i*.1-.25,.23,.263);}return true;
 }
 return false;
 };
}
