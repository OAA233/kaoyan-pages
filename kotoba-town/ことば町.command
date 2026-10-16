#!/bin/bash
# ことば町本地版：起静态服务 + 豆包英语TTS代理 + 打开浏览器
# 豆包代理需要 .volc 文件（两行：第一行AppID，第二行AccessKey），没有也能跑（英语退浏览器语音）
cd "$(dirname "$0")"
if ! curl -s -o /dev/null http://127.0.0.1:8777/; then
  PYTHONPATH= python3 tools/server.py >/tmp/kotoba-http.log 2>&1 &
  sleep 1
fi
if [ -f .volc ]; then
  export VOLC_APP_ID=$(sed -n 1p .volc | tr -d '[:space:]')
  export VOLC_ACCESS_KEY=$(sed -n 2p .volc | tr -d '[:space:]')
fi
if [ -n "$VOLC_APP_ID" ] && ! curl -s -o /dev/null http://127.0.0.1:8778/ping; then
  PYTHONPATH= python3 tools/doubao_proxy.py >/tmp/kotoba-doubao.log 2>&1 &
  sleep 1
fi
open "http://127.0.0.1:8777/"
