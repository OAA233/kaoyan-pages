// Bespoke layouts for places whose function depends on the floor plan.
export function buildDetailedRoom(world,data,zone,h){
 const {box,localGroup,put,fixture,surface,shelf,carpet,counter,plant,register,find,sceneGroup,surfaces,used}=h;
 const i=zone.index, T=world.THREE;
 const p=(kind,x,z,s=1,n=[],y=0)=>put(kind,x,z,s,n,y);
 const collide=(x,z,w,d)=>world.collider(zone.x+x,zone.z+z,w,d);
 const machine=(kind,x,z,s=1,turn=0)=>{const g=p(kind,x,z,s);g.rotation.y=turn;const b=new T.Box3().setFromObject(g),size=b.getSize(new T.Vector3());collide(x,z,size.x*.7,size.z*.7);return g;};
 const bind=(obj,kind,names=[])=>register(obj,find(kind,names));
 const nameSign=(text,x,z)=>world.label(sceneGroup,text,1.6,.34,[x,2.35,z],0,'#e7dec8','#4b5755');
 function mirror(x,z,w=3){const g=localGroup(x,z);world.box(g,w,1.8,.05,'#9ebdbd',[0,1.6,0]);for(const xx of [-w/2,w/2])world.box(g,.08,1.9,.07,'#c1ccc4',[xx,1.6,.03]);bind(g,'mirror');return g;}
 function books(x,z){for(let row=0;row<3;row++)for(let n=0;n<10;n++){const g=localGroup(x-1.23+n*.27,z+(row===0?.8:row===1?0:-.8),.39+row*.745);world.box(g,.18,.48,.38,['#8aabae','#d9ad8a','#8da17b','#c395a3'][n%4],[0,.24,0]);world.box(g,.12,.025,.015,'#f6e6c9',[0,.36,.20]);bind(g,'book',['漫画']);}}
 function showerRow(xs,z){xs.forEach(x=>{p('shower',x,z);mirror(x,z-.15,1.1);p('stool',x,z+1.1,.8);p('tub',x+.55,z+.9,.7);p('pumpbottle',x-.48,z+.3,.7,['シャンプー'],.5);});}
 if(data.id==='sports'&&[1,11,12,13].includes(i)){
  carpet(0,0,14,12.8,i===13?'#c2c6b5':'#657b80');for(let x=-6;x<=6;x+=2)box(.024,.02,12.8,'#849796',x,.10,0);
  for(const x of [-4.5,0,4.5])mirror(x,-6.65,4.3);
  if(i===1){
   for(const x of [-4.7,-1.7,1.3])machine('treadmill',x,-3.9,1);
   machine('elliptical',4.6,-3.7,1.1);machine('spin-bike',-4.6,.5,1.35,Math.PI/2);machine('spin-bike',-1.5,.5,1.35,Math.PI/2);machine('rower',2.5,.1,1.2);
   p('water-dispenser',5.8,3.8,1.3);surface(-4,3.5,3.8,1.1,.9);
  }else if(i===11){
   machine('power-rack',-3.7,-3.4,1.5);machine('weight-bench',-3.7,-2,1.4);machine('plate-rack',-6,1,1.25);
   machine('dumbbell-rack',2.9,-4.6,1.7);machine('weight-bench',2.7,-1.3,1.25,Math.PI/2);
   machine('bench-press',-1,2,1.2);p('kettlebell',4.8,1.8,1.5);p('kettlebell',5.7,1.9,1.2);
   surface(4.2,3.8,3.6,1,.65);p('weight-plate',-5.5,-1.6,1);
  }else if(i===12){
   machine('lat-pulldown',-4.4,-3.5,1.25);machine('cable-machine',0,-3.9,1.30);machine('chest-press',4.3,-3.5,1.25);
   machine('leg-press',-3.4,1.3,1.25,.4);machine('chest-press',1.8,1.3,1.25,-.4);
   surface(5.3,3.6,2.4,1.1,.85);
  }else{
   for(const x of [-4.6,-1,2.6]){const g=p('mat',x,-1.5,1.5,['ヨガマット']);g.scale.set(2,1,3);p('yoga-block',x+.8,-1.4,1.3);p('foam-roller',x,-3.5,1.3);}
   for(const [x,z]of[[4.6,-4.7],[5.5,-3.3],[-5.3,3]])p('balance-ball',x,z,1.15);
   shelf(3.8,3.4,4,1.8);p('resistance-band',4,3.5,1.3,[],1.15);
  }
  return true;
 }
 if(data.id==='netcafe'){
  carpet(0,0,14.2,13,'#93877b');
  if(i===0){
   counter(0,-3.3,9,1.6);p('terminal',-2,-3.3,1.5,[],1.34);p('register',2,-3.3,1,[],1.34);
   p('change-machine',5,-4.7,1.3,['精算機']);p('sofa',-4,1.3,1.3);surface(2,1.6,4.3,1.3,.85);plant(-6,-4,1.2);
   nameSign('受付・会員登録',0,-6.6);
  }else if(i===1){
   for(const x of [-4.5,0,4.5]){shelf(x,-4.8,3.4);books(x,-4.8);}
   p('sofa',-3,1.1,1.3);p('sofa',3,1.1,1.3);surface(-3,2.1,2.4,1,.65);surface(3,2.1,2.4,1,.65);
   surface(0,-1.5,2.6,1.2,.95);p('printer',0,-1.5,.8,[],.99);
  }else if(i===2||i===3){
   carpet(0,0,2.0,12.9,'#bba588');
   // Six genuinely enclosed private spaces, cut away on the viewing side.
   for(const side of [-1,1])for(let row=0;row<3;row++){
    const x=side*3.9,z=-4.35+row*3.85,W=4.4,D=3.45;
    const booth=localGroup(x,z);bind(booth,'private-room',i===2?['鍵付き個室']:row%2?['ブース']:['個室']);
    const bb=(w,ht,d,c,xx,yy,zz)=>world.box(booth,w,ht,d,c,[xx,yy,zz]);
    bb(W,.14,D,'#8a664b',0,.09,0);
    bb(W,2.0,.12,'#c8b89e',0,1.08,-D/2);bb(.13,1.35,D,'#c6b291',side*W/2,.72,0);
    // Corridor wall has a separate hinged door and a keypad facing the corridor.
    bind(bb(.12,1.65,1.4,'#9b7658',-side*W/2,.87,-1.0),'partition',['仕切り壁']);
    bb(.12,1.65,.8,'#9b7658',-side*W/2,.87,1.33);
    const door=p('door',x-side*W/2,z+.12,.68,['ドア']);door.rotation.y=-side*Math.PI/2;
    const pad=p('keypad',x-side*(W/2+.10),z-.75,.58);pad.rotation.y=-side*Math.PI/2;
    const no=world.label(booth,String(201+row+(side>0?3:0)),.5,.23,[-side*(W/2+.075),1.8,-.8],-side*Math.PI/2,'#534a43','#f2e7cb');no.userData.decor=true;
    // Low desk and monitor, with room for a flat reclining mat or an armchair.
    const deskX=x+side*.15,deskZ=z-1.0;
    surface(deskX,deskZ,2.8,.8,i===2?.53:.86,'#c1a37c');
    p(row===0&&side<0&&i===2?'computer':'monitor',deskX,deskZ,.68,[],i===2?.58:.91);p('keyboard',deskX,deskZ+.28,.5,[],i===2?.58:.91);
    p('reading-lamp',deskX+1,deskZ,.7,[],i===2?.58:.91);
    p('usb-outlet',deskX-.9,deskZ,.65,[],i===2?.58:.91);
    if(i===2){const mat=p('floor-mattress',x,z+.60,1.0);mat.rotation.y=Math.PI/2;p('pillow',x+side*1.0,z+.60,.8,[],.23);p('blanket',x-side*.2,z+.65,1.2,[],.24);}
    else{p('recliner',x,z+.55,.90);p('footrest',x,z+1.12,.7);p('side-table',x+1.35,z+.35,.75,['サイドテーブル']);p('blanket',x+.10,z+.8,.6,[],.6);}
    p('vent',x+side*.8,z-1.66,.8,[],1.15);p('shoe-tray',x-side*1.45,z+.55,.7);p('hanger',x+side*1.85,z-1.2,.7,[],1.3);
    // Walls stay physical; the central aisle and every door opening stay walkable.
    collide(x,z-D/2,W,.13);collide(x+side*W/2,z,.13,D);
   }
   // Remaining small items have a real shared loan shelf, not arbitrary desktop rows.
   shelf(-5.8,5.2,2,1.8);
  }else if(i===4){
   counter(0,-4.1,11.5,1.7);p('coffee-machine',-4,-4,.95,[],1.35);p('water-dispenser',-.5,-4,1.15);p('vending',4.5,-4,1);
   surface(-3.3,1.1,4.6,1.8,.9);surface(3.3,1.1,4.6,1.8,.9);for(const x of [-4.5,-2,2,4.5])p('chair',x,2.5);
  }else if(i===5){
   for(const x of [-4.6,0,4.6]){p('shower-booth',x,-3.8,1.6);p('mat',x,-1.7,1.15,['バスマット']);}
   counter(-3,1.65,6,1.4);for(const x of [-4.5,-1.5]){p('sink',x,1.65,.8,[],1.32);mirror(x,.96,1.9);}
   p('hairdryer',-4,1.65,1,[],1.4);shelf(4,1.7,4,1.8);
  }else if(i===6){
   for(const x of [-4.5,-1.5]){p('washer',x,-4.3,1.5);p('dryer',x,-4.3,1.5,[],2.30);collide(x,-4.3,2.2,1.7);}
   shelf(3.8,-4.5,4);surface(0,1,8.5,2,.95);for(const x of [-3,0,3])p('basket',x,1,.9,[],1.0);p('bench',0,3.8,1.4);
  }
  return true;
 }
 if(data.id==='ryokan'){
  const wood='#a88259',tatami='#b9c397';
  if(i===0){
   carpet(0,2.8,13,4,'#afa798');const step=box(13,.28,7.8,wood,0,.14,-2.2);bind(step,'entryfloor',['上がり框']);
   counter(2.6,-3.8,6,1.5);p('cabinet',-4.3,-4,1.7,['下駄箱']);p('umbrella-stand',-5.8,2.3,1.1);p('slippers',-2,1.6,.85);p('slippers',-1,1.6,.85);surface(3.2,1.6,4,1.5,.75);plant(6,-4.7,1.2);
  }else if(i===1){
   for(let x=-5.4;x<6;x+=3.6)for(const z of [-2.5,2.7]){bind(carpet(x,z,3.5,5.0,tatami),'tatami');box(.11,.035,5,'#738768',x-1.70,.10,z);box(.11,.035,5,'#738768',x+1.70,.10,z);}
   // Tokonoma: raised display alcove, scroll and seasonal flower, beside storage.
   bind(box(4.8,.32,1.4,wood,-4.3,.20,-5.7),'alcove');for(const x of [-6.7,-1.9])box(.15,2.6,1.4,wood,x,1.5,-5.7);
   p('scroll',-4.4,-6.35,1.3,[],.4);p('vase',-3.4,-5.65,1.0,[],.38);p('oshiire',4.5,-5.5,1.5);
   const sf=surface(-1.2,-.2,4.5,2.4,.5);bind(sf.g,'lowtable');for(const x of [-2.6,.2]){p('floor-chair',x,1.45,1.1);p('cushion',x,-1.8,1.2);}
   p('teapot',-1.6,-.2,.8,[],.54);p('tea-chest',0,-.2,.8,[],.54);
   for(const z of [-1.3,2.3]){p(z<0?'futon':'floor-mattress',4,z,1.2);p('pillow',4,z-.90,1,[],.3);p('blanket',4,z+.3,1.4,[],.3);}
   const sh=p('shoji',-6.9,-.8,1.2,['障子']);sh.rotation.y=Math.PI/2;
   p('fusuma',.5,-6.2,1.0,['襖']);p('threshold',-6.85,-.8,1.35,[],.02).rotation.y=Math.PI/2;p('lintel',-6.85,-.8,1.35,[],3.15).rotation.y=Math.PI/2;
   surface(-4.8,3.8,3,1.2,.45);p('kimono',-5.6,3.8,.65,['浴衣'],.50);p('jacket',-4.6,3.8,.65,['羽織'],.50);p('belt',-3.6,3.8,.65,['帯'],.50);
  }else if(i===2){
   for(const x of [-3.5,3.5]){carpet(x,-.4,5.8,8,tatami);for(const z of [-2.8,1.2]){surface(x,z,3.8,1.7,.52);p('cushion',x-1,z+1.2,1.3);p('cushion',x+1,z+1.2,1.3);}}
  }else if(i===3){
   carpet(0,0,14,12.5,'#a9beb8');p('bathtub',-2.8,-3.4,1.7);showerRow([2,4.8],-5.7);p('stool',-5,1.2);surface(-2,3,5,1.2,.5);p('bucket',-4,3,.8,[],.52);p('pumpbottle',-.3,3,.8,[],.52);
  }else if(i===4){
   carpet(0,0,14,12.5,'#9aaa79');p('pond',-2,-1,1.8);p('bridge',-2,0,1.2);p('stone-lantern',4,-3,1.4);for(const [x,z]of[[-5,-4],[4,1],[-4,3]])p('rock',x,z,1.6);p('stepping-stones',2,3,1.8);plant(5,-5,1.8);surface(4,4,3,1,.55);
  }else if(i===5){
   for(const x of [-4.8,-1,3.4]){shelf(x,-4.7,3.3,2.6);for(const y of [.40,1.15,1.9])for(const xx of [-.75,.75])p('basket',x+xx,-4.7+(y<.5?.8:y>1.5?-.8:0),.75,[],y);}
   counter(3.2,1.4,5.3,1.6);for(const x of [1.9,4.5]){p('sink',x,1.4,.75,[],1.34);mirror(x,.58,1.9);}
   p('bench',-3,1.3,1.4);p('scale',-4.8,3.6,1.3);p('hairdryer',3,1.4,1,[],1.4);
  }else if(i===6){
   carpet(0,1.8,13,5.6,wood);for(let x=-6;x<=6;x+=.55)box(.014,.018,5.6,'#7f644a',x,.08,1.8);
   for(const x of [-4.6,0,4.6]){p('bamboo-blind',x,-.85,2,[],.7);p('andon',x,3.6,1.15);}
   carpet(0,-3.7,13,4.2,'#9aaf86');for(const [x,z]of[[-4,-3.6],[0,-4.3],[4,-3]])p('rock',x,z,1.4);p('stepping-stones',0,-2,2.4);p('floor-chair',-3.4,1.4,1.2);surface(3.4,1.1,2.9,1.2,.56);
  }
  return true;
 }
 return false;
}
