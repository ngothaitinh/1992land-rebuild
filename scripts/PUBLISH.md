# Quy trình đăng dự án / tin tức bán tự động qua Telegram

Chế độ **bán tự động qua Claude**: anh Thọ gửi nội dung qua Telegram, Claude bóc tách
và soạn, gửi bản xem trước kèm nút duyệt; duyệt xong Claude build & deploy.

> 📖 **Tài liệu cho anh Thọ:** xem `scripts/HUONG-DAN-TELEGRAM.md` (mẫu điền sẵn + hướng dẫn).

> ⚠️ Pipeline chỉ chạy khi Claude đang hoạt động (anh trigger hoặc dùng `/loop`).
> Nút duyệt hoạt động qua polling `getUpdates`, không phải webhook real-time.

## Các lệnh anh Thọ gửi (dòng đầu trong [NGOẶC VUÔNG])

| Mẫu | Intent (`tg-process-inbox`) | Claude xử lý |
|---|---|---|
| `[THÊM DỰ ÁN]` | `new_project` | Soạn `data/projects/<slug>.json` + lưu ảnh |
| `[SỬA DỰ ÁN]` | `update_project` | `set_field` (đơn giản) hoặc soạn tay (giàu nội dung) |
| `[XÓA DỰ ÁN]` | `delete_project` | `tg-apply-change delete_project <slug>` |
| `[ẨN PHẦN]` / `[HIỆN PHẦN]` | `hide_section` / `show_section` | `tg-apply-change hide_section\|show_section <slug> <key>` |
| `[THÊM BÀI VIẾT]` | `new_post` | Soạn `data/posts/<slug>.md` |
| `[SỬA BÀI VIẾT]` | `update_post` | Sửa frontmatter/body |
| `[XÓA BÀI VIẾT]` | `delete_post` | `tg-apply-change delete_post <slug>` |
| `menu` / `mẫu` / `help` | `menu` | `pnpm menu` → gửi lại bộ mẫu |

> Không có `[NGOẶC VUÔNG]` → rơi về nhận diện keyword (chat tự do), Claude tự hiểu.
> Nội dung **giàu** (dự án/bài mới, `descriptions`, `product_types`) → Claude soạn tay (không parse bằng regex).
> Thao tác **đơn giản, tất định** (xóa, ẩn/hiện, set 1 trường) → dùng `scripts/tg-apply-change.mjs` (mặc định xem trước, `--apply` mới ghi).

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
| `scripts/tg-process-inbox.mjs` | Nhận diện intent + slug + fields từ tin nhắn (gồm lệnh `[NGOẶC VUÔNG]`) |
| `scripts/tg-apply-change.mjs` | Áp dụng thao tác tất định (xóa, ẩn/hiện, set 1 trường); mặc định xem trước, `--apply` mới ghi |
| `scripts/tg-menu.mjs` | Gửi bộ mẫu điền sẵn vào Telegram (`pnpm menu`) |
| `scripts/tg-preview.mjs` | Gửi preview kèm nút ✅ Duyệt / ✏️ Sửa / ❌ Hủy |
| `scripts/tg-poll-decision.mjs` | Lắng nghe nút bấm, trả về `DECISION=...` |
| `scripts/notify.mjs` | Gửi thông báo text thường |

> `scripts/.tg-offset.json` lưu vị trí đã đọc — dùng chung cho inbox và decision.
> `content-inbox/` là thư mục tạm, không cần đưa vào sản phẩm cuối.
