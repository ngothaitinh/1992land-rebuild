// Dựng menu từ adapter config. Thuần, không I/O — engine không biết tên site.
//
// Menu đặt theo VIỆC người dùng muốn làm, không theo cú pháp lệnh:
//   tầng 1 = việc  →  tầng 2 = loại nội dung  →  wizard.

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
  const rows = [];

  const addRow = typesFor(cfg, "add").map(({ key, ct }) => ({
    text: ct.add_button || `${cfg.action_labels.add} ${ct.label}`,
    callback_data: `m:add:${key}`,
  }));
  if (addRow.length) rows.push(addRow);

  const edit   = actionButton(cfg, "set_field");
  const toggle = actionButton(cfg, "toggle_section");
  if (edit || toggle) rows.push([edit, toggle].filter(Boolean));

  const del = actionButton(cfg, "delete");
  if (del) rows.push([del]);

  rows.push([ASK_BTN, HELP_BTN]);
  return { inline_keyboard: rows };
}

export function buildTypeMenu(cfg, action) {
  const rows = typesFor(cfg, action).map(({ key, ct }) => [
    { text: capitalize(ct.label), callback_data: `m:go:${action}:${key}` },
  ]);
  rows.push([BACK_MENU]);
  return { inline_keyboard: rows };
}

export function typeMenuPrompt(cfg, action) {
  return `${cfg.action_labels[action] || action} — chọn loại nội dung:`;
}

function capitalize(s) {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}

export function welcomeText(cfg) {
  return (
    `👋 Đây là <b>${cfg.bot_name}</b> — quản lý web <b>${cfg.site_name}</b> ngay trong Telegram.\n\n` +
    `Bot làm được 4 việc: <b>thêm</b>, <b>sửa</b>, <b>ẩn/hiện phần</b>, <b>xoá</b>.\n` +
    `Anh chỉ cần bấm nút, không phải gõ lệnh. Mỗi thay đổi lên web sau <b>~8 phút</b>.\n\n` +
    `Chọn việc cần làm:`
  );
}

export function helpText(cfg) {
  return (
    `❓ <b>Hướng dẫn nhanh</b>\n\n` +
    `<b>Thêm dự án / bài viết</b> — bấm nút, dán nội dung kèm 1 ảnh. Bot soạn bản nháp, anh xem rồi bấm ✅ Duyệt.\n\n` +
    `<b>Sửa nội dung</b> — chọn mục trong danh sách → chọn thông tin cần đổi → gõ giá trị mới → xác nhận.\n\n` +
    `<b>Ẩn / hiện phần</b> — chọn dự án, bấm vào phần muốn tắt. ✅ là đang hiện, 🙈 là đang ẩn.\n\n` +
    `<b>Xoá</b> — chọn mục, bot hỏi lại trước khi xoá.\n\n` +
    `Sau mỗi thay đổi có nút <b>↩️ Hoàn tác</b> (dùng được trong 30 phút).\n` +
    `Gõ <code>/huy</code> bất cứ lúc nào để thoát giữa chừng.\n` +
    `Ảnh, thư viện slide, lịch thanh toán… sửa ở trang <b>${cfg.site_name}/admin/</b>.`
  );
}
