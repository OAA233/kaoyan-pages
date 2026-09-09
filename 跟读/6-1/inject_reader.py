#!/usr/bin/env python3
"""
把「读」功能注入 6-1 融合版课件 HTML
- 日文段落逐句包装为可点击 span（高亮当前句）
- 注入播放控制条（播放/暂停/上句/下句/语速/循环/进度）
- 保留原页面全部内容（语法、词汇、强化笔记、A3 打印适配）
输出: ~/Desktop/考研/瑞译课程/跟读/6-1/6-1 融合版（带读）.html
"""

import json
import os
import re

BASE = os.path.expanduser("~/Desktop/考研/瑞译课程")
SRC = os.path.join(BASE, "html/6-1 注意力经济与信息健康.html")
DATA = os.path.join(BASE, "跟读/6-1/data.json")
OUT = os.path.join(BASE, "跟读/6-1/6-1 融合版（带读）.html")

with open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

with open(DATA, "r", encoding="utf-8") as f:
    data = json.load(f)

sentences = data["sentences"]

# ===== 1. 按段组织句子 =====
by_section = {}
for s in sentences:
    by_section.setdefault(s["section"], []).append(s)

# 全局句子索引映射：section -> [idx,...]
sec_idx = {}
gi = 0
for sec in sorted(by_section.keys()):
    sec_idx[sec] = []
    for s in by_section[sec]:
        sec_idx[sec].append(gi)
        gi += 1

total = gi
print(f"共 {total} 句，{len(by_section)} 段")

# ===== 2. 把每个 section 的日文段落替换为句级 span =====
def wrap_paragraph(m):
    sec_id = m.group(1)
    sec = int(sec_id)
    jp_inner = m.group(2)
    if sec not in by_section:
        return m.group(0)
    spans = []
    for idx, s in zip(sec_idx[sec], by_section[sec]):
        audio_name = os.path.basename(s["audio_file"])
        spans.append(f'<span class="sentence" data-idx="{idx}" data-audio="{audio_name}"><span class="play-ic">▶</span>{s["jp_html"]}</span>')
    return f'<p class="jp">{chr(10)}  {"".join(spans)}{chr(10)}</p>'

# 只处理正文段落 <p class="jp">，注意排除语法/词汇/笔记里的 jp 类
html_new = re.sub(r'<section id="p(\d+)">.*?<p class="jp">(.*?)</p>',
                  lambda m: m.group(0).replace(m.group(2), wrap_paragraph(m)), html, flags=re.DOTALL)

if html_new == html:
    print("⚠ 段落替换未发生，检查正则")
else:
    print("✓ 段落已按句包装")

# ===== 3. 注入控制条 CSS =====
player_css = r"""
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

html_new = html_new.replace("</style>", player_css + "\n</style>", 1)

# ===== 4. 注入控制条 HTML（放在 header 之后） =====
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

# header 结束标签后插入
html_new = html_new.replace("</header>", "</header>\n" + player_html, 1)

# ===== 5. 注入 JS（</body> 前） =====
audio_dir_rel = "../跟读/6-1/audio/"  # 从 跟读/6-1/ 输出文件出发，指向同目录 audio/
# 注：输出文件在 跟读/6-1/ 下，audio 就在同目录，故用 "audio/"
audio_dir_rel = "audio/"

player_js = r"""
<script>
// ===== 跟读控制（注入）=====
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

  function secOf(el){
    let sec = el.closest('section');
    return sec ? sec.id.replace(/\D/g,'') : '1';
  }
  function sentenceInSec(el){
    const sec = el.closest('section');
    const all = sec.querySelectorAll('.sentence');
    for (let i=0;i<all.length;i++) if (all[i]===el) return i+1;
    return 1;
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

  // 句子点击
  document.querySelectorAll('.sentence').forEach(el=>{
    el.addEventListener('click', ()=>playSentence(parseInt(el.dataset.idx)));
  });

  // 键盘
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

  // 暴露调试接口（便于外部验证/自动化）
  window.__reader = { getAudio: () => audio, getState: () => ({current, playing, rate, loopMode}) };
})();
</script>
"""

player_js = player_js.replace("__AUDIO_DIR__", audio_dir_rel).replace("__TOTAL__", str(total))
html_new = html_new.replace("</body>", player_js + "\n</body>", 1)

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html_new)

print(f"✅ 输出: {OUT} ({os.path.getsize(OUT)} bytes)")
print(f"   句子数: {total}")