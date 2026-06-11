// notify.mjs — Gửi tin nhắn Telegram (script độc lập)
//
// Cách dùng:
//   node notify.mjs "Nội dung tin nhắn"
//   node notify.mjs "✅ Xong: Deploy thành công lúc 14:30"
//
// Đọc token từ:
//   1. process.env.TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (từ .env)
//   2. Hoặc config.mjs kề bên (nếu không có env)
//
import https from "https";
import { pathToFileURL } from "url";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getCredentials() {
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    return {
      token:  process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
    };
  }
  // Fallback: đọc từ config.mjs
  const cfgPath = path.join(__dirname, "config.mjs");
  if (fs.existsSync(cfgPath)) {
    const { default: cfg } = await import(pathToFileURL(cfgPath).href);
    if (cfg.bot_token && cfg.chat_id) {
      return { token: cfg.bot_token, chatId: String(cfg.chat_id) };
    }
  }
  return null;
}

async function sendMessage(token, chatId, text) {
  const body = JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true });
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${token}/sendMessage`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          const j = JSON.parse(d);
          j.ok ? resolve(j.result) : reject(new Error(j.description));
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const msg = process.argv.slice(2).join(" ");
if (!msg) {
  console.error("Dùng: node notify.mjs \"Nội dung tin nhắn\"");
  process.exit(1);
}

const creds = await getCredentials();
if (!creds) {
  console.error("❌ Chưa có TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID.");
  console.error("   Đặt trong .env hoặc config.mjs.");
  process.exit(1);
}

await sendMessage(creds.token, creds.chatId, msg);
console.log("✅ Đã gửi:", msg.slice(0, 80));
