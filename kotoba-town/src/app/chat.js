// Free-text chat dock for the online town (REQ-103): an input line and a short log of the current scene.
// Only lines relayed by the server are shown (the sender gets its own echo), so refused text never appears.
// The log lives in memory and is cleared whenever the learner changes scene.
import { $, app } from './context.js';

export const CHAT_MAX = 40;
const LOG_MAX = 50;
const coarse = () => matchMedia('(pointer: coarse)').matches;

export const normalizeChat = (text) => text.replace(/\s+/gu, ' ').replace(/[\p{Cc}\p{Cf}]/gu, '').replace(/ {2,}/g, ' ').trim();

function setOpen(open) {
  document.body.classList.toggle('chat-open', open);
  $('chat-button').setAttribute('aria-expanded', String(open));
  if (open) $('chat-button').classList.remove('unread');
}

/** Show or hide the dock as the connection comes and goes. */
export function setChatAvailable(available) {
  document.body.classList.toggle('online-chat', available);
  if (!available) {
    setOpen(false);
    $('chat-input').blur();
  }
}

export function focusChat() {
  if (!document.body.classList.contains('online-chat') || app.panelKind) return false;
  setOpen(true);
  $('chat-input').focus();
  return true;
}

/** place: the speaker's scene when it is not the reader's (chat is town-wide, REQ-115). */
export function addChatLine(name, text, self, place = '') {
  const log = $('chat-log');
  const li = document.createElement('li');
  if (self) li.className = 'self';
  const who = document.createElement('b');
  who.textContent = name;
  if (place) { const at = document.createElement('small'); at.className = 'chat-place'; at.textContent = place; li.append(at); }
  li.append(who, document.createTextNode(text));
  log.append(li);
  while (log.children.length > LOG_MAX) log.firstElementChild.remove();
  log.hidden = false;
  log.scrollTop = log.scrollHeight;
  if (!document.body.classList.contains('chat-open') && coarse()) $('chat-button').classList.add('unread');
}

/** submit(text) returns true when the line was handed to the server. */
export function initChat(submit) {
  const input = $('chat-input');
  input.maxLength = CHAT_MAX;
  $('chat-form').onsubmit = (e) => {
    e.preventDefault();
    const text = normalizeChat(input.value);
    if (!text) return input.blur();
    if (submit(text)) input.value = '';
    if (!coarse()) input.blur();
  };
  input.addEventListener('focus', () => {
    app.world.keys.clear();
    app.world.request();
  });
  input.addEventListener('keydown', (e) => {
    // Keys typed here never reach the town (movement, E to enter, Esc to reset the view).
    e.stopPropagation();
    if (e.key === 'Enter' && (e.isComposing || e.keyCode === 229)) e.preventDefault();
    if (e.key === 'Escape') {
      input.blur();
      if (coarse()) setOpen(false);
    }
  });
  $('chat-button').onclick = () => {
    const open = !document.body.classList.contains('chat-open');
    setOpen(open);
    if (open) input.focus();
  };
  $('chat-close').onclick = () => {
    input.blur();
    setOpen(false);
  };
}
