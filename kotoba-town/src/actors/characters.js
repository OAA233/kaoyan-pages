// Player and NPC figures (homepage character art as sprites, animated by actors/paper-doll.js).
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import * as T from '../vendor/three.module.min.js';

export const characters = {
  async character(data, pos, isPlayer = false, role = null) {
    let tex = this.characterTextures.get(data.image);
    if (!tex) {
      tex = await new T.TextureLoader().loadAsync(data.image);
      tex.colorSpace = T.SRGBColorSpace;
      this.characterTextures.set(data.image, tex);
    }
    const g = this.group(null, pos);
    const s = new T.Sprite(
      new T.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.15 }),
    );
    const h = role?.height || (this.worldMode === 'town' ? 3 : 2.25);
    s.scale.set(h * 0.7, h, 1);
    s.position.y = h / 2 + 0.05;
    g.userData.height = h;
    g.add(s);
    const shadow = this.cyl(g, 0.6, 0.6, 0.012, '#728776', [0, 0.012, 0]);
    shadow.material = this.mat('#506764', { transparent: true, opacity: 0.18 });
    g.userData.sprite = s;
    g.userData.character = data;
    this.initFigure(g, s, shadow, h);
    if (isPlayer) {
      this.player = g;
      this.playerPos.set(...pos);
      this.updatePlayerLabel();
      this.onSkillChange?.();
    } else {
      this.figures.push(g);
      // What the "talk" prompt opens when the player walks up to this figure.
      g.userData.talk = { talk: true, kind: role?.kind || 'npc', data: role?.data || data, name: role?.label || data.name };
      this.register(g, role?.kind || 'npc', role?.data || data);
      this.spriteLabel(
        role?.label || data.name,
        [pos[0], h + 0.45, pos[2]],
        2.2,
      );
    }
    return g;
  },

  /** The signed-in learner's nickname over their own figure, styled like other learners' (REQ-103). */
  setPlayerName(name) {
    if ((name || '') === (this.playerName || '')) return;
    this.playerName = name || '';
    this.updatePlayerLabel();
  },

  updatePlayerLabel() {
    if (this.playerLabel) {
      this.root.remove(this.playerLabel);
      this.labels = this.labels.filter((l) => l !== this.playerLabel);
      this.playerLabel = null;
    }
    if (!this.playerName || !this.player) return;
    const h = this.player.userData.height;
    this.playerLabel = this.spriteLabel(this.playerName, [this.playerPos.x, h + 0.45, this.playerPos.z], 2.2, '#8a4f6b');
    // First in line, so overlapping building or NPC labels give way to it rather than hide it.
    this.labels = [this.playerLabel, ...this.labels.filter((l) => l !== this.playerLabel)];
    this.request();
  },

  async setCharacter(data) {
    this.cancelSkill();
    this.characterChanging = true; this.onSkillChange?.();
    const pos = this.playerPos.toArray();
    try {
      if (this.player) this.root.remove(this.player);
      await this.character(data, pos, true);
    } finally {
      this.characterChanging = false; this.onSkillChange?.();
      this.request();
    }
  },
};
