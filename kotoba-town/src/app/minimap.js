// Round minimap rotated with the camera (camera forward is always up). Redrawn from the world's
// per-frame callback at most ~10 times a second, so it costs nothing while the scene is still.
import { lots, streets } from '../town-layout.js';
import { $, app } from './context.js';

const DISTRICT_COLORS = ['#8fabb0', '#c4956e', '#ba938e', '#93a782', '#a7a19a', '#a7ae8d'];
const RIVER = [[44, -92], [41, -55], [44, -20], [44, 30], [49, 92]];
let last = 0;

export function drawMinimap(force = false) {
  const canvas = $('minimap'), w = app.world;
  if (!canvas || !w || !w.player || canvas.offsetParent === null) return;
  const now = performance.now();
  if (!force && now - last < 100) return;
  last = now;
  const size = canvas.clientWidth, dpr = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(size * dpr)) { canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr); }
  const g = canvas.getContext('2d');
  const town = w.worldMode === 'town';
  // Town: a fixed window around the player. Venue: the whole floor plan fits.
  let radius = 30;
  if (!town) {
    const [x0, x1, z0, z1] = w.bounds;
    radius = Math.max(8, Math.hypot(x1 - x0, z1 - z0) / 2 * 0.9);
  }
  const scale = size / 2 / radius, px = w.playerPos.x, pz = w.playerPos.z;
  const cos = Math.cos(w.yaw), sin = Math.sin(w.yaw);
  // World (x, z) relative to the player → minimap pixels; camera forward maps to "up".
  const at = (x, z) => { const dx = x - px, dz = z - pz; return [size / 2 + (dx * cos - dz * sin) * scale, size / 2 + (dx * sin + dz * cos) * scale]; };
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, size, size);
  g.fillStyle = town ? ({ spring: '#dce6c9', summer: '#cfe3c0', autumn: '#e6dcc0', winter: '#e3e8e6' }[w.season] || '#dce6c9') : '#efe6d2';
  if (w.night) g.fillStyle = '#5d6f80';
  g.fillRect(0, 0, size, size);
  g.lineJoin = g.lineCap = 'round';
  const poly = (points, color, width) => {
    g.beginPath();
    points.forEach(([x, z], i) => { const [cx, cy] = at(x, z); i ? g.lineTo(cx, cy) : g.moveTo(cx, cy); });
    g.strokeStyle = color; g.lineWidth = width * scale; g.stroke();
  };
  const box = (x, z, wd, dp, angle, color) => {
    const c = Math.cos(angle), s = Math.sin(angle), hw = wd / 2, hd = dp / 2;
    g.beginPath();
    [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(([u, v], i) => { const [cx, cy] = at(x + u * c + v * s, z - u * s + v * c); i ? g.lineTo(cx, cy) : g.moveTo(cx, cy); });
    g.closePath(); g.fillStyle = color; g.fill();
  };
  if (town) {
    poly(RIVER, '#a4cdd0', 8);
    for (const r of streets) poly(r.points, '#f8f0d8', r.width + 2);
    for (const c of app.catalog) {
      const lot = lots[c.id];
      if (lot) box(lot[0], lot[1], 10, 8, 0, DISTRICT_COLORS[c.district % DISTRICT_COLORS.length]);
    }
  } else if (w.districtMap) {
    for (const building of w.districtMap.buildings) {
      g.beginPath();
      building.points.forEach(([x,z],i) => { const [cx,cy] = at(x,z); i ? g.lineTo(cx,cy) : g.moveTo(cx,cy); });
      g.closePath(); g.fillStyle = building.landmark === 'hyakuban' ? '#ba775b' : '#bba98f'; g.fill();
    }
    for (const road of w.districtMap.roads) for (const segment of road.segments) poly(segment, '#faf1d8', road.width);
  } else {
    for (const c of w.colliders) box(c.x, c.z, c.w, c.d, 0, c.w * c.d > 30 ? '#c9b893' : '#d6c6a2');
  }
  for (const f of w.figures) { const [cx, cy] = at(f.position.x, f.position.z); g.beginPath(); g.arc(cx, cy, 3.2, 0, 7); g.fillStyle = '#e8a34f'; g.fill(); }
  for (const e of w.remotes?.values() || []) { if (!e.group) continue; const [cx, cy] = at(e.group.position.x, e.group.position.z); g.beginPath(); g.arc(cx, cy, 3.4, 0, 7); g.fillStyle = '#4f8fd1'; g.fill(); g.lineWidth = 1.2; g.strokeStyle = '#fff'; g.stroke(); }
  if (w.marker?.visible) { const [cx, cy] = at(w.marker.position.x, w.marker.position.z); g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
  // The player: a dot, plus a heading arrow while moving.
  const c = size / 2;
  const v = w.playerVel, speed = Math.hypot(v.x, v.z);
  if (speed > 0.3) {
    const hx = (v.x * cos - v.z * sin) / speed, hy = (v.x * sin + v.z * cos) / speed;
    g.beginPath(); g.moveTo(c + hx * 10, c + hy * 10); g.lineTo(c - hy * 5, c + hx * 5); g.lineTo(c + hy * 5, c - hx * 5); g.closePath();
    g.fillStyle = '#d4608c'; g.fill();
  }
  g.beginPath(); g.arc(c, c, 5, 0, 7); g.fillStyle = '#e493b7'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = '#fff'; g.stroke();
  // North (−z in world space) sits on the rim.
  const north = $('minimap-north');
  if (north) {
    const nx = sin, ny = -cos, rim = size / 2 - 11;
    north.style.transform = `translate(${nx * rim}px, ${ny * rim}px)`;
  }
}
