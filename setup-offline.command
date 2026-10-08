#!/bin/bash
set -e
cd "$(dirname "$0")"
if ! command -v python3 >/dev/null 2>&1; then
  echo "找不到 Python 3。請先安裝 Python 3，或在終端機執行 python3 --version 確認。"
  read -r -p "按 Enter 關閉…"
  exit 1
fi
python3 tools/offline_setup.py "$@"
if [ -z "${CI:-}" ]; then
  echo
  read -r -p "完成。按 Enter 關閉…"
fi
