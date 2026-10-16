// Highlighting and animated learning actions.
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import * as T from '../vendor/three.module.min.js';

export const actions = {
  highlight(id) {
    const g = this.entities.get(id);
    if (!g) return;
    const pos = g.getWorldPosition(new T.Vector3());
    if (this.halo) this.halo.removeFromParent();
    this.halo = this.mesh(
      this.root,
      'torus',
      [0.68, 0.045, 6, 32],
      '#f1c16c',
      [pos.x, 0.06, pos.z],
      [Math.PI / 2, 0, 0],
    );
    this.request();
  },

  cancelAction() {
    this.cancelSkill();
    if (this.action) {
      this.action.cleanup?.();
      this.action = null;
    }
    if (this.actionTemp) {
      this.actionTemp.removeFromParent();
      this.actionTemp = null;
    }
  },

  perform(w, type) {
    this.cancelAction();
    let g = this.entities.get(w.id);
    if (!g) return;
    // Menu selections create the selected dish; never animate the physical menu as food.
    if (w.menuOnly) {
      g = this.group(null, [this.playerPos.x, 1.1, this.playerPos.z - 1.2]);
      this.models.model(g, w);
      this.actionTemp = g;
    }
    this.keys.clear();
    this.closeup = true;
    const bounds = new T.Box3().setFromObject(g),
      center = bounds.getCenter(new T.Vector3());
    this.focus.copy(center).add(new T.Vector3(0, 0.25, 0.55));
    this.distance = 5;
    const original = g.position.clone(),
      rotation = g.rotation.clone(),
      originalScale = g.scale.clone();
    let part = g.getObjectByName(g.userData.movingPart || 'opening-panel');
    if (type === 'light-on' || type === 'light-off') {
      this.roomDark = type === 'light-off';
      this.ambient.intensity = this.roomDark ? 0.65 : this.night ? 1.4 : 2.7;
      this.sun.intensity = this.roomDark ? 0.3 : this.night ? 0.65 : 2;
      this.request();
      return;
    }
    if (type === 'sit' || type === 'stand') {
      this.cancelWalk();
      this.playerVel.set(0, 0, 0);
      this.playerPos.set(center.x, 0, center.z + 0.45);
      this.seated = type === 'sit';
      const h = this.player.userData.height || 2.25;
      this.player.userData.sprite.scale.set(
        h * 0.7,
        this.seated ? h * 0.78 : h,
        1,
      );
      this.player.userData.sprite.position.y = this.seated
        ? 0.88
        : h / 2 + 0.05;
      this.request();
      return;
    }
    if (type === 'open' || type === 'close') {
      if (!part || g.userData.sliding) {
        part = part || g.children.find((o) => o.isMesh);
        if (part) {
          part.userData.shutPosition ??= part.position.clone();
          part.position.x =
            part.userData.shutPosition.x + (type === 'open' ? 0.55 : 0);
        }
      } else {
        if (part.userData.shutRotation === undefined)
          part.userData.shutRotation = part.rotation.y;
        part.rotation.y =
          part.userData.shutRotation + (type === 'open' ? -0.95 : 0);
      }
      this.request();
      return;
    }
    const from = this.playerPos.clone(),
      near = new T.Vector3(center.x, 0, center.z + 1.05),
      start = performance.now(),
      duration = matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 250
        : 1800;
    if (['eat', 'drink', 'read', 'wear', 'wash'].includes(type)) {
      this.cancelWalk();
      this.playerVel.set(0, 0, 0);
      this.playerPos.copy(near);
    }
    let bubbles = [];
    if (type === 'wash') {
      this.actionTemp = this.group(null);
      for (let i = 0; i < 7; i++)
        bubbles.push(
          this.sphere(this.actionTemp, 0.05, '#9ad4d4', [
            center.x + (i % 3) * 0.1 - 0.1,
            center.y + 0.3,
            center.z + 0.1,
          ]),
        );
    }
    this.action = {
      cleanup: () => {
        g.position.copy(original);
        g.rotation.copy(rotation);
        g.scale.copy(originalScale);
        if (this.actionTemp) {
          this.actionTemp.removeFromParent();
          this.actionTemp = null;
        }
      },
      update: (u) => {
        if (['eat', 'drink', 'read', 'wear'].includes(type)) {
          const dest = new T.Vector3(
            near.x,
            this.seated ? 1.4 : 1.9,
            near.z + 0.1,
          );
          g.position.lerpVectors(
            original,
            g.parent.worldToLocal(dest.clone()),
            Math.sin(Math.PI * u) * 0.85,
          );
          if (type === 'drink')
            g.rotation.z = rotation.z + Math.sin(u * Math.PI) * 0.7;
          if (type === 'eat')
            g.scale
              .copy(originalScale)
              .multiplyScalar(1 - Math.sin(u * Math.PI) * 0.18);
        }
        if (type === 'bounce')
          g.position.y =
            original.y + Math.abs(Math.sin(u * Math.PI * 4)) * 0.75;
        if (type === 'throw') {
          g.position.y = original.y + Math.sin(u * Math.PI) * 2;
          g.position.z = original.z - u * 2;
        }
        if (type === 'grill') {
          g.rotation.y = rotation.y + Math.sin(u * Math.PI) * Math.PI;
          g.position.y = original.y + Math.sin(u * Math.PI) * 0.15;
        }
        if (type === 'ring' || type === 'sweep')
          g.rotation.z =
            rotation.z +
            Math.sin(u * Math.PI * 5) * (type === 'ring' ? 0.2 : 0.35);
        if (type === 'wash')
          bubbles.forEach((b, i) => {
            b.position.y = center.y + 0.5 - ((u * 2 + i / 7) % 1) * 0.7;
          });
        if (['board', 'alight', 'enter', 'leave'].includes(type)) {
          const to = new T.Vector3(
            center.x,
            0,
            center.z + (type === 'board' || type === 'enter' ? 0 : 1.8),
          );
          this.playerPos.lerpVectors(near, to, u);
        }
      },
      start,
      duration,
    };
    this.request();
  },

  tickAction() {
    if (!this.action) return;
    const a = this.action,
      u = Math.min(1, (performance.now() - a.start) / a.duration);
    a.update(u);
    if (u >= 1) {
      a.cleanup?.();
      this.action = null;
    }
  },
};
