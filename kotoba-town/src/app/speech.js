// ことば町 语音模块（全离线）：
// 日语 = 预生成音库 audio/ja/<sha1[:12]>.mp3 → 本机 VOICEVOX（四国めたん・セクシー, style 4）
// 英语 = 预生成音库 audio/en/<sha1(cleanEn)[:12]>.mp3
const VV_BASE = 'http://127.0.0.1:50021';
const VV_SPEAKER = 4; // 四国めたん セクシー
const cache = new Map(); // text -> Blob URL（VOICEVOX 运行时合成用）
let vvAvailable = null;
let currentAudio = null;

export function vvStatus() {
  return vvAvailable;
}

async function probeVV() {
  if (vvAvailable !== null) return vvAvailable;
  try {
    const r = await fetch(VV_BASE + '/version', { signal: AbortSignal.timeout(1200) });
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
}

async function sha12(text) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 12);
}

async function playFile(dir, text, rate) {
  const name = await sha12(text);
  const url = './audio/' + dir + '/' + name + '.mp3';
  // 两次机会：网络抖动时重试一次
  for (let i = 0; i < 2; i++) {
    try {
      const head = await fetch(url, { method: 'HEAD' });
      if (!head.ok) {
        if (i) return false;
        continue;
      }
    } catch {
      if (i) return false;
      continue;
    }
    const a = new Audio(url);
    a.playbackRate = rate;
    currentAudio = a;
    try {
      await a.play();
      return true;
    } catch {
      if (i) return false;
    }
  }
  return false;
}

// —— 进场馆预加载：把该场所全部词条/例句/英文音频拉进浏览器缓存 ——
const prefetched = new Set();
let enLookup = null;
export function setEnLookup(fn) {
  enLookup = fn;
}
export async function prefetchVenueAudio(data) {
  if (!data?.items || prefetched.has(data.id)) return;
  prefetched.add(data.id);
  const texts = [];
  for (const it of data.items) {
    if (it.jp) texts.push(['ja', it.jp]);
    if (it.example) texts.push(['ja', it.example]);
    const en = enLookup ? enLookup(it.jp) : '';
    if (en) texts.push(['en', en]);
  }
  // 小队列串行，避免瞬时几十个请求；失败静默（点击时还有重试）
  for (const [dir, text] of texts) {
    const name = await sha12(text);
    fetch('./audio/' + dir + '/' + name + '.mp3').catch(() => {});
  }
}

// 日语朗读：预生成音库 → 本机 VOICEVOX めたん按需合成
export async function speakJa(text, { rate = 1 } = {}) {
  if (!text) return;
  stopAll();
  if (await playFile('ja', text, rate)) return;
  if (!(await probeVV())) return;
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
      return;
    }
  }
  const a = new Audio(url);
  a.playbackRate = rate;
  currentAudio = a;
  a.play().catch(() => {});
}

// 英语朗读：预生成音库（tools/gen_en_audio.py 生成）
export async function speakEn(text, { rate = 0.95 } = {}) {
  if (!text) return;
  stopAll();
  await playFile('en', text, rate);
}

export function warmUpVoices() {
  // 纯离线方案无需预热；保留导出以兼容旧调用
}

// 与 tools/gen_en_audio.py 的 clean() 保持一致（英语音库键名清洗）
export function cleanEn(s) {
  return s
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[ ,.]+|[ ,.]+$/g, '');
}
