import https from "node:https";
import fs   from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseCommand  } from "./parse-command.mjs";
import { isProcessed, markProcessed } from "./idempotency.mjs";
import { getFile, putFile, deleteFile, putFiles } from "./github-commit.mjs";
import { watchDeployment } from "./deploy-watch.mjs";
import { composeContent, slugify, toPostMarkdown, toProjectJson, validateComposed } from "./compose.mjs";
import { callLLM } from "./llm.mjs";
import { setMode, getMode, setDraft, getDraft, setWizard, getWizard, clearSession } from "./session.mjs";
import { filterItems, fieldLabel, buildListKeyboard, buildFieldKeyboard, WIZARD_PAGE_SIZE } from "./wizard-helpers.mjs";

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
  inline_keyboard: [
    cfg.publish_buttons.map((b) => ({ text: b.text, callback_data: `pub_start:${b.mode}` })),
    ...cfg.keyboard_rows.map((row) =>
      row.map((trigger) => ({ text: trigger, callback_data: `tpl:${trigger}` }))
    ),
    [{ text: "💬 Hỏi AI / Không biết làm gì", callback_data: "wz_ask" }],
  ],
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

// ─── Wizard sửa (bấm-chọn thay cho cú pháp Key: value) ────────────────────────
const pendingEdits = new Map();   // key ngắn -> { content_type, slug, title, field, value }

// Tìm command set_field theo loại nội dung (để tái dùng execSetField).
function setFieldCmd(contentType) {
  return cfg.commands.find((c) => c.action === "set_field" && c.content_type === contentType);
}

// Đọc danh sách { slug, title } từ thư mục nội dung (đọc local, không gọi API).
function listContentItems(contentType) {
  const ct  = cfg.content_types[contentType];
  const dir = path.join(ROOT, ct.dir);
  if (!fs.existsSync(dir)) return [];
  const ext = ct.format === "json" ? ".json" : ".md";
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => {
      const slug = f.slice(0, -ext.length);
      let title = slug;
      try {
        const raw = fs.readFileSync(path.join(dir, f), "utf8");
        if (ct.format === "json") title = JSON.parse(raw).title || slug;
        else { const m = raw.match(/^title:\s*(.+)$/m); if (m) title = m[1].replace(/^["']|["']$/g, "").trim(); }
      } catch {}
      return { slug, title };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "vi"));
}

function localTitle(contentType, slug) {
  return listContentItems(contentType).find((it) => it.slug === slug)?.title || slug;
}

// Đọc giá trị hiện tại của 1 field từ GitHub (cùng nguồn sự thật execSetField commit lên).
async function readCurrentField(contentType, slug, field) {
  const ct  = cfg.content_types[contentType];
  const ext = ct.format === "json" ? "json" : "md";
  const { content } = await getFile(REPO, cfg.deploy_branch, `${ct.dir}/${slug}.${ext}`, PAT);
  if (ct.format === "json") {
    const v = JSON.parse(content)[field];
    return (v === undefined || v === null) ? "" : (typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  const m = content.match(new RegExp(`^${field}:\\s*(.*)$`, "m"));
  return m ? m[1].replace(/^["']|["']$/g, "").trim() : "";
}

function listPrompt(contentType, total, offset) {
  const label = contentType === "project" ? "dự án" : "bài viết";
  const pages = Math.max(1, Math.ceil(total / WIZARD_PAGE_SIZE));
  const page  = Math.floor(offset / WIZARD_PAGE_SIZE) + 1;
  return `📋 Chọn ${label} cần sửa (tổng ${total}) — trang ${page}/${pages}:`;
}

// Bước 1: render danh sách đối tượng (dùng cho cả vào wizard lẫn phân trang / sau khi tìm).
async function renderEditList(chatId, contentType, offset = 0, filter = null) {
  const items = filterItems(listContentItems(contentType), filter);
  setWizard(chatId, { step: "list", content_type: contentType, offset, filter });
  setMode(chatId, null);
  if (!items.length) {
    return send(chatId, `Không có mục nào khớp${filter ? ` "<b>${filter}</b>"` : ""}.`, {
      reply_markup: { inline_keyboard: [[
        { text: "🔍 Tìm lại", callback_data: `wz_search:${contentType}` },
        { text: "💬 Hỏi AI",  callback_data: "wz_ask" },
      ]] },
    });
  }
  return send(chatId, listPrompt(contentType, items.length, offset), {
    reply_markup: buildListKeyboard(contentType, items, offset),
  });
}

// Bước 3 → xác nhận trước khi commit (chốt chặn an toàn).
async function confirmEdit(chatId, wz, value) {
  const key = "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  pendingEdits.set(key, { content_type: wz.content_type, slug: wz.slug, title: wz.title, field: wz.field, value });
  setTimeout(() => pendingEdits.delete(key), 5 * 60 * 1000);
  return send(chatId,
    `✏️ Sửa <b>${fieldLabel(cfg, wz.field)}</b> của <b>${wz.title || wz.slug}</b>\n` +
    `Thành: <code>${value}</code>\n— đúng không?`,
    { reply_markup: { inline_keyboard: [[
      { text: "✅ Đồng ý", callback_data: `wz_confirm:${key}` },
      { text: "❌ Huỷ",    callback_data: `wz_cancel:${key}` },
    ]] } }
  );
}

// ─── Chat tự do (lưới an toàn) — chỉ hướng dẫn, KHÔNG ghi repo ─────────────────
function actionDesc(action, contentType) {
  const what = contentType === "project" ? "dự án" : "bài viết";
  switch (action) {
    case "set_field":    return `sửa thông tin ${what}`;
    case "hide_section": return "ẩn một phần thông tin dự án";
    case "show_section": return "hiện lại phần đã ẩn của dự án";
    case "delete":       return `xoá ${what}`;
    case "inbox":        return `thêm ${what} mới`;
    default:             return action;
  }
}

async function freeChatAdvisor(chatId, userText) {
  await send(chatId, "💬 Để tôi xem giúp anh…");
  const cmds = cfg.commands.map((c) => `- ${c.trigger}: ${actionDesc(c.action, c.content_type)}`).join("\n");
  const system =
    `Bạn là trợ lý hướng dẫn của "${cfg.bot_name}" — bot quản trị web ${cfg.site_name}.\n` +
    `Người dùng là chủ doanh nghiệp, KHÔNG rành kỹ thuật.\n` +
    `Nhiệm vụ DUY NHẤT: hướng dẫn họ nên BẤM nút / dùng thao tác nào để đạt mục đích.\n` +
    `TUYỆT ĐỐI KHÔNG tự sửa, tự đăng, tự tạo nội dung — bạn chỉ tư vấn, không thực hiện hành động nào.\n` +
    `KHÔNG bịa tính năng ngoài danh sách dưới đây.\n` +
    `Các thao tác có sẵn (mỗi cái là 1 nút ở menu):\n${cmds}\n` +
    `Nếu ý người dùng khớp một thao tác, hãy NÊU ĐÚNG tên thao tác trong ngoặc vuông (ví dụ [SỬA DỰ ÁN]) để hệ thống tự đính nút bấm.\n` +
    `Trả lời ngắn gọn, thân thiện, tiếng Việt. Nếu chưa rõ ý, hỏi lại đúng 1 câu.`;
  let reply;
  try {
    reply = await callLLM({ system, user: userText });
  } catch (e) {
    return send(chatId, "Tôi chưa kết nối được trợ lý AI. Anh bấm /menu để chọn thao tác nhé.", { reply_markup: MAIN_KB });
  }
  const matched = cfg.commands.filter((c) => reply.includes(c.trigger));
  const rows = matched.map((c) => [{ text: c.trigger, callback_data: `tpl:${c.trigger}` }]);
  rows.push([{ text: "📋 Mở menu", callback_data: "wz_menu" }]);
  return send(chatId, reply, { reply_markup: { inline_keyboard: rows } });
}

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

// ─── Photo download → base64 ─────────────────────────────────────────────────
async function downloadPhotoBase64(msg) {
  const photos = msg.photo ? [msg.photo[msg.photo.length - 1]] : [];
  if (!photos.length) return null;
  const file = await tgApi("getFile", { file_id: photos[0].file_id });
  const url  = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
  return await new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    }).on("error", reject);
  });
}

// ─── Compose helpers ──────────────────────────────────────────────────────────
function reviewWarning(obj) {
  const rf = Array.isArray(obj._review_fields) ? obj._review_fields : [];
  return rf.length ? `⚠️ <b>Cần soi kỹ:</b> ${rf.join(", ")}\n\n` : "";
}

async function composeAndPreview(chatId, type, sourceText, imageBase64, editInstruction) {
  const projectFiles = fs.existsSync(path.join(ROOT, "data/projects"))
    ? fs.readdirSync(path.join(ROOT, "data/projects")).filter((f) => f.endsWith(".json"))
    : [];
  const existingSlugs = projectFiles.map((f) => f.replace(".json", ""));
  const existingCategories = fs.existsSync(path.join(ROOT, "data/posts"))
    ? [...new Set(fs.readdirSync(path.join(ROOT, "data/posts")).filter((f) => f.endsWith(".md")).map((f) => {
        try { const m = fs.readFileSync(path.join(ROOT, "data/posts", f), "utf8").match(/^category:\s*(.+)$/m); return m ? m[1].replace(/["']/g, "").trim() : null; } catch { return null; }
      }).filter(Boolean))]
    : [];
  const ctx = { today: new Date().toISOString().slice(0, 10), existingSlugs, existingCategories };

  await send(chatId, "🤖 Đang biên tập, chờ chút…");
  let obj;
  try {
    obj = await composeContent(type, sourceText, ctx, editInstruction);
  } catch (e) {
    clearSession(chatId);
    return send(chatId, `⚠️ AI lỗi: ${e.message}. Gửi lại nội dung giúp anh.`);
  }

  const v = validateComposed(type, obj);
  if (!v.ok) {
    clearSession(chatId);
    return send(chatId, `❌ Thiếu trường tối thiểu: ${v.missing.join(", ")}. Gửi nội dung đầy đủ hơn.`);
  }

  const slug = slugify(obj.title) + "-" + Date.now().toString(36).slice(-4);
  setDraft(chatId, { type, obj, imageBase64, slug, sourceText });
  setMode(chatId, null);

  const label = type === "post" ? "bài viết" : "dự án";
  const text =
    reviewWarning(obj) +
    `📄 <b>Bản nháp ${label}</b>\n` +
    `<b>${obj.title}</b>\n` +
    (obj.excerpt ? `${obj.excerpt}\n` : "") +
    `\nSlug: <code>${slug}</code>`;
  return send(chatId, text, {
    reply_markup: { inline_keyboard: [[
      { text: "✅ Duyệt", callback_data: "pub_approve" },
      { text: "✏️ Sửa",  callback_data: "pub_edit" },
      { text: "❌ Hủy",   callback_data: "pub_cancel" },
    ]] },
  });
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

  const mode = getMode(msg.chat.id);
  if (mode === "await_post" || mode === "await_project") {
    if (isProcessed(msg.message_id)) return;
    markProcessed(msg.message_id);
    const type = mode === "await_post" ? "post" : "project";
    const img  = await downloadPhotoBase64(msg).catch(() => null);
    return composeAndPreview(msg.chat.id, type, text, img);
  }
  if (mode === "await_edit") {
    if (isProcessed(msg.message_id)) return;
    markProcessed(msg.message_id);
    const draft = getDraft(msg.chat.id);
    if (!draft) { clearSession(msg.chat.id); return send(msg.chat.id, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé."); }
    return composeAndPreview(msg.chat.id, draft.type, draft.sourceText, draft.imageBase64, text);
  }
  // Wizard sửa: đang chờ từ khóa tìm kiếm
  if (mode === "await_wz_search") {
    if (isProcessed(msg.message_id)) return;
    markProcessed(msg.message_id);
    const wz = getWizard(msg.chat.id);
    if (!wz?.content_type) { clearSession(msg.chat.id); return send(msg.chat.id, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    return renderEditList(msg.chat.id, wz.content_type, 0, text);
  }
  // Wizard sửa: đang chờ giá trị mới → đưa vào cổng xác nhận (chốt chặn)
  if (mode === "await_field_value") {
    if (isProcessed(msg.message_id)) return;
    markProcessed(msg.message_id);
    const wz = getWizard(msg.chat.id);
    if (!wz?.slug || !wz?.field) { clearSession(msg.chat.id); return send(msg.chat.id, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    setMode(msg.chat.id, null);
    return confirmEdit(msg.chat.id, wz, text);
  }
  // Chat tự do (được mời qua nút 💬 Hỏi AI)
  if (mode === "await_freechat") {
    if (isProcessed(msg.message_id)) return;
    markProcessed(msg.message_id);
    setMode(msg.chat.id, null);
    return freeChatAdvisor(msg.chat.id, text);
  }

  if (isProcessed(msg.message_id)) return;

  const parsed = parseCommand(text);

  if (!parsed.trigger) {
    markProcessed(msg.message_id);
    // Ảnh/không có chữ → không đoán được ý, mở menu. Có chữ → chat tự do hướng dẫn.
    if (!text) { await send(msg.chat.id, "Chọn thao tác:", { reply_markup: MAIN_KB }); return; }
    await freeChatAdvisor(msg.chat.id, text);
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
    const c = triggerMap.get(trigger.toLowerCase());
    // Lệnh sửa → mở wizard bấm-chọn (cú pháp gõ tay vẫn dùng được song song).
    if (c && c.action === "set_field") return renderEditList(cq.message.chat.id, c.content_type, 0, null);
    const tmpl = buildTemplateText(trigger);
    if (tmpl) await send(cq.message.chat.id, tmpl, { reply_markup: MAIN_KB });
    return;
  }

  // ── Wizard sửa ──────────────────────────────────────────────────────────────
  if (data === "wz_menu")
    return send(cq.message.chat.id, `📋 <b>${cfg.bot_name}</b> — Chọn thao tác:`, { reply_markup: MAIN_KB });

  if (data === "wz_abort") {
    clearSession(cq.message.chat.id);
    return send(cq.message.chat.id, "Đã thoát. Bấm /menu khi cần.", { reply_markup: MAIN_KB });
  }

  if (data === "wz_ask") {
    setMode(cq.message.chat.id, "await_freechat");
    return send(cq.message.chat.id, "💬 Anh cứ gõ điều anh muốn làm (vd \"đổi giá dự án\"), tôi sẽ chỉ cách bấm.");
  }

  if (data.startsWith("wz_page:")) {
    const [, ct, off] = data.split(":");
    const wz = getWizard(cq.message.chat.id);
    return renderEditList(cq.message.chat.id, ct, parseInt(off, 10) || 0, wz?.filter || null);
  }

  if (data.startsWith("wz_search:")) {
    const ct = data.slice("wz_search:".length);
    setWizard(cq.message.chat.id, { step: "search", content_type: ct });
    setMode(cq.message.chat.id, "await_wz_search");
    return send(cq.message.chat.id, "🔍 Gõ vài ký tự trong tên cần tìm:");
  }

  if (data.startsWith("wz_pick:")) {
    const [, ct, ...rest] = data.split(":");
    const slug  = rest.join(":");
    const title = localTitle(ct, slug);
    setWizard(cq.message.chat.id, { step: "field", content_type: ct, slug, title });
    return send(cq.message.chat.id, `Sửa <b>${title}</b> — chọn thông tin cần đổi:`, {
      reply_markup: buildFieldKeyboard(cfg, ct, slug),
    });
  }

  if (data.startsWith("wz_field:")) {
    const [, ct, slug, field] = data.split(":");
    const wz    = getWizard(cq.message.chat.id);
    const title = wz?.title || localTitle(ct, slug);
    let current;
    try { current = await readCurrentField(ct, slug, field); }
    catch { return send(cq.message.chat.id, `❌ Không đọc được <code>${slug}</code>. Bấm /menu để thử lại.`); }
    setWizard(cq.message.chat.id, { step: "value", content_type: ct, slug, title, field });
    setMode(cq.message.chat.id, "await_field_value");
    return send(cq.message.chat.id,
      `Giá trị mới cho <b>${fieldLabel(cfg, field)}</b> là gì?\n` +
      `Hiện tại: <code>${current || "(trống)"}</code>\n\n` +
      `Gõ giá trị mới vào đây 👇`,
      { reply_markup: { inline_keyboard: [[
        { text: "💬 Hỏi AI", callback_data: "wz_ask" },
        { text: "❌ Thoát",   callback_data: "wz_abort" },
      ]] } }
    );
  }

  if (data.startsWith("wz_confirm:")) {
    const key = data.slice("wz_confirm:".length);
    const p   = pendingEdits.get(key);
    if (!p) return send(cq.message.chat.id, "⏱ Xác nhận đã hết hạn (5 phút). Bấm /menu để làm lại.");
    pendingEdits.delete(key);
    clearSession(cq.message.chat.id);
    const cmd = setFieldCmd(p.content_type);
    if (!cmd) return send(cq.message.chat.id, "❌ Cấu hình thiếu lệnh sửa.");
    // Tái dùng nguyên luồng sửa-1-trường: cùng validate, commit đơn, deploy-watch.
    await execSetField(cq.message.chat.id, cmd, { slug: p.slug, field: p.field, value: p.value });
    return;
  }

  if (data.startsWith("wz_cancel:")) {
    pendingEdits.delete(data.slice("wz_cancel:".length));
    clearSession(cq.message.chat.id);
    return send(cq.message.chat.id, "❌ Đã huỷ, không sửa gì.");
  }

  if (data.startsWith("pub_start:")) {
    const mode = data.slice("pub_start:".length);
    if (!["await_post", "await_project"].includes(mode)) return;
    setMode(cq.message.chat.id, mode);
    const what = mode === "await_post" ? "bài viết (có thể dán từ báo)" : "dự án";
    return send(cq.message.chat.id, `✍️ Dán nội dung ${what} vào đây, kèm 1 ảnh nếu có. Xong gửi là được.`);
  }

  if (data === "pub_cancel") {
    clearSession(cq.message.chat.id);
    return send(cq.message.chat.id, "❌ Đã hủy, không đăng gì.");
  }

  if (data === "pub_edit") {
    if (!getDraft(cq.message.chat.id)) return send(cq.message.chat.id, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé.");
    setMode(cq.message.chat.id, "await_edit");
    return send(cq.message.chat.id, "✏️ Anh muốn sửa gì? (vd: rút ngắn tiêu đề, bỏ đoạn cuối)");
  }

  if (data === "pub_approve") {
    const draft = getDraft(cq.message.chat.id);
    if (!draft) return send(cq.message.chat.id, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé.");
    clearSession(cq.message.chat.id);
    const pc   = cfg.publish[draft.type];
    const now  = new Date().toISOString();
    const heroWeb = draft.imageBase64 ? pc.web_image(draft.slug) : "";
    const contentFile = draft.type === "post"
      ? { path: `${pc.dir}/${draft.slug}.md`,   content: toPostMarkdown(draft.obj, { slug: draft.slug, date: now.slice(0, 10), heroImage: heroWeb }), binary: false }
      : { path: `${pc.dir}/${draft.slug}.json`, content: toProjectJson(draft.obj, { slug: draft.slug, heroImage: heroWeb, now }), binary: false };
    const files = [contentFile];
    if (draft.imageBase64) files.push({ path: pc.image_path(draft.slug), content: draft.imageBase64, binary: true });

    let commitSha;
    try {
      ({ commitSha } = await putFiles(REPO, cfg.deploy_branch, files,
        `content: add ${draft.type} ${draft.slug} via telegram`, PAT));
    } catch (e) {
      return send(cq.message.chat.id, `⚠️ Lỗi đăng: ${e.message}`);
    }
    await send(cq.message.chat.id, `✅ Đã đăng. Đang chờ build…`);
    watchDeployment(REPO, commitSha, PAT, async (status, runUrl) => {
      if (status === "success") await send(cq.message.chat.id, `✅ <b>${cfg.site_name}</b> đã lên web.`).catch(console.error);
      else if (status === "timeout") await send(cq.message.chat.id, `⏳ Build đang lâu bất thường. Kiểm tra: ${runUrl}`).catch(console.error);
      else await send(cq.message.chat.id, `⚠️ Build lỗi (${status}).\n${runUrl}`).catch(console.error);
    });
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
