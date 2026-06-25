// Logic thuần cho wizard sửa (không I/O, không Telegram) — dễ test.
// Phần điều phối Telegram (gửi tin, gọi GitHub) nằm ở serve.mjs.

export const WIZARD_PAGE_SIZE = 15;

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

// Dựng inline_keyboard cho bước chọn đối tượng (danh sách + phân trang + tìm/hỏi/thoát).
export function buildListKeyboard(content_type, items, offset, pageSize = WIZARD_PAGE_SIZE) {
  const { page, hasPrev, hasNext, offset: off } = paginate(items, offset, pageSize);
  const rows = page.map((it) => [
    { text: (it.title || it.slug).slice(0, 60), callback_data: `wz_pick:${content_type}:${it.slug}` },
  ]);
  const nav = [];
  if (hasPrev) nav.push({ text: "◀️ Quay lại", callback_data: `wz_page:${content_type}:${Math.max(0, off - pageSize)}` });
  if (hasNext) nav.push({ text: "▶️ Xem thêm", callback_data: `wz_page:${content_type}:${off + pageSize}` });
  if (nav.length) rows.push(nav);
  rows.push([
    { text: "🔍 Tìm theo tên", callback_data: `wz_search:${content_type}` },
    { text: "💬 Hỏi AI",       callback_data: "wz_ask" },
    { text: "❌ Thoát",         callback_data: "wz_abort" },
  ]);
  return { inline_keyboard: rows };
}

// Dựng inline_keyboard cho bước chọn trường.
export function buildFieldKeyboard(cfg, content_type, slug) {
  const ct   = cfg.content_types[content_type];
  const rows = (ct.editable_fields || []).map((f) => [
    { text: fieldLabel(cfg, f), callback_data: `wz_field:${content_type}:${slug}:${f}` },
  ]);
  rows.push([
    { text: "💬 Hỏi AI", callback_data: "wz_ask" },
    { text: "❌ Thoát",   callback_data: "wz_abort" },
  ]);
  return { inline_keyboard: rows };
}
