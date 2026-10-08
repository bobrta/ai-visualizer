#!/bin/bash
set -e
cd "$(dirname "$0")"
if ! command -v python3 >/dev/null 2>&1; then
  echo "找不到 Python 3。"
  read -r -p "按 Enter 關閉…"
  exit 1
fi
python3 tools/local_server.py
