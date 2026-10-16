export function buildParkZone(world,data,zone,g,helpers){
 const {put,surface,counter,carpet,shelf,plant}=helpers,i=zone.index,disney=data.id==='disney';
 carpet(0,1,4.2,12.2,'#ded0b1');
 if(disney){
  if(i===0){for(const x of [-4.2,4.2])put('shop',x,-3,1.3);counter(0,1,5.4,1.7);put('balloon',-5,3,1.5);put('balloon',5,3,1.5);surface(-3.1,3.2,2.8,1,1.1);world.label(g,'ポップコーン',2.8,.30,[-3.1,.77,3.75]);}
  if(i===1){carpet(0,-1,12,5,'#9fcbd0');put('boat',-2,-1,1.6);put('sail',-2,-1,2,[],1);put('barrel',4,-3,1.4);surface(4,2.5,3.5,1.7,.7);}
  if(i===2){put('steamtrain',-2,-1,2);put('mountain',4,-3,1.6);surface(3,2.5,5,1.5,.8);}
  if(i===3){put('waterfall',0,-3.5,2.2);carpet(0,0,8,4,'#a3d1d2');put('boat',-2,0,1.4);surface(4,3,3.8,1.6,.8);}
  if(i===4){put('castle',0,-3.4,1.6);put('carousel',-4,2,1);surface(3.7,2.5,4,1.5,.8);}
  if(i===5){put('shop',-4,-3,1.4);put('shop',4,-3,1.4);put('fountain',0,1.7,1);surface(4.3,2.9,3,1.5,.8);}
  if(i===6){put('rocket',-3,-2.5,1.65);put('spaceship',3.5,-2.5,1.3);surface(0,2.3,7,1.9,.85);}
 }else{
  if(i===0){put('globe',0,-3,1.5);put('shop',-5,-3,1);put('shop',5,-3,1);counter(0,1,8.8,1.7);}
  if(i===1){put('shop',-4,-3,1.6);put('shop',4,-3,1.6);surface(0,2.3,7,1.8,.85);}
  if(i===2||i===3){carpet(0,-1.4,12,6,'#9ac8ce');put('boat',-2,-2,1.6);put(i===3?'shark':'parcel',3,-1.3,1.5);surface(2.8,3.5,6,1.4,.85);}
  if(i===4){put('coaster',0,-2,1.75);put('dinosaur',-4,2.3,1.4);surface(4,2.5,4,1.8,.8);}
  if(i===5){put('castle',0,-3,1.6);surface(-3.3,2,5,1.8,.85);surface(3.3,2,5,1.8,.85);}
  if(i===6){put('shop',-4,-3,1.4);put('shop',4,-3,1.4);counter(0,1,8,1.8);}
  if(i===7){put('carousel',-3,-2,1.25);put('slide',4,-1.3,1.5);surface(1,3,6,1.7,.8);}
  if(i===8){put('mushroom',-4,-3,1.8);put('mushroom',4,-3,1.8);put('kart',0,.4,1.8);surface(4.4,2.5,4,1.5,.85);}
  if(i===9){carpet(0,-3,12,5,'#a1cbd0');put('stage',0,-3,2.0);for(const x of [-4,0,4])put('bench',x,1.3,1.2);surface(0,3.4,8,1.4,.8);}
 }
}