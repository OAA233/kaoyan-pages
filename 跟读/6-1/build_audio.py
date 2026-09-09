#!/usr/bin/env python3
"""
6-1 注意力经济与信息健康 音频生成脚本 v3
修复：跳过 <rt> 内的假名，避免干扰句子边界
"""

import re
import json
import asyncio
import os

HTML_PATH = os.path.expanduser("~/Desktop/考研/瑞译课程/html/6-1 注意力经济与信息健康.html")
AUDIO_DIR = os.path.expanduser("~/Desktop/考研/瑞译课程/跟读/6-1/audio")
DATA_PATH = os.path.expanduser("~/Desktop/考研/瑞译课程/跟读/6-1/data.json")
VOICE = "ja-JP-NanamiNeural"

os.makedirs(AUDIO_DIR, exist_ok=True)


def html_to_plain(html):
    """
    将带 ruby 标签的 HTML 转为纯文本。
    跳过 <rt> 内的假名（不作为句子内容）。
    返回 (plain_text, char_entries) 其中 char_entries 记录每个可见字符对应的 HTML 偏移。
    entry 结构: (html_char_offset, html_char_len, plain_index)
    只记录真正产出到 plain 的字符（基字，不含 rt 内假名）。
    """
    plain = ""
    entries = []  # (html_start, html_len, plain_index)
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
        # 普通字符
        if not in_rt:
            entries.append((i, 1, len(plain)))
            plain += html[i]
        i += 1
    return plain, entries


def split_html_at_boundaries(html, plain_boundaries):
    """
    按纯文本字符位置切分 HTML。
    plain_boundaries: [0, s1_end, s2_end, ...] 纯文本中的字符下标（含结尾）。
    """
    plain, entries = html_to_plain(html)
    # 所有 <ruby> 开标签位置，用于把从句首被切掉的 <ruby> 补回来
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
        # 如果句首紧跟一个 <ruby> 开标签（基字被切掉开标签），补回 <ruby>
        # 逐层回退：只要 h_start 前紧邻的标签是 <ruby> 就包含进来
        while True:
            tag_len = len('<ruby>')
            if h_start >= tag_len and html[h_start - tag_len:h_start] == '<ruby>':
                h_start -= tag_len
            else:
                break
        # 如果句尾落在 <ruby> 内部（最后一个基字后还有 </rt></ruby> 被切掉），补回闭合
        # 检查 h_end 之后是否直接是 </rt></ruby> 或 </ruby> 且句内 ruby 开标签未闭合
        seg = html[h_start:h_end]
        if seg.count('<ruby>') > seg.count('</ruby>'):
            # 需要补闭合：找到 h_end 后最近的闭合序列
            rest = html[h_end:]
            m = re.match(r'\s*(</rt>)?\s*(</ruby>)', rest)
            if m:
                h_end += m.end()
        parts.append(html[h_start:h_end])
    return parts


def _fix_leading_rt(html):
    """去掉开头的孤立 </rt> 或闭合残留"""
    html = re.sub(r'^</rt>', '', html)
    html = re.sub(r'^<rt>.*?</rt>', '', html)
    return html


def extract_sentences(html):
    sections = re.findall(r'<section id="p(\d+)">(.*?)</section>', html, re.DOTALL)
    result = []
    for sec_id, sec_content in sections:
        jp_match = re.search(r'<p class="jp">(.*?)</p>', sec_content, re.DOTALL)
        if not jp_match:
            continue
        jp_html = jp_match.group(1)

        # 中文译文（整段级别）
        zh_match = re.search(r'<p class="zh">(.*?)</p>', sec_content, re.DOTALL)
        zh_text = zh_match.group(1) if zh_match else ""
        zh_text = re.sub(r'<ruby>(.*?)<rt>.*?</rt></ruby>', r'\1', zh_text)
        zh_text = re.sub(r'<[^>]+>', '', zh_text)
        zh_text = zh_text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')

        # 纯文本 + 分句边界
        plain_text, _ = html_to_plain(jp_html)
        boundaries = [0]
        for m in re.finditer(r'[。！？]', plain_text):
            boundaries.append(m.end())
        if boundaries[-1] < len(plain_text):
            boundaries.append(len(plain_text))

        # 分割
        html_parts = split_html_at_boundaries(jp_html, boundaries)
        text_parts = [plain_text[boundaries[i]:boundaries[i+1]].strip()
                      for i in range(len(boundaries)-1)]

        for i, (s_plain, s_html) in enumerate(zip(text_parts, html_parts)):
            if not s_plain.strip():
                continue
            s_html2 = _fix_leading_rt(s_html.strip())
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


async def generate_audio(sentences):
    from edge_tts import Communicate
    for s in sentences:
        audio_path = os.path.join(os.path.dirname(DATA_PATH), s["audio_file"])
        if os.path.exists(audio_path) and os.path.getsize(audio_path) > 1000:
            print(f"  ✓ 已存在: {s['sentence_id']}")
            continue
        text = s["jp_plain"]
        print(f"  → 生成: {s['sentence_id']} ({len(text)} chars)")
        try:
            tts = Communicate(text, voice=VOICE)
            await tts.save(audio_path)
            print(f"  ✓ 完成: {s['sentence_id']} ({os.path.getsize(audio_path)} bytes)")
        except Exception as e:
            print(f"  ✗ 失败: {s['sentence_id']}: {e}")


def verify_ruby_integrity(sentences):
    for s in sentences:
        html = s["jp_html"]
        o_r = html.count('<ruby>'); c_r = html.count('</ruby>')
        o_t = html.count('<rt>'); c_t = html.count('</rt>')
        # 允许孤立的闭合残留已在 _fix_leading_rt 清理，这里检查平衡
        ok = (o_r == c_r) and (o_t == c_t)
        if not ok:
            print(f"  ⚠ {s['sentence_id']}: ruby({o_r}/{c_r}) rt({o_t}/{c_t}) 不平衡")
        else:
            print(f"  ✓ {s['sentence_id']}: 完整")


def main():
    print("=== 1. 读取 HTML ===")
    with open(HTML_PATH, 'r', encoding='utf-8') as f:
        html = f.read()

    print("=== 2. 提取句子 ===")
    sentences = extract_sentences(html)
    print(f"共提取 {len(sentences)} 句")

    print("\n=== 3. 校验 ruby 标签 ===")
    verify_ruby_integrity(sentences)

    print("\n=== 4. 输出句子预览 ===")
    for s in sentences:
        print(f"  {s['sentence_id']}: {s['jp_plain'][:70]}...")

    print("\n=== 5. 生成音频 ===")
    asyncio.run(generate_audio(sentences))

    print("\n=== 6. 写入 data.json ===")
    data = {
        "title": "6-1 注意力经济与信息健康",
        "title_jp": "アテンション・エコノミーと「情報的健康」",
        "voice": VOICE,
        "sentences": sentences
    }
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ 写入 {len(sentences)} 句 → data.json")


if __name__ == "__main__":
    main()