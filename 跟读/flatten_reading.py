#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把每个课的 融合版（带读）.html 复制到 跟读/ 一级目录（方便直接打开），
并把复制后 HTML 里的 AUDIO_DIR 修正为指向子目录的 audio/（如 "6-3/audio/"）。
子目录里的原文件保留（权威副本，batch_build_all.py 每次重新生成）。
"""
import os
import re
import shutil

BASE = os.path.expanduser("~/Desktop/考研/瑞译课程")
OUT_ROOT = os.path.join(BASE, "跟读")

# 课号顺序（用于打印排序）：数字课在前，周次在后
def sort_key(lid):
    m = re.match(r'^(\d+)-(\d+)$', lid)
    if m:
        return (0, int(m.group(1)), int(m.group(2)))
    m = re.match(r'^第(\d+)周', lid)
    if m:
        return (1, int(m.group(1)), 0)
    return (2, 0, 0)

done = []
for d in sorted(os.listdir(OUT_ROOT)):
    if d.startswith('.') or not os.path.isdir(os.path.join(OUT_ROOT, d)):
        continue
    if d in ('_build', '__pycache__'):
        continue
    subdir = os.path.join(OUT_ROOT, d)
    for f in sorted(os.listdir(subdir)):
        if f.endswith('融合版（带读）.html'):
            src = os.path.join(subdir, f)
            dst = os.path.join(OUT_ROOT, f)
            with open(src, encoding='utf-8') as fh:
                text = fh.read()
            # 修正音频目录常量 -> 子目录 audio/
            new_text, n = re.subn(r'const AUDIO_DIR = "[^"]*";',
                                  f'const AUDIO_DIR = "{d}/audio/";', text)
            if n == 0:
                print(f"⚠ {d}: 未找到 AUDIO_DIR，跳过")
                continue
            with open(dst, 'w', encoding='utf-8') as fh:
                fh.write(new_text)
            done.append((sort_key(d), d, f, n))

done.sort(key=lambda x: x[0])
print(f"✅ 已复制 {len(done)} 个带读 HTML 到一级目录：")
for _, d, f, n in done:
    print(f"   {f}  (AUDIO_DIR -> {d}/audio/, {n} 处)")
