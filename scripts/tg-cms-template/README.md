# Telegram CMS Bot — Framework

Bot Telegram nhẹ, không phụ thuộc, quản lý nội dung website qua chat.
Stack-agnostic: chạy được với bất kỳ website nào (Next.js, WordPress, plain HTML, v.v.)

---

## Tính năng

- **Menu inline keyboard** — tap nút → nhận mẫu điền sẵn để copy
- **Native /commands** — gõ `/` trong Telegram xem danh sách lệnh
- **Lưu inbox** — tin nhắn nội dung lưu vào `content-inbox/` kèm ảnh
- **Config-driven** — toàn bộ nội dung tùy chỉnh trong 1 file `config.mjs`
- **Không phụ thuộc** — chỉ dùng Node.js built-in (`https`, `fs`, `path`)
- **PM2 ready** — `ecosystem.config.cjs` có sẵn để chạy 24/7 trên VPS

---

## Cấu trúc

```
tg-cms/
├── config.example.mjs   ← COPY sang config.mjs, chỉ cần đổi file này
├── serve.mjs            ← Bot server (không cần sửa)
├── notify.mjs           ← Gửi thông báo Telegram
├── register-commands.mjs← Đăng ký /slash commands (chạy 1 lần)
├── ecosystem.config.cjs ← PM2 config
├── setup-vps.sh         ← Script cài VPS tự động
└── HUONG-DAN-USER.md   ← Hướng dẫn cho user không biết lập trình
```

---

## Quick Start (5 bước)

### 1. Tạo bot Telegram

1. Mở [@BotFather](https://t.me/BotFather) → `/newbot`
2. Đặt tên và username → nhận **bot token**
3. Nhắn bot bất kỳ nội dung → vào `https://api.telegram.org/bot<TOKEN>/getUpdates` → lấy **chat ID** (trường `message.chat.id`)

### 2. Copy framework vào project

```bash
cp -r tg-cms-template/ my-project/tg-cms/
cd my-project/tg-cms/
```

### 3. Tạo config.mjs

```bash
cp config.example.mjs config.mjs
```

Tạo file `.env` cùng thư mục:
```
TELEGRAM_BOT_TOKEN=7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID=123456789
```

Mở `config.mjs`, chỉnh `bot_name`, `site_name`, và `commands[]` theo website của bạn.

### 4. Chạy bot

```bash
# Load .env (macOS/Linux)
export $(cat .env | xargs)

# Chạy
node serve.mjs
```

### 5. Đăng ký lệnh Telegram (chạy 1 lần)

```bash
node register-commands.mjs
```

Sau đó gõ `/start` trong chat với bot để kiểm tra.

---

## Cấu hình commands[]

Mỗi command trong `config.mjs` tạo ra 1 nút menu + 1 `/slash command`:

```js
{
  command:     "ten_lenh",       // /ten_lenh (chỉ a-z, 0-9, _)
  label:       "➕ Tên nút",    // Nhãn nút (≤ 20 ký tự)
  description: "Mô tả ngắn",    // Hiện trong danh sách /commands
  title:       "➕ Tiêu đề mẫu",// Tiêu đề trong tin nhắn mẫu
  note:        "Hướng dẫn ngắn",// In nghiêng bên trên mẫu
  body: `[TEN LENH]
Trường 1:
Trường 2:`,                      // Mẫu điền sẵn (trong <pre>)
  hint: "Ghi chú bên dưới mẫu", // In nghiêng bên dưới mẫu
}
```

### Keyboard layout tùy chỉnh

Mặc định: 2 nút/hàng. Để tùy chỉnh:

```js
keyboard_rows: [
  ["them_san_pham", "sua_san_pham", "xoa_san_pham"],
  ["them_bai", "sua_bai", "xoa_bai"],
]
```

---

## Chạy 24/7 trên VPS

### Tự động (khuyến nghị)

```bash
# SSH vào VPS, rồi chạy:
bash setup-vps.sh
```

### Thủ công

```bash
# Cài PM2
npm install -g pm2

# Tạo .env trong thư mục tg-cms/
echo "TELEGRAM_BOT_TOKEN=..." > .env
echo "TELEGRAM_CHAT_ID=..."  >> .env

# Khởi động
pm2 start ecosystem.config.cjs

# Tự khởi động khi reboot
pm2 save && pm2 startup
```

---

## Gửi thông báo từ code

Sau khi xử lý xong (deploy, cập nhật DB…), thông báo lại cho user:

```bash
node notify.mjs "✅ Xong: Đã thêm sản phẩm 'Áo polo' lên website"
```

Hoặc từ trong code:

```js
import { execSync } from "child_process";
execSync(`node tg-cms/notify.mjs "✅ Deploy xong lúc ${new Date().toLocaleTimeString('vi-VN')}"`);
```

---

## Hook onContentSaved

Dùng để trigger thêm sau khi bot nhận tin nhắn:

```js
// config.mjs
onContentSaved: async (msg, text, inboxDir) => {
  // Ví dụ: gọi webhook CI/CD
  await fetch("https://api.example.com/webhook/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, inboxDir }),
  });
}
```

---

## Cấu trúc inbox

Mỗi tin nhắn nội dung lưu vào:

```
content-inbox/
└── 2026-06-11T08-30-00-000Z/
    ├── message.txt   ← nội dung text
    ├── img-1.jpg     ← ảnh đính kèm (nếu có)
    └── img-2.jpg
```

Developer/Claude đọc inbox này để xử lý.

---

## Yêu cầu

- **Node.js ≥ 18** (dùng ESM top-level await)
- Không cần cài thêm npm package nào

---

## Áp dụng vào project mới

```bash
# 1. Copy toàn bộ thư mục
cp -r scripts/tg-cms-template/ /path/to/new-project/tg-cms/

# 2. Tạo config
cd /path/to/new-project/tg-cms/
cp config.example.mjs config.mjs

# 3. Điền .env
cat > .env << EOF
TELEGRAM_BOT_TOKEN=<token>
TELEGRAM_CHAT_ID=<chat_id>
EOF

# 4. Chỉnh commands[] trong config.mjs

# 5. Chạy
node serve.mjs
```

Chỉ cần sửa `config.mjs` — toàn bộ code còn lại dùng nguyên, không đổi.

---

*Framework này được tạo từ dự án 1992land-rebuild.*
