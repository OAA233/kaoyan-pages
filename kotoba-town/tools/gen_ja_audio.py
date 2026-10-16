#!/usr/bin/env python3
"""预生成日语音库（本机 VOICEVOX 四国めたん・セクシー style 4）：
   词条 jp + 例句 example -> audio/ja/<sha1[:12]>.mp3（断点续传）"""
import hashlib, json, os, subprocess, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "audio", "ja")
VV = "http://127.0.0.1:50021"
SPEAKER = 4  # 四国めたん セクシー

def fname(text):
    return hashlib.sha1(text.encode()).hexdigest()[:12] + ".mp3"

def synth(text):
    q = urllib.request.urlopen(urllib.request.Request(
        VV + "/audio_query?text=" + urllib.parse.quote(text) + "&speaker=%d" % SPEAKER,
        method="POST"), timeout=30).read()
    audio = urllib.request.urlopen(urllib.request.Request(
        VV + "/synthesis?speaker=%d" % SPEAKER, data=q,
        headers={"Content-Type": "application/json"}), timeout=60).read()
    return audio

def job(item):
    n, text = item
    p = os.path.join(OUT, fname(text))
    if os.path.exists(p) and os.path.getsize(p) > 1000:
        return None
    for attempt in range(2):
        try:
            audio = synth(text)
            if len(audio) > 500:
                wav = p.replace(".mp3", ".wav")
                open(wav, "wb").write(audio)
                subprocess.run(
                    ["ffmpeg", "-y", "-loglevel", "error", "-i", wav,
                     "-codec:a", "libmp3lame", "-b:a", "48k", "-ac", "1", p],
                    check=True,
                )
                os.remove(wav)
                if os.path.getsize(p) > 500:
                    return (n, "ok", os.path.getsize(p))
                raise RuntimeError("mp3 too small")
            raise RuntimeError("short audio %dB" % len(audio))
        except Exception as e:
            err = str(e)
            time.sleep(1.5 * (attempt + 1))
    return (n, "FAIL " + err, 0)

if __name__ == "__main__":
    import urllib.parse
    texts = set()
    for f in os.listdir(os.path.join(BASE, "town-data")):
        if not f.endswith(".json"):
            continue
        d = json.load(open(os.path.join(BASE, "town-data", f)))
        for it in d.get("items", []):
            if it.get("jp"):
                texts.add(it["jp"])
            if it.get("example"):
                texts.add(it["example"])
    texts = sorted(texts)
    os.makedirs(OUT, exist_ok=True)
    done = sum(1 for t in texts if os.path.exists(os.path.join(OUT, fname(t))))
    print("total %d, already done %d" % (len(texts), done), flush=True)
    fails = []
    with ThreadPoolExecutor(max_workers=4) as ex:
        for i, r in enumerate(ex.map(job, enumerate(texts))):
            if r and r[1].startswith("FAIL"):
                fails.append((texts[r[0]], r[1]))
            if (i + 1) % 200 == 0:
                print("progress %d/%d" % (i + 1, len(texts)), flush=True)
    print("FAILS:", len(fails), flush=True)
    for t, e in fails[:30]:
        print("  FAIL", t, "->", e, flush=True)
    print("audio/ja files:", len(os.listdir(OUT)), flush=True)
