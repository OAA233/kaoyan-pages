#!/bin/bash
# ことば町本地版：起静态服务 + 打开浏览器（日语在线时可用本机 VOICEVOX 补漏；音库已全离线）
cd "$(dirname "$0")"
if ! curl -s -o /dev/null http://127.0.0.1:8777/; then
  PYTHONPATH= python3 tools/server.py >/tmp/kotoba-http.log 2>&1 &
  sleep 1
fi
open "http://127.0.0.1:8777/"
