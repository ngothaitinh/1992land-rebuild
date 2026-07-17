# Tự động deploy bot Telegram lên VPS qua GitHub Actions

## Bối cảnh

Bot Telegram (`scripts/tg-bot/`) chạy 24/7 trên VPS `root@160.191.88.139` (pm2 process `tg-bot-1992land`, repo tại `/root/bot`). Hiện tại mỗi lần code bot có thay đổi và được merge vào `main`, ai đó (anh Thọ hoặc Jimmy) phải tự SSH vào VPS và chạy `bash scripts/tg-bot/deploy-vps.sh` thủ công. Script này đã idempotent: `git pull origin main` → kiểm tra `.env` → `npm install` → `pm2 start/reload` → đăng ký lại slash command.

Website chính (`out/` qua FTP) đã có pipeline tự động (`.github/workflows/deploy.yml`) chạy khi push `main`. Bot chưa có pipeline tương tự — đây là khoảng trống cần lấp.

**Mục tiêu:** push code bot lên `main` → tự động deploy lên VPS, không cần ai đụng tay. Có thông báo Telegram cho anh Thọ biết kết quả.

## Thiết kế

### Luồng chạy

```
push lên main, có file trong scripts/tg-bot/** thay đổi
      ↓
GitHub Actions: deploy-bot.yml (job riêng, không đụng deploy.yml)
      ↓
SSH vào root@160.191.88.139 bằng key CI riêng
      ↓
chạy: cd /root/bot && bash scripts/tg-bot/deploy-vps.sh
      ↓
gửi Telegram: ✅ thành công / ❌ thất bại (kèm vài dòng log cuối)
```

- **Trigger:** `push` trên `main`, giới hạn `paths: ["scripts/tg-bot/**"]` — tránh restart pm2 không cần thiết mỗi khi chỉ nội dung dự án/bài viết thay đổi (những push đó không đụng code bot).
- Không cần bước `actions/checkout` để lấy code chạy — `deploy-vps.sh` tự `git pull` ngay trên VPS. Workflow chỉ cần 2 bước: SSH chạy script, và gửi Telegram kết quả.
- Không sửa `deploy-vps.sh` hiện có — dùng nguyên, chỉ gọi nó qua SSH.

### Secrets cần thêm vào GitHub repo

| Secret | Giá trị |
|---|---|
| `VPS_SSH_KEY` | Private key ed25519 mới tạo riêng cho CI (không dùng key cá nhân) |
| `VPS_HOST` | `160.191.88.139` |
| `VPS_USER` | `root` |
| `TELEGRAM_BOT_TOKEN` | Token bot hiện có (đang chỉ nằm trong `.env.local`/VPS `.env`, chưa có trên GitHub) |
| `TELEGRAM_CHAT_ID` | Chat id anh Thọ (`8699204695`, đã dùng trong `TELEGRAM_ALLOWED_CHAT_IDS`) |

### Hạn chế quyền của SSH key (hardening)

Key CI có quyền `root`, nếu secret rò rỉ thì rủi ro cao. Giới hạn bằng cách thêm public key vào `authorized_keys` với forced command:

```
command="cd /root/bot && bash scripts/tg-bot/deploy-vps.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA... github-actions-tg-bot-deploy
```

Dù private key bị lộ, kẻ tấn công chỉ chạy được đúng lệnh deploy đó — không có shell tự do trên VPS. Workflow SSH vào bình thường (không cần chỉ định lệnh trong action, vì server ép buộc lệnh sẵn qua `command=`).

### Xử lý lỗi

- `deploy-vps.sh` đã có `set -euo pipefail` → lỗi ở bất kỳ bước nào (git pull conflict, thiếu `.env`, npm install fail, pm2 fail) khiến script thoát mã lỗi khác 0 → bước SSH trong Action báo fail → job đỏ trên tab Actions.
- Bước gửi Telegram chạy với điều kiện `if: always()` — luôn chạy bất kể bước deploy thành công hay thất bại.
  - Thành công: `✅ Bot đã cập nhật lên VPS (commit <sha>)`.
  - Thất bại: `❌ Deploy bot thất bại (commit <sha>) — xem chi tiết: <link tới Actions run>`.
- Gửi bằng `curl` gọi thẳng Telegram Bot API (`sendMessage`) trong step Actions — không cần Node/checkout code cho bước này.

### Không nằm trong phạm vi

- Không tự động rollback nếu deploy fail — anh Thọ cần tự revert commit trên GitHub (push sẽ trigger deploy lại bản trước).
- Không dựng webhook server riêng trên VPS — dùng SSH trực tiếp từ GitHub Actions, đơn giản và nhất quán với `deploy.yml` (FTP) đang có.
- Không đổi cách vận hành `deploy-vps.sh` — chỉ tự động hoá việc gọi nó.

## Các file sẽ thêm/sửa

- Mới: `.github/workflows/deploy-bot.yml`
- VPS: thêm 1 dòng vào `~/.ssh/authorized_keys` (public key mới, có forced command) — thao tác thủ công 1 lần, không phải file trong repo.
- GitHub repo settings: thêm 5 secrets liệt kê ở trên — thao tác thủ công 1 lần qua GitHub UI, không phải file trong repo.

## Thiết lập ban đầu (làm 1 lần, thứ tự)

1. Tạo cặp khoá SSH mới `deploy-vps-ci` (ed25519, không passphrase vì chạy trong CI không tương tác).
2. Thêm public key vào `root@160.191.88.139:~/.ssh/authorized_keys` với `command=` giới hạn như trên.
3. Thêm 5 GitHub Secrets.
4. Viết `.github/workflows/deploy-bot.yml`.
5. Test: push 1 thay đổi vô hại trong `scripts/tg-bot/` (vd sửa comment) lên `main` → xác nhận Action chạy xanh, `pm2 list` trên VPS cho thấy process reload (uptime reset), Telegram báo ✅.
6. Test lỗi: giả lập fail (vd tạm đổi `deploy-vps.sh` thành `exit 1` trên 1 nhánh test, hoặc theo dõi lần deploy thật nếu có lỗi tự nhiên) → xác nhận Telegram báo ❌ đúng.

## Verify (tiêu chí hoàn thành)

1. Push code bot mới lên `main` → không cần SSH thủ công → VPS tự cập nhật trong vài chục giây, pm2 reload thành công.
2. Push nội dung dự án/bài viết (không đụng `scripts/tg-bot/**`) → `deploy-bot.yml` KHÔNG chạy (chỉ `deploy.yml` chạy).
3. Anh Thọ nhận Telegram báo kết quả sau mỗi lần deploy bot — cả thành công lẫn thất bại.
4. SSH key CI bị lộ (giả định) → kẻ tấn công chỉ chạy được đúng lệnh deploy, không có shell tự do trên VPS (do forced command).
5. Deploy fail (vd thiếu `.env` trên VPS) → job Actions đỏ, Telegram báo lỗi kèm log, bot cũ trên VPS vẫn chạy bình thường (không bị dừng giữa chừng vì `deploy-vps.sh` chỉ reload sau khi các bước trước đó pass).
