# 1992land Bot v2 — Hướng dẫn Operator

## Yêu cầu

- **n8n** self-hosted v1.40+ (chạy trên VPS của Jimmy)
- **Google Sheets** OAuth2 (tạo project trong Google Cloud Console)
- **Telegram Bot Token** (từ @BotFather)
- **GitHub PAT** (Personal Access Token, scope: `contents:write`)
- **Anthropic API Key**

---

## 1. Import Workflow

1. Mở n8n UI → **Workflows** → **Import from File**
2. Chọn file `1992land-bot-v2.json`
3. Workflow xuất hiện với status **Inactive** — CHƯA activate ngay

---

## 2. Tạo Credentials (4 cái)

### 2.1 Telegram Bot API
- Type: **Telegram API**
- Name: `1992land Telegram Bot`
- Bot Token: token từ @BotFather (đang có trong `.env.local`)

### 2.2 Anthropic API
- Type: **Anthropic**  
- Name: `Anthropic 1992land`
- API Key: key từ console.anthropic.com

### 2.3 GitHub PAT
- Type: **GitHub API** (Personal Access Token)
- Name: `GitHub 1992land`
- Token: PAT với scope **Contents: Read & Write** cho repo `ngothaitinh/1992land-rebuild`
  - Tạo tại: github.com → Settings → Developer settings → Personal access tokens → Fine-grained
  - Repository: `ngothaitinh/1992land-rebuild`
  - Permissions: `Contents: Read and Write`

### 2.4 Google Sheets OAuth2
- Type: **Google Sheets OAuth2 API**
- Name: `Google Sheets 1992land`
- Làm theo hướng dẫn n8n để connect Google account
- Sheet cần có: xem mục 3 bên dưới

---

## 3. Tạo Google Sheet

Tạo Google Spreadsheet mới (hoặc dùng sheet đã có cho 1992land).

### Tab 1: `telegram_sessions`
Header (row 1, theo thứ tự này):
```
chat_id | state | type | draft_json | target_file | updated_at
```

### Tab 2: `telegram_processed_ids`
Header (row 1):
```
update_id | processed_at
```

Lưu **Spreadsheet ID** (trong URL: `docs.google.com/spreadsheets/d/**{SHEET_ID}**/edit`)

---

## 4. Set Environment Variables trong n8n

Vào n8n → Settings → Variables, thêm:

| Variable | Giá trị | Mô tả |
|----------|---------|-------|
| `ALLOWED_CHAT_IDS` | `8699204695,{jimmy_chat_id}` | chat_id được phép dùng bot (comma-separated) |
| `GITHUB_REPO` | `ngothaitinh/1992land-rebuild` | owner/repo |
| `GITHUB_BRANCH` | `main` | branch để commit |
| `GOOGLE_SHEET_ID` | `{spreadsheet_id}` | ID của Google Sheet session |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` | model cho AI parse |

> Chat ID của anh Thọ: `8699204695` (lấy từ `.env.local`)  
> Chat ID của Jimmy: kiểm tra bằng cách nhắn `/start` cho bot và xem log n8n

---

## 5. Gán Credentials vào Workflow

Sau khi import, mở workflow và gán credentials vào từng node:
- Node **Telegram Trigger** → chọn `1992land Telegram Bot`
- Node **Telegram: Send** → chọn `1992land Telegram Bot`
- Node **HTTP: Claude** → chọn `Anthropic 1992land` (hoặc dùng API key trong header)
- Tất cả node **GSheets** → chọn `Google Sheets 1992land`

---

## 6. Activate Workflow

1. Kiểm tra tất cả credentials đã gán đúng
2. Bấm **Activate** (toggle góc trên phải)
3. n8n tự đăng ký webhook với Telegram

---

## 7. Test

**Test 1 — Basic:**
```
Nhắn bot: /menu
Expected: Bot trả về menu với 3 nút [➕ Thêm][✏️ Sửa][🗑️ Xoá]
```

**Test 2 — Thêm dự án đầy đủ:**
```
/them → [Dự án] → gõ: "Vinhomes Cổ Loa, Đông Anh HN, giá từ 3 tỷ, đang mở bán, CĐT Vinhomes, căn hộ"
Expected: Bot parse đúng → review message → bấm ✅ → commit xuất hiện trên GitHub → Actions chạy 1 lần
```

**Test 3 — Thêm thiếu thông tin:**
```
/them → [Dự án] → gõ: "Có dự án mới ở HCM rất đẹp"
Expected: Bot parse → các field quan trọng hiện "❓ Chưa có" → cho phép sửa từng field
```

**Test 4 — Chat ID lạ:**
```
Nhắn bot từ account khác
Expected: Bot trả về "Bot riêng tư, không phục vụ." và KHÔNG xử lý
```

---

## 8. Cú pháp lệnh (Telegram)

```
/menu           — Menu chính
/them           — Thêm dự án hoặc bài viết
/sua            — Sửa nội dung đã đăng
/xoa            — Xoá nội dung
/huy            — Huỷ thao tác hiện tại
/help           — Hướng dẫn
```

Xem `USER-GUIDE.vi.md` để biết flow chi tiết.

---

## 9. Cấu trúc file được tạo

**Dự án:** `data/projects/{slug}.json`  
**Bài viết:** `data/posts/{slug}.md`  
**Ảnh:** `public/images/projects/{slug}/hero.jpg` + `gallery-1/2/3.jpg`

Slug tự động: slugify(tên) + `-` + unix_timestamp (nếu trùng).

Commit message format: `[bot] thêm dự án: {tên}` / `[bot] sửa dự án: {tên}` / `[bot] xoá dự án: {tên}`

---

## 10. Troubleshooting

**Bot không respond:**
- Kiểm tra workflow đang Active trong n8n
- Xem Executions log trong n8n để tìm lỗi
- Kiểm tra Telegram webhook: `curl https://api.telegram.org/bot{TOKEN}/getWebhookInfo`

**Commit fail:**
- Kiểm tra GitHub PAT còn hạn và có đủ quyền
- Xem response từ GitHub trong n8n execution log

**AI parse sai:**
- Bot sẽ báo cụ thể field nào còn trống
- Dùng nút ✏️ Sửa để điền tay từng field

**Session bị treo:**
- User gõ `/huy` để reset
- Hoặc đợi 30 phút TTL tự reset
- Hoặc xóa row trong Google Sheet `telegram_sessions` cho chat_id đó
