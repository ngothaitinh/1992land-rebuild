# Slice 3 — Bot đổi ảnh bìa + thêm ảnh gallery

**Ngày:** 2026-07-18
**Thuộc:** `2026-07-18-project-section-editing-overview.md` (Slice 3/3)
**Phụ thuộc:** Slice 2 (cơ chế nhận ảnh cho mục + `execSetSectionImage` đã có).
**Mục tiêu:** Qua bot, đổi **ảnh bìa** (`hero_image`) và **thêm nhiều ảnh** vào thư viện (`gallery`, cộng dồn).

## Kết quả cuối
Bảng thao tác 1 dự án có thêm nút `🖼 Ảnh bìa & thư viện` → bảng con:
`🏞 Đổi ảnh bìa` · `➕ Thêm ảnh thư viện` · `⬅️ Quay lại`.

## Luồng

**Đổi ảnh bìa (`ehero:<slug>`)**:
- Mode `await_hero_image` → prompt "Gửi ảnh bìa mới".
- Nhận ảnh → lưu `public/images/projects/<slug>/hero-<ts>.jpg` (không ghi đè) → JSON `hero_image` = đường dẫn web mới → 1 commit gộp (JSON + ảnh) → Hoàn tác về ảnh bìa cũ.

**Thêm ảnh thư viện (`egal:<slug>`)** — nhận nhiều ảnh 1 lượt:
- Mode `await_gallery_images` với buffer trong session (mảng { base64, ts }).
- Mỗi ảnh gửi tới → thêm vào buffer → bot báo "Đã nhận N ảnh. Gửi thêm hoặc bấm ✅ Xong."
  (nút inline `✅ Xong` = `galdone:<slug>`, `❌ Huỷ` = `wz_abort`).
- Bấm ✅ Xong → `execAddGallery`:
  - Mỗi ảnh: `public/images/projects/<slug>/gallery-<ts>-<i>.jpg`.
  - **Nối** các đường dẫn web mới vào cuối mảng `gallery` (giữ ảnh cũ).
  - 1 commit gộp: JSON + tất cả file ảnh (`putFiles`).
  - Hoàn tác: JSON `gallery` về mảng cũ (ảnh mới để lại repo).
- Buffer sống trong TTL session (30 phút); hết phiên → bỏ.

> Telegram gửi mỗi ảnh là 1 message riêng (album = nhiều update). Buffer cộng dồn theo từng update trong lúc mode = `await_gallery_images`. Không cần gộp album phía Telegram — cứ ảnh nào tới trong mode này thì nhận.

## Actions mới (actions.mjs)
```
execSetHero(deps, chatId, slug, { imageBase64, ts })       // dùng putFiles: JSON + ảnh
execAddGallery(deps, chatId, slug, images[])               // images = [{ base64, ts, i }]; putFiles gộp
```
Cùng khuôn `execSetSectionImage` (Slice 2). Chỉ project.

## Menu (menu.mjs / wizard-helpers.mjs)
- Thêm nút `🖼 Ảnh bìa & thư viện` (`emedia:<slug>`) vào `buildItemMenu` cho project (không cho post).
- `buildMediaMenu(slug)` → 2 nút trên + Quay lại (`m:item:project:<slug>`) + Thoát.

## Session
- `session.mjs`: thêm slot `galleryBuf` (hoặc dùng `wizard` slot mang mảng ảnh). Giữ TTL 30 phút.

## Test
- `buildItemMenu` (project) có `emedia:`; (post) không có.
- `buildMediaMenu` callback ≤ 64 byte, đủ nhánh serve.
- Orphan-detector phủ `emedia:`/`ehero:`/`egal:`/`galdone:`.
- Ordering: `egal:` vs `galdone:` không đè (khác prefix rõ).

## Files đụng tới
- Sửa: `config.mjs` (nếu cần cờ), `serve.mjs` (nhánh + mode ảnh), `wizard.mjs` (prompt + buffer), `actions.mjs` (2 hàm), `menu.mjs`/`wizard-helpers.mjs`, `session.mjs`.
- Test: `menu.test.mjs`, `callback-routing.test.mjs`.

## Ngoài phạm vi
- Xoá / sắp xếp lại ảnh gallery qua bot (web admin).
- Bài viết.
