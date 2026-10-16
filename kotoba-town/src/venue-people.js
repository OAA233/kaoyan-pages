// A purpose-specific worker or visitor, separate from the existing quest guide.
export async function buildVenuePeople(world,data,characters){
 const role=data.venueRole;if(!role||!characters.length)return;
 const zone=world.zones[role.zone];if(!zone)return;
 const [xmin,xmax,zmin,zmax]=world.bounds,candidates=[];
 for(let dx=-4;dx<=4;dx+=.5)for(let dz=-3;dz<=2;dz+=.5){const x=zone.entry[0]+dx,z=zone.entry[1]+dz;
  if(x<xmin+.7||x>xmax-.7||z<zmin+.7||z>zmax-.7||world.colliders.some(c=>Math.abs(x-c.x)<c.w/2+.7&&Math.abs(z-c.z)<c.d/2+.7))continue;
  candidates.push({x,z,d:Math.pow(dx+2.5,2)+Math.pow(dz+1.4,2)});
 }
 candidates.sort((a,b)=>a.d-b.d);const at=candidates[0];if(!at)return;
 const actor=characters[Math.abs([...data.id].reduce((v,c)=>v+c.charCodeAt(0),0))%characters.length],staff={...role,character:actor};
 await world.character(actor,[at.x,0,at.z],false,{kind:'staff',data:staff,label:staff.jp,height:2.7});
}
