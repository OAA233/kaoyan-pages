// "Paper doll" animation for the flat character art: card-flip turns, bouncy squash-and-stretch steps,
// a forward lean, dust puffs and a landing squash when stopping. NPCs and staff flip to face a nearby player.
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import * as T from '../vendor/three.module.min.js';

const FLIP_SECONDS = 0.16; // half a card turn
const NOTICE_RADIUS = 4.5; // NPCs turn toward a player this close
const DUST_POOL = 14;

function dustTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d'), grad = g.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  return t;
}

export const paperDoll = {
  /** Remember the figure's resting shape; called once per figure from character(). */
  initFigure(g, sprite, shadow, height) {
    g.userData.shadow = shadow;
    g.userData.anim = {
      baseW: sprite.scale.x, baseH: sprite.scale.y, baseY: sprite.position.y, height,
      facing: 1, angle: 0, // angle 0 = original art, PI = mirrored
      phase: 0, speed: 0, settle: 0, lastContact: 0,
    };
  },

  /** Unit vector pointing to the right of the screen on the ground plane. */
  screenRight() {
    return { x: Math.cos(this.yaw), z: -Math.sin(this.yaw) };
  },

  /**
   * Advance one figure. vx/vz is its current ground velocity (world units/s), maxSpeed its walking speed.
   * Returns true while something is still moving so the on-demand loop keeps rendering.
   */
  animateFigure(g, vx, vz, dt, maxSpeed, faceToward = null) {
    const a = g.userData.anim, s = g.userData.sprite;
    if (!a || !s) return false;
    const speed = Math.hypot(vx, vz), sf = Math.min(1, speed / Math.max(maxSpeed, 0.01));
    const right = this.screenRight();
    // Facing follows the on-screen horizontal direction of travel (or of the thing we look at).
    const along = faceToward ? faceToward.x * right.x + faceToward.z * right.z : speed > 0.2 ? (vx * right.x + vz * right.z) / speed : 0;
    if (Math.abs(along) > 0.25) a.facing = along > 0 ? 1 : -1;
    const targetAngle = a.facing > 0 ? 0 : Math.PI;
    let turning = false;
    if (a.angle !== targetAngle) {
      const step = (Math.PI / FLIP_SECONDS) * dt;
      a.angle = Math.abs(targetAngle - a.angle) <= step ? targetAngle : a.angle + Math.sign(targetAngle - a.angle) * step;
      turning = true;
    }
    // Steps: about two per second at full walking pace.
    if (sf > 0.05) a.phase += dt * (7 + 5 * sf);
    const wave = Math.abs(Math.sin(a.phase));
    const contact = Math.floor(a.phase / Math.PI);
    if (sf > 0.45 && contact !== a.lastContact) {
      a.lastContact = contact;
      this.spawnDust(g.position, a.facing);
    }
    // Landing squash when the figure comes to rest.
    if (a.speed > 0.35 && sf < 0.08) a.settle = 1;
    a.speed = sf;
    a.settle = Math.max(0, a.settle - dt * 5);
    const k = a.height / 3;
    const bounce = wave * 0.17 * sf * k;
    const squash = 1 - 0.07 * (1 - wave) * sf + 0.035 * wave * sf - 0.08 * a.settle * Math.sin(a.settle * Math.PI);
    const flip = Math.cos(a.angle);
    s.scale.set(a.baseW * flip * (1 / Math.sqrt(squash)), a.baseH * squash, 1);
    s.position.y = a.baseY - (a.baseH * (1 - squash)) / 2 + bounce;
    s.material.rotation = -a.facing * 0.07 * sf + Math.sin(a.phase) * 0.035 * sf;
    const shadow = g.userData.shadow;
    if (shadow) shadow.scale.setScalar(1 - Math.min(0.35, bounce * 0.9));
    return turning || sf > 0.05 || a.settle > 0;
  },

  /** NPCs and staff face a player within NOTICE_RADIUS, otherwise return to their original art. */
  updateFigures(dt) {
    let busy = false;
    for (const g of this.figures) {
      const dx = this.playerPos.x - g.position.x, dz = this.playerPos.z - g.position.z;
      const close = this.player && Math.hypot(dx, dz) < NOTICE_RADIUS;
      const a = g.userData.anim;
      if (!close && a) a.facing = 1;
      busy = this.animateFigure(g, 0, 0, dt, 1, close ? { x: dx, z: dz } : null) || busy;
    }
    return busy;
  },

  spawnDust(at, facing) {
    if (!this.dust) {
      const material = new T.SpriteMaterial({ map: dustTexture(), transparent: true, depthWrite: false, opacity: 0 });
      this.dust = Array.from({ length: DUST_POOL }, () => {
        const sp = new T.Sprite(material.clone());
        sp.visible = false;
        sp.userData.life = 0;
        return sp;
      });
    }
    const puff = this.dust.find((p) => !p.visible || p.userData.life <= 0);
    if (!puff) return;
    if (puff.parent !== this.root) this.root.add(puff);
    const right = this.screenRight();
    puff.position.set(at.x - right.x * facing * 0.35, 0.12, at.z - right.z * facing * 0.35);
    puff.userData.life = 1;
    puff.visible = true;
  },

  tickDust(dt) {
    if (!this.dust) return false;
    let alive = false;
    for (const p of this.dust) {
      if (!p.visible) continue;
      p.userData.life -= dt * 2.6;
      if (p.userData.life <= 0) { p.visible = false; continue; }
      const life = p.userData.life;
      p.scale.setScalar(0.35 + (1 - life) * 0.7);
      p.position.y += dt * 0.35;
      p.material.opacity = 0.55 * life;
      alive = true;
    }
    return alive;
  },

  /** Called from clear(): sprites are re-added on demand, materials are owned by the pool. */
  resetPaperDoll() {
    this.figures = [];
    if (this.dust) for (const p of this.dust) { p.visible = false; p.userData.life = 0; }
  },
};
