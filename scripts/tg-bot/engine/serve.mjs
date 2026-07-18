import https from "node:https";
import fs   from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseCommand } from "./parse-command.mjs";
import { isProcessed, markProcessed } from "./idempotency.mjs";
import { setMode, getMode, getDraft, setWizard, getWizard, clearSession } from "./session.mjs";
import { buildMainMenu, buildItemMenu, buildMediaMenu, mainMenuText, welcomeText, helpText } from "./menu.mjs";
import {
  fieldLabel, actionCode, codeAction, fieldAt, sectionAt,
  buildFieldKeyboard, buildSectionKeyboard,
  buildEditSectionMenu, buildSectionActionMenu, editSectionCfg,
} from "./wizard-helpers.mjs";
import {
  listContentItems, localTitle, renderItemList, renderSections, startAdd,
  confirmEdit, confirmDesc, confirmDelete, takePendingEdit, takePendingDelete,
} from "./wizard.mjs";
import { composeAndPreview, freeChatAdvisor, downloadPhotoBase64 } from "./compose-flow.mjs";
import {
  execSetField, execToggleSection, execDelete, execPublish, execUndo, readCurrentField,
  readDescription, execSetDescription, execSetVideo, execSetSectionImage,
  execSetHero, execAddGallery,
} from "./actions.mjs";
import { youtubeId } from "../../../lib/youtube.mjs";

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

const deps = { cfg, repo: REPO, pat: PAT, send, root: ROOT, tg: { api: tgApi, token: TOKEN } };

const MAIN_KB = buildMainMenu(cfg);

// Sửa chính tin nhắn đang bấm (menu biến hình tại chỗ). Lỗi (nội dung trùng /
// tin quá cũ) → fallback gửi tin mới để thao tác không chết.
function editingSend(cq) {
  let used = false;
  return (chatId, text, extra = {}) => {
    if (used) return send(chatId, text, extra);
    used = true;
    return tgApi("editMessageText", {
      chat_id: chatId,
      message_id: cq.message.message_id,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: extra.reply_markup,
    }).catch(() => send(chatId, text, extra));
  };
}

function withEditing(cq) {
  return { ...deps, send: editingSend(cq) };
}

function showMenu(chatId, text) {
  return send(chatId, text || mainMenuText(cfg), { reply_markup: MAIN_KB });
}

function allowedChat(chatId) {
  const allowed = cfg.allowed_chat_ids.map(String);
  return !allowed.length || allowed.includes(String(chatId));
}

// ─── Slash command → thao tác ─────────────────────────────────────────────────
const slashMap = new Map(cfg.slash_commands.map((s) => [`/${s.command}`, s.route]));

function runRoute(chatId, route) {
  if (route === "help") return send(chatId, helpText(cfg), { reply_markup: MAIN_KB });
  if (route === "cancel") {
    clearSession(chatId);
    return showMenu(chatId, "Đã thoát thao tác đang làm. Chọn việc khác:");
  }
  return showMenu(chatId); // route === "menu" hoặc mặc định
}

// ─── Message handler ───────────────────────────────────────────────────────────
async function handleMessage(msg) {
  if (!allowedChat(msg.chat.id)) return;

  const chatId = msg.chat.id;
  const text   = (msg.text || msg.caption || "").trim();
  // Trong group Telegram gửi dạng "/menu@ten_bot".
  const cmdWord = text.split(/\s+/)[0].toLowerCase().split("@")[0];

  if (cmdWord === "/start") {
    markProcessed(msg.message_id);
    return showMenu(chatId, welcomeText(cfg));
  }
  if (slashMap.has(cmdWord)) {
    markProcessed(msg.message_id);
    return runRoute(chatId, slashMap.get(cmdWord));
  }

  const mode = getMode(chatId);
  if (mode) {
    if (isProcessed(msg.message_id)) return;
    markProcessed(msg.message_id);
    return handleModeInput(chatId, mode, msg, text);
  }

  if (isProcessed(msg.message_id)) return;
  markProcessed(msg.message_id);

  // Cú pháp [..] gõ tay — lối tắt cho người quen, không còn hiện trên menu.
  const parsed = parseCommand(text);
  if (!parsed.trigger) {
    if (!text) return showMenu(chatId, "Chọn việc cần làm:");
    return freeChatAdvisor(deps, chatId, text, MAIN_KB);
  }

  const cmd = triggerMap.get(parsed.trigger.toLowerCase());
  if (!cmd) return send(chatId, `❌ Lệnh <code>${parsed.trigger}</code> không còn dùng nữa. Bấm /menu.`);

  try {
    if (cmd.action === "set_field")
      return await execSetField(deps, chatId, cmd.content_type, parsed);
    if (cmd.action === "toggle_section") {
      if (!parsed.slug)    return send(chatId, "❌ Thiếu <code>Slug:</code>");
      if (!parsed.section) return send(chatId, "❌ Thiếu <code>Phần:</code>");
      return await execToggleSection(deps, chatId, cmd.content_type, parsed.slug, parsed.section);
    }
    if (cmd.action === "delete") {
      if (!parsed.slug) return send(chatId, "❌ Thiếu <code>Slug:</code>");
      return await confirmDelete(deps, chatId, cmd.content_type, parsed.slug, localTitle(deps, cmd.content_type, parsed.slug));
    }
  } catch (e) {
    console.error("[handleMessage]", e.message);
    await send(chatId, `⚠️ Lỗi nội bộ: ${e.message}`).catch(() => {});
  }
}

// Tin nhắn đến khi bot đang chờ người dùng nhập gì đó.
function handleModeInput(chatId, mode, msg, text) {
  if (mode === "await_post" || mode === "await_project") {
    const type = mode === "await_post" ? "post" : "project";
    return downloadPhotoBase64(deps, msg)
      .catch(() => null)
      .then((img) => composeAndPreview(deps, chatId, type, text, img));
  }

  if (mode === "await_edit") {
    const draft = getDraft(chatId);
    if (!draft) { clearSession(chatId); return send(chatId, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé."); }
    return composeAndPreview(deps, chatId, draft.type, draft.sourceText, draft.imageBase64, text);
  }

  if (mode === "await_field_value") {
    const wz = getWizard(chatId);
    if (!wz?.slug || !wz?.field) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    setMode(chatId, null);
    return confirmEdit(deps, chatId, wz, text);
  }

  if (mode === "await_freechat") {
    setMode(chatId, null);
    return freeChatAdvisor(deps, chatId, text, MAIN_KB);
  }

  if (mode === "await_desc_value") {
    const wz = getWizard(chatId);
    if (!wz?.slug || !wz?.desc_key) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    setMode(chatId, null);
    if (/^xo[aá]$/i.test(text.trim())) {
      clearSession(chatId);
      return execSetDescription(deps, chatId, wz.slug, { descKey: wz.desc_key, value: "", remove: true });
    }
    return confirmDesc(deps, chatId, wz, text);
  }

  if (mode === "await_video_url") {
    const wz = getWizard(chatId);
    if (!wz?.slug || !wz?.sid) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    const t = text.trim();
    setMode(chatId, null);
    if (/^xo[aá]$/i.test(t)) { clearSession(chatId); return execSetVideo(deps, chatId, wz.slug, { sid: wz.sid, url: null }); }
    if (!youtubeId(t)) { setMode(chatId, "await_video_url"); return send(chatId, "❌ Link không phải YouTube hợp lệ. Dán lại link, hoặc bấm /menu để thoát."); }
    clearSession(chatId);
    return execSetVideo(deps, chatId, wz.slug, { sid: wz.sid, url: t });
  }

  if (mode === "await_section_image") {
    const wz = getWizard(chatId);
    if (!wz?.slug || !wz?.image_field) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    if (!msg.photo) return send(chatId, "📷 Gửi 1 tấm ảnh (không phải chữ). Hoặc bấm /menu để thoát.");
    return downloadPhotoBase64(deps, msg).then((img) => {
      if (!img) return send(chatId, "❌ Không tải được ảnh. Thử lại.");
      clearSession(chatId);
      const ts = Date.now().toString(36);
      return execSetSectionImage(deps, chatId, wz.slug, {
        sid: wz.sid, imageField: wz.image_field, imageList: wz.image_list, imageBase64: img, ts,
      });
    });
  }

  if (mode === "await_hero_image") {
    const wz = getWizard(chatId);
    if (!wz?.slug) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    if (!msg.photo) return send(chatId, "📷 Gửi 1 tấm ảnh (không phải chữ). Hoặc bấm /menu để thoát.");
    return downloadPhotoBase64(deps, msg).then((img) => {
      if (!img) return send(chatId, "❌ Không tải được ảnh. Thử lại.");
      clearSession(chatId);
      return execSetHero(deps, chatId, wz.slug, { imageBase64: img, ts: Date.now().toString(36) });
    });
  }

  if (mode === "await_gallery_images") {
    const wz = getWizard(chatId);
    if (!wz?.slug) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    if (!msg.photo) return send(chatId, "📷 Gửi ảnh (không phải chữ), hoặc bấm ✅ Xong.");
    return downloadPhotoBase64(deps, msg).then((img) => {
      if (!img) return send(chatId, "❌ Không tải được 1 ảnh, bỏ qua tấm đó. Gửi tiếp hoặc bấm ✅ Xong.");
      const cur = getWizard(chatId);
      if (!cur?.slug || cur.action !== "add_gallery") return; // phiên đã đổi
      const buf = [...(cur.buf || []), { base64: img }];
      setWizard(chatId, { ...cur, buf });
      return send(chatId, `📸 Đã nhận <b>${buf.length}</b> ảnh. Gửi tiếp hoặc bấm ✅ Xong.`, {
        reply_markup: { inline_keyboard: [[
          { text: "✅ Xong", callback_data: `galdone:${cur.slug}` },
          { text: "❌ Thoát", callback_data: "wz_abort" },
        ]] },
      });
    });
  }

  return showMenu(chatId, "Chọn việc cần làm:");
}

// ─── Callback handler ─────────────────────────────────────────────────────────
async function handleCallbackQuery(cq) {
  if (!allowedChat(cq.message?.chat?.id)) return;

  await tgApi("answerCallbackQuery", { callback_query_id: cq.id }).catch(() => {});

  const chatId = cq.message.chat.id;
  const data   = cq.data || "";
  const es      = withEditing(cq);

  // ── Điều hướng menu (sửa tin tại chỗ) ────────────────────────────────────────
  if (data === "m:menu") return es.send(chatId, mainMenuText(cfg), { reply_markup: MAIN_KB });
  if (data === "m:help")
    return es.send(chatId, helpText(cfg), {
      reply_markup: { inline_keyboard: [[{ text: "⬅️ Quay lại", callback_data: "m:menu" }]] },
    });

  if (data.startsWith("m:list:")) return renderItemList(es, chatId, data.slice("m:list:".length));
  if (data.startsWith("m:new:"))  return startAdd(es, chatId, data.slice("m:new:".length));

  if (data.startsWith("m:item:")) {
    const [, , ct, ...rest] = data.split(":");
    const slug  = rest.join(":");
    const title = localTitle(deps, ct, slug);
    return es.send(chatId, `🗂 <b>${title}</b> — chọn thao tác:`, {
      reply_markup: buildItemMenu(cfg, ct, slug, title),
    });
  }

  if (data.startsWith("m:act:")) {
    const [, , code, ct, ...rest] = data.split(":");
    const slug   = rest.join(":");
    const action = codeAction(code);
    const title  = localTitle(deps, ct, slug);
    if (action === "toggle_section") return renderSections(es, chatId, ct, slug, title);
    if (action === "delete")         return confirmDelete(es, chatId, ct, slug, title);
    // set_field: project → bảng chọn mục (khớp thanh menu trang); post → field keyboard.
    if (ct === "project" && (cfg.content_types.project.edit_sections || []).length) {
      return es.send(chatId, `✏️ Sửa <b>${title}</b> — chọn mục:`, {
        reply_markup: buildEditSectionMenu(cfg, ct, slug),
      });
    }
    setWizard(chatId, { step: "field", action: "set_field", content_type: ct, slug, title });
    return es.send(chatId, `Sửa <b>${title}</b> — chọn thông tin cần đổi:`, {
      reply_markup: buildFieldKeyboard(cfg, ct, slug),
    });
  }

  // ── Chọn 1 mục để sửa ────────────────────────────────────────────────────────
  if (data.startsWith("esec:")) {
    const [, sid, ...rest] = data.split(":");
    const slug  = rest.join(":");
    const title = localTitle(deps, "project", slug);
    if (sid === "basic") {
      setWizard(chatId, { step: "field", action: "set_field", content_type: "project", slug, title });
      return es.send(chatId, `Sửa <b>${title}</b> — chọn thông tin cần đổi:`, {
        reply_markup: buildFieldKeyboard(cfg, "project", slug),
      });
    }
    const sec = editSectionCfg(cfg, "project", sid);
    if (!sec) return send(chatId, "❌ Mục không hợp lệ. Bấm /menu để làm lại.");
    return es.send(chatId, `<b>${sec.label}</b> — chọn việc:`, {
      reply_markup: buildSectionActionMenu(cfg, "project", slug, sid),
    });
  }

  // ── Sửa đoạn giới thiệu 1 mục ────────────────────────────────────────────────
  if (data.startsWith("edesc:")) {
    const [, sid, ...rest] = data.split(":");
    const slug = rest.join(":");
    const sec  = editSectionCfg(cfg, "project", sid);
    if (!sec?.desc_key) return send(chatId, "❌ Mục không hợp lệ. Bấm /menu.");
    const title = localTitle(deps, "project", slug);
    let current;
    try { current = await readDescription(deps, "project", slug, sec.desc_key); }
    catch { return send(chatId, `❌ Không đọc được <code>${slug}</code>. Bấm /menu.`); }
    setWizard(chatId, { action: "set_desc", content_type: "project", slug, sid, desc_key: sec.desc_key, title, label: sec.label });
    setMode(chatId, "await_desc_value");
    return es.send(chatId,
      `📝 Đoạn giới thiệu <b>${sec.label}</b>\nHiện tại: <code>${current || "(trống)"}</code>\n\n` +
      `Gõ đoạn mới vào đây 👇 (gõ <code>xoá</code> để bỏ đoạn này)`,
      { reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `esec:${sid}:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] } }
    );
  }

  // ── Đổi / thêm ảnh 1 mục ─────────────────────────────────────────────────────
  if (data.startsWith("eimg:")) {
    const [, sid, ...rest] = data.split(":");
    const slug = rest.join(":");
    const sec  = editSectionCfg(cfg, "project", sid);
    if (!sec?.image_field) return send(chatId, "❌ Mục không hợp lệ. Bấm /menu.");
    setWizard(chatId, { action: "set_image", content_type: "project", slug, sid, image_field: sec.image_field, image_list: !!sec.image_list, label: sec.label });
    setMode(chatId, "await_section_image");
    return es.send(chatId,
      `🖼 Gửi 1 ảnh mới cho mục <b>${sec.label}</b> vào đây.\n` +
      (sec.image_list ? "Ảnh sẽ được thêm vào bộ ảnh của mục." : "Ảnh mới sẽ thay ảnh minh hoạ của mục."),
      { reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `esec:${sid}:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] } }
    );
  }

  // ── Dán link video 1 mục ─────────────────────────────────────────────────────
  if (data.startsWith("evid:")) {
    const [, sid, ...rest] = data.split(":");
    const slug = rest.join(":");
    const sec  = editSectionCfg(cfg, "project", sid);
    if (!sec?.video) return send(chatId, "❌ Mục không hợp lệ. Bấm /menu.");
    setWizard(chatId, { action: "set_video", content_type: "project", slug, sid, label: sec.label });
    setMode(chatId, "await_video_url");
    return es.send(chatId,
      `🎬 Video <b>${sec.label}</b>\n\nDán link YouTube vào đây 👇 (gõ <code>xoá</code> để bỏ video)`,
      { reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `esec:${sid}:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] } }
    );
  }

  // ── Bảng ảnh: đổi bìa / thêm thư viện ────────────────────────────────────────
  if (data.startsWith("emedia:")) {
    const slug  = data.slice("emedia:".length);
    const title = localTitle(deps, "project", slug);
    return es.send(chatId, `🖼 <b>${title}</b> — ảnh bìa & thư viện:`, {
      reply_markup: buildMediaMenu(cfg, slug),
    });
  }

  if (data.startsWith("ehero:")) {
    const slug = data.slice("ehero:".length);
    setWizard(chatId, { action: "set_hero", content_type: "project", slug });
    setMode(chatId, "await_hero_image");
    return es.send(chatId, "🏞 Gửi 1 ảnh bìa mới vào đây.", {
      reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `emedia:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] },
    });
  }

  if (data.startsWith("egal:")) {
    const slug = data.slice("egal:".length);
    setWizard(chatId, { action: "add_gallery", content_type: "project", slug, buf: [] });
    setMode(chatId, "await_gallery_images");
    return es.send(chatId,
      "➕ Gửi các ảnh muốn thêm vào thư viện (gửi lần lượt bao nhiêu tấm cũng được). Xong bấm <b>✅ Xong</b>.",
      { reply_markup: { inline_keyboard: [[
        { text: "✅ Xong", callback_data: `galdone:${slug}` },
        { text: "❌ Thoát", callback_data: "wz_abort" },
      ]] } }
    );
  }

  if (data.startsWith("galdone:")) {
    const slug = data.slice("galdone:".length);
    const wz = getWizard(chatId);
    const buf = wz?.buf || [];
    clearSession(chatId);
    if (!buf.length) return send(chatId, "❌ Chưa nhận ảnh nào. Bấm /menu để làm lại.");
    return execAddGallery(deps, chatId, slug, buf);
  }

  // ── Thoát / hỏi trợ lý ───────────────────────────────────────────────────────
  if (data === "wz_abort") {
    clearSession(chatId);
    return es.send(chatId, "Đã thoát. Chọn việc khác:", { reply_markup: MAIN_KB });
  }

  if (data === "wz_ask") {
    setMode(chatId, "await_freechat");
    return send(chatId, "💬 Anh cứ gõ điều anh muốn làm (vd \"đổi giá dự án\"), tôi sẽ chỉ cách bấm.");
  }

  // ── Chọn trường → hỏi giá trị mới (sửa tin tại chỗ) ──────────────────────────
  if (data.startsWith("wz_f:")) {
    const [, ct, slug, idx] = data.split(":");
    const field = fieldAt(cfg, ct, idx);
    if (!field) return send(chatId, "❌ Trường không hợp lệ. Bấm /menu để làm lại.");
    const title = getWizard(chatId)?.title || localTitle(deps, ct, slug);
    let current;
    try { current = await readCurrentField(deps, ct, slug, field); }
    catch { return send(chatId, `❌ Không đọc được <code>${slug}</code>. Bấm /menu để thử lại.`); }
    setWizard(chatId, { step: "value", action: "set_field", content_type: ct, slug, title, field });
    setMode(chatId, "await_field_value");
    return es.send(chatId,
      `Giá trị mới cho <b>${fieldLabel(cfg, field)}</b> là gì?\n` +
      `Hiện tại: <code>${current || "(trống)"}</code>\n\nGõ giá trị mới vào đây 👇`,
      { reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `m:act:${actionCode("set_field")}:${ct}:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] } }
    );
  }

  // ── Bật/tắt một phần → commit rồi cập nhật bảng tại chỗ ───────────────────────
  if (data.startsWith("wz_s:")) {
    const [, ct, slug, idx] = data.split(":");
    const sectionId = sectionAt(cfg, ct, idx);
    if (!sectionId) return send(chatId, "❌ Phần không hợp lệ. Bấm /menu để làm lại.");
    const result = await execToggleSection(deps, chatId, ct, slug, sectionId);
    if (!result) return;
    return tgApi("editMessageReplyMarkup", {
      chat_id:      chatId,
      message_id:   cq.message.message_id,
      reply_markup: buildSectionKeyboard(cfg, ct, slug, result.hidden),
    }).catch(() => {});
  }

  // ── Cổng xác nhận sửa / xoá (gửi tin riêng — là kết quả, không phải menu) ─────
  if (data.startsWith("wz_confirm:")) {
    const p = takePendingEdit(data.slice("wz_confirm:".length));
    if (!p) return send(chatId, "⏱ Xác nhận đã hết hạn (5 phút). Bấm /menu để làm lại.");
    clearSession(chatId);
    if (p.kind === "desc")
      return execSetDescription(deps, chatId, p.slug, { descKey: p.desc_key, value: p.value, remove: false });
    return execSetField(deps, chatId, p.content_type, { slug: p.slug, field: p.field, value: p.value });
  }

  if (data.startsWith("wz_cancel:")) {
    takePendingEdit(data.slice("wz_cancel:".length));
    clearSession(chatId);
    return send(chatId, "❌ Đã huỷ, không sửa gì.");
  }

  if (data.startsWith("wz_delno:")) {
    takePendingDelete(data.slice("wz_delno:".length));
    clearSession(chatId);
    return send(chatId, "❌ Đã huỷ, không xoá gì.");
  }

  if (data.startsWith("wz_del:")) {
    const p = takePendingDelete(data.slice("wz_del:".length));
    if (!p) return send(chatId, "⏱ Xác nhận đã hết hạn (5 phút). Bấm /menu để làm lại.");
    clearSession(chatId);
    return execDelete(deps, chatId, p.content_type, p.slug, p.title);
  }

  // ── Đăng nội dung mới ────────────────────────────────────────────────────────
  if (data === "pub_cancel") {
    clearSession(chatId);
    return send(chatId, "❌ Đã hủy, không đăng gì.");
  }
  if (data === "pub_edit") {
    if (!getDraft(chatId)) return send(chatId, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé.");
    setMode(chatId, "await_edit");
    return send(chatId, "✏️ Anh muốn sửa gì? (vd: rút ngắn tiêu đề, bỏ đoạn cuối)");
  }
  if (data === "pub_approve") {
    const draft = getDraft(chatId);
    if (!draft) return send(chatId, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé.");
    clearSession(chatId);
    return execPublish(deps, chatId, draft);
  }

  // ── Hoàn tác ─────────────────────────────────────────────────────────────────
  if (data.startsWith("undo:")) return execUndo(deps, chatId, data.slice("undo:".length));
}

// ─── Poll loop ─────────────────────────────────────────────────────────────────
let offset = 0;

async function poll() {
  const n = listContentItems(deps, "project").length;
  console.log(`🤖 ${cfg.bot_name} đang chạy (adapter: ${ADAPTER}, branch: ${cfg.deploy_branch}, ${n} dự án). Ctrl+C để tắt.\n`);
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
