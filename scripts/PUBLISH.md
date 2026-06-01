# Quy trình đăng dự án / tin tức bán tự động qua Telegram

Chế độ **bán tự động qua Claude**: anh Thọ gửi nội dung qua Telegram, Claude bóc tách
và soạn, gửi bản xem trước kèm nút duyệt; duyệt xong Claude build & deploy.

> ⚠️ Pipeline chỉ chạy khi Claude đang hoạt động (anh trigger hoặc dùng `/loop`).
> Nút duyệt hoạt động qua polling `getUpdates`, không phải webhook real-time.

## Chuẩn bị một lần
1. Tạo bot với @BotFather, lấy `TELEGRAM_BOT_TOKEN`.
2. Nhắn cho bot một tin bất kỳ, rồi lấy `TELEGRAM_CHAT_ID` (chat id của anh Thọ).
3. Điền 2 biến trên vào `.env.local`.
4. Đăng nhập Cloudflare một lần: `pnpm dlx wrangler login`.

## Cách anh Thọ gửi nội dung
Gửi vào bot **văn bản tự do + ảnh**. Càng rõ càng tốt, ví dụ:

```
Dự án mới: The Origin Quận 9
Chủ đầu tư: ABC Group
Vị trí: đường Nguyễn Xiển, Long Thạnh Mỹ, Thủ Đức
Giá: 1PN từ 2.1 tỷ, 2PN từ 3 tỷ
Quy mô: 2 block, 1.500 căn, bàn giao Q4/2027
Pháp lý: đã có giấy phép xây dựng, sổ lâu dài
(kèm 4-5 ảnh phối cảnh)
```

Tin tức cũng vậy: gửi tiêu đề + nội dung + ảnh bìa.

## Các bước Claude thực hiện
1. `pnpm inbox` → kéo tin nhắn + ảnh mới về `content-inbox/<timestamp>/`.
2. Bóc tách `message.txt` → soạn object `Project` (hoặc `Post`) trong `lib/data.ts`.
   - Lưu ảnh vào `public/images/projects/<slug>/` hoặc `public/images/news/<slug>/`.
   - Trường nào không có dữ liệu → bỏ trống / thêm vào `hidden_sections` (KHÔNG bịa).
3. Gửi preview + nút duyệt:
   `pnpm preview "Tóm tắt dự án/tin sắp đăng..."`
4. Chờ quyết định: `pnpm decision 180`
   - `DECISION=approve` → thêm entry vào `lib/data.ts`, chạy `pnpm deploy`, rồi `pnpm notify "Đã lên web: <url>"`.
   - `DECISION=edit` → anh gửi chỉnh sửa qua Telegram, quay lại bước 1.
   - `DECISION=cancel` → bỏ, xóa thư mục staging trong `content-inbox/`.

## Script tham chiếu
| Script | Vai trò |
|---|---|
| `scripts/telegram-inbox.mjs` | Kéo text + ảnh mới, lưu staging, cập nhật offset |
| `scripts/tg-preview.mjs` | Gửi preview kèm nút ✅ Duyệt / ✏️ Sửa / ❌ Hủy |
| `scripts/tg-poll-decision.mjs` | Lắng nghe nút bấm, trả về `DECISION=...` |
| `scripts/notify.mjs` | Gửi thông báo text thường |

> `scripts/.tg-offset.json` lưu vị trí đã đọc — dùng chung cho inbox và decision.
> `content-inbox/` là thư mục tạm, không cần đưa vào sản phẩm cuối.
