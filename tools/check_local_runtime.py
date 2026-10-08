#!/usr/bin/env python3
from __future__ import annotations
import functools
import http.server
import pathlib
import sys
import threading
import time
import urllib.request

def _utf8_console() -> None:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, OSError):
            pass

_utf8_console()

ROOT = pathlib.Path(__file__).resolve().parent.parent
VENDOR = ROOT / "assets" / "vendor"
EXPECTED = [
    "/",
    "/index.html",
    "/extensions/research-studio/index.html",
    "/assets/vendor/plotly-4.1.1.min.js",
    "/assets/vendor/echarts-5.6.0.min.js",
    "/assets/vendor/mermaid-11.4.1.min.js",
]

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

def main() -> int:
    missing = [p.name for p in [
        VENDOR / "plotly-4.1.1.min.js",
        VENDOR / "echarts-5.6.0.min.js",
        VENDOR / "mermaid-11.4.1.min.js",
    ] if not p.exists()]
    if missing:
        raise SystemExit("Missing offline assets: " + ", ".join(missing))

    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        time.sleep(0.1)
        for path in EXPECTED:
            url = f"http://127.0.0.1:{port}{path}"
            with urllib.request.urlopen(url, timeout=10) as response:
                body = response.read(256)
                if response.status != 200:
                    raise RuntimeError(f"{path}: HTTP {response.status}")
                if not body:
                    raise RuntimeError(f"{path}: empty response")
                print(f"✓ {path} -> {response.status}")
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
    print("PASS: cross-platform localhost runtime smoke test.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
