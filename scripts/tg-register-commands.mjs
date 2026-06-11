// scripts/tg-register-commands.mjs
// Đăng ký danh sách lệnh bot với Telegram (chạy 1 lần — hoặc khi thêm lệnh mới).
// Sau khi chạy, anh Thọ gõ "/" trong chat sẽ thấy menu lệnh gọn.
//
//   node scripts/tg-register-commands.mjs
//
import https from "https";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) { console.error("Thiếu TELEGRAM_BOT_TOKEN"); process.exit(1); }

const commands = [
  { command: "menu",        description: "📋 Xem tất cả mẫu điền sẵn" },
  { command: "them_du_an",  description: "➕ Thêm dự án mới lên website" },
  { command: "sua_du_an",   description: "✏️  Sửa thông tin / giá / trạng thái dự án" },
  { command: "xoa_du_an",   description: "🗑️  Xóa dự án khỏi website" },
  { command: "an_phan",     description: "🙈 Ẩn hoặc hiện một phần của dự án" },
  { command: "them_bai",    description: "📝 Thêm bài viết mới" },
  { command: "sua_bai",     description: "✏️  Sửa tiêu đề / nội dung bài viết" },
  { command: "xoa_bai",     description: "🗑️  Xóa bài viết" },
];

function api(method, params) {
  const body = JSON.stringify(params);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${TOKEN}/${method}`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try { const j = JSON.parse(d); j.ok ? resolve(j) : reject(new Error(j.description)); }
          catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  await api("setMyCommands", { commands });
  console.log(`✅ Đã đăng ký ${commands.length} lệnh với Telegram.`);
  console.log("   Anh Thọ gõ / trong chat là thấy menu ngay.");
  commands.forEach(c => console.log(`   /${c.command.padEnd(14)} — ${c.description}`));
}

main().catch(e => { console.error("Lỗi:", e.message); process.exit(1); });
