// scripts/telegram-inbox.mjs
// Kéo tin nhắn mới (text + ảnh) anh Thọ gửi vào bot Telegram.
// Lưu vào content-inbox/<timestamp>/ : message.txt + img-N.jpg
// Offset lưu ở scripts/.tg-offset.json để không lấy trùng.
//
//   node scripts/telegram-inbox.mjs
//
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OFFSET_FILE = path.join(__dirname, ".tg-offset.json");
const INBOX_DIR = path.join(ROOT, "content-inbox");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TOKEN) {
  console.error("Thiếu TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

function api(method, params = {}) {
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
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            const j = JSON.parse(d);
            if (j.ok) resolve(j.result);
            else reject(new Error(j.description));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      })
      .on("error", (e) => {
        fs.unlink(dest, () => reject(e));
      });
  });
}

function readOffset() {
  try {
    return JSON.parse(fs.readFileSync(OFFSET_FILE, "utf8")).offset || 0;
  } catch {
    return 0;
  }
}
function writeOffset(o) {
  fs.writeFileSync(OFFSET_FILE, JSON.stringify({ offset: o }, null, 2));
}

async function main() {
  const offset = readOffset();
  const updates = await api("getUpdates", { offset, timeout: 0, allowed_updates: ["message"] });

  if (!updates.length) {
    console.log("Không có tin nhắn mới.");
    return;
  }

  // Lọc theo CHAT_ID nếu có cấu hình
  const msgs = updates
    .map((u) => u.message)
    .filter(Boolean)
    .filter((m) => !CHAT_ID || String(m.chat.id) === String(CHAT_ID));

  if (!msgs.length) {
    writeOffset(updates[updates.length - 1].update_id + 1);
    console.log("Có update nhưng không khớp CHAT_ID.");
    return;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(INBOX_DIR, stamp);
  fs.mkdirSync(dir, { recursive: true });

  const texts = [];
  let imgN = 0;

  for (const m of msgs) {
    if (m.text) texts.push(m.text);
    if (m.caption) texts.push(m.caption);

    if (m.photo && m.photo.length) {
      const largest = m.photo[m.photo.length - 1]; // size lớn nhất
      const file = await api("getFile", { file_id: largest.file_id });
      const url = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
      const ext = path.extname(file.file_path) || ".jpg";
      imgN += 1;
      const dest = path.join(dir, `img-${imgN}${ext}`);
      await download(url, dest);
      console.log(`  ↓ ảnh: ${path.relative(ROOT, dest)}`);
    }

    if (m.document && /image\//.test(m.document.mime_type || "")) {
      const file = await api("getFile", { file_id: m.document.file_id });
      const url = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
      const ext = path.extname(file.file_path) || ".jpg";
      imgN += 1;
      const dest = path.join(dir, `img-${imgN}${ext}`);
      await download(url, dest);
      console.log(`  ↓ tài liệu ảnh: ${path.relative(ROOT, dest)}`);
    }
  }

  fs.writeFileSync(path.join(dir, "message.txt"), texts.join("\n\n").trim() + "\n");
  writeOffset(updates[updates.length - 1].update_id + 1);

  console.log(`\n✅ Đã lưu ${msgs.length} tin nhắn, ${imgN} ảnh vào:`);
  console.log(`   ${path.relative(ROOT, dir)}`);
  console.log(`\n--- NỘI DUNG ---\n${texts.join("\n\n")}\n`);
}

main().catch((e) => {
  console.error("Lỗi:", e.message);
  process.exit(1);
});
