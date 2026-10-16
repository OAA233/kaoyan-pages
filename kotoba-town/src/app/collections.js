import { skillsFor } from '../actors/skill-catalog.js';
import { districtMap } from '../town-map.js';
import { announceCharacter } from './online.js';
import { $, app, bgm, updateBGMUI, chinese, districtNames, icons, node, save, seasons, state, toast } from './context.js';
import { closePanel, openPanel } from './panels.js';
import { enter, updateCharacterUI, updateWalkSpeedUI, updateWeather } from './scenes.js';
import { updateTaskHUD } from './tasks.js';
import { artFor, showWord } from './words.js';

export function openMap() {
  const body = openPanel('町の地図', 'map', 'おでかけしよう');
  body.append(districtMap(app.catalog, app.world, (id) => enter(id)));
  body.append(
    node(
      'p',
      'panel-intro',
      '町を歩いて探したり、行きたい場所を選んだりできます。',
    ),
  );
  const input = node('input', 'search');
  input.placeholder = '場所を検索：寿司屋、病院、ネットカフェ…';
  input.setAttribute('aria-label', '場所を検索');
  body.append(input);
  const filters = node('div', 'filters'),
    grid = node('div', 'scene-grid');
  body.append(filters, grid);
  let district = -1;
  function draw() {
    grid.replaceChildren();
    const q = input.value.trim().toLowerCase();
    for (const s of app.catalog.filter(
      (s) =>
        (district < 0 || s.district === district) &&
        [s.jp, s.reading].join(' ').toLowerCase().includes(q),
    )) {
      const b = node('button', 'scene-tile');
      b.style.background = [
        '#edf0d4',
        '#f4e5cc',
        '#e6eddb',
        '#e4ebde',
        '#f1e6d6',
        '#eae5d8',
      ][s.district % 6];
      b.append(
        node('span', 'scene-icon', icons[s.layout] || '⌂'),
        node(
          'strong',
          '',
          String(app.catalog.indexOf(s) + 1).padStart(2, '0') + ' · ' + s.jp,
        ),
        node('small', '', s.reading + ' · ' + s.zones.length + 'エリア'),
      );
      b.onclick = () => enter(s.id);
      grid.append(b);
    }
    if (!grid.children.length)
      grid.append(node('p', 'empty', '一致する場所がありません。'));
  }
  ['すべて', ...districtNames].forEach((label, i) => {
    const b = node('button', i === 0 ? 'selected' : '', label);
    b.onclick = () => {
      district = i - 1;
      [...filters.children].forEach((c) =>
        c.classList.toggle('selected', c === b),
      );
      draw();
    };
    filters.append(b);
  });
  input.oninput = draw;
  draw();
}
export function openCharacters() {
  const b = openPanel(
    '今日は、誰と歩こう？',
    'characters',
    '好きなキャラクターで散歩',
  );
  b.append(
    node(
      'p',
      'panel-intro',
      '好きなキャラクターを選んで、町を散歩しましょう。',
    ),
  );
  const grid = node('div', 'character-grid');
  for (const c of app.characters) {
    const btn = node(
      'button',
      'character-tile' + (c.id === state.character ? ' selected' : ''),
    );
    const img = node('img');
    img.src = c.image;
    img.alt = c.name;
    img.loading = 'lazy';
    btn.append(img, node('b', '', c.name), node('small', '', c.jp || ''));
    const skills = skillsFor(c.id);
    if (skills.length) btn.append(node('small', 'character-skill-badge', '✦ アクション × ' + skills.length));
    btn.onclick = async () => {
      state.character = c.id;
      save();
      updateCharacterUI();
      closePanel();
      await app.world.setCharacter(c);
      announceCharacter();
      toast('出発しよう、' + c.name + '！');
    };
    grid.append(btn);
  }
  b.append(grid);
}
export function renderCollection(kind = 'book') {
  if (!app.data) {
    openMap();
    toast('場所を選ぶと、その場所のことば図鑑を開けます。');
    return;
  }
  const products = kind === 'products',
    menu = kind === 'menu',
    body = openPanel(
      products
        ? app.data.jp + ' · 商品を見る'
        : menu
          ? app.data.jp + ' · メニュー'
          : app.data.jp + ' · ことば図鑑',
      kind,
      menu ? 'メニューをひらく' : '見つけたことば',
    );
  $('panel').classList.add('collection-panel');
  const browser = node('div', 'collection-browser'),
    detail = node('div', 'collection-detail'),
    hint = node('div', 'detail-placeholder');
  hint.append(
    node('span', '', '↖'),
    node('b', '', menu ? 'メニューから選んでみよう' : '気になることばを選ぼう'),
    chinese(
      'p',
      menu ? '点选菜品，菜单会一直保留。' : '点选词语，在旁边查看解释。',
    ),
  );
  detail.append(hint, $('word-card'));
  body.append(browser, detail);
  const input = node('input', 'search');
  input.placeholder = 'ことば・読み方・中国語で検索';
  input.setAttribute('aria-label', 'この場所のことばを検索');
  browser.append(input);
  const filters = node('div', 'filters'),
    stat = node('p', 'collection-stat'),
    grid = node('div', 'item-grid'),
    pager = node('div', 'pager');
  browser.append(filters, stat, grid, pager);
  let category = 0,
    page = 0;
  const productWords = app.data.items.filter((w) => w.product);
  const categories = products
    ? [
        { name: 'すべて', words: productWords },
        ...app.data.zones
          .map((z, i) => ({
            name: z.jp,
            words: productWords.filter((w) => w.zone === i),
          }))
          .filter((c) => c.words.length),
      ]
    : menu
      ? app.data.menus.map((m) => ({
          name: m.name,
          words: app.data.items.filter((w) => m.items.includes(w.id)),
        }))
      : [
          { name: 'すべて', words: app.data.items },
          ...app.data.zones.map((z, i) => ({
            name: z.jp,
            words: app.data.items.filter((w) => w.zone === i),
          })),
          {
            name: '登録済み',
            words: app.data.items.filter((w) => state.learned.has(w.id)),
          },
        ];
  function draw() {
    grid.replaceChildren();
    pager.replaceChildren();
    const q = input.value.trim().toLowerCase(),
      all = categories[category].words.filter((w) =>
        (
          w.jp +
          ' ' +
          w.reading +
          ' ' +
          w.zh +
          ' ' +
          (w.product
            ? [
                w.product.brand,
                w.product.generic,
                w.product.genericReading,
              ].join(' ')
            : '')
        )
          .toLowerCase()
          .includes(q),
      ),
      pages = Math.max(1, Math.ceil(all.length / 8));
    page = Math.min(page, pages - 1);
    stat.textContent =
      all.length + '語 · 絵を選ぶと、読み方や動作を確認できます';
    for (const w of all.slice(page * 8, page * 8 + 8)) {
      const b = node('button', 'item-tile');
      b.dataset.wordId = w.id;
      b.setAttribute('aria-pressed', String(app.selected?.id === w.id));
      const art = node('div', 'art');
      artFor(w, art);
      b.append(
        art,
        node('b', '', w.jp),
        node('small', '', w.reading),
        chinese('small', w.zh),
        node('small', '', w.product?.generic || w.cutLabel || ''),
        node('small', '', state.learned.has(w.id) ? '✓ 登録済み' : ''),
      );
      b.onclick = () => showWord(w);
      grid.append(b);
    }
    if (!all.length)
      grid.append(
        node('p', 'empty', 'この分類には一致することばがありません。'),
      );
    const prev = node('button', '', '← 前へ'),
      next = node('button', '', '次へ →');
    prev.disabled = page === 0;
    next.disabled = page === pages - 1;
    prev.onclick = () => {
      page--;
      draw();
    };
    next.onclick = () => {
      page++;
      draw();
    };
    pager.append(prev, node('span', '', page + 1 + ' / ' + pages), next);
  }
  categories.forEach((c, i) => {
    const b = node('button', i === 0 ? 'selected' : '', c.name);
    b.onclick = () => {
      category = i;
      page = 0;
      [...filters.children].forEach((x) =>
        x.classList.toggle('selected', x === b),
      );
      draw();
    };
    filters.append(b);
  });
  input.oninput = () => {
    page = 0;
    draw();
  };
  draw();
}
export const openMenu = () => renderCollection('menu');
export function openSceneInfo() {
  if (!app.data?.references) return;
  const body = openPanel(app.data.jp + ' · 資料と精度', 'sources', '街並みの記録');
  body.append(node('p', 'panel-intro', app.data.referenceNote), chinese('p', app.data.referenceZh));
  for (const reference of app.data.references) {
    const line = node('p'), link = node('a', 'source-link', reference.label + ' ↗');
    link.href = reference.url;
    if (reference.download) link.download = 'tobita-map.json';
    else { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    line.append(link); body.append(line);
  }
}
export function openSettings() {
  const b = openPanel('町の設定', 'settings', 'ちょうどいい散歩');
  b.innerHTML =
    '<div class="settings-grid"><section class="setting bgm-setting"><h3>♫ BGM</h3><button id="bgm-setting-toggle" aria-pressed="false">♫ オフ</button><p id="bgm-status" role="status"></p><label for="bgm-volume">音量 <output id="bgm-volume-value" for="bgm-volume">8%</output></label><input id="bgm-volume" type="range" min="0" max="100" step="1" value="8" aria-label="BGMの音量"><p>最初はオフ。小さな音から、ゆっくり流れます。</p></section><section class="setting"><h3>町の四季</h3><div class="season-list" id="seasons"></div><div class="filters" id="daynight"></div><p>春は桜、夏は緑、秋は紅葉、冬は雪景色を楽しめます。</p></section><section class="setting"><h3>操作の調整</h3><label>視点の感度 <output id="look-value"></output></label><input id="look-speed" type="range" min=".25" max="2.5" step=".05" aria-label="視点の感度"><label>移動速度 <output id="walk-value"></output></label><input id="walk-speed" type="range" min=".5" max="3" step=".1" aria-label="移動速度"></section><section class="setting"><h3>会話の難しさ</h3><div class="filters" id="bands"></div><p>会話とお願いを3段階から選べます。JLPTの級とは異なります。いつでもやめられます。</p></section><section class="setting"><h3>操作ガイド</h3><div class="help-list">WASD / 矢印キー：移動<br>マウス：ドラッグで見回す、ホイールでズーム<br>スマートフォン：左のスティックで移動、ドラッグで見回す<br>2本の指でズーム、物をタップしてことばを見る<br>Esc：パネルを閉じる、E：近くの場所に入る</div></section></div>';
  $('bgm-setting-toggle').onclick = () => bgm.toggle();
  $('bgm-volume').oninput = e => bgm.setVolume(e.target.value);
  updateBGMUI();
  for (const [key, label] of Object.entries(seasons)) {
    const btn = node(
      'button',
      state.season === key ? 'selected' : '',
      { spring: '春', summer: '夏', autumn: '秋', winter: '冬' }[key],
    );
    btn.onclick = async () => {
      state.season = key;
      save();
      closePanel();
      if (!app.data) await enter('town', false);
      else updateWeather();
    };
    $('seasons').append(btn);
  }
  [false, true].forEach((n) => {
    const btn = node(
      'button',
      state.night === n ? 'selected' : '',
      n ? '☾ 夜' : '☀ 昼',
    );
    btn.onclick = () => {
      state.night = n;
      save();
      updateWeather();
      [...$('daynight').children].forEach((c) =>
        c.classList.toggle('selected', c === btn),
      );
    };
    $('daynight').append(btn);
  });
  for (const key of ['look', 'walk']) {
    $(key + '-speed').value = state[key];
    $(key + '-value').textContent = state[key].toFixed(2) + '×';
    $(key + '-speed').oninput = (e) => {
      state[key] = Number(e.target.value);
      $(key + '-value').textContent = state[key].toFixed(2) + '×';
      app.world.lookSpeed = state.look;
      app.world.walkSpeed = state.walk;
      updateWalkSpeedUI();
      save();
    };
  }
  for (const [key, label] of [
    ['basic', '初級'],
    ['middle', '中級'],
    ['advanced', '上級'],
  ]) {
    const btn = node('button', state.band === key ? 'selected' : '', label);
    btn.onclick = () => {
      state.band = key;
      save();
      [...$('bands').children].forEach((c) =>
        c.classList.toggle('selected', c === btn),
      );
      updateTaskHUD();
    };
    $('bands').append(btn);
  }
}
