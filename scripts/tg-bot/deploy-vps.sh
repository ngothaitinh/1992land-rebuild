#!/usr/bin/env bash
# Deploy / cập nhật tg-bot trên VPS bằng 1 lệnh.
# Cách dùng (trên VPS):  bash scripts/tg-bot/deploy-vps.sh
# Tự làm: git pull -> kiểm tra .env -> npm install -> pm2 start/reload -> register commands.
set -euo pipefail

# --- Tìm gốc repo (thư mục chứa .git) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BOT_DIR="$REPO_ROOT/scripts/tg-bot"
cd "$REPO_ROOT"

echo "==> Repo: $REPO_ROOT"

# --- [1] Kéo code mới ---
echo "==> [1/5] git pull origin main"
git pull origin main

# --- [2] Kiểm tra .env (chỉ điền tay 1 lần) ---
if [ ! -f "$BOT_DIR/.env" ]; then
  echo "‼  Chưa có $BOT_DIR/.env"
  echo "   Tạo từ mẫu rồi điền 3 giá trị (TOKEN, CHAT_IDS, PAT) rồi chạy lại:"
  echo "     cp $BOT_DIR/.env.example $BOT_DIR/.env && nano $BOT_DIR/.env"
  exit 1
fi
echo "==> [2/5] .env OK"

# --- [3] Cài dependency (nếu có package.json) ---
echo "==> [3/5] npm install"
if [ -f "$REPO_ROOT/package.json" ]; then
  npm install --legacy-peer-deps --no-audit --no-fund >/dev/null 2>&1 || \
    echo "   (npm install bỏ qua / không bắt buộc)"
fi

# --- [4] pm2: reload nếu đang chạy, ngược lại start ---
echo "==> [4/5] pm2"
if pm2 describe tg-bot-1992land >/dev/null 2>&1; then
  pm2 reload "$BOT_DIR/ecosystem.config.cjs"
else
  pm2 start "$BOT_DIR/ecosystem.config.cjs"
fi
pm2 save >/dev/null 2>&1 || true

# --- [5] Đăng ký slash commands (idempotent, chạy lại vô hại) ---
echo "==> [5/5] register-commands"
( cd "$BOT_DIR" && set -a && . ./.env && set +a && node engine/register-commands.mjs )

echo ""
echo "✅ Xong. Trạng thái bot:"
pm2 status tg-bot-1992land || true
