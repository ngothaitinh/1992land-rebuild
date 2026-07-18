// Dựng menu từ adapter config. Thuần, không I/O — engine không biết tên site.
//
// Menu đặt theo VIỆC người dùng muốn làm, không theo cú pháp lệnh:
//   tầng 1 = việc  →  tầng 2 = loại nội dung  →  wizard.

import { actionCode } from "./wizard-helpers.mjs";

const ASK_BTN  = { text: "💬 Hỏi trợ lý",     callback_data: "wz_ask" };
const HELP_BTN = { text: "❓ Hướng dẫn nhanh", callback_data: "m:help" };
const BACK_MENU = { text: "⬅️ Quay lại", callback_data: "m:menu" };

// Các content_type hỗ trợ một action, theo thứ tự khai báo trong config.
export function typesFor(cfg, action) {
  return Object.entries(cfg.content_types)
    .filter(([, ct]) => {
      if (action === "add")            return !!ct.add_mode;
      if (action === "set_field")      return (ct.editable_fields || []).length > 0;
      if (action === "toggle_section") return !!ct.sections;
      if (action === "delete")         return true;
      return false;
    })
    .map(([key, ct]) => ({ key, ct }));
}

// Nút mở một action: nếu chỉ 1 loại nội dung hỗ trợ thì bỏ qua tầng 2, vào thẳng wizard.
function actionButton(cfg, action) {
  const types = typesFor(cfg, action);
  if (!types.length) return null;
  const text = cfg.action_labels[action] || action;
  return types.length === 1
    ? { text, callback_data: `m:go:${action}:${types[0].key}` }
    : { text, callback_data: `m:type:${action}` };
}

export function buildMainMenu(cfg) {
  const listRow = Object.entries(cfg.content_types).map(([key, ct]) => ({
    text: `📂 ${capitalize(ct.label)}`,
    callback_data: `m:list:${key}`,
  }));
  return {
    inline_keyboard: [
      listRow,
      [
        { text: "💬 Hỏi trợ lý",   callback_data: "wz_ask" },
        { text: "❓ Hướng dẫn",     callback_data: "m:help" },
      ],
    ],
  };
}

export function mainMenuText(cfg) {
  return `📋 <b>${cfg.bot_name}</b> — chọn Dự án hoặc Bài viết:`;
}

function capitalize(s) {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}

// Danh sách 1 loại nội dung: nút thêm mới ở đầu, mỗi mục 1 nút, quay lại menu.
export function buildItemListMenu(cfg, contentType, items) {
  const ct = cfg.content_types[contentType];
  const rows = [[{ text: `➕ Thêm ${ct.label} mới`, callback_data: `m:new:${contentType}` }]];
  for (const it of items)
    rows.push([{ text: (it.title || it.slug).slice(0, 60), callback_data: `m:item:${contentType}:${it.slug}` }]);
  rows.push([{ text: "⬅️ Quay lại", callback_data: "m:menu" }]);
  return { inline_keyboard: rows };
}

// Bảng thao tác cho 1 mục. Nút hiện tùy loại nội dung hỗ trợ (đọc config).
export function buildItemMenu(cfg, contentType, slug, title) {
  const ct = cfg.content_types[contentType];
  const rows = [];
  if ((ct.editable_fields || []).length)
    rows.push([{ text: "✏️ Sửa thông tin", callback_data: `m:act:${actionCode("set_field")}:${contentType}:${slug}` }]);
  if (ct.sections)
    rows.push([{ text: "🖼 Ảnh bìa & thư viện", callback_data: `emedia:${slug}` }]);
  if (ct.sections)
    rows.push([{ text: "🙈 Ẩn / hiện phần", callback_data: `m:act:${actionCode("toggle_section")}:${contentType}:${slug}` }]);
  rows.push([{ text: "🗑 Xoá", callback_data: `m:act:${actionCode("delete")}:${contentType}:${slug}` }]);
  rows.push([{ text: "⬅️ Quay lại", callback_data: `m:list:${contentType}` }]);
  return { inline_keyboard: rows };
}

// Bảng ảnh của 1 dự án: đổi ảnh bìa, thêm ảnh vào thư viện.
export function buildMediaMenu(cfg, slug) {
  return {
    inline_keyboard: [
      [{ text: "🏞 Đổi ảnh bìa",        callback_data: `ehero:${slug}` }],
      [{ text: "➕ Thêm ảnh thư viện",  callback_data: `egal:${slug}` }],
      [
        { text: "⬅️ Quay lại", callback_data: `m:item:project:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ],
    ],
  };
}

export function welcomeText(cfg) {
  return (
    `👋 Đây là <b>${cfg.bot_name}</b> — quản lý web <b>${cfg.site_name}</b> ngay trong Telegram.\n\n` +
    `Chọn <b>📂 Dự án</b> hoặc <b>📂 Bài viết</b>, rồi bấm vào mục cần sửa. ` +
    `Mỗi thay đổi lên web sau <b>~8 phút</b>.\n\n` +
    `Anh chỉ cần bấm nút, không phải gõ lệnh. Chọn việc cần làm:`
  );
}

export function helpText(cfg) {
  return (
    `❓ <b>Hướng dẫn nhanh</b>\n\n` +
    `Bấm <b>📂 Dự án</b> hoặc <b>📂 Bài viết</b> → chọn 1 mục → hiện bảng thao tác:\n` +
    `• <b>✏️ Sửa thông tin</b> — chọn thông tin cần đổi, gõ giá trị mới, xác nhận.\n` +
    `• <b>🙈 Ẩn / hiện phần</b> — bấm phần muốn tắt (chỉ dự án). ✅ đang hiện · 🙈 đang ẩn.\n` +
    `• <b>🗑 Xoá</b> — bot hỏi lại trước khi xoá.\n\n` +
    `Thêm mới: bấm <b>➕ Thêm … mới</b> ở đầu danh sách, dán nội dung kèm 1 ảnh.\n\n` +
    `Sau mỗi thay đổi có nút <b>↩️ Hoàn tác</b> (30 phút).\n` +
    `Bấm <b>❌ Thoát</b> hoặc gõ <code>/huy</code> để dừng giữa chừng.\n` +
    `Ảnh, thư viện slide, lịch thanh toán… sửa ở <b>${cfg.site_name}/admin/</b>.`
  );
}
