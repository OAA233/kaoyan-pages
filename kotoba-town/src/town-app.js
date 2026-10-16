import { openCharacters, openMap, openMenu, openSceneInfo, openSettings, renderCollection } from './app/collections.js';
import { $, app, bgm, updateBGMUI, save, state, toast } from './app/context.js';
import { closePanel, closeWord, collectionOpen } from './app/panels.js';
import { activateNear, enter, onPick, setNear, setWalkSpeed, updateCharacterUI, updateWeather } from './app/scenes.js';
import { openNPC, taskFor } from './app/tasks.js';
import { actionsFor, showWord, updateLearn } from './app/words.js';
import { TownWorld } from './town-world.js';
import { drawMinimap } from './app/minimap.js';
import { initOnline, onlineDebug, openOnlinePanel, sendMove } from './app/online.js';
import { initSkills, refreshSkills } from './app/skills.js';
import { focusChat } from './app/chat.js';

function wire() {
  initSkills();
  $('bgm-toggle').onclick = () => bgm.toggle();
  $('bgm-options').onclick = () => { openSettings(); $('bgm-volume').focus(); };
  updateBGMUI();
  $('overview-button').onclick = () => {
    closeWord();
    app.world.overview();
  };
  $('online-button').onclick = openOnlinePanel;
  // Minimap: the town map in town, the whole-floor view inside a venue.
  $('minimap-button').onclick = () => {
    if (app.world.worldMode === 'town') openMap();
    else {
      closeWord();
      app.world.overview();
    }
  };
  $('walk-speed-button').onclick = () => {
    if (app.busy || app.panelKind) return;
    const steps = [0.5, 1, 1.5, 2, 3];
    setWalkSpeed(steps.find((v) => v > state.walk + 0.001) || steps[0]);
    toast('移動速度：' + state.walk + '×');
  };
  $('map-button').onclick = openMap;
  $('character-button').onclick = openCharacters;
  $('settings-button').onclick = openSettings;
  $('scene-info-button').onclick = openSceneInfo;
  $('book-button').onclick = () => renderCollection();
  $('menu-button').onclick = openMenu;
  $('menu-shortcut').onclick = openMenu;
  $('products-button').onclick = () => renderCollection('products');
  $('talk-button').onclick = openNPC;
  $('task-chat').onclick = openNPC;
  $('back-town').onclick = () => enter('town');
  $('near-button').onclick = activateNear;
  $('close-panel').onclick = closePanel;
  $('overlay').onclick = (e) => {
    if (e.target === $('overlay')) closePanel();
  };
  $('close-word').onclick = () => {
    const id = app.selected?.id;
    closeWord();
    if (collectionOpen())
      $('panel')
        .querySelector('[data-word-id="' + id + '"]')
        ?.focus({ preventScroll: true });
    else app.world.reset();
  };
  $('focus-word').onclick = () => {
    if (!app.selected) return;
    const w = app.selected;
    if (collectionOpen()) {
      closePanel();
      showWord(w);
    }
    app.world.focusItem(w.id);
  };
  $('learn-word').onclick = () => {
    if (!app.selected) return;
    state.learned.add(app.selected.id);
    save();
    updateLearn();
    toast(app.selected.jp + 'をことば帳に登録しました');
  };
  $('zone-select').onchange = (e) => {
    closeWord();
    app.world.goZone(Number(e.target.value));
  };
  $('zoom-in').onclick = () => app.world.zoom(-2);
  $('zoom-out').onclick = () => app.world.zoom(2);
  $('reset-view').onclick = () => {
    closeWord();
    app.world.reset();
  };
  $('fullscreen').onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await $('game').requestFullscreen();
    } catch {
      toast('このブラウザーは全画面表示に対応していません。');
    }
  };
  const joy = $('joystick');
  let pointer = null;
  joy.onpointerdown = (e) => {
    if (app.world.disabled || e.pointerType !== 'touch') return;
    e.preventDefault(); // no selection or long-press menu while steering
    app.world.cancelSkill();
    pointer = e.pointerId;
    joy.setPointerCapture(pointer);
    move(e);
  };
  function move(e) {
    if (e.pointerId !== pointer) return;
    const r = joy.getBoundingClientRect();
    let x = e.clientX - r.left - r.width / 2,
      y = e.clientY - r.top - r.height / 2;
    const d = Math.hypot(x, y),
      max = 33;
    if (d > max) {
      x *= max / d;
      y *= max / d;
    }
    app.world.stick = { x: x / max, y: y / max };
    $('joystick-knob').style.transform = 'translate(' + x + 'px,' + y + 'px)';
    app.world.request();
  }
  joy.onpointermove = move;
  joy.onpointerup = joy.onpointercancel = () => {
    pointer = null;
    app.world.stick = { x: 0, y: 0 };
    $('joystick-knob').style.transform = '';
    app.world.request();
  };
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (collectionOpen() && app.selected) {
        $('close-word').click();
      } else {
        closePanel();
        closeWord();
        app.world.cancelAction();
        app.world.reset();
      }
    }
    if (
      e.code === 'KeyE' && // physical key, so an input method or Caps Lock does not block it
      app.near &&
      !app.panelKind &&
      !/input|select|textarea/i.test(e.target.tagName)
    )
      activateNear();
    if (
      e.key === 'Enter' &&
      !e.isComposing &&
      !app.panelKind &&
      !/^(input|select|textarea|button|a)$/i.test(e.target.tagName) &&
      focusChat()
    )
      e.preventDefault();
    if (e.key === 'Tab' && app.panelKind) {
      const els = [
        ...$('panel').querySelectorAll('button,input,select,a'),
      ].filter((x) => !x.disabled && x.getClientRects().length);
      if (e.shiftKey && document.activeElement === els[0]) {
        e.preventDefault();
        els.at(-1).focus();
      } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
        e.preventDefault();
        els[0].focus();
      }
    }
  });
  window.addEventListener('popstate', () =>
    enter(new URL(location).searchParams.get('scene') || 'town', false),
  );
  $('world').addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    toast('画面の表示が中断されました。ページを再読み込みしてください。');
  });
}
async function start() {
  try {
    const [a, b] = await Promise.all([
      fetch('./town-catalog.json'),
      fetch('./characters.json?v=20261003-characters53'),
    ]);
    if (!a.ok || !b.ok) throw new Error('町のデータを読み込めませんでした。');
    app.catalog = await a.json();
    app.characters = await b.json();
    app.world = new TownWorld($('world'), onPick, setNear, () => {
      drawMinimap();
      sendMove();
      refreshSkills();
    });
    wire();
    updateCharacterUI();
    updateWeather();
    updateLearn();
    initOnline();
    window.townDebug = {
      bgm,
      online: onlineDebug,
      world: app.world,
      get data() {
        return app.data;
      },
      get catalog() {
        return app.catalog;
      },
      get state() {
        return state;
      },
      enter,
      showWord,
      openMap,
      openNPC,
      openMenu,
      taskFor,
      actionsFor,
      closePanel,
    };
    const id = new URL(location).searchParams.get('scene');
    await enter(app.catalog.some((s) => s.id === id) ? id : 'town', false);
    const startZone = Number(new URL(location).searchParams.get('zone'));
    if (
      app.data &&
      new URL(location).searchParams.has('zone') &&
      Number.isInteger(startZone) &&
      startZone >= 0 &&
      startZone < app.data.zones.length
    ) {
      app.world.goZone(startZone);
      $('zone-select').value = String(startZone);
    }
    if (app.data && new URL(location).searchParams.get('view') === 'plan')
      app.world.overview();
    if (!app.storageOK)
      toast('保存した記録を読み込めませんでした。自由に探索できます。');
  } catch (e) {
    $('loading').querySelector('strong').textContent = '町を開けませんでした';
    $('loading').querySelector('p').textContent =
      e.message +
      ' ページを再読み込みするか、WebGL対応のブラウザーをお試しください。';
    console.error(e);
  }
}
start();
