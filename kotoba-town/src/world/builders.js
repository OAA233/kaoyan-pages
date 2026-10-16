// Town and venue construction.
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import { buildVenuePeople } from '../venue-people.js';
import { buildDrugstoreCashier } from '../drugstore-checkout.js';
import { buildRestaurantStaff } from '../restaurant-staff.js';
import { interiorPlan, buildInteriorShell } from '../interior-plans.js';
import { buildJapaneseTown } from '../town-architecture.js';
import * as T from '../vendor/three.module.min.js';
import { buildGameRoom } from '../game-rooms.js';

export const builders = {
  tree(x, z) {
    const g = this.group(null, [x, 0, z]);
    this.cyl(g, 0.18, 0.27, 2, '#98785e', [0, 1, 0]);
    const c = {
      spring: '#f4b3c5',
      summer: '#7abd7c',
      autumn: '#e9a359',
      winter: '#edf5f0',
    }[this.season];
    for (const [a, b, h, r] of [
      [0, 0, 2.8, 1.25],
      [-0.65, 0.1, 2.4, 0.9],
      [0.6, 0.1, 2.55, 1],
      [0, 0.6, 2.5, 0.95],
    ])
      this.sphere(g, r, c, [a, h, b], [1, 1, 1]);
    return g;
  },

  roof(g, w, d, y, c) {
    for (const sign of [-1, 1])
      this.box(
        g,
        w + 0.9,
        0.18,
        d * 0.62,
        c,
        [0, y, sign * d * 0.24],
        [sign * 0.38, 0, 0],
      );
    this.box(g, w + 1, 0.22, 0.26, c, [0, y + 0.47, 0]);
  },

  async town(catalog, character) {
    return buildJapaneseTown(this, catalog, character);
  },

  buildModel(g, w) {
    return this.models.model(g, w);
  },

  fitItem(g, w, max = 1.3) {
    this.models.model(g, w);
    const b = new T.Box3().setFromObject(g),
      size = b.getSize(new T.Vector3()),
      ratio = Math.min(1, max / Math.max(size.x, size.y, size.z, 0.01));
    g.scale.setScalar(ratio);
    g.position.y -= new T.Box3().setFromObject(g).min.y;
    return g;
  },

  fitDisplayItem(g, { x, z, y, width = 0.76, depth = 0.58 }) {
    g.updateWorldMatrix(true, true);
    let box = new T.Box3().setFromObject(g),
      size = box.getSize(new T.Vector3());
    const ratio = Math.min(
      1,
      width / Math.max(size.x, 0.01),
      depth / Math.max(size.z, 0.01),
    );
    g.scale.multiplyScalar(ratio);
    g.updateWorldMatrix(true, true);
    box.setFromObject(g);
    const center = box.getCenter(new T.Vector3()),
      origin = g.parent.localToWorld(new T.Vector3(x, y, z));
    g.position.x += origin.x - center.x;
    g.position.z += origin.z - center.z;
    g.position.y += origin.y - box.min.y + 0.015;
    g.updateWorldMatrix(true, true);
  },

  async interior(data, character, npc, characters = []) {
    if (data.id === 'tobita') {
      const { buildTownTobita } = await import('../tobita-town.js');
      return buildTownTobita(this, data, character);
    }
    if (data.id === 'usj') {
      const { buildUSJPark } = await import('../usj-park.js');
      return buildUSJPark(this, data, character, npc);
    }
    this.clear();
    this.worldMode = 'interior';
    this.data = data;
    this.modelErrors = [];
    const plan = interiorPlan(data);
    this.interiorLayout = plan;
    buildInteriorShell(this, data, plan);
    this.zones = plan.zones;
    for (const zone of this.zones) buildGameRoom(this, data, zone);
    for (const w of data.items.filter((w) => w.menuOnly)) {
      const menu = data.items.find((x) =>
        ['メニュー', 'お品書き'].includes(x.jp),
      );
      const target = menu && this.entities.get(menu.id);
      if (target) this.entities.set(w.id, target);
    }
    await buildRestaurantStaff(
      this,
      data,
      characters.filter((c) => c.id !== npc.id && c.id !== character.id),
    );
    await buildDrugstoreCashier(
      this,
      data,
      characters.filter((c) => c.id !== npc.id && c.id !== character.id),
    );
    await buildVenuePeople(
      this,
      data,
      characters.filter((c) => c.id !== npc.id && c.id !== character.id),
    );
    if (data.id === 'sports') {
      const { buildBasketballGuest } = await import('../basketball-guest.js');
      await buildBasketballGuest(this);
    }
    await this.character(npc, [plan.npc[0], 0, plan.npc[1]], false);
    const [ex, ez] = plan.entrance;
    this.entrances = [{ x: ex, z: ez, data: { id: 'town', jp: '町' } }];
    await this.character(character, [ex, 0, ez - 1], true);
    this.focus.copy(this.playerPos);
    this.distance = 30;
    this.yaw = -0.3;
    this.pitch = 1.03;
    this.applyLight();
    this.request();
  },
};
