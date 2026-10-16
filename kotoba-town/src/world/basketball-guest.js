// A local scene guest. This illustrated likeness is not added to the player's character roster.
export async function buildBasketballGuest(world) {
  const zone = world.zones[2];
  if (!zone) return;
  const character = { id: 'kobe-bryant', name: 'コービー・ブライアント', image: './assets/kobe-bryant.webp' };
  const guest = { id: 'sports-kobe', character, jp: character.name, nameOnly: true, zh: '科比·布莱恩特' };
  // Stand beside the basketball court's entry, leaving the hoop and walking route clear.
  const candidates = [];
  for (let dx = -4; dx <= 4; dx += .5) for (let dz = -3; dz <= 2; dz += .5) {
    const x = zone.entry[0] + dx, z = zone.entry[1] + dz;
    if (world.colliders.some(c => Math.abs(x-c.x) < c.w/2+.8 && Math.abs(z-c.z) < c.d/2+.8)) continue;
    candidates.push({ x, z, distance: (dx+2.5)**2+(dz+1.4)**2 });
  }
  candidates.sort((a,b) => a.distance-b.distance);
  const at = candidates[0];
  if (!at) return;
  await world.character(character, [at.x,0,at.z], false, { kind: 'staff', data: guest, label: character.name, height: 3.1 });
  const label = world.labels.at(-1);
  if (label) label.position.y += .7;
  world.request();
}
