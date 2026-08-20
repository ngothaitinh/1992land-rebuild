# Dashboard: vỏ điều hướng, bộ soạn thảo dùng chung, và Tin tức

> Ngày: 2026-08-20
> Trạng thái: spec — chưa implement
> Liên quan: `2026-07-22-laptop-dashboard-design.md` (spec gốc của dashboard Dự án),
> `2026-07-22-dashboard-vps-api.md` (API trên VPS), `2026-07-23-dashboard-frontend.md`

---

## 1. Bối cảnh

Anh Thọ báo trang quản trị "khó dùng", muốn trải nghiệm soạn thảo giống CKEditor và
muốn làm lại giao diện. Ba vấn đề cụ thể được nêu cho trang `/dashboard/du-an`:

1. Form quá dài (~50 field trong một cột cuộn), khó tìm chỗ cần sửa.
2. `RichTextEditor` chỉ áp cho `descriptions`; các field văn bản khác vẫn là ô nhập thô.
3. Thẩm mỹ chưa đạt, cần thiết kế lại.

Ngoài ra `data/posts/*.md` (Tin tức) **chưa có trang quản trị nào** trong dashboard —
hiện vẫn phải sửa qua Decap CMS, vốn là thứ anh Thọ thấy khó dùng nhất.

## 2. Hiện trạng đã xác minh (2026-08-20)

Kiểm tra thực tế, không phải giả định:

| Hạng mục | Kết quả |
|---|---|
| `https://api.1992land.com/projects/<slug>` | **401** — backend đang chạy, tầng auth phản hồi đúng |
| `https://1992land.com/dashboard/du-an/` | **200** — dashboard Dự án đang live |
| `https://1992land.com/admin/` | **200** — Decap CMS **vẫn đang live song song** |
| Web server | **LiteSpeed** (DirectAdmin), deploy qua FTP — không phải Cloudflare Pages |
| `deploy.yml` | trigger mọi push lên `main`, **không có `paths:` filter** |

Hệ quả: `functions/api/auth.ts`, `functions/api/auth/callback.ts` (Cloudflare Pages
Functions), `wrangler.toml`, `deploy.py` là **code chết** — không bao giờ chạy trên
LiteSpeed. Decap thực tế đăng nhập qua `public/auth/index.php`.

**Lỗ hổng cấu trúc:** `app/dashboard/` chỉ có `du-an/` và `login/`. Không có
`app/dashboard/page.tsx`, không có `layout.tsx`, không có thanh điều hướng. Mỗi editor
tự kiểm tra đăng nhập và tự redirect.

## 3. Mục tiêu

- Dashboard trở thành **một sản phẩm liền mạch** có vỏ điều hướng, không phải các trang rời.
- Trải nghiệm soạn thảo giống CKEditor, áp **cho mọi field văn bản**, không chỉ vài field.
- Quản trị được Tin tức (`data/posts/*.md`) ngay trong dashboard.
- Form dài trở nên điều hướng được.

### Không nằm trong phạm vi

- **Bỏ static export / thêm database.** Anh Thọ đã chọn giữ kiến trúc hiện tại.
  Độ trễ ~8 phút từ lúc Lưu tới lúc site đổi là hệ quả tất yếu, không giải quyết ở đây
  (xem §9).
- Thay đổi luồng Telegram bot (`scripts/tg-bot/engine/`) — chỉ dùng lại primitives, không sửa.
- Thêm tài khoản/phân quyền nhiều người. Vẫn một mật khẩu dùng chung như hiện tại.

## 4. Nguyên tắc thiết kế: đảo ngược chiều copy

Thiết kế **không** nhân bản pattern của trang Dự án sang Tin tức — vì đó chính là pattern
đang bị chê. Làm ngược lại:

> Tin tức chỉ có 8 field, so với ~50 field của Dự án. Vì đơn giản, đây là nơi lý tưởng để
> **định hình ngôn ngữ thiết kế mới** mà không phải vật lộn với form khổng lồ cùng lúc.
> Dự án migrate sang sau, khi pattern đã được chứng minh.

Ba tầng, tầng dưới phục vụ tầng trên:

```
Tầng 1  Vỏ dashboard        layout + nav + trang chủ + auth gom một chỗ
Tầng 2  Bộ soạn thảo        RichTextEditor nâng cấp + điều hướng form dài + preview
Tầng 3  Loại nội dung       Tin tức (mới)  →  Dự án (migrate sau)
```

## 5. Tầng 1 — Vỏ dashboard

**File mới:**
- `app/dashboard/layout.tsx` — khung chung: sidebar điều hướng (Dự án / Tin tức / Đăng xuất),
  hiển thị trạng thái đăng nhập. Mọi trang con nằm trong đây.
- `app/dashboard/page.tsx` — trang chủ dashboard: hai khối "Dự án" và "Tin tức", mỗi khối
  liệt kê nội dung kèm ảnh đại diện + ngày sửa gần nhất, có ô tìm kiếm.

**Auth gom một chỗ:** hiện `DashboardProjectEditor.tsx:35-38` tự bắt lỗi `unauthorized`
rồi tự `router.push` sang login. Chuyển việc này lên `layout.tsx` để mọi trang con dùng
chung một cơ chế, editor không còn phải tự lo.

**Lý do tầng này đi trước:** thiếu nó thì thêm Tin tức chỉ tạo ra hòn đảo thứ hai mà anh
Thọ chỉ vào được bằng cách gõ tay URL.

## 6. Tầng 2 — Bộ soạn thảo dùng chung

### 6.1 Nâng cấp `components/dashboard/RichTextEditor.tsx`

Hiện có 7 nút (B, I, H2, H3, bullet, ordered, Link, Ảnh) trên TipTap, style tối giản.
Nâng cấp:

- **Toolbar dính** khi cuộn trong vùng soạn thảo dài.
- **Vùng soạn thảo style giống trang thật** — cùng font, cỡ chữ, khoảng dòng với
  `MarkdownBlocks.tsx`. Gõ xong thấy đúng cái sẽ đăng, đây là điều kiện đủ để anh Thọ
  không cần chờ 8 phút mới biết kết quả.
- Bổ sung: blockquote (`> `) vì post page đã render nó, và nút xoá định dạng.
- Giữ nguyên hợp đồng `value: string (markdown)` / `onChange(md)` — không đổi interface,
  nên `ProjectForm.tsx` hiện tại không phải sửa gì khi nâng cấp.

### 6.2 Điều hướng form dài — `components/dashboard/FormNav.tsx` (mới)

Thanh điều hướng dính, liệt kê các nhóm field, bấm là cuộn tới. Dùng lại được cho cả
Tin tức (ít nhóm) lẫn Dự án (nhiều nhóm) — đây là thứ thực sự chữa vấn đề "form quá dài",
và vì nằm ở tầng dùng chung nên cả hai trang cùng hưởng.

Tham khảo `components/ProjectAnchorNav.tsx` đã có sẵn cho trang public — cùng ý tưởng.

### 6.3 Áp editor cho mọi field văn bản

`ProjectForm.tsx` hiện dùng `TextField` (ô `<Input>` một dòng) cho `discount`,
`bank_support`, `legal_status`, `handover_date`. Các field này ở public được render qua
`MarkdownBlocks` nên **hỗ trợ markdown nhưng người dùng không có nút bấm**. Chuyển sang
`RichTextEditor` (trừ các field thực sự một dòng như `handover_date`).

## 7. Tầng 3 — Tin tức

### 7.1 Kiểu dữ liệu

`Post` (`lib/data.ts:72-83`): `slug`, `title`, `excerpt`, `date`, `category`, `readTime`,
`hero_image?`, `related_projects?`, `body?`, `content?`.

**Đã xác minh 2026-08-20:** trường `content?: PostBlock[]` là **di sản chết** —
`loadPosts()` (`lib/loadData.ts:39-56`) không bao giờ gán nó, và 0/9 file trong
`data/posts/` có khoá `content:` trong frontmatter. Editor chỉ cần xử lý `body`.
Có thể xoá `content` khỏi kiểu `Post` như một việc dọn dẹp kèm theo.

### 7.2 File mới

| File | Vai trò |
|---|---|
| `app/dashboard/tin-tuc/page.tsx` | Danh sách bài viết |
| `app/dashboard/tin-tuc/[slug]/page.tsx` | Trang sửa, `generateStaticParams` từ `loadPosts()` |
| `components/dashboard/DashboardPostEditor.tsx` | Load / save / undo, mirror `DashboardProjectEditor.tsx` |
| `components/dashboard/PostForm.tsx` | Form 8 field, `body` dùng `RichTextEditor` |
| `components/PostDetailView.tsx` | **Tách ra từ** `app/tin-tuc/[slug]/page.tsx` (xem §8) |

### 7.3 Khung xem trước

Trang Dự án có preview nhờ `ProjectDetailView.tsx` là component tái dùng được. Trang Tin
tức **không có** — toàn bộ phần render nằm inline trong `app/tin-tuc/[slug]/page.tsx`
(hàm `renderBody`, dòng 36-70). Phải tách thành `components/PostDetailView.tsx` để trang
public và khung preview dùng **chung một bộ render**, tránh lệch nhau về sau.

## 8. Chặn bắt buộc: post page không parse markdown inline

**Đây là điều kiện tiên quyết, không phải việc phụ.**

`app/tin-tuc/[slug]/page.tsx` tự viết `renderBody()` chỉ xử lý `## `, `> `, `- ` và đoạn
văn. Đã xác minh: file này **không** import `parseMarkdownBlocks` hay `MarkdownBlocks`
(grep = 0). Đoạn văn được render bằng `<p>{t}</p>` — văn bản thô.

Hệ quả: nếu giao cho anh Thọ nút **Đậm** mà không sửa gì, editor sinh ra `**chữ đậm**`
và trang bài viết live sẽ hiện **nguyên dấu sao** thay vì chữ đậm.

**Cách sửa:** khi tách `PostDetailView.tsx` (§7.3), thay `renderBody()` bằng
`parseMarkdownBlocks()` + `<MarkdownBlocks>` — đúng pipeline mà `ProjectDetailView.tsx:53`
đang dùng. Việc này vừa sửa lỗi vừa xoá code trùng lặp.

**Kiểm tra hồi quy:** 9 bài viết hiện có phải render không đổi sau khi chuyển (trừ chỗ
markdown vốn đang hỏng thì nay hiện đúng).

## 9. Backend

Thêm vào `scripts/tg-bot/api/` (chạy PM2 trên VPS, deploy qua `deploy-bot.yml` sẵn có):

- **`post-store.mjs`** — mirror `project-store.mjs`. Dùng lại `getFile`/`putFiles`
  (`engine/github-commit.mjs`) và `recordUndo`/`takeUndo` (`engine/undo.mjs`).
  **Không viết lại logic Git.**
- Cần thêm hàm **serialize frontmatter** (chiều ghi) — `lib/loadData.ts:27` chỉ có chiều
  đọc, và đó là TypeScript trong khi API là `.mjs`. Viết bản `.mjs` tương ứng, không thêm
  npm dependency (giữ đúng ràng buộc "no new npm dependencies" của spec API gốc).
- **`server.mjs`** — thêm `GET /posts/:slug` và `POST /posts/:slug/save`, đặt **sau**
  `requireSession` (dòng 102). `POST /undo` đã tổng quát theo `undoKey`, không cần sửa.

Frontend: thêm `getDashboardPost` / `saveDashboardPost` vào `lib/dashboard-api.mjs`,
theo đúng pattern `request()` sẵn có.

**Bất biến giữ nguyên từ spec gốc: một lần Lưu = một commit.**

## 10. Luồng dữ liệu

```
Sửa trong dashboard
  → POST /posts/<slug>/save  (1 commit vào data/posts/<slug>.md trên main)
  → deploy.yml chạy (không có paths filter → build lại toàn site + FTP)
  → ~8 phút sau site đổi
```

Khung preview bên cạnh là thứ bù đắp độ trễ này — nên nó là yêu cầu chính, không phải phụ.

## 11. Testing

- `post-store.test.mjs` (`node:test` + `node:assert/strict`, đúng convention sẵn có):
  parse/serialize frontmatter khứ hồi, save sinh đúng một commit, undo.
- Kiểm tra hồi quy render 9 bài viết hiện có sau khi chuyển sang `MarkdownBlocks` (§8).
- Thủ công: `pnpm dev`, chạy thử luồng đăng nhập → sửa → lưu → hoàn tác.

## 12. Chia lát

| Lát | Nội dung | Kết quả dùng được |
|---|---|---|
| **1** | §8 (sửa renderBody) + §5 (vỏ) + §6 (bộ soạn thảo) + §7 (Tin tức) | Anh Thọ quản trị được Tin tức bằng giao diện mới |
| **2** | Migrate `ProjectForm.tsx` sang `FormNav` + editor cho mọi field | Trang Dự án hết "form quá dài" |
| **3** | Gỡ Decap (`public/admin/`, `public/auth/`) + xoá code chết Cloudflare (§2) | Chỉ còn một hệ quản trị duy nhất |

Lát 3 làm **sau cùng**, sau khi xác nhận dashboard mới chạy ổn định — hiện Decap vẫn đang
live và là đường lui.

## 13. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Chuyển `renderBody` → `MarkdownBlocks` làm lệch hiển thị bài cũ | Kiểm tra hồi quy đủ 10 bài (§11) trước khi push |
| Bài viết dùng `content` thay vì `body` | Đã loại trừ — xác minh 0/9 bài dùng `content` (§7.1) |
| Gỡ Decap sớm khi dashboard mới chưa ổn | Đẩy xuống lát 3 |
| Mọi push lên `main` đều deploy toàn site | Đã biết; gộp commit khi làm việc, hoặc cân nhắc thêm `paths:` filter (ngoài phạm vi) |

## 14. Việc thủ công, ngoài code

**Bản làm việc đang bị tách đôi** (phát hiện 2026-08-20) — phải xử lý trước khi implement:

- `C:\Users\ASUS\Desktop\1992\1992land-rebuild` — có source (`app/`, `components/`, `data/`,
  `lib/`, `scripts/`, `docs/`) nhưng **20 file cấu hình gốc đã bị move đi** (`package.json`,
  `tsconfig.json`, `next.config.ts`, `CLAUDE.md`, `.gitignore`…) → **không build được**.
- `D:\Backup\1992\1992land-rebuild` — chỉ chứa đúng 20 file đó, không có source.

Nội dung các file này **khớp git HEAD** nên không mất dữ liệu: `git restore` trong bản
Desktop khôi phục đủ. Ngoài ra bản Desktop còn **1 commit chưa push** (`6154e69`).
