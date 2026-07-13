import https from "node:https";
import fs   from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseCommand } from "./parse-command.mjs";
import { isProcessed, markProcessed } from "./idempotency.mjs";
import { setMode, getMode, getDraft, setWizard, getWizard, clearSession } from "./session.mjs";
import { buildMainMenu, buildTypeMenu, typeMenuPrompt, welcomeText, helpText } from "./menu.mjs";
import {
  fieldLabel, actionCode, codeAction, fieldAt, sectionAt,
  buildFieldKeyboard, buildSectionKeyboard,
} from "./wizard-helpers.mjs";
import {
  listContentItems, localTitle, renderList, renderSections, openAction, startAdd,
  confirmEdit, confirmDelete, takePendingEdit, takePendingDelete,
} from "./wizard.mjs";
import { composeAndPreview, freeChatAdvisor, downloadPhotoBase64 } from "./compose-flow.mjs";
import {
  execSetField, execToggleSection, execDelete, execPublish, execUndo, readCurrentField,
} from "./actions.mjs";

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

function showMenu(chatId, text) {
  return send(chatId, text || `📋 <b>${cfg.bot_name}</b> — chọn việc cần làm:`, { reply_markup: MAIN_KB });
}

function allowedChat(chatId) {
  const allowed = cfg.allowed_chat_ids.map(String);
  return !allowed.length || allowed.includes(String(chatId));
}

// ─── Slash command → thao tác ─────────────────────────────────────────────────
const slashMap = new Map(cfg.slash_commands.map((s) => [`/${s.command}`, s.route]));

function runRoute(chatId, route) {
  if (route === "menu")   return showMenu(chatId);
  if (route === "help")   return send(chatId, helpText(cfg), { reply_markup: MAIN_KB });
  if (route === "cancel") {
    clearSession(chatId);
    return showMenu(chatId, "Đã thoát thao tác đang làm. Chọn việc khác:");
  }
  const [kind, arg] = route.split(":");
  if (kind === "add")    return startAdd(deps, chatId, arg);
  if (kind === "action") return openAction(deps, chatId, arg);
  return showMenu(chatId);
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

  if (mode === "await_wz_search") {
    const wz = getWizard(chatId);
    if (!wz?.content_type) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    return renderList(deps, chatId, wz.action, wz.content_type, 0, text);
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

  return showMenu(chatId, "Chọn việc cần làm:");
}

// ─── Callback handler ─────────────────────────────────────────────────────────
async function handleCallbackQuery(cq) {
  if (!allowedChat(cq.message?.chat?.id)) return;

  await tgApi("answerCallbackQuery", { callback_query_id: cq.id }).catch(() => {});

  const chatId = cq.message.chat.id;
  const data   = cq.data || "";

  // ── Menu ───────────────────────────────────────────────────────────────────
  if (data === "m:menu") return showMenu(chatId);
  if (data === "m:help") return send(chatId, helpText(cfg), { reply_markup: MAIN_KB });

  if (data.startsWith("m:add:")) return startAdd(deps, chatId, data.slice("m:add:".length));

  if (data.startsWith("m:type:")) {
    const action = data.slice("m:type:".length);
    return send(chatId, typeMenuPrompt(cfg, action), { reply_markup: buildTypeMenu(cfg, action) });
  }

  if (data.startsWith("m:go:")) {
    const [, , action, ct] = data.split(":");
    return renderList(deps, chatId, action, ct, 0, null);
  }

  // ── Wizard ─────────────────────────────────────────────────────────────────
  if (data === "wz_abort") {
    clearSession(chatId);
    return showMenu(chatId, "Đã thoát. Chọn việc khác:");
  }

  if (data === "wz_ask") {
    setMode(chatId, "await_freechat");
    return send(chatId, "💬 Anh cứ gõ điều anh muốn làm (vd \"đổi giá dự án\"), tôi sẽ chỉ cách bấm.");
  }

  if (data.startsWith("wz_page:")) {
    const [, a, ct, off] = data.split(":");
    const wz = getWizard(chatId);
    return renderList(deps, chatId, codeAction(a), ct, parseInt(off, 10) || 0, wz?.filter || null);
  }

  // Phải đứng trước nhánh "wz_s:" — tuy dấu hai chấm đã phân biệt, thứ tự này là chốt chặn.
  if (data.startsWith("wz_search:")) {
    const [, a, ct] = data.split(":");
    setWizard(chatId, { step: "search", action: codeAction(a), content_type: ct });
    setMode(chatId, "await_wz_search");
    return send(chatId, "🔍 Gõ vài ký tự trong tên cần tìm:");
  }

  if (data.startsWith("wz_pick:")) {
    const [, a, ct, ...rest] = data.split(":");
    const slug   = rest.join(":");
    const action = codeAction(a);
    const title  = localTitle(deps, ct, slug);
    if (action === "toggle_section") return renderSections(deps, chatId, ct, slug, title);
    if (action === "delete")         return confirmDelete(deps, chatId, ct, slug, title);
    setWizard(chatId, { step: "field", action, content_type: ct, slug, title });
    return send(chatId, `Sửa <b>${title}</b> — chọn thông tin cần đổi:`, {
      reply_markup: buildFieldKeyboard(cfg, ct, slug),
    });
  }

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
    return send(chatId,
      `Giá trị mới cho <b>${fieldLabel(cfg, field)}</b> là gì?\n` +
      `Hiện tại: <code>${current || "(trống)"}</code>\n\nGõ giá trị mới vào đây 👇`,
      { reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `wz_pick:${actionCode("set_field")}:${ct}:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] } }
    );
  }

  // Bật/tắt một phần → commit, rồi cập nhật tại chỗ bảng đang hiển thị.
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

  if (data.startsWith("wz_confirm:")) {
    const p = takePendingEdit(data.slice("wz_confirm:".length));
    if (!p) return send(chatId, "⏱ Xác nhận đã hết hạn (5 phút). Bấm /menu để làm lại.");
    clearSession(chatId);
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

  // ── Đăng nội dung mới ──────────────────────────────────────────────────────
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

  // ── Hoàn tác ───────────────────────────────────────────────────────────────
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
