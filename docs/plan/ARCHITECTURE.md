# ARCHITECTURE — Scale-ready cho 1992land.com (anh Thọ)

> Context: Jimmy build web cho anh Thọ làm thật. Cần thiết kế kiến trúc 
> cho phép scale về sau, KHÔNG over-build ngay bây giờ.

---

## 1. "Scale up" nghĩa là gì? — 6 kịch bản

Trước khi quyết kiến trúc, định nghĩa rõ "scale" gồm những gì:

| # | Kịch bản | Khả năng xảy ra | Tốn kém nếu build ngay |
|---|---|---|---|
| S1 | Nhiều dự án hơn (8 → 50 → 200) | Cao | Thấp — static đã handle |
| S2 | Nhiều content/blog (16 → 500 bài) | Cao | Thấp — static đã handle |
| S3 | Lead capture form → Bitrix24 CRM tự động | Cao (đang làm BĐS) | THẤP — n8n đã có |
| S4 | Anh Thọ tuyển thêm nhân viên cùng quản trị site | Trung | Thấp — Decap CMS handle multi-user |
| S5 | Customer search/filter (lọc theo giá, khu vực) | Trung | Trung — client-side OK |
| S6 | Customer login, save favorites, request viewing | THẤP | CAO — cần backend + DB |
| S7 | Virtual tour 360 (như Panora360 Jimmy đã build) | Trung-cao | Trung — embed iframe |
| S8 | Multi-agent platform (10 môi giới độc lập) | Thấp | Rất cao — refactor lớn |

**Quy tắc:** Build cho S1-S4 ngay. Architecture-ready cho S5-S7. Skip S8.

---

## 2. Kiến trúc đề xuất — Layered, tận dụng stack Jimmy có sẵn

```
┌─────────────────────────────────────────────────────────────┐
│                      USER / KHÁCH HÀNG                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1 — FRONTEND (Cloudflare Pages, $0)                   │
│  Next.js 15 static export + Tailwind + MDX                   │
│  → Handles S1, S2 unlimited                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  LAYER 2 — CMS   │ │ LAYER 3 — FORMS  │ │ LAYER 4 — SEARCH │
│  Decap CMS, $0   │ │ n8n webhook      │ │ Pagefind, $0     │
│  GitHub auth     │ │ (Jimmy đã có)    │ │ Client-side      │
│  → S4 multi-user │ │ → S3 to Bitrix24 │ │ → S5 filter      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5 — EXISTING STACK (Jimmy đã có sẵn)                  │
│  n8n self-hosted (Interdata VPS)  │  Bitrix24 Cloud           │
│  → Process leads, send notifications, sync CRM                │
│  → Schedule reports, analytics aggregation                    │
└─────────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────
          PHẦN DƯỚI = KHÔNG BUILD NGAY, chỉ kiến trúc-ready
────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│  LAYER 6 — USER ACCOUNTS (chỉ build khi S6 thật sự cần)      │
│  Option A: Supabase free tier                                 │
│  Option B: Self-host (Pocketbase trên VPS của Jimmy)          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  LAYER 7 — VIRTUAL TOUR (embed khi có S7)                    │
│  Panora360 (Jimmy đã build) → iframe vào project detail      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Quyết định cụ thể — NOW vs LATER

### ✅ BUILD NGAY (scale-readiness, không phát sinh chi phí)

#### 3.1. Content model thiết kế chuẩn từ đầu
Schema MDX frontmatter phải đủ rộng để sau di chuyển sang DB không mất data:

```yaml
# content/projects/[slug].mdx
---
# Identity
id: prj_lusso_sai_gon              # ID stable (không đổi khi rename)
slug: lusso-sai-gon                 # URL slug
title: Lusso Sài Gòn

# Categorization
project_type: can-ho                # can-ho | biet-thu | dat-nen | nha-pho | nghi-duong
status: dang-mo-ban                 # sap-mo-ban | dang-mo-ban | da-ban-xong
city: tp-hcm                        # tp-hcm | vung-tau | binh-duong | long-an | dong-nai
district: quan-7

# Commercial
developer: Tập đoàn Mai Linh
price_from: 5000000000              # VND (number, không format)
price_to: 12000000000
area_from: 65                       # m2
area_to: 150
unit_count: 480

# Media
hero_image: /images/projects/lusso/hero.jpg
gallery:
  - /images/projects/lusso/01.jpg
  - /images/projects/lusso/02.jpg

# SEO
meta_title: ~
meta_description: ~

# Location (cho map sau này)
lat: 10.736
lng: 106.722
address_full: "Số... đường... Quận 7, TP HCM"

# Lead routing (cho S3)
assigned_agent: nguyen-huu-tho      # ID môi giới phụ trách
bitrix_pipeline_id: 5               # Pipeline trong Bitrix24

# Timestamps
created_at: 2026-05-15T00:00:00Z
updated_at: 2026-05-30T00:00:00Z
---
```

**Vì sao quan trọng:** Khi scale lên Layer 6 (DB), `id`, `slug`, `assigned_agent`, 
`bitrix_pipeline_id` đã có sẵn — chỉ migrate, không phải re-design data.

#### 3.2. Form submission qua n8n webhook (KHÔNG mailto)
- Tất cả form trên site POST đến 1 endpoint duy nhất: 
  `https://n8n.tpiland.vn:8443/webhook/1992land-leads`
- Payload chuẩn:
  ```json
  {
    "form_id": "contact-home",  // hoặc "project-detail-lusso", "tuyen-dung"
    "source_page": "/du-an/lusso-sai-gon",
    "submitted_at": "2026-06-01T10:30:00Z",
    "fields": {
      "name": "...",
      "phone": "...",
      "email": "...",
      "interested_project": "lusso-sai-gon",
      "message": "..."
    },
    "utm": { "source": "...", "medium": "...", "campaign": "..." }
  }
  ```
- n8n workflow xử lý: validate → push Bitrix24 → notify anh Thọ qua Telegram 
  → reply confirm email cho khách

**Vì sao quan trọng:** Sau này thêm form gì (newsletter, ứng tuyển, ký gửi, 
xem dự án...) chỉ cần thêm `form_id` mới ở client + 1 branch trong n8n workflow. 
KHÔNG cần code backend.

#### 3.3. Decap CMS từ đầu (không phải afterthought)
- Setup ngay Phase 4 → anh Thọ có thể tự edit từ ngày đầu live
- Multi-user: GitHub repo invite → có quyền admin
- Editorial workflow: bật draft → review → publish (cho team)

#### 3.4. Environment-based config (không hardcode)
File `.env.production`:
```
NEXT_PUBLIC_LEAD_WEBHOOK=https://n8n.tpiland.vn:8443/webhook/1992land-leads
NEXT_PUBLIC_SITE_URL=https://1992land.com
NEXT_PUBLIC_BITRIX_TRACK_ID=...
NEXT_PUBLIC_GA_ID=G-XXXXXXX
NEXT_PUBLIC_FB_PIXEL=...
```
**Vì sao quan trọng:** Đổi endpoint, thêm tracking → 1 dòng env, không sửa code.

#### 3.5. Analytics + CAPI từ đầu
Theo memory từ Facebook Ads system Jimmy đã build:
- GA4 cơ bản
- Meta Pixel + CAPI events qua n8n
- Mỗi project view = event "ViewContent"
- Mỗi form submit = event "Lead" (gửi cả Pixel + CAPI)
- Phone click = event "Contact"

**Vì sao quan trọng:** Anh Thọ chạy Facebook Ads → CAPI events tăng learning 
phase signal → ROAS tốt hơn. Đây là L1 trong roadmap Jimmy đã làm.

#### 3.6. Search/filter dạng static-ready
- Cài Pagefind ngay từ đầu cho /tin-tuc (search blog)
- Project listing: filter client-side bằng React state (8 dự án thì đủ)
- Sau lên 50+ dự án: cùng pattern, chỉ thêm pagination

---

### ⏸️ KHÔNG BUILD NGAY (chỉ kiến trúc-ready)

#### 3.7. User accounts (S6)
- KHÔNG build ngay vì chưa có demand
- Architecture-ready: khi cần, thêm Layer 6:
  - Recommended: **Pocketbase** trên VPS của Jimmy (1 file binary, SQLite, $0)
  - Tích hợp: Next.js → fetch từ pocketbase.tpiland.vn → render dynamic content
  - Migration: MDX projects → Pocketbase collections (script chạy 1 lần)

#### 3.8. Virtual tour 360 (S7)
- KHÔNG build ngay
- Architecture-ready: Project detail page có slot `<VirtualTour url={...}/>`
- Khi anh Thọ muốn tour cho dự án X: chụp panorama → upload Panora360 → 
  paste URL vào MDX frontmatter `virtual_tour_url`

#### 3.9. Multi-agent platform (S8)
- KHÔNG build, KHÔNG kiến trúc-ready
- Lý do: refactor cost cao, xác suất xảy ra thấp
- Nếu sau này thật sự cần → rewrite riêng, không cố ép vào codebase hiện tại

---

## 4. Bàn giao cho anh Thọ — Handover plan

Vì web cho anh Thọ làm thật, không phải của Jimmy. Cần handover document:

### 4.1. Tài khoản & truy cập
- [ ] Domain `1992land.com` — chuyển owner sang anh Thọ (Mắt Bão / nơi reg)
- [ ] GitHub repo — transfer ownership hoặc thêm anh Thọ làm admin
- [ ] Cloudflare Pages — invite anh Thọ vào Cloudflare account, hoặc transfer
- [ ] Decap CMS admin — anh Thọ + 1-2 nhân viên content team có quyền
- [ ] Bitrix24 pipeline — confirm pipeline ID cho lead routing

### 4.2. Document phải có
- [ ] `HANDOVER.md` ở root repo — hướng dẫn anh Thọ:
  - Cách đăng nhập `/admin/`
  - Cách thêm/sửa dự án, blog, testimonial
  - Cách xem lead trong Bitrix24
  - Cách check site đang live OK (1 trang status)
  - Khi nào cần gọi developer (Jimmy)
- [ ] Video screen-record 10 phút Jimmy demo từng tác vụ

### 4.3. Maintenance contract (Jimmy quyết)
- Nếu Jimmy duy trì hỗ trợ: định nghĩa SLA, phí tháng/năm
- Nếu handover hoàn toàn: hướng dẫn anh Thọ thuê freelancer khi có sự cố

---

## 5. Deep Extraction — Lấy HẾT thông tin anh Thọ từ WP cũ

Vì đây là yêu cầu mới của Jimmy ("lấy tất cả thông tin của anh ấy"), 
cần extract sâu hơn Phase 1 plan ban đầu.

### Mục tiêu

Không bỏ sót:
- Mọi text content (story anh Thọ, mô tả công ty, đặc điểm dự án)
- Mọi ảnh (chân dung anh Thọ nếu có, ảnh dự án, ảnh team, ảnh testimonial)
- Metadata: SEO title/description, OG image, alt text
- Contact info, social links, working hours
- Mọi testimonial + tên khách + dự án
- Recruitment info (chế độ, lương, yêu cầu)
- Floor plan, layout, master plan ảnh của từng dự án

### Lệnh chạy local (Jimmy chạy)

```bash
mkdir extraction && cd extraction

# Step 1: Sitemap discovery
curl -s -A "Mozilla/5.0" "https://1992land.com/sitemap.xml" -o sitemap.xml
curl -s -A "Mozilla/5.0" "https://1992land.com/sitemap_index.xml" -o sitemap-index.xml

# List all URLs từ sitemap
grep -oP '(?<=<loc>)[^<]+' sitemap*.xml | sort -u > all-urls.txt
wc -l all-urls.txt
# Expect: 30-100 URLs

# Step 2: Full mirror với wget (deep, include all assets)
wget --mirror \
  --convert-links \
  --adjust-extension \
  --page-requisites \
  --no-parent \
  --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  --wait=1 \
  --random-wait \
  --tries=3 \
  --timeout=30 \
  --level=10 \
  --accept-regex='1992land\.com' \
  https://1992land.com/

cd 1992land.com

# Step 3: Inventory
echo "=== HTML pages ==="
find . -name "*.html" | wc -l

echo "=== Images ==="
find . -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.gif" \) | wc -l

echo "=== PDFs (brochures, floor plans) ==="
find . -name "*.pdf" | wc -l

echo "=== Image sizes ==="
find . -type f \( -name "*.jpg" -o -name "*.png" \) -exec du -h {} + | sort -h | tail -20
```

### [CLAUDE PROMPT DEEP-EXTRACT]

```
Tôi đã chạy wget mirror toàn site cũ. Thư mục `extraction/1992land.com/` 
chứa:
- [X] HTML pages
- [Y] ảnh
- [Z] PDFs

Task: Extract TOÀN BỘ thông tin có thể có từ thư mục này, output dạng 
structured data + assets đã optimize.

Chi tiết:

1. Viết `scripts/deep-extract.mjs` (Node 20, ES modules):

   a. PARSE TẤT CẢ HTML files:
      - Dùng cheerio
      - Extract: title, meta description, OG tags, JSON-LD
      - Extract content chính: h1-h6, p, ul, ol, blockquote, table
      - Extract image references với alt text
      - Extract phone/email/zalo/social bằng regex

   b. CLASSIFY URLs theo pattern:
      - `?page_id=1012` hoặc `/gioi-thieu` → about
      - `?page_id=1014` hoặc `/lien-he` → contact
      - `?page_id=1404` hoặc `/tuyen-dung` → recruitment
      - `?page_id=33XX` hoặc URL chứa tên dự án → project
      - `?p=XXXX` hoặc `/tin-tuc/` → blog post
      - `?cat=XX` → category page
      - Home page → home

   c. OUTPUT CẤU TRÚC:
      ```
      content/
        ├── settings.json          # contact, social, working hours
        ├── about.mdx              # về anh Thọ + công ty
        ├── recruitment.mdx        # tuyển dụng
        ├── projects/[slug].mdx    # 1 file/dự án (full schema ở mục 3.1)
        ├── posts/[slug].mdx       # blog
        └── testimonials.json      # array of {name, project, quote, photo}
      ```

   d. IMAGE PROCESSING:
      - Copy ảnh sang `public/images/`
      - Phân loại folder:
        * `public/images/projects/[project-slug]/` 
        * `public/images/posts/[post-slug]/`
        * `public/images/team/` (ảnh anh Thọ nếu có)
        * `public/images/testimonials/`
        * `public/images/shared/` (logo, banner chung)
      - Optimize với sharp:
        * Resize max 1920px width
        * Convert sang WebP (giữ JPG backup)
        * Generate 3 sizes: -thumb (400w), -medium (800w), -hero (1920w)
      - Update tất cả MDX với path local đã optimize

   e. PDF HANDLING:
      - Move PDF sang `public/downloads/`
      - Phân loại: brochure, floor-plan, master-plan, price-list
      - Add reference vào project MDX frontmatter:
        ```yaml
        downloads:
          - { label: "Brochure", file: "/downloads/lusso-brochure.pdf" }
          - { label: "Mặt bằng", file: "/downloads/lusso-floor-plan.pdf" }
        ```

   f. METADATA HARVEST:
      - Tìm chân dung anh Thọ trong ảnh:
        * Tên file chứa "tho", "nguyen-huu-tho", "ceo", "founder", "avatar"
        * Báo cáo ra danh sách candidates, tôi confirm
      - Tìm logo: tên file chứa "logo", "brand"
      - Tìm contact info:
        * Phone: regex `\b09\d{8}\b`
        * Email: regex
        * Address: text trong section "Liên hệ"

2. CHẠY script, BÁO CÁO:
   - Bảng inventory: bao nhiêu HTML xử lý, bao nhiêu MDX tạo, bao nhiêu ảnh
   - List 5 ảnh nghi là chân dung anh Thọ (tôi sẽ confirm)
   - List section nào còn thiếu data (vd: không tìm thấy section "Giới thiệu" 
     trong HTML → cần Jimmy bổ sung thủ công)
   - File `EXTRACTION-REPORT.md` chứa tất cả phát hiện

3. KIỂM TRA TÍNH TOÀN VẸN:
   - Cross-reference: mỗi project MDX có hero_image trỏ tới file tồn tại?
   - Mỗi testimonial có ảnh không? Nếu không, log thiếu.
   - Có URL nào trong sitemap chưa được parse không?

YÊU CẦU CHẤT LƯỢNG:
- KHÔNG bịa data. Field nào không tìm được → để null + log thiếu.
- KHÔNG tóm tắt text. Copy nguyên văn (HTML → markdown qua turndown).
- KHÔNG bỏ ảnh dưới 100KB (có thể là icon, logo cần giữ).
- Verify Vietnamese encoding: không được mojibake (kiểm tra chuỗi "ư", "ơ", "ấ").
```

### Verify deep extraction

- [ ] `EXTRACTION-REPORT.md` tồn tại
- [ ] `content/settings.json` có đầy đủ: phone, email, zalo, address, working_hours
- [ ] `content/about.mdx` có ≥ 300 từ tiếng Việt
- [ ] 8/8 dự án có MDX với hero_image trỏ file tồn tại
- [ ] Mỗi project MDX có ≥ 5 ảnh trong gallery
- [ ] `public/images/team/` có ≥ 1 ảnh nghi là anh Thọ (Jimmy confirm)
- [ ] Tổng số ảnh local ≥ 80% so với inventory wget
- [ ] Grep "1992land.com/wp-content" trong content/ → 0 matches
- [ ] Test 5 ký tự tiếng Việt khó (ư ơ ấ ề ụ) trong MDX → render đúng

---

## 6. Roadmap thực hiện (cập nhật)

| Tuần | Task | Output |
|---|---|---|
| 1 | Deep extraction + audit | EXTRACTION-REPORT, content/ đầy đủ |
| 1 | Phase 0-3 PLAN.md gốc | Foundation chạy được |
| 2 | Phase 4 + apply Architecture (3.1-3.6) | Site có form n8n integration |
| 2 | Decap CMS setup (Layer 2) | Anh Thọ login /admin được |
| 3 | Phase 5 polish + Issue 2 personalization | Site Pass 6/8 audit |
| 3 | n8n workflow lead → Bitrix24 | Test 1 lead end-to-end |
| 4 | Phase 6 deploy + handover | Live + anh Thọ nhận tài khoản |

Tổng: ~4 tuần part-time hoặc 1.5 tuần full-time.

---

## 7. Câu hỏi cần Jimmy trả lời (để mình finalize)

1. **n8n endpoint:** Jimmy có sẵn sàng tạo webhook `/1992land-leads` trong 
   n8n instance hiện có không? Hay setup instance riêng cho 1992land?

2. **Bitrix24 pipeline:** Anh Thọ dùng chung Bitrix24 với TPI Land hay 
   có Bitrix24 account riêng? Cần biết để cấu hình credentials.

3. **Domain ownership:** Domain `1992land.com` hiện anh Thọ đang đứng tên 
   hay Jimmy hộ? Liên quan handover.

4. **Maintenance:** Sau khi live, Jimmy duy trì support hay handover 
   hoàn toàn?

5. **Scale priority:** Trong 6 kịch bản S1-S8, anh Thọ thực sự kỳ vọng cái 
   nào trong 6 tháng tới? (Trả lời sẽ điều chỉnh "architecture-ready" cho 
   những cái đó được ưu tiên.)

---

## 8. Tóm tắt — Vì sao kiến trúc này scale được

- **Frontend:** Static = unlimited traffic không tốn thêm tiền
- **Content:** MDX + Decap = anh Thọ tự quản lý hàng trăm dự án/bài
- **Leads:** n8n webhook = thêm form mới không cần code backend
- **Search:** Pagefind static = scale tới 10k+ records không cần server
- **Tracking:** CAPI qua n8n = tối ưu Facebook Ads của anh Thọ
- **Future user accounts:** Pocketbase trên VPS sẵn có = $0 thêm
- **Future virtual tour:** Embed Panora360 = re-use asset Jimmy có

**Tổng chi phí scale lên 200 dự án + 10k traffic/tháng + 100 leads/tháng = 
vẫn $0/tháng.** Chỉ phát sinh khi build Layer 6 (user accounts) — và khi đó 
business đã có doanh thu để chi trả.
