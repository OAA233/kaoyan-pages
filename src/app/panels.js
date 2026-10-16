import { $, app } from './context.js';

export function syncCollectionSelection() {
  for (const tile of $('panel').querySelectorAll('.item-tile'))
    tile.setAttribute(
      'aria-pressed',
      String(tile.dataset.wordId === app.selected?.id),
    );
  $('panel').classList.toggle('has-detail', !!app.selected);
}
export function closeWord() {
  app.selected = null;
  $('word-card').hidden = true;
  document.body.classList.remove('has-word');
  syncCollectionSelection();
}
export function collectionOpen() {
  return ['menu', 'book', 'products'].includes(app.panelKind);
}
export function openPanel(title, kind, kicker = 'ことば町') {
  if (app.panelKind) closePanel();
  closeWord();
  app.lastFocus = document.activeElement;
  app.panelKind = kind;
  app.world.cancelAction();
  app.world.disabled = true;
  app.world.keys.clear();
  app.world.stick = { x: 0, y: 0 };
  $('joystick-knob').style.transform = '';
  $('panel-title').textContent = title;
  $('panel-kicker').textContent = kicker;
  $('panel-body').replaceChildren();
  $('overlay').hidden = false;
  $('game').inert = true;
  requestAnimationFrame(() => $('close-panel').focus());
  return $('panel-body');
}
export function closePanel() {
  if (!app.panelKind) return;
  if (collectionOpen()) {
    closeWord();
    $('game').append($('word-card'));
  }
  $('panel').classList.remove('collection-panel', 'has-detail');
  $('overlay').hidden = true;
  $('game').inert = false;
  app.panelKind = '';
  app.world.disabled = false;
  app.world.keys.clear();
  app.world.request();
  if (app.lastFocus?.isConnected) app.lastFocus.focus({ preventScroll: true });
}
