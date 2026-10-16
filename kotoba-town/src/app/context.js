import {TownBGM} from '../town-bgm.js';
export const $ = (id) => document.getElementById(id);
export const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
export const node = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};
export const chinese = (tag, text, cls = '') => {
  const el = node(tag, 'translation ' + cls, text);
  el.lang = 'zh-CN';
  return el;
};
// Mutable app-wide state shared by the app/ modules.
export const app = {
  storageOK: true,
  saved: {},
  townReturn: null,
  catalog: [],
  characters: [],
  world: undefined,
  data: null,
  npc: null,
  selected: null,
  near: null,
  busy: false,
  panelKind: '',
  lastFocus: null,
  toastTimer: undefined,
};
try {
  app.saved = JSON.parse(localStorage.getItem('kotobamachi-v1') || '{}') || {};
} catch {
  app.storageOK = false;
}
export const clamp = (v, a, b, d) =>
  Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d;
export const state = {
  character: typeof app.saved.character === 'string' ? app.saved.character : 'anon',
  season: ['spring', 'summer', 'autumn', 'winter'].includes(app.saved.season)
    ? app.saved.season
    : 'spring',
  night: !!app.saved.night,
  look: clamp(app.saved.look, 0.25, 2.5, 1),
  walk: clamp(app.saved.walk, 0.5, 3, 1),
  learned: new Set(
    Array.isArray(app.saved.learned)
      ? app.saved.learned.filter((x) => typeof x === 'string')
      : [],
  ),
  tasks: app.saved.tasks && typeof app.saved.tasks === 'object' ? app.saved.tasks : {},
  // Learners muted on this device in the online town: [{id, name}] (REQ-103).
  muted: Array.isArray(app.saved.muted)
    ? app.saved.muted.filter((m) => m && typeof m.id === 'string').map((m) => ({ id: m.id, name: String(m.name || '') }))
    : [],
  band: ['basic', 'middle', 'advanced'].includes(app.saved.band)
    ? app.saved.band
    : 'basic',
};
export const cache = new Map();
export const districtNames = [
  '学校・スポーツ',
  '食事・喫茶',
  '買い物',
  '文化・レジャー',
  '日々の暮らし',
  '街並み・お祭り',
];
export const icons = {
  school: '🏫',
  sports: '🏀',
  restaurant: '🍵',
  retail: '🛍',
  aquarium: '🐠',
  temple: '⛩',
  home: '🏠',
  bath: '♨',
  arcade: '🕹',
  karaoke: '🎤',
  netcafe: '☕',
  clinic: '✚',
  station: '🚃',
  service: '✉',
  laundry: '🧺',
  street: '🌳',
  festival: '🏮',
  park: '🎡',
  district: '🏮',
};
export const seasons = {
  spring: '桜の春',
  summer: '緑の夏',
  autumn: '紅葉の秋',
  winter: '雪の冬',
};
export function toast(message) {
  clearTimeout(app.toastTimer);
  $('toast').textContent = message;
  $('toast').hidden = false;
  app.toastTimer = setTimeout(() => ($('toast').hidden = true), 3600);
}
export function save() {
  try {
    localStorage.setItem(
      'kotobamachi-v1',
      JSON.stringify({ ...state, learned: [...state.learned] }),
    );
  } catch {
    if (app.storageOK) toast('保存できませんでした。このまま探索を続けられます。');
    app.storageOK = false;
  }
}
export const bgm = new TownBGM(updateBGMUI, message => toast(message));
export function updateBGMUI(){
 const enabled=bgm.enabled;
 for(const id of ['bgm-toggle','bgm-setting-toggle']){const b=$(id);if(!b)continue;b.setAttribute('aria-pressed',String(enabled));b.classList.toggle('selected',enabled);b.setAttribute('aria-label',enabled?'BGMをオフにする':'BGMを小さな音でオンにする');}
 if($('bgm-badge'))$('bgm-badge').textContent=enabled?'ON':'OFF';
 if($('bgm-setting-toggle'))$('bgm-setting-toggle').textContent=enabled?'♫ オン':'♫ オフ';
 if($('bgm-volume'))$('bgm-volume').value=bgm.volume;
 if($('bgm-volume-value'))$('bgm-volume-value').textContent=bgm.volume+'%';
 if($('bgm-status'))$('bgm-status').textContent=bgm.phase==='loading'?'音楽を準備しています…':bgm.phase==='paused'?'画面を離れている間は一時停止します。':enabled?(bgm.volume===0?'音量は0です。スライダーで調整できます。':'この場所に合わせた音楽を再生しています。'):'音楽はオフです。';
}
