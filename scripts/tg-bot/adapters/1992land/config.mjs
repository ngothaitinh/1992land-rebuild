export default {
  repo:          "ngothaitinh/1992land-rebuild",
  deploy_branch: "main",
  bot_name:      "Bot 1992 Land",
  site_name:     "1992land.com",

  // Điền chat IDs vào TELEGRAM_ALLOWED_CHAT_IDS trong .env (comma-separated)
  // Ví dụ: TELEGRAM_ALLOWED_CHAT_IDS=123456789,987654321
  allowed_chat_ids: (process.env.TELEGRAM_ALLOWED_CHAT_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  content_types: {
    project: {
      dir:             "data/projects",
      format:          "json",
      editable_fields: [
        "title", "location", "priceRange", "status", "type", "excerpt",
        "developer", "area", "district", "city",
      ],
    },
    post: {
      dir:             "data/posts",
      format:          "md-frontmatter",
      editable_fields: ["title", "excerpt", "category"],
    },
  },

  commands: [
    { trigger: "[SỬA DỰ ÁN]",  action: "set_field",    content_type: "project" },
    { trigger: "[ẨN PHẦN]",    action: "hide_section", content_type: "project" },
    { trigger: "[HIỆN PHẦN]",  action: "show_section", content_type: "project" },
    { trigger: "[XÓA DỰ ÁN]", action: "delete",       content_type: "project" },
    { trigger: "[SỬA BÀI]",   action: "set_field",    content_type: "post"    },
    { trigger: "[XÓA BÀI]",   action: "delete",       content_type: "post"    },
    { trigger: "[THÊM DỰ ÁN]",action: "inbox",        content_type: "project" },
    { trigger: "[THÊM BÀI]",  action: "inbox",        content_type: "post"    },
  ],

  keyboard_rows: [
    ["[SỬA DỰ ÁN]",  "[ẨN PHẦN]",    "[HIỆN PHẦN]"],
    ["[XÓA DỰ ÁN]",  "[SỬA BÀI]",    "[XÓA BÀI]"],
    ["[THÊM DỰ ÁN]", "[THÊM BÀI]"],
  ],
};
