// Player movement against colliders (round body, so corners slide instead of snagging) and
// click/tap-to-walk with A* over a coarse grid built from the same colliders.
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import * as T from '../vendor/three.module.min.js';

const RADIUS = 0.3; // same clearance the old box test used
const CELL = 0.5;
const ARRIVE = 0.25;

/** Push a circle out of an axis-aligned box; returns true if it moved. */
function pushOut(p, c) {
  const hw = c.w / 2, hd = c.d / 2;
  const nx = Math.max(c.x - hw, Math.min(p.x, c.x + hw)), nz = Math.max(c.z - hd, Math.min(p.z, c.z + hd));
  let dx = p.x - nx, dz = p.z - nz;
  const dist = Math.hypot(dx, dz);
  if (dist >= RADIUS) return false;
  if (dist > 1e-6) {
    p.x = nx + (dx / dist) * RADIUS;
    p.z = nz + (dz / dist) * RADIUS;
  } else {
    // Centre inside the box: leave by the nearest face.
    const exits = [[c.x - hw - RADIUS - p.x, 0], [c.x + hw + RADIUS - p.x, 0], [0, c.z - hd - RADIUS - p.z], [0, c.z + hd + RADIUS - p.z]];
    const [ex, ez] = exits.reduce((a, b) => (Math.hypot(...a) <= Math.hypot(...b) ? a : b));
    p.x += ex;
    p.z += ez;
  }
  return true;
}
const inside = (x, z, c, pad) => Math.abs(x - c.x) < c.w / 2 + pad && Math.abs(z - c.z) < c.d / 2 + pad;

export const navigation = {
  moveBy(dx, dz) {
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.16));
    for (let i = 0; i < steps; i++) {
      const start = this.playerPos;
      // As before, a box the player already stands in (e.g. spawned on a mat) never traps it.
      const active = this.colliders.filter((c) => !inside(start.x, start.z, c, RADIUS));
      const p = { x: start.x + dx / steps, z: start.z + dz / steps };
      for (let pass = 0; pass < 2; pass++) for (const c of active) pushOut(p, c);
      this.playerPos.x = T.MathUtils.clamp(p.x, this.bounds[0], this.bounds[1]);
      this.playerPos.z = T.MathUtils.clamp(p.z, this.bounds[2], this.bounds[3]);
    }
  },

  navGrid() {
    if (this.nav && this.nav.source === this.colliders && this.nav.count === this.colliders.length) return this.nav;
    const [x0, x1, z0, z1] = this.bounds;
    const cols = Math.ceil((x1 - x0) / CELL) + 1, rows = Math.ceil((z1 - z0) / CELL) + 1;
    const blocked = new Uint8Array(cols * rows);
    for (const c of this.colliders) {
      const a = Math.max(0, Math.floor((c.x - c.w / 2 - RADIUS - x0) / CELL)), b = Math.min(cols - 1, Math.ceil((c.x + c.w / 2 + RADIUS - x0) / CELL));
      const e = Math.max(0, Math.floor((c.z - c.d / 2 - RADIUS - z0) / CELL)), f = Math.min(rows - 1, Math.ceil((c.z + c.d / 2 + RADIUS - z0) / CELL));
      for (let r = e; r <= f; r++) for (let q = a; q <= b; q++) if (inside(x0 + q * CELL, z0 + r * CELL, c, RADIUS)) blocked[r * cols + q] = 1;
    }
    this.nav = { cols, rows, x0, z0, blocked, source: this.colliders, count: this.colliders.length };
    return this.nav;
  },

  findPath(fromX, fromZ, toX, toZ) {
    const n = this.navGrid(), { cols, rows, x0, z0, blocked } = n;
    const cell = (x, z) => [Math.round((x - x0) / CELL), Math.round((z - z0) / CELL)];
    const free = (q, r) => q >= 0 && r >= 0 && q < cols && r < rows && !blocked[r * cols + q];
    let [sq, sr] = cell(fromX, fromZ), [gq, gr] = cell(toX, toZ);
    // A destination inside furniture walks to the nearest free cell around it.
    if (!free(gq, gr)) {
      let best = null;
      for (let d = 1; d < 12 && !best; d++)
        for (let r = gr - d; r <= gr + d; r++) for (let q = gq - d; q <= gq + d; q++)
          if (free(q, r) && (!best || Math.hypot(q - gq, r - gr) < Math.hypot(best[0] - gq, best[1] - gr))) best = [q, r];
      if (!best) return null;
      [gq, gr] = best;
    }
    const start = sr * cols + sq, goal = gr * cols + gq;
    const g = new Float32Array(cols * rows).fill(Infinity), from = new Int32Array(cols * rows).fill(-1), done = new Uint8Array(cols * rows);
    const open = [[0, start]];
    g[start] = 0;
    const h = (i) => Math.hypot((i % cols) - gq, Math.floor(i / cols) - gr);
    let expanded = 0;
    while (open.length && expanded < 40000) {
      let bi = 0;
      for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
      const [, cur] = open.splice(bi, 1)[0];
      if (done[cur]) continue;
      done[cur] = 1;
      expanded++;
      if (cur === goal) break;
      const cq = cur % cols, cr = Math.floor(cur / cols);
      for (let dr = -1; dr <= 1; dr++) for (let dq = -1; dq <= 1; dq++) {
        if (!dq && !dr) continue;
        const q = cq + dq, r = cr + dr;
        // The start cell may be "blocked" when hugging furniture; leaving it is always allowed.
        if (!free(q, r) || (dq && dr && (!free(cq + dq, cr) || !free(cq, cr + dr)))) continue;
        const i = r * cols + q, cost = g[cur] + (dq && dr ? Math.SQRT2 : 1);
        if (cost < g[i]) { g[i] = cost; from[i] = cur; open.push([cost + h(i), i]); }
      }
    }
    if (from[goal] < 0 && goal !== start) return null;
    const cells = [];
    for (let i = goal; i !== -1 && i !== start; i = from[i]) cells.push([x0 + (i % cols) * CELL, z0 + Math.floor(i / cols) * CELL]);
    cells.reverse();
    // Drop waypoints that a straight walk can skip.
    const path = [];
    let anchor = [fromX, fromZ];
    for (let i = 0; i < cells.length; i++) {
      const next = cells[i + 1];
      if (!next || !this.clearLine(anchor, next)) { path.push(cells[i]); anchor = cells[i]; }
    }
    if (path.length) path[path.length - 1] = free(...cell(toX, toZ)) ? [toX, toZ] : path[path.length - 1];
    return path;
  },

  clearLine(a, b) {
    const n = this.nav, steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (CELL / 2));
    for (let i = 1; i <= steps; i++) {
      const x = a[0] + ((b[0] - a[0]) * i) / steps, z = a[1] + ((b[1] - a[1]) * i) / steps;
      const q = Math.round((x - n.x0) / CELL), r = Math.round((z - n.z0) / CELL);
      if (q < 0 || r < 0 || q >= n.cols || r >= n.rows || n.blocked[r * n.cols + q]) return false;
    }
    return true;
  },

  /** Ground point under the pointer, or null. */
  groundPoint(clientX, clientY) {
    const b = this.canvas.getBoundingClientRect();
    this.ndc.set(((clientX - b.left) / b.width) * 2 - 1, (-(clientY - b.top) / b.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    const hit = new T.Vector3();
    return this.ray.ray.intersectPlane(new T.Plane(new T.Vector3(0, 1, 0), 0), hit) ? hit : null;
  },

  walkTo(clientX, clientY) {
    const p = this.groundPoint(clientX, clientY);
    return !!p && this.walkToPoint(p.x, p.z);
  },

  walkToPoint(x, z) {
    if (!this.player) return false;
    const path = this.findPath(this.playerPos.x, this.playerPos.z, x, z);
    if (!path || !path.length) return false;
    this.path = path;
    this.showMarker(path[path.length - 1]);
    this.request();
    return true;
  },

  cancelWalk() {
    this.path = null;
    if (this.marker) this.marker.visible = false;
  },

  /** Desired unit direction toward the next waypoint, or null when not walking a path. */
  pathDirection() {
    while (this.path?.length) {
      const [x, z] = this.path[0], dx = x - this.playerPos.x, dz = z - this.playerPos.z, d = Math.hypot(dx, dz);
      if (d > ARRIVE) return { x: dx / d, z: dz / d, remaining: d + (this.path.length - 1) };
      this.path.shift();
    }
    this.cancelWalk();
    return null;
  },

  showMarker([x, z]) {
    if (!this.marker) {
      this.marker = new T.Mesh(new T.RingGeometry(0.28, 0.42, 32), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, depthWrite: false }));
      this.marker.rotation.x = -Math.PI / 2;
      this.marker.renderOrder = 5;
    }
    if (this.marker.parent !== this.root) this.root.add(this.marker);
    this.marker.position.set(x, 0.04, z);
    this.marker.visible = true;
    this.marker.userData.born = performance.now();
  },

  tickMarker() {
    if (!this.marker?.visible) return false;
    const t = (performance.now() - this.marker.userData.born) / 1000;
    this.marker.scale.setScalar(1 + 0.12 * Math.sin(t * 6));
    return true;
  },

  resetNavigation() {
    this.nav = null;
    this.cancelWalk();
  },
};
