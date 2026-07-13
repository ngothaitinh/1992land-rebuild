// Chạy 1 lần để đăng ký /slash commands hiện trong menu ☰ của Telegram.
// Usage: TELEGRAM_BOT_TOKEN=... ADAPTER=1992land node engine/register-commands.mjs
//
// Danh sách lấy thẳng từ cfg.slash_commands — cùng nguồn mà serve.mjs định tuyến,
// nên không thể đăng ký một lệnh mà bot không xử lý được.
import https from "node:https";
import path  from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const ADAPTER = process.env.ADAPTER || "1992land";

if (!TOKEN) { console.error("❌ Thiếu TELEGRAM_BOT_TOKEN"); process.exit(1); }

const adapterPath = path.join(__dirname, "..", "adapters", ADAPTER, "config.mjs");
const { default: cfg } = await import(pathToFileURL(adapterPath).href);

const commands = [
  { command: "start", description: "Khởi động bot" },
  ...cfg.slash_commands.map(({ command, description }) => ({ command, description })),
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
