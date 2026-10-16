import { staffZh } from '../learning-zh.js';
import { $, app, chinese, node, save, state, toast } from './context.js';
import { closePanel, openPanel } from './panels.js';
import { actionsFor, showWord } from './words.js';

export const taskWants = {
  aeon: ['買い物かご', '牛乳', 'レジ'],
  bank: ['ATM', '通帳', 'キャッシュカード'],
  school: ['鉛筆', '消しゴム', 'ノート'],
  sports: ['ボール', 'ラケット', 'タオル'],
  sushi: ['まぐろ', 'サーモン', '緑茶'],
  izakaya: ['枝豆', '焼き鳥', 'ウーロン茶'],
  yakiniku: ['牛肉', '豚肉', 'トング'],
  ramen: ['ラーメン', '箸', 'レンゲ'],
  soba: ['そば', 'うどん', '箸'],
  teishoku: ['ご飯', '味噌汁', '箸'],
  kissaten: ['コーヒー', 'ケーキ', '砂糖'],
  wagashi: ['団子', '大福', '緑茶'],
  convenience: ['おにぎり', '牛乳', 'レジ'],
  supermarket: ['りんご', '牛肉', 'かご'],
  clothing: ['シャツ', '帽子', '鏡'],
  dagashi: ['ガム', 'ラムネ', '飴'],
  hundred: ['はさみ', 'ノート', 'コップ'],
  drugstore: ['歯ブラシ', 'シャンプー', '日焼け止め'],
  bookstore: ['漫画', '雑誌', 'しおり'],
  aquarium: ['クラゲ', 'ペンギン', 'サメ'],
  temple: ['鐘', '本堂', 'お守り'],
  shrine: ['鳥居', '絵馬', 'おみくじ'],
  ryokan: ['浴衣', '布団', '座布団'],
  sento: ['タオル', '石鹸', 'ロッカー'],
  arcade: ['メダル', 'ボタン', '景品'],
  karaoke: ['マイク', 'リモコン', 'ウーロン茶'],
  netcafe: ['パソコン', 'ヘッドホン', '漫画'],
  home: ['冷蔵庫', 'ソファ', '洗濯機'],
  clinic: ['体温計', '保険証', '薬'],
  station: ['切符', '改札口', '電車'],
  post: ['切手', '封筒', 'はがき'],
  koban: ['地図', '財布', '自転車'],
  laundry: ['洗剤', '洗濯機', 'かご'],
  barber: ['はさみ', '鏡', 'ドライヤー'],
  street: ['信号', '自動販売機', '横断歩道'],
  festival: ['屋台', 'かき氷', 'うちわ'],
  disney: ['入場券', '地図', '城'],
  usj: ['入場券', 'ロッカー', 'ジェットコースター'],
};
export function taskFor(band = state.band) {
  if (!app.data || app.data.noNpc) return null;
  let words = (taskWants[app.data.id] || [])
    .map((jp) => app.data.items.find((w) => w.jp === jp))
    .filter(Boolean);
  for (const w of app.data.items)
    if (
      words.length < 3 &&
      !words.some((x) => x.id === w.id) &&
      ![
        'floor',
        'ground',
        'wall-shell',
        'shelf-support',
        'lighting-shell',
        'window-shell',
      ].includes(w.kind)
    )
      words.push(w);
  const count = band === 'basic' ? 1 : band === 'middle' ? 2 : 3;
  words = words.slice(0, count);
  const names = words.map((w) => w.jp).join('と'),
    zh = words.map((w) => w.zh).join('、');
  const action =
    band === 'advanced' ? words.find((w) => actionsFor(w).length) : null;
  const jp =
    band === 'basic'
      ? words[0].jp + 'はどこですか。一緒に探しましょう。'
      : band === 'middle'
        ? names + 'を探してもらえますか。見つけたら、私に教えてください。'
        : names +
          'を確かめてから、' +
          (action
            ? actionsFor(action)[0].jp + 'という動作も試していただけますか。'
            : 'それぞれの名前を確認していただけますか。') +
          '終わりましたら、こちらにお戻りください。';
  return {
    key: app.data.id + ':' + band,
    jp,
    zh:
      (band === 'basic' ? '一起找找' : '请帮忙确认') +
      zh +
      '。' +
      (action ? '再试一试“' + actionsFor(action)[0].zh + '”的动作。' : '') +
      '完成后回来告诉我。',
    goals: [
      ...words.map((w) => ({
        event: 'see',
        id: w.id,
        text: w.jp + 'を見つける',
      })),
      ...(action
        ? [
            {
              event: 'act',
              id: action.id,
              text: '動作：' + actionsFor(action)[0].jp,
            },
          ]
        : []),
    ],
    title: app.data.jp + 'でのお願い',
    band,
  };
}
export function taskState(t) {
  const s = state.tasks[t.key];
  return s && typeof s === 'object' && Array.isArray(s.done) ? s : null;
}
export function advanceTask(event, id) {
  if (!app.data || app.data.noNpc) return;
  for (const band of ['basic', 'middle', 'advanced']) {
    const t = taskFor(band),
      s = taskState(t);
    if (!s || s.status !== 'active') continue;
    t.goals.forEach((g, i) => {
      if (g.event === event && g.id === id && !s.done.includes(i)) {
        s.done.push(i);
        toast('✓ ' + g.text);
      }
    });
    if (s.done.length >= t.goals.length) s.status = 'ready';
  }
  save();
  updateTaskHUD();
}
export function updateTaskHUD() {
  const t = taskFor(),
    s = t && taskState(t);
  $('task-hud').hidden = !s || s.status === 'complete';
  if (!s) return;
  $('task-title').textContent = t.title;
  $('task-progress').textContent =
    s.status === 'ready'
      ? '見つかった！' + app.npc.name + 'に伝えよう。'
      : s.done.length +
        ' / ' +
        t.goals.length +
        ' · ' +
        t.goals.find((_, i) => !s.done.includes(i))?.text;
}
export function openStaff(staff) {
  if (staff.nameOnly) {
    const body = openPanel(staff.jp, 'staff', 'バスケットボール');
    const portrait = node('div', 'npc-art'), image = node('img');
    image.src = staff.character.image; image.alt = staff.jp;
    portrait.append(image, node('b', '', staff.jp), chinese('p', staff.zh));
    body.append(portrait);
    return;
  }
  const zh = staffZh[staff.id],
    b = openPanel(staff.jp + 'と話す', 'staff', '仕事と暮らしの動作'),
    lay = node('div', 'npc-layout'),
    art = node('div', 'npc-art'),
    img = node('img');
  img.src = staff.character.image;
  img.alt = staff.character.name;
  art.append(
    img,
    node('b', '', staff.character.name),
    node('small', '', staff.jp + '（' + staff.reading + '）'),
  );
  if (zh) art.append(chinese('small', zh.role));
  const content = node('div'),
    bubble = node('div', 'speech-bubble'),
    reading = node('p', 'panel-intro', staff.readingLine),
    explain = node('p', '', staff.verb + '：今、している動作。'),
    grammar = node('p', '', staff.grammar),
    choices = node('div', 'npc-options');
  const setDialogue = (jp, translation) => {
    bubble.replaceChildren(node('span', 'speech-jp', jp));
    if (translation) bubble.append(chinese('p', translation));
  };
  setDialogue(staff.activity, zh?.activity);
  const choice = (label, fn) => {
    const btn = node('button', '', label);
    btn.onclick = fn;
    choices.append(btn);
  };
  choice('何をしていますか。／在做什么？', () => {
    setDialogue(staff.activity, zh?.activity);
    reading.textContent = staff.readingLine;
  });
  choice('会話を続ける／继续对话', () => {
    setDialogue(staff.reply, zh?.reply);
    reading.textContent = '';
  });
  content.append(
    bubble,
    reading,
    explain,
    chinese('p', '先把动词变成て形，再接「いる」。这里表示正在进行的动作。'),
    grammar,
  );
  if (zh) content.append(chinese('p', zh.grammar));
  content.append(choices, node('h3', '', '仕事のことば'));
  const words = node('div', 'npc-options');
  for (const jp of staff.tools) {
    const w = app.data.items.find((x) => x.jp === jp);
    if (w) {
      const btn = node('button', '', w.jp + '（' + w.reading + '）');
      btn.append(chinese('small', w.zh));
      btn.onclick = () => {
        showWord(w);
        app.world.focusItem(w.id);
      };
      words.append(btn);
    }
  }
  content.append(words);
  lay.append(art, content);
  b.append(lay);
}
export function openNPC() {
  if (!app.data || app.data.noNpc) return;
  const t = taskFor(),
    s = taskState(t),
    b = openPanel(app.npc.name + 'と話す', 'npc', 'ちょっと話してみよう');
  const lay = node('div', 'npc-layout'),
    art = node('div', 'npc-art'),
    img = node('img');
  img.src = app.npc.image;
  img.alt = app.npc.name;
  art.append(
    img,
    node('b', '', app.npc.name),
    node('small', '', app.data.jp + ' · 町の案内役'),
  );
  const content = node('div'),
    bubble = node('div', 'speech-bubble');
  let jp = t.jp,
    zh = t.zh;
  if (s?.status === 'ready') {
    jp = 'ありがとうございます。すべて見つかりましたね。これで大丈夫です！';
    zh = '谢谢你，都找到了！这次的小任务完成啦。';
  }
  if (s?.status === 'complete') {
    jp = 'また会えてうれしいです。ゆっくり見ていってくださいね。';
    zh = '很高兴又见到你，继续慢慢逛吧。';
  }
  bubble.append(node('span', 'speech-jp', jp), chinese('p', zh));
  content.append(bubble);
  content.append(
    node(
      'p',
      'panel-intro',
      '難しさ：' +
        { basic: '初級', middle: '中級', advanced: '上級' }[state.band] +
        ' · 設定で変更できます',
    ),
  );
  const list = node('ul', 'task-list');
  t.goals.forEach((g, i) => {
    const item = node(
        'li',
        s?.done.includes(i) ? 'done' : '',
        (s?.done.includes(i) ? '✓ ' : '○ ') + g.text,
      ),
      w = app.data.items.find((w) => w.id === g.id);
    item.append(
      chinese(
        'small',
        g.event === 'act' ? '尝试动作：' + actionsFor(w)[0].zh : '找到' + w.zh,
      ),
    );
    list.append(item);
  });
  content.append(list);
  const choices = node('div', 'npc-options');
  function choice(text, fn, cls = '') {
    const x = node('button', cls, text);
    x.onclick = fn;
    choices.append(x);
  }
  if (!s) {
    choice(
      'はい、やってみます。／好，我试试。',
      () => {
        state.tasks[t.key] = { status: 'active', done: [] };
        save();
        closePanel();
        updateTaskHUD();
        toast('お願いを引き受けました。散歩しながら探しましょう。');
      },
      'primary',
    );
    choice('まずは自由に歩く／先自由逛逛', closePanel);
  } else if (s.status === 'ready') {
    choice(
      'どういたしまして。／不客气。',
      () => {
        s.status = 'complete';
        save();
        closePanel();
        updateTaskHUD();
        toast('✿ ' + app.data.jp + 'でのお願いを達成！');
      },
      'primary',
    );
  } else if (s.status === 'complete') {
    choice('探索を続ける／继续探索', closePanel, 'primary');
    choice('もう一度練習する／再练习一次', () => {
      state.tasks[t.key] = { status: 'active', done: [] };
      save();
      closePanel();
      updateTaskHUD();
    });
  } else {
    choice('探し続ける', closePanel, 'primary');
    choice('このお願いをやめる', () => {
      delete state.tasks[t.key];
      save();
      closePanel();
      updateTaskHUD();
      toast('お願いをやめました。自由に探索できます。');
    });
  }
  content.append(choices);
  lay.append(art, content);
  b.append(lay);
}
