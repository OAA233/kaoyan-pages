// A walkable district, with a station square, winding shopping streets and a riverside.
export const lots={
 tobita:[-25,-80,0],aeon:[69,57,-Math.PI/2,8.4],bank:[-8,-76,0],
 school:[-62,55,Math.PI],sports:[66,20,-Math.PI/2],sushi:[-21,19,Math.PI/2],izakaya:[-24,1,Math.PI/2],
 yakiniku:[1,17,-Math.PI/2],ramen:[6,35,-Math.PI/2],soba:[-23,-17,Math.PI/2],teishoku:[-16,37,Math.PI/2],
 kissaten:[2,-2,-Math.PI/2],wagashi:[-21,-36,Math.PI/2],convenience:[20,55,Math.PI],supermarket:[25,1,-Math.PI/2],
 clothing:[5,-22,-Math.PI/2],dagashi:[-59,19,Math.PI/2],hundred:[24,-19,-Math.PI/2],drugstore:[-34,54,Math.PI],
 bookstore:[-5,-43,0],aquarium:[66,-5,-Math.PI/2],temple:[-65,-54,0],shrine:[-44,-62,0],
 ryokan:[-60,-22,Math.PI/2],sento:[-59,-1,Math.PI/2],arcade:[24,-39,-Math.PI/2],karaoke:[29,33,-Math.PI/2],
 netcafe:[-3,55,Math.PI],home:[-59,37,Math.PI/2],clinic:[-21,-59,0],station:[3,74,Math.PI],
 post:[-19,73,Math.PI],koban:[22,72,Math.PI],laundry:[-66,73,Math.PI],barber:[-43,74,Math.PI],
 street:[24,-57,0],festival:[23,-76,0],disney:[70,-35,-Math.PI/2],usj:[70,-62,-Math.PI/2]
};
export const streets=[
 {points:[[-8,-51],[-8,-66],[8,-67],[23,-65]],width:4},
 {points:[[-42,-49],[-25,-47],[-13,-35],[-13,-20],[-17,0],[-10,21],[-2,41],[4,62]],width:5.4},
 {points:[[-2,41],[-24,45],[-46,43],[-49,23],[-49,0],[-49,-26],[-49,-44],[-42,-49]],width:4.4},
 {points:[[4,62],[-19,63],[-43,63],[-59,64],[-78,65]],width:4.4},
 {points:[[4,62],[17,61],[35,50],[36,22],[37,-2],[37,-29],[35,-51],[29,-65]],width:4.8},
 {points:[[6,42],[17,22],[15,3],[14,-18],[14,-40],[7,-51],[-8,-51],[-18,-49]],width:4},
 {points:[[-49,43],[-50,63],[-43,63]],width:4},
 {points:[[16,20],[37,20],[47,20],[65,29],[78,20]],width:4.6,bridge:true},
 {points:[[14,-35],[38,-35],[48,-35],[66,-24],[79,-36]],width:4.6,bridge:true},
 {points:[[57,68],[57,45],[57,28],[57,3],[57,-18],[58,-41],[57,-63],[65,-75]],width:4.6}
];
export function entryFor(id){const l=lots[id];return l?[l[0]+Math.sin(l[2])*(l[3]||6.3),0,l[1]+Math.cos(l[2])*(l[3]||6.3)]:[4,0,62];}
export function nearestStreet(x,z){let best=[4,62],dist=Infinity;for(const road of streets)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));const p=[a[0]+dx*t,a[1]+dz*t],d=Math.hypot(x-p[0],z-p[1]);if(d<dist){dist=d;best=p;}}return best;}
