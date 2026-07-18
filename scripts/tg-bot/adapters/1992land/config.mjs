export default {
  repo:          "ngothaitinh/1992land-rebuild",
  // DEPLOY_BRANCH cho phép trỏ sang branch nháp khi kiểm thử, không đụng main.
  deploy_branch: process.env.DEPLOY_BRANCH || "main",
  bot_name:      "Bot 1992 Land",
  site_name:     "1992land.com",

  // Điền chat IDs vào TELEGRAM_ALLOWED_CHAT_IDS trong .env (comma-separated)
  // Ví dụ: TELEGRAM_ALLOWED_CHAT_IDS=123456789,987654321
  allowed_chat_ids: (process.env.TELEGRAM_ALLOWED_CHAT_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  // Nhãn nút menu tầng 1, theo việc người dùng muốn làm.
  action_labels: {
    add:            "Thêm",
    set_field:      "✏️ Sửa nội dung",
    toggle_section: "🙈 Ẩn / hiện phần",
    delete:         "🗑 Xoá nội dung",
  },

  // Nhãn tiếng Việt cho nút chọn trường trong wizard sửa (không hard-code trong engine).
  // Key = tên field thật trong editable_fields; value = nhãn hiển thị trên nút.
  field_labels: {
    title:      "Tiêu đề",
    location:   "Vị trí",
    priceRange: "Giá",
    status:     "Trạng thái",
    type:       "Loại hình",
    excerpt:    "Mô tả ngắn",
    developer:  "Chủ đầu tư",
    area:       "Diện tích",
    district:   "Quận/Huyện",
    city:       "Tỉnh/Thành",
    category:   "Chuyên mục",
  },

  content_types: {
    project: {
      label:      "dự án",
      add_button: "🏢 Thêm dự án",
      add_mode:   "await_project",
      dir:             "data/projects",
      format:          "json",
      editable_fields: [
        "title", "location", "priceRange", "status", "type", "excerpt",
        "developer", "area", "district", "city",
      ],
      // Id phải khớp app/du-an/[slug]/page.tsx — sai id thì web không ẩn gì cả.
      sections: {
        "tong-quan":   "Tổng quan",
        "vi-tri":      "Vị trí",
        "tien-ich":    "Tiện ích",
        "mat-bang":    "Mặt bằng",
        "gia-ban":     "Giá bán",
        "phap-ly":     "Pháp lý",
        "chinh-sach":  "Chính sách",
        "dang-ky":     "Đăng ký",
      },
    },
    post: {
      label:      "bài viết",
      add_button: "📝 Thêm bài viết",
      add_mode:   "await_post",
      dir:             "data/posts",
      format:          "md-frontmatter",
      editable_fields: ["title", "excerpt", "category"],
    },
  },

  // Menu ☰ chỉ hiện /menu. /huy giữ để gõ tay (hidden — không đăng ký hiển thị).
  slash_commands: [
    { command: "menu", description: "Mở menu thao tác",       route: "menu" },
    { command: "huy",  description: "Thoát thao tác đang làm", route: "cancel", hidden: true },
  ],

  // Cú pháp gõ tay [..] — giữ cho người quen, không còn hiện trên menu.
  commands: [
    { trigger: "[SỬA DỰ ÁN]",  action: "set_field",      content_type: "project" },
    { trigger: "[ẨN PHẦN]",    action: "toggle_section", content_type: "project" },
    { trigger: "[XÓA DỰ ÁN]", action: "delete",         content_type: "project" },
    { trigger: "[SỬA BÀI]",   action: "set_field",      content_type: "post"    },
    { trigger: "[XÓA BÀI]",   action: "delete",         content_type: "post"    },
  ],

  publish: {
    post: {
      dir:        "data/posts",
      image_path: (slug) => `public/images/news/${slug}.jpg`,
      web_image:  (slug) => `/images/news/${slug}.jpg`,
    },
    project: {
      dir:        "data/projects",
      image_path: (slug) => `public/images/projects/${slug}/hero.jpg`,
      web_image:  (slug) => `/images/projects/${slug}/hero.jpg`,
    },
  },
};
