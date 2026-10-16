import * as T from '../vendor/three.module.min.js';
import { skillsFor } from './skill-catalog.js';
import { loadEffects, poseSkill } from './skill-runtime.js';
const smooth = t => { t = T.MathUtils.clamp(t, 0, 1); return t * t * (3 - 2 * t); };

export const characterSkills = {
  async playSkill(index = 0) {
    const player = this.player, definition = skillsFor(player?.userData.character.id)[index];
    if (!definition || this.characterChanging || this.disabled || this.skill || this.skillLoading || document.hidden) return false;
    this.cancelAction();
    const token = this.skillToken = (this.skillToken || 0) + 1;
    this.skillLoading = true;
    this.onSkillChange?.();
    try {
      const { createSkillEffect } = await loadEffects();
      if (token !== this.skillToken || this.player !== player || this.disabled || document.hidden) return false;
      this.cancelWalk(); this.keys.clear(); this.stick = { x: 0, y: 0 }; this.playerVel.set(0, 0, 0);
      const sprite = player.userData.sprite;
      const camera = { focus: this.focus.clone(), distance: this.distance, yaw: this.yaw, pitch: this.pitch, closeup: this.closeup, overviewMode: this.overviewMode, focusedWord: this.focusedWord };
      const pose = { scale: sprite.scale.clone(), position: sprite.position.clone(), rotation: sprite.material.rotation, depthTest: sprite.material.depthTest, renderOrder: sprite.renderOrder, visible: sprite.visible, seated: this.seated };
      const scale = player.userData.height / 3;
      const yaw = this.yaw + (innerWidth <= 700 ? .95 : .18);
      const effect = createSkillEffect(definition.id, { scale, yaw, origin: this.playerPos, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches });
      this.scene.add(effect.root);
      const target = new T.Vector3((definition.id === 'gates' ? 1 : 2.6) * scale, 1.4 * scale, 0).applyAxisAngle(new T.Vector3(0, 1, 0), yaw).add(this.playerPos);
      this.skill = { token, definition, effect, player, sprite, camera, pose, target, started: performance.now(), elapsed: 0 };
      sprite.material.depthTest = false; sprite.renderOrder = 25;
      this.seated = false; this.overviewMode = false; this.closeup = true; this.focusedWord = null;
      this.request();
      this.onSkillStart?.({ i: index, y: yaw, n: token });
      return true;
    } catch (error) {
      console.error('Character animation could not start', error);
      this.onSkillError?.();
      return false;
    } finally {
      if (token === this.skillToken) { this.skillLoading = false; this.onSkillChange?.(); }
    }
  },

  cancelSkill() {
    this.skillToken = (this.skillToken || 0) + 1;
    this.skillLoading = false;
    const s = this.skill;
    this.skill = null;
    if (s) {
      this.onSkillEnd?.(s.token);
      s.effect.dispose();
      const { camera: c, sprite, pose: p } = s;
      this.focus.copy(c.focus); this.distance = c.distance; this.yaw = c.yaw; this.pitch = c.pitch;
      this.closeup = c.closeup; this.overviewMode = c.overviewMode; this.focusedWord = c.focusedWord;
      sprite.scale.copy(p.scale); sprite.position.copy(p.position); sprite.material.rotation = p.rotation;
      sprite.material.depthTest = p.depthTest; sprite.renderOrder = p.renderOrder; sprite.visible = p.visible;
      this.seated = p.seated;
      this.updateOcclusion(true);
      this.request();
    }
    this.onSkillChange?.();
  },

  tickSkill() {
    const s = this.skill;
    if (!s) return false;
    const t = (performance.now() - s.started) / 1000, d = s.definition.duration;
    s.elapsed = t;
    if (t >= d || s.player !== this.player) { this.cancelSkill(); return false; }
    s.effect.update(t, d);
    const blend = smooth(t / .45) * smooth((d - t) / .6);
    this.focus.copy(s.camera.focus).lerp(s.target, blend);
    this.distance = T.MathUtils.lerp(s.camera.distance, innerWidth <= 700 ? (s.definition.id === 'gates' ? 30 : 23) : 18, blend);
    this.pitch = T.MathUtils.lerp(s.camera.pitch, .72, blend);
    poseSkill(s.player, s.sprite, s.definition.id, t, d);
    this.onSkillFrame?.(t / d);
    return true;
  },
};
