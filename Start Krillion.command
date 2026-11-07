#!/bin/zsh
set -e
cd -- "$(dirname -- "$0")"
if ! command -v python3 >/dev/null 2>&1; then
  print -u2 'Python 3 is required. Install Python 3 from python.org, then open this launcher again.'
  read -r '?Press Return to close.'
  exit 1
fi
python3 scripts/serve.py
