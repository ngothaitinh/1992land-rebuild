# 1992land Rebuild — Project Context

## Brand
1992 Land — môi giới BĐS HCMC. Tagline: "Giá Trị Kiến Tạo Lòng Tin"
Owner: Nguyễn Hữu Thọ, 0909474123, Thủ Đức.
Email: nguyenhuutho911@gmail.com
Zalo: zalo.me/0909474123 | Messenger: m.me/165126330021000

## Stack
Next.js 16 App Router, static export (`output: "export"`), Tailwind v4 (CSS config),
framer-motion, lucide-react. Deploy DirectAdmin → `out/` directory via FTP.

## Cấu trúc thực tế
- `app/` ở ROOT (không phải src/)
- `components/` ở ROOT
- `data/projects/*.json` — dữ liệu dự án (9 dự án)
- `data/posts/*.md` — bài viết (10 bài)
- `lib/loadData.ts` — đọc JSON/MD từ data/
- Tailwind config: `globals.css` dùng `@theme`, KHÔNG có `tailwind.config.ts`
- tsconfig cần `"baseUrl": "."` để `@/*` resolve đúng

## Deploy
- Hosting: **DirectAdmin** tại `160.191.88.139:2222`, user `huutho1992`
- Web root trên server: `/home/huutho1992/public_html/`
- **Pipeline: push lên `main` → GitHub Actions tự build + FTP upload (8 phút)**
- CI dùng `npm install --legacy-peer-deps` + `npm run build` (KHÔNG dùng pnpm trên CI)
- GitHub Secrets đã có: `FTP_HOST`, `FTP_USER`, `FTP_PASS`
- Deploy thủ công: `github.com/ngothaitinh/1992land-rebuild/actions` → Run workflow

## Telegram
- Bot token và chat ID đã có trong `.env.local`
- Script notify: `node scripts/notify.mjs "nội dung"`
- **SAU KHI XONG VIỆC: bắt buộc gửi báo cáo cho anh Thọ qua Telegram**
  ```
  node scripts/notify.mjs "✅ Xong: <tóm tắt việc đã làm>\n<chi tiết nếu cần>"
  ```

## Rules — Code
- KHÔNG dùng client component nếu không cần state/effect
- KHÔNG over-abstract. Component < 150 dòng.
- KHÔNG dùng tone sales ("CỰC KỲ", "NHẤT THỊ TRƯỜNG")
- KHÔNG caps lock trong content
- Mọi link external có target="_blank" rel="noopener"
- Tiếng Việt là ngôn ngữ chính
- Font: Be Vietnam Pro (sans), Inter (numeric)
- Colors: navy-* và gold-* từ globals.css

## Rules — Chống Hallucination (QUAN TRỌNG)
Anh Thọ không muốn nhận thông tin sai lệch. Claude phải:

1. **KHÔNG bịa dữ liệu dự án** — giá, diện tích, tên CĐT, pháp lý, tiến độ:
   - Nếu không có trong `data/projects/*.json` hoặc anh Thọ chưa cung cấp → để trống / ghi "Liên hệ" / thêm vào `hidden_sections`
   - KHÔNG tự điền số liệu hợp lý trông có vẻ đúng

2. **KHÔNG bịa kết quả khi chưa verify** — ví dụ: không nói "đã deploy thành công" nếu chưa chạy lệnh và kiểm tra kết quả thực tế

3. **Phân biệt rõ: đã làm xong vs dự kiến làm** — dùng ngôn ngữ chính xác:
   - ✅ "Đã xong" — chỉ khi đã chạy lệnh và kiểm tra kết quả
   - 🔄 "Đang xử lý" — khi đang chờ kết quả
   - ⏳ "Sẽ làm" — khi chưa bắt đầu

4. **Khi không chắc → hỏi, không đoán** — đặc biệt với thông tin kỹ thuật, số liệu BĐS, tên người/công ty

5. **Verify trước khi báo cáo** — sau deploy, fetch thực tế để xác nhận site hoạt động trước khi thông báo xong

6. **Nguồn dữ liệu ưu tiên:**
   - Dự án: đọc trực tiếp từ `data/projects/<slug>.json`
   - Bài viết: đọc từ `data/posts/<slug>.md`
   - Site live: fetch `https://1992land.com` để verify
   - KHÔNG dùng trí nhớ/training data để điền thông tin BĐS cụ thể

## Telegram Pipeline (thêm dự án/bài viết)
Xem `scripts/PUBLISH.md` để biết quy trình đầy đủ.
- `pnpm inbox` → kéo nội dung mới từ Telegram
- `pnpm preview "..."` → gửi bản xem trước
- `pnpm decision 180` → chờ anh Thọ duyệt
- `pnpm notify "..."` → thông báo kết quả
