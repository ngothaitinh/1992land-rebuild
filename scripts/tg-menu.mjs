// scripts/tg-menu.mjs
// Gửi bộ MẪU ĐIỀN SẴN vào Telegram để anh Thọ copy — mỗi mẫu một tin <pre> dễ chạm-giữ-copy.
// Chạy khi anh nhắn "menu" / "mẫu" / "help", hoặc gửi onboarding một lần.
//
//   node scripts/tg-menu.mjs
//
import https from "https";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TOKEN || !CHAT_ID) {
  console.error("Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID");
  process.exit(1);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pre = (s) => `<pre>${esc(s)}</pre>`;

const intro =
  "📋 <b>Bộ mẫu quản lý nội dung 1992 Land</b>\n\n" +
  "Anh chỉ cần <b>copy mẫu phù hợp</b>, điền vào chỗ trống rồi gửi lại cho bot. " +
  "Em sẽ soạn, gửi <b>bản xem trước kèm nút ✅ Duyệt</b>, anh duyệt là tự lên web (~8 phút).\n\n" +
  "Gửi <b>menu</b> bất cứ lúc nào để nhận lại bộ mẫu này.";

const templates = [
  [
    "➕ Thêm dự án mới",
    `[THÊM DỰ ÁN]
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
Điểm nổi bật:
(kèm 1 ảnh bìa + 3–5 ảnh)`,
  ],
  [
    "✏️ Sửa thông tin dự án",
    `[SỬA DỰ ÁN]
Dự án: <tên hoặc slug>
Giá: <giá mới>
Trạng thái: <vd: Đã bàn giao>
(mỗi dòng 1 trường cần đổi)`,
  ],
  [
    "🗑️ Xóa dự án",
    `[XÓA DỰ ÁN]
Dự án: <tên hoặc slug>`,
  ],
  [
    "🙈 Ẩn / hiện một phần của dự án",
    `[ẨN PHẦN]
Dự án: <tên>
Phần: giá bán
(các phần: tổng quan / giá bán / chính sách / vị trí / tiện ích / điểm nổi bật / pháp lý)

[HIỆN PHẦN]
Dự án: <tên>
Phần: giá bán`,
  ],
  [
    "📝 Thêm bài viết mới",
    `[THÊM BÀI VIẾT]
Tiêu đề:
Chuyên mục: (Thị trường / Kinh nghiệm / Pháp lý / Đầu tư)
Mô tả ngắn:
Nội dung:
<thân bài, có thể nhiều đoạn>
(kèm ảnh bìa nếu có)`,
  ],
  [
    "✏️ Sửa bài viết",
    `[SỬA BÀI VIẾT]
Bài: <tiêu đề hoặc slug>
Tiêu đề: <mới>
Mô tả ngắn: <mới>
Nội dung: <mới>
(chỉ điền dòng cần đổi)`,
  ],
  [
    "🗑️ Xóa bài viết",
    `[XÓA BÀI VIẾT]
Bài: <tiêu đề hoặc slug>`,
  ],
];

function send(text, parseMode = "HTML") {
  const body = JSON.stringify({
    chat_id: CHAT_ID,
    text,
    parse_mode: parseMode,
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

async function main() {
  await send(intro);
  for (const [title, tpl] of templates) {
    await send(`<b>${esc(title)}</b>\n${pre(tpl)}`);
  }
  console.log(`✅ Đã gửi ${templates.length} mẫu + lời giới thiệu vào Telegram.`);
}

main().catch((e) => {
  console.error("Lỗi:", e.message);
  process.exit(1);
});
