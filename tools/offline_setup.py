#!/usr/bin/env python3
from __future__ import annotations
import hashlib
import os
import pathlib
import sys
import tempfile
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

ASSETS = [
    {
        "name": "Plotly 4.1.1",
        "url": "https://cdn.plot.ly/plotly-4.1.1.min.js",
        "file": "plotly-4.1.1.min.js",
        "min_bytes": 1_000_000,
        "sha256_prefix": "3b6e15d45dbb7fca",
    },
    {
        "name": "ECharts 5.6.0",
        "url": "https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js",
        "file": "echarts-5.6.0.min.js",
        "min_bytes": 500_000,
        "sha256_prefix": "bf4a223524e40b77",
    },
    {
        "name": "Mermaid 11.4.1",
        "url": "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js",
        "file": "mermaid-11.4.1.min.js",
        "min_bytes": 1_000_000,
        "sha256_prefix": "a43bc1afd446f9c4",
    },
]

def sha256(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def valid_asset(path: pathlib.Path, asset: dict) -> bool:
    if not path.exists() or path.stat().st_size < asset["min_bytes"]:
        return False
    return sha256(path).startswith(asset["sha256_prefix"])

def download(asset: dict) -> None:
    target = VENDOR / asset["file"]
    if valid_asset(target, asset):
        print(f"✓ {asset['name']} 已存在且雜湊驗證通過：{target.name} ({target.stat().st_size/1024/1024:.1f} MB)")
        return
    if target.exists():
        print(f"↻ {asset['name']} 本機檔案驗證失敗，重新下載。")
        target.unlink()

    print(f"↓ 下載 {asset['name']}…")
    req = urllib.request.Request(
        asset["url"],
        headers={"User-Agent": "Visual-Canvas-Offline-Setup/1.0"},
    )
    VENDOR.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=asset["file"] + ".", dir=VENDOR)
    os.close(fd)
    tmp = pathlib.Path(tmp_name)
    try:
        with urllib.request.urlopen(req, timeout=60) as response, tmp.open("wb") as out:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                out.write(chunk)
        size = tmp.stat().st_size
        if size < asset["min_bytes"]:
            raise RuntimeError(f"下載檔案過小 ({size} bytes)，可能不是正確的 JavaScript 檔。")
        digest = sha256(tmp)
        if not digest.startswith(asset["sha256_prefix"]):
            raise RuntimeError(
                f"{asset['name']} SHA-256 驗證失敗：{digest[:16]}…，預期 {asset['sha256_prefix']}…"
            )
        tmp.replace(target)
        print(f"✓ {asset['name']} 完成：{size/1024/1024:.1f} MB · SHA256 {digest[:16]}…")
    finally:
        if tmp.exists():
            tmp.unlink()

def main() -> int:
    print("Visual Canvas 離線資源初始化")
    print(f"專案：{ROOT}")
    print("只需要第一次有網路；下載完成後可完全離線使用。\n")
    try:
        for asset in ASSETS:
            download(asset)
    except Exception as exc:
        print(f"\n✗ 初始化失敗：{exc}")
        print("請確認網路正常後重新執行。已完成的檔案會保留，不會重複下載。")
        return 1

    print("\n✓ 離線資源已準備完成。")
    print("下一步執行：python3 tools/local_server.py --port 4173")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
