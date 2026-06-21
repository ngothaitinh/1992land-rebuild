# Design Spec — Telegram Bot Tự Sửa Nội Dung 24/7

**Ngày:** 2026-06-21
**Phạm vi:** Giai đoạn 1 — Engine + Adapter 1992land chạy thật trên VPS
**Trạng thái:** Draft — chờ review

---

## 1. Bối cảnh & vấn đề

Pipeline hiện tại (`scripts/tg-*.mjs`) chỉ chạy khi Claude/Jimmy bật máy thủ công. Anh Thọ gửi `[SỬA DỰ ÁN]` vào bot nhưng không có gì xảy ra khi Claude ngoại tuyến. Nút duyệt dùng polling `getUpdates` nên cũng phụ thuộc người bật. Ngoài ra cú pháp `[NGOẶC VUÔNG]` + slug khó nhớ, đôi khi bot hiểu sai ý.

**4 triệu chứng đã xác nhận:**
1. Gửi lệnh nhưng không phản hồi (pipeline không chạy 24/7)
2. Phải chờ Claude/Jimmy bật máy
3. Đôi khi soạn sai / hiểu nhầm ý
4. Cú pháp rườm rà

---

## 2. Mục tiêu

| Mục tiêu | Tiêu chí thành công |
|---|---|
| Chạy 24/7 không cần Claude | Gửi lệnh lúc 3h sáng → nhận phản hồi trong ≤ 35 giây |
| Tự thực thi thao tác tất định | Sửa trường / ẩn-hiện phần → commit + deploy không cần duyệt |
| Xóa an toàn | Gửi preview + nút ✅/❌ trước khi xóa file |
| Báo khi deploy xong | Sau khi Actions build+FTP xong → bot nhắn lại kết quả |
| Tái sử dụng đa-website | Sang website mới chỉ viết 1 file adapter, engine giữ nguyên |

**Ngoài phạm vi giai đoạn 1:** webhook real-time, AI tự soạn nội dung giàu, xóa ảnh kèm, multi-user, adapters cho website ngoài 1992land.

---

## 3. Kiến trúc — Engine / Adapter

```
scripts/tg-bot/
├── engine/                     ← KHÔNG SỬA khi sang site mới
│   ├── serve.mjs               ← Vòng poll + routing chính
│   ├── parse-command.mjs       ← Tách intent/slug/field từ text
│   ├── github-commit.mjs       ← Contents API: GET sha → PUT/DELETE
│   ├── deploy-watch.mjs        ← Poll Actions API theo commit SHA
│   └── idempotency.mjs         ← Lưu processed message_id
│
├── adapters/
│   └── 1992land/
│       └── config.mjs          ← Adapter duy nhất cần viết cho mỗi site
│
├── .env                        ← Secrets (không commit)
└── ecosystem.config.cjs        ← PM2 (đã có trong tg-cms-template)
```

### Phân biệt Engine vs Adapter

**Engine** xử lý hoàn toàn:
- Telegram I/O (long-poll 30s, whitelist `chat_id`, idempotency)
- Parse `[TÊN LỆNH]` + `Key: value` + slug từ text
- Routing: tất định → execute; giàu → inbox; xóa → confirm gate
- GitHub Contents API commit
- Poll GitHub Actions đến khi run kết thúc → notify
- Menu / mẫu điền sẵn

**Adapter** khai báo:
- `repo`, `deploy_branch`, `bot_name`, `site_name`, `allowed_chat_ids`
- `content_types[]`: tên, thư mục, format (json/md), list field sửa được, hàm `readFile`/`writeFile`
- `commands[]`: mapping `[TÊN LỆNH]` → action + content_type
- `menus[]`: layout bàn phím Telegram

---

## 4. Adapter 1992land (`adapters/1992land/config.mjs`)

```js
export default {
  repo:           "ngothaitinh/1992land-rebuild",
  deploy_branch:  "main",
  bot_name:       "Bot 1992 Land",
  site_name:      "1992land.com",
  allowed_chat_ids: [/* chat_id anh Thọ, chat_id Jimmy */],

  content_types: {
    project: {
      dir:    "data/projects",
      format: "json",
      // field nào được sửa bằng set_field (primitive only)
      editable_fields: [
        "title","location","priceRange","status","type","excerpt",
        "developer","area","district","city"
      ],
    },
    post: {
      dir:    "data/posts",
      format: "md-frontmatter",
      editable_fields: ["title","excerpt","category","tags"],
    },
  },

  commands: [
    { trigger: "[SỬA DỰ ÁN]",   action: "set_field",    content_type: "project" },
    { trigger: "[ẨN PHẦN]",     action: "hide_section", content_type: "project" },
    { trigger: "[HIỆN PHẦN]",   action: "show_section", content_type: "project" },
    { trigger: "[XÓA DỰ ÁN]",  action: "delete",       content_type: "project" },
    { trigger: "[SỬA BÀI]",    action: "set_field",    content_type: "post"    },
    { trigger: "[XÓA BÀI]",    action: "delete",       content_type: "post"    },
    // Nội dung giàu → inbox (Claude xử lý sau)
    { trigger: "[THÊM DỰ ÁN]", action: "inbox",        content_type: "project" },
    { trigger: "[THÊM BÀI]",   action: "inbox",        content_type: "post"    },
  ],

  keyboard_rows: [
    ["[SỬA DỰ ÁN]",  "[ẨN PHẦN]",   "[HIỆN PHẦN]"],
    ["[XÓA DỰ ÁN]",  "[SỬA BÀI]",   "[XÓA BÀI]"],
    ["[THÊM DỰ ÁN]", "[THÊM BÀI]"],
  ],
};
```

---

## 5. Luồng chi tiết mỗi action

### 5.1 `set_field` (tự động, không duyệt)

```
Anh Thọ gửi:
[SỬA DỰ ÁN]
Slug: salacia-villas-phu-my
Trường: priceRange
Giá trị: Từ 5.2 tỷ
```

1. `parse-command.mjs` → `{ action:"set_field", content_type:"project", slug, field:"priceRange", value:"Từ 5.2 tỷ" }`
2. Validate: slug tồn tại? field trong `editable_fields`? field là primitive?
   - Fail → reply lỗi rõ, KHÔNG commit.
3. Idempotency check: `message_id` đã xử lý chưa? → skip nếu có.
4. Đọc file từ GitHub API (GET `contents/{path}`) → lấy `sha` + decode base64 → parse JSON/MD.
5. Sửa field → serialize lại → PUT `contents/{path}` với `sha`, commit message: `content: set {field} on {slug} via telegram`.
6. Lưu `message_id` vào `.tg-processed.json`.
7. Reply ngay: `✏️ Đã cập nhật *priceRange* → "Từ 5.2 tỷ". Đang chờ build…`
8. `deploy-watch.mjs` theo dõi Actions run → khi xong reply: `✅ 1992land.com đã cập nhật.` hoặc `⚠️ Build lỗi: <link>`.

### 5.2 `hide_section` / `show_section` (tự động)

Tương tự `set_field` nhưng thao tác trên array `hidden_sections`. Cú pháp:
```
[ẨN PHẦN]
Slug: salacia-villas-phu-my
Phần: gia-ban
```

### 5.3 `delete` (cần duyệt)

```
Anh Thọ gửi:
[XÓA DỰ ÁN]
Slug: salacia-villas-phu-my
```

1. Parse + validate slug tồn tại.
2. **Không commit ngay.** Gửi:
   ```
   🗑 Xóa dự án: Salacia Villas Phú Mỹ (salacia-villas-phu-my)
   File: data/projects/salacia-villas-phu-my.json
   ⚠️ Thao tác không hoàn tác được qua bot (git vẫn khôi phục được).
   ```
   + inline keyboard: `✅ Xác nhận xóa` / `❌ Hủy`
3. Lưu pending state tạm thời (in-memory Map `pendingDeletes`, key = `callback_query` prefix, TTL 5 phút). Cleanup: `setTimeout` 5 phút tự xóa entry khỏi Map khi tạo — không cần sweep định kỳ.
4. Callback `✅` → thực hiện DELETE via GitHub API → watch → notify.
5. Callback `❌` hoặc timeout → reply "Đã hủy, không xóa gì."

### 5.4 `inbox` (nội dung giàu)

Mọi lệnh `[THÊM ...]`:
1. Lưu `message.txt` + ảnh vào `content-inbox/<timestamp>/` (đã có logic này trong `tg-cms-template/serve.mjs`).
2. Reply: `📥 Đã nhận! Nội dung sẽ được Claude soạn và gửi bản xem trước để duyệt.`

---

## 6. Module Engine — spec giao diện

### `parse-command.mjs`
```js
parseCommand(text: string): {
  trigger: string | null,   // "[SỬA DỰ ÁN]" v.v.
  slug: string | null,      // từ dòng "Slug: ..."
  field: string | null,     // từ dòng "Trường: ..."
  value: string | null,     // từ dòng "Giá trị: ..."
  section: string | null,   // từ dòng "Phần: ..."
  raw: string,              // text gốc
}
```
Nhận dạng trigger: dòng đầu khớp `[TÊN]` (case-insensitive, trim). Các dòng sau là `Key: value`.

### `github-commit.mjs`
```js
// Đọc file từ GitHub (trả { content, sha })
getFile(repo, branch, path, pat): Promise<{ content: string, sha: string }>

// Ghi/tạo file
putFile(repo, branch, path, content, sha, commitMsg, pat): Promise<{ sha: string }>

// Xóa file
deleteFile(repo, branch, path, sha, commitMsg, pat): Promise<void>
```
Dùng `https` built-in (zero dependency). Base64 encode/decode nội bộ.

### `deploy-watch.mjs`
```js
// Theo dõi run cho commit SHA, gọi callback khi xong
watchDeployment(repo, commitSha, pat, onDone: (status, runUrl) => void): void
```
- Poll `GET /repos/{repo}/actions/runs?head_sha={sha}` mỗi 30 giây.
- Timeout sau 20 phút → callback với status `"timeout"`.
- `onDone` gọi 1 lần duy nhất (dù poll tiếp vẫn chạy nền).
- Chạy non-blocking (`setInterval`), không chặn serve loop.

### `idempotency.mjs`
```js
isProcessed(messageId: number): boolean
markProcessed(messageId: number): void
```
Lưu vào `.tg-processed.json`. Giữ tối đa 500 entry (FIFO). Đọc/ghi file đồng bộ (đơn-luồng, không race condition).

---

## 7. Secrets & cấu hình VPS

File `.env` trên VPS (không commit vào git):
```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...       # chat_id chính (anh Thọ)
GITHUB_PAT=...             # scope: contents + actions (read)
GITHUB_REPO=ngothaitinh/1992land-rebuild
ADAPTER=1992land           # engine load adapters/<ADAPTER>/config.mjs
```

GitHub PAT cần scopes:
- `repo` (đọc/ghi contents, đọc Actions)

---

## 8. Chống lỗi

| Tình huống | Xử lý |
|---|---|
| Slug không tồn tại | Reply "❌ Không tìm thấy dự án: `<slug>`" — không commit |
| Field là object/array | Reply "❌ Trường `<field>` cần Claude soạn. Gửi [THÊM DỰ ÁN] để inbox." — không commit |
| Field không trong `editable_fields` | Reply "❌ Trường này không cho sửa bằng bot." |
| GitHub API 5xx | Retry 1 lần sau 5 giây, fail → reply "⚠️ Lỗi GitHub API, thử lại sau." |
| Telegram retry cùng `message_id` | idempotency check → skip silently |
| `pendingDeletes` timeout | Xóa khỏi Map, không làm gì |
| Deploy timeout 20 phút | Reply "⏱ Build đang lâu bất thường. Kiểm tra: <link actions>" |
| Build fail | Reply "⚠️ Build lỗi, web chưa cập nhật. Link: <run_url>" |

---

## 9. Tái sử dụng đa-website (Giai đoạn 2)

Khi có website thứ 2:
1. Tạo `adapters/<site-moi>/config.mjs` — khai báo `content_types`, `commands`, `repo`, v.v.
2. Set `ADAPTER=<site-moi>` trong `.env` của VPS đó.
3. Engine không sửa gì.

Nếu cần chạy nhiều site trên cùng 1 VPS: mỗi site 1 PM2 app với `ADAPTER` khác nhau, cùng dùng engine (symlink hoặc package local).

Engine có thể tách thành npm package `@1992land/tg-cms-engine` hoặc git submodule — quyết định khi có site thứ 2.

---

## 10. Triển khai Giai đoạn 1

1. Viết engine modules (`parse-command`, `github-commit`, `deploy-watch`, `idempotency`).
2. Viết `serve.mjs` mới (hoặc refactor từ `tg-cms-template/serve.mjs`).
3. Viết adapter `adapters/1992land/config.mjs`.
4. Test local: `node serve.mjs` + gửi lệnh thật từ Telegram.
5. Deploy lên VPS: copy `scripts/tg-bot/`, tạo `.env`, `pm2 start`, `pm2 save`.
6. Chạy `node engine/register-commands.mjs` đăng ký /slash commands 1 lần.
7. Smoke test: sửa 1 trường nhỏ → xác nhận commit xuất hiện trên GitHub → Actions chạy → nhận thông báo "đã cập nhật".
