# PLAN — Rebuild 1992land.com bằng Claude Code

> **Mục tiêu:** Rebuild hoàn toàn 1992land.com sang static site premium, giữ 100% content hiện có, deploy với chi phí $0/tháng (chỉ trả domain).

> **Cách dùng file này:** Mỗi Phase là một block công việc. Đưa từng prompt trong `[CLAUDE PROMPT]` cho Claude Code thực hiện. Verify xong mới sang phase tiếp theo.

---

## 1. Tổng quan dự án

| Mục | Giá trị |
|---|---|
| Domain | `1992land.com` (giữ nguyên) |
| Owner | Nguyễn Hữu Thọ — `0909474123` |
| Địa chỉ | 17 Trần Quý Kiên, Bình Trưng Tây, TP. Thủ Đức |
| Brand tagline | "Giá Trị Kiến Tạo Lòng Tin" |
| Ngành | Môi giới BĐS (HCMC, Vũng Tàu, Bình Dương, Long An, Đồng Nai) |
| Stack mới | Next.js 15 (static export) + Tailwind CSS + MDX |
| Hosting | Cloudflare Pages (free tier) |
| Source code | GitHub private repo |

### Content phải migrate
- 8 dự án: Salacia Villas Phú Mỹ, Ansana by Kita, Lusso Sài Gòn, Water Concept, The Quậy Phước Hải, Thanh Phú Centre Point, Sun Group Cù Lao Phố, River Collection An Gia
- 16+ bài blog tin tức BĐS
- 4 testimonials (Anh Khánh, Anh Tùng, Chị Vân, Chị Ngân)
- Trang Giới thiệu, Tuyển dụng, Liên hệ
- Logo + ảnh dự án (tải về local)

---

## 2. Stack & Chi phí

### Bắt buộc trả phí
| Khoản | Chi phí/năm |
|---|---|
| Domain `1992land.com` renewal | ~250.000đ/năm (đã có) |

### Hoàn toàn free
- Cloudflare Pages — hosting, SSL, CDN global, unlimited bandwidth
- GitHub — repo private free
- Next.js — open source
- Tailwind CSS — open source
- Frontend Design Skill (Anthropic) — free GitHub
- UI/UX Pro Max Skill — free GitHub
- 21st.dev components — free tier
- Google Fonts (Be Vietnam Pro, Inter) — free
- Lucide icons — free

### Tùy chọn (KHÔNG bắt buộc — bỏ qua được)
- ElevenLabs (video gốc đề cập) — **BỎ**, không cần audio cho BĐS
- ChatGPT image gen cho hero — **BỎ**, dùng ảnh dự án sẵn có
- Hostinger (affiliate trong video) — **BỎ**, Cloudflare Pages tốt hơn

**Tổng chi phí mới phát sinh: 0đ/tháng**

---

## 3. Cấu trúc thư mục đích

```
1992land-rebuild/
├── content/
│   ├── projects/          # 1 file .mdx cho mỗi dự án
│   │   ├── salacia-villas-phu-my.mdx
│   │   ├── ansana-by-kita.mdx
│   │   ├── lusso-sai-gon.mdx
│   │   ├── water-concept.mdx
│   │   ├── the-quay-phuoc-hai.mdx
│   │   ├── thanh-phu-centre-point.mdx
│   │   ├── sun-group-cu-lao-pho.mdx
│   │   └── river-collection-an-gia.mdx
│   ├── posts/             # Blog posts
│   └── testimonials.json  # 4 reviews
├── public/
│   ├── images/
│   │   ├── projects/      # Ảnh từng dự án
│   │   ├── logo.png
│   │   └── og-image.jpg
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── page.tsx       # Homepage
│   │   ├── du-an/
│   │   │   ├── page.tsx                    # Listing
│   │   │   └── [slug]/page.tsx             # Detail
│   │   ├── tin-tuc/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── gioi-thieu/page.tsx
│   │   ├── tuyen-dung/page.tsx
│   │   ├── lien-he/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/            # shadcn components
│   │   ├── Hero.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── Testimonials.tsx
│   │   ├── ContactForm.tsx
│   │   ├── FloatingCTA.tsx # Zalo + Messenger
│   │   └── Footer.tsx
│   └── lib/
│       └── content.ts     # MDX loader
├── scripts/
│   └── extract-content.mjs  # Script clone content từ WP
├── CLAUDE.md              # Hướng dẫn cho Claude Code
├── next.config.mjs
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## PHASE 0 — Setup môi trường

**Mục tiêu:** Có Claude Code chạy được + 2 skills cài xong + project Next.js scaffold.

### Checklist
- [ ] Cài Claude Code desktop từ `claude.com`
- [ ] Node.js 20 LTS đã có (Jimmy đã cài sẵn theo memory)
- [ ] pnpm hoặc npm

### Lệnh chạy

```bash
# Tạo project mới
mkdir 1992land-rebuild && cd 1992land-rebuild
npx create-next-app@latest . \
  --typescript --tailwind --app \
  --no-src-dir --import-alias "@/*" \
  --use-pnpm

# Cài shadcn/ui
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add button card input textarea dialog sheet

# Cài MDX + thư viện phụ
pnpm add @next/mdx @mdx-js/loader @mdx-js/react gray-matter
pnpm add next-mdx-remote
pnpm add lucide-react framer-motion
pnpm add -D @types/mdx

# Cài 2 skills
npm install -g uipro-cli
uipro init --ai claude
npx skills add https://github.com/anthropics/skills
```

### Verify
- [ ] `pnpm dev` mở được `http://localhost:3000`
- [ ] Thư mục `.claude/skills/ui-ux-pro-max/` tồn tại
- [ ] Thư mục `.claude/skills/frontend-design/` (hoặc tương đương) tồn tại

---

## PHASE 1 — Clone content từ WordPress (TIẾT KIỆM NHẤT)

**Mục tiêu:** Lấy toàn bộ content + ảnh từ `1992land.com` về local, convert sang MDX.

### Chiến lược: 3 lớp fallback

**Lớp 1 — Thử WP REST API (nhanh nhất, sạch nhất):**

```bash
# Test endpoint
curl -A "Mozilla/5.0" "https://1992land.com/wp-json/wp/v2/posts?per_page=1"
curl -A "Mozilla/5.0" "https://1992land.com/wp-json/wp/v2/pages?per_page=1"
curl -A "Mozilla/5.0" "https://1992land.com/wp-json/wp/v2/media?per_page=1"
```

Nếu trả JSON → đi tiếp với Lớp 1.
Nếu 401/403 → chuyển Lớp 2.

**Lớp 2 — wget mirror toàn site (chắc chắn được):**

```bash
mkdir scraped && cd scraped
wget --mirror \
  --convert-links \
  --adjust-extension \
  --page-requisites \
  --no-parent \
  --user-agent="Mozilla/5.0" \
  --wait=1 \
  https://1992land.com/
```

Output: thư mục `1992land.com/` chứa toàn bộ HTML + ảnh.

**Lớp 3 — Manual copy (cho nội dung cuối cùng):**
Mở từng page trên browser, copy text vào MDX. Dùng cho phần WordPress render bằng JavaScript mà wget bỏ sót.

### [CLAUDE PROMPT 1] — Extract content

```
Tôi cần clone content từ website WordPress hiện có (1992land.com) sang 
dự án Next.js mới này.

Bước 1: Viết script `scripts/extract-content.mjs` thực hiện:
1. Thử gọi WP REST API tại https://1992land.com/wp-json/wp/v2/
   - Endpoints: /posts, /pages, /media
   - Pagination với per_page=100
2. Nếu API trả 401/403, dùng fallback: parse từ thư mục `scraped/1992land.com/` 
   (do tôi đã chạy wget trước)
3. Output:
   - `content/posts/[slug].mdx` cho mỗi blog post (frontmatter: title, date, 
     excerpt, image, category)
   - `content/projects/[slug].mdx` cho mỗi dự án (frontmatter: title, 
     location, developer, price_range, status, gallery, hero_image)
   - Download tất cả ảnh về `public/images/posts/` và `public/images/projects/`
   - Optimize ảnh: resize max 1920px width, convert sang WebP nếu chưa

Bước 2: Chạy script và verify output:
- Tối thiểu 8 file trong content/projects/
- Tối thiểu 16 file trong content/posts/
- Tất cả ảnh đã tải về local, không còn URL remote

Yêu cầu code:
- ES modules, Node 20
- Dùng `node-html-parser` hoặc `cheerio` để parse HTML fallback
- Dùng `sharp` để optimize ảnh
- Log progress rõ ràng
- Idempotent: chạy lại không duplicate
```

### Verify Phase 1
- [ ] `content/projects/` có ≥ 8 file .mdx
- [ ] `content/posts/` có ≥ 16 file .mdx
- [ ] `public/images/` chứa toàn bộ ảnh local (không còn link `1992land.com/wp-content/`)
- [ ] Mỗi MDX có frontmatter đầy đủ (title, date, excerpt, image)
- [ ] Mở thử 1 file MDX bất kỳ → nội dung tiếng Việt đầy đủ, không bị mojibake

---

## PHASE 2 — Design references & Build brief

**Mục tiêu:** Có file `brief.md` chi tiết để feed Claude Code build UI.

### Chọn 3-5 design references

Tìm trên Awwwards/Dribbble với keywords:
- "luxury real estate website"
- "property developer landing"
- "premium real estate agency"
- "modern real estate Vietnam"

**Tiêu chí chọn reference:**
1. Có hero section dùng full-bleed image với typography lớn
2. Có project listing dạng grid với hover effect
3. Có project detail page với gallery + key specs
4. Có testimonials section thiết kế tốt
5. Tone luxury nhưng không quá Tây — phù hợp khách Việt

Lưu URL vào file `brief.md`.

### [CLAUDE PROMPT 2] — Generate brief

```
Tạo file `brief.md` cho dự án này với nội dung sau, dùng thông tin từ 
content/ đã có và 5 URL references mà tôi sẽ paste vào bên dưới:

# Brief — 1992Land Website Rebuild

## Brand
- Tên: 1992 Land
- Owner: Nguyễn Hữu Thọ
- Tagline VN: "Giá Trị Kiến Tạo Lòng Tin"
- Tagline EN (subtle): "Trust Built on Values"
- Điện thoại: 0909474123
- Email: nguyenhuutho911@gmail.com
- Địa chỉ: 17 Trần Quý Kiên, Bình Trưng Tây, TP. Thủ Đức
- Zalo: zalo.me/0909474123
- Messenger: m.me/165126330021000

## Audience
- Khách hàng mua BĐS để ở (gia đình trung lưu+) tại HCMC
- Nhà đầu tư cá nhân quan tâm dự án mới ở Vũng Tàu, Bình Dương, Long An
- Khách ký gửi cần bán BĐS

## Tone & Voice
- Tin cậy, chuyên nghiệp, ấm áp (không xa cách)
- KHÔNG dùng từ kiểu sales nóng vội ("CỰC KỲ", "NHẤT THỊ TRƯỜNG")
- KHÔNG dùng CAPS LOCK trong heading

## Color Palette (ĐÃ CHỐT — Navy + Gold)

### Primary scale — Deep Navy
```
navy-50:   #F2F4F8
navy-100:  #D8DEE9
navy-200:  #A8B4C8
navy-300:  #6D7E9A
navy-500:  #1F3458   ← brand accent
navy-700:  #14233D
navy-900:  #0B1F3A   ← PRIMARY (text-dark, hero overlay)
navy-950:  #06132A   ← darkest, footer bg
```

### Accent scale — Warm Gold
```
gold-100:  #F7EFD8
gold-300:  #E8D4A0
gold-500:  #C9A961   ← ACCENT (CTA, highlight, divider)
gold-700:  #A6873F
gold-900:  #6B5524
```

### Neutrals
```
bg:        #FAFAF7   ← page background (off-white, warm)
surface:   #FFFFFF   ← card background
text:      #1A1A1A   ← body text
muted:     #6B6B6B   ← secondary text, caption
border:    #E5E2D9   ← subtle dividers
```

### Semantic
- Success (Zalo button): `#10B981`
- Messenger button: `#0084FF`
- Phone button: `gold-500`

### Tailwind config snippet (paste vào `tailwind.config.ts`)
```ts
extend: {
  colors: {
    navy: {
      50: '#F2F4F8', 100: '#D8DEE9', 200: '#A8B4C8',
      300: '#6D7E9A', 500: '#1F3458', 700: '#14233D',
      900: '#0B1F3A', 950: '#06132A',
    },
    gold: {
      100: '#F7EFD8', 300: '#E8D4A0', 500: '#C9A961',
      700: '#A6873F', 900: '#6B5524',
    },
    bg: '#FAFAF7',
    surface: '#FFFFFF',
    ink: '#1A1A1A',
    muted: '#6B6B6B',
    'border-soft': '#E5E2D9',
  }
}
```

### Quy tắc dùng màu
- **Backgrounds:** `bg` mặc định, `navy-900` cho hero/footer, `navy-50` cho section nhẹ
- **Text:** `ink` cho body, `navy-900` cho heading, `muted` cho caption
- **CTA primary:** `bg-navy-900 text-bg hover:bg-navy-700`
- **CTA secondary:** `border border-gold-500 text-navy-900 hover:bg-gold-100`
- **Accent (gạch chân heading, icon, dấu chấm price):** `gold-500`
- **KHÔNG** dùng gold-500 làm background của text block lớn — chỉ dùng làm accent
- **KHÔNG** dùng pure black `#000` — luôn `ink #1A1A1A`

## Typography
- Heading: "Be Vietnam Pro" 600/700 (Vietnamese-optimized)
- Body: "Be Vietnam Pro" 400/500
- Numeric/Price: "Inter" tabular-nums

## Design References

Tham khảo 5 website dưới đây — đây là các Awwwards Honorable Mention / 
Site of the Day về real estate, chọn vì phù hợp với 8 dự án của 1992 Land 
(căn hộ + biệt thự + nghỉ dưỡng):

1. **the(eight)** — https://www.awwwards.com/sites/the-eight
   - Lý do: Luxury + sustainability storytelling, hero parallax mạnh.
   - Áp dụng cho: trang chủ + project detail của Lusso Sài Gòn, Salacia Villas

2. **Elyse Residence** — https://www.awwwards.com/sites/elyse-residence
   - Lý do: "Timeless refinement", fullscreen background image, gallery đẹp.
   - Áp dụng cho: project detail page (layout 2 cột sticky info + gallery)

3. **Luxury Real Estate (Watt Property — Bangkok)** — https://www.awwwards.com/sites/luxury-real-estate
   - Lý do: thị trường Á luxury, tone ấm + gold accent, microinteractions tinh tế.
   - Áp dụng cho: tone tổng thể, văn hoá khách Việt dễ tiếp nhận hơn ref Tây thuần

4. **Horizonte Village** — https://www.awwwards.com/sites/horizonte-village
   - Lý do: Developer Award, project showcase nhiều phối cảnh.
   - Áp dụng cho: trang Dự án (listing) + cách present nhiều dự án song song

5. **LET US Ibiza** — https://www.awwwards.com/sites/let-us-ibiza
   - Lý do: resort/coastal luxury, typography signature.
   - Áp dụng cho: The Quậy Phước Hải, Salacia Villas Phú Mỹ (BĐS biển)

**Bonus listing để Claude Code browse thêm khi cần:**
https://www.awwwards.com/websites/real-estate/

**Yêu cầu khi tham chiếu:**
- KHÔNG copy nguyên design — chỉ học cấu trúc, spacing, micro-interaction
- KHÔNG dùng English heading như references — toàn bộ UI tiếng Việt
- KHÔNG dùng ảnh stock Tây Âu — chỉ ảnh dự án thực của 1992 Land

## Site Structure
- /                    Homepage
- /du-an               Listing tất cả dự án
- /du-an/[slug]        Chi tiết từng dự án
- /tin-tuc             Blog listing
- /tin-tuc/[slug]      Bài viết
- /gioi-thieu          About
- /tuyen-dung          Careers
- /lien-he             Contact

## Homepage Sections (theo thứ tự)
1. Hero — full-bleed ảnh dự án đẹp nhất + tagline + CTA "Nhận tư vấn"
2. Featured Projects — 3 dự án nổi bật (card lớn, hover lift)
3. About — story ngắn "Đến với 1992 Land..."
4. All Projects Grid — 8 dự án còn lại
5. Latest News — 3 bài mới nhất
6. Testimonials — 4 reviews dạng carousel
7. CTA Section — form đăng ký tư vấn
8. Footer — info, social, sitemap

## Must-have UX
- Floating CTA bottom-right: Zalo + Phone + Messenger
- Sticky header với logo + nav (background mờ khi scroll)
- Project card: lazy-load image, hover scale 1.02
- Page transition: subtle fade
- Scroll reveal cho sections (Framer Motion)
- Mobile-first, breakpoint 768px

## SEO Requirements
- Meta title pattern: "{Page} | 1992 Land — BĐS Thủ Đức"
- OG image generated cho từng dự án (1200x630)
- JSON-LD: Organization, RealEstateAgent, BreadcrumbList
- Sitemap.xml + robots.txt
- Vietnamese hreflang: vi-VN

## Performance Targets
- Lighthouse Performance ≥ 90
- LCP < 2.5s
- CLS < 0.1
- Bundle JS first-load < 150KB

## Non-goals (KHÔNG làm)
- KHÔNG e-commerce (không bán hàng online)
- KHÔNG user login/register
- KHÔNG đa ngôn ngữ phase này
- KHÔNG dark mode phase này
- KHÔNG newsletter signup tích hợp (chỉ form contact đơn giản)
```

### Verify Phase 2
- [ ] File `brief.md` tồn tại, đầy đủ
- [ ] Đã chọn xong 3-5 URL references và paste vào brief
- [ ] Color palette đã quyết định (giữ hoặc đổi đề xuất)

---

## PHASE 3 — Foundation: Layout, theme, components base

**Mục tiêu:** Có header, footer, layout, typography, color theme chạy được. Chưa cần content thật.

### [CLAUDE PROMPT 3] — Build foundation

```
Đọc kỹ `brief.md` và `.claude/skills/ui-ux-pro-max/SKILL.md` + 
`.claude/skills/frontend-design/SKILL.md`.

Tasks:

1. Setup Tailwind theme trong `tailwind.config.ts`:
   - Colors từ brief (navy, gold, off-white, charcoal, muted)
   - Font family: Be Vietnam Pro (Google Fonts), Inter
   - Container max-width 1280px, padding responsive

2. Setup `app/layout.tsx`:
   - Import Be Vietnam Pro + Inter từ next/font/google
   - Set lang="vi"
   - Default metadata theo brief (title pattern, OG image)
   - JSON-LD Organization schema

3. Build `components/Header.tsx`:
   - Logo bên trái (text "1992 LAND" với letter-spacing, hoặc dùng logo.png)
   - Nav: Trang chủ, Dự án, Tin tức, Giới thiệu, Tuyển dụng, Liên hệ
   - Sticky, background trắng/95% opacity với backdrop-blur khi scroll
   - Mobile: hamburger menu (shadcn Sheet)

4. Build `components/Footer.tsx`:
   - 3 cột: Liên hệ | Dự án (links) | Theo dõi (Zalo, Messenger, FB)
   - Copyright "© 2026 1992 Land — Bản quyền thuộc về Nguyễn Hữu Thọ"
   - Border-top mờ, padding 80px top

5. Build `components/FloatingCTA.tsx`:
   - Position fixed bottom-right, z-50
   - 3 button tròn: Zalo (xanh lá), Phone (gold), Messenger (xanh dương)
   - Mỗi button có tooltip khi hover
   - Mobile: full-width bottom bar

6. Tạo placeholder pages cho tất cả routes trong brief, content lorem ipsum.

YÊU CẦU:
- KHÔNG over-engineer. KHÔNG abstraction cho component dùng 1 lần.
- KHÔNG generic AI look. Phải có character riêng (tham chiếu references trong brief).
- Match brief.md chính xác về color và typography.

Sau khi xong, chạy `pnpm dev` và screenshot home để tôi review.
```

### Verify Phase 3
- [ ] `pnpm dev` chạy không lỗi
- [ ] Header hiển thị đúng, sticky hoạt động
- [ ] Footer 3 cột hiển thị đúng
- [ ] FloatingCTA hiện bottom-right
- [ ] Mobile responsive (test ở 375px)
- [ ] Typography đúng font, đúng color
- [ ] Lighthouse local ≥ 80 (chưa cần ≥90 ở phase này)

---

## PHASE 4 — Build từng page với content thật

### [CLAUDE PROMPT 4A] — Homepage

```
Đọc brief.md, đặc biệt phần "Homepage Sections".

Build `app/page.tsx` với 8 sections theo thứ tự brief.

Data nguồn:
- Dự án: đọc từ content/projects/*.mdx (frontmatter)
- Posts: đọc từ content/posts/*.mdx (frontmatter), lấy 3 mới nhất theo date
- Testimonials: đọc từ content/testimonials.json

Yêu cầu cụ thể:

HERO:
- Background: ảnh dự án "Sun Group Cù Lao Phố" hoặc dự án nào ảnh chất nhất
- Overlay gradient từ navy/80 dưới lên transparent trên
- Heading 2 dòng: "Giá Trị" + "Kiến Tạo Lòng Tin" (gold accent cho 1 từ)
- Subheading: tagline dài 1-2 câu
- CTA primary: "Nhận tư vấn miễn phí" → scroll xuống form
- CTA secondary: "Xem dự án" → /du-an
- Subtle scroll indicator dưới cùng

FEATURED PROJECTS (3 cards lớn):
- Chọn 3 dự án đầu trong content/projects/ theo order frontmatter
- Card: image full-width trên, content dưới (title, location, "Xem chi tiết →")
- Hover: scale image 1.05, content slide up nhẹ

ABOUT:
- Layout 2 cột: text trái, ảnh phải (hoặc ảnh full nếu có ảnh team)
- Text: paragraph "Đến với 1992 Land..." từ content gốc (tóm tắt nếu dài)
- CTA: "Tìm hiểu thêm" → /gioi-thieu

ALL PROJECTS GRID:
- Grid 3 cột desktop, 2 cột tablet, 1 cột mobile
- Card nhỏ hơn featured: image trên, title + location dưới
- 5 dự án còn lại (skip 3 featured đã show)
- CTA cuối: "Xem tất cả dự án →"

LATEST NEWS:
- 3 card horizontal: ảnh trái 1/3, content phải 2/3
- Hiện title, excerpt, date, "Đọc tiếp →"
- CTA: "Xem tất cả tin tức →"

TESTIMONIALS:
- Carousel 1 testimonial/slide (Embla hoặc Swiper hoặc tự build với Framer Motion)
- Mỗi slide: quote lớn, tên khách, dự án
- Auto-rotate 5s, có dots indicator

CONTACT CTA SECTION:
- Background gold nhạt hoặc navy
- Heading: "Sẵn sàng tìm ngôi nhà của bạn?"
- Form đơn giản: Họ tên, SĐT, Dự án quan tâm (select), Message
- Submit → mailto:nguyenhuutho911@gmail.com (KHÔNG cần backend phase này)
- Alternative: link Zalo trực tiếp

KHÔNG over-engineer. Mỗi section dưới 100 dòng JSX.
```

### [CLAUDE PROMPT 4B] — Projects pages

```
Build:

1. `app/du-an/page.tsx` — Listing tất cả dự án
   - Hero nhỏ: "Dự án 1992 Land" + subtitle
   - Filter bar (optional): theo khu vực (HCMC / Vũng Tàu / Bình Dương / Long An / Đồng Nai)
   - Grid 3 cột, đầy đủ 8 dự án
   - Mỗi card click → /du-an/[slug]

2. `app/du-an/[slug]/page.tsx` — Chi tiết dự án
   - generateStaticParams() từ content/projects/*.mdx
   - Hero: ảnh dự án + tên + location overlay
   - Breadcrumb: Trang chủ > Dự án > [Tên]
   - Sticky info bar: tên dự án | CTA "Liên hệ tư vấn"
   - Layout 2 cột:
     - Trái (2/3): MDX content render
     - Phải (1/3): Sticky card với key specs (giá, diện tích, vị trí, CĐT, tiến độ) + CTA Zalo/Phone
   - Gallery section: tất cả ảnh trong frontmatter.gallery
   - Related projects: 3 dự án khác cùng khu vực

3. `lib/projects.ts` — Helper functions:
   - getAllProjects()
   - getProjectBySlug(slug)
   - getRelatedProjects(currentSlug, count = 3)

Dùng MDX với gray-matter để parse frontmatter.
```

### [CLAUDE PROMPT 4C] — News / Blog pages

```
Build:

1. `app/tin-tuc/page.tsx` — Listing blog
   - Pagination 9 post/page
   - Card grid 3 cột: ảnh, category badge, title, excerpt, date

2. `app/tin-tuc/[slug]/page.tsx` — Chi tiết bài
   - generateStaticParams từ content/posts/*.mdx
   - Hero ảnh + title + date + reading time
   - MDX content render với prose styles
   - Author box dưới content: ảnh + tên + "Liên hệ tư vấn"
   - Related posts: 3 bài cùng category

3. `lib/posts.ts` — Helper functions tương tự projects
```

### [CLAUDE PROMPT 4D] — Static pages

```
Build 3 trang còn lại:

1. `app/gioi-thieu/page.tsx`:
   - Hero: heading + sub
   - Story section: paragraph "Đến với 1992 Land..." version dài
   - Values: 3-4 giá trị cốt lõi với icon (Lucide)
   - Team section (optional, nếu có ảnh): card Nguyễn Hữu Thọ
   - CTA

2. `app/tuyen-dung/page.tsx`:
   - Hero
   - Job listing section: "Nhân viên kinh doanh BĐS"
   - Lương + chế độ (REWRITE từ content gốc, BỎ caps lock, làm tone professional)
   - Form ứng tuyển: Họ tên, SĐT, Email, CV upload (optional), Lời nhắn
   - Submit → mailto

3. `app/lien-he/page.tsx`:
   - Layout 2 cột: info trái, form phải
   - Trái: địa chỉ, hotline, email, Zalo, Messenger, giờ làm việc
   - Google Maps embed (iframe đơn giản, không API key)
   - Phải: form contact đầy đủ
```

### Verify Phase 4
- [ ] Tất cả 8 dự án có page riêng, load được
- [ ] Tất cả posts có page riêng
- [ ] Homepage load đầy đủ 8 sections, dữ liệu thật
- [ ] Mobile responsive mọi page
- [ ] Click qua lại giữa các page mượt
- [ ] Tất cả ảnh load local (không còn URL 1992land.com)

---

## PHASE 5 — Polish Pass (theo checklist video)

**Mục tiêu:** Từ "professional" → "expensive look".

### [CLAUDE PROMPT 5] — Polish pass

```
Review toàn bộ site theo checklist 8 điểm dưới đây. Với mỗi điểm:
1. Đánh giá hiện trạng (1-10)
2. Liệt kê gì còn thiếu
3. Fix nó

Checklist:

[1] VISUAL HIERARCHY
- Hero có dominant chưa? Heading có lớn nhất page không?
- Featured projects có lớn hơn rõ rệt grid bên dưới không?
- Mỗi page có 1 focal point rõ ràng?

[2] TYPOGRAPHY
- Scale rõ ràng: h1 > h2 > h3 > body, ít nhất 1.25 ratio
- Line-height: heading 1.1-1.2, body 1.6-1.7
- Letter-spacing: heading tight, all-caps wide
- Numeric dùng tabular-nums cho giá tiền

[3] SPACING
- Section padding-y: 80px desktop, 48px mobile
- Container padding-x: 24px mobile, 32px tablet, 64px desktop
- Gap giữa cards: ≥ 24px
- KHÔNG có section nào chật chội

[4] MICRO-ANIMATIONS
- Scroll reveal: section fade-up khi vào viewport (Framer Motion)
- Hover state cho mọi link/button
- Card hover: scale 1.02 + shadow grow
- Page transition: subtle fade between routes
- Button: press effect (scale 0.98)
- KHÔNG over-animate. Subtle is key.

[5] MOBILE
- Test viewport 375px (iPhone SE), 390px (iPhone 14), 768px (iPad)
- Touch target ≥ 44px
- Hamburger menu hoạt động
- Floating CTA không che content
- Form input không bị zoom khi focus (font-size ≥ 16px)

[6] PERFORMANCE
- Chạy `pnpm build && pnpm start`
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
- next/image cho tất cả ảnh
- Font display: swap
- Defer non-critical JS

[7] CTAs
- KHÔNG dùng "Gọi cho Thọ" (quá casual)
- DÙNG: "Nhận tư vấn miễn phí", "Đặt lịch xem dự án", "Liên hệ chuyên gia"
- Primary CTA mỗi page rõ ràng
- Floating CTA có cả 3 channel: Phone + Zalo + Messenger

[8] BRAND CONSISTENCY
- Color: chỉ dùng palette trong brief, KHÔNG random color
- Logo: chỉ dùng 1 version, nhất quán size
- Tone of voice: chuyên nghiệp, ấm áp — KHÔNG sales-y, KHÔNG caps lock
- OG image: tạo 1 default cho site + 1 cho mỗi dự án (dùng @vercel/og)
- Favicon: từ logo

Sau khi fix, summary bằng bảng: 8 items, score trước, score sau.
```

### Verify Phase 5
- [ ] Lighthouse desktop ≥ 90/95/95/100
- [ ] Lighthouse mobile ≥ 85/95/95/100
- [ ] Animation smooth, không jank
- [ ] Mọi page có scroll reveal
- [ ] Floating CTA hoạt động trên mobile
- [ ] Browser test: Chrome, Safari, Firefox

---

## PHASE 6 — Deploy lên Cloudflare Pages (FREE)

**Mục tiêu:** Live tại `1992land.com` với SSL, CDN global, $0/tháng.

### Bước 6.1 — Config Next.js static export

### [CLAUDE PROMPT 6A] — Configure static export

```
Cấu hình project để static export deploy được lên Cloudflare Pages:

1. Sửa `next.config.mjs`:
   - output: 'export'
   - images: { unoptimized: true } HOẶC dùng @cloudflare/next-on-pages
   - trailingSlash: true (tốt cho static hosting)

2. Đảm bảo tất cả page có generateStaticParams (cho dynamic routes)

3. Tạo `wrangler.toml` cho Cloudflare:
   name = "1992land"
   compatibility_date = "2026-05-01"
   pages_build_output_dir = "out"

4. Test local: pnpm build → folder `out/` phải có index.html và mọi route

5. Tạo `.gitignore` chuẩn

6. Tạo README.md với hướng dẫn deploy
```

### Bước 6.2 — Setup GitHub repo

```bash
git init
git add .
git commit -m "Initial: 1992land rebuild"

# Tạo repo private trên github.com/new
git remote add origin git@github.com:[USERNAME]/1992land-rebuild.git
git push -u origin main
```

### Bước 6.3 — Deploy Cloudflare Pages

1. Đăng nhập `dash.cloudflare.com` (tạo account free nếu chưa có)
2. Workers & Pages → Create → Pages → Connect to Git
3. Chọn repo `1992land-rebuild`
4. Build settings:
   - Framework preset: **Next.js (Static HTML Export)**
   - Build command: `pnpm build`
   - Build output: `out`
   - Node version env var: `NODE_VERSION=20`
5. Deploy → đợi build xong → có URL `1992land.pages.dev`

### Bước 6.4 — Point custom domain

1. Trong Cloudflare Pages project → Custom domains → Add `1992land.com`
2. Cloudflare yêu cầu chuyển NS hoặc thêm CNAME:
   - **Option A (recommended):** Chuyển nameserver domain `1992land.com` sang Cloudflare → full DNS qua CF
   - **Option B:** Chỉ thêm CNAME `1992land.com` → `1992land.pages.dev` ở DNS provider cũ
3. Đợi SSL cấp tự động (5-15 phút)

### Bước 6.5 — Backup WordPress hiện tại

**TRƯỚC KHI** chuyển DNS:
1. Login WordPress admin
2. Export tất cả posts/pages: Tools → Export → All content → Download .xml
3. Backup database qua hosting cPanel (phpMyAdmin → Export SQL)
4. Backup `/wp-content/uploads/` qua FTP
5. Lưu 3 file trên vào ổ cứng + Google Drive

### Bước 6.6 — Setup redirects cho URL cũ

Tạo file `public/_redirects` (Cloudflare Pages syntax):

```
# Redirect WordPress legacy URLs → new structure
/?page_id=1012  /gioi-thieu  301
/?page_id=1255  /du-an  301
/?page_id=1014  /lien-he  301
/?page_id=1404  /tuyen-dung  301
/?cat=16        /tin-tuc  301

# Project pages
/?page_id=3307  /du-an/salacia-villas-phu-my  301
/?page_id=3305  /du-an/ansana-by-kita  301
/?page_id=3303  /du-an/lusso-sai-gon  301
/?page_id=3301  /du-an/water-concept  301
/?page_id=3299  /du-an/the-quay-phuoc-hai  301
/?page_id=3297  /du-an/thanh-phu-centre-point  301
/?page_id=3295  /du-an/sun-group-cu-lao-pho  301
/?page_id=3293  /du-an/river-collection-an-gia  301

# Old blog posts — script generated từ extract-content.mjs
# /?p=2128  /tin-tuc/[slug]  301
# ... (Claude Code tự gen theo posts đã extract)

# Catch-all old WP paths
/wp-content/*  /  301
/wp-admin/*    /  301
```

### Verify Phase 6
- [ ] `1992land.pages.dev` load được
- [ ] `https://1992land.com` load được, SSL valid (cert Cloudflare)
- [ ] Test 10 URL cũ → redirect 301 đúng
- [ ] Test trên 4G mobile, load < 3s
- [ ] WordPress backup đã lưu ≥ 2 nơi
- [ ] Google Search Console: submit sitemap mới
- [ ] Submit URL change ở Search Console

---

## PHASE 7 — Sau khi live (tuần 1)

### Monitoring
- [ ] Cloudflare Analytics: kiểm tra traffic, không có spike lỗi 404
- [ ] Search Console: index status, coverage report
- [ ] PageSpeed Insights real URL: confirm ≥90

### Quick wins
- [ ] Thêm Google Tag Manager (nếu cần track)
- [ ] Submit lại sitemap: `https://1992land.com/sitemap.xml`
- [ ] Update Facebook fanpage links → trỏ URL mới
- [ ] Update Google Business Profile

### Cleanup
- [ ] Sau 30 ngày không lỗi: cancel hosting WordPress cũ → tiết kiệm chi phí tiếp
- [ ] Giữ backup .xml + SQL + uploads vĩnh viễn

---

## Appendix A — File CLAUDE.md cho project

Tạo `CLAUDE.md` trong root project, paste nội dung sau (Claude Code tự đọc mỗi session):

```markdown
# 1992land Rebuild — Project Context

## Brand
1992 Land — môi giới BĐS HCMC. Tagline: "Giá Trị Kiến Tạo Lòng Tin"
Owner: Nguyễn Hữu Thọ, 0909474123, Thủ Đức.

## Stack
Next.js 15 App Router, static export, Tailwind, shadcn/ui, MDX, 
Framer Motion. Deploy Cloudflare Pages.

## Content
- content/projects/*.mdx — 8 dự án BĐS
- content/posts/*.mdx — blog tin tức
- content/testimonials.json — 4 reviews

## Rules
- KHÔNG dùng client component nếu không cần state/effect
- KHÔNG over-abstract. Component < 150 dòng.
- KHÔNG dùng tone sales nóng ("CỰC KỲ", "NHẤT THỊ TRƯỜNG")
- KHÔNG caps lock trong content
- Mọi ảnh dùng next/image với width/height explicit
- Mọi link external có target="_blank" rel="noopener"
- Tiếng Việt là ngôn ngữ chính, không mix English trong UI

## Brief đầy đủ ở brief.md
```

---

## Appendix B — Cost breakdown (so với phương án thay thế)

| Phương án | Setup | Tháng | Năm 1 |
|---|---|---|---|
| **CF Pages (kế hoạch này)** | 0đ | 0đ | 0đ |
| Hostinger (theo video) | 0đ | ~80k | ~960k |
| WordPress shared hosting cũ | 0đ | ~100k | ~1.2M |
| VPS riêng + nginx | 0đ | ~200k | ~2.4M |

→ Tiết kiệm 1-2 triệu/năm so với phương án phổ biến nhất.

---

## Appendix C — Estimate thời gian

| Phase | Time | Cumulative |
|---|---|---|
| Phase 0 — Setup | 1h | 1h |
| Phase 1 — Extract content | 3-4h | 5h |
| Phase 2 — Brief + references | 2h | 7h |
| Phase 3 — Foundation | 4h | 11h |
| Phase 4A — Homepage | 4h | 15h |
| Phase 4B — Projects | 4h | 19h |
| Phase 4C — Blog | 3h | 22h |
| Phase 4D — Static pages | 3h | 25h |
| Phase 5 — Polish | 6h | 31h |
| Phase 6 — Deploy | 2h | 33h |

Tổng ~33 giờ làm việc tập trung = 4-5 ngày full-time hoặc 1-2 tuần part-time.

---

## Appendix D — Risk & Mitigation

| Risk | Mitigation |
|---|---|
| WP REST API bị block | Fallback wget mirror (Lớp 2 trong Phase 1) |
| Ảnh dự án quá lớn, load chậm | sharp resize + WebP trong extract script |
| SEO traffic drop sau migrate | 301 redirects đầy đủ + sitemap mới + Search Console |
| Form contact không hoạt động | Phase 1: dùng mailto. Phase sau: integrate Cloudflare Workers free tier |
| Cần đăng bài mới sau deploy | Edit MDX file → git push → CF auto rebuild (≤ 2 phút) |

---

## Hết Plan

**Next action cho Jimmy:**
1. Đọc qua Plan này (đặc biệt Phase 0 và Phase 1)
2. Bắt đầu Phase 0 — Setup môi trường

References và color palette ĐÃ CHỐT trong Phase 2 brief — không cần quyết định 
thêm. Có thể đi thẳng từ Phase 0 → Phase 6.

**Mỗi khi xong 1 Phase:** verify đủ checklist → commit git → next phase.
