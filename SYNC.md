# SYNC — Đồng bộ codebase hiện tại với FINAL-PLAN

> Workflow cho Jimmy: codebase đã build trước, giờ cần sync với FINAL-PLAN 
> mà KHÔNG rebuild từ đầu.

---

## Quy trình tổng

```
1. SAFETY           → git branch riêng
2. PLACE PLAN FILES → docs/plan/
3. AUDIT            → Claude Code đọc + tạo GAP-REPORT (CHƯA sửa)
4. REVIEW           → Jimmy đọc GAP-REPORT, quyết định thứ tự
5. FIX TỪNG ITEM    → 1 prompt = 1 item, commit từng item
6. FINAL VERIFY     → checklist trước khi merge
```

---

## Bước 1 — Safety

```bash
cd [thư mục project]
git status            # Đảm bảo working tree clean
git add -A && git commit -m "checkpoint: before sync with FINAL-PLAN"
git checkout -b sync/final-plan
```

Nếu sai bất cứ lúc nào: `git checkout main` về lại được.

---

## Bước 2 — Đặt 4 file plan vào project

```bash
mkdir -p docs/plan
# Copy 4 file: PLAN.md, PLAN-ADDENDUM.md, ARCHITECTURE.md, FINAL-PLAN.md
# vào docs/plan/
```

Sau bước này thư mục có:
```
docs/plan/
├── PLAN.md
├── PLAN-ADDENDUM.md
├── ARCHITECTURE.md
└── FINAL-PLAN.md
```

---

## Bước 3 — PROMPT A: Audit & GAP Report

Mở Claude Code, paste prompt sau:

```
Trong thư mục `docs/plan/` có 4 file kế hoạch. FINAL-PLAN.md là phiên bản 
chốt cuối, các file khác là context tham khảo.

TASK: AUDIT codebase hiện tại so với FINAL-PLAN.md. KHÔNG SỬA bất cứ file 
nào ngoài việc tạo mới `docs/GAP-REPORT.md`.

OUTPUT: file `docs/GAP-REPORT.md` với 5 section:

## 1. ĐÃ CÓ (đúng plan)
Liệt kê những gì codebase đã match plan, kèm path file/folder.

## 2. THIẾU (chưa có, cần build)
Bảng:
| Item | File/folder dự kiến | Phức tạp (S/M/L) | Phụ thuộc |

Quy ước phức tạp:
- S = ≤30 phút (chỉnh 1-2 file)
- M = 1-2h (build 1 feature nhỏ)
- L = ≥3h (build module/integration)

## 3. SAI (đã có nhưng cần sửa)
Bảng:
| Vị trí (file:line) | Sai gì | Hướng sửa | Phức tạp |

## 4. THỪA (có nhưng plan không yêu cầu)
Bảng:
| Vị trí | Mô tả | Đề xuất (giữ/xoá/note) |

## 5. ĐỀ XUẤT THỨ TỰ SỬA
Bảng prioritized theo nguyên tắc:
1. Foundation trước (schema, config, layout)
2. Content extraction trước feature
3. Tracking/Analytics trước go-live
4. Personalization cuối

| # | Item | Section (Thiếu/Sai/Thừa) | Phức tạp | Block ai? |

============================================================
CHECKLIST CỤ THỂ — đối chiếu FINAL-PLAN Section 3:
============================================================

### Content schema (FINAL-PLAN 3.1)
- [ ] Có đủ field: id, slug, project_type, status, city, district?
- [ ] Có: developer, price_from, price_to, area_from, area_to, unit_count?
- [ ] Có: hero_image, gallery (array)?
- [ ] Có: faq (array of {q, a})?
- [ ] Có: lat, lng, address_full?
- [ ] Có: created_at, updated_at?
- [ ] KHÔNG có field thừa từ ARCHITECTURE cũ: bitrix_pipeline_id, 
      assigned_agent (đã bỏ trong FINAL-PLAN)?

### Forms (FINAL-PLAN 3.4)
- [ ] Form contact dùng Web3Forms (action URL chứa api.web3forms.com)?
- [ ] KHÔNG còn mailto: hoặc backend tự build?
- [ ] Mỗi form có hidden field: access_key, subject, redirect?
- [ ] Form trên project detail có hidden field du_an_quan_tam?

### Analytics & Tracking (FINAL-PLAN 3.3)
- [ ] GA4 measurement ID config (next.js env var)?
- [ ] Google Ads gtag conversion linker?
- [ ] Meta Pixel?
- [ ] Component Analytics.tsx hoặc tương đương?
- [ ] Events implement: page_view, view_project, phone_click, 
      form_submit, generate_lead, zalo_click?

### Schema markup / JSON-LD (FINAL-PLAN 3.3.d)
- [ ] Home: RealEstateAgent schema?
- [ ] Project detail: Product schema với offers (AggregateOffer)?
- [ ] Project detail: FAQPage schema từ frontmatter.faq?
- [ ] Validate qua schema.org validator không error?

### SEO & AEO (FINAL-PLAN 3.5)
- [ ] sitemap.xml generate đúng (tất cả routes)?
- [ ] robots.txt allow tất cả + reference sitemap?
- [ ] llms.txt ở root?
- [ ] OG image cho từng page?
- [ ] hreflang vi-VN trong layout?
- [ ] Mỗi project có FAQ section render từ frontmatter?

### Decap CMS (FINAL-PLAN 3.6)
- [ ] public/admin/index.html?
- [ ] public/admin/config.yml?
- [ ] Backend GitHub OAuth config?
- [ ] Collections: projects, posts, settings?
- [ ] Editorial workflow bật?

### Deep extraction (ARCHITECTURE Section 5)
- [ ] 8/8 dự án có MDX?
- [ ] Mỗi dự án có ≥5 ảnh trong gallery?
- [ ] Tất cả ảnh local trong public/images/ (grep "1992land.com/wp-content" = 0)?
- [ ] Ảnh đã optimize (WebP, 3 sizes: -thumb -medium -hero)?
- [ ] PDFs/brochures move sang public/downloads/?
- [ ] content/settings.json có contact info đầy đủ?
- [ ] content/about.mdx có ≥300 từ tiếng Việt?
- [ ] Có ít nhất 1 ảnh nghi là chân dung anh Thọ trong public/images/team/?

### Personalization (PLAN-ADDENDUM Issue 2A)
Score hiện tại bao nhiêu/8?
- [ ] 1. Signature element xuất hiện ≥3 chỗ?
- [ ] 2. Unique typography moment ≥1 chỗ?
- [ ] 3. Real portrait anh Thọ ở Home + About?
- [ ] 4. ≥3 con số cụ thể?
- [ ] 5. Voice copy nghe có cá tính, không generic AI?
- [ ] 6. Whitespace commitment (≥1 section dám để 60%+ trống)?
- [ ] 7. Unexpected layout (≥1 section phá grid 12-cột)?
- [ ] 8. Micro-detail có chăm chút?

### Performance & Quality
- [ ] Lighthouse mobile Performance ≥ 90?
- [ ] LCP < 2.5s?
- [ ] CLS < 0.1?
- [ ] Tất cả ảnh dùng next/image?
- [ ] Font Be Vietnam Pro + Inter cài qua next/font?

### Color & Brand (FINAL-PLAN / Brief)
- [ ] tailwind.config có color tokens navy + gold đầy đủ (50-950)?
- [ ] KHÔNG dùng pure black #000 (phải dùng ink #1A1A1A)?
- [ ] Phone "0909474123" đúng định dạng tel:+84909474123?

============================================================

YÊU CẦU NGHIÊM NGẶT:
- KHÔNG sửa file nào ngoài tạo mới docs/GAP-REPORT.md
- KHÔNG đề xuất rebuild from scratch
- Audit phải dựa trên FILE THỰC TẾ trong codebase, không bịa
- Mỗi finding phải có dẫn chứng (path file, line number, hoặc 
  command grep để verify)
```

**Sau khi Claude Code xong:**
- Đọc `docs/GAP-REPORT.md`
- Confirm: gap report có hợp lý không, có item nào hiểu sai không
- Nếu OK → sang Bước 4

---

## Bước 4 — Review & quyết định thứ tự

Đọc Section 5 (Đề xuất thứ tự sửa) của GAP-REPORT. Có 3 lựa chọn:

**(a) Theo thứ tự Claude Code đề xuất** — nhanh nhất

**(b) Chia thành milestone:**
- Milestone 1: Foundation gaps (schema, config) — phải fix trước mọi thứ
- Milestone 2: Content extraction gaps — phải đủ data
- Milestone 3: Feature gaps (forms, analytics, schema markup)
- Milestone 4: Personalization

**(c) Gửi cho Jimmy review** — share GAP-REPORT với mình, mình ưu tiên lại.

---

## Bước 5 — PROMPT B: Fix từng item

Cho MỖI item trong list, paste prompt sau (replace `[N]` và `[tên item]`):

```
Theo docs/GAP-REPORT.md item #[N]: [tên item]

TASK:
1. Đọc lại item này trong GAP-REPORT để hiểu scope chính xác
2. Đọc section liên quan trong docs/plan/FINAL-PLAN.md
3. Implement item, KHÔNG đụng file ngoài scope

YÊU CẦU NGHIÊM NGẶT:
- KHÔNG "tiện thể" sửa code không liên quan
- KHÔNG refactor adjacent code
- KHÔNG thêm comment giải thích — code self-explanatory
- Match style hiện tại trong codebase
- Mỗi dòng thay đổi phải trace về item này

KHI XONG:
1. Verify theo checklist FINAL-PLAN (section liên quan)
2. Update docs/GAP-REPORT.md:
   - Chuyển item này từ "THIẾU"/"SAI"/"THỪA" sang section "ĐÃ CÓ"
   - Update Section 5 prioritized list, đánh dấu item này done
3. Commit: git commit -m "sync: [item name]"
4. Báo cáo: what changed, what files touched, có gì cần Jimmy verify thủ công không
```

**Quan trọng:**
- 1 prompt = 1 item. KHÔNG gộp.
- Sau mỗi item: review diff bằng `git diff HEAD~1` hoặc qua VSCode/GitHub.
- Nếu sai → `git reset --hard HEAD~1` undo, paste lại prompt rõ hơn.

---

## Bước 6 — PROMPT C: Final verify trước merge

Khi GAP-REPORT chỉ còn "ĐÃ CÓ" hoặc "THỪA (giữ)", paste prompt cuối:

```
Toàn bộ items trong GAP-REPORT đã được sync. Chạy final verification 
trước khi merge branch sync/final-plan vào main.

TASK 1 — Smoke test:
- pnpm install (đảm bảo không lỗi dep)
- pnpm build (đảm bảo static export success)
- pnpm start hoặc dùng `npx serve out` để serve folder out/
- Liệt kê warning/error nếu có

TASK 2 — Functional verify:
Kiểm tra từng URL sau load được, không 404, không layout vỡ:
- /
- /du-an
- /du-an/lusso-sai-gon (hoặc bất kỳ project nào)
- /tin-tuc
- /tin-tuc/[1 post bất kỳ]
- /gioi-thieu
- /tuyen-dung
- /lien-he
- /admin (Decap CMS)
- /sitemap.xml
- /robots.txt
- /llms.txt

TASK 3 — SEO/Tracking smoke:
- View source 1 project page: có JSON-LD Product không?
- View source homepage: có JSON-LD RealEstateAgent không?
- View source project page: có FAQPage JSON-LD không?
- Network tab: GA4 + Google Ads + Meta Pixel có fire không?

TASK 4 — Final checklist (FINAL-PLAN Section 6):
Đối chiếu từng item trong "Checklist cuối — Trước khi GO LIVE" của 
FINAL-PLAN.md Section 6. Báo cáo Pass/Fail từng item.

OUTPUT: file `docs/PRE-LAUNCH-CHECKLIST.md` với kết quả 4 task trên.

KHÔNG fix gì ở phase này. Chỉ verify. Nếu phát hiện vấn đề, ghi vào 
PRE-LAUNCH-CHECKLIST.md để Jimmy xử lý sau.
```

Sau Prompt C:
- Đọc PRE-LAUNCH-CHECKLIST.md
- Fix nốt vấn đề (nếu có) → commit thêm
- Merge: `git checkout main && git merge sync/final-plan`
- Push: `git push origin main`
- Cloudflare Pages tự rebuild → site live với version đã sync

---

## Tips

**Khi Claude Code có xu hướng rebuild from scratch:**
→ Dừng ngay, nhắc lại: "Đọc Bước 5 Prompt B yêu cầu nghiêm ngặt. Chỉ sửa 
file trong scope item, không rebuild."

**Khi diff quá lớn cho 1 item:**
→ Có thể item đó thực ra là nhiều việc. Split:
"Item này gồm subtask A, B, C. Chỉ làm A trong prompt này. B, C để 
prompt riêng."

**Khi không chắc Claude Code hiểu đúng item:**
→ Bắt nó echo lại scope trước khi sửa:
"Trước khi sửa, paraphrase lại item này theo cách hiểu của bạn. Đợi 
tôi confirm rồi mới implement."

**Khi đã sửa nhiều mà bug cứ tăng:**
→ Stop. `git log --oneline -20` xem 20 commit gần nhất. Reset về commit 
ổn định gần nhất. Bắt đầu lại từ đó, chậm hơn nhưng chắc hơn.

---

## Hết SYNC

Bắt đầu từ Bước 1. Bước nào kẹt → gửi mình GAP-REPORT.md hoặc message lỗi.
