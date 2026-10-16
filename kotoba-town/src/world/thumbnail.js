// Offscreen thumbnails of learnable items.
// Mixed into TownWorld.prototype; `this` is the TownWorld instance.
import * as T from '../vendor/three.module.min.js';

export const thumbnail = {
  thumbnail(w) {
    const key = (w.id || w.jp) + '|' + w.kind;
    if (this.thumbCache.has(key)) return this.thumbCache.get(key);
    if (!this.thumbRenderer) {
      this.thumbRenderer = new T.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      this.thumbRenderer.setSize(240, 190);
      this.thumbRenderer.outputColorSpace = T.SRGBColorSpace;
    }
    const stage = new T.Scene(),
      g = new T.Group();
    stage.add(g);
    this.buildModel(g, w);
    const bounds = new T.Box3().setFromObject(g),
      center = bounds.getCenter(new T.Vector3()),
      size = bounds.getSize(new T.Vector3());
    g.position.sub(center);
    const light = new T.DirectionalLight('#fff9ef', 1.4);
    light.position.set(-3, 7, 6);
    stage.add(light, new T.HemisphereLight('#ffffff', '#b6c1b1', 1.7));
    const radius = Math.max(size.length() * 0.55, 0.15),
      cam = new T.PerspectiveCamera(35, 240 / 190, 0.01, 100);
    cam.position.set(radius * 1.7, radius * 1.35, radius * 2.6);
    cam.lookAt(0, 0, 0);
    this.thumbRenderer.render(stage, cam);
    const url = this.thumbRenderer.domElement.toDataURL('image/png');
    this.thumbCache.set(key, url);
    const shared = new Set(this.materials.values());
    g.traverse((o) => {
      if (o.material && !shared.has(o.material)) o.material.dispose();
    });
    return url;
  },
};
