// Luồng soạn nội dung mới bằng AI (nháp → duyệt) và trợ lý chat hướng dẫn.
// Trợ lý CHỈ tư vấn bấm nút, không bao giờ ghi repo.
//
// deps = { cfg, send, root, tg: { api, token } }

import fs    from "node:fs";
import path  from "node:path";
import https from "node:https";

import { composeContent, slugify, validateComposed } from "./compose.mjs";
import { callLLM } from "./llm.mjs";
import { setMode, setDraft, clearSession } from "./session.mjs";
import { typesFor } from "./menu.mjs";
import { listContentItems } from "./wizard.mjs";

// ─── Ảnh Telegram → base64 ────────────────────────────────────────────────────
export async function downloadPhotoBase64(deps, msg) {
  const { api, token } = deps.tg;
  const photos = msg.photo ? [msg.photo[msg.photo.length - 1]] : [];
  if (!photos.length) return null;
  const file = await api("getFile", { file_id: photos[0].file_id });
  const url  = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
  return await new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    }).on("error", reject);
  });
}

// ─── Soạn nháp + gửi bản xem trước ────────────────────────────────────────────
function reviewWarning(obj) {
  const rf = Array.isArray(obj._review_fields) ? obj._review_fields : [];
  return rf.length ? `⚠️ <b>Cần soi kỹ:</b> ${rf.join(", ")}\n\n` : "";
}

function existingCategories(deps) {
  const dir = path.join(deps.root, deps.cfg.content_types.post.dir);
  if (!fs.existsSync(dir)) return [];
  const cats = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => {
    try {
      const m = fs.readFileSync(path.join(dir, f), "utf8").match(/^category:\s*(.+)$/m);
      return m ? m[1].replace(/["']/g, "").trim() : null;
    } catch { return null; }
  });
  return [...new Set(cats.filter(Boolean))];
}

export async function composeAndPreview(deps, chatId, type, sourceText, imageBase64, editInstruction) {
  const { cfg, send } = deps;
  const ctx = {
    today:              new Date().toISOString().slice(0, 10),
    existingSlugs:      listContentItems(deps, "project").map((it) => it.slug),
    existingCategories: existingCategories(deps),
  };

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

  const text =
    reviewWarning(obj) +
    `📄 <b>Bản nháp ${cfg.content_types[type].label}</b>\n` +
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

// ─── Trợ lý hướng dẫn (lưới an toàn khi người dùng gõ tự do) ───────────────────
export async function freeChatAdvisor(deps, chatId, userText, mainKb) {
  const { cfg, send } = deps;
  await send(chatId, "💬 Để tôi xem giúp anh…");

  const buttons = [
    ...typesFor(cfg, "add").map(({ ct }) => ct.add_button),
    ...Object.entries(cfg.action_labels).filter(([a]) => a !== "add").map(([, label]) => label),
  ].map((b) => `- ${b}`).join("\n");

  const system =
    `Bạn là trợ lý hướng dẫn của "${cfg.bot_name}" — bot quản trị web ${cfg.site_name}.\n` +
    `Người dùng là chủ doanh nghiệp, KHÔNG rành kỹ thuật.\n` +
    `Nhiệm vụ DUY NHẤT: chỉ họ nên BẤM nút nào ở menu để đạt mục đích.\n` +
    `TUYỆT ĐỐI KHÔNG tự sửa, tự đăng, tự tạo nội dung — bạn chỉ tư vấn.\n` +
    `KHÔNG bịa tính năng ngoài danh sách dưới đây.\n` +
    `Các nút có sẵn ở menu:\n${buttons}\n` +
    `Ảnh, thư viện slide, lịch thanh toán, FAQ chỉ sửa được ở ${cfg.site_name}/admin/ — ` +
    `nếu người dùng hỏi những thứ đó, hãy chỉ họ sang trang admin.\n` +
    `Trả lời ngắn gọn, thân thiện, tiếng Việt. Nếu chưa rõ ý, hỏi lại đúng 1 câu.`;

  let reply;
  try {
    reply = await callLLM({ system, user: userText });
  } catch {
    return send(chatId, "Tôi chưa kết nối được trợ lý AI. Anh chọn việc cần làm nhé:", { reply_markup: mainKb });
  }
  return send(chatId, reply, {
    reply_markup: { inline_keyboard: [[{ text: "📋 Mở menu", callback_data: "m:menu" }]] },
  });
}
