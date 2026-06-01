# GAP REPORT — Codebase vs FINAL-PLAN.md
> Audit ngày: 2026-06-01 | Branch: sync/final-plan
> Không có file nào bị sửa. Chỉ tạo mới file này.

---

## 1. ĐÃ CÓ (đúng plan)

| Item | Path |
|---|---|
| Next.js 16 App Router + TypeScript strict | `package.json`, `tsconfig.json` |
| Static export → Cloudflare Pages | `next.config.ts` (`output: "export"`, `trailingSlash: true`) |
| Tailwind v4 với `@theme` navy + gold | `app/globals.css` |
| wrangler.toml (Cloudflare Pages config) | `wrangler.toml` |
| Be Vietnam Pro + Inter qua next/font | `app/layout.tsx:8-19` |
| RealEstateAgent JSON-LD trên trang chủ | `app/layout.tsx:39-57` |
| Header sticky, hamburger mobile | `components/Header.tsx` |
| Footer 3 cột (Liên hệ / Dự án / Theo dõi) | `components/Footer.tsx` |
| FloatingCTA Zalo + Phone + Messenger | `components/FloatingCTA.tsx` |
| FadeIn scroll reveal (whileInView) | `components/FadeIn.tsx` |
| Testimonials carousel (AnimatePresence) | `components/Testimonials.tsx` |
| Homepage 8 sections | `app/page.tsx` |
| 4 stats cụ thể (8+, 500+, 5+, 100%) | `app/page.tsx:165-176` |
| /du-an listing + filter khu vực (hoạt động) | `app/du-an/page.tsx`, `components/ProjectsGrid.tsx` |
| /du-an/[slug] detail + generateStaticParams | `app/du-an/[slug]/page.tsx` |
| /tin-tuc listing + /tin-tuc/[slug] | `app/tin-tuc/page.tsx`, `app/tin-tuc/[slug]/page.tsx` |
| /gioi-thieu, /tuyen-dung, /lien-he | `app/gioi-thieu/`, `app/tuyen-dung/`, `app/lien-he/` |
| sitemap.xml generate đúng 22 routes | `app/sitemap.ts` |
| robots.txt allow all + reference sitemap | `app/robots.ts` |
| 301 redirects WP URLs cũ | `public/_redirects` |
| app/favicon.ico | `app/favicon.ico` |
| 8 dự án static data | `lib/data.ts` (8 projects) |
| 4 testimonials | `lib/data.ts` |
| git initialized, 3 commits | branch `sync/final-plan` |
| CLAUDE.md project context | `CLAUDE.md` |

---

## 2. THIẾU (chưa có, cần build)

| Item | File/folder dự kiến | Phức tạp | Phụ thuộc |
|---|---|---|---|
| Analytics component (GA4 + Google Ads gtag + Meta Pixel) | `components/Analytics.tsx` | M | Cần Measurement ID, Ads ID, Pixel ID từ anh Thọ |
| Conversion events: view_project, phone_click, form_submit, generate_lead, zalo_click | Trong `Analytics.tsx` + các page/component liên quan | M | Analytics component phải có trước |
| Web3Forms — thay toàn bộ form mailto: | `app/lien-he/page.tsx`, `app/page.tsx`, `app/tuyen-dung/page.tsx` | M | Cần access_key từ web3forms.com |
| Form contact inline trên project detail | `app/du-an/[slug]/page.tsx` sidebar | M | Web3Forms access key |
| Trang /cam-on (redirect sau submit form) | `app/cam-on/page.tsx` | S | — |
| content/ directory với MDX (projects + posts) | `content/projects/*.mdx`, `content/posts/*.mdx` | L | Cần ảnh + nội dung thật từ WP cũ |
| 8/8 dự án có MDX đầy đủ (≥5 ảnh + FAQ) | `content/projects/[slug].mdx` (x8) | L | wget mirror hoặc manual copy từ 1992land.com |
| ≥10 bài blog migrated (hiện chỉ có 3) | `content/posts/*.mdx` | L | Nội dung từ WP cũ |
| FAQ section render trên project detail | `app/du-an/[slug]/page.tsx` | M | Cần content/projects/*.mdx có field `faq` |
| Product + AggregateOffer JSON-LD trên project detail | `app/du-an/[slug]/page.tsx` | S | Cần fields price_from, price_to trong schema |
| FAQPage JSON-LD trên project detail | `app/du-an/[slug]/page.tsx` | S | Cần field `faq` trong project data |
| Decap CMS — public/admin/ | `public/admin/index.html`, `public/admin/config.yml` | M | GitHub repo + Netlify Identity / GitHub OAuth |
| llms.txt tại root | `public/llms.txt` | S | — |
| hreflang vi-VN trong layout | `app/layout.tsx` | S | — |
| OG image file thực tế | `public/og-image.jpg` | S | Cần thiết kế ảnh |
| Per-page OG image cho /du-an, /tin-tuc... | `app/du-an/opengraph-image.tsx` (x4 routes) | M | — |
| Ảnh thật cho các dự án (gallery ≥5 ảnh/dự án) | `public/images/projects/[slug]/` | L | wget mirror / manual |
| Ảnh tối ưu hoá (WebP, 3 sizes: thumb/medium/hero) | `public/images/projects/[slug]/*.webp` | L | Phụ thuộc ảnh thật |
| Chân dung anh Thọ (About + Home) | `public/images/team/nguyen-huu-tho.jpg` | S | Ảnh từ anh Thọ cung cấp |
| content/settings.json (contact info đầy đủ) | `content/settings.json` | S | — |
| content/about.mdx (≥300 từ) | `content/about.mdx` | S | — |
| public/downloads/ (brochures PDFs) | `public/downloads/*.pdf` | M | Files từ anh Thọ |
| next/image thay thế toàn bộ `<img>` (hiện 0%) | Các file có ảnh | M | Cần ảnh thật trước |
| Lighthouse mobile ≥90 (chưa đo) | — | M | Sau khi có ảnh thật + next/image |

---

## 3. SAI (đã có nhưng cần sửa)

| Vị trí (file:line) | Sai gì | Hướng sửa | Phức tạp |
|---|---|---|---|
| `app/du-an/[slug]/page.tsx:86` + 8 file khác | `tel:0909474123` → phải là `tel:+84909474123` (FINAL-PLAN 3.3.c) | Find & replace toàn bộ `tel:0909474123` → `tel:+84909474123` | S |
| `app/layout.tsx:44` | `telephone: "0909474123"` trong JSON-LD phải là `"+84909474123"` | Sửa 1 dòng | S |
| `lib/data.ts:1-12` (Project type) | Schema thiếu: `id`, `project_type`, `city`, `district`, `price_from`, `price_to` (number), `area_from`, `area_to`, `unit_count`, `hero_image`, `gallery` (array), `faq` (array), `lat`, `lng`, `address_full`, `google_ads_campaign_id`, `created_at`, `updated_at` — theo FINAL-PLAN 3.1 | Mở rộng TypeScript type + thêm data cho 8 dự án | L |
| `lib/data.ts:94-104` | `thanh-phu-centre-point` có `area: "Đồng Nai — Bến Tre"` → không match filter "Đồng Nai" (ProjectsGrid.tsx chỉ check `===`) | Đổi `area` sang `"Đồng Nai"` hoặc tách 2 entry, cập nhật matchArea() | S |
| `app/page.tsx:290` | Form trang chủ dùng `action="mailto:..."` → phải dùng Web3Forms | Đổi sang `action="https://api.web3forms.com/submit"` với hidden fields theo FINAL-PLAN 3.4 | M |
| `app/lien-he/page.tsx:125` | Form liên hệ dùng `action="mailto:..."` → phải dùng Web3Forms | Tương tự trên | M |
| `app/tuyen-dung/page.tsx:84` | Form tuyển dụng dùng `action="mailto:..."` → phải dùng Web3Forms | Tương tự trên | S |
| `app/layout.tsx:39-57` (JSON-LD RealEstateAgent) | Thiếu `founder: "Nguyễn Hữu Thọ"` và `areaServed: ["TP HCM", "Vũng Tàu", ...]` — theo FINAL-PLAN 3.3.d | Thêm 2 field vào orgSchema | S |
| `app/globals.css` (color tokens) | Thiếu `navy-600` và `navy-800` trong thang màu (có 50,100,200,300,400,500,700,900,950 — bỏ sót 600, 800) | Thêm 2 token vào @theme | S |
| `app/du-an/[slug]/page.tsx:135-151` | Gallery section hiển thị 6 gradient placeholder, không dùng `next/image` | Cần ảnh thật → dùng `<Image>` với gallery array từ MDX | L |
| Toàn bộ codebase | Không có `<Image>` từ `next/image` ở bất kỳ đâu (0 file import) | Thay thế sau khi có ảnh thật | M |
| `app/du-an/[slug]/page.tsx` | Không có form contact inline — FINAL-PLAN 3.3.b yêu cầu "form contact ngay trong trang" | Thêm Web3Forms contact form vào sidebar của project detail | M |
| `lib/data.ts:63` | `lusso-sai-gon` có `area: "TP.HCM"` (viết tắt) nhưng `river-collection-an-gia` có `area: "TP.HCM"` — ProjectsGrid matchArea kiểm tra "Hồ Chí Minh" OR "TP.HCM", cần test để confirm | Verify bằng cách bấm filter "TP.HCM" | S |

---

## 4. THỪA (có nhưng plan không yêu cầu)

| Vị trí | Mô tả | Đề xuất |
|---|---|---|
| `public/projects/` | Thư mục rỗng trong public/ | Xoá — không dùng, sẽ gây nhầm lẫn |
| `SYNC.md` (root) | File kế hoạch sync, không phải production file | Note — không deploy ra `out/`, .gitignore hoặc move vào docs/ |
| `docs/plan/` (toàn bộ) | Reference docs, không phải source code | Note — không ảnh hưởng build, giữ để tham khảo |

---

## 5. ĐỀ XUẤT THỨ TỰ SỬA

| # | Item | Section | Phức tạp | Block ai? |
|---|---|---|---|---|
| 1 | Sửa phone format `tel:+84909474123` toàn bộ | Sai | S | Không block ai, nhưng cần đúng trước go-live |
| 2 | Sửa JSON-LD trang chủ (founder + areaServed + telephone) | Sai | S | Không block ai |
| 3 | Sửa area data `thanh-phu-centre-point` | Sai | S | Không block, user facing bug |
| 4 | Thêm navy-600, navy-800 color tokens | Sai | S | Không block ai |
| 5 | Thêm `llms.txt` tại public/ | Thiếu | S | Không block ai |
| 6 | Thêm `hreflang vi-VN` vào layout.tsx | Thiếu | S | Không block ai |
| 7 | Thêm /cam-on page | Thiếu | S | Block: Web3Forms cần redirect URL này |
| 8 | Mở rộng content schema (lib/data.ts) + thêm fields | Sai | L | Block: FAQ, Product JSON-LD, form inline du_an_quan_tam |
| 9 | **Web3Forms** — thay toàn bộ mailto: form | Thiếu/Sai | M | Block: lead capture không hoạt động |
| 10 | Form contact inline trên project detail | Thiếu | M | Phụ thuộc #9 (Web3Forms) |
| 11 | Product + AggregateOffer JSON-LD trên project detail | Thiếu | S | Phụ thuộc #8 (price_from, price_to fields) |
| 12 | FAQPage JSON-LD + FAQ section render | Thiếu | S | Phụ thuộc #8 (faq field) |
| 13 | **Analytics.tsx** (GA4 + Google Ads + Meta Pixel) | Thiếu | M | Block: Google Ads conversion tracking — cần trước go-live |
| 14 | Conversion events (phone_click, form_submit, zalo_click, generate_lead) | Thiếu | M | Phụ thuộc #13 |
| 15 | OG image file (`/public/og-image.jpg`) | Thiếu | S | SEO/social sharing |
| 16 | Per-page OG images (4 routes) | Thiếu | M | — |
| 17 | **Decap CMS** (public/admin/) | Thiếu | M | Jimmy cần trước khi handover |
| 18 | content/settings.json + content/about.mdx | Thiếu | S | Nền tảng cho Decap CMS |
| 19 | Ảnh thật cho 8 dự án (wget/manual từ 1992land.com) | Thiếu | L | Block: next/image, gallery thật |
| 20 | 8/8 project MDX với đầy đủ content + FAQ | Thiếu | L | Phụ thuộc #19 + #8 |
| 21 | ≥10 bài blog migrate | Thiếu | L | Nội dung thật |
| 22 | Chân dung anh Thọ (ảnh từ anh Thọ cung cấp) | Thiếu | S | Block: personalization score |
| 23 | Lighthouse audit + performance fix | — | M | Sau khi có ảnh thật + next/image |

---

## PHỤ LỤC — Checklist FINAL-PLAN chi tiết

### Content schema (FINAL-PLAN 3.1)
- [x] `id` — ❌ THIẾU (lib/data.ts không có id field)
- [x] `slug` — ✅ có (`lib/data.ts`)
- [x] `project_type` — ❌ THIẾU (có `type` nhưng dùng text hiển thị, không phải enum)
- [x] `status` — ✅ có (text, không phải enum chuẩn)
- [x] `city`, `district` — ❌ THIẾU (có `area` là text, không có city/district riêng)
- [x] `developer` — ✅ có
- [x] `price_from`, `price_to` — ❌ THIẾU (có `priceRange` là string hiển thị)
- [x] `area_from`, `area_to`, `unit_count` — ❌ THIẾU
- [x] `hero_image`, `gallery` (array) — ❌ THIẾU (có `gradient` Tailwind class)
- [x] `faq` (array of {q,a}) — ❌ THIẾU
- [x] `lat`, `lng`, `address_full` — ❌ THIẾU
- [x] `created_at`, `updated_at` — ❌ THIẾU
- [x] Không có `bitrix_pipeline_id`, `assigned_agent` — ✅ đúng (không có)
- [x] `google_ads_campaign_id` — ❌ THIẾU

### Forms (FINAL-PLAN 3.4)
- [ ] Form dùng Web3Forms — ❌ SAI (dùng `mailto:` tại `app/page.tsx:290`, `app/lien-he/page.tsx:125`, `app/tuyen-dung/page.tsx:84`)
- [ ] KHÔNG còn mailto: — ❌ SAI (5 chỗ dùng mailto:)
- [ ] Hidden fields: access_key, subject, redirect — ❌ THIẾU
- [ ] Form project detail có hidden `du_an_quan_tam` — ❌ THIẾU (không có form inline)

### Analytics & Tracking (FINAL-PLAN 3.3)
- [ ] GA4 measurement ID — ❌ THIẾU (`grep -r "G-" app/ = 0 kết quả`)
- [ ] Google Ads gtag conversion linker — ❌ THIẾU
- [ ] Meta Pixel — ❌ THIẾU
- [ ] Component Analytics.tsx — ❌ THIẾU (`components/` chỉ có 6 file, không có Analytics.tsx)
- [ ] Events: page_view, view_project, phone_click, form_submit, generate_lead, zalo_click — ❌ THIẾU

### Schema markup / JSON-LD (FINAL-PLAN 3.3.d)
- [x] Home: RealEstateAgent schema — ✅ CÓ (`app/layout.tsx:39-57`) — nhưng thiếu `founder`, `areaServed`
- [ ] Project detail: Product schema + AggregateOffer — ❌ THIẾU (`app/du-an/[slug]/page.tsx` không có JSON-LD)
- [ ] Project detail: FAQPage schema — ❌ THIẾU
- [ ] Validate schema.org — chưa test

### SEO & AEO (FINAL-PLAN 3.5)
- [x] sitemap.xml generate — ✅ (`app/sitemap.ts`, 22 routes)
- [x] robots.txt — ✅ (`app/robots.ts`)
- [ ] llms.txt — ❌ THIẾU (`public/llms.txt` không tồn tại)
- [ ] OG image từng page — ❌ THIẾU (có reference `/og-image.jpg` trong layout nhưng file không tồn tại)
- [ ] hreflang vi-VN — ❌ THIẾU (`grep hreflang app/ = 0 kết quả`)
- [ ] FAQ section render trên mỗi project — ❌ THIẾU

### Decap CMS (FINAL-PLAN 3.6)
- [ ] public/admin/index.html — ❌ THIẾU
- [ ] public/admin/config.yml — ❌ THIẾU
- [ ] Backend GitHub OAuth — ❌ THIẾU
- [ ] Collections: projects, posts, settings — ❌ THIẾU
- [ ] Editorial workflow — ❌ THIẾU

### Deep extraction (ARCHITECTURE Section 5)
- [ ] 8/8 dự án có MDX — ❌ 0/8 (data vẫn ở lib/data.ts dạng TypeScript)
- [ ] ≥5 ảnh/dự án trong gallery — ❌ 0 ảnh thật (toàn gradient placeholder)
- [ ] `grep "1992land.com/wp-content" content/ = 0` — ✅ N/A (chưa có content/)
- [ ] Ảnh WebP, 3 sizes — ❌ THIẾU
- [ ] public/downloads/ — ❌ THIẾU
- [ ] content/settings.json — ❌ THIẾU
- [ ] content/about.mdx ≥300 từ — ❌ THIẾU
- [ ] Ảnh chân dung anh Thọ trong public/images/team/ — ❌ THIẾU

### Personalization (PLAN-ADDENDUM Issue 2A)
**Score: 2/8**
- [ ] 1. Signature element ≥3 chỗ — ❌ Không có yếu tố đặc trưng nhận diện riêng
- [ ] 2. Unique typography moment — ❌ Font chuẩn, không có moment đặc biệt
- [ ] 3. Real portrait anh Thọ Home + About — ❌ 0 ảnh thật trong codebase
- [x] 4. ≥3 con số cụ thể — ✅ Có 4 (8+, 500+, 5+, 100%) tại `app/page.tsx:165-176`
- [ ] 5. Voice copy có cá tính — ❌ Copy hiện tại generic, AI-feel
- [ ] 6. Whitespace commitment — ❌ Không có section dám để 60%+ trống
- [ ] 7. Unexpected layout — ❌ Toàn bộ dùng grid 12-cột chuẩn
- [x] 8. Micro-detail chăm chút — ✅ Gold accents, rounded corners, transitions, gold divider, hover animations

### Performance & Quality
- [ ] Lighthouse mobile ≥90 — chưa đo (không có ảnh thật)
- [ ] LCP < 2.5s — chưa đo
- [ ] CLS < 0.1 — chưa đo
- [ ] Tất cả ảnh dùng next/image — ❌ 0% (không có `<Image>` nào)
- [x] Font Be Vietnam Pro + Inter qua next/font — ✅ (`app/layout.tsx:8-19`)

### Color & Brand
- [x] Tailwind color tokens navy + gold — ✅ CÓ trong `@theme` — nhưng thiếu navy-600, navy-800
- [x] KHÔNG dùng pure #000 — ✅ Dùng `--color-ink: #18181B`
- [ ] Phone format `tel:+84909474123` — ❌ SAI — toàn bộ dùng `tel:0909474123` (grep: 10 chỗ)
