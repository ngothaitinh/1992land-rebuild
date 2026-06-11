// serve.mjs — Bot Telegram CMS (generic, config-driven)
//
// Khởi động: node serve.mjs
// Hoặc PM2:  pm2 start ecosystem.config.cjs
//
// Docs: README.md
//
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Load config ──────────────────────────────────────────────────────────────

const cfgPath = path.resolve(__dirname, "config.mjs");
if (!fs.existsSync(cfgPath)) {
  console.error("❌ Chưa có config.mjs.");
  console.error("   Làm theo: cp config.example.mjs config.mjs  rồi điền thông tin.");
  process.exit(1);
}

let config;
try {
  const { default: cfg } = await import(pathToFileURL(cfgPath).href);
  config = cfg;
} catch (e) {
  console.error("❌ Lỗi đọc config.mjs:", e.message);
  process.exit(1);
}

const TOKEN   = config.bot_token;
const CHAT_ID = String(config.chat_id || "");
if (!TOKEN)   { console.error("❌ config.bot_token chưa được đặt"); process.exit(1); }
if (!CHAT_ID) { console.error("❌ config.chat_id chưa được đặt");   process.exit(1); }

const INBOX_DIR   = path.resolve(__dirname, config.inbox_dir || "../content-inbox");
const OFFSET_FILE = path.join(__dirname, ".tg-offset.json");
const BOT_NAME    = config.bot_name  || "Bot quản lý nội dung";
const SITE_NAME   = config.site_name || "Website";
const COMMANDS    = config.commands  || [];

// ─── Telegram API ─────────────────────────────────────────────────────────────

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
            j.ok ? resolve(j.result) : reject(new Error(`${method}: ${j.description}`));
          } catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function send(chatId, text, extra = {}) {
  return api("sendMessage", {
    chat_id: chatId, text, parse_mode: "HTML",
    disable_web_page_preview: true, ...extra,
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (e) => { fs.unlink(dest, () => reject(e)); });
  });
}

// ─── Offset ───────────────────────────────────────────────────────────────────

function readOffset() {
  try { return JSON.parse(fs.readFileSync(OFFSET_FILE, "utf8")).offset || 0; } catch { return 0; }
}
function writeOffset(o) {
  let cur = {}; try { cur = JSON.parse(fs.readFileSync(OFFSET_FILE, "utf8")); } catch {}
  cur.offset = o; fs.writeFileSync(OFFSET_FILE, JSON.stringify(cur, null, 2));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pre = (s) => `<pre>${esc(s)}</pre>`;

function buildTemplateMsg({ title, note, body, hint }) {
  const parts = [`<b>${esc(title)}</b>`];
  if (note) parts.push(`<i>${esc(note)}</i>`);
  parts.push(pre(body));
  if (hint) parts.push(`<i>${esc(hint)}</i>`);
  return parts.join("\n");
}

// ─── Keyboard ─────────────────────────────────────────────────────────────────

function buildKeyboard() {
  const rows = [];

  if (config.keyboard_rows) {
    // User-defined layout
    for (const row of config.keyboard_rows) {
      const btns = row
        .map((cmd) => COMMANDS.find((c) => c.command === cmd))
        .filter(Boolean)
        .map((c) => ({ text: c.label, callback_data: `tpl:${c.command}` }));
      if (btns.length) rows.push(btns);
    }
  } else {
    // Auto: 2 nút/hàng
    for (let i = 0; i < COMMANDS.length; i += 2) {
      const pair = COMMANDS.slice(i, i + 2).map((c) => ({
        text: c.label,
        callback_data: `tpl:${c.command}`,
      }));
      rows.push(pair);
    }
  }

  // Hàng cuối: xem tất cả mẫu
  rows.push([{ text: "📖 Xem tất cả mẫu", callback_data: "tpl:__all__" }]);

  return { inline_keyboard: rows };
}

const MENU_KEYBOARD = buildKeyboard();
const REPLY_KB = { keyboard: [[{ text: "≡ Menu" }]], resize_keyboard: true, is_persistent: true };
const MENU_TEXT = `📋 <b>${esc(SITE_NAME)} — Quản lý nội dung</b>\n\nChọn thao tác:`;

// Index: tin nhắn compact liệt kê lệnh
function buildIndexMsg() {
  const lines = [`📋 <b>Bot quản lý nội dung — ${esc(SITE_NAME)}</b>`, ""];
  lines.push("Gõ <code>/</code> để xem menu lệnh. Chọn lệnh → bot gửi mẫu để copy.\n");
  for (const c of COMMANDS) {
    lines.push(`/${c.command} — ${esc(c.description || c.title || c.label)}`);
  }
  lines.push("\nGõ /menu bất cứ lúc nào để xem lại danh sách này.");
  return lines.join("\n");
}

// ─── Xử lý message ────────────────────────────────────────────────────────────

const MENU_TRIGGERS = new Set([
  "menu", "≡ menu", "/menu", "/start", "mau", "mẫu", "help"
]);

async function handleMessage(msg) {
  if (CHAT_ID && String(msg.chat.id) !== CHAT_ID) return;

  const text  = (msg.text || msg.caption || "").trim();
  const lower = text.toLowerCase();

  // /start → welcome + persistent reply keyboard + inline keyboard
  if (lower === "/start") {
    await send(msg.chat.id,
      `👋 Chào anh! <b>${esc(BOT_NAME)}</b> sẵn sàng.\n\nNhấn <b>≡ Menu</b> bên dưới hoặc gõ /menu để bắt đầu.`,
      { reply_markup: REPLY_KB }
    );
    await send(msg.chat.id, MENU_TEXT, { reply_markup: MENU_KEYBOARD });
    return;
  }

  // Menu trigger
  if (MENU_TRIGGERS.has(lower)) {
    await send(msg.chat.id, MENU_TEXT, { reply_markup: MENU_KEYBOARD });
    return;
  }

  // /slash command từ menu Telegram
  const slashMatch = text.match(/^\/([a-z_]+)(?:@\S+)?$/i);
  if (slashMatch) {
    const key = slashMatch[1].toLowerCase();
    const cmd = COMMANDS.find((c) => c.command === key);
    if (cmd) {
      await send(msg.chat.id, buildTemplateMsg(cmd), { reply_markup: MENU_KEYBOARD });
      return;
    }
  }

  // Tin nhắn nội dung → lưu vào inbox + xác nhận
  await saveToInbox(msg, text);
  await send(msg.chat.id,
    "✅ <b>Đã nhận!</b>\n\nEm sẽ xử lý khi Claude mở. Nếu cần gấp, mở Claude Code và nhắn: <i>Xử lý Telegram ngay</i>",
    { reply_markup: MENU_KEYBOARD }
  );
}

async function handleCallbackQuery(cq) {
  if (CHAT_ID && String(cq.message?.chat?.id) !== CHAT_ID) return;

  const data = cq.data || "";
  if (!data.startsWith("tpl:")) return;

  const key = data.slice(4);
  await api("answerCallbackQuery", { callback_query_id: cq.id, text: "Đây là mẫu 👇" });

  if (key === "__all__") {
    for (const cmd of COMMANDS) {
      await send(cq.message.chat.id, buildTemplateMsg(cmd));
    }
    return;
  }

  const cmd = COMMANDS.find((c) => c.command === key);
  if (cmd) {
    await send(cq.message.chat.id, buildTemplateMsg(cmd));
  }
}

// ─── Lưu inbox ────────────────────────────────────────────────────────────────

async function saveToInbox(msg, text) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir   = path.join(INBOX_DIR, stamp);
  fs.mkdirSync(dir, { recursive: true });

  const photos = msg.photo ? [msg.photo[msg.photo.length - 1]] : [];
  const docs = (msg.document && /image\//.test(msg.document.mime_type || "")) ? [msg.document] : [];
  const fileItems = [...photos, ...docs];

  let imgN = 0;
  for (const item of fileItems) {
    try {
      const file = await api("getFile", { file_id: item.file_id });
      const url  = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
      imgN++;
      await download(url, path.join(dir, `img-${imgN}${path.extname(file.file_path) || ".jpg"}`));
    } catch (e) {
      console.error("[inbox] Lỗi tải ảnh:", e.message);
    }
  }

  fs.writeFileSync(path.join(dir, "message.txt"), (text || "").trim() + "\n");
  console.log(`[inbox] ${stamp} | "${(text || "").slice(0, 60)}" | ${imgN} ảnh`);

  // Hook tùy chọn
  if (typeof config.onContentSaved === "function") {
    try { await config.onContentSaved(msg, text, dir); } catch (e) { console.error("[hook]", e.message); }
  }
}

// ─── Polling loop ─────────────────────────────────────────────────────────────

async function poll() {
  console.log(`🤖 ${BOT_NAME} đang chạy. Ctrl+C để tắt.`);
  console.log(`   Gõ /start hoặc /menu trong Telegram để bắt đầu.\n`);

  while (true) {
    try {
      const updates = await api("getUpdates", {
        offset: readOffset(),
        timeout: 30,
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
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

poll();
