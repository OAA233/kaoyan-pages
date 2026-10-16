import { beefCutDiagram } from '../beef-cuts.js';
import { actionChinese, actionGrammarChinese } from '../learning-zh.js';
import { $, app, chinese, node, state, toast } from './context.js';
import { closePanel, collectionOpen, syncCollectionSelection } from './panels.js';
import { advanceTask } from './tasks.js';
import { speakJa, speakEn, warmUpVoices, vvStatus } from './speech.js';

// 日英对照数据（jp -> English）
let enMap = null;
async function ensureEn() {
  if (enMap) return enMap;
  try {
    const r = await fetch('./assets/words-en.json');
    enMap = await r.json();
  } catch {
    enMap = {};
  }
  return enMap;
}
function hiraToKata(s) {
  return s.replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
}
ensureEn();
warmUpVoices();

export function artFor(w, target) {
  target.replaceChildren();
  target.classList.remove('atlas');
  target.style.backgroundImage = '';
  if (w.architecture) {
    target.append(node('span', 'architecture-word', w.jp));
    return;
  }
  if (w.product?.image) {
    const img = node('img');
    img.alt = w.jp;
    img.loading = 'lazy';
    img.src = w.product.image;
    img.onerror = () => {
      img.onerror = null;
      img.src = app.world.thumbnail(w);
    };
    target.append(img);
    return;
  }
  if (w.cutRegion) {
    target.append(beefCutDiagram(w));
    return;
  }
  if (w.art) {
    target.classList.add('atlas');
    target.style.backgroundImage = 'url("./assets/' + w.art[0] + '.webp")';
    target.style.backgroundPosition =
      (((w.art[1] % 4) * 1.06 + 0.03) / 3.24) * 100 +
      '% ' +
      ((Math.floor(w.art[1] / 4) * 1.06 + 0.03) / 3.24) * 100 +
      '%';
  } else {
    try {
      const img = node('img');
      img.alt = w.jp;
      img.src = app.world.thumbnail(w);
      target.append(img);
    } catch {
      target.append(node('span', '', w.jp));
    }
  }
}
export function showWord(w) {
  app.world.cancelSkill();
  if (!collectionOpen()) closePanel();
  app.selected = w;
  syncCollectionSelection();
  $('word-card').hidden = false;
  document.body.classList.add('has-word');
  $('word-card').scrollTop = 0;
  artFor(w, $('word-art'));
  $('word-category').textContent = app.data.zones[w.zone]?.jp || 'ことば';
  $('word-jp').textContent = w.jp;
  $('word-reading').textContent = w.reading;
  $('word-zh').textContent = w.zh || '';
  $('word-zh').hidden = !w.zh;
  const en = enMap ? enMap[w.jp] || '' : '';
  $('word-en').textContent = en;
  $('word-en').hidden = !en;
  // 无图标：点日文重读日语，点英文读英文；开卡自动读音
  $('word-jp').onclick = () => speakJa(w.jp);
  $('word-jp').title = 'クリックで発音（四国めたん）';
  $('word-jp').style.cursor = 'pointer';
  $('word-en').onclick = en ? () => speakEn(en) : null;
  $('word-en').title = en ? 'Click to pronounce' : '';
  $('word-en').style.cursor = en ? 'pointer' : '';
  const bar = $('speech-bar');
  if (bar) bar.hidden = true;
  const example = w.example || w.jp + 'を見てみましょう。';
  $('word-example').onclick = () => speakJa(example);
  $('word-example').style.cursor = 'pointer';
  speakJa(w.jp);
  $('word-translation').textContent = w.translation || '';
  $('word-translation').hidden = !w.translation;
  $('word-note').textContent = [w.noteJa, w.note]
    .filter((x, i, a) => x && a.indexOf(x) === i)
    .join('\n');
  renderDetails(w);
  $('action-lesson').hidden = true;
  const actions = actionsFor(w);
  $('word-actions').replaceChildren(
    ...actions.map((a) => {
      const b = node('button', '', a.jp);
      b.onclick = () => runAction(w, a);
      return b;
    }),
  );
  updateLearn();
  advanceTask('see', w.id);
  app.world.highlight(w.id);
}
// （语音按钮已移除：点词卡文字直接发音）
export function renderDetails(w) {
  const area = $('word-details');
  area.replaceChildren();
  for (const id of w.related || []) {
    const related = app.data.items.find(item => item.id === id);
    if (!related) continue;
    const button = node('button', 'generic-link', related.jp + '（' + related.reading + '）');
    button.onclick = () => showWord(related);
    area.append(button);
  }
  const p = w.product;
  if (p) {
    area.append(
      node('small', 'eyebrow', p.brand),
      node(
        'strong',
        'generic-word',
        p.generic + '（' + p.genericReading + '）',
      ),
    );
    const generic = app.data.items.find((x) => !x.product && x.jp === p.generic);
    if (generic) {
      const btn = node('button', 'generic-link', '「' + p.generic + '」も見る');
      btn.onclick = () => showWord(generic);
      area.append(btn);
    }
  }
  const source =
    p?.source || w.species?.source || w.cafe?.source || w.reference;
  if (source) {
    const a = node(
      'a',
      'source-link',
      p
        ? '商品情報 · 公式サイト ↗'
        : w.cafe
          ? 'メニューの参考 · 公式資料 ↗'
          : w.reference
            ? '参考 · 公式資料 ↗'
            : '生きものを詳しく知る ↗',
    );
    a.href = source;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    area.append(a);
  }
  if (w.menuOnly)
    area.append(
      node(
        'small',
        'product-caption',
        'メニューで選んで、料理の形と名前を見比べましょう。',
      ),
    );
  if (p)
    area.append(
      node(
        'small',
        'product-caption',
        '商品名を学ぶための展示です。取扱店や包装は異なる場合があります。',
      ),
    );
}
export function updateLearn() {
  $('learned-count').textContent = state.learned.size;
  $('learn-word').textContent =
    app.selected && state.learned.has(app.selected.id)
      ? '✓ ことば帳に登録済み'
      : '＋ ことば帳に入れる';
}
export function actionsFor(w, items = app.data?.items || []) {
  if (w.architecture || ['ご飯茶碗', '観察窓', '本殿', 'ファイル'].includes(w.jp)) return []; // No invented action for fixed architecture or empty containers.
  const add = (
    verb,
    read,
    zh,
    type,
    particle = 'を',
    note = '「を」は動作の対象を表します。',
  ) => ({
    jp: w.jp + particle + verb,
    reading: w.reading + particle + read,
    zh: zh || actionChinese(verb, w),
    verb,
    particle,
    note,
    type,
  });
  const k = w.kind,
    acts = [];
  // The mesh is only an illustration: containers and fixtures are not food or openable windows.
  if (w.jp === 'ジョッキ') return [{ jp: 'ジョッキでビールを飲む', reading: 'ジョッキでビールをのむ', zh: '用大啤酒杯喝啤酒', verb: '飲む', particle: 'で', note: '「で」は使う道具、「を」は飲むものを表します。', type: 'drink' }];
  if (['味噌汁', 'ユッケジャンスープ'].includes(w.jp)) return [add('飲む', 'のむ', '', 'drink')];
  if (w.jp === '焼肉') return [add('食べる', 'たべる', '', 'eat')];
  if (['卓球のボール', 'ピンポン球'].includes(w.jp)) return [add('打つ', 'うつ', '打乒乓球', 'throw')];
  if (w.jp === 'ヨーヨー') return [add('弾ませる', 'はずませる', '让水气球弹跳', 'bounce')];
  if (w.jp === '入口') w = { ...w, jp: '入口のドア', reading: 'いりぐちのドア', zh: '入口的门' };
  if (w.jp === 'シャンプー台') w = { ...w, jp: 'シャンプー台の椅子', reading: 'シャンプーだいのいす', zh: '洗发椅' };
  if (w.jp === '掘りごたつ') w = { ...w, jp: '掘りごたつの席', reading: 'ほりごたつのせき', zh: '下沉式暖桌座席' };
  if (w.detail?.type === 'dish')
    return w.detail.raw
      ? [add('焼く', 'やく', '', 'grill')]
      : [add('食べる', 'たべる', '', 'eat')];
  if (w.cafe)
    return [
      w.cafe.type === 'drink'
        ? add('飲む', 'のむ', '', 'drink')
        : add('食べる', 'たべる', '', 'eat'),
    ];
  if (w.product) {
    const a = w.product.action;
    w = {
      ...w,
      jp: w.product.generic,
      reading: w.product.genericReading,
      zh:
        items.find((x) => !x.product && x.jp === w.product.generic)?.zh || w.zh,
    };
    if (a === 'eat') acts.push(add('食べる', 'たべる', '', 'eat'));
    if (a === 'drink') acts.push(add('飲む', 'のむ', '', 'drink'));
    if (a === 'read') acts.push(add('読む', 'よむ', '', 'read'));
    if (a === 'wear') acts.push(add('着る', 'きる', '', 'wear'));
    if (a === 'socks') acts.push(add('はく', 'はく', '', 'wear'));
    if (a === 'wash')
      acts.push({
        jp: '手を洗う',
        reading: 'てをあらう',
        zh: '洗手',
        verb: '洗う',
        particle: 'を',
        note: '手（て）＋を＋洗う（あらう）。',
        type: 'wash',
      });
    return acts;
  }
  if (
    ['foods', 'dishes', 'meals'].includes(w.art?.[0]) ||
    (w.art?.[0] === 'drinks' && w.art[1] >= 8) ||
    [
      'ramen-bowl',
      'soba-tray',
      'set-meal',
      'rice',
      'onigiri',
      'sushi',
      'roll',
      'edamame',
      'fried',
      'skewer',
      'sashimi',
      'noodles',
      'curry',
      'bread',
      'apple',
      'banana',
      'orange',
      'cake',
      'dango',
      'daifuku',
      'cookie',
      'snack',
      'icecream',
      'ice-cup',
      'wrapped-ice',
    ].includes(k)
  )
    acts.push(add('食べる', 'たべる', '吃' + w.zh, 'eat'));
  if (
    (w.art?.[0] === 'drinks' && w.art[1] < 8) ||
    ['tea', 'mug', 'beer', 'sake', 'coffee', 'juice', 'milk', 'water'].includes(
      k,
    )
  )
    acts.push(add('飲む', 'のむ', '喝' + w.zh, 'drink'));
  if (['meat'].includes(k)) return [add('焼く', 'やく', '烤' + w.zh, 'grill')];
  if (['book', 'notebook', 'magazine', 'newspaper', 'menu'].includes(k))
    acts.push(add('読む', 'よむ', '阅读' + w.zh, 'read'));
  if (
    [
      'cushion',
      'horigotatsu',
      'chair',
      'sofa',
      'bench',
      'stool',
      'recliner',
      'floor-chair',
      'barber-chair',
      'shampoo-chair',
    ].includes(k)
  ) {
    acts.push(
      add(
        '座る',
        'すわる',
        '坐在' + w.zh + '上',
        'sit',
        'に',
        '「に」は座る場所を表します。',
      ),
    );
    acts.push({
      jp: '立ち上がる',
      reading: 'たちあがる',
      zh: '站起来',
      verb: '立ち上がる',
      particle: '',
      note: '座っている状態から立ちます。',
      type: 'stand',
    });
  }
  if (
    [
      'door',
      'fridge',
      'freezer',
      'beverage-cooler',
      'chilled-case',
      'ice-freezer',
      'chest-freezer',
      'shoji',
      'fusuma',
      'locker',
      'wardrobe',
      'window-shell',
      'oshiire',
    ].includes(k)
  ) {
    acts.push(add('開ける', 'あける', '打开' + w.zh, 'open'));
    acts.push(add('閉める', 'しめる', '关上' + w.zh, 'close'));
  }
  if (
    [
      'lamp',
      'lighting-shell',
      'light',
      'switch',
      'reading-lamp',
      'andon',
    ].includes(k)
  ) {
    acts.push(
      {
        jp: '電気をつける',
        reading: 'でんきをつける',
        zh: '开灯',
        verb: 'つける',
        particle: 'を',
        note: '「電気をつける」は、明かりをつけることです。',
        type: 'light-on',
      },
      {
        jp: '電気を消す',
        reading: 'でんきをけす',
        zh: '关灯',
        verb: '消す',
        particle: 'を',
        note: '「電気を消す」は、明かりを消すことです。',
        type: 'light-off',
      },
    );
  }
  if (k === 'soccerball') acts.push(add('蹴る', 'ける', '踢足球', 'throw'));
  else if (
    ['ball', 'basketball', 'volleyball', 'baseball', 'tennisball'].includes(k)
  )
    acts.push(
      add('投げる', 'なげる', '投' + w.zh, 'throw'),
      add('つく', 'つく', '拍球', 'bounce'),
    );
  if (
    [
      'train',
      'bicycle',
      'carousel',
      'coaster',
      'boat',
      'steamtrain',
      'kart',
    ].includes(k)
  ) {
    acts.push(
      add(
        '乗る',
        'のる',
        '乘坐' + w.zh,
        'board',
        'に',
        '「に」は乗る乗り物を表します。',
      ),
    );
    acts.push(
      add(
        '降りる',
        'おりる',
        '从' + w.zh + '下来',
        'alight',
        'を',
        'この「を」は、降りる乗り物を表します。',
      ),
    );
  }
  if (['templehall', 'shrinehall', 'entryfloor'].includes(k)) {
    acts.push(
      add(
        '入る',
        'はいる',
        '进入' + w.zh,
        'enter',
        'に',
        '「に」は入る場所を表します。',
      ),
    );
    acts.push(
      add(
        '出る',
        'でる',
        '走出' + w.zh,
        'leave',
        'を',
        'この「を」は、出る場所を表します。',
      ),
    );
  }
  if (['soap', 'sink', 'washbasin'].includes(k))
    acts.push({
      jp: '手を洗う',
      reading: 'てをあらう',
      zh: '洗手',
      verb: '洗う',
      particle: 'を',
      note: '「を」は洗うものを表します。手の読み方は「て」です。',
      type: 'wash',
    });
  if (['shirt', 'coat', 'yukata', 'hat', 'cap'].includes(k))
    acts.push(
      add(
        ['hat', 'cap'].includes(k) ? 'かぶる' : '着る',
        ['hat', 'cap'].includes(k) ? 'かぶる' : 'きる',
        (['hat', 'cap'].includes(k) ? '戴' : '穿') + w.zh,
        'wear',
      ),
    );
  if (['bell'].includes(k))
    acts.push(add('鳴らす', 'ならす', (w.jp === '鐘' ? '敲响' : '摇响') + w.zh, 'ring'));
  if (['broom'].includes(k))
    acts.push({
      jp: '床を掃く',
      reading: 'ゆかをはく',
      zh: '扫地',
      verb: '掃く',
      particle: 'を',
      note: '床（ゆか）＋を＋掃く（はく）。',
      type: 'sweep',
    });
  return acts;
}
export function runAction(w, a) {
  app.world.perform(w, a.type);
  $('action-lesson').hidden = false;
  $('action-sentence').textContent = a.jp;
  $('action-reading').textContent = a.reading;
  $('action-translation').textContent = a.zh;
  $('action-grammar').replaceChildren(
    node('span', '', a.note),
    chinese('span', actionGrammarChinese(a)),
  );
  advanceTask('act', w.id);
  toast(a.jp);
}
