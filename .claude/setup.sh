#!/bin/bash
# .claude/setup.sh — Cloud VM 初始化時自動執行
set -euo pipefail

if ! command -v age &> /dev/null; then
  echo "Installing age..."
  apt-get update -qq && apt-get install -y -qq age
fi

if [ -f .env.age ] && [ -n "${AGE_SECRET_KEY:-}" ]; then
  echo "Decrypting .env.age..."
  KEY_FILE=$(mktemp)
  echo "$AGE_SECRET_KEY" > "$KEY_FILE"
  age -d -i "$KEY_FILE" -o .env .env.age
  rm -f "$KEY_FILE"
  echo "✓ .env decrypted successfully ($(grep -c '=' .env) variables)"
else
  echo "⚠ Skipping decryption: .env.age not found or AGE_SECRET_KEY not set"
fi
