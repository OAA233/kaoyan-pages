export const CHARACTER_SKILLS = {
  gojo: [
    { id: 'red', short: '赫', name: '術式反転「赫」', zh: '术式反转 · 赫', color: '#eb5266', duration: 4.4 },
    { id: 'blue', short: '蒼', name: '術式順転「蒼」', zh: '术式顺转 · 苍', color: '#459fee', duration: 4.6 },
    { id: 'purple', short: '茈', name: '虚式「茈」', zh: '虚式 · 茈', color: '#a67cf2', duration: 5.6 },
  ],
  gilgamesh: [
    { id: 'gates', short: '王の財宝', name: '王の財宝', zh: '王之财宝', color: '#d7a13a', duration: 5.4 },
    { id: 'ea', short: '乖離剣', name: '天地乖離す開闢の星', zh: '乖离剑 · 天地乖离开辟之星', color: '#d66a54', duration: 5.5 },
  ],
  'fatezero-saber': [{ id: 'excalibur', short: 'エクスカリバー', name: '約束された勝利の剣（エクスカリバー）', zh: '誓约胜利之剑', color: '#d3b454', duration: 5.2 }],
  frieren: [{ id: 'frieren-magic', short: '魔法を放つ', name: 'フリーレンの魔法', zh: '芙莉莲 · 魔法释放', color: '#81b8a0', duration: 4.8 }],
  fern: [{ id: 'fern-magic', short: '連続魔法', name: 'フェルンの連続魔法', zh: '菲伦 · 连续魔法', color: '#a78bc8', duration: 4.7 }],
  migi: [{ id: 'migi-blade', short: '刃に変形', name: 'ミギーの変形', zh: '小右 · 伸展与刃形态', color: '#b99977', duration: 4.8 }],
  nina: [{ id: 'lamp', short: 'ライトを回す', name: '仁菜のライト旋回', zh: '井芹仁菜 · 旋转灯具', color: '#d8868c', duration: 4.8 }],
};
export const skillsFor = id => CHARACTER_SKILLS[id] || [];
