const fs   = require("fs");
const path = require("path");

const ENV_FILE = path.join(__dirname, ".env");
const env = {};

try {
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf("=");
    if (idx === -1) continue;
    const k = t.slice(0, idx).trim();
    const v = t.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (k) env[k] = v;
  }
} catch (e) {
  if (e.code !== "ENOENT") console.error("Không đọc được .env:", e.message);
}

module.exports = {
  apps: [
    {
      name:            "tg-bot-1992land",
      script:          "engine/serve.mjs",
      cwd:             __dirname,
      interpreter:     "node",
      env,
      watch:           false,
      autorestart:     true,
      max_restarts:    20,
      restart_delay:   5000,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
    {
      name:            "dashboard-api",
      script:          "api/server.mjs",
      cwd:             __dirname,
      interpreter:     "node",
      env,
      watch:           false,
      autorestart:     true,
      max_restarts:    20,
      restart_delay:   5000,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
