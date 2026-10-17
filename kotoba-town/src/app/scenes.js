import { entryFor } from '../town-layout.js';
import { openMenu } from './collections.js';
import { $, app, bgm, cache, clamp, node, save, seasons, state, toast } from './context.js';
import { closePanel, closeWord } from './panels.js';
import { openNPC, openStaff, updateTaskHUD } from './tasks.js';
import { showWord } from './words.js';
import { joinRoom, openPeerCard } from './online.js';
import { prefetchVenueAudio } from './speech.js';

export function getCharacter() {
  return app.characters.find((c) => c.id === state.character) || app.characters[0];
}
export function updateCharacterUI() {
  const c = getCharacter();
  $('player-portrait').src = c.image;
  $('player-name').textContent = c.name;
}
export function updateWalkSpeedUI() {
  const text = Number(state.walk.toFixed(1)) + '×';
  $('walk-speed-badge').textContent = text;
  $('walk-speed-button').setAttribute(
    'aria-label',
    '移動速度 ' + text + '。押すと切り替わります。',
  );
}
export function setWalkSpeed(value) {
  state.walk = clamp(value, 0.5, 3, 1);
  app.world.walkSpeed = state.walk;
  updateWalkSpeedUI();
  save();
}
export function updateWeather() {
  bgm.setScene(app.data?.id || 'town', state.season, state.night);
  updateWalkSpeedUI();
  app.world.season = state.season;
  app.world.night = state.night;
  app.world.lookSpeed = state.look;
  app.world.walkSpeed = state.walk;
  app.world.applyLight();
  document.body.classList.toggle('night', state.night);
  $('weather-badge').textContent =
    seasons[state.season] + ' · ' + (state.night ? '夜' : '昼');
}
export async function fetchScene(id) {
  if (cache.has(id)) return cache.get(id);
  if (!app.catalog.some((s) => s.id === id))
    throw new Error('場所が見つかりませんでした。');
  const r = await fetch('./town-data/' + id + '.json');
  if (!r.ok)
    throw new Error(
      '場所のデータを読み込めませんでした。もう一度お試しください。',
    );
  const d = await r.json();
  cache.set(id, d);
  return d;
}
export async function enter(id = 'town', push = true) {
  if (app.busy) return;
  app.busy = true;
  closePanel();
  closeWord();
  app.world?.cancelAction?.();
  $('loading').hidden = false;
  $('loading').querySelector('strong').textContent =
    id === 'town' ? '町に戻っています…' : '新しいことばを探しに…';
  try {
    app.world.season = state.season;
    app.world.night = state.night;
    const townPosition =
      id === 'town' && app.world.worldMode === 'town'
        ? app.world.playerPos.toArray()
        : app.townReturn;
    if (id !== 'town') {
      const i = app.catalog.findIndex((s) => s.id === id);
      app.townReturn =
        app.world.worldMode === 'town' && app.near?.id === id
          ? app.world.playerPos.toArray()
          : entryFor(id);
    }
    if (id === 'town') {
      app.data = null;
      app.npc = null;
      await app.world.town(app.catalog, getCharacter());
      if (townPosition) {
        app.world.playerPos.set(...townPosition);
        app.world.request();
      }
      $('place-kicker').textContent = 'こんにちは！';
      $('place-title').textContent = '今日は、どこへ行こう？';
      $('place-description').textContent = '気になるお店へ、歩いてみよう。';
    } else {
      app.data = await fetchScene(id);
      app.npc = app.characters[app.data.npc % app.characters.length];
      if (app.npc.id === getCharacter().id)
        app.npc = app.characters[(app.data.npc + 1) % app.characters.length];
      await app.world.interior(app.data, getCharacter(), app.npc, app.characters);
      $('place-kicker').textContent = app.data.reading;
      $('place-title').textContent = app.data.jp;
      $('place-description').textContent =
        app.data.zones.length +
        'エリア · ' +
        app.data.items.length +
        '語を探そう' +
        (app.data.layout === 'park' ? ' · 学習用のミニパーク' : '');
    }
    $('products-button').hidden = !app.data?.items.some((w) => w.product);
    $('overview-button').hidden = !app.data;
    document.body.classList.toggle('in-venue', !!app.data);
    joinRoom(app.data?.id || 'town');
    $('zone-wrap').hidden = !app.data;
    $('back-town').hidden = !app.data;
    $('talk-button').hidden = !app.data || app.data.noNpc;
    $('scene-info-button').hidden = !app.data?.references;
    $('map-credit').hidden = app.data?.id !== 'tobita';
    $('overview-button').setAttribute('aria-label', app.data?.layout === 'district' ? '街区全体を見る' : '館内全体を見る');
    $('menu-button').hidden = !app.data?.menus?.length;
    $('menu-shortcut').hidden = !app.data?.menus?.length;
    if (app.data) {
      $('zone-select').replaceChildren(
        ...app.data.zones.map((z, i) => {
          const o = node('option', '', z.jp);
          o.value = i;
          return o;
        }),
      );
      $('talk-button').textContent = app.npc.name + 'と話す';
      if (app.data.layout === 'district') $('place-description').textContent = '街並みを歩いて、建物のことばに出会おう。';
      prefetchVenueAudio(app.data);
    }
    if (push) {
      const url = new URL(location);
      if (id === 'town') url.searchParams.delete('scene');
      else url.searchParams.set('scene', id);
      url.searchParams.delete('style');
      url.searchParams.delete('zone');
      url.searchParams.set('v', 'skills1');
      history.pushState({ scene: id }, '', url);
    }
    updateWeather();
    updateTaskHUD();
    $('loading').hidden = true;
    document.title = (app.data ? app.data.jp + ' · ' : '') + '神秘小镇（Beta版）';
  } catch (e) {
    $('loading').hidden = true;
    toast(
      e.message || '読み込めませんでした。ページを再読み込みしてください。',
    );
    console.error(e);
  } finally {
    app.busy = false;
    app.world.disabled = false;
    app.world.request();
  }
}
export function setNear(n) {
  app.near = n;
  const b = $('near-button');
  b.hidden = !n;
  if (!n) {
    b.dataset.text = '';
    return b.replaceChildren();
  }
  const text = n.talk ? n.name + 'と話す' : n.id === 'town' ? '町に戻る' : n.jp + 'に入る';
  // Rebuild only when the target changes; this runs every rendered frame.
  if (b.dataset.text === text) return;
  b.dataset.text = text;
  const key = node('kbd', '', 'E');
  key.setAttribute('aria-hidden', 'true');
  b.replaceChildren(node('span', '', (n.talk ? '💬 ' : '🚪 ') + text), key);
}
/** The near button / E key: enter the doorway, or talk to the NPC or staff member standing nearby. */
export function activateNear() {
  const n = app.near;
  if (!n) return;
  if (n.talk) onPick({ kind: n.kind, data: n.data });
  else enter(n.id);
}
export function onPick({ kind, data: w }) {
  if (app.busy || app.panelKind) return;
  if (kind === 'word') {
    if (
      ['メニュー', 'お品書き', 'ドリンクメニュー'].includes(w.jp) &&
      app.data?.menus?.length
    )
      openMenu();
    else showWord(w);
  } else if (kind === 'npc') openNPC();
  else if (kind === 'staff') openStaff(w);
  else if (kind === 'entrance' || kind === 'exit')
    toast((w.jp || '入口') + '：入口まで歩いて、Eキーまたは入口ボタンで入れます。');
  else if (kind === 'peer') openPeerCard(w);
}
