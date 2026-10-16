// ことば町 语音模块：日语 = 本机 VOICEVOX 四国めたん（ツンツン, speaker 6）；英语 = 浏览器语音。
const VV_BASE = 'http://127.0.0.1:50021';
const VV_SPEAKER = 6; // 四国めたん ツンツン
const cache = new Map(); // text -> Blob URL
let vvAvailable = null; // null=未探测
let currentAudio = null;

export function vvStatus() {
  return vvAvailable;
}

async function probeVV() {
  if (vvAvailable !== null) return vvAvailable;
  try {
    const r = await fetch(VV_BASE + '/version', { signal: AbortSignal.timeout(1500) });
    vvAvailable = r.ok;
  } catch {
    vvAvailable = false;
  }
  return vvAvailable;
}

function stopAll() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  try { speechSynthesis.cancel(); } catch {}
}

// 日语朗读（VOICEVOX ためん・ツンツン）；VOICEVOX 不在线时退回浏览器 ja 语音
export async function speakJa(text, { rate = 1 } = {}) {
  if (!text) return;
  stopAll();
  const ok = await probeVV();
  if (ok) {
    let url = cache.get(text);
    if (!url) {
      try {
        const q = await fetch(
          VV_BASE + '/audio_query?text=' + encodeURIComponent(text) + '&speaker=' + VV_SPEAKER,
          { method: 'POST' },
        );
        const query = await q.json();
        const s = await fetch(VV_BASE + '/synthesis?speaker=' + VV_SPEAKER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query),
        });
        const blob = await s.blob();
        url = URL.createObjectURL(blob);
        cache.set(text, url);
      } catch {
        return speakJaFallback(text, rate);
      }
    }
    const a = new Audio(url);
    currentAudio = a;
    a.playbackRate = rate;
    return a.play().catch(() => speakJaFallback(text, rate));
  }
  return speakJaFallback(text, rate);
}

function speakJaFallback(text, rate) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = rate;
  const v = speechSynthesis.getVoices().find((x) => /^ja[-_]/i.test(x.lang));
  if (v) u.voice = v;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// 英语朗读：本地预生成音库 → 豆包 TTS（本地代理 :8778）→ 浏览器英文语音兜底
const DOUBAO = 'http://127.0.0.1:8778';
// 与 tools/gen_en_audio.py 的 clean() 保持一致
function cleanEn(s) {
  return s.replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '')
          .replace(/\s+/g, ' ').replace(/^[ ,.]+|[ ,.]+$/g, '');
}
function enFileUrl(text) {
  const h = cleanEn(text);
  if (!h) return Promise.resolve(null);
  return crypto.subtle.digest('SHA-1', new TextEncoder().encode(h)).then((buf) => {
    const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    return './audio/en/' + hex.slice(0, 12) + '.mp3';
  });
}
let doubaoOK = null;
async function probeDoubao() {
  if (doubaoOK !== null) return doubaoOK;
  try {
    const r = await fetch(DOUBAO + '/ping', { signal: AbortSignal.timeout(1200) });
    const j = await r.json();
    doubaoOK = !!(j && j.ok);
  } catch { doubaoOK = false; }
  return doubaoOK;
}
export async function speakEn(text, { rate = 0.95 } = {}) {
  if (!text) return;
  stopAll();
  // ① 本地预生成音库（零延迟、离线可用）
  const file = await enFileUrl(text);
  if (file) {
    try {
      const head = await fetch(file, { method: 'HEAD' });
      if (head.ok) {
        const a = new Audio(file);
        a.playbackRate = rate;
        currentAudio = a;
        return a.play().catch(() => speakEnFallback(text, rate));
      }
    } catch { /* 音库缺失，继续 */ }
  }
  // ② 豆包 TTS 代理
  if (await probeDoubao()) {
    try {
      const r = await fetch(DOUBAO + '/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error('proxy ' + r.status);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      a.playbackRate = rate;
      currentAudio = a;
      return a.play().catch(() => speakEnFallback(text, rate));
    } catch { /* 落到浏览器语音 */ }
  }
  return speakEnFallback(text, rate);
}
function speakEnFallback(text, rate) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  const voices = speechSynthesis.getVoices();
  const v =
    voices.find((x) => /en-US/i.test(x.lang) && /Aria|Jenny|Samantha|Ava|Zira/i.test(x.name)) ||
    voices.find((x) => /^en[-_]/i.test(x.lang));
  if (v) u.voice = v;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

export function warmUpVoices() {
  // Safari/Chrome 的 getVoices 异步加载
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.getVoices();
  if (speechSynthesis.onvoiceschanged !== undefined)
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}
