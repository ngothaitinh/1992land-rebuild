# Thiết kế: Đăng nội dung 24/7 qua Telegram bằng AI (không cần mở máy)

**Ngày:** 2026-06-24
**Trạng thái:** Đã duyệt thiết kế, chờ lập kế hoạch triển khai
**Liên quan:** mở rộng bot `scripts/tg-bot/` (engine/serve.mjs, commit `dd86a1e` trở đi)

---

## 1. Bối cảnh & Mục tiêu

### Vấn đề
Bot Telegram hiện chạy 24/7 trên VPS (`/root/bot`, pm2 `tg-bot-1992land`) chỉ tự động hóa được **Loại A** (sửa 1 trường, xóa, ẩn/hiện phần) — commit thẳng GitHub. **Loại B** (thêm dự án/bài MỚI) chỉ lưu vào `content-inbox/` trên VPS rồi chờ **một phiên Claude trên máy** mới soạn được. Điều này phá vỡ mục tiêu của người vận hành (anh Thọ): bận, không mở máy, ít rành web, muốn đăng bất cứ lúc nào.

### Mục tiêu
Cho phép anh Thọ **đăng bài viết và dự án mới hoàn toàn từ điện thoại qua Telegram, 24/7, không cần ai bật máy**, đồng thời **hạn chế tối đa AI bịa thông tin sai**.

### Ưu tiên thực tế (anh Thọ xác nhận)
1. Sửa thông tin có sẵn — **đã chạy** (Loại A), không đụng.
2. Đăng **bài viết/tin tức** — trọng tâm; nguồn thường là **copy từ báo/web khác** → AI biên tập lại.
3. Thêm **dự án mới** — hiếm hơn nhưng vẫn làm qua AI (anh Thọ chọn).

---

## 2. Giải pháp tổng thể (Hướng A)

Bot trên VPS **tự gọi LLM API** (endpoint/model/key cấu hình trong `.env`) để biên tập nội dung anh Thọ gửi → gửi bản nháp + nút duyệt vào chat → anh Thọ duyệt → bot commit lên GitHub → Actions build + FTP (~8 phút). Toàn bộ do **bot pm2** xử lý, không máy nào cần bật. Cổng duyệt real-time (giống cơ chế xác nhận xóa đã chạy).

```
Anh Thọ (điện thoại)
  │ bấm nút "📝 Đăng tin" hoặc "🏢 Thêm dự án"
  ▼
Bot nhắc: "Dán nội dung + gửi ảnh"
  │ anh Thọ dán văn bản (+ ảnh)
  ▼
Bot gọi LLM API (LLM_ENDPOINT / LLM_MODEL / LLM_API_KEY)
  │ → biên tập thành bài/dự án đúng schema (JSON)
  ▼
Bot lưu nháp (in-memory, theo chat_id, TTL 30') + gửi preview
  │ + nút [✅ Duyệt] [✏️ Sửa] [❌ Hủy]
  ├─ ✅ → commit GỘP (.md/.json + ảnh) lên main → web ~8'
  ├─ ✏️ → anh Thọ nhắn yêu cầu sửa → gọi lại LLM → nháp mới
  └─ ❌ → xóa nháp
```

---

## 3. Trải nghiệm gửi (UX cho người ít rành web)

Nguyên tắc: **không phải gõ cú pháp, không nhớ `[NGOẶC VUÔNG]`.**

1. Mở bot → **Menu** → bấm **📝 Đăng tin** (hoặc **🏢 Thêm dự án**).
2. Bot nhắc một câu: *"Dán nội dung vào đây, kèm 1 ảnh nếu có. Xong gửi là được."*
3. Anh Thọ dán + đính ảnh → gửi.
4. ~30 giây sau, bot trả bản nháp đã biên tập để xem + nút duyệt.

> Vẫn giữ song song cú pháp `[THÊM BÀI]` / `[THÊM DỰ ÁN]` cho ai quen gõ; nút bấm là đường chính.

Hai nút mới này map vào trạng thái hội thoại: sau khi bấm, bot ghi nhận chat đang ở chế độ "chờ nội dung <post|project>" (lưu cùng cơ chế nháp in-memory, TTL). Tin nhắn kế tiếp của anh Thọ được hiểu là nội dung cần biên tập, không cần header.

---

## 4. Lớp AI biên tập

### 4.1. Cấu hình hóa (không hard-code)
Thêm vào `scripts/tg-bot/.env`:
```
LLM_ENDPOINT = https://api.anthropic.com/v1/messages   # anh tự đổi
LLM_MODEL    = claude-haiku-4-5-20251001               # anh tự đổi
LLM_API_KEY  = sk-...                                   # key của anh
```
Module gọi AI đọc 3 biến này. Đổi nhà cung cấp/proxy về sau chỉ sửa `.env`. Module viết theo chuẩn Anthropic Messages API mặc định; nếu endpoint khác chuẩn, điều chỉnh ở 1 chỗ (adapter call).

### 4.2. Input đưa cho AI
- Văn bản anh Thọ dán (nguồn).
- Loại nội dung: `post` | `project`.
- Ngày hôm nay (cho `date`).
- Danh sách slug dự án có thật + danh sách category đang dùng (làm gợi ý mềm, chống bịa liên kết).

### 4.3. Output — chỉ JSON đúng schema (không markdown fence)

**Bài viết (`post`)** → file `data/posts/{slug}.md`:
```json
{
  "title": "...",
  "excerpt": "...",
  "category": "AI tự đặt, ưu tiên tái dùng category có sẵn nếu hợp",
  "readTime": "X phút đọc",
  "body_markdown": "## ...\n\n...",
  "related_projects": ["slug-co-that"],
  "_review_fields": []
}
```
`slug` (slugify title + hậu tố ngắn), `date` (hôm nay), `hero_image` (ảnh anh Thọ gửi) → **bot tự sinh**, không để AI bịa.

**Dự án (`project`)** → file `data/projects/{slug}.json`:
- AI điền **mọi trường suy ra được từ nguồn** (theo schema `data/projects/*.json`: title, location, area, district, city, developer, priceRange, price_from/to, area_from/to, unit_count, status, type, excerpt, scale, legal_status, handover_date, ownership, product_types, nearby, highlights, amenities_*, faq, descriptions{7 khóa}…).
- `slug`, `id`, `created_at/updated_at`, `hero_image`, `gallery` → bot sinh.
- `lat/lng` → để trống nếu nguồn không ghi (không bịa tọa độ).

### 4.4. Chống bịa — các chốt chặn (ưu tiên cao nhất, theo CLAUDE.md)
1. **Ràng buộc nguồn (lằn ranh cứng, không thể bỏ):** system prompt yêu cầu *"CHỈ viết lại/rút gọn/cấu trúc lại từ văn bản được cung cấp. KHÔNG bịa giá, diện tích, tên CĐT, số quyết định, ngày tháng, pháp lý, tọa độ, khoảng cách không có trong nguồn. Trường nào nguồn không ghi → để trống / null."*
2. **Đánh dấu để duyệt:** AI liệt kê các trường nó **suy đoán hoặc không chắc** vào `_review_fields` (vd `["priceRange","legal_status"]`). Bot in dòng *"⚠️ Cần soi kỹ: giá bán, pháp lý"* ở đầu preview → anh Thọ "duyệt kỹ" có trọng tâm.
3. **Cấm bịa liên kết:** `related_projects` chỉ chọn từ danh sách slug có thật; rỗng nếu không chắc.
4. **Giọng brand:** cấm caps-lock, cấm tone sales ("CỰC KỲ", "NHẤT THỊ TRƯỜNG") — đúng rule CLAUDE.md.
5. **Nút duyệt của anh Thọ = chốt cuối:** không nội dung nào lên web nếu chưa bấm ✅.

### 4.5. Parse an toàn
Strip ```` ```json ```` nếu AI lỡ bọc fence. JSON hỏng → **không commit**, báo *"AI trả lỗi định dạng, gửi lại giúp anh"*. Không nuốt lỗi.

---

## 5. Cổng duyệt + vòng sửa

- Sau khi AI biên tập, bot lưu **nháp in-memory** keyed theo `chat_id` (TTL 30'): gồm JSON nội dung, ảnh đã tải, văn bản nguồn, loại (post/project).
- Gửi preview rút gọn (tiêu đề + excerpt + cảnh báo `_review_fields`) + nút `[✅ Duyệt] [✏️ Sửa] [❌ Hủy]`.
- **✏️ Sửa:** bot hỏi *"Anh muốn sửa gì?"* → anh Thọ nhắn yêu cầu → bot gọi lại LLM kèm (nháp cũ + yêu cầu sửa) → nháp mới. Lặp tới khi ưng.
- **✅ Duyệt:** commit (mục 6). **❌ Hủy:** xóa nháp.

---

## 6. Commit + Deploy

- **1 commit GỘP** qua Git Trees API: file nội dung (`data/posts/{slug}.md` hoặc `data/projects/{slug}.json`) + ảnh (`public/images/news/{slug}.jpg` hoặc `public/images/projects/{slug}/hero.jpg`). Tránh trigger build 2 lần (tận dụng `github-commit.mjs` đã có).
- `slug` deterministic = slugify(title) + hậu tố ngắn → tên file & ảnh khớp nhau.
- Commit lên `main` → Actions build + FTP ~8'. Bot theo dõi build qua `deploy-watch.mjs` → báo *"✅ Đã lên web"* khi xong.

---

## 7. Chống lỗi

- **Idempotency:** dùng `idempotency.mjs` đã có (theo `message_id`) → Telegram retry không đăng trùng.
- **AI lỗi/timeout:** báo *"AI bận, gửi lại nội dung"*, không commit.
- **JSON hỏng:** không commit, báo lỗi rõ.
- **GitHub API lỗi:** catch → báo *"Lỗi đăng, thử lại sau"*, không nuốt lỗi.
- **Validate trước commit:** thiếu trường tối thiểu (post: title + body; project: title + location) → không commit, báo thiếu gì.
- **Whitelist:** chỉ `TELEGRAM_ALLOWED_CHAT_IDS` mới dùng được (đã có).

---

## 8. Phạm vi (YAGNI)

**Có làm:**
- Luồng "Đăng tin" (post) qua AI — trọng tâm.
- Luồng "Thêm dự án" (project) qua AI — với chốt chặn chống bịa + `_review_fields`.
- 2 nút menu mới + trạng thái hội thoại "chờ nội dung".
- Module gọi LLM cấu hình hóa + vòng sửa.

**KHÔNG làm trong vòng này:**
- Sửa độ trễ mạng VPS→Telegram (việc riêng, anh Thọ chọn để sau).
- Đổi cơ chế Loại A (sửa/xóa/ẩn-hiện) — đang chạy, giữ nguyên.
- Quản lý nhiều ảnh/gallery phức tạp cho dự án (vòng này: 1 ảnh hero; bổ sung gallery sau qua quy trình khác).

---

## 9. Thành phần & ranh giới (để triển khai)

| Đơn vị | Việc | Phụ thuộc |
|---|---|---|
| `engine/llm.mjs` (mới) | Gọi LLM theo `.env`, trả JSON đã parse | `.env` LLM_* |
| `engine/compose.mjs` (mới) | Dựng prompt theo loại (post/project), ghép schema + chống-bịa, gọi `llm.mjs`, validate output | `llm.mjs`, adapter config |
| `engine/serve.mjs` (sửa) | Thêm nút menu, trạng thái "chờ nội dung", cổng duyệt cho nội dung mới | `compose.mjs`, `github-commit.mjs`, `deploy-watch.mjs`, `idempotency.mjs` |
| `adapters/1992land/config.mjs` (sửa) | Khai báo schema trường + required tối thiểu cho post/project, nhãn nút | — |
| `.env` (sửa) | LLM_ENDPOINT, LLM_MODEL, LLM_API_KEY | — |

Mỗi module một việc rõ ràng, test độc lập được (llm.mjs mock HTTP; compose.mjs test prompt/parse; serve.mjs test luồng callback).

---

## 10. Tiêu chí thành công

1. Bấm "📝 Đăng tin" → dán bài báo + ảnh → nhận bản nháp biên tập + nút duyệt → ✅ → 1 commit gộp → web có bài sau ~8'. Không mở máy nào.
2. Bấm "🏢 Thêm dự án" → dán thông tin thiếu giá/pháp lý → AI để trống các trường đó + cảnh báo `⚠️ Cần soi kỹ` → không bịa số.
3. ✏️ Sửa → nhắn yêu cầu → nháp cập nhật đúng.
4. AI trả JSON hỏng / thiếu trường tối thiểu → không commit, báo lỗi rõ.
5. Gửi trùng (Telegram retry) → chỉ 1 bài.
6. Người ngoài whitelist → bị bỏ qua.
