// scripts/tg-menu.mjs
// Gửi mẫu điền sẵn vào Telegram.
//
//   node scripts/tg-menu.mjs              → index compact (danh sách lệnh)
//   node scripts/tg-menu.mjs them_du_an   → mẫu [THÊM DỰ ÁN]
//   node scripts/tg-menu.mjs sua_du_an    → mẫu [SỬA DỰ ÁN]
//   node scripts/tg-menu.mjs all          → gửi toàn bộ mẫu (onboarding)
//
import https from "https";
import { fileURLToPath } from "url";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pre = (s) => `<pre>${esc(s)}</pre>`;

// ─── Kho mẫu ────────────────────────────────────────────────────────────────

export const TEMPLATES = {
  them_du_an: {
    title: "➕ Thêm dự án mới",
    note: "Điền vào bên dưới rồi gửi lại. Trường nào chưa có → để trống, đừng xóa dòng.",
    body: `[THÊM DỰ ÁN]
Tên:
Chủ đầu tư:
Vị trí:
Loại hình: (căn hộ / biệt thự / đất nền / nhà phố / nghỉ dưỡng / phức hợp)
Tỉnh: (TP.HCM / Vũng Tàu / Bình Dương / Long An / Đồng Nai)
Giá:
Quy mô:
Pháp lý:
Bàn giao:
Tiện ích:
Điểm nổi bật:`,
    hint: "📎 Đính kèm 1 ảnh bìa + 3–5 ảnh trong cùng tin nhắn.",
  },

  sua_du_an: {
    title: "✏️ Sửa thông tin dự án",
    note: "Chỉ ghi những dòng cần đổi — bỏ dòng không cần sửa.",
    body: `[SỬA DỰ ÁN]
Dự án: <tên hoặc slug, vd: Salacia Villas>
Giá: <giá mới, vd: Từ 4.5 tỷ>
Trạng thái: <vd: Đã bàn giao>
Bàn giao: <vd: Q1/2026>`,
    hint: "",
  },

  xoa_du_an: {
    title: "🗑️ Xóa dự án",
    note: "Xóa vĩnh viễn khỏi website. Em sẽ gửi bản xem trước để anh xác nhận.",
    body: `[XÓA DỰ ÁN]
Dự án: <tên hoặc slug>`,
    hint: "",
  },

  an_phan: {
    title: "🙈 Ẩn / Hiện một phần dự án",
    note: "Dùng [ẨN PHẦN] để tắt, [HIỆN PHẦN] để bật lại.",
    body: `[ẨN PHẦN]
Dự án: <tên>
Phần: <tên phần>

[HIỆN PHẦN]
Dự án: <tên>
Phần: <tên phần>`,
    hint: "Các phần: tổng quan · giá bán · chính sách · vị trí · tiện ích · điểm nổi bật · pháp lý",
  },

  them_bai: {
    title: "📝 Thêm bài viết mới",
    note: "Nội dung viết liền từ dòng 'Nội dung:' trở đi, có thể nhiều đoạn.",
    body: `[THÊM BÀI VIẾT]
Tiêu đề:
Chuyên mục: (Thị trường / Kinh nghiệm / Pháp lý / Đầu tư)
Mô tả ngắn:
Nội dung:
<viết nội dung bài tại đây>`,
    hint: "📎 Đính kèm ảnh bìa nếu có.",
  },

  sua_bai: {
    title: "✏️ Sửa bài viết",
    note: "Chỉ ghi những dòng cần đổi.",
    body: `[SỬA BÀI VIẾT]
Bài: <tiêu đề hoặc slug>
Tiêu đề: <mới>
Mô tả ngắn: <mới>
Nội dung: <mới>`,
    hint: "",
  },

  xoa_bai: {
    title: "🗑️ Xóa bài viết",
    note: "Xóa vĩnh viễn. Em sẽ xác nhận trước khi thực hiện.",
    body: `[XÓA BÀI VIẾT]
Bài: <tiêu đề hoặc slug>`,
    hint: "",
  },
};

// ─── Tin nhắn index compact ──────────────────────────────────────────────────

const INDEX_MSG =
  "📋 <b>Bot quản lý nội dung 1992 Land</b>\n\n" +
  "Gõ <code>/</code> để xem menu lệnh. Chọn lệnh → bot gửi mẫu để copy.\n\n" +
  "<b>Dự án</b>\n" +
  "/them_du_an · /sua_du_an · /xoa_du_an · /an_phan\n\n" +
  "<b>Bài viết</b>\n" +
  "/them_bai · /sua_bai · /xoa_bai\n\n" +
  "Gõ /menu bất cứ lúc nào để xem lại danh sách này.";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function send(text) {
  const body = JSON.stringify({
    chat_id: CHAT_ID,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${TOKEN}/sendMessage`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          const j = JSON.parse(d);
          j.ok ? resolve() : reject(new Error(j.description));
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export function buildTemplateMsg({ title, note, body, hint }) {
  const parts = [`<b>${esc(title)}</b>`];
  if (note) parts.push(`<i>${esc(note)}</i>`);
  parts.push(pre(body));
  if (hint) parts.push(`<i>${esc(hint)}</i>`);
  return parts.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!TOKEN || !CHAT_ID) { console.error("Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID"); process.exit(1); }
  const arg = process.argv[2] || "";
  const key = arg.toLowerCase().replace(/^\//, "");

  if (!key || key === "menu" || key === "index") {
    await send(INDEX_MSG);
    console.log("✅ Đã gửi index menu.");
    return;
  }

  if (key === "all") {
    await send(INDEX_MSG);
    for (const [k, tpl] of Object.entries(TEMPLATES)) {
      await send(buildTemplateMsg(tpl));
    }
    console.log(`✅ Đã gửi toàn bộ ${Object.keys(TEMPLATES).length} mẫu.`);
    return;
  }

  if (TEMPLATES[key]) {
    await send(buildTemplateMsg(TEMPLATES[key]));
    console.log(`✅ Đã gửi mẫu: ${key}`);
    return;
  }

  console.error(`Lệnh không hợp lệ: "${key}". Dùng: ${Object.keys(TEMPLATES).join(" | ")} | all`);
  process.exit(1);
}

// Chỉ chạy khi gọi trực tiếp (không chạy khi import)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error("Lỗi:", e.message); process.exit(1); });
}
