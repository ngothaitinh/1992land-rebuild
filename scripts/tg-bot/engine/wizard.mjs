// Các bước bấm-chọn: liệt kê nội dung, chọn mục, chọn trường/phần, cổng xác nhận.
// Không tự commit — việc ghi repo nằm ở actions.mjs.
//
// deps = { cfg, repo, pat, send, root }

import fs   from "node:fs";
import path from "node:path";

import { getFile } from "./github-commit.mjs";
import { setMode, setWizard } from "./session.mjs";
import { buildItemListMenu } from "./menu.mjs";
import { fieldLabel, buildSectionKeyboard } from "./wizard-helpers.mjs";

// ─── Đọc danh sách nội dung từ repo local (không tốn lượt gọi GitHub API) ──────
export function listContentItems(deps, contentType) {
  const { cfg, root } = deps;
  const ct  = cfg.content_types[contentType];
  const dir = path.join(root, ct.dir);
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

export function localTitle(deps, contentType, slug) {
  return listContentItems(deps, contentType).find((it) => it.slug === slug)?.title || slug;
}

// Danh sách 1 loại nội dung (item-first): mọi mục, không phân trang.
export function renderItemList(deps, chatId, contentType) {
  const { cfg, send } = deps;
  const label = cfg.content_types[contentType].label;
  const items = listContentItems(deps, contentType);
  return send(chatId, `📂 <b>${label[0].toUpperCase() + label.slice(1)}</b> — chọn mục, hoặc thêm mới:`, {
    reply_markup: buildItemListMenu(cfg, contentType, items),
  });
}

// ─── Cổng xác nhận: giữ payload trong bộ nhớ, callback chỉ mang khoá ngắn ──────
// (nếu nhét slug + giá trị vào callback_data sẽ vượt giới hạn 64 byte của Telegram)
const pendingEdits   = new Map();
const pendingDeletes = new Map();

function stash(map, payload) {
  const key = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  map.set(key, payload);
  setTimeout(() => map.delete(key), 5 * 60 * 1000);
  return key;
}

export function takePendingEdit(key)   { const p = pendingEdits.get(key);   pendingEdits.delete(key);   return p; }
export function takePendingDelete(key) { const p = pendingDeletes.get(key); pendingDeletes.delete(key); return p; }

export function startAdd(deps, chatId, contentType) {
  const ct = deps.cfg.content_types[contentType];
  setMode(chatId, ct.add_mode);
  return deps.send(chatId, `✍️ Dán nội dung ${ct.label} vào đây, kèm 1 ảnh nếu có. Xong gửi là được.`);
}

// ─── Bảng bật/tắt phần ────────────────────────────────────────────────────────
async function readHiddenSections(deps, contentType, slug) {
  const { cfg, repo, pat } = deps;
  const ct = cfg.content_types[contentType];
  const { content } = await getFile(repo, cfg.deploy_branch, `${ct.dir}/${slug}.json`, pat);
  const obj = JSON.parse(content);
  return Array.isArray(obj.hidden_sections) ? obj.hidden_sections : [];
}

export async function renderSections(deps, chatId, contentType, slug, title) {
  const { cfg, send } = deps;
  let hidden;
  try { hidden = await readHiddenSections(deps, contentType, slug); }
  catch { return send(chatId, `❌ Không đọc được <code>${slug}</code>. Bấm /menu để thử lại.`); }
  setWizard(chatId, { step: "sections", action: "toggle_section", content_type: contentType, slug, title });
  return send(chatId,
    `🙈 <b>${title}</b> — bấm vào phần để bật/tắt:\n✅ = đang hiện trên web · 🙈 = đang ẩn`,
    { reply_markup: buildSectionKeyboard(cfg, contentType, slug, hidden) }
  );
}

// ─── Cổng xác nhận ────────────────────────────────────────────────────────────
export function confirmEdit(deps, chatId, wz, value) {
  const { cfg, send } = deps;
  const key = stash(pendingEdits, { content_type: wz.content_type, slug: wz.slug, field: wz.field, value });
  return send(chatId,
    `✏️ Sửa <b>${fieldLabel(cfg, wz.field)}</b> của <b>${wz.title || wz.slug}</b>\n` +
    `Thành: <code>${value}</code>\n— đúng không?`,
    { reply_markup: { inline_keyboard: [[
      { text: "✅ Đồng ý", callback_data: `wz_confirm:${key}` },
      { text: "❌ Huỷ",    callback_data: `wz_cancel:${key}` },
    ]] } }
  );
}

export function confirmDelete(deps, chatId, contentType, slug, title) {
  const { cfg, send } = deps;
  const key = stash(pendingDeletes, { content_type: contentType, slug, title });
  return send(chatId,
    `🗑 Xoá ${cfg.content_types[contentType].label}: <b>${title}</b>\n` +
    `⚠️ Mục này sẽ biến mất khỏi web. Hoàn tác được trong 30 phút.`,
    { reply_markup: { inline_keyboard: [[
      { text: "✅ Xác nhận xoá", callback_data: `wz_del:${key}` },
      { text: "❌ Huỷ",          callback_data: `wz_delno:${key}` },
    ]] } }
  );
}
