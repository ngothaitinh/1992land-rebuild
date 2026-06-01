# FINAL PLAN — 1992Land Go Live

> Phiên bản final sau khi Jimmy chốt scope. Mục tiêu: **GO LIVE SỚM NHẤT** 
> với đủ thông tin + Google Ads ready. Telegram automation = Phase 2 sau launch.

---

## 1. Locked Decisions

| Quyết định | Chốt |
|---|---|
| Domain `1992land.com` | Jimmy nắm |
| n8n integration | KHÔNG |
| Bitrix24 | KHÔNG |
| Anh Thọ tự đăng nhập admin | KHÔNG — Jimmy là gatekeeper |
| Decap CMS | CÓ — nhưng chỉ Jimmy dùng |
| Maintenance | Jimmy hỗ trợ handover, nhận yêu cầu qua Telegram |
| Focus chính | Go live ASAP + Google Ads ready |
| Telegram automation | Phase 2 sau go-live |

---

## 2. Kiến trúc final (đã đơn giản hoá)

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND — Cloudflare Pages ($0)                            │
│  Next.js 15 static + Tailwind + MDX                          │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ DECAP CMS    │  │ FORMS        │  │ ANALYTICS    │
   │ (Jimmy edit) │  │ Web3Forms    │  │ GA4 + GAds   │
   │ Free, GitHub │  │ Free 250/mo  │  │ + Meta Pixel │
   └──────────────┘  └──────────────┘  └──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Email + Telegram │
                    │ notify (lead)    │
                    └──────────────────┘

────────────────────────────────────────────────────────────────
  PHASE 2 (sau go-live) — không xây ngay
────────────────────────────────────────────────────────────────

   ┌─────────────────────────────────────────────────────┐
   │  TELEGRAM BOT — Anh Thọ dictate content              │
   │  CF Worker → Claude API format → GitHub commit       │
   │  → CF Pages auto rebuild (~2 phút)                   │
   └─────────────────────────────────────────────────────┘
```

---

## 3. Phase 1 — Go Live (Tuần 1-2)

### 3.1. Deep extraction (Day 1)
Theo prompt `[CLAUDE PROMPT DEEP-EXTRACT]` trong ARCHITECTURE.md Section 5.

**Một thay đổi nhỏ trong schema:** bỏ field `bitrix_pipeline_id`, thêm 
field `google_ads_campaign_id` (optional):

```yaml
# content/projects/[slug].mdx
---
id: prj_lusso_sai_gon
slug: lusso-sai-gon
title: Lusso Sài Gòn

project_type: can-ho
status: dang-mo-ban
city: tp-hcm
district: quan-7

developer: ...
price_from: 5000000000
price_to: 12000000000
area_from: 65
area_to: 150
unit_count: 480

hero_image: /images/projects/lusso/hero.jpg
gallery: [...]

# SEO/AEO
meta_title: ~
meta_description: ~
faq:
  - q: "Lusso Sài Gòn giá bao nhiêu?"
    a: "..."
  - q: "Lusso Sài Gòn ở đâu?"
    a: "..."

lat: 10.736
lng: 106.722
address_full: "..."

# Google Ads (nếu chạy campaign cho dự án này)
google_ads_campaign_id: ~      # ID campaign tương ứng
google_ads_conversion_label: ~ # Label cho conversion event

created_at: 2026-05-15T00:00:00Z
updated_at: 2026-05-30T00:00:00Z
---
```

### 3.2. Build site (Day 2-5)
Theo PLAN.md gốc Phase 3-4, KHÔNG có thay đổi lớn.

### 3.3. Google Ads readiness (Day 5-6) — QUAN TRỌNG

Phần này thêm mới so với plan gốc, vì đây là yêu cầu mới của anh Thọ.

#### a. Conversion tracking setup
Cài 3 tracking đồng thời:
1. **GA4** — base analytics, audience, behavior
2. **Google Ads gtag** — conversion tracking
3. **Meta Pixel** — anh Thọ có thể chạy thêm Facebook Ads

Cài `components/Analytics.tsx`:
```tsx
// next/script với strategy="afterInteractive"
// GA4 + Google Ads Conversion Linker + Meta Pixel
// Track events:
//   - page_view (auto)
//   - view_project (custom — fire khi xem project detail)
//   - phone_click (custom — fire khi click số ĐT)
//   - form_submit (custom — fire khi submit form)
//   - zalo_click (custom — fire khi click Zalo)
//   - generate_lead (Google Ads conversion event)
```

#### b. Landing pages cho Google Ads
- Trang chủ + 8 project detail pages tự nhiên đã là landing page
- Mỗi project page phải đáp ứng:
  - LCP < 2s (Quality Score factor)
  - Above-the-fold: tên + giá + vị trí + 1 CTA + 1 phone number
  - Form contact ngay trong trang (không phải đi sang /lien-he)
  - Trust signals: số năm kinh nghiệm, số deal, testimonial
  - Mobile-first (60%+ traffic Google Ads BĐS là mobile)

#### c. Phone tracking
- Anh Thọ có thể dùng Google Forwarding Number (qua Google Ads):
  - Cài gtag với `phone_conversion_number: '0909474123'`
  - Google tự thay thế số hiển thị bằng số forwarding khi user đến từ Ads
- HOẶC dùng số thường nhưng track click event:
  - `<a href="tel:+84909474123" onClick="gtag('event', 'phone_click', ...)">`

#### d. Schema markup (AEO + SEO)
Mỗi page có JSON-LD đúng type:

**Trang chủ:**
```json
{
  "@type": "RealEstateAgent",
  "name": "1992 Land",
  "founder": "Nguyễn Hữu Thọ",
  "telephone": "+84909474123",
  "address": {...},
  "areaServed": ["TP HCM", "Vũng Tàu", "Bình Dương", "Long An", "Đồng Nai"],
  "aggregateRating": {...} // nếu có review thật
}
```

**Project detail:**
```json
{
  "@type": "Product",  // BĐS dùng Product cho dễ index
  "name": "Lusso Sài Gòn",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": 5000000000,
    "highPrice": 12000000000,
    "priceCurrency": "VND"
  },
  "image": [...],
  "description": "..."
}
```

**FAQ section trên mỗi project:**
```json
{
  "@type": "FAQPage",
  "mainEntity": [...] // từ field `faq` trong frontmatter
}
```

### 3.4. Forms đơn giản (Day 6) — KHÔNG dùng n8n

**Quyết định:** Dùng **Web3Forms** (free 250 submissions/tháng) cho Phase 1.

Vì sao không tự build:
- Setup 5 phút vs 2 giờ
- Đủ cho lưu lượng dự kiến đầu (BĐS broker, không spam)
- Có thể upgrade sau (Phase 2 thay bằng CF Worker)

Setup:
1. Đăng ký https://web3forms.com với email anh Thọ
2. Tạo 1 access key
3. Tất cả form POST đến `https://api.web3forms.com/submit` với:
```jsx
<form action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="YOUR-KEY" />
  <input type="hidden" name="from_name" value="1992Land Website" />
  <input type="hidden" name="subject" value="[Lead] Liên hệ từ trang Lusso Sài Gòn" />
  <input type="hidden" name="redirect" value="https://1992land.com/cam-on" />
  <input name="ho_ten" required />
  <input name="so_dien_thoai" required />
  <input name="email" />
  <input type="hidden" name="du_an_quan_tam" value="lusso-sai-gon" />
  <textarea name="loi_nhan" />
  <button>Gửi</button>
</form>
```

Email lead → `nguyenhuutho911@gmail.com` (anh Thọ) + cc Jimmy.

**Bonus telegram notify:** Web3Forms hỗ trợ webhook → trỏ về Telegram bot 
notify channel của anh Thọ.

### 3.5. AEO optimization (Day 7)

AEO (Answer Engine Optimization) — tối ưu cho ChatGPT, Perplexity, Google AI:

- **FAQ section** trên mỗi project (đã có trong schema 3.1)
- **Structured data** đầy đủ (đã làm 3.3.d)
- **llms.txt** ở root site — file giúp AI crawler hiểu cấu trúc:
  ```
  # 1992 Land — Môi giới BĐS HCMC
  
  > Đơn vị môi giới bất động sản tại TP Thủ Đức, hoạt động tại HCMC, 
  > Vũng Tàu, Bình Dương, Long An, Đồng Nai.
  
  ## Dự án đang phân phối
  - [Lusso Sài Gòn](/du-an/lusso-sai-gon) — căn hộ Quận 7, 5-12 tỷ
  - [Salacia Villas Phú Mỹ](/du-an/salacia-villas-phu-my) — biệt thự Vũng Tàu
  - ...
  
  ## Liên hệ
  Nguyễn Hữu Thọ — 0909 474 123
  ```
- **Sitemap.xml + robots.txt** chuẩn
- **Internal linking** giữa project và blog posts liên quan
- **Reading time + last_updated** rõ ràng trên mỗi bài
- **Author markup** với JSON-LD Person cho anh Thọ

### 3.6. Decap CMS cho Jimmy (Day 7)

Setup Decap như prompt `[CLAUDE PROMPT FIX-3]` trong PLAN-ADDENDUM.md.

Chỉ Jimmy có quyền — config:
```yaml
backend:
  name: github
  repo: jimmy-username/1992land-rebuild
  branch: main
  
# Chỉ ai được invite collaborator mới login được
```

### 3.7. Deploy + verify (Day 8)

Theo PLAN.md gốc Phase 6, thêm:

- [ ] Submit sitemap Google Search Console
- [ ] Verify ownership ở Google Ads (cần để chạy ads)
- [ ] Test conversion: submit form thử → confirm event hit GA4 + Google Ads
- [ ] Test phone click: bấm số → confirm event
- [ ] Lighthouse mobile ≥ 90 (Google Ads Quality Score)
- [ ] Schema validator: schema.org/validator chấp nhận tất cả JSON-LD
- [ ] Rich Results Test (Google): hiển thị FAQ + Product

---

## 4. Phase 2 — Telegram Bot Automation (Sau go-live)

### 4.1. Use case của anh Thọ

```
Anh Thọ → Telegram → 1992Land Bot:
  "Thêm dự án mới:
   Tên: ABC Garden
   Vị trí: Quận 9
   Giá: 3-5 tỷ
   Diện tích: 60-80m2
   CĐT: Công ty XYZ
   [đính kèm 5 ảnh]"

Bot → trả lời ngay:
  "Đã nhận. Đang xử lý..."

(15 giây sau)

Bot → trả lời tiếp:
  "✅ Đã tạo dự án 'ABC Garden' tại /du-an/abc-garden
   Site đang rebuild, 2 phút nữa live.
   [Preview link]"
```

### 4.2. Kiến trúc

```
Anh Thọ Telegram message + photos
         │
         ▼
Telegram Bot API → CF Worker webhook
         │
         ├─► Parse message
         ├─► Detect intent (thêm dự án / thêm bài / cập nhật)
         ├─► Download photos → upload GitHub
         ├─► Call Claude API:
         │     "Format thành MDX frontmatter chuẩn schema, 
         │      viết description + 5 FAQ chuẩn AEO/SEO"
         ├─► Commit MDX file vào GitHub via Octokit
         └─► Reply Telegram với preview link

CF Pages tự rebuild → live ~2 phút
```

### 4.3. Cost Phase 2

| Component | Free tier | Đủ cho |
|---|---|---|
| CF Workers | 100k req/day free | ~3000 bot interactions/ngày |
| Telegram Bot API | Free unlimited | — |
| Claude API | Pay per use | ~$0.001/dự án (rất rẻ) |
| GitHub API | 5000 req/hour | Vượt xa nhu cầu |

**Ước tính:** Anh Thọ đăng 10 dự án/tháng + 30 bài blog/tháng = ~$0.04/tháng 
Claude API. Coi như free.

### 4.4. Build prompt (KHÔNG làm Phase 1, chỉ sau go-live)

```
[Phase 2 prompt — KHÔNG đưa Claude Code ngay, để sau khi site live ổn định]

Build CF Worker tại Cloudflare để xử lý Telegram bot cho 1992Land:

1. Tạo bot mới qua @BotFather, lấy token
2. Worker endpoint: POST /webhook/telegram
3. Verify Telegram secret token
4. Parse incoming message:
   - Text message → intent detection
   - Photo → download, upload GitHub via Contents API
5. Intent classifier (dùng Claude API):
   - "thêm dự án" / "dự án mới"
   - "thêm bài viết" / "tin tức"
   - "cập nhật dự án X"
   - "xoá / ẩn dự án X"
   - "hỏi đáp" — bot trả lời câu hỏi không phải command
6. Cho từng intent:
   - Extract structured data từ free-text bằng Claude API
   - Generate MDX file với frontmatter đầy đủ + FAQ + meta
   - Commit GitHub
   - Reply với link preview

Auth:
- Chỉ chấp nhận message từ Telegram user ID của anh Thọ + Jimmy
- Reject all others

KHÔNG build ngay. Đây là spec cho Phase 2 sau khi site live ổn định.
```

---

## 5. Roadmap thực hiện

### Tuần 1 — Foundation + Content
- Day 1: Deep extraction (chạy wget + Claude Code chạy script extract)
- Day 2-3: Setup project + Phase 3 foundation (header, footer, layout, theme)
- Day 4-5: Phase 4 build all pages với content thật
- Day 6: Forms (Web3Forms) + Analytics setup
- Day 7: AEO + schema markup + Decap CMS

### Tuần 2 — Polish + Launch
- Day 8: Polish pass (Issue 2 checklist)
- Day 9: Google Ads conversion tracking + Search Console
- Day 10: Final QA + deploy
- Day 11: Anh Thọ review → fix nhanh
- Day 12: GO LIVE

### Sau go-live (tuỳ thời gian Jimmy)
- Phase 2: Telegram bot automation
- Optional: Virtual tour Panora360 cho dự án nổi bật
- Optional: Customer save-favorites (Layer 6 nếu thật cần)

---

## 6. Checklist cuối — Trước khi GO LIVE

### Content
- [ ] 8/8 dự án có MDX đầy đủ với ≥5 ảnh + FAQ + meta
- [ ] ≥10 bài blog migrated
- [ ] About page với chân dung anh Thọ
- [ ] Contact info chính xác (số ĐT, email, địa chỉ, giờ làm việc)

### Tracking
- [ ] GA4 property tạo + measurement ID
- [ ] Google Ads account tạo + conversion ID + labels
- [ ] Meta Pixel ID
- [ ] Test 5 events fire đúng (page_view, view_project, phone_click, form_submit, generate_lead)

### Forms
- [ ] Web3Forms access key
- [ ] Test submission → email arrives
- [ ] Optional: Telegram notify channel hoạt động

### SEO/AEO
- [ ] sitemap.xml + robots.txt + llms.txt
- [ ] JSON-LD validate pass cho tất cả page type
- [ ] OG image + Twitter card cho từng page
- [ ] hreflang vi-VN
- [ ] Submit Search Console + Bing Webmaster

### Performance
- [ ] Lighthouse mobile Performance ≥ 90
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Tất cả ảnh dùng next/image hoặc preload

### Branding
- [ ] Apply checklist 8 điểm Issue 2 (PLAN-ADDENDUM)
- [ ] Pass 6/8 minimum
- [ ] Favicon + OG default

### Deploy
- [ ] DNS point đúng
- [ ] SSL valid
- [ ] 301 redirects URL cũ
- [ ] Backup WP source code + DB

---

## 7. Cost Summary Final

| Khoản | Phase 1 | Phase 2 | Năm 1 |
|---|---|---|---|
| Cloudflare Pages | $0 | $0 | $0 |
| Cloudflare Workers | — | $0 (free tier) | $0 |
| Domain renewal | — | — | ~250k đ |
| Web3Forms | $0 (250/mo free) | optional bỏ | $0 |
| Claude API | $0 | ~$1/tháng | ~$12 |
| Google Ads (anh Thọ chi) | tuỳ ngân sách | tuỳ | tuỳ |
| **TỔNG ngoài Ads** | **$0** | **~$1/tháng** | **~250k + $12** |

So với WordPress hosting cũ ~1.2tr/năm → tiết kiệm ~900k/năm + nâng cấp 
chất lượng + có automation.

---

## 8. Action item cho Jimmy ngay sau đọc xong

1. **Confirm:** đọc plan thấy OK không, có gì cần điều chỉnh?
2. **Lấy 3 thông tin để config:**
   - Email anh Thọ sẽ dùng nhận lead notification (chắc là `nguyenhuutho911@gmail.com`?)
   - Telegram username/ID anh Thọ để Phase 2 setup bot
   - Google Ads account của anh Thọ đã có chưa, nếu chưa cần tạo trước
3. **Bắt đầu Phase 1 Day 1:** Chạy lệnh wget deep mirror (ARCHITECTURE.md Section 5)
4. **Đưa Claude Code prompt:** `[CLAUDE PROMPT DEEP-EXTRACT]` trong ARCHITECTURE.md

Bắt đầu khi sẵn sàng. Mình ở đây nếu kẹt phase nào.
