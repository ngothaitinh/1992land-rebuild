# PLAN — ADDENDUM (Fix 3 vấn đề sau Phase 4)

> Đọc cùng với `PLAN.md` chính. File này bổ sung sau khi Jimmy chạy thử và 
> báo 3 vấn đề. Mỗi issue có: diagnose, prompt cho Claude Code, verify.

---

## ISSUE 1 — Ảnh từ website cũ chưa extract được

### Diagnose

Phase 1 trong PLAN gốc có 3 lớp fallback nhưng có thể Claude Code chỉ thử 
Lớp 1 (REST API). Nếu API bị block + Claude Code không tự chạy wget → kẹt.

### Fix — Chạy thủ công 4 lệnh sau, copy output đưa Claude Code

**Lệnh 1 — Test WP REST API:**
```bash
curl -s -A "Mozilla/5.0" -o test-api.json -w "HTTP=%{http_code}\n" \
  "https://1992land.com/wp-json/wp/v2/media?per_page=100"
head -c 500 test-api.json
```

- HTTP=200 + JSON ra → API mở, đi tiếp Lệnh 2
- HTTP=401/403 → API block, skip xuống Lệnh 3 (wget)

**Lệnh 2 — Nếu API mở, lấy hết media URLs:**
```bash
# Vòng qua các page (100 ảnh/page) để lấy hết
for page in 1 2 3 4 5; do
  curl -s -A "Mozilla/5.0" \
    "https://1992land.com/wp-json/wp/v2/media?per_page=100&page=$page" \
    > "media-page-$page.json"
done
ls -la media-page-*.json
```

**Lệnh 3 — Fallback: wget mirror toàn site:**
```bash
mkdir -p scraped && cd scraped
wget --mirror \
  --convert-links \
  --adjust-extension \
  --page-requisites \
  --no-parent \
  --user-agent="Mozilla/5.0" \
  --wait=1 \
  --reject="*.css.gz,*.js.gz" \
  https://1992land.com/
cd ..

# Đếm ảnh tải về
find scraped -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) | wc -l
```

Bình thường sẽ ra **80-300 file ảnh**. Nếu < 20 → site dùng lazy-load JS, 
cần Lệnh 4.

**Lệnh 4 — Last resort: Playwright (render JS rồi mới scrape):**
```bash
pnpm add -D playwright
pnpm exec playwright install chromium
```

### [CLAUDE PROMPT FIX-1] — Đưa cho Claude Code

```
Tôi đã chạy 3 lệnh extract, kết quả như sau:

[PASTE OUTPUT TỪNG LỆNH 1-3 VÀO ĐÂY]

Task:
1. Đọc kết quả trên, xác định phương án khả thi nhất (API / wget / Playwright)
2. Viết lại `scripts/extract-content.mjs` theo phương án đó
3. Nếu cần Playwright, viết `scripts/extract-with-playwright.mjs`:
   - Mở từng page của 1992land.com bằng headless Chrome
   - Đợi 3s cho lazy-load chạy xong
   - Scroll xuống cuối page để trigger lazy-load
   - Thu thập tất cả <img src> và background-image URLs
   - Download về public/images/scraped/, đặt tên theo slug page

4. Chạy script và CONFIRM ngược với tôi:
   - Bao nhiêu ảnh đã tải về?
   - Bao nhiêu MDX file đã được cập nhật với ref ảnh local?
   - Có MDX nào còn URL remote không?

5. Map ảnh sang dự án: Mỗi dự án phải có ít nhất 3 ảnh trong gallery.
   Nếu thiếu, list ra dự án nào còn thiếu để tôi bổ sung thủ công.
```

### Verify
- [ ] `find public/images -type f | wc -l` ≥ 50
- [ ] `grep -r "1992land.com/wp-content" content/ | wc -l` = 0 (không còn URL remote)
- [ ] Mỗi project MDX có ≥ 3 ảnh trong frontmatter `gallery`

---

## ISSUE 2 — Website chưa ấn tượng, chưa cá nhân hoá

### Diagnose (đây là điểm cốt lõi)

Cá nhân hoá KHÔNG đến từ code đẹp hay design tốt. Nó đến từ **dữ liệu thật + 
quyết định thiết kế cụ thể**. Hiện trạng:

| Yếu tố | Hiện tại | Cần |
|---|---|---|
| Chân dung Jimmy | KHÔNG có | Ảnh đang tư vấn / đứng trước dự án |
| Story bằng giọng Jimmy | Generic copy | 200 từ Jimmy tự viết tay |
| Con số cụ thể | KHÔNG | "8 năm", "200+ giao dịch", "5 tỉnh" |
| Client photo thật | Chỉ tên | Ảnh thật của 4 khách testimonial |
| Signature design element | KHÔNG | 1 motif đặc trưng (vd: nét gạch gold cong dưới heading) |
| Voice & tone | Trung tính | Có dấu ấn riêng (vd: hay dùng cụm "thưa Anh Chị", "kính chúc...") |

**Test đơn giản:** Bỏ logo + tên "1992 Land" ra. Website còn lại có khác 
website môi giới BĐS khác không? Nếu KHÔNG → vẫn generic.

### Fix — Hai phần: (A) Asset Jimmy chuẩn bị + (B) Prompt design-specific

#### Phần A — Asset cần chuẩn bị (Jimmy làm, không cần Claude Code)

**Bắt buộc:**
1. **1 ảnh chân dung Jimmy** — đứng trước project, hoặc đang tư vấn khách. 
   KHÔNG ảnh studio nền trắng (quá agency).
2. **Bio 150-200 từ** — Jimmy tự viết tay theo template:
   ```
   "Tôi là [tên], sinh năm 1992 tại [quê]. Bắt đầu nghề BĐS từ năm [năm] 
   vì [lý do cá nhân]. Tin rằng [niềm tin nghề nghiệp]. Đến nay đã đồng hành 
   cùng [số] khách hàng tại [khu vực]. Khi không đi xem dự án, tôi 
   [sở thích riêng]."
   ```
3. **5 con số thật** — ví dụ: số năm trong nghề, số giao dịch đã chốt, 
   số tỉnh đang hoạt động, % khách giới thiệu lại, số dự án đang phân phối.
4. **Ảnh thật của 4 testimonial khách** — hoặc xin avatar Zalo/Facebook 
   của khách (cần xin phép). Nếu khách không cho phép → dùng initial avatar 
   thiết kế (chữ cái đầu trên nền gold).

**Nice to have:**
5. **Signature/chữ ký Jimmy** — scan thủ công, dùng làm accent ở footer
6. **Video 30s Jimmy giới thiệu bản thân** — đặt ở trang Giới thiệu
7. **Slogan ngắn riêng** — không phải "Giá Trị Kiến Tạo Lòng Tin" (tagline chính), 
   mà 1 câu ngắn hơn dạng signature: vd "Đi xem cùng anh chị bất cứ khi nào"

#### Phần B — Prompt design-specific cho Claude Code

### [CLAUDE PROMPT FIX-2A] — Audit current site

```
Trước khi sửa, hãy audit website hiện tại tôi đã build với checklist 
"cá nhân hoá" sau. Với mỗi item, đánh giá Pass/Fail và lý do:

1. SIGNATURE ELEMENT: Có 1 motif design xuất hiện ≥ 3 chỗ trong site 
   (vd: nét gạch gold cong, dấu chấm gold, frame góc) không?

2. UNIQUE TYPOGRAPHY MOMENT: Có ít nhất 1 chỗ typography break the rule 
   (vd: text khổng lồ, italic accent, tracking đặc biệt) không?

3. REAL PORTRAIT: Có ảnh thật của Jimmy ở Home + About không?

4. SPECIFIC NUMBERS: Có ít nhất 3 con số cụ thể (không phải "nhiều", 
   "đa dạng") không?

5. VOICE: Đọc 3 câu copy bất kỳ — có nghe giống Jimmy nói chuyện không, 
   hay giống ChatGPT viết?

6. WHITESPACE COMMITMENT: Có ít nhất 1 section dám để 60%+ là whitespace không?

7. UNEXPECTED LAYOUT: Có ít nhất 1 section break grid 12-cột thông thường 
   (vd: asymmetric, overlap, full-bleed cut-in) không?

8. MICRO-DETAIL: Có chi tiết nhỏ cho thấy "có người chăm chút" 
   (vd: scroll progress bar gold, hover state riêng cho từng card, 
   loading state có ý đồ) không?

Báo cáo dưới dạng bảng. Pass tối thiểu 6/8 mới gọi là "có cá nhân hoá".
```

### [CLAUDE PROMPT FIX-2B] — Inject personalization (sau khi có asset từ Phần A)

```
Tôi vừa upload các asset sau:
- public/images/jimmy-portrait.jpg
- public/images/jimmy-signature.png (nếu có)
- content/jimmy-bio.md (chứa bio 200 từ + 5 con số thật)
- public/images/testimonials/anh-khanh.jpg, anh-tung.jpg, chi-van.jpg, chi-ngan.jpg

Apply lại tất cả các thay đổi sau, một lượt:

(1) HERO HOMEPAGE — break the template:
- Bỏ stock hero kiểu "ảnh đẹp + heading center"
- Thay bằng: Layout asymmetric — ảnh dự án chiếm 7/12 bên phải, content 5/12 
  bên trái với heading break sang 2 dòng có 1 dòng italic gold.
- Thêm 3 con số thật ở dưới heading, format theo grid 3 cột:
  "08    YEARS"     "200+   DEALS"    "05    PROVINCES"
- Subtle ảnh portrait Jimmy nhỏ + tên + chức danh ở góc dưới-trái

(2) SIGNATURE MOTIF — tạo 1 element xuất hiện toàn site:
- Chọn: nét gạch gold cong tay-vẽ dưới mỗi heading h2 chính
- SVG inline, ~120px width, stroke-width 2px, gold-500
- Xuất hiện ở: hero h1, mỗi section heading, footer brand mark

(3) ABOUT SECTION (Home) — thay copy generic bằng bio thật:
- Đọc content/jimmy-bio.md
- Quote 1 câu nổi bật làm pull-quote lớn (italic, navy-900)
- Đặt cạnh portrait Jimmy, layout 2 cột
- KÝ TÊN cuối paragraph bằng signature.png (nếu có) hoặc font handwriting

(4) TESTIMONIALS — upgrade visual:
- Bỏ format card sạch sẽ generic
- Thay bằng: layout magazine — ảnh khách + tên + dự án bên trái, 
  quote khổng lồ bên phải, dấu ngoặc kép gold-500 ở góc
- Mỗi testimonial là 1 viewport scroll-snap riêng (full height section)

(5) PROJECTS LISTING — break grid:
- 2 dự án featured ở top: layout asymmetric (1 ảnh lớn + content cạnh)
- 6 dự án còn lại: grid 3 cột nhưng XEN KẼ với 1 section "About 1992 Land" 
  ở giữa hàng 2 và hàng 3 (full-width interrupt)

(6) VOICE & COPY — rewrite tất cả CTA và microcopy:
- KHÔNG dùng "Khám phá ngay", "Tìm hiểu thêm", "Click vào đây"
- DÙNG: 
  - "Xem cùng anh Thọ" (thay "Xem dự án")
  - "Để mình gọi cho anh chị" (thay "Liên hệ")
  - "Gửi mình câu hỏi" (thay "Submit")
  - "Anh chị cần tư vấn gấp?" (thay "Need help?")
- Tone: gần gũi, xưng "mình" với khách, không xưng "chúng tôi"

(7) MICRO-DETAIL POLISH:
- Scroll progress bar 2px gold-500 top of viewport
- Phone number "0909 474 123" mỗi khi xuất hiện: hover → expand thành 
  "Gọi ngay: 0909 474 123" + animate
- Loading state: dùng signature motif SVG animate (stroke-dasharray)
- 404 page: ảnh dự án bị "bán mất" + copy "Trang anh chị tìm... đã có chủ rồi 😊"
- Favicon: chữ "1" trên nền navy với accent gold

Sau khi xong, screenshot 5 trang (Home, Du-an listing, 1 project detail, 
About, Lien-he) và list từng thay đổi cụ thể đã làm.
```

### Verify
- [ ] Apply checklist Prompt FIX-2A: ≥ 6/8 Pass
- [ ] Show website cho 1 người ngoài (vợ, bạn, đồng nghiệp), hỏi: 
      "Site này khác gì với Vinhomes.vn hay Cengroup.vn?" → phải có 
      câu trả lời cụ thể, không phải "đẹp hơn".
- [ ] Bỏ logo "1992 Land" trên header, đưa screenshot: vẫn nhận ra brand 
      qua color + signature motif + tone copy

---

## ISSUE 3 — Admin/Login để quản lý content

### Push back trước khi fix

Plan gốc lock **static site = $0/tháng**. Có 3 lựa chọn, mình recommend (B):

**(A) Không thêm gì, edit qua Git**
- Chi phí: $0
- Workflow: Mở GitHub web → edit MDX → commit → site rebuild auto (~2 phút)
- Phù hợp: Jimmy quen Git/Markdown
- Vấn đề: Phải biết Markdown, không upload ảnh qua UI

**(B) ✅ KHUYẾN NGHỊ — Decap CMS (open-source, free, $0/tháng)**
- Chi phí: $0
- Workflow: Truy cập `1992land.com/admin/` → đăng nhập GitHub → giao diện 
  như WordPress → edit/upload ảnh → click "Publish" → tự commit Git → 
  site rebuild ~2 phút
- Phù hợp: Jimmy + nhân viên content team không biết code
- Lưu trữ: Content vẫn ở Git repo (no database, không lock-in)
- Auth: GitHub OAuth (Jimmy invite GitHub user vào repo = có quyền edit)

**(C) Full backend với Supabase + Auth**
- Chi phí: $0 free tier nhưng có giới hạn (50k MAU, 500MB DB)
- Workflow: Login email/password → admin dashboard tự build
- Vấn đề: Phức tạp, mất thời gian build, cần maintain auth + database, 
  rủi ro lock-in vào Supabase
- KHÔNG khuyến nghị trừ khi sau này có nhu cầu: customer login, save 
  favorites, multi-user roles phức tạp

### Fix — Setup Decap CMS

### [CLAUDE PROMPT FIX-3] — Add Decap CMS

```
Thêm Decap CMS vào project Next.js static export hiện có. Yêu cầu:

1. Cài Decap CMS (CDN approach, không cần build):
   - Tạo `public/admin/index.html` load Decap từ CDN
   - Tạo `public/admin/config.yml`

2. Config Decap với 3 collection:

   a. PROJECTS collection (folder collection):
      - Folder: content/projects
      - Format: frontmatter MDX
      - Fields:
        * title (string, required)
        * slug (string, required, hint: "URL friendly, vd: lusso-sai-gon")
        * location (string)
        * developer (string)
        * price_range (string)
        * status (select: sap-mo-ban / dang-mo-ban / da-ban-xong)
        * hero_image (image)
        * gallery (list of images)
        * description (text)
        * body (markdown)

   b. POSTS collection (folder collection):
      - Folder: content/posts
      - Tương tự, fields: title, slug, date (datetime), category (select), 
        excerpt, image, body

   c. SETTINGS (file collection):
      - File: content/settings.json
      - Fields: phone, email, address, zalo_link, messenger_link, 
        facebook_link, working_hours

3. Auth backend: GitHub OAuth
   - Cấu hình: backend: name: github, repo: [USERNAME]/1992land-rebuild, 
     branch: main
   - Hướng dẫn tôi setup GitHub OAuth App ở bước riêng

4. Media folder: public/images/uploads
   - public_folder: /images/uploads

5. Site URL: https://1992land.com
   display_url + logo_url config

6. Editorial workflow: BẬT
   - Cho phép tạo draft trước khi publish
   - Workflow: draft → review → publish

7. Sau khi setup xong, hướng dẫn tôi từng bước:
   - Tạo GitHub OAuth App (URL, callback URL cần điền gì)
   - Setup secrets ở Cloudflare Pages
   - Hoặc dùng Netlify Identity / external OAuth proxy nếu phức tạp

QUAN TRỌNG:
- KHÔNG thêm database
- KHÔNG thêm Supabase/Firebase
- Giữ project vẫn là pure static export
- /admin chỉ là static HTML + JS từ CDN
- Build size không tăng đáng kể
```

### Setup GitHub OAuth (Jimmy làm sau khi Claude Code cài Decap)

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
   - Application name: `1992Land CMS`
   - Homepage URL: `https://1992land.com`
   - Authorization callback URL: `https://api.netlify.com/auth/done` 
     (Decap dùng Netlify OAuth provider miễn phí)
2. Lưu Client ID và Client Secret
3. Vào Netlify → Site (tạo dummy site free) → Site settings → Identity → 
   Enable GitHub provider, paste Client ID + Secret
4. Test: mở `https://1992land.com/admin/` → click "Login with GitHub" → 
   redirect về admin UI

**Alternative simpler:** Dùng [Sveltia CMS](https://github.com/sveltia/sveltia-cms) 
(fork Decap, hỗ trợ direct GitHub OAuth không cần Netlify proxy).

### Verify
- [ ] `https://1992land.com/admin/` load được
- [ ] Login GitHub thành công
- [ ] Tạo 1 post test → publish → 2 phút sau xuất hiện trên site live
- [ ] Upload 1 ảnh test qua UI → ảnh nằm ở `public/images/uploads/` trong Git
- [ ] Editorial workflow: tạo draft → review → publish hoạt động

---

## Thứ tự thực hiện

Đề xuất theo độ ưu tiên:

1. **Issue 1 (ảnh)** — làm trước, không có ảnh thì cá nhân hoá vô nghĩa
2. **Issue 2A (audit)** — chạy checklist trước để biết hiện trạng
3. **Jimmy chuẩn bị asset** (Phần A của Issue 2) — 1-2 ngày, song song với #1
4. **Issue 2B (inject personalization)** — sau khi có asset
5. **Issue 3 (Decap CMS)** — cuối cùng, sau khi UI đã ổn định

KHÔNG làm Issue 3 trước Issue 2 — không có nghĩa lý gì khi admin một site 
chưa đẹp.

---

## Câu hỏi mở cho Jimmy

Trước khi đi tiếp, mình cần Jimmy confirm 2 điều:

1. **Issue 3:** Chọn phương án (A), (B), hay (C)? Mình khuyến nghị **(B) Decap CMS**.

2. **Issue 2:** Jimmy có sẵn sàng tự viết bio + cung cấp ảnh chân dung + số 
   liệu thật không? Nếu KHÔNG, không thể giải quyết được "thiếu cá nhân hoá" 
   bằng prompt. (Đây là honest pushback — code không thể bù cho thiếu asset.)
