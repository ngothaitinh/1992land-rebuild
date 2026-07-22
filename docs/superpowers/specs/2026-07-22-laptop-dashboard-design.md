# `/dashboard` — Trang quản trị nội dung cho laptop (thay `/admin`)

**Ngày:** 2026-07-22
**Trạng thái:** Đã duyệt thiết kế, chờ viết plan triển khai.

## Bối cảnh

`/admin` hiện tại là Sveltia CMS — chỉ là form field khô khan: không xem trước, không AI hỗ trợ viết, không hoàn tác. Bot Telegram (`scripts/tg-bot/`) đã có engine mạnh (commit gộp Git Trees, AI draft, Hoàn tác, upload ảnh, xử lý `hidden_sections`) nhưng UX qua chat không phù hợp khi ngồi laptop sửa nội dung dài.

Mục tiêu: xây `/dashboard` — dùng khi ngồi laptop, tái sử dụng engine bot làm lõi xử lý, thay thế hoàn toàn `/admin`.

## Phạm vi v1

**Chỉ dự án** (`data/projects/*.json`). Bài viết (`data/posts/*.md`) làm đợt sau, tái dùng phần lớn hạ tầng (auth, API, rich-text editor) xây ở đợt này.

## Kiến trúc

Single-tenant, nội bộ 1992 Land — **không** multi-tenant/Row-Level Security/subdomain routing/RBAC động. Lý do: chỉ 2 người dùng (anh Thọ + Jimmy), không có database chung, dữ liệu là file JSON trong chính repo deploy static qua FTP — bản thân kiến trúc này đã cách ly tuyệt đối hơn cả RLS (không có DB chung nên không có gì rò rỉ chéo).

**Nếu sau này cần nhân bản cho khách hàng khác ngoài 1992 Land:** dùng mô hình **template/fork**, không phải multi-tenant SaaS — copy repo này làm template, đổi `data/`, đổi biến màu/logo trong `globals.css` (`@theme`, đã tách sẵn), deploy lên hosting riêng của khách đó. Đánh đổi: mỗi khách là 1 bản deploy riêng (không tự động đồng bộ update chung) — hợp lý cho quy mô nhỏ, tránh toàn bộ độ phức tạp bảo mật của multi-tenant thật. Điều kiện đủ để fork dễ dàng: giữ code tách module rõ ràng (rich-text editor, `ProjectDetailView`, API engine) như thiết kế dưới đây — không cần xây thêm hạ tầng gì bây giờ.

### 3 thành phần

**① Tách UI dùng chung — `ProjectDetailView`**
`app/du-an/[slug]/page.tsx` (~840 dòng, hiện trộn data-fetch + UI) tách phần hiển thị thành component `ProjectDetailView`. Trang web thật (`app/du-an/[slug]/page.tsx`) và khung preview trong `/dashboard` dùng **chung 1 component** — preview là bản render thật, không phải mô phỏng. Không đổi giao diện hiện có.

**② API HTTP nhỏ trên VPS**
Chạy trên 160.191.88.139 (cùng box bot, cùng PM2). Bọc HTTP mỏng quanh các hàm đã có sẵn trong `scripts/tg-bot/engine/actions.mjs` — không viết lại logic:
- `readCurrentField`, `readDescription` — load dữ liệu hiện tại cho form
- `execSetField`, `execSetDescription`, `execSetSectionImage`, `execSetHero`, `execAddGallery` — ghi field (dùng làm tham chiếu logic, xem mục Data flow về cách gộp thành 1 commit)
- `execUndo` — hoàn tác
- Xử lý `hidden_sections` dùng lại nguyên logic hiện có trong `wizard.mjs`/`wizard-helpers.mjs`

Bot Telegram và `/dashboard` chia sẻ chung 1 lõi xử lý, không phân nhánh logic.

**③ Trang `/dashboard`**
Nằm trong app Next.js hiện tại, deploy qua pipeline FTP có sẵn. Route `/dashboard/du-an/{slug}`.

### Layout

Desktop-first, không co hẹp kiểu mobile — chỉ dùng trên laptop/PC nên tận dụng chiều ngang màn hình: form bên trái (theo mục: Tổng quan/Vị trí/Tiện ích/Giá bán/Pháp lý...) + preview thật bên phải đặt cạnh nhau ở độ rộng lớn, mỗi bên đủ rộng đọc thoải mái, không cuộn ngang. Input/nút bấm kích thước rộng rãi, khoảng cách giữa các trường rõ ràng, nhóm theo mục có tiêu đề rõ — trải nghiệm form biên tập chuyên nghiệp, không phải bảng admin khô khan kiểu Sveltia cũ. Theme sáng đồng bộ màu navy/gold hiện có của web — không dark mode.

Dùng shadcn/ui cho input/nút/toolbar — sở hữu mã nguồn component trực tiếp, không phụ thuộc thư viện đóng gói đóng kín, dễ tuỳ chỉnh lâu dài.

### Đăng nhập

Mật khẩu đơn giản dùng chung cho anh Thọ + Jimmy (không OAuth). Session token lưu cookie, gửi kèm mọi request tới API VPS.

## Rich-text editor

- **Thư viện:** Tiptap (ProseMirror) — có paste-rules chuyển HTML (dán từ Word/Zalo/Messenger) → định dạng sạch, tự bỏ font/màu lạ.
- **Định dạng hỗ trợ:** Đậm, Nghiêng, danh sách gạch đầu dòng/đánh số, tiêu đề H2/H3, chèn link, **chèn ảnh giữa đoạn văn** (không chỉ ảnh đại diện/đầu mục).
- **Lưu trữ:** vẫn Markdown thuần trong field JSON (`descriptions.*`) — Tiptap convert HTML nội bộ ↔ Markdown khi load/save, không khoá dữ liệu vào riêng công cụ này, vẫn sửa tay trực tiếp file được.
- **Toolbar:** cố định phía trên vùng soạn thảo, nút lớn dễ bấm — B / I / H2 / H3 / list / numbered-list / link / ảnh.
- **Ảnh chèn giữa bài:** giữ dạng blob tạm ở trình duyệt cho tới khi bấm Lưu — chỉ upload thật và nhúng `![alt](/images/projects/{slug}/inline-N.jpg)` vào đúng vị trí con trỏ khi commit. Nếu người dùng chèn rồi xoá trước khi Lưu thì không tạo ảnh rác trên repo.
- **Áp dụng cho:** mọi field `descriptions.*` (Tổng quan/Vị trí/Tiện ích/Giá bán/Pháp lý...) trong v1.

## Nâng cấp bộ render Markdown (bắt buộc)

Hiện `renderInline`/`DescBlock` trong `app/du-an/[slug]/page.tsx` chỉ hiểu `**đậm**` và **tự chia đoạn văn theo mỗi 2 câu** (bỏ qua dòng trống người viết gõ) — không đủ cho định dạng mới.

- Viết hàm parse Markdown nhẹ dùng chung (vd `lib/markdown.tsx`), hỗ trợ: đậm/nghiêng, H2/H3, list/numbered-list, link, ảnh inline, đoạn văn theo dòng trống thật.
- **Tương thích ngược:** 9 dự án hiện tại chưa có dòng trống trong field mô tả (viết liền 1 khối). Parser fallback: field không có dòng trống nào → giữ hành vi tự chia câu cũ (không vỡ layout bài đã đăng); field có dòng trống → parse đoạn theo đúng ý người viết. Không cần sửa tay 9 file JSON cũ.
- Dùng chung 1 hàm này ở cả `ProjectDetailView` (trang thật) và khung preview trong `/dashboard` — đảm bảo preview = y hệt trang thật.
- Bài viết (`app/tin-tuc/[slug]/page.tsx` — `renderBody`) giữ nguyên cách render riêng hiện có, không đụng vào ở v1 (làm đợt sau cùng lúc mở rộng dashboard cho bài viết).

## Data flow

1. **Load:** mở `/dashboard/du-an/{slug}` → `GET` lấy toàn bộ JSON hiện tại từ GitHub → đổ vào form + preview.
2. **Sửa realtime:** gõ trong form/rich-text editor → preview cập nhật ngay **chỉ ở phía trình duyệt** (không gọi API mỗi lần gõ), dùng `ProjectDetailView` dùng chung với trang thật.
3. **Lưu:** 1 nút "Lưu" → gộp **tất cả field đã đổi trong phiên đó (kể cả nhiều field + ảnh mới)** thành **1 commit Git Trees duy nhất** qua `buildTreeEntries`/`putFiles` (đã có sẵn trong `github-commit.mjs`). Không lặp gọi `execSetField` riêng từng field như bot làm cho 1 lệnh — tránh nhiều commit → trigger Actions build nhiều lần.
4. **Hoàn tác:** nút "Hoàn tác lần Lưu gần nhất" gọi `execUndo` với key lưu trong session sau lần Lưu cuối.
5. **Lỗi GitHub API:** hiện lỗi rõ trên dashboard, giữ nguyên nội dung đang sửa trong form (không mất draft), không tự động retry ngầm (tránh commit trùng).

## Testing / success criteria

1. Mở `/dashboard/du-an/{slug}` với 1 dự án đã có (vd `ansana-by-kita`) → form hiện đúng dữ liệu hiện tại, preview khớp y hệt trang `/du-an/ansana-by-kita` thật.
2. Sửa 1 field text thường + 1 field rich-text (thêm đậm/list/link) + chèn 1 ảnh giữa đoạn văn → preview cập nhật ngay, không gọi API.
3. Bấm Lưu → đúng **1 commit** xuất hiện trên GitHub chứa cả file JSON đã đổi và ảnh mới → Actions chạy 1 lần → trang thật cập nhật đúng nội dung đã sửa.
4. Bấm Hoàn tác sau khi Lưu → nội dung trở lại đúng trạng thái trước đó, đúng 1 commit hoàn tác.
5. Dự án cũ (mô tả không có dòng trống) vẫn hiển thị đúng như trước (không vỡ layout) sau khi nâng cấp bộ render.
6. Đăng nhập sai mật khẩu → không vào được `/dashboard`; API từ chối request không có session hợp lệ.
7. Ngắt mạng/API GitHub lỗi khi Lưu → dashboard báo lỗi rõ, nội dung đang sửa trong form không bị mất.

## Việc để sau (ngoài phạm vi v1)

- Mở rộng dashboard cho bài viết (`data/posts/*.md`), bao gồm nâng cấp `renderBody` để dùng chung bộ parse Markdown mới.
- Cân nhắc "nhân bản làm template" cho khách hàng khác ngoài 1992 Land (nếu phát sinh) — theo mô hình fork repo đã nêu ở phần Kiến trúc, không cần thiết kế thêm bây giờ.
