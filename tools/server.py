#!/usr/bin/env python3
"""静态服务器：给 JS/JSON 加 no-cache，保证改动即时生效。"""
import functools
from http.server import SimpleHTTPRequestHandler, HTTPServer
import os

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

class H(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

if __name__ == "__main__":
    import socket
    HTTPServer.address_family = socket.AF_INET6  # 同时接受 IPv4/IPv6（localhost 解析成 ::1 也能进）
    srv = HTTPServer(("::", 8777), H)
    try:
        srv.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
    except OSError:
        pass
    srv.serve_forever()
