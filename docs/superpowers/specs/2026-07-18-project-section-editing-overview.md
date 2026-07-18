# Sửa nội dung dự án theo mục (chữ + ảnh + video) — Tổng quan & phân rã

**Ngày:** 2026-07-18
**Bối cảnh:** Anh Thọ muốn sửa nội dung từng mục của trang dự án (Tổng quan · Vị trí · Tiện ích · Giá bán · Pháp lý · Chính sách · Đăng ký) một cách dễ dàng — cả **chữ**, **ảnh**, và **video** — trên **cả web admin lẫn bot Telegram**. Hiện tại:
- Bot chỉ sửa được vài field chữ ngắn (tiêu đề, giá, chủ đầu tư…) và từ chối field ảnh/object ("sửa ở /admin/").
- Web admin (Decap CMS) đã sửa được chữ + ảnh từng mục, nhưng form dàn phẳng và **chưa có video**.
- Trang dự án chưa render video ở bất kỳ đâu.

## Sự thật nền (đã đọc code, không đoán)

**Các mục trang dự án** (`app/du-an/[slug]/page.tsx`, thứ tự render thực tế):
Chính sách · Tổng quan · Giá bán · Vị trí · Điểm nổi bật · Tiện ích · Mặt bằng · Thiết kế · Pháp lý · Đăng ký. Thanh nav (`ProjectAnchorNav.tsx`) hiện chỉ những mục có dữ liệu và không nằm trong `hidden_sections`.

**Field theo mục** (schema `lib/data.ts` type `Project`):
| Mục (id) | Chữ intro | Ảnh | Dữ liệu cấu trúc khác |
|---|---|---|---|
| `tong-quan` | `descriptions["tong-quan"]` | `overview_image` | bảng thông tin (developer, scale…) |
| `vi-tri` | `descriptions["vi-tri"]` | `location_image` | `nearby[]` |
| `tien-ich` | `descriptions["tien-ich"]` | `amenities_images[]` | `amenities_internal[]`, `amenities_external[]` |
| `mat-bang` | `descriptions["mat-bang"]` | `masterplan_image` | — |
| `gia-ban` | `descriptions["gia-ban"]` | — | `product_types[]`, `payment_policy[]` |
| `phap-ly` | `descriptions["phap-ly"]` | — | `legal_status`, `construction_update`, `faq[]` |
| `chinh-sach` | `descriptions["chinh-sach"]` | — | `discount`, `bank_support`, `grace_period` |
| `diem-noi-bat` | `descriptions["diem-noi-bat"]` | dùng `gallery` | `highlights[]` |
| `dang-ky` | — (form) | — | — |

**Ảnh chung:** `hero_image` (ảnh bìa), `gallery[]` (slider đầu trang + fallback cho các mục).

**Chưa có:** field video ở schema, config Decap, hay page.

**Bot** (`scripts/tg-bot/`): `config.mjs` khai báo `editable_fields` phẳng; `actions.mjs::execSetField` từ chối field kiểu object; commit gộp qua Git Trees API (`putFiles`); có Hoàn tác 30 phút (`undo.mjs`); ảnh mới đăng lưu binary base64 trong cùng commit.

## Nguyên tắc thiết kế chung (áp cho cả 3 slice)

1. **Video = link YouTube** (anh chọn). Không upload file mp4. Lưu vào field mới `videos?: Record<string, string>` (key = id mục, value = URL YouTube), song song với `descriptions`. Render iframe nhúng khi có.
2. **Không đổi shape dữ liệu đang có** trừ khi bắt buộc — `descriptions`, `overview_image`, `location_image`, `masterplan_image`, `amenities_images`, `gallery`, `hero_image` giữ nguyên tên/đường dẫn. Chỉ **thêm** `videos`.
3. **Ảnh mới không ghi đè file cũ** — đặt tên mới (kèm timestamp ngắn) để tránh cache CDN/trình duyệt giữ ảnh cũ. JSON trỏ sang file mới; Hoàn tác = trỏ JSON về file cũ (file cũ vẫn còn trên repo).
4. **Mọi thao tác ghi qua bot** tái dùng `putFiles` (1 commit gộp) + `recordUndo` (Hoàn tác 30 phút) + `announce` (theo dõi build). Không đụng logic build/deploy/idempotency.
5. Tiếng Việt, không caps-lock/tone sales. Giữ quy ước icon bot đã có.

## Phân rã 3 slice (mỗi slice 1 spec + 1 plan riêng)

### Slice 1 — Web admin gọn theo mục + video *(làm trước — nhỏ, an toàn, shippable)*
Spec: `2026-07-18-project-video-and-admin-sections-design.md`
- Thêm field `videos` (object keyed theo id mục) vào Decap `config.yml`, gom cạnh `descriptions`.
- Sắp lại thứ tự field trong `config.yml` theo cụm mục (thuần cosmetic, không đổi data path).
- `lib/data.ts`: thêm `videos?: Record<string, string>` vào type `Project`.
- Component `VideoEmbed` (server component, nhúng iframe YouTube từ URL) + helper trích YouTube ID.
- `page.tsx`: render `VideoEmbed` trong mỗi mục khi `project.videos?.[id]` có giá trị.
- **Không đụng bot.** Kết thúc: anh sửa được chữ+ảnh+video theo mục ngay trên web admin.

### Slice 2 — Bot sửa theo mục *(lớn nhất)*
Spec: `2026-07-18-bot-section-editing-design.md`
- Đổi nút "✏️ Sửa thông tin" của bot: thay danh sách field phẳng bằng **danh sách mục giống trang** (Thông tin cơ bản · Tổng quan · Vị trí · Tiện ích · Giá bán · Pháp lý · Chính sách).
- Chọn 1 mục nội dung → bảng con: `📝 Sửa đoạn giới thiệu` · `🖼 Đổi/thêm ảnh` (chỉ mục có ảnh) · `🎬 Dán link video` · `⬅️ Quay lại`.
- Mục "Thông tin cơ bản" giữ nguyên luồng sửa field ngắn hiện có.
- Actions mới: `execSetDescription`, `execSetSectionImage`, `execSetVideo` (đều commit gộp + Hoàn tác).
- Config: map mục → {description key, image field, có video?}.

### Slice 3 — Đổi ảnh bìa + thêm ảnh gallery qua bot *(hoàn thiện)*
Spec: `2026-07-18-bot-hero-gallery-design.md`
- Đổi ảnh bìa (`hero_image`) qua bot: gửi ảnh mới → lưu file mới → JSON trỏ sang → Hoàn tác về ảnh cũ.
- Thêm ảnh gallery (cộng dồn): chế độ nhận nhiều ảnh → 1 commit gộp nối vào cuối `gallery`.

## Ngoài phạm vi (cả 3 slice)
- Không đụng bài viết (post) — chỉ dự án.
- Không cho đổi tên / đổi thứ tự / thêm mục mới vào thanh menu trang (cấu trúc mục cố định — anh xác nhận "thông tin cố định, các mục trên menu mới thay đổi" = ẩn/hiện + nội dung trong mục, không phải tạo mục mới). Ẩn/hiện mục đã có sẵn (bot `🙈 Ẩn/hiện phần`).
- Không xoá / sắp xếp lại ảnh gallery qua bot (vẫn qua web admin).
- Không upload file video.

## Thứ tự triển khai
Slice 1 → Slice 2 → Slice 3. Mỗi slice tự deploy được (push main → auto build/FTP + auto-deploy bot). Sau mỗi slice: verify + báo anh Thọ.
