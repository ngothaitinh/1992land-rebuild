# Tinh gọn điều hướng bot Telegram — Design

**Ngày:** 2026-07-18
**Trạng thái:** Đã duyệt (chờ review spec)
**Bối cảnh:** Bot Telegram quản lý web 1992land.com đã chạy 24/7 trên VPS, điều khiển bằng nút.
Người dùng chính (anh Thọ) thấy **quá nhiều bước/nút** và **menu/lệnh rối mắt**. Yêu cầu: gom gọn, dễ xài.

Đây là **tinh gọn điều hướng tầng trên**, KHÔNG làm lại logic thêm/sửa/xoá nội dung.

---

## Vấn đề hiện tại

- Menu ☰ của Telegram đăng ký **8 slash-command** (`/menu`, `/themduan`, `/thembai`, `/sua`, `/anhien`, `/xoa`, `/huy`, `/trogiup`) → danh sách dài, rối.
- Điều hướng theo **việc trước, mục sau**: mỗi thao tác (sửa / ẩn-hiện / xoá) phải chọn việc rồi **tìm lại cùng một mục từ đầu**. Muốn sửa Maia rồi ẩn 1 phần của Maia = tìm Maia 2 lần.
- Menu chính ~7 nút.

## Nguyên tắc thiết kế

1. **Mục trước, việc sau** — chọn 1 dự án/bài một lần, rồi làm mọi thao tác trên nó tại chỗ.
2. **Menu ☰ tối giản** — chỉ `/menu`.
3. **Không cần nhớ lệnh gõ** — thoát giữa chừng bằng nút, không phải gõ `/huy`.
4. **Bảng thao tác dựng theo config** — nút nào hiện tùy loại nội dung hỗ trợ (đọc `content_types`), không hard-code.

---

## A. Cấu trúc điều hướng mới (3 tầng)

### Tầng 1 — Menu chính (`/menu`, `/start`)
```
[📂 Dự án] [📂 Bài viết]
[💬 Hỏi trợ lý] [❓ Hướng dẫn]
```

### Tầng 2 — Danh sách theo loại
Bấm `[📂 Dự án]`:
```
[➕ Thêm dự án mới]
[Maia Hồ Tràm]
[Blanca City]
[Izumi Park]
… (12 dự án, cuộn)
[⬅️ Quay lại]
```
Bấm `[📂 Bài viết]`: tương tự với `[➕ Thêm bài viết mới]` + 10 bài.

- Nút "Thêm mới" nằm ở **đầu danh sách** (không ở menu chính).
- Danh sách liệt kê thẳng, không phân trang, không cần gõ tìm. Người dùng cuộn chọn.

### Tầng 3 — Bảng thao tác 1 mục
Chọn "Maia Hồ Tràm":
```
─ MAIA HỒ TRÀM ─
[✏️ Sửa thông tin]
[🙈 Ẩn / hiện phần]     ← chỉ hiện với DỰ ÁN (có sections)
[🗑 Xoá]
[⬅️ Quay lại]
```
Chọn 1 **bài viết**: bảng **không có** `[🙈 Ẩn / hiện phần]` (bài không có sections).

Bảng dựng động: với mỗi content_type, nút xuất hiện khi config hỗ trợ action tương ứng:
- `✏️ Sửa thông tin` — khi `editable_fields.length > 0`
- `🙈 Ẩn / hiện phần` — khi có `sections`
- `🗑 Xoá` — luôn có

Bấm 1 nút thao tác → vào **wizard hiện có** (giữ nguyên), nhưng đã biết sẵn slug nên **bỏ được bước "tìm/chọn mục"** trong wizard cũ.

---

## B. Menu ☰ và thoát giữa chừng

- `slash_commands` trong config rút còn **1 lệnh**: `/menu`. `register-commands.mjs` chạy lại đăng ký `/start` + `/menu`.
- 7 lệnh cũ (`/themduan`, `/thembai`, `/sua`, `/anhien`, `/xoa`, `/huy`, `/trogiup`) **bỏ khỏi ☰**.
- `/huy` gõ tay **vẫn hoạt động ngầm** (route `cancel` giữ trong serve.mjs) cho người quen — chỉ không hiện trên menu.
- Mọi prompt wizard (chờ dán nội dung, chờ gõ giá trị mới, xác nhận…) thêm nút **`[❌ Thoát]`** (callback `m:cancel`) — bấm là hủy thao tác đang làm, quay về menu chính.

---

## C. Giữ nguyên — ngoài phạm vi

- Wizard sửa từng field (chọn field → gõ giá trị → xác nhận).
- Nút **↩️ Hoàn tác** 30 phút sau mỗi thay đổi.
- **💬 Hỏi trợ lý** (AI).
- Cú pháp gõ tay `[SỬA DỰ ÁN]…` — vẫn chạy ngầm, ẩn khỏi menu.
- Toàn bộ logic commit GitHub, deploy, idempotency, undo.

---

## Phạm vi thay đổi code

| File | Thay đổi |
|------|----------|
| `engine/menu.mjs` | Dựng lại 3 tầng menu: `buildMainMenu` (chỉ Dự án/Bài + Hỏi/Hướng dẫn), thêm `buildListMenu(cfg, type)` (danh sách item + nút Thêm mới), thêm `buildItemMenu(cfg, type, slug)` (bảng thao tác 1 mục). Cập nhật `welcomeText`/`helpText`. |
| `engine/serve.mjs` | Định tuyến callback mới: `m:list:<type>`, `m:item:<type>:<slug>`, `m:act:<action>:<type>:<slug>`, `m:cancel`. Thêm `[❌ Thoát]` vào các prompt wizard. Truyền slug đã biết vào wizard để bỏ bước chọn mục. |
| `adapters/1992land/config.mjs` | `slash_commands` còn `/menu`. Nhãn nút nếu cần. |
| `engine/register-commands.mjs` | Không đổi logic; chạy lại để cập nhật ☰. |
| `scripts/tg-bot/tests/menu.test.mjs` | Cập nhật theo cấu trúc menu mới. |
| `scripts/tg-bot/tests/callback-routing.test.mjs` | Cập nhật theo callback_data mới. |

**Cần đọc engine để xác nhận:** cách wizard hiện lấy danh sách item (đọc thư mục `data/projects`, `data/posts`), cách session lưu action đang chọn, để nối slug đã biết vào wizard mà không phá idempotency/undo. Làm rõ ở bước writing-plans.

---

## Success criteria

1. `/menu` → menu chính 4 nút. Menu ☰ chỉ hiện `/start` + `/menu`.
2. `[📂 Dự án]` → danh sách 12 dự án + `[➕ Thêm dự án mới]` đầu danh sách.
3. Chọn 1 dự án → bảng có Sửa / Ẩn-hiện / Xoá / Quay lại. Chọn 1 bài → bảng KHÔNG có Ẩn-hiện.
4. Từ bảng 1 mục, bấm Sửa → vào wizard sửa mà **không phải tìm lại mục** (slug đã biết).
5. Mọi prompt wizard có nút `[❌ Thoát]`, bấm là về menu chính.
6. Hoàn tác, Hỏi trợ lý, cú pháp gõ tay `[…]`, `/huy` gõ tay — vẫn chạy như cũ.
7. Người ngoài whitelist chat_id — vẫn bị chặn (không đổi).
