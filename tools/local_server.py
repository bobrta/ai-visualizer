#!/usr/bin/env python3
from __future__ import annotations
import argparse
import functools
import http.server
import pathlib
import socket
import sys
import threading
import time
import webbrowser

ROOT = pathlib.Path(__file__).resolve().parent.parent
VENDOR = ROOT / "assets" / "vendor"
REQUIRED = [
    VENDOR / "plotly-4.1.1.min.js",
    VENDOR / "echarts-5.6.0.min.js",
    VENDOR / "mermaid-11.4.1.min.js",
]

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stdout.write("[local] " + (fmt % args) + "\n")

def free_port(preferred: int = 4173) -> int:
    for port in range(preferred, preferred + 40):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                pass
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]

def main() -> int:
    parser = argparse.ArgumentParser(description="Run Visual Canvas on localhost.")
    parser.add_argument("--check", action="store_true", help="Validate local runtime assets and exit.")
    parser.add_argument("--no-browser", action="store_true", help="Do not open a browser automatically.")
    args = parser.parse_args()

    missing = [p.name for p in REQUIRED if not p.exists()]
    if missing:
        print("缺少離線圖表引擎：")
        for name in missing:
            print("  - " + name)
        print("\n先執行：python3 tools/offline_setup.py")
        return 2

    if args.check:
        print("✓ Visual Canvas 本機執行環境完整。")
        print("✓ Plotly / ECharts / Mermaid 本機資源均存在。")
        return 0

    port = free_port()
    url = f"http://127.0.0.1:{port}/"
    handler = functools.partial(Handler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)

    print("Visual Canvas 本機模式")
    print("資料只由這台電腦上的瀏覽器與 localhost 處理。")
    print(f"網址：{url}")
    print("按 Control+C 結束。\n")

    if not args.no_browser:
        threading.Thread(target=lambda: (time.sleep(0.8), webbrowser.open(url)), daemon=True).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n正在關閉本機伺服器…")
    finally:
        server.server_close()
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
