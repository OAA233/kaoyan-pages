// Geometry/material caches and small mesh helpers shared by every builder.
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import * as T from '../vendor/three.module.min.js';

export const primitives = {
  geo(k, a) {
    const key = k + JSON.stringify(a);
    if (!this.geometries.has(key)) {
      let geometry;
      if (k === 'box' && Math.min(...a) > 0.075) {
        const [w, h, d] = a,
          r = Math.min(0.085, Math.min(w, h, d) * 0.21),
          q = new T.Shape();
        q.moveTo(-w / 2 + r, -h / 2);
        q.lineTo(w / 2 - r, -h / 2);
        q.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        q.lineTo(w / 2, h / 2 - r);
        q.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        q.lineTo(-w / 2 + r, h / 2);
        q.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        q.lineTo(-w / 2, -h / 2 + r);
        q.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
        geometry = new T.ExtrudeGeometry(q, {
          depth: d - 2 * r,
          bevelEnabled: true,
          bevelSize: r * 0.28,
          bevelThickness: r,
          bevelSegments: 2,
          steps: 1,
          curveSegments: 3,
        });
        geometry.translate(0, 0, -d / 2 + r);
      } else {
        const C = {
          box: T.BoxGeometry,
          cylinder: T.CylinderGeometry,
          sphere: T.SphereGeometry,
          cone: T.ConeGeometry,
          torus: T.TorusGeometry,
          plane: T.PlaneGeometry,
        };
        geometry = new (C[k] || T.BoxGeometry)(...a);
      }
      this.geometries.set(key, geometry);
    }
    return this.geometries.get(key);
  },

  mat(c, extra = {}) {
    const key = c + JSON.stringify(extra);
    if (!this.materials.has(key))
      this.materials.set(key, new T.MeshToonMaterial({ color: c, ...extra }));
    return this.materials.get(key);
  },

  mesh(p, k, a, c, xyz = [0, 0, 0], rot = [0, 0, 0], extra = {}) {
    const m = new T.Mesh(this.geo(k, a), this.mat(c, extra));
    m.position.set(...xyz);
    m.rotation.set(...rot);
    m.castShadow = true;
    m.receiveShadow = true;
    p.add(m);
    return m;
  },

  box(p, w, h, d, c, xyz = [0, 0, 0], r = [0, 0, 0], e = {}) {
    return this.mesh(p, 'box', [w, h, d], c, xyz, r, e);
  },

  cyl(p, rt, rb, h, c, xyz = [0, 0, 0], r = [0, 0, 0], n = 16) {
    return this.mesh(p, 'cylinder', [rt, rb, h, n], c, xyz, r);
  },

  sphere(p, r, c, xyz = [0, 0, 0], scale = [1, 1, 1]) {
    const m = this.mesh(p, 'sphere', [r, 14, 10], c, xyz);
    m.scale.set(...scale);
    return m;
  },

  group(word, xyz = [0, 0, 0], angle = 0, parent = this.root) {
    const g = new T.Group();
    g.position.set(...xyz);
    g.rotation.y = angle;
    parent.add(g);
    if (word) g.userData.word = word;
    return g;
  },

  rod(p, a, b, r, c) {
    const A = new T.Vector3(...a),
      B = new T.Vector3(...b),
      v = B.clone().sub(A);
    const m = this.cyl(
      p,
      r,
      r,
      v.length(),
      c,
      A.clone().add(B).multiplyScalar(0.5).toArray(),
    );
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize());
    return m;
  },

  textPlane(p, w, h, xyz, angle, draw) {
    if (w && typeof w === 'object') {
      const opt = w;
      return this.textPlane(
        p,
        opt.w,
        opt.h,
        opt.p || [0, 0, 0],
        opt.ry || 0,
        (x, W, H) => {
          x.fillStyle = opt.bg || '#fff9e9';
          x.fillRect(0, 0, W, H);
          opt.draw?.(x, W, H);
        },
      );
    }
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = Math.max(80, Math.round((512 * h) / w));
    draw(c.getContext('2d'), c.width, c.height);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    this.textures.push(tex);
    const m = new T.Mesh(
      this.geo('plane', [w, h]),
      new T.MeshBasicMaterial({
        map: tex,
        side: T.DoubleSide,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
      }),
    );
    m.position.set(...xyz);
    m.rotation.y = angle || 0;
    p.add(m);
    return m;
  },

  label(
    p,
    text,
    w,
    h,
    xyz = [0, 0, 0],
    angle = 0,
    bg = '#fff9e9',
    color = '#405c5e',
  ) {
    return this.textPlane(p, w, h, xyz, angle, (x, W, H) => {
      x.fillStyle = bg;
      x.fillRect(0, 0, W, H);
      x.fillStyle = color;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.font =
        '700 ' +
        Math.min(H * 0.6, (W / Math.max(text.length, 2)) * 0.9) +
        'px "Yu Gothic",sans-serif';
      x.fillText(text, W / 2, H / 2, W * 0.93);
    });
  },

  spriteLabel(text, pos, w = 3, color = '#355859') {
    const g = this.group(null, pos);
    const m = this.label(g, text, w, 0.48, [0, 0, 0], 0, '#fffaf0', color);
    m.material.depthTest = false;
    m.renderOrder = 20;
    g.userData.billboard = true;
    g.userData.labelSize = [w, 0.48];
    this.labels.push(g);
    return g;
  },

  collider(x, z, w, d) {
    this.colliders.push({ x, z, w, d });
  },
};
