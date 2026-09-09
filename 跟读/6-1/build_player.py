#!/usr/bin/env python3
"""
构建 6-1 跟读播放器 index.html
将 data.json 内嵌进 HTML（数据 + 音频路径），file:// 直接可用
"""

import json
import os
import re

BASE = os.path.expanduser("~/Desktop/考研/瑞译课程/跟读/6-1")
DATA_PATH = os.path.join(BASE, "data.json")
OUT_PATH = os.path.join(BASE, "index.html")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# 将数据按段落分组
paras = {}
for s in data["sentences"]:
    sec = s["section"]
    paras.setdefault(sec, []).append(s)

para_list = []
for sec in sorted(paras.keys()):
    para_list.append({
        "section": sec,
        "title": f"第{['一','二','三','四','五','六','七','八','九','十'][sec-1]}段",
        "sentences": paras[sec],
        "zh": paras[sec][0]["zh"]
    })

payload = {
    "title": data["title"],
    "title_jp": data["title_jp"],
    "voice": data["voice"],
    "paras": para_list
}

json_str = json.dumps(payload, ensure_ascii=False)

HTML_TEMPLATE = r"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__ ｜ 跟读</title>
<style>
  :root{
    --ink:#1d2a34;
    --muted:#64727d;
    --paper:#fffdf8;
    --bg:#eef3f2;
    --line:#dbe5e1;
    --green:#0f766e;
    --green-soft:#e6f5f1;
    --orange:#c15b24;
    --orange-soft:#fff0e7;
    --yellow:#c08a12;
    --yellow-soft:#fbf3dd;
    --shadow:0 12px 35px rgba(31,56,52,.10);
    --highlight:#fff3bf;
    --highlight-border:#e8c86a;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    margin:0;color:var(--ink);
    background:
      radial-gradient(circle at 10% 0%, #dff4ec 0, transparent 27rem),
      radial-gradient(circle at 100% 14%, #fff0d9 0, transparent 25rem),
      var(--bg);
    font-family:"Noto Serif SC","Songti SC","STSong",serif;
    line-height:1.9;
  }
  .top-nav{
    position:sticky;top:0;z-index:100;
    display:flex;flex-wrap:wrap;align-items:center;gap:8px;
    padding:10px 18px;
    background:rgba(20,91,85,.96);
    backdrop-filter:blur(6px);
    box-shadow:0 4px 14px rgba(20,60,55,.25);
  }
  .top-nav .nav-title{
    color:#baf6e8;font:700 .8rem/1 system-ui,sans-serif;
    letter-spacing:.14em;margin-right:6px;white-space:nowrap;
  }
  .top-nav a{
    padding:5px 13px;border-radius:999px;
    color:#fff;background:rgba(255,255,255,.14);
    text-decoration:none;font:600 .84rem/1.2 system-ui,sans-serif;
    white-space:nowrap;transition:background .15s;
  }
  .top-nav a:hover{background:#198f7c}
  .top-nav a.to-top{background:rgba(255,255,255,.28)}
  .wrap{max-width:900px;margin:auto;padding:24px 20px 60px}
  header{
    padding:34px 34px 28px;
    border-radius:24px;color:#fff;
    background:linear-gradient(135deg,#145b55,#0d766b 58%,#198f7c);
    box-shadow:var(--shadow);
  }
  .eyebrow{
    margin:0 0 10px;color:#baf6e8;font-size:.8rem;
    letter-spacing:.16em;font-family:system-ui,sans-serif;font-weight:700;
  }
  h1{margin:0;font-size:clamp(1.6rem,4vw,2.4rem);line-height:1.35}
  header p{margin:10px 0 0;color:#e2fffa;font-size:.92rem}

  /* ===== 播放控制条 ===== */
  .player-bar{
    position:sticky;top:56px;z-index:90;
    display:flex;align-items:center;gap:12px;flex-wrap:wrap;
    margin:18px 0 22px;padding:12px 18px;
    border:1px solid var(--line);border-radius:18px;
    background:rgba(255,253,248,.94);
    box-shadow:0 8px 22px rgba(31,56,52,.08);
  }
  .pb-btn{
    width:44px;height:44px;border:0;border-radius:50%;
    cursor:pointer;display:inline-grid;place-items:center;
    background:var(--green);color:#fff;
    font-size:1.05rem;transition:transform .12s, background .15s;
  }
  .pb-btn:hover{background:#198f7c;transform:scale(1.06)}
  .pb-btn.small{width:36px;height:36px;background:#e8f1ee;color:var(--green);font-size:.95rem}
  .pb-btn.small:hover{background:#d6e8e3}
  .pb-btn:disabled{opacity:.35;cursor:default;transform:none}
  .rate-group{display:flex;gap:5px;margin-left:auto}
  .rate-btn{
    padding:4px 11px;border:1px solid var(--line);border-radius:999px;
    background:#fff;color:var(--muted);cursor:pointer;
    font:600 .82rem system-ui,sans-serif;
  }
  .rate-btn.active{background:var(--green);border-color:var(--green);color:#fff}
  .mode-btn{
    padding:4px 11px;border:1px solid var(--line);border-radius:999px;
    background:#fff;color:var(--muted);cursor:pointer;
    font:600 .82rem system-ui,sans-serif;
  }
  .mode-btn.active{background:var(--orange);border-color:var(--orange);color:#fff}
  .progress{
    flex-basis:100%;height:6px;border-radius:3px;
    background:#e3ece8;position:relative;cursor:pointer;
  }
  .progress .fill{
    position:absolute;left:0;top:0;bottom:0;border-radius:3px;
    background:linear-gradient(90deg,#0f766e,#2ba98c);width:0%;
  }
  .progress .knob{
    position:absolute;top:50%;width:14px;height:14px;border-radius:50%;
    background:#fff;border:2px solid var(--green);transform:translate(-50%,-50%);
    left:0%;box-shadow:0 1px 4px rgba(0,0,0,.2);
  }
  .sentence-status{
    flex-basis:100%;color:var(--muted);font:600 .78rem system-ui,sans-serif;
  }

  /* ===== 段落卡片 ===== */
  section{margin-top:26px;scroll-margin-top:120px}
  .section-title{
    display:flex;align-items:center;gap:12px;
    margin:0 0 14px;font-size:1.3rem;
  }
  .section-title span{
    display:inline-grid;place-items:center;width:32px;height:32px;
    border-radius:50%;color:#fff;background:var(--green);
    font-family:system-ui,sans-serif;font-size:.9rem;
  }
  .para-card{
    border:1px solid var(--line);border-radius:20px;
    background:var(--paper);box-shadow:var(--shadow);
    overflow:hidden;
  }
  .jp-block{padding:22px 26px 10px}
  .sentence{
    margin:0 0 12px;font-size:1.12rem;letter-spacing:.02em;
    font-family:"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif;
    border-radius:8px;padding:3px 10px;margin-left:-10px;margin-right:-10px;
    cursor:pointer;transition:background .18s;
    border-left:4px solid transparent;
  }
  .sentence:hover{background:#eaf4fc}
  .sentence.playing{
    background:linear-gradient(90deg, rgba(137,207,240,.60), rgba(137,207,240,.28));
    border-left-color:#2f7cc4;
    box-shadow:0 2px 10px rgba(47,124,196,.22);
  }
  .sentence .play-icon{
    display:inline-block;margin-right:6px;color:#2f7cc4;
    font-size:.82em;opacity:.55;font-family:system-ui,sans-serif;
  }
  .sentence.playing .play-icon{opacity:1;color:#1c5f9e}
  ruby{ruby-position:over;ruby-align:center}
  rt{font-size:.52em;color:var(--yellow);font-weight:700;letter-spacing:0;user-select:none}

  .zh-toggle{
    display:flex;align-items:center;gap:8px;
    padding:12px 26px;border-top:1px dashed #cbd8d3;
    background:#fbfcfb;
  }
  .zh-toggle button{
    border:1px solid var(--line);border-radius:999px;
    background:#fff;color:var(--muted);cursor:pointer;
    font:600 .8rem system-ui,sans-serif;padding:4px 14px;
  }
  .zh-toggle button:hover{color:var(--green);border-color:var(--green)}
  .zh-text{
    display:none;padding:0 26px 18px;color:#3d4a54;font-size:1rem;
  }
  .zh-text.show{display:block}
  .zh-text .zh-label{
    display:inline-block;margin-bottom:6px;padding:2px 10px;border-radius:999px;
    color:var(--orange);background:var(--orange-soft);
    font:700 .75rem/1.4 system-ui,sans-serif;letter-spacing:.08em;
  }

  .back-top{margin:14px 2px 0;text-align:right;font-size:.85rem}
  .back-top a{color:var(--muted);text-decoration:none}
  .back-top a:hover{color:var(--green)}

  footer{margin-top:30px;color:var(--muted);font-size:.8rem;text-align:center}

  @media(max-width:640px){
    .wrap{padding:14px 12px 44px}
    header{padding:26px 22px}
    .jp-block{padding:18px 18px 8px}
    .sentence{font-size:1.05rem}
    .player-bar{top:50px;padding:10px 12px}
  }

  @media print{
    .player-bar,.top-nav{display:none !important}
  }
</style>
</head>
<body>
<nav class="top-nav">
  <span class="nav-title">跟 读</span>
  <a href="#p1">第一段</a><a href="#p2">第二段</a><a href="#p3">第三段</a>
  <a class="to-top" href="#top">▲ 顶部</a>
</nav>

<main class="wrap" id="top">
  <header>
    <p class="eyebrow">JAPANESE FOLLOW-ALONG READING · 瑞译课程</p>
    <h1>__TITLE__<br><span style="font-size:.66em;font-weight:400;color:#d7f7ef">__TITLE_JP__</span></h1>
    <p>点击任意句子开始跟读，空格键播放/暂停，←→ 切换句子，↑↓ 调整语速。</p>
  </header>

  <div class="player-bar">
    <button class="pb-btn small" id="btn-prev" title="上一句（←）">⏮</button>
    <button class="pb-btn" id="btn-play" title="播放/暂停（空格）">▶</button>
    <button class="pb-btn small" id="btn-next" title="下一句（→）">⏭</button>
    <div class="rate-group" id="rate-group">
      <button class="rate-btn" data-rate="0.5">0.5x</button>
      <button class="rate-btn" data-rate="0.75">0.75x</button>
      <button class="rate-btn active" data-rate="1">1x</button>
      <button class="rate-btn" data-rate="1.25">1.25x</button>
      <button class="rate-btn" data-rate="1.5">1.5x</button>
    </div>
    <button class="mode-btn" id="btn-mode" title="循环模式">循环: 关</button>
    <div class="progress" id="progress"><div class="fill" id="progress-fill"></div><div class="knob" id="progress-knob"></div></div>
    <div class="sentence-status" id="sentence-status">就绪 — 点击下方任意句子开始</div>
  </div>

  <div id="paras"></div>

  <footer>
    __TITLE__ ｜ 日语跟读（句级播放 · 微软神经语音）<br>
    音频由 edge-tts (ja-JP-NanamiNeural) 生成，仅供个人学习使用
  </footer>
</main>

<script>
const DATA = __DATA__;

// ====== 状态 ======
let sentences = [];
let current = 0;
let playing = false;
let rate = 1.0;
let loopMode = false; // false=顺播至末句停止, true=循环全文

// 组装句子列表
DATA.paras.forEach(p => {
  p.sentences.forEach(s => {
    s.paraTitle = p.title;
    s.paraZh = p.zh;
    sentences.push(s);
  });
});

// ====== DOM 构建 ======
const parasEl = document.getElementById('paras');

DATA.paras.forEach((p, pi) => {
  const sec = document.createElement('section');
  sec.id = 'p' + p.section;
  const title = document.createElement('h2');
  title.className = 'section-title';
  title.innerHTML = '<span>' + p.section + '</span>' + p.title;
  sec.appendChild(title);

  const card = document.createElement('div');
  card.className = 'para-card';

  const jp = document.createElement('div');
  jp.className = 'jp-block';
  p.sentences.forEach(s => {
    const el = document.createElement('p');
    el.className = 'sentence';
    el.dataset.idx = sentences.indexOf(s);
    el.innerHTML = '<span class="play-icon">▶</span>' + s.jp_html;
    el.addEventListener('click', () => {
      playSentence(sentences.indexOf(s));
    });
    jp.appendChild(el);
  });
  card.appendChild(jp);

  // 中文对照（段落级，默认折叠）
  const zhToggle = document.createElement('div');
  zhToggle.className = 'zh-toggle';
  const btn = document.createElement('button');
  btn.textContent = '中 文 对 照';
  btn.addEventListener('click', () => {
    zhText.classList.toggle('show');
    btn.textContent = zhText.classList.contains('show') ? '隐 藏 译 文' : '中 文 对 照';
  });
  zhToggle.appendChild(btn);
  card.appendChild(zhToggle);

  const zhText = document.createElement('div');
  zhText.className = 'zh-text';
  zhText.innerHTML = '<span class="zh-label">中文</span><div>' + p.zh + '</div>';
  card.appendChild(zhText);

  sec.appendChild(card);
  parasEl.appendChild(sec);
});

// ====== 音频播放 ======
const audio = new Audio();
let curAudioSrc = '';

function playSentence(idx) {
  if (idx < 0 || idx >= sentences.length) return;
  current = idx;
  const s = sentences[idx];
  // 先置为播放中状态（音频可能还在加载），避免「点了没反应」的错觉
  playing = true;
  updateUI();
  // 相对路径：audio/xxx.mp3
  audio.src = s.audio_file;
  audio.playbackRate = rate;
  audio.currentTime = 0;
  audio.play().then(() => {
    playing = true;
    updateUI();
  }).catch(e => {
    console.error('播放失败:', e);
    // 尝试绝对路径
    audio.src = new URL(s.audio_file, location.href).href;
    audio.play().then(() => { playing = true; updateUI(); }).catch(e2 => console.error('仍然失败:', e2));
  });
}

function togglePlay() {
  if (playing) {
    audio.pause();
    playing = false;
    updateUI();
  } else {
    if (!audio.src) {
      playSentence(current);
    } else {
      audio.play().then(() => { playing = true; updateUI(); });
    }
  }
}

function nextSentence() {
  if (current + 1 < sentences.length) {
    playSentence(current + 1);
  } else if (loopMode) {
    playSentence(0);
  } else {
    audio.pause(); playing = false; updateUI();
  }
}

function prevSentence() {
  if (current > 0) playSentence(current - 1);
}

audio.addEventListener('ended', () => {
  nextSentence();
});

// ====== 进度条 ======
audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-knob').style.left = pct + '%';
  }
});

document.getElementById('progress').addEventListener('click', e => {
  if (!audio.duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

// ====== 速率 ======
document.getElementById('rate-group').addEventListener('click', e => {
  const btn = e.target.closest('.rate-btn');
  if (!btn) return;
  rate = parseFloat(btn.dataset.rate);
  audio.playbackRate = rate;
  document.querySelectorAll('.rate-btn').forEach(b => b.classList.toggle('active', b === btn));
});

// ====== 循环模式 ======
document.getElementById('btn-mode').addEventListener('click', () => {
  loopMode = !loopMode;
  document.getElementById('btn-mode').textContent = '循环: ' + (loopMode ? '开' : '关');
  document.getElementById('btn-mode').classList.toggle('active', loopMode);
});

// ====== 状态显示 ======
function updateUI() {
  const btn = document.getElementById('btn-play');
  btn.textContent = playing ? '⏸' : '▶';
  // 高亮当前句
  document.querySelectorAll('.sentence').forEach(el => {
    el.classList.toggle('playing', parseInt(el.dataset.idx) === current);
  });
  const s = sentences[current];
  document.getElementById('sentence-status').textContent =
    (playing ? '播放中' : '暂停') + ' ｜ ' + s.paraTitle + ' 第' + s.sentence_index + '句';
  // 滚动当前句到可视区
  const el = document.querySelector('.sentence.playing');
  if (el) {
    const rect = el.getBoundingClientRect();
    const bar = document.querySelector('.player-bar').getBoundingClientRect();
    if (rect.top < bar.bottom || rect.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// ====== 键盘 ======
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  switch (e.code) {
    case 'Space': e.preventDefault(); togglePlay(); break;
    case 'ArrowRight': nextSentence(); break;
    case 'ArrowLeft': prevSentence(); break;
    case 'ArrowUp': e.preventDefault(); setRate(Math.min(1.5, rate + 0.25)); break;
    case 'ArrowDown': e.preventDefault(); setRate(Math.max(0.5, rate - 0.25)); break;
  }
});

function setRate(r) {
  rate = Math.round(r * 100) / 100;
  audio.playbackRate = rate;
  document.querySelectorAll('.rate-btn').forEach(b => {
    b.classList.toggle('active', parseFloat(b.dataset.rate) === rate);
  });
}

document.getElementById('btn-play').addEventListener('click', togglePlay);
document.getElementById('btn-next').addEventListener('click', nextSentence);
document.getElementById('btn-prev').addEventListener('click', prevSentence);

// 预加载第一个音频
audio.preload = 'auto';
</script>
</body>
</html>
"""

html_out = (HTML_TEMPLATE
            .replace('__TITLE__', data["title"])
            .replace('__TITLE_JP__', data["title_jp"])
            .replace('__DATA__', json_str))

with open(OUT_PATH, "w", encoding="utf-8") as f:
    f.write(html_out)

print(f"✅ index.html 已生成: {OUT_PATH} ({os.path.getsize(OUT_PATH)} bytes)")