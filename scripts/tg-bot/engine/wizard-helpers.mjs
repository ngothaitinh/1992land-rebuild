// Logic thuần cho wizard (không I/O, không Telegram) — dễ test.
// Phần điều phối Telegram (gửi tin, gọi GitHub) nằm ở serve.mjs.

export const WIZARD_PAGE_SIZE = 15;

const ASK_BTN  = { text: "💬 Hỏi trợ lý", callback_data: "wz_ask" };
const EXIT_BTN = { text: "❌ Thoát",      callback_data: "wz_abort" };

function backBtn(callback_data) {
  return { text: "⬅️ Quay lại", callback_data };
}

// callback_data của Telegram tối đa 64 byte, mà slug dài nhất đã 37 ký tự.
// Nén tên action xuống 1 ký tự để không tràn.
const ACTION_CODE = { set_field: "e", toggle_section: "s", delete: "d" };
const CODE_ACTION = Object.fromEntries(Object.entries(ACTION_CODE).map(([a, c]) => [c, a]));

export function actionCode(action) { return ACTION_CODE[action] || action; }
export function codeAction(code)   { return CODE_ACTION[code] || code; }

// Cùng lý do: tên field/section gửi kèm slug sẽ tràn 64 byte, nên gửi chỉ số.
export function fieldAt(cfg, content_type, index) {
  return (cfg.content_types[content_type].editable_fields || [])[Number(index)];
}

export function sectionAt(cfg, content_type, index) {
  return Object.keys(cfg.content_types[content_type].sections || {})[Number(index)];
}

// Bỏ dấu tiếng Việt + thường hóa, để tìm kiếm không phân biệt dấu.
export function noAccent(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

// Nhãn nút cho 1 field (lấy từ adapter config, fallback về tên field).
export function fieldLabel(cfg, field) {
  return (cfg.field_labels && cfg.field_labels[field]) || field;
}

// Lọc danh sách [{slug,title}] theo từ khóa (không phân biệt dấu, khớp title hoặc slug).
export function filterItems(items, filter) {
  if (!filter || !filter.trim()) return items;
  const q = noAccent(filter);
  return items.filter((it) => noAccent(it.title).includes(q) || it.slug.includes(q));
}

// Cắt 1 trang + cờ điều hướng.
export function paginate(items, offset, pageSize = WIZARD_PAGE_SIZE) {
  const safeOffset = Math.max(0, offset | 0);
  return {
    page:    items.slice(safeOffset, safeOffset + pageSize),
    hasPrev: safeOffset > 0,
    hasNext: safeOffset + pageSize < items.length,
    total:   items.length,
    offset:  safeOffset,
  };
}

// Bước chọn đối tượng. `action` đi kèm callback để wizard biết chọn xong thì làm gì.
export function buildListKeyboard(action, content_type, items, offset, pageSize = WIZARD_PAGE_SIZE) {
  const a = actionCode(action);
  const { page, hasPrev, hasNext, offset: off } = paginate(items, offset, pageSize);
  const rows = page.map((it) => [
    { text: (it.title || it.slug).slice(0, 60), callback_data: `wz_pick:${a}:${content_type}:${it.slug}` },
  ]);
  const nav = [];
  if (hasPrev) nav.push({ text: "◀️ Trang trước", callback_data: `wz_page:${a}:${content_type}:${Math.max(0, off - pageSize)}` });
  if (hasNext) nav.push({ text: "▶️ Trang sau",   callback_data: `wz_page:${a}:${content_type}:${off + pageSize}` });
  if (nav.length) rows.push(nav);
  rows.push([{ text: "🔍 Tìm theo tên", callback_data: `wz_search:${a}:${content_type}` }]);
  rows.push([backBtn("m:menu"), ASK_BTN, EXIT_BTN]);
  return { inline_keyboard: rows };
}

// Bước chọn trường cần sửa.
export function buildFieldKeyboard(cfg, content_type, slug) {
  const ct   = cfg.content_types[content_type];
  const rows = (ct.editable_fields || []).map((f, i) => [
    { text: fieldLabel(cfg, f), callback_data: `wz_f:${content_type}:${slug}:${i}` },
  ]);
  rows.push([backBtn(`m:item:${content_type}:${slug}`), EXIT_BTN]);
  return { inline_keyboard: rows };
}

// Bảng bật/tắt các phần của một dự án. ✅ = đang hiện, 🙈 = đang ẩn.
// hidden: mảng id phần đang bị ẩn (project.hidden_sections).
export function buildSectionKeyboard(cfg, content_type, slug, hidden = []) {
  const sections = cfg.content_types[content_type].sections || {};
  const hiddenSet = new Set(hidden);
  const rows = Object.entries(sections).map(([id, label], i) => [
    {
      text: `${hiddenSet.has(id) ? "🙈" : "✅"} ${label}`,
      callback_data: `wz_s:${content_type}:${slug}:${i}`,
    },
  ]);
  rows.push([backBtn(`m:item:${content_type}:${slug}`), EXIT_BTN]);
  return { inline_keyboard: rows };
}
