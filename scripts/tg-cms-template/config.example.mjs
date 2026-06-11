// config.mjs — Cấu hình Bot Telegram CMS
//
// CÁCH DÙNG:
//   1. Copy file này → config.mjs (cùng thư mục)
//   2. Điền TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID vào file .env (xem README)
//   3. Tùy chỉnh commands[], keyboard_rows theo nhu cầu website
//   4. node serve.mjs  (hoặc pm2 start ecosystem.config.cjs)
//

export default {
  // ─── TELEGRAM ──────────────────────────────────────────────────────────────
  // Lấy từ @BotFather (tạo bot mới: /newbot)
  // Chat ID: nhắn bot bất kỳ, rồi vào https://api.telegram.org/bot<TOKEN>/getUpdates
  bot_token: process.env.TELEGRAM_BOT_TOKEN,
  chat_id:   process.env.TELEGRAM_CHAT_ID,

  // ─── IDENTITY ──────────────────────────────────────────────────────────────
  bot_name:  "Bot quản lý nội dung",   // Hiện trong tin nhắn /start
  site_name: "Website của tôi",        // Hiện trong tiêu đề menu

  // ─── INBOX ─────────────────────────────────────────────────────────────────
  // Thư mục lưu tin nhắn nội dung (tương đối so với vị trí config.mjs)
  inbox_dir: "../content-inbox",

  // ─── LỆNH VÀ MẪU ĐIỀN SẴN ─────────────────────────────────────────────────
  // Mỗi lệnh tạo ra:
  //   • 1 nút inline trong menu (label)
  //   • 1 /slash command trong Telegram (command)
  //   • Tap nút → bot gửi mẫu để copy (body + note + hint)
  //
  // === VÍ DỤ: Website bán hàng ===
  commands: [
    {
      command:     "them_san_pham",           // /them_san_pham (chỉ a-z, 0-9, _)
      label:       "➕ Thêm sản phẩm",        // Nhãn nút (≤ 20 ký tự)
      description: "Thêm sản phẩm mới lên website",  // Hiện trong danh sách /commands
      title:       "➕ Thêm sản phẩm mới",   // Tiêu đề trong mẫu
      note:        "Điền vào bên dưới rồi gửi lại. Trường nào chưa có → để trống.",
      body: `[THÊM SẢN PHẨM]
Tên:
Giá:
Mô tả ngắn:
Danh mục:
Tình trạng: (còn hàng / hết hàng)`,
      hint: "📎 Đính kèm ảnh sản phẩm nếu có.",
    },

    {
      command:     "sua_san_pham",
      label:       "✏️ Sửa sản phẩm",
      description: "Cập nhật thông tin sản phẩm",
      title:       "✏️ Sửa sản phẩm",
      note:        "Chỉ điền dòng cần thay đổi, bỏ qua dòng không sửa.",
      body: `[SỬA SẢN PHẨM]
Sản phẩm: <tên hoặc mã>
Giá: <giá mới>
Mô tả: <mô tả mới>
Tình trạng: <còn hàng / hết hàng>`,
      hint: "",
    },

    {
      command:     "xoa_san_pham",
      label:       "🗑️ Xóa sản phẩm",
      description: "Xóa sản phẩm khỏi website",
      title:       "🗑️ Xóa sản phẩm",
      note:        "Em sẽ gửi xác nhận trước khi xóa.",
      body: `[XÓA SẢN PHẨM]
Sản phẩm: <tên hoặc mã>`,
      hint: "",
    },

    {
      command:     "them_bai",
      label:       "📝 Thêm bài viết",
      description: "Đăng bài viết mới lên blog",
      title:       "📝 Thêm bài viết mới",
      note:        "Viết nội dung từ dòng 'Nội dung:' trở đi.",
      body: `[THÊM BÀI VIẾT]
Tiêu đề:
Chuyên mục:
Mô tả ngắn:
Nội dung:
<viết bài tại đây>`,
      hint: "📎 Đính kèm ảnh bìa nếu có.",
    },

    {
      command:     "sua_bai",
      label:       "✏️ Sửa bài viết",
      description: "Sửa nội dung bài viết",
      title:       "✏️ Sửa bài viết",
      note:        "Chỉ điền dòng cần sửa.",
      body: `[SỬA BÀI VIẾT]
Bài: <tiêu đề hoặc slug>
Tiêu đề: <mới>
Mô tả ngắn: <mới>
Nội dung: <mới>`,
      hint: "",
    },

    {
      command:     "xoa_bai",
      label:       "🗑️ Xóa bài viết",
      description: "Xóa bài viết khỏi blog",
      title:       "🗑️ Xóa bài viết",
      note:        "Em sẽ gửi xác nhận trước khi xóa.",
      body: `[XÓA BÀI VIẾT]
Bài: <tiêu đề hoặc slug>`,
      hint: "",
    },
  ],

  // ─── KEYBOARD LAYOUT (tùy chọn) ────────────────────────────────────────────
  // Sắp nút thành hàng theo tên command.
  // Mặc định (null): 2 nút/hàng + hàng cuối "📖 Xem tất cả mẫu".
  //
  // Ví dụ:
  //   keyboard_rows: [
  //     ["them_san_pham", "sua_san_pham", "xoa_san_pham"],
  //     ["them_bai", "sua_bai", "xoa_bai"],
  //   ]
  keyboard_rows: null,

  // ─── HOOK (tùy chọn) ───────────────────────────────────────────────────────
  // Gọi sau khi bot nhận và lưu tin nhắn nội dung vào inbox.
  // Dùng để tích hợp thêm: webhook, ghi DB, trigger CI...
  //
  // Ví dụ:
  //   onContentSaved: async (msg, text, inboxDir) => {
  //     await fetch("https://ci.example.com/webhook", { method: "POST" });
  //   }
  onContentSaved: null,
};
