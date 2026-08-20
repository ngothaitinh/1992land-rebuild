# Dashboard: hợp đồng định dạng, vỏ điều hướng, bộ soạn thảo, và Tin tức

> Ngày: 2026-08-20 (cập nhật cùng ngày sau phân tích rủi ro)
> Trạng thái: spec — chưa implement
> Liên quan: `2026-07-22-laptop-dashboard-design.md` (spec gốc dashboard Dự án),
> `2026-07-22-dashboard-vps-api.md` (API trên VPS), `2026-07-23-dashboard-frontend.md`

---

## 1. Bối cảnh

Anh Thọ muốn trải nghiệm soạn thảo giống CKEditor và muốn làm lại giao diện quản trị.
Ba vấn đề cụ thể nêu cho `/dashboard/du-an`:

1. Form quá dài (~50 field trong một cột cuộn), khó tìm chỗ cần sửa.
2. `RichTextEditor` chỉ áp cho `descriptions`; field văn bản khác vẫn là ô nhập thô.
3. Thẩm mỹ chưa đạt, cần thiết kế lại.

Ngoài ra `data/posts/*.md` (Tin tức) **chưa có trang quản trị nào** — vẫn phải sửa qua
Decap CMS, thứ anh Thọ thấy khó dùng nhất.

## 2. Hiện trạng đã xác minh (2026-08-20)

| Hạng mục | Kết quả |
|---|---|
| `https://api.1992land.com/projects/<slug>` | **401** — backend đang chạy, tầng auth phản hồi đúng |
| `https://1992land.com/dashboard/du-an/` | **200** — dashboard Dự án đang live |
| `https://1992land.com/admin/` | **200** — Decap CMS **vẫn live song song** |
| Web server | **LiteSpeed** (DirectAdmin), deploy FTP — không phải Cloudflare Pages |
| `deploy.yml` | trigger mọi push lên `main`, **không có `paths:` filter** |

Hệ quả: `functions/api/auth.ts`, `functions/api/auth/callback.ts` (Cloudflare Pages
Functions), `wrangler.toml`, `deploy.py` là **code chết** — không bao giờ chạy trên
LiteSpeed. Decap thực tế đăng nhập qua `public/auth/index.php`.

**Lỗ hổng cấu trúc:** `app/dashboard/` chỉ có `du-an/` và `login/`. Không có
`page.tsx`, không có `layout.tsx`, không có thanh điều hướng.

## 3. Mục tiêu

- Trải nghiệm soạn thảo giống CKEditor, áp cho **mọi** field văn bản.
- Dashboard thành **một sản phẩm liền mạch** có vỏ điều hướng.
- Quản trị được Tin tức ngay trong dashboard.
- Form dài trở nên điều hướng được.
- **Không mất nội dung khi lưu** — xem §4, đây là mục tiêu bắt buộc chứ không phải mong muốn.

### Ngoài phạm vi

- Bỏ static export / thêm database. Độ trễ ~8 phút sau khi Lưu là hệ quả tất yếu của
  kiến trúc đã chọn giữ; bù bằng khung xem trước (§9), không giải quyết ở đây.
- Sửa luồng Telegram bot (`scripts/tg-bot/engine/`) — chỉ dùng lại primitives.
- Tài khoản/phân quyền nhiều người. Vẫn một mật khẩu dùng chung.

---

## 4. Rủi ro nền: ba bộ render không đồng ý với nhau

**Đây là phát hiện quan trọng nhất của spec này.** Codebase hiện có **ba** bộ xử lý định
dạng, mỗi bộ hỗ trợ một tập khác nhau:

| Cấu trúc | `parseMarkdownBlocks`<br>(`lib/markdown.mjs`)<br>→ trang Dự án | `renderBody`<br>(`app/tin-tuc/[slug]/page.tsx`)<br>→ trang Bài viết | `BLOCK_RE`<br>(`lib/markdown-html.mjs:58`)<br>→ **bộ lưu của editor** |
|---|:--:|:--:|:--:|
| đoạn văn | ✅ | ✅ | ✅ |
| `## ` h2 | ✅ | ✅ | ✅ |
| `### ` h3 | ✅ | ❌ | ✅ |
| `- ` danh sách | ✅ | ✅ | ✅ |
| danh sách số | ✅ | ❌ | ✅ |
| `![]()` ảnh | ✅ | ❌ | ✅ |
| `> ` trích dẫn | ❌ | ✅ | ❌ |
| `**đậm**` `_nghiêng_` `[link]()` | ✅ | ❌ **render ra chữ thô** | ✅ |

Hai hệ quả đo được:

**(a) Nút Đậm hôm nay sinh ra lỗi hiển thị.** Trang bài viết không parse inline
(`grep parseMarkdownBlocks app/tin-tuc/[slug]/page.tsx` = 0), đoạn văn render bằng
`<p>{t}</p>`. Anh Thọ bấm Đậm → site hiện **nguyên dấu sao** `**như vầy**`.

**(b) Bấm Lưu sẽ xoá trích dẫn khỏi bài.** Bộ chuyển đổi khi lưu là:

```js
const BLOCK_RE = /<(p|h2|h3|ul|ol)>([\s\S]*?)<\/\1>|<img\s+([^>]*?)>/g;
```

Thẻ nào không khớp regex này thì **bị bỏ, không cảnh báo**. `<blockquote>` không có trong
danh sách. Đã đếm: **9/9 bài viết hiện tại đều có `> `**. Nghĩa là anh Thọ mở bất kỳ bài
nào, sửa một chữ, bấm Lưu → trích dẫn trong bài đó **biến mất khỏi file**.

**Đây là rủi ro nghiêm trọng nhất của toàn dự án**, và nó **tỷ lệ thuận với việc làm
editor giống CKEditor**: càng nhiều nút → càng nhiều HTML mà `BLOCK_RE` không hiểu →
càng nhiều thứ bị nuốt. Bảng, màu chữ, căn giữa, cỡ chữ — Markdown không có khái niệm
nào trong số đó, bộ render càng không.

### Giới hạn khác của bộ parse inline (ghi nhận, không sửa)

`INLINE_RE = /(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g`

- **Không lồng nhau được:** `**đậm _nghiêng_**` → chỉ ra đậm, chữ `_nghiêng_` giữ nguyên dấu gạch.
- **URL chứa `)` sẽ vỡ link** (`[^)]+` dừng ở dấu đóng ngoặc đầu tiên).

Chấp nhận trong v1; toolbar không cho tạo định dạng lồng nhau nên giới hạn thứ nhất không
lộ ra với người dùng.

---

## 5. Hợp đồng định dạng (quyết định nền)

**Nguyên tắc:** nút nào site không render được thì **không đưa lên toolbar**. Thà thiếu
nút còn hơn mất chữ.

Chốt **10 cấu trúc** — hợp của cả ba bộ hiện có, không hơn:

| # | Cấu trúc | Markdown |
|---|---|---|
| 1 | Đoạn văn | (mặc định) |
| 2 | Tiêu đề mục | `## ` |
| 3 | Tiêu đề phụ | `### ` |
| 4 | Danh sách gạch đầu dòng | `- ` |
| 5 | Danh sách đánh số | `1. ` |
| 6 | Trích dẫn | `> ` |
| 7 | Ảnh | `![alt](src)` |
| 8 | Đậm | `**…**` |
| 9 | Nghiêng | `_…_` |
| 10 | Liên kết | `[…](…)` |

**Cả ba nơi phải hỗ trợ đúng 10 cấu trúc này**: toolbar của editor, bộ chuyển đổi khi
lưu, và bộ render ngoài site. Đây là bất biến kiểm tra được, không phải hướng dẫn chung chung.

### Cố ý KHÔNG hỗ trợ

Bảng · màu chữ · cỡ chữ · căn lề · gạch chân · chèn video inline · tiêu đề h4+ ·
đường kẻ ngang · chú thích ảnh.

Lý do: Markdown không biểu diễn được, bộ render không hiểu, và mỗi cái thêm vào là một
đường để nội dung bị nuốt. Dữ liệu có cấu trúc (bảng giá, lịch thanh toán, loại căn) đã
có field riêng trong `data/projects/*.json` (`payment_policy`, `product_types`,
`floor_plans`) — không cần bảng trong văn bản.

### CKEditor hay TipTap?

**Dùng TipTap**, dựng giao diện tương đương CKEditor. Lý do:

- Đã cài sẵn trong `package.json`, đã chạy thật trong `RichTextEditor.tsx`.
- Kiểm soát hoàn toàn schema đầu ra → ép đúng 10 cấu trúc trên là việc cấu hình, không
  phải việc chống đỡ.
- **CKEditor 5 là dual-license GPL/thương mại và có ràng buộc license key.** Với website
  thương mại, nhánh GPL thường không khả thi. **Phải tra điều khoản hiện hành trên trang
  chính thức CKEditor trước khi cân nhắc lại** — không tự suy đoán chi phí/hạn mức.

Đổi lại, phần "giống CKEditor" nằm ở **giao diện và cảm giác** (§9.1), không ở tên thư viện.

---

## 6. Nguyên tắc: đảo ngược chiều copy

Thiết kế **không** nhân bản pattern trang Dự án sang Tin tức — đó chính là pattern đang bị
chê. Làm ngược lại:

> Tin tức chỉ có 8 field, so với ~50 của Dự án. Vì đơn giản, đây là nơi lý tưởng để
> **định hình ngôn ngữ thiết kế mới** mà không phải vật lộn với form khổng lồ cùng lúc.
> Dự án migrate sang sau, khi pattern đã được chứng minh.

```
Tầng 0  Hợp đồng định dạng   thống nhất 3 bộ render về đúng 10 cấu trúc   ← BẮT BUỘC TRƯỚC
Tầng 1  Vỏ dashboard         layout + nav + trang chủ + auth gom một chỗ
Tầng 2  Bộ soạn thảo         toolbar + điều hướng form dài + preview
Tầng 3  Loại nội dung        Tin tức (mới)  →  Dự án (migrate sau)
```

---

## 7. Tầng 0 — Thống nhất pipeline định dạng

**Phải xong trước khi gắn bất kỳ nút nào vào editor.** Nếu không, mỗi nút mới là một cách
mới để mất nội dung (§4).

### 7.1 Thêm trích dẫn vào pipeline dùng chung

- `lib/markdown.mjs` — thêm block `{ type: "quote", inline }` cho dòng bắt đầu `> `.
- `components/MarkdownBlocks.tsx` — render `quote`, **dùng lại đúng class Tailwind** đang
  có ở `app/tin-tuc/[slug]/page.tsx:49-51` (`border-l-4 border-gold-500 pl-6 py-2 my-6
  bg-gold-50 rounded-r-xl`) để hiển thị không đổi.
- `lib/markdown-html.mjs` — thêm `blockquote` vào `BLOCK_RE` và vào cả hai chiều chuyển đổi.

### 7.2 Tách và thay bộ render trang bài viết

- Tạo `components/PostDetailView.tsx`, chuyển toàn bộ phần render từ
  `app/tin-tuc/[slug]/page.tsx` sang.
- **Thay `renderBody()` bằng `parseMarkdownBlocks()` + `<MarkdownBlocks>`** — đúng pipeline
  `ProjectDetailView.tsx:53` đang dùng. Vừa sửa lỗi (a), vừa xoá code trùng, vừa cho trang
  bài viết dùng chung bộ render với khung preview.

**Thứ tự bắt buộc: 7.1 trước 7.2.** Làm ngược lại thì trích dẫn của cả 9 bài hỏng ngay tại
bước 7.2, vì `MarkdownBlocks` chưa biết `quote`.

### 7.3 Kiểm tra hồi quy — điều kiện ra khỏi tầng 0

Chụp HTML của 9 bài viết **trước** khi sửa, so lại **sau** khi sửa. Khác biệt duy nhất
được phép: chỗ `**đậm**` / `_nghiêng_` / `[link]()` trước đây hiện dấu thô thì nay hiện
đúng định dạng. Trích dẫn, tiêu đề, danh sách phải **giống hệt**.

---

## 8. Tầng 1 — Vỏ dashboard

**File mới:**
- `app/dashboard/layout.tsx` — sidebar điều hướng (Dự án / Tin tức / Đăng xuất) + trạng
  thái đăng nhập. Mọi trang con nằm trong đây.
- `app/dashboard/page.tsx` — trang chủ: hai khối "Dự án" / "Tin tức", mỗi mục kèm ảnh đại
  diện và ngày sửa, có ô tìm kiếm.

**Auth gom một chỗ:** hiện `DashboardProjectEditor.tsx:35-38` tự bắt `unauthorized` rồi tự
`router.push`. Chuyển lên `layout.tsx` để editor không phải tự lo.

**Vì sao tầng này đi trước tầng 3:** thiếu nó thì thêm Tin tức chỉ tạo hòn đảo thứ hai mà
anh Thọ chỉ vào được bằng cách gõ tay URL.

---

## 9. Tầng 2 — Bộ soạn thảo dùng chung

### 9.1 Nâng cấp `components/dashboard/RichTextEditor.tsx`

Giữ nguyên hợp đồng `value: string (markdown)` / `onChange(md)` → `ProjectForm.tsx` không
phải sửa gì khi nâng cấp.

- **Toolbar đúng 10 cấu trúc của §5**, thêm trích dẫn và nút xoá định dạng. Không thêm nút
  nào ngoài danh sách.
- **Toolbar dính** khi cuộn trong vùng soạn thảo dài.
- **Vùng soạn thảo style giống hệt trang thật** — cùng font, cỡ chữ, khoảng dòng với
  `MarkdownBlocks.tsx`. Đây là thứ tạo ra cảm giác CKEditor, và là thứ bù đắp độ trễ 8 phút:
  gõ xong thấy đúng cái sẽ đăng.
- Cấu hình TipTap **loại bỏ** các extension ngoài hợp đồng (`StarterKit` mặc định có
  `code`, `codeBlock`, `horizontalRule`, `strike` — phải tắt, vì `BLOCK_RE` sẽ nuốt chúng).

### 9.2 `components/dashboard/FormNav.tsx` (mới)

Thanh điều hướng dính, liệt kê các nhóm field, bấm là cuộn tới. Dùng chung cho Tin tức
(ít nhóm) lẫn Dự án (nhiều nhóm) — đây là thứ thực sự chữa "form quá dài", và vì ở tầng
dùng chung nên cả hai trang cùng hưởng. Tham khảo `components/ProjectAnchorNav.tsx` đã có
cho trang public.

### 9.3 Áp editor cho mọi field văn bản

`ProjectForm.tsx` hiện dùng `<Input>` một dòng cho `discount`, `bank_support`,
`legal_status` — các field này ở public **được render qua `MarkdownBlocks`**, tức đã hỗ trợ
markdown nhưng người dùng không có nút bấm. Chuyển sang `RichTextEditor`.
`handover_date` giữ nguyên `<Input>` (thực sự một dòng).

---

## 10. Tầng 3 — Tin tức

### 10.1 Kiểu dữ liệu

`Post` (`lib/data.ts:72-83`): `slug`, `title`, `excerpt`, `date`, `category`, `readTime`,
`hero_image?`, `related_projects?`, `body?`, `content?`.

**Đã xác minh:** `content?: PostBlock[]` là **di sản chết** — `loadPosts()`
(`lib/loadData.ts:39-56`) không bao giờ gán nó, và 0/9 file có khoá `content:` trong
frontmatter. Editor chỉ xử lý `body`. Có thể xoá `content` khỏi kiểu `Post` như việc dọn kèm.

### 10.2 File mới

| File | Vai trò |
|---|---|
| `app/dashboard/tin-tuc/page.tsx` | Danh sách bài viết |
| `app/dashboard/tin-tuc/[slug]/page.tsx` | Trang sửa, `generateStaticParams` từ `loadPosts()` |
| `components/dashboard/DashboardPostEditor.tsx` | Load / save / undo, mirror `DashboardProjectEditor.tsx` |
| `components/dashboard/PostForm.tsx` | 8 field, `body` dùng `RichTextEditor` |

`components/PostDetailView.tsx` đã tạo ở tầng 0 (§7.2) — khung preview dùng lại nó, nên
preview và trang public **không thể lệch nhau**.

---

## 11. Backend

Thêm vào `scripts/tg-bot/api/` (PM2 trên VPS, deploy qua `deploy-bot.yml` sẵn có):

- **`post-store.mjs`** — mirror `project-store.mjs`. Dùng lại `getFile`/`putFiles`
  (`engine/github-commit.mjs`) và `recordUndo`/`takeUndo` (`engine/undo.mjs`).
  **Không viết lại logic Git.**
- Cần hàm **serialize frontmatter** (chiều ghi) — `lib/loadData.ts:27` chỉ có chiều đọc, và
  đó là TypeScript trong khi API là `.mjs`. Viết bản `.mjs` tương ứng, **không thêm npm
  dependency** (giữ ràng buộc của spec API gốc).
- **`server.mjs`** — thêm `GET /posts/:slug` và `POST /posts/:slug/save`, đặt **sau**
  `requireSession` (dòng 102). `POST /undo` đã tổng quát theo `undoKey`, không cần sửa.

Frontend: thêm `getDashboardPost` / `saveDashboardPost` vào `lib/dashboard-api.mjs` theo
pattern `request()` sẵn có.

**Bất biến giữ nguyên từ spec gốc: một lần Lưu = một commit.**

---

## 12. Luồng dữ liệu

```
Sửa trong dashboard
  → POST /posts/<slug>/save   (1 commit vào data/posts/<slug>.md trên main)
  → deploy.yml chạy (không có paths filter → build lại toàn site + FTP)
  → ~8 phút sau site đổi
```

Khung preview bên cạnh là thứ bù đắp độ trễ này — nên nó là yêu cầu chính, không phải phụ.

---

## 13. Testing

- **Test khứ hồi hợp đồng định dạng** (`lib/markdown-html.test.mjs`, mở rộng): với **cả 10
  cấu trúc** ở §5, `htmlToMarkdown(markdownToHtml(x)) === x`. Đây là lưới an toàn chính
  chống lỗi mất nội dung.
- **Test chống nuốt:** đưa HTML ngoài hợp đồng (`<table>`, `<h4>`, `<hr>`) vào
  `htmlToMarkdown`, khẳng định hành vi là **có chủ đích** (giữ dạng văn bản hoặc báo lỗi),
  không im lặng xoá.
- `post-store.test.mjs` (`node:test` + `node:assert/strict`): frontmatter khứ hồi, save
  sinh đúng một commit, undo.
- Hồi quy 9 bài viết theo §7.3.
- Thủ công: `pnpm dev` → đăng nhập → sửa → lưu → hoàn tác.

---

## 14. Chia lát

| Lát | Nội dung | Kết quả dùng được |
|---|---|---|
| **0** | §7 — thống nhất pipeline, thêm trích dẫn, tách `PostDetailView` | Sửa lỗi có sẵn; hết nguy cơ mất nội dung |
| **1** | §8 vỏ + §9.1 editor + §9.2 dựng `FormNav` (dùng cho Tin tức) + §10 Tin tức + §11 backend | Anh Thọ quản trị Tin tức bằng giao diện mới |
| **2** | Áp `FormNav` + `RichTextEditor` vào `ProjectForm.tsx` (§9.3) | Trang Dự án hết "form quá dài" |
| **3** | Gỡ Decap (`public/admin/`, `public/auth/`) + xoá code chết Cloudflare (§2) | Chỉ còn một hệ quản trị |

**Lát 0 không được gộp vào lát 1.** Nó có giá trị độc lập (sửa lỗi đang chạy trên
production) và là điều kiện an toàn cho mọi thứ sau nó.

Lát 3 làm **sau cùng**, khi dashboard mới đã ổn định — hiện Decap vẫn live và là đường lui.

---

## 15. Rủi ro

| Rủi ro | Mức | Xử lý |
|---|---|---|
| **Mất nội dung khi lưu do `BLOCK_RE` nuốt thẻ ngoài hợp đồng** | **Cao** | Lát 0 + hợp đồng §5 + test chống nuốt §13. Rủi ro lớn nhất của dự án. |
| Chuyển `renderBody` → `MarkdownBlocks` làm hỏng trích dẫn 9 bài | Cao | Thứ tự bắt buộc §7.1 → §7.2, hồi quy §7.3 |
| Toolbar phình ra ngoài hợp đồng theo thời gian | Trung bình | §5 là danh sách đóng; thêm nút = phải sửa cả 3 nơi + test |
| Giấy phép CKEditor nếu sau này đổi ý | Trung bình | Đã chọn TipTap; nếu cân nhắc lại phải tra điều khoản chính thức trước (§5) |
| Gỡ Decap sớm khi dashboard mới chưa ổn | Thấp | Đẩy xuống lát 3 |
| Mọi push lên `main` đều deploy toàn site | Thấp | Đã biết; gộp commit khi làm việc |

---

## 16. Việc thủ công, ngoài code

**Bản làm việc đang bị tách đôi** (phát hiện 2026-08-20) — phải xử lý trước khi implement:

- `C:\Users\ASUS\Desktop\1992\1992land-rebuild` — có source (`app/`, `components/`, `data/`,
  `lib/`, `scripts/`, `docs/`) nhưng **20 file cấu hình gốc đã bị move đi** (`package.json`,
  `tsconfig.json`, `next.config.ts`, `CLAUDE.md`, `.gitignore`…) → **không build được**.
- `D:\Backup\1992\1992land-rebuild` — chỉ chứa đúng 20 file đó, không có source.

Nội dung khớp git HEAD nên **không mất dữ liệu**: `git restore` trong bản Desktop khôi phục
đủ. Bản Desktop còn **1 commit chưa push** từ trước (`6154e69`).
