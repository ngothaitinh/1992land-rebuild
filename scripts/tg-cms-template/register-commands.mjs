// register-commands.mjs — Đăng ký lệnh /slash với Telegram
//
// Chạy một lần để menu lệnh hiện ra khi gõ "/" trong chat:
//   node register-commands.mjs
//
// Sau khi chạy xong, anh gõ "/" trong Telegram sẽ thấy danh sách lệnh.
//
import https from "https";
import { pathToFileURL } from "url";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cfgPath = path.join(__dirname, "config.mjs");
if (!fs.existsSync(cfgPath)) {
  console.error("❌ Chưa có config.mjs. Copy config.example.mjs → config.mjs trước.");
  process.exit(1);
}
const { default: config } = await import(pathToFileURL(cfgPath).href);

const TOKEN    = config.bot_token;
const COMMANDS = config.commands || [];

if (!TOKEN) { console.error("❌ Chưa có bot_token trong config.mjs"); process.exit(1); }

// Lệnh menu + tất cả lệnh từ config
const commands = [
  { command: "menu",  description: "Mở menu quản lý nội dung" },
  ...COMMANDS.map((c) => ({
    command:     c.command,
    description: c.description || c.title || c.label || c.command,
  })),
];

function apiPost(method, params) {
  const body = JSON.stringify(params);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${TOKEN}/${method}`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let d = ""; res.on("data", (c) => (d += c));
        res.on("end", () => {
          const j = JSON.parse(d);
          j.ok ? resolve(j.result) : reject(new Error(j.description));
        });
      }
    );
    req.on("error", reject); req.write(body); req.end();
  });
}

await apiPost("setMyCommands", { commands });
console.log(`✅ Đã đăng ký ${commands.length} lệnh:`);
for (const c of commands) console.log(`   /${c.command} — ${c.description}`);
console.log("\nKiểm tra: gõ \"/\" trong chat với bot để xem menu.");
