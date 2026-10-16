// Room-validated one-shot performances. No observer camera or controls are changed.
import * as T from '../vendor/three.module.min.js';
import { skillsFor } from './skill-catalog.js';
import { loadEffects, poseSkill } from './skill-runtime.js';

export const remoteSkills = {
  async startRemoteSkill(id, message) {
    const e = this.remotes?.get(id), definition = skillsFor(message.c)[message.i];
    if (!e || e.character !== message.c || !definition) return;
    if (e.culled) return; // not among the nearest drawn learners (REQ-115): no effect for a hidden figure
    // An image may still be downloading when the start frame arrives.
    const event = { ...message, received: message.received ?? performance.now() };
    this.cancelRemoteSkill(id);
    e.pendingSkill = event;
    if (!e.ready) return;
    try {
      const { createSkillEffect } = await loadEffects();
      if (this.remotes?.get(id) !== e || e.pendingSkill !== event) return;
      e.pendingSkill = null;
      if (performance.now() - event.received >= definition.duration * 1000) return;
      const sprite = e.group.userData.sprite;
      const pose = { scale: sprite.scale.clone(), position: sprite.position.clone(), rotation: sprite.material.rotation, depthTest: sprite.material.depthTest, renderOrder: sprite.renderOrder };
      const origin = new T.Vector3(event.x, 0, event.z);
      const effect = createSkillEffect(definition.id, { scale: e.height / 3, yaw: event.y, origin, reduced: true });
      this.scene.add(effect.root);
      e.group.position.copy(origin);
      e.state = { ...e.state, x: event.x, z: event.z, vx: 0, vz: 0, t: performance.now() };
      e.skill = { n: event.n, definition, effect, sprite, pose, started: event.received };
      sprite.material.depthTest = false; sprite.renderOrder = 25;
      this.request();
    } catch (error) {
      if (e.pendingSkill === event) e.pendingSkill = null;
      console.warn('Remote character animation could not start', error);
    }
  },

  cancelRemoteSkill(id, sequence) {
    const e = this.remotes?.get(id);
    if (!e) return;
    if (sequence !== undefined && sequence !== (e.skill?.n ?? e.pendingSkill?.n)) return;
    e.pendingSkill = null;
    const s = e.skill; e.skill = null;
    if (!s) return;
    s.effect.dispose();
    s.sprite.scale.copy(s.pose.scale); s.sprite.position.copy(s.pose.position);
    s.sprite.material.rotation = s.pose.rotation; s.sprite.material.depthTest = s.pose.depthTest;
    s.sprite.renderOrder = s.pose.renderOrder;
    this.request();
  },

  tickRemoteSkill(e, now) {
    const s = e.skill;
    if (!s) return false;
    const t = (now - s.started) / 1000, d = s.definition.duration;
    if (t >= d) { this.cancelRemoteSkill(e.id); return false; }
    s.effect.update(t, d);
    poseSkill(e.group, s.sprite, s.definition.id, t, d);
    return true;
  },
};
