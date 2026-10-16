// Load the exterior model only when entering this district; reuse the ordinary town HUD.
import { buildTobita } from './tobita-district.js';
let mapPromise;
function loadMap() {
  if (!mapPromise) mapPromise = fetch(new URL('./tobita-map.json', import.meta.url))
    .then(response => { if (!response.ok) throw new Error('街区の地図を読み込めませんでした。'); return response.json(); })
    .catch(error => { mapPromise = null; throw error; });
  return mapPromise;
}
export async function buildTownTobita(world, lesson, character) {
  const map = await loadMap();
  // Clear the old scene's hooks before capturing the shared methods.
  world.clear();
  const original = Object.fromEntries(['moveBy', 'reset', 'goZone', 'applyLight', 'onUpdate'].map(key => [key, world[key]]));
  const restore = () => { Object.assign(world, original); delete world.districtMap; };
  try {
    await buildTobita(world, map, character, lesson);
    world.sceneCleanup = restore;
    world.districtMap = map;
    world.reset = function () {
      original.reset.call(this);
      this.distance = innerWidth < 700 ? 90 : 70;
      this.pitch = .82;
      this.yaw = -2.05;
      this.request();
    };
    world.goZone = function (index) { original.goZone.call(this, index); this.reset(); };
    world.applyLight = function () {
      original.applyLight.call(this);
      for (const lamp of this.nightLights) lamp.material.color.set('#ffffff');
    };
    let camera = '';
    world.onUpdate = () => {
      original.onUpdate?.();
      const signature = [world.yaw, world.pitch, world.overviewMode].join(':');
      if (signature !== camera) { camera = signature; world.updateOcclusion(true); }
    };
    const landmark = world.root.children.find(object => object.userData.buildingId === '268090649');
    if (landmark) for (const key of ['hyakuban', 'lattice', 'lantern', 'roof', 'eaves', 'balcony'])
      world.entities.set('tobita-' + key, landmark);
    // Returning uses the same town button / E prompt, without a decorative exit sign.
    const entry = world.zones[0];
    world.entrances = [{ x: entry.x, z: entry.z, data: { id: 'town', jp: '町' } }];
    world.reset();
    world.applyLight();
  } catch (error) {
    restore();
    world.clear();
    throw error;
  }
}
