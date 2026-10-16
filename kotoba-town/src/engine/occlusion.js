// Fade scenery that stands between the camera and the player, so walking behind a building never hides you.
// Materials are shared per colour, so faded objects get their own transparent copy instead of a modified original.
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import * as T from '../vendor/three.module.min.js';

const FADED_OPACITY = 0.28;
const INTERVAL_MS = 100;
const MAX_SIBLINGS = 60;

export const occlusion = {
  fadedMaterial(m) {
    this.fadeCopies ??= new Map();
    let copy = this.fadeCopies.get(m);
    if (!copy) {
      copy = m.clone();
      copy.transparent = true;
      copy.opacity = FADED_OPACITY;
      copy.depthWrite = false;
      copy.userData.fadeCopy = true;
      this.fadeCopies.set(m, copy);
    }
    return copy;
  },

  /** Recompute which meshes block the view of the player; cheap enough to run a few times a second. */
  updateOcclusion(force = false) {
    if (!this.player) return;
    const now = performance.now();
    if (!force && now - (this.occlusionAt || 0) < INTERVAL_MS) return;
    this.occlusionAt = now;
    this.faded ??= new Map();
    const chest = this.playerPos.clone().add(new T.Vector3(0, (this.player.userData.height || 3) * 0.55, 0));
    const dir = new T.Vector3();
    this.camera.getWorldDirection(dir);
    // Orthographic: every view ray is parallel, so cast along the view direction through the player.
    const origin = chest.clone().addScaledVector(dir, -200);
    // A dedicated raycaster: picking keeps its own state, and sprites need the camera to be hit-tested.
    const ray = (this.occlusionRay ??= new T.Raycaster());
    ray.camera = this.camera;
    ray.set(origin, dir);
    const reach = 200 - 0.6;
    const blockers = new Set();
    for (const hit of ray.intersectObject(this.root, true)) {
      if (hit.distance >= reach) break;
      const o = hit.object;
      if (!o.isMesh || o.userData.fadeSkip) continue;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || m.isMeshBasicMaterial || m.isSpriteMaterial) continue; // labels, markers, dust
      let a = o;
      while (a && a !== this.player && !this.figures.includes(a) && !a.userData.remote) a = a.parent;
      if (a) continue; // never fade people
      blockers.add(o);
      const p = o.parent;
      if (p && p !== this.root && p.children.length <= MAX_SIBLINGS) for (const s of p.children) if (s.isMesh) blockers.add(s);
    }
    for (const [o, original] of this.faded) if (!blockers.has(o)) { o.material = original; this.faded.delete(o); }
    for (const o of blockers) {
      if (this.faded.has(o)) continue;
      const original = o.material;
      if (Array.isArray(original) || original?.userData?.fadeCopy) continue;
      this.faded.set(o, original);
      o.material = this.fadedMaterial(original);
    }
  },

  resetOcclusion() {
    this.faded?.clear();
    if (this.fadeCopies) for (const copy of this.fadeCopies.values()) copy.dispose();
    this.fadeCopies?.clear();
    this.occlusionAt = 0;
  },
};
