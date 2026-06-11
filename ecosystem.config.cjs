// PM2 config — chạy bot Telegram liên tục, tự load .env.local
// Khởi động: pm2 start ecosystem.config.cjs
// Xem log:   pm2 logs 1992-bot
// Dừng:      pm2 stop 1992-bot
// Restart:   pm2 restart 1992-bot

const fs = require("fs");
const path = require("path");

// Đọc .env.local thủ công (không cần cài dotenv)
const env = {};
try {
  const raw = fs.readFileSync(path.join(__dirname, ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (k) env[k] = v;
  }
} catch (e) {
  console.error("Không đọc được .env.local:", e.message);
}

module.exports = {
  apps: [
    {
      name: "1992-bot",
      script: "scripts/tg-serve-menu.mjs",
      cwd: __dirname,
      interpreter: "node",
      env,
      watch: false,
      autorestart: true,
      max_restarts: 20,
      restart_delay: 5000,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
