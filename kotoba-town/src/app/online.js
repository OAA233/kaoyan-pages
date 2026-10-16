// Online town client (REQ-102): signed-in learners see each other in the same scene. Since REQ-115 the whole
// town is one room: one connection for the visit, changing scene is a message, chat is town-wide.
// Messages are event-driven to keep the bill near zero: movement is sent when walking starts, turns
// noticeably, changes speed or stops (plus at most one correction per second while walking).
// Any failure simply leaves the town in single-player mode.
import { $, app, node, save, state, toast } from './context.js';
import { openPanel, closePanel } from './panels.js';
import { addChatLine, initChat, setChatAvailable } from './chat.js';

export const EMOTES = [['👋', '手を振る'], ['😊', 'にっこり'], ['❤️', 'ハート'], ['🎉', 'やったね'], ['👍', 'いいね'], ['❓', 'はてな'], ['😮', 'びっくり'], ['💤', 'ねむい']];
export const PHRASES = [
  ['こんにちは！', '你好！'], ['よろしくね！', '请多关照！'], ['一緒に行こう！', '一起走吧！'], ['ありがとう！', '谢谢！'],
  ['すごい！', '好厉害！'], ['これは何？', '这是什么？'], ['がんばろう！', '一起加油！'], ['またね！', '回头见！'],
];
const HIDDEN_DISCONNECT_MS = 60_000;
// Tickets live 120 s on the server; reuse one for scene changes and reconnects within this window.
const TICKET_REUSE_MS = 90_000;
const PING_MS = 30_000;
// After an unexpected drop, others stay on screen (standing) this long while we reconnect; the welcome reconciles them.
const STALE_REMOTES_MS = 6000;
const CHAT_SECONDS = 5;
// The town is full (TOWN_CAPACITY): play alone and try again after this long.
const FULL_RETRY_MS = 60_000;
const CHAT_INTERVAL_MS = 2000;
const REFUSALS = {
  muted: '禁言中のため、メッセージは送れません（禁言期间不能发送文字，固定的问候仍可使用）。',
  rate: 'メッセージは2秒に1回まで送れます（每2秒最多发送一条）。',
  link: 'リンクは送れません（不能发送网址）。',
  contact: '連絡先のような数字は送れません（不能发送联系方式）。',
  word: '不適切なことばが含まれているため送れませんでした（含有不当用语）。',
};

// peers: latest known state of everyone in the room, so a scene rebuild (season change) can restore them.
// ticket: { info, until } reused across scene changes and reconnects while still valid.
// room: the scene this learner is in (the connection itself is for the whole town).
// town: everyone else online, id → { name, scene } (REQ-119); peers holds only this scene's figures.
const net = { ticket: null, staleTimer: 0, mode: 'idle', ws: null, room: null, you: null, name: '', speak: true, lastChat: 0, retry: 0, timer: 0, pingTimer: 0, authTimer: 0, hiddenTimer: 0, last: null, peers: new Map(), town: new Map() };

const isMuted = (id) => state.muted.some((m) => m.id === id);
function setMuted(id, name, muted) {
  state.muted = state.muted.filter((m) => m.id !== id);
  if (muted) { state.muted.push({ id, name }); app.world?.cancelRemoteSkill(id); }
  save();
  toast(muted ? name + 'さんのメッセージ・スキルを表示しません。' : name + 'さんのブロックを解除しました。');
}

function setStatus(mode) {
  net.mode = mode;
  setChatAvailable(mode === 'online');
  const b = $('online-button');
  if (!b) return;
  b.hidden = mode === 'guest' || mode === 'off' || mode === 'idle';
  b.dataset.mode = mode;
  updateCount();
}
function updateCount() {
  const n = $('online-count');
  // The whole town, not just this scene (REQ-119).
  if (n) n.textContent = net.mode === 'online' ? String(net.town.size + 1) : net.mode === 'full' ? '満員' : '…';
}
const placeName = (id) => (id === 'town' ? '町' : app.catalog?.find((c) => c.id === id)?.jp || id);
const characterFor = (id) => app.characters.find((c) => c.id === id) || app.characters[0];
const send = (message) => { if (net.ws?.readyState === WebSocket.OPEN) net.ws.send(typeof message === 'string' ? message : JSON.stringify(message)); };

function clearPeers() {
  clearTimeout(net.staleTimer);
  net.staleTimer = 0;
  app.world?.clearRemotes();
  net.peers.clear();
}

function close(intentional = true, keepPeers = false) {
  clearTimeout(net.timer);
  clearInterval(net.pingTimer);
  clearInterval(net.authTimer);
  const ws = net.ws;
  net.ws = null;
  if (ws) {
    ws.onclose = ws.onmessage = ws.onerror = null;
    try { ws.close(1000, intentional ? 'bye' : 'retry'); } catch { /* closed */ }
  }
  if (!keepPeers) { clearPeers(); net.town.clear(); }
}

/**
 * Be online in this scene; called on start and after every scene change.
 * reconnect: retrying after a drop; figures already shown stay until the welcome.
 */
export async function joinRoom(scene, reconnect = false) {
  if (net.mode === 'guest' || net.mode === 'off') return;
  const live = net.ws && net.ws.readyState <= WebSocket.OPEN;
  if (net.room === scene && live) {
    for (const p of net.peers.values()) addPeer(p);
    return;
  }
  if (live && !reconnect) {
    // Same connection, another scene: the room answers with that scene's welcome. While still connecting,
    // the hello sent on open carries the new scene instead.
    net.room = scene;
    clearPeers();
    net.last = null;
    send({ t: 'scene', s: scene });
    return;
  }
  if (net.mode === 'full' && !reconnect) { net.room = scene; return; } // the retry timer joins later
  net.room = scene;
  close(true, reconnect);
  if (document.hidden) return;
  setStatus('connecting');
  let info = net.ticket && performance.now() < net.ticket.until ? net.ticket.info : null;
  if (!info) {
    try {
      const r = await fetch('/api/town/ticket', { cache: 'no-store', credentials: 'same-origin' });
      if (r.status === 401) return setStatus('guest');
      if (r.status === 429 || r.status >= 500) return retryLater();
      if (!r.ok) return setStatus('off');
      info = await r.json();
    } catch {
      return retryLater();
    }
    if (info?.online) net.ticket = { info, until: performance.now() + TICKET_REUSE_MS };
  }
  if (typeof info?.name === 'string') {
    net.name = info.name;
    app.world?.setPlayerName(info.name);
  }
  if (!info?.online) return setStatus('off');
  if (net.room !== scene) return; // the learner moved on while we waited
  net.you = info.you;
  net.speak = info.speak !== false;
  const ws = new WebSocket(info.url.replace(/\/$/, '') + '/town/' + encodeURIComponent(scene) + '?ticket=' + encodeURIComponent(info.ticket));
  net.ws = ws;
  let opened = false;
  ws.onopen = () => {
    opened = true;
    net.retry = 0;
    net.last = null;
    send({ t: 'hello', c: state.character, s: net.room });
    net.pingTimer = setInterval(() => send('ping'), PING_MS);
    net.authTimer = setInterval(() => renewAccess(ws), 60_000);
  };
  ws.onmessage = (event) => receive(event.data);
  ws.onclose = (event) => {
    if (net.ws !== ws) return;
    net.ws = null;
    clearInterval(net.pingTimer);
  clearInterval(net.authTimer);
    if (!opened) net.ticket = null; // refused before opening (e.g. the ticket expired): fetch a fresh one
    // A brief drop (network blip, room restart on deploy) should not make everyone vanish and pop back.
    // Counted from the first drop; failed retries do not extend it.
    net.staleTimer ||= setTimeout(clearPeers, STALE_REMOTES_MS);
    if(event.code===4003)net.ticket=null;
    if (event.code === 4001) return townFull();
    if (event.code === 4000) { clearPeers(); return setStatus('idle'); } // replaced by another tab
    retryLater();
  };
}

async function renewAccess(ws) {
 if(net.ws!==ws||ws.readyState!==WebSocket.OPEN)return;
 try{const r=await fetch('/api/town/ticket',{cache:'no-store',credentials:'same-origin'});const info=r.ok?await r.json():null;
  if(net.ws!==ws)return;
  if(!info?.online||!info.ticket){net.ticket=null;close();setStatus('off');return;}
  net.ticket={info,until:performance.now()+TICKET_REUSE_MS};ws.send(JSON.stringify({t:'auth',ticket:info.ticket}));
 }catch{/* The server lease expires without a valid renewal; reconnect requests fresh access. */}
}
function townFull() {
  clearPeers();
  net.town.clear();
  clearTimeout(net.timer);
  if (net.mode !== 'full') toast('オンラインの町が満員です。ひとりで遊べます（联网人数已满，稍后自动重试）。');
  setStatus('full');
  net.timer = setTimeout(() => { const scene = net.room; net.room = null; joinRoom(scene, true); }, FULL_RETRY_MS);
}

function retryLater() {
  setStatus('connecting');
  clearTimeout(net.timer);
  net.retry = Math.min(net.retry + 1, 5);
  net.timer = setTimeout(() => { const scene = net.room; net.room = null; joinRoom(scene, true); }, Math.min(30_000, 1000 * 2 ** net.retry));
}

function receive(text) {
  if (text === 'pong') return;
  let m;
  try { m = JSON.parse(text); } catch { return; }
  const w = app.world;
  if (!w) return;
  if (m.t === 'welcome') {
    setStatus('online');
    // Reconcile rather than rebuild, so figures kept through a reconnect do not flicker.
    clearTimeout(net.staleTimer);
    net.staleTimer = 0;
    const ids = new Set(m.peers.map((p) => p.id));
    for (const id of [...(w.remotes?.keys() || [])]) if (!ids.has(id)) w.removeRemote(id);
    net.peers.clear();
    for (const p of m.peers) addPeer(p);
    if (Array.isArray(m.town)) net.town = new Map(m.town.map((p) => [p.id, { name: p.n, scene: p.sc }]));
    net.last = null;
    sendMove(true);
  } else if (m.t === 'here' && m.id !== net.you) net.town.set(m.id, { name: m.n, scene: m.sc });
  else if (m.t === 'gone') net.town.delete(m.id);
  else if (m.t === 'join') addPeer(m.peer);
  else if (m.t === 'mv') {
    const p = net.peers.get(m.id);
    if (p) Object.assign(p, { x: m.x, z: m.z, vx: m.vx, vz: m.vz, at: performance.now() });
    w.updateRemote(m.id, m);
  } else if (m.t === 'leave') { w.removeRemote(m.id); net.peers.delete(m.id); }
  else if (m.t === 'skill' && !isMuted(m.id)) w.startRemoteSkill(m.id, m);
  else if (m.t === 'skill-end') w.cancelRemoteSkill(m.id, m.n);
  else if (m.t === 'emote' && EMOTES[m.e] && !isMuted(m.id)) w.bubble(m.id, EMOTES[m.e][0]);
  else if (m.t === 'say' && PHRASES[m.p] && !isMuted(m.id)) w.bubble(m.id, PHRASES[m.p][0]);
  else if (m.t === 'chat' && typeof m.s === 'string') {
    const self = m.id === net.you;
    if (!self && isMuted(m.id)) return;
    // Town-wide chat: a bubble only over someone in this scene; lines from elsewhere name their place.
    if (self || net.peers.has(m.id)) w.bubble(self ? null : m.id, m.s, CHAT_SECONDS);
    const name = self ? net.name || 'あなた' : net.peers.get(m.id)?.name || (typeof m.n === 'string' ? m.n : '') || '？';
    addChatLine(name, m.s, self, !self && typeof m.sc === 'string' && m.sc !== net.room ? placeName(m.sc) : '');
  } else if (m.t === 'chat-no') toast(REFUSALS[m.r] || 'メッセージを送れませんでした。');
  updateCount();
}
function addPeer(p) {
  if (p.id === net.you) return;
  p.at ??= performance.now();
  net.peers.set(p.id, p);
  // A peer silent for a while has stopped (or walked on); don't replay its old velocity.
  const still = performance.now() - p.at > 1500;
  app.world.addRemote(p.id, characterFor(p.c), p.name, still ? { ...p, vx: 0, vz: 0 } : p);
}

/**
 * Called from the world's per-frame callback; sends only meaningful changes. Moves are sent even when
 * nobody else is around, so the room's stored position stays current for newcomers. The intended
 * velocity is reported, so easing into and out of a walk adds no messages.
 */
export function sendMove(force = false) {
  const w = app.world;
  if (net.mode !== 'online' || !w?.player) return;
  const v = w.playerVel, aimV = w.playerTarget || v, p = w.playerPos, t = performance.now(), last = net.last;
  const speed = Math.hypot(v.x, v.z), aim = Math.hypot(aimV.x, aimV.z), moving = speed > 0.05 || aim > 0.05;
  const vx = aim > 0.05 ? aimV.x : 0, vz = aim > 0.05 ? aimV.z : 0;
  let due = force || !last || moving !== last.moving;
  if (!due && moving) {
    const lastAim = Math.hypot(last.vx, last.vz);
    if (aim > 0.05 && lastAim > 0.05) {
      const turn = Math.acos(Math.max(-1, Math.min(1, (vx * last.vx + vz * last.vz) / (aim * lastAim))));
      due = turn > 0.35 || Math.abs(aim - lastAim) > Math.max(1.2, 0.4 * lastAim);
    } else due = aim > 0.05 !== lastAim > 0.05; // let go (gliding to a stop) or set off again
    due ||= t - last.t > 1000;
  }
  if (!due && !moving) due = Math.hypot(p.x - last.x, p.z - last.z) > 0.3; // teleported (zone, seat)
  if (!due) return;
  net.last = { x: p.x, z: p.z, vx, vz, moving, t };
  send({ t: 'mv', x: p.x, z: p.z, vx, vz });
}

function emote(i) { send({ t: 'emote', e: i }); app.world.bubble(null, EMOTES[i][0]); closePanel(); }
function say(i) { send({ t: 'say', p: i }); app.world.bubble(null, PHRASES[i][0]); closePanel(); }

/** Free text from the chat dock; the server re-checks everything and echoes what it relays. */
function sendChat(text) {
  if (net.mode !== 'online' || net.ws?.readyState !== WebSocket.OPEN) { toast('オンラインにつながっていません。'); return false; }
  if (!net.speak) { toast(REFUSALS.muted); return false; }
  if ([...text].length > 40) return false;
  if (performance.now() - net.lastChat < CHAT_INTERVAL_MS) { toast(REFUSALS.rate); return false; }
  net.lastChat = performance.now();
  send({ t: 'chat', s: text });
  return true;
}

function muteButton(id, name, after) {
  const b = node('button', 'mute-toggle', isMuted(id) ? 'ブロック解除 · 取消屏蔽' : 'ブロック · 屏蔽');
  b.onclick = () => { setMuted(id, name, !isMuted(id)); after(); };
  return b;
}

/** Tapping another learner: their name and a switch to hide their messages on this device. */
export function openPeerCard({ id }) {
  const p = net.peers.get(id);
  if (!p) return;
  const body = openPanel(p.name, 'peer', 'みんなの町');
  const c = characterFor(p.c), row = node('div', 'peer-card'), img = node('img');
  img.src = c.image;
  img.alt = '';
  row.append(img, node('p', 'panel-intro', isMuted(id)
    ? 'この人のメッセージ・あいさつ・スキルは表示されていません。'
    : 'ブロックすると、この人のメッセージ・あいさつ・スキルがこの端末で表示されなくなります。'));
  body.append(row, muteButton(id, p.name, () => openPeerCard({ id })));
}

/** "みんなの町" panel: everyone online in the town by place, emotes, fixed phrases and blocked learners. */
export function openOnlinePanel() {
  const body = openPanel('みんなの町', 'online', 'いっしょに歩こう');
  const everyone = [...net.town.entries()];
  const here = everyone.filter(([, p]) => p.scene === net.room), elsewhere = everyone.filter(([, p]) => p.scene !== net.room);
  body.append(node('p', 'panel-intro', net.mode !== 'online'
    ? 'つないでいます…しばらくお待ちください。'
    : here.length || elsewhere.length ? '町にいる人：' + (net.town.size + 1) + '人（あなたを含む）' : 'いまオンラインなのはあなただけです。'));
  const roster = (title, rows) => {
    if (!rows.length) return;
    body.append(node('h3', 'online-heading', title));
    const list = node('ul', 'peer-list');
    for (const { id, name, place } of rows) {
      const li = node('li', '', name);
      if (place) li.append(node('small', 'peer-place', place));
      li.append(muteButton(id, name, openOnlinePanel));
      list.append(li);
    }
    body.append(list);
  };
  if (net.mode === 'online') {
    roster('この場所', here.map(([id, p]) => ({ id, name: p.name })));
    roster('ほかの場所', elsewhere.sort((a, b) => placeName(a[1].scene).localeCompare(placeName(b[1].scene))).map(([id, p]) => ({ id, name: p.name, place: placeName(p.scene) })));
  }
  body.append(node('h3', 'online-heading', 'あいさつ・気持ち'));
  const grid = node('div', 'emote-grid');
  EMOTES.forEach(([icon, label], i) => {
    const b = node('button', 'emote');
    b.append(node('span', 'emote-icon', icon), node('small', '', label));
    b.onclick = () => emote(i);
    grid.append(b);
  });
  body.append(grid);
  body.append(node('h3', 'online-heading', 'ひとこと'));
  const list = node('div', 'phrase-list');
  PHRASES.forEach(([jp, zh], i) => {
    const b = node('button', 'phrase');
    const z = node('small', 'translation', zh);
    z.lang = 'zh-CN';
    b.append(node('span', '', jp), z);
    b.onclick = () => say(i);
    list.append(b);
  });
  body.append(list);
  const away = state.muted.filter((m) => !net.peers.has(m.id) && !net.town.has(m.id));
  if (away.length) {
    body.append(node('h3', 'online-heading', 'ブロック中'));
    const list = node('ul', 'peer-list');
    for (const m of away) {
      const li = node('li', '', m.name || '？');
      li.append(muteButton(m.id, m.name, openOnlinePanel));
      list.append(li);
    }
    body.append(list);
  }
  body.append(node('p', 'panel-intro', '画面下の入力欄から自由にメッセージを送れます（40字まで・リンクや連絡先は送れません）。'));
}

/** Character changed: tell the room. */
export function announceCharacter() { if (net.mode === 'online') send({ t: 'hello', c: state.character }); }

export function initOnline() {
  app.world.onSkillStart = (event) => {
    if (net.mode !== 'online') return;
    sendMove(true); // Stop and correct the position before the room relays a skill.
    send({ t: 'skill', ...event, y: Math.atan2(Math.sin(event.y), Math.cos(event.y)) });
  };
  app.world.onSkillEnd = (n) => {
    if (net.mode === 'online') send({ t: 'skill-end', n });
  };
  initChat(sendChat);
  document.addEventListener('visibilitychange', () => {
    clearTimeout(net.hiddenTimer);
    if (document.hidden) net.hiddenTimer = setTimeout(() => { if (document.hidden) { close(); if (net.mode === 'online') setStatus('connecting'); } }, HIDDEN_DISCONNECT_MS);
    else if (!net.ws && net.room && net.mode !== 'guest' && net.mode !== 'off') { const scene = net.room; net.room = null; joinRoom(scene); }
  });
  addEventListener('pagehide', () => close());
}
export const onlineDebug = net;
