#!/usr/bin/env python3
"""预生成豆包英语音库：assets/words-en.json -> audio/en/<sha1[:12]>.mp3（断点续传）。"""
import base64, hashlib, json, os, re, ssl, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = open(os.path.join(BASE, ".volc")).read().splitlines()[1]
OUT = os.path.join(BASE, "audio", "en")
URL = "https://openspeech.bytedance.com/api/v3/tts/unidirectional"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

def clean(s):
    s = re.sub(r"\s*\([^)]*\)", "", s)
    s = re.sub(r"\s*\[[^\]]*\]", "", s)
    return re.sub(r"\s+", " ", s).strip(" ,.")

def fname(text):
    return hashlib.sha1(text.encode()).hexdigest()[:12] + ".mp3"

def synth(text):
    body = json.dumps({
        "user": {"uid": "kotoba-town"},
        "req_params": {"text": text, "speaker": "zh_female_xiaohe_uranus_bigtts",
                       "audio_params": {"format": "mp3", "sample_rate": 24000}},
    }).encode()
    req = urllib.request.Request(URL, data=body, headers={
        "X-Api-Key": KEY, "X-Api-Resource-Id": "seed-tts-2.0",
        "X-Api-Request-Id": str(time.time_ns()), "Content-Type": "application/json"})
    raw = urllib.request.urlopen(req, timeout=30, context=CTX).read().decode()
    dec, i, chunks = json.JSONDecoder(), 0, []
    while i < len(raw):
        while i < len(raw) and raw[i] in " \n\r\t":
            i += 1
        if i >= len(raw):
            break
        obj, i = dec.raw_decode(raw, i)
        if isinstance(obj.get("data"), str):
            chunks.append(obj["data"])
        code = obj.get("code")
        if code not in (None, 0, 20000000):
            raise RuntimeError("code %s %s" % (code, obj.get("message")))
    return b"".join(base64.b64decode(c) for c in chunks)

def job(item):
    n, text = item
    p = os.path.join(OUT, fname(text))
    if os.path.exists(p) and os.path.getsize(p) > 1000:
        return None
    for attempt in range(2):
        try:
            audio = synth(text)
            if len(audio) > 500:
                open(p, "wb").write(audio)
                return (n, "ok", len(audio))
            raise RuntimeError("short audio %dB" % len(audio))
        except Exception as e:
            err = str(e)
            time.sleep(1.5 * (attempt + 1))
    return (n, "FAIL " + err, 0)

if __name__ == "__main__":
    en = json.load(open(os.path.join(BASE, "assets", "words-en.json")))
    texts = sorted({clean(v) for v in en.values() if clean(v)})
    os.makedirs(OUT, exist_ok=True)
    done = sum(1 for t in texts if os.path.exists(os.path.join(OUT, fname(t))) and os.path.getsize(os.path.join(OUT, fname(t))) > 1000)
    print("total %d, already done %d" % (len(texts), done), flush=True)
    fails = []
    with ThreadPoolExecutor(max_workers=4) as ex:
        for i, r in enumerate(ex.map(job, enumerate(texts))):
            if r:
                n, status, size = r
                if status.startswith("FAIL"):
                    fails.append((texts[n], status))
            if (i + 1) % 100 == 0:
                print("progress %d/%d" % (i + 1, len(texts)), flush=True)
    print("FAILS:", len(fails), flush=True)
    for t, e in fails[:30]:
        print("  FAIL", t, "->", e, flush=True)
    have = len([f for f in os.listdir(OUT) if f.endswith(".mp3")])
    print("audio/en files:", have, flush=True)
