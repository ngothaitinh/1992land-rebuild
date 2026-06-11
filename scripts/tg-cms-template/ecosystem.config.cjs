// ecosystem.config.cjs — PM2 config cho Bot Telegram CMS
//
// Khởi động:  pm2 start ecosystem.config.cjs
// Xem log:    pm2 logs tg-cms-bot
// Dừng:       pm2 stop tg-cms-bot
// Restart:    pm2 restart tg-cms-bot
//
// PM2 tự đọc biến môi trường từ file .env (cùng thư mục với file này).
// Tên file .env có thể đổi ở ENV_FILE bên dưới.
//

const fs   = require("fs");
const path = require("path");

// ─── Đọc file .env thủ công (không cần cài dotenv) ───────────────────────────

const ENV_FILE = path.join(__dirname, ".env");   // ← đổi thành ".env.local" nếu cần

const env = {};
try {
  const raw = fs.readFileSync(ENV_FILE, "utf8");
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
  if (e.code !== "ENOENT") console.error("Không đọc được .env:", e.message);
}

// ─── App config ───────────────────────────────────────────────────────────────

module.exports = {
  apps: [
    {
      name:           "tg-cms-bot",          // ← đổi tên nếu chạy nhiều bot
      script:         "serve.mjs",
      cwd:            __dirname,             // chạy từ thư mục chứa serve.mjs
      interpreter:    "node",
      env,
      watch:          false,
      autorestart:    true,
      max_restarts:   20,
      restart_delay:  5000,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
