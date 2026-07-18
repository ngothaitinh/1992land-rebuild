# Slice 2 — Bot Telegram sửa dự án theo mục

**Ngày:** 2026-07-18
**Thuộc:** `2026-07-18-project-section-editing-overview.md` (Slice 2/3)
**Phụ thuộc:** Slice 1 (field `videos` + render video đã có trên web).
**Mục tiêu:** Nút "✏️ Sửa thông tin" của bot chuyển từ danh sách field phẳng sang **danh sách mục giống trang dự án**; trong mỗi mục sửa được **đoạn giới thiệu (chữ), ảnh, và link video**.

## Kết quả cuối
Bot: chọn dự án → `✏️ Sửa thông tin` → hiện **danh sách mục**:
`ℹ️ Thông tin cơ bản` · `📄 Tổng quan` · `📍 Vị trí` · `🌳 Tiện ích` · `💰 Giá bán` · `⚖️ Pháp lý` · `📋 Chính sách`
→ chọn 1 mục nội dung → bảng con:
`📝 Sửa đoạn giới thiệu` · `🖼 Đổi ảnh` (chỉ mục có ảnh) · `🎬 Dán link video` · `⬅️ Quay lại`.
Mục `ℹ️ Thông tin cơ bản` → giữ nguyên luồng field hiện tại (tiêu đề, giá, chủ đầu tư…).

## Mô hình cấu hình (config.mjs)

Thêm khai báo **section-map** cho project trong `content_types.project`:
```js
edit_sections: [
  { id: "basic",       label: "ℹ️ Thông tin cơ bản", fields: [...editable_fields hiện tại] },
  { id: "tong-quan",   label: "📄 Tổng quan",  desc_key: "tong-quan",  image_field: "overview_image",   video: true },
  { id: "vi-tri",      label: "📍 Vị trí",     desc_key: "vi-tri",     image_field: "location_image",   video: true },
  { id: "tien-ich",    label: "🌳 Tiện ích",   desc_key: "tien-ich",   image_field: "amenities_images", image_list: true, video: true },
  { id: "gia-ban",     label: "💰 Giá bán",    desc_key: "gia-ban",    video: true },
  { id: "phap-ly",     label: "⚖️ Pháp lý",    desc_key: "phap-ly",    video: true },
  { id: "chinh-sach",  label: "📋 Chính sách", desc_key: "chinh-sach", video: true },
],
```
- `desc_key` → ghi `descriptions[desc_key]`.
- `image_field` → field ảnh của mục (bỏ trống nếu mục không có ảnh minh hoạ đơn). `image_list: true` = field là mảng (`amenities_images`) → thêm nối vào cuối.
- `video: true` → cho dán link video (ghi `videos[id]`).
- `basic` đặc biệt: dùng `fields` (danh sách editable_fields cũ), không có desc/image/video.

Giữ nguyên `editable_fields`, `field_labels`, `sections` (ẩn/hiện) đang có.

## Điều hướng & callback (serve.mjs)

Nhánh `m:act:e:<ct>:<slug>` (Sửa thông tin) hiện đang mở `buildFieldKeyboard`. Đổi thành:
- **project** → mở **bảng chọn mục** `buildEditSectionMenu(cfg, slug)` (mới).
- **post** → giữ `buildFieldKeyboard` như cũ (bài viết không có mục).

Callback mới (đều ≤ 64 byte — dùng id mục ngắn):
| Callback | Ý nghĩa |
|---|---|
| `es:<slug>` | mở bảng chọn mục sửa (từ `m:act:e:project:<slug>`) — hoặc tái dùng chính `m:act:e:` và phân nhánh theo content_type |
| `esec:<sid>:<slug>` | chọn 1 mục → bảng con thao tác của mục |
| `edesc:<sid>:<slug>` | sửa đoạn giới thiệu mục |
| `eimg:<sid>:<slug>` | đổi/thêm ảnh mục |
| `evid:<sid>:<slug>` | dán link video mục |

> Kiểm 64 byte: slug dài nhất 37 ký tự → `edesc:diem-noi-bat:<slug>` ≈ 56 byte. An toàn. Test phải phủ.

`basic` khi chọn → mở `buildFieldKeyboard` (luồng cũ, không đổi).

## Luồng từng thao tác (tái dùng cơ chế có sẵn)

**1. Sửa đoạn giới thiệu (`edesc`)** — giống hệt luồng `set_field` hiện tại nhưng ghi `descriptions[desc_key]`:
- Đọc giá trị hiện tại (`descriptions?.[desc_key]`) → hiện + prompt gõ mới → `confirmEdit` → `execSetDescription`.
- Mode mới `await_desc_value` trong `handleModeInput` (hoặc tái dùng `await_field_value` với wizard slot mang `desc_key`).

**2. Đổi ảnh (`eimg`)**:
- Bấm → set mode `await_section_image` với wizard slot { slug, sid, image_field, image_list } → prompt "Gửi ảnh mới cho mục <label>".
- Nhận ảnh (`msg.photo`) → `downloadPhotoBase64` → `execSetSectionImage`:
  - Tên file mới: `public/images/projects/<slug>/<sid>-<ts>.jpg` (ts = timestamp ngắn base36) — **không ghi đè**.
  - `image_list` (tiện ích) → **nối** đường dẫn web mới vào cuối mảng `amenities_images`.
  - ảnh đơn → gán `overview_image`/`location_image` = đường dẫn web mới.
  - 1 commit gộp: JSON cập nhật + file ảnh binary (`putFiles`).
  - Hoàn tác: JSON về prevContent (ảnh mới để lại repo, vô hại).

**3. Dán link video (`evid`)**:
- Bấm → mode `await_video_url` với wizard { slug, sid } → prompt "Dán link YouTube cho mục <label> (gõ `xoá` để bỏ video)".
- Nhận text → validate bằng `youtubeId` (import từ Slice 1 hoặc bản `.mjs` song song — xem Rủi ro) → nếu không hợp lệ và ≠ "xoá": báo lỗi, không commit.
- `execSetVideo`: ghi `videos[sid] = url` (hoặc xoá key nếu "xoá") → commit + Hoàn tác.

## Actions mới (actions.mjs)

Ba hàm, cùng khuôn với `execSetField`/`execToggleSection` (đọc file → sửa JSON → `putFiles`/`putFile` → `recordUndo` → `announce`):
```
execSetDescription(deps, chatId, slug, { descKey, value })
execSetSectionImage(deps, chatId, slug, { sid, imageField, imageList, imageBase64, ts })
execSetVideo(deps, chatId, slug, { sid, url|null })
```
- Tất cả chỉ áp cho `content_type: "project"` (JSON).
- `execSetSectionImage` dùng `putFiles` (2 file: JSON + ảnh). Các hàm khác dùng `putFile`.
- Ghi `updated_at` như các hàm hiện có.

## Menu builders mới (menu.mjs hoặc wizard-helpers.mjs)
- `buildEditSectionMenu(cfg, slug)` → 1 nút / mục trong `edit_sections` (`esec:<sid>:<slug>`) + Quay lại (`m:item:project:<slug>`) + Thoát.
- `buildSectionActionMenu(cfg, sid, slug)` → nút theo cấu hình mục: `📝 Sửa đoạn giới thiệu` (nếu có desc_key) · `🖼 Đổi ảnh` (nếu có image_field) · `🎬 Dán link video` (nếu video) · Quay lại (`m:act:e:project:<slug>`) + Thoát. Mục `basic` không đi qua đây (mở thẳng field keyboard).

## Test (node --test scripts/tg-bot/tests/)
- `buildEditSectionMenu`/`buildSectionActionMenu`: đúng nút theo config, mọi callback ≤ 64 byte, `basic` route về field keyboard.
- `callback-routing.test.mjs`: bổ sung các keyboard mới vào orphan-detector; xác nhận mọi `esec:`/`edesc:`/`eimg:`/`evid:` có nhánh trong serve.mjs.
- Ordering hazard: đảm bảo prefix không đè nhau (`edesc:` vs `evid:` vs `eimg:` vs `es`/`esec:` — dùng prefix rõ ràng, test kiểm).
- Không phá `wizard-helpers.test.mjs` / test hiện có.

## Rủi ro & xử lý
- **Import `youtubeId` vào bot (ESM `.mjs`) từ `lib/youtube.ts` (TS):** bot chạy Node thuần, không transpile TS. → Viết `youtubeId` ở **`scripts/tg-bot/engine/youtube.mjs`** (bản JS thuần, cùng logic + cùng test) HOẶC đặt logic ở 1 file `.mjs` mà cả `lib/youtube.ts` re-export. Chọn: file `.mjs` riêng cho bot, đồng bộ logic với `lib/youtube.ts`, mỗi bên có test. (Chấp nhận trùng lặp nhỏ, có chủ đích, vì 2 runtime khác nhau.)
- **64 byte callback:** test bắt buộc phủ slug dài nhất.
- **Không đụng** luồng field cũ của `basic`, ẩn/hiện, xoá, thêm mới, Hoàn tác, Hỏi trợ lý.

## Files đụng tới
- Sửa: `config.mjs` (thêm `edit_sections`), `serve.mjs` (dispatch mục + mode mới), `wizard.mjs` (render bảng mục + prompt), `actions.mjs` (3 hàm mới), `menu.mjs`/`wizard-helpers.mjs` (builders).
- Thêm: `scripts/tg-bot/engine/youtube.mjs` + test.
- Test: `menu.test.mjs`, `callback-routing.test.mjs`.

## Ngoài phạm vi
- Ảnh bìa + gallery (Slice 3).
- Sửa `product_types`/`payment_policy`/`nearby`/`faq` (bảng cấu trúc) qua bot — vẫn web admin.
- Bài viết.
