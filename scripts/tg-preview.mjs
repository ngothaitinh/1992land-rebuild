// scripts/tg-preview.mjs
// Gửi bản xem trước (preview) kèm nút duyệt vào Telegram.
//
//   node scripts/tg-preview.mjs "Nội dung preview..."
//
// In ra message_id để bước poll quyết định dùng lại nếu cần.
import https from "https";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const text = process.argv[2] || "Xem trước nội dung sắp đăng:";

if (!TOKEN || !CHAT_ID) {
  console.error("Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID");
  process.exit(1);
}

const payload = {
  chat_id: CHAT_ID,
  text,
  parse_mode: "HTML",
  disable_web_page_preview: true,
  reply_markup: {
    inline_keyboard: [
      [
        { text: "✅ Duyệt", callback_data: "approve" },
        { text: "✏️ Sửa", callback_data: "edit" },
        { text: "❌ Hủy", callback_data: "cancel" },
      ],
    ],
  },
};

const body = JSON.stringify(payload);
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
      if (j.ok) console.log("Đã gửi preview. message_id =", j.result.message_id);
      else console.error("Lỗi:", j.description);
    });
  }
);
req.on("error", (e) => console.error("Lỗi:", e.message));
req.write(body);
req.end();
