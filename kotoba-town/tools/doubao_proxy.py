#!/usr/bin/env python3
"""ことば町 豆包英语 TTS 代理：页面 -> 这里 -> 火山引擎（签名凭据留在本机）。"""
import base64, json, os, re, sys, uuid
from http.server import BaseHTTPRequestHandler, HTTPServer

APPID = os.environ.get("VOLC_APP_ID", "")
KEY = os.environ.get("VOLC_ACCESS_KEY", "")
VOICE = "zh_female_xiaohe_uranus_bigtts"
URL = "https://openspeech.bytedance.com/api/v3/tts/unidirectional"

def synth(text: str) -> bytes:
    import urllib.request, ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False  # 本机 Clash TUN 会重签 TLS 证书
    ctx.verify_mode = ssl.CERT_NONE
    body = json.dumps({
        "user": {"uid": "kotoba-town"},
        "req_params": {
            "text": text,
            "speaker": VOICE,
            "audio_params": {"format": "mp3", "sample_rate": 24000},
        },
    }).encode()
    req = urllib.request.Request(URL, data=body, method="POST", headers={
        "X-Api-Key": KEY,
        "X-Api-Resource-Id": "seed-tts-2.0",
        "X-Api-Request-Id": str(uuid.uuid4()),
        "Content-Type": "application/json",
    })
    raw = urllib.request.urlopen(req, timeout=30, context=ctx).read().decode()
    dec, i, chunks = json.JSONDecoder(), 0, []
    while i < len(raw):
        while i < len(raw) and raw[i] in " \n\r\t":
            i += 1
        if i >= len(raw):
            break
        obj, i = dec.raw_decode(raw, i)
        if isinstance(obj.get("data"), str):
            chunks.append(obj["data"])
        code = obj.get("code") or (obj.get("header") or {}).get("code")
        if code and code != 20000000:
            raise RuntimeError("volc error %s: %s" % (code, obj.get("message") or (obj.get("header") or {}).get("message")))
    return b"".join(base64.b64decode(c) for c in chunks)

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/ping":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return
        self.send_response(404); self.end_headers()

    def do_POST(self):
        if not self.path.startswith("/tts"):
            self.send_response(404); self.end_headers(); return
        try:
            n = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(n))
            text = re.sub(r"\s+", " ", str(data.get("text", ""))[:200]).strip()
            if not text:
                raise ValueError("empty text")
            audio = synth(text)
            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(audio)
        except Exception as e:
            self.send_response(500)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    if not (APPID and KEY):
        sys.exit("需要环境变量 VOLC_APP_ID / VOLC_ACCESS_KEY")
    HTTPServer(("127.0.0.1", 8778), H).serve_forever()
