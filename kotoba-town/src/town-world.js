import * as T from './vendor/three.module.min.js';
import { createGameModels } from './game-models.js';
import { buildParkZone } from './game-parks.js';
import { primitives } from './world/primitives.js';
import { characters } from './actors/characters.js';
import { builders } from './world/builders.js';
import { view } from './engine/view.js';
import { input } from './engine/input.js';
import { thumbnail } from './world/thumbnail.js';
import { actions } from './world/actions.js';
import { paperDoll } from './actors/paper-doll.js';
import { navigation } from './engine/navigation.js';
import { occlusion } from './engine/occlusion.js';
import { characterSkills } from './actors/skills.js';
import { remotes } from './actors/remotes.js';
import { remoteSkills } from './actors/remote-skills.js';

export class TownWorld {
  constructor(canvas, onPick, onNear, onUpdate) {
    this.buildParkZone = (...args) => buildParkZone(this, ...args);
    this.THREE = T;
    this.canvas = canvas;
    this.onPick = onPick;
    this.onNear = onNear;
    this.onUpdate = onUpdate;
    this.scene = new T.Scene();
    this.scene.background = new T.Color('#cce8df');
    this.renderer = new T.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    this.camera = new T.OrthographicCamera(-16, 16, 10, -10, 0.1, 260);
    this.ambient = new T.HemisphereLight('#ffffff', '#b7c5bb', 1.7);
    this.scene.add(this.ambient);
    this.sun = new T.DirectionalLight('#fff4db', 2.2);
    this.sun.position.set(-20, 35, 15);
    this.sun.castShadow = true;
    Object.assign(this.sun.shadow.camera, {
      left: -30,
      right: 30,
      top: 30,
      bottom: -30,
      near: 1,
      far: 90,
    });
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0007;
    this.scene.add(this.sun, this.sun.target);
    this.root = new T.Group();
    this.scene.add(this.root);
    this.nightLights = [];
    this.geometries = new Map();
    this.materials = new Map();
    this.textures = [];
    this.characterTextures = new Map();
    this.playerPos = new T.Vector3(0, 0, 0);
    this.playerVel = new T.Vector3(0, 0, 0);
    this.figures = [];
    this.focus = new T.Vector3();
    this.yaw = -0.48;
    this.pitch = 0.95;
    this.distance = 22;
    this.lookSpeed = 1;
    this.walkSpeed = 1;
    this.labels = [];
    this.zones = [];
    this.entrances = [];
    this.bounds = [-60, 60, -60, 60];
    this.modelErrors = [];
    this.thumbCache = new Map();
    this.colliders = [];
    this.pickables = [];
    this.entities = new Map();
    this.keys = new Set();
    this.stick = { x: 0, y: 0 };
    this.pointers = new Map();
    this.disabled = false;
    this.closeup = false;
    this.season = 'spring';
    this.night = false;
    this.ray = new T.Raycaster();
    this.ndc = new T.Vector2();
    this.clock = new T.Clock();
    this.frame = 0;
    this.models = createGameModels({
      T,
      scene: this.root,
      box: this.box.bind(this),
      cyl: this.cyl.bind(this),
      sphere: this.sphere.bind(this),
      mesh: this.mesh.bind(this),
      group: this.group.bind(this),
      rod: this.rod.bind(this),
      label: this.label.bind(this),
      textPlane: this.textPlane.bind(this),
      mat: this.mat.bind(this),
      geo: this.geo.bind(this),
      collision: () => {},
    });
    this.bindInput();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement);
    this.resize();
  }
  clear() {
    this.sceneCleanup?.();
    this.sceneCleanup = null;
    delete this.canvas.parentElement.dataset.usjPark;
    this.camera.far = 260;
    this.interiorLayout = null;
    this.buildingFloor = null;
    this.overviewMode = false;
    this.focusedWord = null;
    this.cancelAction();
    this.player = null;
    this.playerVel.set(0, 0, 0);
    this.resetPaperDoll();
    this.resetNavigation();
    this.resetOcclusion();
    this.clearRemotes();
    this.pickables = [];
    this.entities.clear();
    this.colliders = [];
    this.labels = [];
    this.zones = [];
    this.entrances = [];
    this.closeup = false;
    this.seated = false;
    this.keys.clear();
    this.stick = { x: 0, y: 0 };
    const shared = new Set(this.materials.values());
    this.root.traverse((o) => {
      if (o.material && !shared.has(o.material)) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
    this.root.clear();
    this.nightLights = [];
    for (const t of this.textures) t.dispose();
    this.textures = [];
    for (const g of this.geometries.values()) g.dispose();
    this.geometries.clear();
    for (const m of this.materials.values()) m.dispose();
    this.materials.clear();
  }
  register(g, kind, data) {
    // Whole-building ground stays decorative, including when a zone maps a word to it.
    if (kind === 'word' && g === this.buildingFloor) {
      if (data?.id) this.entities.set(data.id, g);
      return g;
    }
    g.userData.target = { kind, data };
    this.pickables.push(g);
    if (data?.id && !this.entities.has(data.id)) this.entities.set(data.id, g);
    return g;
  }
  diagnostics() {
    return {
      mode: this.worldMode,
      scene: this.data?.id || 'town',
      words: this.data?.items.length || 0,
      zones: this.zones.length,
      position: this.playerPos.toArray(),
      yaw: this.yaw,
      pitch: this.pitch,
      distance: this.distance,
      colliders: this.colliders.length,
      models: this.modelErrors || [],
      disabled: this.disabled,
      season: this.season,
      night: this.night,
      drawCalls: this.renderer.info.render.calls,
    };
  }
}

// Methods live in focused modules; mixing them in keeps every call site and `this` unchanged.
Object.assign(TownWorld.prototype, primitives, characters, builders, view, input, thumbnail, actions, paperDoll, navigation, occlusion, remotes, characterSkills, remoteSkills);
