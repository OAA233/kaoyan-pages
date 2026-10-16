// Pointer, keyboard and touch input, and picking.
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import * as T from '../vendor/three.module.min.js';

export const input = {
  pick(clientX, clientY) {
    const b = this.canvas.getBoundingClientRect();
    this.ndc.set(
      ((clientX - b.left) / b.width) * 2 - 1,
      (-(clientY - b.top) / b.height) * 2 + 1,
    );
    this.ray.setFromCamera(this.ndc, this.camera);
    let glassTarget = null;
    const deliver = (target) => {
      if (target?.kind === 'word' && target.object)
        this.entities.set(target.data.id, target.object);
      if (target) this.onPick?.(target);
      return target;
    };
    // These visible labels are drawn above geometry; picking must follow the same priority.
    if (this.worldMode === 'town')
      for (const hit of this.ray.intersectObjects(
        this.labels.filter((g) => g.visible && g.userData.entrance),
        true,
      )) {
        let g = hit.object;
        while (g && !g.userData.target) g = g.parent;
        if (g) return deliver({ ...g.userData.target, object: g });
      }
    for (const hit of this.ray.intersectObject(this.root, true)) {
      if (hit.object.parent?.userData.entrance && !hit.object.parent.visible)
        continue;
      let g = hit.object;
      while (g && !g.userData.target && g !== this.player) g = g.parent;
      if (this.player && g === this.player) continue;
      if (g?.userData.remote && !g.visible) continue; // hidden (not among the nearest) learners cannot be picked
      const m = hit.object.material;
      if (g) {
        const focused =
          this.focusedWord &&
          this.entities.get(this.focusedWord) === g &&
          this.data?.items.find((w) => w.id === this.focusedWord);
        const target = focused
          ? { kind: 'word', data: focused, object: g }
          : { ...g.userData.target, object: g };
        if (m?.transparent && m.opacity < 0.4) {
          glassTarget ??= target;
          continue;
        }
        return deliver(
          glassTarget && target.data?.kind === 'tank' ? glassTarget : target,
        );
      }
      // Decorative labels and translucent glass do not hide the object behind them.
      if (
        hit.object === this.halo ||
        m?.isMeshBasicMaterial ||
        (m?.transparent && m.opacity < 0.4)
      )
        continue;
      return deliver(glassTarget);
    }
    return deliver(glassTarget);
  },

  bindInput() {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => {
      if (this.disabled) return;
      c.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
        sx: e.clientX,
        sy: e.clientY,
        moved: false,
      });
      if (this.pointers.size === 2) {
        this.pinch = this.pointerDistance();
        for (const p of this.pointers.values()) p.moved = true;
      }
    });
    c.addEventListener('pointermove', (e) => {
      const p = this.pointers.get(e.pointerId);
      if (!p || this.disabled) return;
      const dx = e.clientX - p.x,
        dy = e.clientY - p.y;
      if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 6) p.moved = true;
      p.x = e.clientX;
      p.y = e.clientY;
      if (this.skill && (p.moved || this.pointers.size === 2)) this.cancelSkill();
      if (this.pointers.size === 2) {
        const d = this.pointerDistance();
        if (this.pinch)
          this.distance = T.MathUtils.clamp(
            (this.distance * this.pinch) / d,
            2.4,
            this.interiorLayout?.zoomMax || 125,
          );
        this.pinch = d;
      } else if (p.moved) {
        this.yaw += dx * 0.006 * this.lookSpeed;
        this.pitch = T.MathUtils.clamp(
          this.pitch + dy * 0.004 * this.lookSpeed,
          0.35,
          1.35,
        );
      }
      this.request();
    });
    const end = (e) => {
      const p = this.pointers.get(e.pointerId);
      this.pointers.delete(e.pointerId);
      // Pointer input only looks and selects. Movement comes from keys or the touch joystick.
      if (p && !p.moved && e.type === 'pointerup' && !this.disabled)
        this.pick(e.clientX, e.clientY);
      this.pinch = null;
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        if (!this.disabled) { this.cancelSkill(); this.zoom(e.deltaY * 0.015); }
      },
      { passive: false },
    );
    // Physical keys (e.code): with a Chinese/Japanese input method on, e.key reads "Process", and
    // Caps Lock or Shift turns it into "W"; either way walking stopped until the IME was switched off.
    const MOVE_KEYS = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight' };
    window.addEventListener('keydown', (e) => {
      if (/input|select|textarea/i.test(e.target.tagName) || e.target.isContentEditable) return;
      const key = MOVE_KEYS[e.code];
      if (key && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!this.disabled) {
          e.preventDefault();
          this.cancelSkill();
          this.cancelWalk();
          this.keys.add(key);
          this.request();
        }
      }
    });
    window.addEventListener('keyup', (e) => { const key = MOVE_KEYS[e.code]; if (key) this.keys.delete(key); });
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.stick = { x: 0, y: 0 };
      this.pointers.clear();
    });
  },

  pointerDistance() {
    const [a, b] = [...this.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  },
};
