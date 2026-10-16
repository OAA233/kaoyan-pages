// Lighting, camera framing and the on-demand render loop (movement itself is in engine/navigation.js).
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import * as T from '../vendor/three.module.min.js';

export const view = {
  applyLight() {
    const bg = this.night
      ? '#364960'
      : {
          spring: '#dcefe8',
          summer: '#c3e8ea',
          autumn: '#f0dfc6',
          winter: '#dbe8ed',
        }[this.season];
    this.scene.background.set(bg);
    this.scene.fog =
      this.worldMode === 'interior' ? null : new T.Fog(bg, 90, 190);
    this.ambient.intensity = this.night ? 0.85 : 1.65;
    this.sun.intensity = this.night ? 0.45 : 1.35;
    this.sun.color.set(this.night ? '#b8c9f2' : '#fff9f0');
    for (const w of this.nightLights) {
      w.material.color.set(this.night ? '#f1d29b' : '#a6c9cc');
      w.material.emissiveIntensity = this.night ? 0.4 : 0;
    }
    this.request();
  },

  resize() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    this.renderer.setSize(r.width, r.height, false);
    this.aspect = r.width / r.height;
    if (this.overviewMode && this.interiorLayout?.overviewWidth)
      this.fitOverview();
    this.camera.updateProjectionMatrix();
    this.request();
  },

  reset() {
    this.cancelSkill();
    this.overviewMode = false;
    this.focusedWord = null;
    this.closeup = false;
    this.yaw = -0.48;
    this.pitch = 0.95;
    this.distance = this.worldMode === 'town' ? 25 : 25;
    this.request();
  },

  focusItem(id) {
    this.cancelSkill();
    this.focusedWord = id;
    const g = this.entities.get(id);
    if (!g) return;
    this.closeup = true;
    const box = new T.Box3().setFromObject(g);
    box.getCenter(this.focus);
    this.distance = Math.max(3, box.getSize(new T.Vector3()).length() * 1.8);
    this.request();
  },

  fitOverview() {
    const p = this.interiorLayout;
    this.distance = Math.max(
      p.overviewDistance || Math.max(...p.size) * 1.6,
      (p.overviewWidth || 0) / ((this.aspect || 1) * 0.8),
    );
  },

  overview() {
    this.cancelSkill();
    if (this.worldMode !== 'interior') return;
    this.overviewMode = true;
    this.closeup = true;
    this.focus.set(0, 0.4, 0);
    this.fitOverview();
    this.yaw = -0.2;
    this.pitch = this.interiorLayout.overviewPitch || 1.08;
    this.request();
  },

  goZone(index) {
    this.cancelSkill();
    this.overviewMode = false;
    const z = this.zones[index];
    if (!z) return;
    this.cancelWalk();
    this.playerVel.set(0, 0, 0);
    this.playerPos.set(z.entry[0], 0, z.entry[1]);
    this.closeup = false;
    this.distance = this.interiorLayout?.zoneDistance || 25;
    this.request();
  },

  zoom(delta) {
    this.distance = T.MathUtils.clamp(
      this.distance + delta,
      2.4,
      this.interiorLayout?.zoomMax || 125,
    );
    this.request();
  },

  request() {
    if (!this.frame) this.frame = requestAnimationFrame(() => this.render());
  },

  render() {
    this.frame = 0;
    this.tickAction();
    const dt = Math.min(this.clock.getDelta(), 0.05);
    let x = this.stick.x,
      y = this.stick.y;
    if (!this.disabled) {
      x +=
        (this.keys.has('d') || this.keys.has('ArrowRight') ? 1 : 0) -
        (this.keys.has('a') || this.keys.has('ArrowLeft') ? 1 : 0);
      y +=
        (this.keys.has('s') || this.keys.has('ArrowDown') ? 1 : 0) -
        (this.keys.has('w') || this.keys.has('ArrowUp') ? 1 : 0);
    }
    // Keys/stick steer directly and cancel a click-to-walk; otherwise follow the walk path.
    const steering = !this.disabled && (x || y);
    let want = null, arriving = 1;
    if (steering) {
      this.cancelWalk();
      const dir = new T.Vector3(x, 0, y).normalize().applyAxisAngle(new T.Vector3(0, 1, 0), this.yaw);
      want = { x: dir.x, z: dir.z };
    } else if (!this.disabled && this.path) {
      want = this.pathDirection();
      if (want) arriving = Math.min(1, want.remaining / 0.9);
    }
    const maxSpeed = 5.1 * this.walkSpeed;
    // Ease into and out of walking instead of starting and stopping instantly.
    const tx = want ? want.x * maxSpeed * Math.max(0.35, arriving) : 0, tz = want ? want.z * maxSpeed * Math.max(0.35, arriving) : 0;
    // The intended velocity (before easing); the online client reports this instead of every eased step.
    this.playerTarget = { x: tx, z: tz };
    const ease = 1 - Math.exp(-dt * (want ? 14 : 11));
    this.playerVel.x += (tx - this.playerVel.x) * ease;
    this.playerVel.z += (tz - this.playerVel.z) * ease;
    if (!want && Math.hypot(this.playerVel.x, this.playerVel.z) < 0.05) this.playerVel.set(0, 0, 0);
    const before = this.playerPos.clone();
    const moving = Math.hypot(this.playerVel.x, this.playerVel.z) > 0;
    if (moving) {
      if (this.overviewMode) {
        this.distance = 30;
        this.overviewMode = false;
      }
      this.closeup = false;
      this.moveBy(this.playerVel.x * dt, this.playerVel.z * dt);
    }
    let animating = moving;
    if (this.player) {
      this.player.position.copy(this.playerPos);
      this.playerLabel?.position.set(this.playerPos.x, this.player.userData.height + 0.45, this.playerPos.z);
      if (this.seated) this.player.userData.sprite.position.y = 0.88;
      else animating = this.animateFigure(this.player, (this.playerPos.x - before.x) / (dt || 1), (this.playerPos.z - before.z) / (dt || 1), dt, maxSpeed) || animating;
    }
    animating = this.tickSkill() || animating;
    animating = this.updateFigures(dt) || animating;
    animating = this.tickDust(dt) || animating;
    animating = this.tickMarker() || animating;
    animating = this.tickRemotes(dt) || animating;
    if (!this.closeup) {
      const desired = this.playerPos.clone().add(new T.Vector3(-Math.sin(this.yaw) * 1.1, 0.6, -Math.cos(this.yaw) * 1.1));
      const gap = this.focus.distanceTo(desired);
      // Glide after the player; jump straight there after a teleport (zone change, entering a venue).
      if (gap > 12) this.focus.copy(desired);
      else this.focus.lerp(desired, 1 - Math.exp(-dt * 9));
      if (gap > 0.01) animating = true;
    }
    if (moving || animating) this.updateOcclusion();
    const h = Math.cos(this.pitch) * this.distance;
    const target = this.focus.clone();
    if (this.closeup && !this.overviewMode && !this.skill && innerWidth <= 700)
      target.addScaledVector(
        new T.Vector3(
          -Math.sin(this.yaw) * Math.sin(this.pitch),
          Math.cos(this.pitch),
          -Math.cos(this.yaw) * Math.sin(this.pitch),
        ),
        -this.distance * 0.19,
      );
    this.camera.position.set(
      target.x + Math.sin(this.yaw) * h,
      target.y + Math.sin(this.pitch) * this.distance,
      target.z + Math.cos(this.yaw) * h,
    );
    this.camera.lookAt(target);
    const span = this.distance * 0.4;
    this.camera.left = -span * (this.aspect || 1);
    this.camera.right = span * (this.aspect || 1);
    this.camera.top = span;
    this.camera.bottom = -span;
    this.camera.updateProjectionMatrix();
    // Floating area/name labels are UI annotations, never sliced by geometry.
    // Suppress overlapping annotations at distant zoom instead of drawing one through another.
    this.camera.updateMatrixWorld();
    const labelRects = [];
    for (const g of this.labels) {
      if (g.userData.screenLabel)
        g.scale.setScalar(
          (((g.userData.labelPixelHeight || 20) / this.canvas.clientHeight) *
            (this.camera.top - this.camera.bottom)) /
            (g.userData.labelSize?.[1] || 2),
        );
      g.quaternion.copy(this.camera.quaternion);
      const pos = g.position.clone().project(this.camera),
        [w, h] = g.userData.labelSize;
      g.visible =
        !g.userData.culled && // a remote learner beyond the nearest 40 (REQ-115)
        (this.overviewMode ||
          g.position.distanceTo(this.camera.position) < 60) &&
        Math.abs(pos.x) < 1.03 &&
        Math.abs(pos.y) < 1.03 &&
        Math.abs(pos.z) < 1;
      if (!g.visible) continue;
      const rect = {
        x: ((pos.x + 1) * this.canvas.clientWidth) / 2,
        y: ((1 - pos.y) * this.canvas.clientHeight) / 2,
        w:
          ((w * g.scale.x) / (this.camera.right - this.camera.left)) *
            this.canvas.clientWidth +
          8,
        h:
          ((h * g.scale.y) / (this.camera.top - this.camera.bottom)) *
            this.canvas.clientHeight +
          7,
      };
      if (
        labelRects.some(
          (r) =>
            Math.abs(r.x - rect.x) < (r.w + rect.w) / 2 &&
            Math.abs(r.y - rect.y) < (r.h + rect.h) / 2,
        )
      )
        g.visible = false;
      else labelRects.push(rect);
    }
    this.sun.target.position.copy(this.focus);
    this.sun.position.copy(this.focus).add(new T.Vector3(-20, 35, 15));
    let near = null,
      min = 3.5;
    for (const e of this.entrances) {
      const d = Math.hypot(this.playerPos.x - e.x, this.playerPos.z - e.z);
      if (d < min) {
        near = e.data;
        min = d;
      }
    }
    // A person standing closer than the nearest doorway gets the prompt (talk instead of enter/leave).
    let talkDistance = 2.4;
    for (const g of this.figures) {
      const d = Math.hypot(this.playerPos.x - g.position.x, this.playerPos.z - g.position.z);
      if (d < talkDistance && d < min && g.userData.talk) {
        talkDistance = d;
        near = g.userData.talk;
      }
    }
    this.onNear?.(near);
    this.onUpdate?.();
    this.renderer.render(this.scene, this.camera);
    if (animating || this.action) this.request();
  },
};
