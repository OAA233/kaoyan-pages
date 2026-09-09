#!/usr/bin/env python3
"""
生成 跟读/index.html —— 全部课程的带读版索引页（书架）
扫描 跟读/<课号>/ 下的 <课号> 融合版（带读）.html，生成入口列表
"""

import json
import os
import re

BASE = os.path.expanduser("~/Desktop/考研/瑞译课程")
OUT_ROOT = os.path.join(BASE, "跟读")

# 课号显示顺序：按章节、周次
def sort_key(lid):
    m = re.match(r'^(\d+)-(\d+)$', lid)
    if m:
        return (0, int(m.group(1)), int(m.group(2)))
    m = re.match(r'^第(\d+)周', lid)
    if m:
        return (1, int(m.group(1)), 0)
    return (2, 0, 0)

entries = []
for d in sorted(os.listdir(OUT_ROOT)):
    if d.startswith('.') or not os.path.isdir(os.path.join(OUT_ROOT, d)):
        continue
    if d == '_build':
        continue
    # 找带读 HTML
    for f in os.listdir(os.path.join(OUT_ROOT, d)):
        if f.endswith('融合版（带读）.html'):
            data_path = os.path.join(OUT_ROOT, d, "data.json")
            title = d
            n_sent = 0
            if os.path.exists(data_path):
                try:
                    with open(data_path, encoding='utf-8') as fh:
                        data = json.load(fh)
                    title = data.get("title", d)
                    n_sent = len(data.get("sentences", []))
                except Exception:
                    pass
            entries.append({
                "lid": d,
                "title": title,
                "file": f"{f}",
                "sentences": n_sent,
                "sort": sort_key(d)
            })

entries.sort(key=lambda e: e["sort"])

cards = []
for e in entries:
    cards.append(f"""
    <a class="card" href="{e['file']}">
      <div class="lid">{e['lid']}</div>
      <div class="t">{e['title']}</div>
      <div class="meta">{e['sentences']} 句 · 点击进入跟读</div>
    </a>""")

cards_html = "\n".join(cards)

html = f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>瑞译课程 · 融合版带读书架</title>
<style>
  *{{box-sizing:border-box}}
  body{{
    margin:0;color:#1d2a34;line-height:1.7;
    background:
      radial-gradient(circle at 10% 0%, #dff4ec 0, transparent 27rem),
      radial-gradient(circle at 100% 14%, #fff0d9 0, transparent 25rem),
      #eef3f2;
    font-family:"Noto Serif SC","Songti SC","STSong",serif;
  }}
  .wrap{{max-width:1000px;margin:auto;padding:40px 24px 72px}}
  header{{
    padding:36px 38px 30px;border-radius:24px;color:#fff;
    background:linear-gradient(135deg,#145b55,#0d766b 58%,#198f7c);
    box-shadow:0 12px 35px rgba(31,56,52,.10);
  }}
  .eyebrow{{margin:0 0 10px;color:#baf6e8;font-size:.8rem;letter-spacing:.16em;font-family:system-ui,sans-serif;font-weight:700}}
  h1{{margin:0;font-size:clamp(1.6rem,4vw,2.4rem)}}
  header p{{margin:10px 0 0;color:#e2fffa;font-size:.95rem}}
  .grid{{
    display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
    margin-top:26px;
  }}
  .card{{
    display:block;padding:20px 22px;border:1px solid #dbe5e1;border-radius:18px;
    background:rgba(255,253,248,.94);box-shadow:0 7px 20px rgba(31,56,52,.06);
    color:inherit;text-decoration:none;transition:transform .15s, box-shadow .15s;
  }}
  .card:hover{{transform:translateY(-3px);box-shadow:0 12px 28px rgba(31,56,52,.14)}}
  .lid{{
    display:inline-block;padding:2px 10px;border-radius:999px;
    background:#e6f5f1;color:#0f766e;
    font:700 .8rem system-ui,sans-serif;letter-spacing:.05em;
  }}
  .t{{margin:10px 0 6px;font-size:1.12rem;font-weight:700}}
  .meta{{color:#64727d;font-size:.84rem;font-family:system-ui,sans-serif}}
  .count{{margin-top:20px;color:#64727d;font-size:.85rem;font-family:system-ui,sans-serif}}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <p class="eyebrow">RUIYI COURSE · FOLLOW-ALONG READING</p>
    <h1>瑞译课程 · 融合版带读</h1>
    <p>全部课件日文原文句级发声（微软神经语音）· 点击卡片进入，点任意句子开始跟读</p>
  </header>
  <div class="grid">{cards_html}
  </div>
  <div class="count">共 {len(entries)} 课</div>
</div>
</body>
</html>
"""

out = os.path.join(OUT_ROOT, "index.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print(f"✅ 书架: {out}（{len(entries)} 课）")