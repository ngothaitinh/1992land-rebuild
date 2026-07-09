# Changelog — 1992land Telegram Bot

## v2.0.0 — 2026-06-16

### Thay thế
- Workflow v1 (comment-based scripts trong `scripts/` — `tg-menu.mjs`, `tg-process-inbox.mjs`, `tg-apply-change.mjs`, `tg-poll-decision.mjs`): YÊU CẦU user nhớ format lệnh cứng (`/them_du_an\nTên: ...\nVị trí: ...`), chạy thủ công trên máy tính, không có approval gate.
- **v2 thay thế hoàn toàn** bằng n8n workflow chạy 24/7, AI parse tự nhiên, approval gate bắt buộc qua button Telegram.

### Breaking Changes
- Cú pháp lệnh thay đổi: không còn `/them_du_an`, `/them_bai_viet` riêng lẻ — gộp thành `/them` rồi chọn loại.
- Session state lưu trong Google Sheets thay vì file local.
- Không còn cần chạy `pnpm inbox`, `pnpm decision`, `pnpm apply` thủ công.

### Tính năng mới (v2)
- AI parse nội dung tự nhiên (không cần format cứng)
- Review + Edit từng field qua inline keyboard
- Session TTL 30 phút (tự reset nếu bỏ giữa chừng)
- Idempotency: chống Telegram retry gửi trùng
- `/sua` — sửa bài đã đăng trực tiếp từ Telegram
- `/xoa` — xoá bài đã đăng trực tiếp từ Telegram
- Commit gộp (file nội dung + ảnh) trong 1 commit → Actions chỉ build 1 lần

### Giữ nguyên
- Schema `data/projects/*.json` và `data/posts/*.md` — KHÔNG thay đổi
- Cấu trúc thư mục ảnh `public/images/projects/{slug}/`
- GitHub Actions pipeline: push `main` → build → FTP deploy
- Whitelist chat_id (chỉ anh Thọ + Jimmy được dùng bot)
