import https from "node:https";
import fs   from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseCommand  } from "./parse-command.mjs";
import { isProcessed, markProcessed } from "./idempotency.mjs";
import { getFile, putFile, deleteFile } from "./github-commit.mjs";
import { watchDeployment } from "./deploy-watch.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "..", "..", "..");

// ─── Env ─────────────────────────────────────────────────────────────────────
const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const PAT     = process.env.GITHUB_PAT;
const REPO    = process.env.GITHUB_REPO;
const ADAPTER = process.env.ADAPTER || "1992land";

if (!TOKEN || !PAT || !REPO) {
  console.error("❌ Thiếu env: TELEGRAM_BOT_TOKEN, GITHUB_PAT, GITHUB_REPO");
  process.exit(1);
}

// ─── Load adapter ─────────────────────────────────────────────────────────────
const adapterPath = path.join(__dirname, "..", "adapters", ADAPTER, "config.mjs");
if (!fs.existsSync(adapterPath)) {
  console.error(`❌ Adapter không tồn tại: ${adapterPath}`);
  process.exit(1);
}
const { default: cfg } = await import(pathToFileURL(adapterPath).href);

const triggerMap = new Map(cfg.commands.map((c) => [c.trigger.toLowerCase(), c]));

// ─── Telegram helpers ─────────────────────────────────────────────────────────
function tgApi(method, params = {}) {
  const body = JSON.stringify(params);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path:     `/bot${TOKEN}/${method}`,
        method:   "POST",
        headers:  {
          "Content-Type":   "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
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
  return tgApi("sendMessage", {
    chat_id: chatId, text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

// ─── Keyboard ─────────────────────────────────────────────────────────────────
const MAIN_KB = {
  inline_keyboard: cfg.keyboard_rows.map((row) =>
    row.map((trigger) => ({ text: trigger, callback_data: `tpl:${trigger}` }))
  ),
};

function buildTemplateText(trigger) {
  const cmd = triggerMap.get(trigger.toLowerCase());
  if (!cmd) return null;
  const ct    = cfg.content_types[cmd.content_type];
  const lines = [trigger, "Slug: "];
  if (cmd.action === "set_field") {
    lines.push("Trường: ");
    lines.push("Giá trị: ");
    if (ct?.editable_fields)
      lines.push(`\n<i>Trường được phép: ${ct.editable_fields.join(", ")}</i>`);
  } else if (cmd.action === "hide_section" || cmd.action === "show_section") {
    lines.push("Phần: ");
  }
  return lines.join("\n");
}

// ─── Pending deletes (in-memory, TTL 5 min) ───────────────────────────────────
const pendingDeletes = new Map();

// ─── Inbox ────────────────────────────────────────────────────────────────────
async function saveToInbox(msg, text) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir   = path.join(ROOT, "content-inbox", stamp);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "message.txt"), (text || "").trim() + "\n");

  const photos = msg.photo ? [msg.photo[msg.photo.length - 1]] : [];
  let imgN = 0;
  for (const p of photos) {
    try {
      const file = await tgApi("getFile", { file_id: p.file_id });
      const url  = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
      imgN++;
      const dest = path.join(dir, `img-${imgN}${path.extname(file.file_path) || ".jpg"}`);
      await new Promise((resolve, reject) => {
        const f = fs.createWriteStream(dest);
        https.get(url, (res) => { res.pipe(f); f.on("finish", () => f.close(resolve)); })
          .on("error", reject);
      });
    } catch (e) { console.error("[inbox] lỗi ảnh:", e.message); }
  }
  console.log(`[inbox] ${stamp} | "${(text || "").slice(0, 60)}" | ${imgN} ảnh`);
}

// ─── Action: set_field ────────────────────────────────────────────────────────
async function execSetField(chatId, cmd, parsed) {
  const ct = cfg.content_types[cmd.content_type];
  const { slug, field, value } = parsed;

  if (!slug)  return send(chatId, "❌ Thiếu <code>Slug:</code>");
  if (!field) return send(chatId, "❌ Thiếu <code>Trường:</code>");
  if (!value) return send(chatId, "❌ Thiếu <code>Giá trị:</code>");

  if (!ct.editable_fields.includes(field))
    return send(chatId,
      `❌ Trường <code>${field}</code> không cho sửa bằng bot.\n` +
      `Trường được phép: ${ct.editable_fields.join(", ")}`
    );

  const ext      = ct.format === "json" ? "json" : "md";
  const filePath = `${ct.dir}/${slug}.${ext}`;

  let sha, content;
  try { ({ sha, content } = await getFile(REPO, cfg.deploy_branch, filePath, PAT)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  let newContent;
  if (ct.format === "json") {
    const obj = JSON.parse(content);
    if (typeof obj[field] === "object" && obj[field] !== null)
      return send(chatId,
        `❌ Trường <code>${field}</code> là object — cần Claude soạn.\nGửi [THÊM DỰ ÁN] để inbox.`
      );
    obj[field]     = value;
    obj.updated_at = new Date().toISOString();
    newContent     = JSON.stringify(obj, null, 2) + "\n";
  } else {
    const replaced = content.replace(
      new RegExp(`^(${field}:\\s*)(.*)$`, "m"),
      `$1${value}`
    );
    newContent = replaced === content
      ? content.replace(/^---\s*$/m, `${field}: ${value}\n---`)
      : replaced;
  }

  let commitSha;
  try {
    ({ commitSha } = await putFile(
      REPO, cfg.deploy_branch, filePath, newContent, sha,
      `content: set ${field} on ${slug} via telegram`, PAT
    ));
  } catch (e) {
    return send(chatId, `⚠️ Lỗi GitHub API: ${e.message}`);
  }

  await send(chatId, `✏️ Đã cập nhật <b>${field}</b> → "<code>${value}</code>"\nĐang chờ build…`);

  watchDeployment(REPO, commitSha, PAT, async (status, runUrl) => {
    if (status === "success")
      await send(chatId, `✅ <b>${cfg.site_name}</b> đã cập nhật xong.`).catch(console.error);
    else if (status === "timeout")
      await send(chatId, `⏱ Build đang lâu bất thường. Kiểm tra: ${runUrl}`).catch(console.error);
    else
      await send(chatId, `⚠️ Build lỗi (${status}), web chưa cập nhật.\n${runUrl}`).catch(console.error);
  });
}

// ─── Action: hide_section / show_section ─────────────────────────────────────
async function execHideShow(chatId, cmd, parsed, isShow) {
  const ct = cfg.content_types[cmd.content_type];
  const { slug, section } = parsed;

  if (!slug)    return send(chatId, "❌ Thiếu <code>Slug:</code>");
  if (!section) return send(chatId, "❌ Thiếu <code>Phần:</code>");

  const filePath = `${ct.dir}/${slug}.json`;
  let sha, content;
  try { ({ sha, content } = await getFile(REPO, cfg.deploy_branch, filePath, PAT)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  const obj = JSON.parse(content);
  const cur = Array.isArray(obj.hidden_sections) ? [...obj.hidden_sections] : [];
  let next;
  if (isShow) {
    next = cur.filter((k) => k !== section);
    if (next.length === cur.length)
      return send(chatId, `ℹ️ Phần <code>${section}</code> vốn không bị ẩn.`);
  } else {
    if (cur.includes(section))
      return send(chatId, `ℹ️ Phần <code>${section}</code> đã ẩn sẵn.`);
    next = [...cur, section];
  }
  obj.hidden_sections = next;
  obj.updated_at      = new Date().toISOString();

  let commitSha;
  try {
    ({ commitSha } = await putFile(
      REPO, cfg.deploy_branch, filePath, JSON.stringify(obj, null, 2) + "\n", sha,
      `content: ${isShow ? "show" : "hide"} section ${section} on ${slug} via telegram`, PAT
    ));
  } catch (e) {
    return send(chatId, `⚠️ Lỗi GitHub API: ${e.message}`);
  }

  const icon = isShow ? "👁" : "🙈";
  const verb = isShow ? "Đã hiện" : "Đã ẩn";
  await send(chatId, `${icon} ${verb} phần <b>${section}</b> trên <code>${slug}</code>\nĐang chờ build…`);

  watchDeployment(REPO, commitSha, PAT, async (status, runUrl) => {
    if (status === "success")
      await send(chatId, `✅ <b>${cfg.site_name}</b> đã cập nhật xong.`).catch(console.error);
    else
      await send(chatId, `⚠️ Build lỗi (${status}).\n${runUrl}`).catch(console.error);
  });
}

// ─── Action: delete (confirm gate) ────────────────────────────────────────────
async function execDelete(chatId, cmd, parsed) {
  const ct  = cfg.content_types[cmd.content_type];
  const { slug } = parsed;
  if (!slug) return send(chatId, "❌ Thiếu <code>Slug:</code>");

  const ext      = ct.format === "json" ? "json" : "md";
  const filePath = `${ct.dir}/${slug}.${ext}`;

  let sha, content;
  try { ({ sha, content } = await getFile(REPO, cfg.deploy_branch, filePath, PAT)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  let title = slug;
  try { if (ct.format === "json") title = JSON.parse(content).title || slug; } catch {}

  const pendingKey = `del:${chatId}:${slug}:${cmd.content_type}`;
  pendingDeletes.set(pendingKey, { sha, filePath, title, cmd });
  setTimeout(() => pendingDeletes.delete(pendingKey), 5 * 60 * 1000);

  const label = cmd.content_type === "project" ? "dự án" : "bài viết";
  await send(
    chatId,
    `🗑 Xóa ${label}: <b>${title}</b> (<code>${slug}</code>)\n` +
    `File: <code>${filePath}</code>\n` +
    `⚠️ Thao tác không hoàn tác được qua bot (git vẫn khôi phục được).`,
    {
      reply_markup: { inline_keyboard: [[
        { text: "✅ Xác nhận xóa", callback_data: `confirm_del:${pendingKey}` },
        { text: "❌ Hủy",          callback_data: `cancel_del:${pendingKey}` },
      ]] },
    }
  );
}

// ─── Message handler ───────────────────────────────────────────────────────────
async function handleMessage(msg) {
  const chatIdStr = String(msg.chat.id);
  const allowed   = cfg.allowed_chat_ids.map(String);
  if (allowed.length && !allowed.includes(chatIdStr)) return;

  const text  = (msg.text || msg.caption || "").trim();
  const lower = text.toLowerCase();

  if (["/start", "/menu", "menu", "mẫu", "help"].includes(lower)) {
    await send(msg.chat.id, `📋 <b>${cfg.bot_name}</b> — Chọn thao tác:`, { reply_markup: MAIN_KB });
    return;
  }

  if (isProcessed(msg.message_id)) return;

  const parsed = parseCommand(text);

  if (!parsed.trigger) {
    await send(msg.chat.id, "Không nhận ra lệnh. Chọn thao tác:", { reply_markup: MAIN_KB });
    return;
  }

  const cmd = triggerMap.get(parsed.trigger.toLowerCase());
  if (!cmd) {
    await send(msg.chat.id, `❌ Lệnh <code>${parsed.trigger}</code> không được cấu hình.`);
    markProcessed(msg.message_id);
    return;
  }

  markProcessed(msg.message_id);

  try {
    if      (cmd.action === "inbox")        { await saveToInbox(msg, text); await send(msg.chat.id, "📥 Đã nhận! Nội dung sẽ được Claude soạn và gửi bản xem trước để duyệt."); }
    else if (cmd.action === "set_field")    await execSetField(msg.chat.id, cmd, parsed);
    else if (cmd.action === "hide_section") await execHideShow(msg.chat.id, cmd, parsed, false);
    else if (cmd.action === "show_section") await execHideShow(msg.chat.id, cmd, parsed, true);
    else if (cmd.action === "delete")       await execDelete(msg.chat.id, cmd, parsed);
  } catch (e) {
    console.error("[handleMessage]", e.message);
    await send(msg.chat.id, `⚠️ Lỗi nội bộ: ${e.message}`).catch(() => {});
  }
}

// ─── Callback handler ─────────────────────────────────────────────────────────
async function handleCallbackQuery(cq) {
  const chatIdStr = String(cq.message?.chat?.id);
  const allowed   = cfg.allowed_chat_ids.map(String);
  if (allowed.length && !allowed.includes(chatIdStr)) return;

  await tgApi("answerCallbackQuery", { callback_query_id: cq.id }).catch(() => {});

  const data = cq.data || "";

  if (data.startsWith("tpl:")) {
    const trigger = data.slice(4);
    const tmpl    = buildTemplateText(trigger);
    if (tmpl) await send(cq.message.chat.id, tmpl, { reply_markup: MAIN_KB });
    return;
  }

  if (data.startsWith("confirm_del:")) {
    const key     = data.slice("confirm_del:".length);
    const pending = pendingDeletes.get(key);
    if (!pending) {
      await send(cq.message.chat.id, "⏱ Xác nhận đã hết hạn (5 phút). Gửi lại lệnh xóa nếu cần.");
      return;
    }
    pendingDeletes.delete(key);

    let commitSha;
    try {
      ({ commitSha } = await deleteFile(
        REPO, cfg.deploy_branch, pending.filePath, pending.sha,
        `content: delete ${pending.filePath} via telegram`, PAT
      ));
    } catch (e) {
      return send(cq.message.chat.id, `⚠️ Lỗi xóa: ${e.message}`);
    }

    await send(cq.message.chat.id, `🗑 Đã xóa <b>${pending.title}</b>. Đang chờ build…`);
    watchDeployment(REPO, commitSha, PAT, async (status, runUrl) => {
      if (status === "success")
        await send(cq.message.chat.id, `✅ <b>${cfg.site_name}</b> đã cập nhật xong.`).catch(console.error);
      else
        await send(cq.message.chat.id, `⚠️ Build lỗi (${status}).\n${runUrl}`).catch(console.error);
    });
    return;
  }

  if (data.startsWith("cancel_del:")) {
    pendingDeletes.delete(data.slice("cancel_del:".length));
    await send(cq.message.chat.id, "❌ Đã hủy, không xóa gì.");
  }
}

// ─── Poll loop ─────────────────────────────────────────────────────────────────
let offset = 0;

async function poll() {
  console.log(`🤖 ${cfg.bot_name} đang chạy (adapter: ${ADAPTER}). Ctrl+C để tắt.\n`);
  while (true) {
    try {
      const updates = await tgApi("getUpdates", {
        offset,
        timeout: 30,
        allowed_updates: ["message", "callback_query"],
      });
      for (const u of updates) {
        offset = u.update_id + 1;
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
