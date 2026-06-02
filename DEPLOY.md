# Hướng dẫn Deploy Website 1992 Land

## Tổng quan

Website dùng **Next.js static export** — khi build xong tạo ra thư mục `out/` chứa toàn bộ HTML/CSS/JS tĩnh. Thư mục này upload lên bất kỳ hosting nào là chạy được, không cần server Node.js.

---

## Bước 1 — Build website

Mở terminal tại thư mục dự án (`C:\Users\ASUS\Desktop\1992\1992land-rebuild`):

```bash
pnpm build
```

Kết quả: thư mục `out/` được tạo ra (toàn bộ website tĩnh, ~33 trang).

> **Lưu ý:** Mỗi lần sửa code hoặc dữ liệu phải build lại trước khi upload.

---

## Cách A — Deploy lên Cloudflare Pages (đã cấu hình sẵn)

### Lần đầu — đăng nhập Cloudflare

```bash
pnpm dlx wrangler login
```

Trình duyệt mở ra → đăng nhập Cloudflare account → xác nhận.

### Deploy (lần đầu + các lần sau)

```bash
pnpm deploy
```

Lệnh này tự động: build → upload thư mục `out/` lên Cloudflare Pages project `1992land`.

**Kết quả:** Website live tại `https://1992land.com` trong vòng 1–2 phút.

---

## Cách B — Upload thủ công qua Cloudflare Dashboard

Dùng khi không muốn cài wrangler:

1. Vào `dash.cloudflare.com` → **Pages** → chọn project `1992land`
2. Click **Upload assets**
3. Kéo thả toàn bộ nội dung bên trong thư mục `out/` vào ô upload
4. Click **Deploy site**

---

## Cách C — Auto-deploy qua GitHub Actions (sau khi setup)

Sau khi anh điền `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID` vào GitHub Secrets:

- **Chỉ cần push code lên GitHub** → Actions tự build và deploy
- Không cần làm thêm bước nào

Cách lấy 2 giá trị này:
- **API Token:** `dash.cloudflare.com/profile/api-tokens` → Create Token → template "Edit Cloudflare Pages"
- **Account ID:** góc phải trang tổng quan Cloudflare

Cách điền vào GitHub:
- Vào `github.com/ngothaitinh/1992land-rebuild/settings/secrets/actions`
- New repository secret → thêm `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID`

---

## Khi nào cần build lại?

| Thay đổi | Cần build lại? |
|---|---|
| Sửa nội dung dự án (`data/projects/*.json`) | Có |
| Thêm/sửa bài viết (`data/posts/*.md`) | Có |
| Sửa giao diện (components, CSS) | Có |
| Sửa thông tin liên hệ | Có |
| Thêm ảnh vào `public/images/` | Có |
| Sửa `.env.local` (tracking IDs) | Có |

---

## Workflow ngày thường

### Khi sửa nội dung dự án hoặc bài viết (sau khi có CMS)

1. Vào `https://1992land.com/admin`
2. Đăng nhập GitHub → chỉnh sửa
3. Bấm Publish → tự động build lại (nếu đã setup GitHub Actions)

### Khi sửa giao diện / thêm tính năng

```bash
# Sửa code, kiểm tra
pnpm dev          # xem tại localhost:3001

# Khi đã OK → deploy
pnpm deploy       # build + upload lên Cloudflare
```

---

## Checklist trước khi deploy lần đầu

- [ ] Đã có domain `1992land.com` trỏ về Cloudflare
- [ ] `.env.local` đã điền `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_WEB3FORMS_KEY` (để form và tracking hoạt động)
- [ ] Chạy `pnpm build` không có lỗi
- [ ] Đã đăng nhập wrangler (`pnpm dlx wrangler login`)

---

## File cấu hình quan trọng

| File | Vai trò |
|---|---|
| `wrangler.toml` | Cấu hình Cloudflare Pages (project name, output dir) |
| `.env.local` | API keys (không commit lên GitHub) |
| `.env.local.example` | Template để tham khảo |
| `public/_redirects` | Redirect từ URL WordPress cũ |
| `data/projects/` | Dữ liệu 8 dự án (JSON) — Decap CMS chỉnh sửa |
| `data/posts/` | 9 bài viết (Markdown) — Decap CMS chỉnh sửa |
