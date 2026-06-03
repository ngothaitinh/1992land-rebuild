// scripts/tg-reply.mjs
// Gửi tin nhắn phản hồi vào Telegram, hỗ trợ Markdown.
//
// Usage:
//   node scripts/tg-reply.mjs "Tin nhắn text"
//   node scripts/tg-reply.mjs --md "**Bold** _italic_ `code`"
//
import https from "https";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TOKEN || !CHAT_ID) {
  console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
  process.exit(1);
}

const args = process.argv.slice(2);
let parseMode = null;
let text = "";

if (args[0] === "--md") {
  parseMode = "Markdown";
  text = args.slice(1).join(" ");
} else {
  text = args.join(" ");
}

if (!text) {
  console.error("Usage: node tg-reply.mjs [--md] \"message\"");
  process.exit(1);
}

const payload = {
  chat_id: CHAT_ID,
  text,
};
if (parseMode) payload.parse_mode = parseMode;

const body = JSON.stringify(payload);
const req = https.request(
  {
    hostname: "api.telegram.org",
    path: `/bot${TOKEN}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  },
  (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      const j = JSON.parse(d);
      if (j.ok) console.log("Sent OK");
      else console.error("Error:", j.description);
    });
  }
);
req.write(body);
req.end();
