// Other learners in the online town (REQ-102). They are paper-doll figures like everyone else; picking one
// opens their name card (REQ-103), but they are not "talk" targets. Positions arrive only when someone
// starts/turns/stops, so between messages each figure dead-reckons from its last velocity and glides toward
// the prediction.
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import * as T from '../vendor/three.module.min.js';

const MAX_EXTRAPOLATE = 1.5; // seconds; a silent peer stops instead of walking off forever
const BUBBLE_SECONDS = 3;
const LINE_WIDTH = 720, LINE_HEIGHT = 54, MAX_LINES = 3, SINGLE_HEIGHT = 118;

/** Break text into at most MAX_LINES evenly filled lines (any character may break, as in Japanese). */
function wrap(g, text) {
  const total = g.measureText(text).width;
  const target = total / Math.ceil(total / LINE_WIDTH) + 22; // even lines, so no lone "！" on the last one
  const lines = [];
  let line = '';
  for (const ch of text) {
    if (line && g.measureText(line + ch).width > target) {
      lines.push(line);
      line = '';
    }
    line += ch;
  }
  lines.push(line);
  if (lines.length > MAX_LINES) {
    lines.length = MAX_LINES;
    lines[MAX_LINES - 1] = [...lines[MAX_LINES - 1]].slice(0, -1).join('') + '…';
  }
  return lines;
}

function bubbleTexture(text) {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  const font = '700 44px "Yu Gothic","Hiragino Sans",sans-serif';
  g.font = font;
  const lines = wrap(g, text);
  const w = Math.ceil(Math.max(...lines.map((l) => g.measureText(l).width))) + 56, h = 96 + (lines.length - 1) * LINE_HEIGHT;
  c.width = w;
  c.height = h + 22;
  g.font = font;
  g.fillStyle = '#ffffff';
  g.strokeStyle = '#d9d3b6';
  g.lineWidth = 4;
  g.beginPath();
  g.roundRect(2, 2, w - 4, h - 4, 30);
  g.moveTo(w / 2 - 14, h - 3);
  g.lineTo(w / 2, h + 18);
  g.lineTo(w / 2 + 14, h - 3);
  g.fill();
  g.stroke();
  g.fillStyle = '#ffffff';
  g.fillRect(w / 2 - 12, h - 8, 24, 8);
  g.fillStyle = '#314d48';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, w / 2, 50 + i * LINE_HEIGHT));
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  return { texture: t, width: c.width, height: c.height };
}

const MAX_VISIBLE_REMOTES = 40, CULL_MS = 400;

export const remotes = {
  async addRemote(id, character, name, state) {
    this.remotes ??= new Map();
    const known = this.remotes.get(id);
    if (known?.character === character.id) return this.updateRemote(id, state);
    if (known) this.removeRemote(id); // switched character
    const entry = { id, name, character: character.id, image: character.image, state: { ...state, t: performance.now() }, ready: false };
    this.remotes.set(id, entry);
    let tex = this.characterTextures.get(character.image);
    if (!tex) {
      tex = await new T.TextureLoader().loadAsync(character.image);
      tex.colorSpace = T.SRGBColorSpace;
      this.characterTextures.set(character.image, tex);
    }
    if (this.remotes.get(id) !== entry) return; // left while the art was loading
    const h = this.worldMode === 'town' ? 3 : 2.25;
    const g = this.group(null, [state.x, 0, state.z]);
    g.userData.remote = true;
    g.userData.target = { kind: 'peer', data: { id, name } };
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.15 }));
    s.scale.set(h * 0.7, h, 1);
    s.position.y = h / 2 + 0.05;
    g.add(s);
    const shadow = this.cyl(g, 0.6, 0.6, 0.012, '#728776', [0, 0.012, 0]);
    shadow.material = this.mat('#506764', { transparent: true, opacity: 0.18 });
    g.userData.sprite = s;
    this.initFigure(g, s, shadow, h);
    entry.group = g;
    entry.height = h;
    entry.label = this.spriteLabel(name, [state.x, h + 0.45, state.z], 2.2, '#8a4f6b');
    entry.ready = true;
    if (entry.pendingSkill) this.startRemoteSkill(id, entry.pendingSkill);
    this.request();
  },

  updateRemote(id, state) {
    const e = this.remotes?.get(id);
    if (!e) return;
    e.state = { ...state, t: performance.now() };
    this.request();
  },

  removeRemote(id) {
    const e = this.remotes?.get(id);
    if (!e) return;
    this.cancelRemoteSkill(id);
    this.remotes.delete(id);
    if (e.group) this.root.remove(e.group);
    if (e.label) {
      this.root.remove(e.label);
      this.labels = this.labels.filter((l) => l !== e.label);
    }
    e.bubble?.material.map.dispose();
    e.bubble?.material.dispose();
    this.request();
  },

  /**
   * With many learners in one scene (the town holds up to 120, REQ-115) only the nearest MAX_VISIBLE_REMOTES
   * are drawn, so phones keep their frame rate; the rest stay connected and appear as the player nears them.
   * Re-chosen every CULL_MS rather than per frame.
   */
  cullRemotes(now) {
    if (this.remotes.size <= MAX_VISIBLE_REMOTES) {
      if (this.anyCulled) { for (const e of this.remotes.values()) e.culled = false; this.anyCulled = false; }
      return;
    }
    if (now - (this.cullAt || 0) < CULL_MS) return;
    this.cullAt = now;
    const p = this.playerPos, ready = [...this.remotes.values()].filter((e) => e.group);
    ready.sort((a, b) => Math.hypot(a.group.position.x - p.x, a.group.position.z - p.z) - Math.hypot(b.group.position.x - p.x, b.group.position.z - p.z));
    ready.forEach((e, i) => { e.culled = i >= MAX_VISIBLE_REMOTES; });
    this.anyCulled = true;
  },

  clearRemotes() {
    for (const id of [...(this.remotes?.keys() || [])]) this.removeRemote(id);
  },

  /** Show a speech/emote bubble over a remote peer, or over the player when id is null. */
  bubble(id, text, seconds = BUBBLE_SECONDS) {
    const e = id === null ? { group: this.player, height: this.player?.userData.height || 3 } : this.remotes?.get(id);
    const g = e?.group;
    if (!g) return;
    const old = g.userData.bubble;
    if (old) {
      g.remove(old);
      old.material.map.dispose();
      old.material.dispose();
    }
    const { texture, width, height } = bubbleTexture(text);
    const sp = new T.Sprite(new T.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sp.renderOrder = 30;
    const h = e.height || 3, k = (h * 0.36) / SINGLE_HEIGHT; // world units per canvas pixel
    sp.scale.set(width * k, height * k, 1);
    sp.position.y = h + 0.85 + (height * k) / 2; // above the name label
    sp.userData.until = performance.now() + seconds * 1000;
    g.add(sp);
    g.userData.bubble = sp;
    if (id !== null) e.bubble = sp;
    this.request();
  },

  tickBubbles(groups) {
    let alive = false;
    const t = performance.now();
    for (const g of groups) {
      const b = g?.userData.bubble;
      if (!b) continue;
      const left = (b.userData.until - t) / 1000;
      if (left <= 0) {
        g.remove(b);
        b.material.map.dispose();
        b.material.dispose();
        g.userData.bubble = null;
        continue;
      }
      b.material.opacity = Math.min(1, left / 0.4);
      alive = true;
    }
    return alive;
  },

  /** Advance every remote figure; returns true while any still moves or animates. */
  tickRemotes(dt) {
    if (!this.remotes?.size) return this.tickBubbles([this.player]);
    let busy = false;
    const now = performance.now();
    this.cullRemotes(now);
    for (const e of this.remotes.values()) {
      if (!e.ready) continue;
      e.group.visible = !e.culled;
      e.label.userData.culled = !!e.culled;
      const s = e.state, age = Math.min((now - s.t) / 1000, MAX_EXTRAPOLATE);
      const moving = (s.vx || s.vz) && (now - s.t) / 1000 < MAX_EXTRAPOLATE;
      const tx = s.x + (moving ? s.vx * age : 0), tz = s.z + (moving ? s.vz * age : 0);
      const g = e.group, before = g.position.clone();
      const gap = Math.hypot(tx - g.position.x, tz - g.position.z);
      if (gap > 8) g.position.set(tx, 0, tz); // teleport (zone change)
      else {
        const k = 1 - Math.exp(-dt * 10);
        g.position.x += (tx - g.position.x) * k;
        g.position.z += (tz - g.position.z) * k;
      }
      const vx = (g.position.x - before.x) / (dt || 1), vz = (g.position.z - before.z) / (dt || 1);
      busy = this.animateFigure(g, vx, vz, dt, Math.max(5, Math.hypot(s.vx, s.vz))) || busy;
      busy = this.tickRemoteSkill(e, now) || busy;
      if (gap > 0.02) busy = true;
      e.label.position.set(g.position.x, e.height + 0.45, g.position.z);
    }
    return this.tickBubbles([this.player, ...[...this.remotes.values()].map((e) => e.group)]) || busy;
  },
};
