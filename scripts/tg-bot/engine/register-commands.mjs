// Chạy 1 lần để đăng ký /slash commands với Telegram BotFather
// Usage: TELEGRAM_BOT_TOKEN=... ADAPTER=1992land node engine/register-commands.mjs
import https from "node:https";
import path  from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const ADAPTER = process.env.ADAPTER || "1992land";

if (!TOKEN) { console.error("❌ Thiếu TELEGRAM_BOT_TOKEN"); process.exit(1); }

const adapterPath = path.join(__dirname, "..", "adapters", ADAPTER, "config.mjs");
const { default: cfg } = await import(pathToFileURL(adapterPath).href);

function toCommandName(trigger) {
  return trigger
    .replace(/^\[|\]$/g, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);
}

const commands = [
  { command: "menu",  description: "Xem menu thao tác" },
  { command: "start", description: "Khởi động bot" },
  ...cfg.commands.map((c) => ({
    command:     toCommandName(c.trigger),
    description: c.trigger,
  })),
];

const body = JSON.stringify({ commands });
const req  = https.request(
  {
    hostname: "api.telegram.org",
    path:     `/bot${TOKEN}/setMyCommands`,
    method:   "POST",
    headers:  { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
  },
  (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      const j = JSON.parse(d);
      if (j.ok) console.log(`✅ Đã đăng ký ${commands.length} lệnh Telegram cho adapter "${ADAPTER}".`);
      else console.error("❌ Lỗi:", j.description);
    });
  }
);
req.write(body);
req.end();
