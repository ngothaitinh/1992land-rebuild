// scripts/tg-serve-menu.mjs
// Bot server nhẹ — chạy liên tục, xử lý menu ngay lập tức.
//
//   pnpm serve   (hoặc node scripts/tg-serve-menu.mjs)
//
// Xử lý ngay:   /start, /menu, "menu" → gửi inline keyboard
//               Tap nút → gửi mẫu tương ứng trong <pre> để copy
// Lưu lại:      Tin nhắn nội dung (thêm/sửa/xóa…) → content-inbox/ cho Claude
//               Gửi xác nhận: "✅ Đã nhận — Em sẽ xử lý khi Claude mở."
//
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TEMPLATES, buildTemplateMsg } from "./tg-menu.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "..");
const OFFSET_FILE = path.join(__dirname, ".tg-offset.json");
const INBOX_DIR   = path.join(ROOT, "content-inbox");

const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
if (!TOKEN || !CHAT_ID) { console.error("Thiếu TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID"); process.exit(1); }

// ─── Telegram API ────────────────────────────────────────────────────────────

function api(method, params = {}) {
  const body = JSON.stringify(params);
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: "api.telegram.org", path: `/bot${TOKEN}/${method}`, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => { let d = ""; res.on("data", c => d += c); res.on("end", () => {
        try { const j = JSON.parse(d); j.ok ? resolve(j.result) : reject(new Error(j.description)); }
        catch (e) { reject(e); }
      }); }
    );
    req.on("error", reject); req.write(body); req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => { res.pipe(file); file.on("finish", () => file.close(resolve)); })
         .on("error", e => { fs.unlink(dest, () => reject(e)); });
  });
}

function send(chatId, text, extra = {}) {
  return api("sendMessage", { chat_id: chatId, text, parse_mode: "HTML",
    disable_web_page_preview: true, ...extra });
}

// ─── Offset ──────────────────────────────────────────────────────────────────

function readOffset() {
  try { return JSON.parse(fs.readFileSync(OFFSET_FILE, "utf8")).offset || 0; } catch { return 0; }
}
function writeOffset(o) {
  let cur = {}; try { cur = JSON.parse(fs.readFileSync(OFFSET_FILE, "utf8")); } catch {}
  cur.offset = o; fs.writeFileSync(OFFSET_FILE, JSON.stringify(cur, null, 2));
}

// ─── Inline keyboard ─────────────────────────────────────────────────────────

const MENU_TEXT = "📋 <b>1992 Land — Quản lý nội dung</b>\n\nChọn thao tác:";

const MENU_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "➕ Thêm dự án",  callback_data: "tpl:them_du_an" },
      { text: "✏️ Sửa dự án",  callback_data: "tpl:sua_du_an" },
      { text: "🗑️ Xóa",        callback_data: "tpl:xoa_du_an" },
    ],
    [
      { text: "🙈 Ẩn / Hiện phần dự án", callback_data: "tpl:an_phan" },
    ],
    [
      { text: "📝 Thêm bài",   callback_data: "tpl:them_bai" },
      { text: "✏️ Sửa bài",   callback_data: "tpl:sua_bai" },
      { text: "🗑️ Xóa bài",   callback_data: "tpl:xoa_bai" },
    ],
    [
      { text: "📖 Xem tất cả mẫu", callback_data: "tpl:all" },
    ],
  ],
};

// Nút "Menu" luôn hiện ở góc dưới trái
const REPLY_KB = { keyboard: [[{ text: "≡ Menu" }]], resize_keyboard: true, is_persistent: true };

// ─── Xử lý từng update ───────────────────────────────────────────────────────

const MENU_TRIGGERS = new Set(["menu", "≡ menu", "/menu", "/start", "mau", "mẫu", "help"]);

// Các câu anh hay nhắn nhầm vào bot → chặn, hướng dẫn đúng
const CLAUDE_TRIGGERS = new Set([
  "xử lý telegram ngay",
  "xu ly telegram ngay",
  "xử lý ngay",
  "xu ly ngay",
  "process inbox",
]);

async function handleMessage(msg) {
  if (CHAT_ID && String(msg.chat.id) !== String(CHAT_ID)) return;

  const text = (msg.text || msg.caption || "").trim();
  const lower = text.toLowerCase().trim();

  // Menu trigger → gửi inline keyboard
  if (MENU_TRIGGERS.has(lower)) {
    await send(msg.chat.id, MENU_TEXT, { reply_markup: MENU_KEYBOARD });
    return;
  }

  // /start → gửi welcome + reply keyboard persistent + inline keyboard
  if (lower === "/start") {
    await send(msg.chat.id,
      "👋 Chào anh! Bot quản lý nội dung 1992 Land sẵn sàng.\n\nNhấn <b>≡ Menu</b> bên dưới hoặc gõ /menu để bắt đầu.",
      { reply_markup: REPLY_KB }
    );
    await send(msg.chat.id, MENU_TEXT, { reply_markup: MENU_KEYBOARD });
    return;
  }

  // Câu lệnh dành cho Claude Code → KHÔNG lưu inbox, hướng dẫn đúng
  if (CLAUDE_TRIGGERS.has(lower)) {
    await send(msg.chat.id,
      "⚠️ Lệnh này cần gõ trong <b>Claude Code</b> (ứng dụng trên máy tính), không phải Telegram.\n\n" +
      "👉 Anh mở Claude Code → nhắn vào chat: <code>Xử lý Telegram ngay</code>\n\n" +
      "Còn để gửi nội dung mới, anh dùng các nút bên dưới ↓",
      { reply_markup: MENU_KEYBOARD }
    );
    return;
  }

  // Tin nhắn nội dung → lưu vào content-inbox + xác nhận
  await saveToInbox(msg, text);
  await send(msg.chat.id,
    "✅ <b>Đã nhận!</b>\n\nEm sẽ xử lý khi Claude mở.\n\n" +
    "💡 Để xử lý ngay: mở <b>Claude Code</b> trên máy tính → nhắn trong chat của Claude:\n" +
    "<code>Xử lý Telegram ngay</code>",
    { reply_markup: MENU_KEYBOARD }
  );
}

async function handleCallbackQuery(cq) {
  if (CHAT_ID && String(cq.message?.chat?.id) !== String(CHAT_ID)) return;

  const data = cq.data || "";
  if (!data.startsWith("tpl:")) return;

  const key = data.slice(4); // them_du_an | sua_du_an | ... | all

  await api("answerCallbackQuery", { callback_query_id: cq.id, text: "Đây là mẫu 👇" });

  if (key === "all") {
    // Gửi từng mẫu riêng lẻ
    for (const tpl of Object.values(TEMPLATES)) {
      await send(cq.message.chat.id, buildTemplateMsg(tpl));
    }
    return;
  }

  if (TEMPLATES[key]) {
    await send(cq.message.chat.id, buildTemplateMsg(TEMPLATES[key]));
  }
}

async function saveToInbox(msg, text) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(INBOX_DIR, stamp);
  fs.mkdirSync(dir, { recursive: true });

  const lines = [];
  if (text) lines.push(text);

  // Tải ảnh nếu có
  let imgN = 0;
  const photos = msg.photo ? [msg.photo[msg.photo.length - 1]] : [];
  const docs = (msg.document && /image\//.test(msg.document.mime_type || "")) ? [msg.document] : [];

  for (const p of photos) {
    const file = await api("getFile", { file_id: p.file_id });
    const url = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
    imgN++;
    await download(url, path.join(dir, `img-${imgN}${path.extname(file.file_path) || ".jpg"}`));
  }
  for (const d of docs) {
    const file = await api("getFile", { file_id: d.file_id });
    const url = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
    imgN++;
    await download(url, path.join(dir, `img-${imgN}${path.extname(file.file_path) || ".jpg"}`));
  }

  fs.writeFileSync(path.join(dir, "message.txt"), lines.join("\n").trim() + "\n");
  console.log(`[inbox] ${stamp} | "${text.slice(0, 60)}" | ${imgN} ảnh`);
}

// ─── Polling loop ─────────────────────────────────────────────────────────────

async function poll() {
  console.log("🤖 Bot menu đang chạy. Ctrl+C để tắt.\n   Anh gõ /start hoặc /menu trong Telegram để bắt đầu.\n");

  while (true) {
    try {
      const updates = await api("getUpdates", {
        offset: readOffset(), timeout: 30,
        allowed_updates: ["message", "callback_query"],
      });

      for (const u of updates) {
        writeOffset(u.update_id + 1);
        try {
          if (u.message)        await handleMessage(u.message);
          if (u.callback_query) await handleCallbackQuery(u.callback_query);
        } catch (e) {
          console.error(`[error] update ${u.update_id}:`, e.message);
        }
      }
    } catch (e) {
      console.error("[poll error]", e.message, "— thử lại sau 5 giây…");
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

poll();
