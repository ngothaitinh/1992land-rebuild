#!/bin/bash
# setup-vps.sh — Cài bot Telegram CMS lên VPS (CentOS/Ubuntu/Debian)
#
# Cách chạy (SSH vào VPS rồi):
#   bash setup-vps.sh
#
# Hoặc chạy thẳng từ máy cục bộ:
#   ssh root@<VPS_IP> 'bash -s' < setup-vps.sh
#
# Script sẽ hỏi bạn:
#   1. Git repo URL của project
#   2. Thư mục cài đặt trên VPS
#   3. Telegram bot token + chat ID
#   4. Thư mục chứa bot trong repo (vd: tg-cms hoặc scripts/tg-cms-template)
#
set -e

echo "======================================"
echo "  Bot Telegram CMS — Cài đặt VPS"
echo "======================================"
echo ""

# ─── Kiểm tra / cài Node.js ───────────────────────────────────────────────────

install_node() {
  echo "📦 Cài Node.js 20 LTS..."
  if command -v apt-get &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  elif command -v yum &>/dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
  else
    # Tải thẳng binary
    NODE_VER="20.18.0"
    ARCH=$(uname -m | grep -q aarch64 && echo "arm64" || echo "x64")
    cd /tmp
    curl -fsSL "https://nodejs.org/dist/v${NODE_VER}/node-v${NODE_VER}-linux-${ARCH}.tar.xz" -o node.tar.xz
    tar -xf node.tar.xz -C /usr/local --strip-components=1
    rm node.tar.xz
    echo "✅ Node.js cài tại /usr/local/bin/node"
  fi
}

if ! command -v node &>/dev/null || [[ $(node -e "process.exit(+process.version.slice(1).split('.')[0]>=18?0:1)"; echo $?) -ne 0 ]]; then
  install_node
else
  echo "✅ Node.js $(node --version) đã có"
fi

# ─── Cài PM2 ──────────────────────────────────────────────────────────────────

if ! command -v pm2 &>/dev/null; then
  echo "📦 Cài PM2..."
  npm install -g pm2
  echo "✅ PM2 $(pm2 --version) đã cài"
else
  echo "✅ PM2 $(pm2 --version) đã có"
fi

# ─── Hỏi thông tin ────────────────────────────────────────────────────────────

echo ""
read -rp "Git repo URL (vd: https://github.com/user/my-site.git): " REPO_URL
read -rp "Thư mục cài đặt (mặc định /root/my-site): " INSTALL_DIR
INSTALL_DIR="${INSTALL_DIR:-/root/my-site}"
read -rp "Thư mục bot trong repo (vd: tg-cms hoặc scripts/tg-cms): " BOT_DIR
BOT_DIR="${BOT_DIR:-tg-cms}"
read -rp "TELEGRAM_BOT_TOKEN: " BOT_TOKEN
read -rp "TELEGRAM_CHAT_ID: " CHAT_ID

# ─── Clone / pull repo ────────────────────────────────────────────────────────

if [ -d "${INSTALL_DIR}/.git" ]; then
  echo ""
  echo "📥 Repo đã có — pulling latest..."
  git -C "$INSTALL_DIR" pull
else
  echo ""
  echo "📥 Đang clone repo..."
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

# ─── Tạo file .env ────────────────────────────────────────────────────────────

ENV_FILE="${INSTALL_DIR}/${BOT_DIR}/.env"
cat > "$ENV_FILE" <<EOF
TELEGRAM_BOT_TOKEN=${BOT_TOKEN}
TELEGRAM_CHAT_ID=${CHAT_ID}
EOF
echo "✅ Tạo .env tại ${ENV_FILE}"

# ─── Copy config nếu chưa có ──────────────────────────────────────────────────

BOT_PATH="${INSTALL_DIR}/${BOT_DIR}"
if [ ! -f "${BOT_PATH}/config.mjs" ]; then
  if [ -f "${BOT_PATH}/config.example.mjs" ]; then
    cp "${BOT_PATH}/config.example.mjs" "${BOT_PATH}/config.mjs"
    echo "📝 Tạo config.mjs từ config.example.mjs"
    echo "   ⚠️  Hãy chỉnh sửa ${BOT_PATH}/config.mjs cho đúng với website của bạn!"
  fi
fi

# ─── Khởi động PM2 ────────────────────────────────────────────────────────────

echo ""
echo "🚀 Khởi động bot với PM2..."
ECOSYSTEM="${BOT_PATH}/ecosystem.config.cjs"

if pm2 list | grep -q "tg-cms-bot"; then
  pm2 restart tg-cms-bot
else
  pm2 start "$ECOSYSTEM"
fi

# ─── PM2 auto-start khi reboot ────────────────────────────────────────────────

pm2 save
pm2 startup 2>/dev/null | tail -1 | bash 2>/dev/null || true

echo ""
echo "======================================"
echo "  ✅ Cài đặt hoàn tất!"
echo "======================================"
echo ""
echo "Kiểm tra bot:"
echo "  pm2 status"
echo "  pm2 logs tg-cms-bot"
echo ""
echo "Đăng ký lệnh Telegram (chạy 1 lần):"
echo "  node ${BOT_PATH}/register-commands.mjs"
echo ""
echo "Nhắn /start với bot trên Telegram để bắt đầu."
