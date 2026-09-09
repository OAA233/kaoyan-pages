#!/usr/bin/env python3
"""
瑞译课程全量「融合版（带读）」批量构建
- 遍历 html/*.html（跳过已完成课目）
- 每课: 提取日文句子 → edge-tts 生成音频 → 注入读功能到融合版
输出: ~/Desktop/考研/瑞译课程/跟读/<课号>/
  <课号> 融合版（带读）.html
  audio/p<N>_s<M>.mp3
  data.json
"""

import asyncio
import json
import os
import re
import sys
import time

BASE = os.path.expanduser("~/Desktop/考研/瑞译课程")
HTML_DIR = os.path.join(BASE, "html")
OUT_ROOT = os.path.join(BASE, "跟读")
VOICE = "ja-JP-NanamiNeural"

# 已完成课目（跳过）
SKIP = {"6-1"}

PLAYER_CSS = r"""
  /* ===== 跟读控制条（注入） ===== */
  .player-bar{
    position:sticky;top:56px;z-index:95;
    display:flex;align-items:center;gap:10px;flex-wrap:wrap;
    margin:18px 0 8px;padding:12px 16px;
    border:1px solid var(--line);border-radius:18px;
    background:rgba(255,253,248,.95);
    box-shadow:0 8px 22px rgba(31,56,52,.08);
  }
  .pb-btn{
    width:42px;height:42px;border:0;border-radius:50%;cursor:pointer;
    display:inline-grid;place-items:center;
    background:var(--green);color:#fff;font-size:1rem;
    transition:transform .12s, background .15s;
  }
  .pb-btn:hover{background:#198f7c;transform:scale(1.06)}
  .pb-btn.small{width:34px;height:34px;background:#e8f1ee;color:var(--green);font-size:.9rem}
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
  .sentence{
    cursor:pointer;border-radius:8px;padding:3px 10px;margin:0 -10px;
    transition:background .18s;
    border-left:4px solid transparent;
  }
  .sentence:hover{background:#eaf4fc}
  .sentence.playing{
    background:linear-gradient(90deg, rgba(137,207,240,.60), rgba(137,207,240,.28));
    border-left-color:#2f7cc4;
    box-shadow:0 2px 10px rgba(47,124,196,.22);
  }
  .sentence .play-ic{
    display:inline-block;margin-right:4px;color:#2f7cc4;
    font-size:.72em;opacity:.5;font-family:system-ui,sans-serif;vertical-align:2px;
  }
  .sentence.playing .play-ic{opacity:1;color:#1c5f9e;transform:scale(1.1)}
  @media(max-width:640px){
    .player-bar{top:50px;padding:10px 12px}
    .player-bar .rate-group{order:3;margin-left:0}
  }
  @media print{
    .player-bar{display:none !important}
    .sentence{cursor:default;padding:0;margin:0;border:0}
    .sentence.playing{background:transparent;box-shadow:none;border:0}
    .sentence .play-ic{display:none}
  }
"""

PLAYER_JS = r"""
<script>
(function(){
  const AUDIO_DIR = "__AUDIO_DIR__";
  const TOTAL = __TOTAL__;
  let current = 0;
  let playing = false;
  let rate = 1.0;
  let loopMode = false;
  const audio = new Audio();
  const $ = id => document.getElementById(id);

  function playSentence(idx){
    if (idx < 0 || idx >= TOTAL) return;
    current = idx;
    playing = true;
    updateUI();
    const s = document.querySelector('.sentence[data-idx="' + idx + '"]');
    audio.src = AUDIO_DIR + (s ? s.dataset.audio : 'p1_s1.mp3');
    audio.playbackRate = rate;
    audio.currentTime = 0;
    audio.play().then(() => { playing = true; updateUI(); })
      .catch(e => { console.error('播放失败:', e); });
  }

  function togglePlay(){
    if (playing){ audio.pause(); playing=false; updateUI(); }
    else if (!audio.src) playSentence(current);
    else { audio.play().then(()=>{playing=true;updateUI();}); }
  }
  function nextSentence(){
    if (current+1 < TOTAL) playSentence(current+1);
    else if (loopMode) playSentence(0);
    else { audio.pause(); playing=false; updateUI(); }
  }
  function prevSentence(){ if (current>0) playSentence(current-1); }

  function sentenceInSec(el){
    const sec = el.closest('section');
    const all = sec.querySelectorAll('.sentence');
    for (let i=0;i<all.length;i++) if (all[i]===el) return i+1;
    return 1;
  }

  function updateUI(){
    $('btn-play').textContent = playing ? '⏸' : '▶';
    document.querySelectorAll('.sentence').forEach(el=>{
      el.classList.toggle('playing', parseInt(el.dataset.idx)===current);
    });
    const s = document.querySelector('.sentence[data-idx="'+current+'"]');
    if (s){
      const sec = s.closest('section');
      const st = sec ? sec.querySelector('.section-title').textContent : '';
      const n = sentenceInSec(s);
      $('sentence-status').textContent = (playing?'播放中':'暂停')+' ｜ '+st+' 第'+n+'句';
      const rect = s.getBoundingClientRect();
      const bar = $('player-bar').getBoundingClientRect();
      if (rect.top < bar.bottom || rect.bottom > window.innerHeight){
        s.scrollIntoView({behavior:'smooth', block:'center'});
      }
    }
  }

  audio.addEventListener('ended', nextSentence);
  audio.addEventListener('timeupdate', ()=>{
    if (audio.duration){
      const pct = audio.currentTime/audio.duration*100;
      $('progress-fill').style.width = pct+'%';
      $('progress-knob').style.left = pct+'%';
    }
  });
  $('progress').addEventListener('click', e=>{
    if (!audio.duration) return;
    const r = $('progress').getBoundingClientRect();
    audio.currentTime = (e.clientX-r.left)/r.width*audio.duration;
  });
  $('rate-group').addEventListener('click', e=>{
    const b = e.target.closest('.rate-btn'); if(!b) return;
    rate = parseFloat(b.dataset.rate);
    audio.playbackRate = rate;
    document.querySelectorAll('.rate-btn').forEach(x=>x.classList.toggle('active', x===b));
  });
  $('btn-mode').addEventListener('click', ()=>{
    loopMode = !loopMode;
    $('btn-mode').textContent = '循环: '+(loopMode?'开':'关');
    $('btn-mode').classList.toggle('active', loopMode);
  });
  $('btn-play').addEventListener('click', togglePlay);
  $('btn-next').addEventListener('click', nextSentence);
  $('btn-prev').addEventListener('click', prevSentence);

  document.querySelectorAll('.sentence').forEach(el=>{
    el.addEventListener('click', ()=>playSentence(parseInt(el.dataset.idx)));
  });

  document.addEventListener('keydown', e=>{
    if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
    switch(e.code){
      case 'Space': e.preventDefault(); togglePlay(); break;
      case 'ArrowRight': nextSentence(); break;
      case 'ArrowLeft': prevSentence(); break;
      case 'ArrowUp': e.preventDefault(); setRate(Math.min(1.5, rate+0.25)); break;
      case 'ArrowDown': e.preventDefault(); setRate(Math.max(0.5, rate-0.25)); break;
    }
  });
  function setRate(r){
    rate = Math.round(r*100)/100;
    audio.playbackRate = rate;
    document.querySelectorAll('.rate-btn').forEach(b=>{
      b.classList.toggle('active', parseFloat(b.dataset.rate)===rate);
    });
  }
  audio.preload = 'auto';
  window.__reader = { getAudio: () => audio, getState: () => ({current, playing, rate, loopMode}) };
})();
</script>
"""


# ========== 句子提取（同 6-1 build_audio.py 算法） ==========

def html_to_plain(html):
    plain = ""
    entries = []
    i = 0
    in_rt = False
    while i < len(html):
        if html[i] == '<':
            end = html.index('>', i) + 1
            tag = html[i:end]
            if '<rt' in tag:
                in_rt = True
            elif '</rt' in tag:
                in_rt = False
            i = end
            continue
        if html[i] == '&':
            end = html.index(';', i) + 1
            entity = html[i:end]
            decoded = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'"}.get(entity, '?')
            if not in_rt:
                entries.append((i, end - i, len(plain)))
                plain += decoded
            i = end
            continue
        if not in_rt:
            entries.append((i, 1, len(plain)))
            plain += html[i]
        i += 1
    return plain, entries


def split_html_at_boundaries(html, plain_boundaries):
    plain, entries = html_to_plain(html)
    ruby_opens = [m.start() for m in re.finditer(r'<ruby>', html)]
    parts = []
    for b in range(len(plain_boundaries) - 1):
        p_start = plain_boundaries[b]
        p_end = plain_boundaries[b + 1]
        if p_start >= p_end:
            continue
        h_start = None
        h_end = None
        for hs, hl, pi in entries:
            if pi >= p_start and h_start is None:
                h_start = hs
            if pi >= p_end - 1:
                h_end = hs + hl
                break
        if h_start is None:
            h_start = 0
        if h_end is None:
            h_end = len(html)
        while True:
            tag_len = len('<ruby>')
            if h_start >= tag_len and html[h_start - tag_len:h_start] == '<ruby>':
                h_start -= tag_len
            else:
                break
        seg = html[h_start:h_end]
        if seg.count('<ruby>') > seg.count('</ruby>'):
            rest = html[h_end:]
            m = re.match(r'\s*(</rt>)?\s*(</ruby>)', rest)
            if m:
                h_end += m.end()
        parts.append(html[h_start:h_end])
    return parts


def extract_sentences(html):
    sections = re.findall(r'<section id="p(\d+)">(.*?)</section>', html, re.DOTALL)
    result = []
    for sec_id, sec_content in sections:
        jp_match = re.search(r'<p class="jp">(.*?)</p>', sec_content, re.DOTALL)
        if not jp_match:
            continue
        jp_html = jp_match.group(1)

        zh_match = re.search(r'<p class="zh">(.*?)</p>', sec_content, re.DOTALL)
        zh_text = zh_match.group(1) if zh_match else ""
        zh_text = re.sub(r'<ruby>(.*?)<rt>.*?</rt></ruby>', r'\1', zh_text)
        zh_text = re.sub(r'<[^>]+>', '', zh_text)
        zh_text = zh_text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')

        plain_text, _ = html_to_plain(jp_html)
        boundaries = [0]
        for m in re.finditer(r'[。！？]', plain_text):
            boundaries.append(m.end())
        if boundaries[-1] < len(plain_text):
            boundaries.append(len(plain_text))

        html_parts = split_html_at_boundaries(jp_html, boundaries)
        text_parts = [plain_text[boundaries[i]:boundaries[i+1]].strip()
                      for i in range(len(boundaries)-1)]

        for i, (s_plain, s_html) in enumerate(zip(text_parts, html_parts)):
            if not s_plain.strip():
                continue
            s_html2 = re.sub(r'^</rt>', '', s_html.strip())
            s_html2 = re.sub(r'^<rt>.*?</rt>', '', s_html2)
            result.append({
                "section": int(sec_id),
                "sentence_index": i + 1,
                "sentence_id": f"p{sec_id}_s{i+1}",
                "jp_plain": s_plain.strip(),
                "jp_html": s_html2,
                "zh": zh_text,
                "audio_file": f"audio/p{sec_id}_s{i+1}.mp3"
            })
    return result


def verify_ruby(sentences):
    bad = []
    for s in sentences:
        h = s["jp_html"]
        if h.count('<ruby>') != h.count('</ruby>') or h.count('<rt>') != h.count('</rt>'):
            bad.append(s["sentence_id"])
    return bad


# ========== 音频生成 ==========

async def gen_audio(sentences, out_dir):
    from edge_tts import Communicate
    made = 0
    for s in sentences:
        path = os.path.join(out_dir, s["audio_file"])
        if os.path.exists(path) and os.path.getsize(path) > 1000:
            continue
        try:
            tts = Communicate(s["jp_plain"], voice=VOICE)
            await tts.save(path)
            made += 1
            print(f"    ✓ {s['sentence_id']} ({os.path.getsize(path)}B)")
        except Exception as e:
            print(f"    ✗ {s['sentence_id']}: {e}")
        await asyncio.sleep(0.15)  # 避免过快触发限流
    return made


# ========== 注入读功能到融合版 ==========

def inject_reader(src_html, sentences, audio_dir_rel="audio/"):
    html = src_html

    by_section = {}
    for s in sentences:
        by_section.setdefault(s["section"], []).append(s)
    sec_idx = {}
    gi = 0
    for sec in sorted(by_section.keys()):
        sec_idx[sec] = []
        for s in by_section[sec]:
            sec_idx[sec].append(gi)
            gi += 1
    total = gi

    def wrap_paragraph(m):
        sec_id = m.group(1)
        sec = int(sec_id)
        if sec not in by_section:
            return m.group(0)
        spans = []
        for idx, s in zip(sec_idx[sec], by_section[sec]):
            audio_name = os.path.basename(s["audio_file"])
            spans.append(f'<span class="sentence" data-idx="{idx}" data-audio="{audio_name}"><span class="play-ic">▶</span>{s["jp_html"]}</span>')
        return f'<p class="jp">{chr(10)}  {"".join(spans)}{chr(10)}</p>'

    def repl(m):
        return m.group(0).replace(m.group(2), wrap_paragraph(m))

    html_new = re.sub(r'<section id="p(\d+)">.*?<p class="jp">(.*?)</p>', repl, html, flags=re.DOTALL)
    if html_new == html:
        print("    ⚠ 段落替换未发生")
    html = html_new

    html = html.replace("</style>", PLAYER_CSS + "\n</style>", 1)

    player_html = r"""
  <div class="player-bar" id="player-bar">
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
    <div class="sentence-status" id="sentence-status">点击下方任意日文句子开始跟读</div>
  </div>
"""
    html = html.replace("</header>", "</header>\n" + player_html, 1)

    js = PLAYER_JS.replace("__AUDIO_DIR__", audio_dir_rel).replace("__TOTAL__", str(total))
    html = html.replace("</body>", js + "\n</body>", 1)
    return html, total


# ========== 主流程 ==========

def lesson_id_from_filename(fname):
    m = re.match(r'^(第\d+周|\d+-\d+)', fname)
    return m.group(1) if m else fname.replace('.html', '')


def main():
    skip = set(SKIP)
    html_files = sorted(f for f in os.listdir(HTML_DIR) if f.endswith('.html'))
    todo = [f for f in html_files if lesson_id_from_filename(f) not in skip]
    print(f"待处理 {len(todo)} 个文件（跳过 {len(html_files)-len(todo)} 个）")

    for fname in todo:
        lid = lesson_id_from_filename(fname)
        src_path = os.path.join(HTML_DIR, fname)
        out_dir = os.path.join(OUT_ROOT, lid)
        os.makedirs(os.path.join(out_dir, "audio"), exist_ok=True)

        print(f"\n===== {fname}（{lid}） =====")
        with open(src_path, "r", encoding="utf-8") as f:
            html = f.read()

        sentences = extract_sentences(html)
        bad = verify_ruby(sentences)
        print(f"  提取 {len(sentences)} 句, ruby 异常: {bad if bad else '无'}")

        # 生成音频
        made = asyncio.run(gen_audio(sentences, out_dir))
        print(f"  音频: 新生成 {made}, 复用 {len(sentences)-made}")

        # data.json
        with open(os.path.join(out_dir, "data.json"), "w", encoding="utf-8") as f:
            json.dump({
                "title": fname.replace(".html", ""),
                "voice": VOICE,
                "sentences": sentences
            }, f, ensure_ascii=False, indent=2)

        # 融合版（带读）
        injected, total = inject_reader(html, sentences)
        out_html = os.path.join(out_dir, f"{lid} 融合版（带读）.html")
        with open(out_html, "w", encoding="utf-8") as f:
            f.write(injected)
        print(f"  ✓ 融合版（带读）: {out_html}（{total} 句）")


if __name__ == "__main__":
    main()