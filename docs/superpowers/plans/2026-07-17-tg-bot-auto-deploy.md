# Tự động deploy bot Telegram lên VPS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Push code bot lên `main` (đụng `scripts/tg-bot/**`) → GitHub Actions tự SSH vào VPS chạy `deploy-vps.sh` → báo kết quả về Telegram, không cần ai đụng tay.

**Architecture:** Thêm 1 workflow GitHub Actions mới (`deploy-bot.yml`), tách biệt với `deploy.yml` (FTP website). Workflow SSH vào `root@160.191.88.139` bằng key CI riêng (bị giới hạn bằng forced command trong `authorized_keys`), gọi `deploy-vps.sh` hiện có (không sửa script), rồi gửi Telegram thông báo qua `curl` với `if: always()`.

**Tech Stack:** GitHub Actions, `appleboy/ssh-action`, SSH ed25519 forced-command, Telegram Bot API (`curl`), bash `deploy-vps.sh` + pm2 trên VPS.

## Global Constraints

- Deploy branch: `main` (khớp `deploy.yml` và `deploy-vps.sh` đang `git pull origin main`).
- KHÔNG sửa `scripts/tg-bot/deploy-vps.sh` — chỉ gọi nó qua SSH.
- KHÔNG đụng `.github/workflows/deploy.yml` (pipeline FTP website).
- VPS bot: host `160.191.88.139`, port `22`, user `root`, repo tại `/root/bot`, pm2 process `tg-bot-1992land`.
- Chat id anh Thọ: `8699204695`.
- Trigger giới hạn `paths: ["scripts/tg-bot/**"]` — push nội dung dự án/bài viết KHÔNG được kích hoạt workflow này.
- Key CI phải bị giới hạn forced command; nếu secret lộ chỉ chạy được đúng lệnh deploy.

---

### Task 1: Tạo cặp khoá SSH riêng cho CI

**Files:**
- Create (tạm, KHÔNG commit vào repo): `scratchpad/deploy-vps-ci` (private), `scratchpad/deploy-vps-ci.pub` (public)

**Interfaces:**
- Produces: nội dung private key (đưa vào secret `VPS_SSH_KEY` ở Task 4), nội dung public key (đưa vào `authorized_keys` ở Task 3).

- [ ] **Step 1: Sinh keypair ed25519 không passphrase**

Chạy (dùng thư mục scratchpad để không lẫn vào repo):

```bash
KEYDIR="C:/Users/ASUS/AppData/Local/Temp/claude/C--Users-ASUS-Desktop-1992-1992land-rebuild/cc6b300b-f36a-4a82-b5c8-c94b78b11f3e/scratchpad"
ssh-keygen -t ed25519 -N "" -C "github-actions-tg-bot-deploy" -f "$KEYDIR/deploy-vps-ci"
```

Expected: sinh 2 file `deploy-vps-ci` và `deploy-vps-ci.pub`, in ra fingerprint.

- [ ] **Step 2: In ra public key để dùng ở Task 3**

```bash
cat "$KEYDIR/deploy-vps-ci.pub"
```

Expected: 1 dòng bắt đầu `ssh-ed25519 AAAA... github-actions-tg-bot-deploy`.

- [ ] **Step 3: Xác nhận private key KHÔNG nằm trong repo**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild" && git status --porcelain | grep -i "deploy-vps-ci" || echo "OK: key không có trong repo"
```

Expected: in `OK: key không có trong repo` (private key ở scratchpad, ngoài repo — tuyệt đối không `git add`).

---

### Task 2: Viết workflow `deploy-bot.yml`

**Files:**
- Create: `.github/workflows/deploy-bot.yml`

**Interfaces:**
- Consumes: secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (tạo ở Task 4).
- Produces: workflow tên `Deploy Telegram Bot to VPS`, job `deploy-bot`, step id `deploy` (SSH) + step Telegram (`if: always()`).

- [ ] **Step 1: Viết file workflow**

Tạo `.github/workflows/deploy-bot.yml` với nội dung chính xác sau:

```yaml
name: Deploy Telegram Bot to VPS

on:
  push:
    branches: [main]
    paths:
      - "scripts/tg-bot/**"
  workflow_dispatch:

jobs:
  deploy-bot:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy over SSH
        id: deploy
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.VPS_HOST }}
          port: 22
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          command_timeout: 15m
          script: "cd /root/bot && bash scripts/tg-bot/deploy-vps.sh"

      - name: Notify Telegram
        if: always()
        env:
          TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          CHAT: ${{ secrets.TELEGRAM_CHAT_ID }}
          OUTCOME: ${{ steps.deploy.outcome }}
        run: |
          SHORT_SHA="${GITHUB_SHA::7}"
          RUN_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
          if [ "$OUTCOME" = "success" ]; then
            MSG="✅ Bot đã cập nhật lên VPS (commit ${SHORT_SHA})"
          else
            MSG="❌ Deploy bot thất bại (commit ${SHORT_SHA}). Xem log: ${RUN_URL}"
          fi
          curl -sS --max-time 20 "https://api.telegram.org/bot${TOKEN}/sendMessage" \
            --data-urlencode "chat_id=${CHAT}" \
            --data-urlencode "text=${MSG}"
```

Lưu ý: `script:` gửi lên sẽ bị server bỏ qua nếu `authorized_keys` có forced command (Task 3) — vẫn để nguyên để workflow chạy được cả khi chưa gắn forced command (giai đoạn test) và làm tài liệu ý định.

- [ ] **Step 2: Kiểm tra cú pháp YAML**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild"
node -e "const yaml=require('js-yaml'); const fs=require('fs'); yaml.load(fs.readFileSync('.github/workflows/deploy-bot.yml','utf8')); console.log('YAML OK')" 2>/dev/null \
  || python -c "import yaml,sys; yaml.safe_load(open('.github/workflows/deploy-bot.yml',encoding='utf-8')); print('YAML OK')"
```

Expected: in `YAML OK`. (Nếu không có `js-yaml` lẫn `python`, mở file đọc mắt thường xác nhận thụt lề đúng.)

- [ ] **Step 3: Xác nhận KHÔNG đụng deploy.yml**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild" && git status --porcelain .github/workflows/
```

Expected: chỉ hiện `?? .github/workflows/deploy-bot.yml`, KHÔNG có `deploy.yml`.

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild"
git add .github/workflows/deploy-bot.yml
git commit -m "ci(tg-bot): workflow tự động deploy bot lên VPS khi push main"
```

Lưu ý: commit này đụng `.github/workflows/**` chứ KHÔNG đụng `scripts/tg-bot/**`, nên push nó lên sẽ KHÔNG tự trigger `deploy-bot.yml` (đúng ý — chưa có secrets thì chưa muốn nó chạy).

---

### Task 3: Cài public key + forced command lên VPS (thủ công, 1 lần)

**Files:**
- Modify (trên VPS, không phải repo): `root@160.191.88.139:~/.ssh/authorized_keys`

**Interfaces:**
- Consumes: public key từ Task 1 Step 2.
- Produces: dòng `authorized_keys` bị ép chạy đúng lệnh deploy.

- [ ] **Step 1: Chuẩn bị dòng authorized_keys với forced command**

Lấy nội dung public key (Task 1 Step 2), ghép prefix forced command. Dòng cuối cùng có dạng (thay `<PUBKEY>` bằng đúng chuỗi `ssh-ed25519 AAAA... github-actions-tg-bot-deploy`):

```
command="cd /root/bot && bash scripts/tg-bot/deploy-vps.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty <PUBKEY>
```

- [ ] **Step 2: Thêm dòng đó vào authorized_keys trên VPS**

Người có quyền SSH `root` vào VPS chạy (thay `<DÒNG_Ở_STEP_1>` bằng cả dòng đầy đủ, trong dấu nháy đơn):

```bash
ssh root@160.191.88.139
# trên VPS:
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo '<DÒNG_Ở_STEP_1>' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Expected: `authorized_keys` có thêm đúng 1 dòng mới; các key cũ (nếu có) giữ nguyên.

- [ ] **Step 3: Kiểm tra forced command hoạt động (từ máy local Jimmy)**

```bash
KEYDIR="C:/Users/ASUS/AppData/Local/Temp/claude/C--Users-ASUS-Desktop-1992-1992land-rebuild/cc6b300b-f36a-4a82-b5c8-c94b78b11f3e/scratchpad"
ssh -i "$KEYDIR/deploy-vps-ci" -o IdentitiesOnly=yes root@160.191.88.139 "echo THU_LENH_KHAC"
```

Expected: KHÔNG in `THU_LENH_KHAC`. Thay vào đó chạy `deploy-vps.sh` (thấy log `==> [1/5] git pull...`). Đây là bằng chứng forced command chặn shell tự do. Nếu deploy chạy thật ở bước này (git pull + pm2 reload) là bình thường — bot chỉ reload code hiện có.

---

### Task 4: Thêm 5 GitHub Secrets (thủ công, 1 lần)

**Files:**
- Modify (GitHub repo settings, không phải repo): Secrets and variables → Actions.

**Interfaces:**
- Consumes: private key từ Task 1, các hằng số VPS/Telegram.
- Produces: 5 secrets mà `deploy-bot.yml` (Task 2) đọc.

- [ ] **Step 1: Lấy giá trị private key**

```bash
KEYDIR="C:/Users/ASUS/AppData/Local/Temp/claude/C--Users-ASUS-Desktop-1992-1992land-rebuild/cc6b300b-f36a-4a82-b5c8-c94b78b11f3e/scratchpad"
cat "$KEYDIR/deploy-vps-ci"
```

Expected: chuỗi bắt đầu `-----BEGIN OPENSSH PRIVATE KEY-----`, copy TOÀN BỘ kể cả dòng BEGIN/END.

- [ ] **Step 2: Lấy Telegram token + chat id từ `.env.local`**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild" && grep -iE "TELEGRAM" .env.local
```

Expected: thấy `TELEGRAM_BOT_TOKEN=...` và chat id (`8699204695`).

- [ ] **Step 3: Thêm secrets qua `gh` CLI (nếu đã đăng nhập)**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild"
KEYDIR="C:/Users/ASUS/AppData/Local/Temp/claude/C--Users-ASUS-Desktop-1992-1992land-rebuild/cc6b300b-f36a-4a82-b5c8-c94b78b11f3e/scratchpad"
gh secret set VPS_HOST --body "160.191.88.139"
gh secret set VPS_USER --body "root"
gh secret set VPS_SSH_KEY < "$KEYDIR/deploy-vps-ci"
gh secret set TELEGRAM_BOT_TOKEN --body "<token từ Step 2>"
gh secret set TELEGRAM_CHAT_ID --body "8699204695"
```

Expected: mỗi lệnh in `✓ Set Actions secret ... for ngothaitinh/1992land-rebuild`.
Nếu `gh` chưa đăng nhập → làm thủ công qua UI: repo → Settings → Secrets and variables → Actions → New repository secret, thêm đủ 5 tên trên.

- [ ] **Step 4: Xác nhận đủ 5 secrets**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild" && gh secret list
```

Expected: danh sách có `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (cùng các secret cũ như FTP_*, GA4_ID...).

---

### Task 5: Test end-to-end đường thành công

**Files:**
- Modify: `scripts/tg-bot/deploy-vps.sh` (chỉ thêm 1 dòng comment vô hại để tạo diff trong `scripts/tg-bot/**`)

**Interfaces:**
- Consumes: workflow (Task 2), key trên VPS (Task 3), secrets (Task 4).
- Produces: bằng chứng workflow chạy xanh + Telegram báo ✅.

- [ ] **Step 1: Ghi lại uptime pm2 hiện tại trên VPS (mốc so sánh)**

```bash
ssh root@160.191.88.139 "pm2 describe tg-bot-1992land | grep -E 'uptime|restarts' || pm2 status tg-bot-1992land"
```

Expected: thấy uptime/số restart hiện tại — ghi nhớ để đối chiếu.

- [ ] **Step 2: Tạo thay đổi vô hại trong scripts/tg-bot/ + push**

Thêm 1 dòng comment vào cuối đầu file `deploy-vps.sh` (không đổi logic), rồi:

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild"
git add scripts/tg-bot/deploy-vps.sh
git commit -m "chore(tg-bot): trigger test auto-deploy"
git push origin main
```

Expected: push thành công.

- [ ] **Step 3: Theo dõi workflow chạy**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild" && gh run watch --exit-status $(gh run list --workflow=deploy-bot.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

Expected: job `deploy-bot` kết thúc `completed success`. (Nếu không có `gh`, mở tab Actions xem.)

- [ ] **Step 4: Xác nhận VPS đã reload + Telegram báo ✅**

```bash
ssh root@160.191.88.139 "pm2 describe tg-bot-1992land | grep -E 'uptime|restarts'"
```

Expected: uptime đã reset (nhỏ hơn mốc Step 1) HOẶC số restart tăng — chứng tỏ `deploy-vps.sh` đã chạy reload. Đồng thời anh Thọ nhận tin `✅ Bot đã cập nhật lên VPS (commit ...)`.

- [ ] **Step 5: Xác nhận paths filter — push nội dung KHÔNG kích hoạt workflow bot**

Đối chiếu lịch sử push gần đây: một push chỉ đụng `data/**` hoặc `app/**` (không đụng `scripts/tg-bot/**`) phải KHÔNG tạo run `deploy-bot.yml`.

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild"
gh run list --workflow=deploy-bot.yml --limit 5 --json headSha,event,createdAt
```

Expected: danh sách run chỉ ứng với các commit thực sự đụng `scripts/tg-bot/**` (vd commit test ở Step 2). Không có run nào cho commit chỉ đổi nội dung. Nếu chưa có mẫu đối chứng, xem như đã bảo đảm bằng khai báo `paths:` trong Task 2 — không cần cố tạo push nội dung chỉ để test.

---

### Task 6: Test đường thất bại (báo lỗi qua Telegram)

**Files:**
- Không sửa file repo — dùng nhánh throwaway để mô phỏng lỗi.

**Interfaces:**
- Consumes: toàn bộ pipeline đã dựng.
- Produces: bằng chứng khi deploy fail thì job đỏ + Telegram báo ❌ + bot cũ vẫn sống.

- [ ] **Step 1: Kích hoạt workflow bằng tay với điều kiện lỗi**

Cách an toàn nhất không đụng `main`: tạm đổi tên `.env` trên VPS để `deploy-vps.sh` fail ở bước [2] (thiếu `.env` → `exit 1`), rồi chạy workflow qua `workflow_dispatch`:

```bash
ssh root@160.191.88.139 "mv /root/bot/scripts/tg-bot/.env /root/bot/scripts/tg-bot/.env.bak"
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild" && gh workflow run deploy-bot.yml --ref main
```

Expected: workflow được kích hoạt.

- [ ] **Step 2: Xác nhận job đỏ + Telegram báo ❌**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild" && gh run watch $(gh run list --workflow=deploy-bot.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

Expected: step `Deploy over SSH` FAIL, step `Notify Telegram` vẫn chạy (do `if: always()`). Anh Thọ nhận `❌ Deploy bot thất bại (commit ...). Xem log: ...`.

- [ ] **Step 3: Xác nhận bot cũ vẫn chạy (deploy fail không giết bot)**

```bash
ssh root@160.191.88.139 "pm2 status tg-bot-1992land"
```

Expected: process vẫn `online` — vì `deploy-vps.sh` fail TRƯỚC bước pm2 reload, bot cũ không bị đụng.

- [ ] **Step 4: Khôi phục .env trên VPS**

```bash
ssh root@160.191.88.139 "mv /root/bot/scripts/tg-bot/.env.bak /root/bot/scripts/tg-bot/.env"
```

Expected: `.env` trở lại. Lần push tiếp theo sẽ deploy thành công bình thường.

---

### Task 7: Chốt & dọn dẹp

**Files:**
- Không sửa repo (chỉ dọn scratchpad).

- [ ] **Step 1: Xoá private key khỏi máy local (đã nằm trong GitHub Secret rồi)**

```bash
KEYDIR="C:/Users/ASUS/AppData/Local/Temp/claude/C--Users-ASUS-Desktop-1992-1992land-rebuild/cc6b300b-f36a-4a82-b5c8-c94b78b11f3e/scratchpad"
rm -f "$KEYDIR/deploy-vps-ci" "$KEYDIR/deploy-vps-ci.pub"
```

Expected: key tạm bị xoá. Public key vẫn còn trên VPS `authorized_keys`, private key vẫn trong GitHub Secret — pipeline không phụ thuộc file local.

- [ ] **Step 2: Xác nhận trạng thái repo sạch, không lẫn key**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild" && git status && git log --oneline -3
```

Expected: working tree clean; lịch sử có commit workflow + commit trigger test; KHÔNG có file key nào.

- [ ] **Step 3: Báo cáo anh Thọ qua Telegram**

```bash
cd "C:/Users/ASUS/Desktop/1992/1992land-rebuild"
node scripts/notify.mjs "✅ Xong: từ nay push code bot lên main sẽ tự deploy lên VPS, không cần SSH tay. Anh sẽ nhận tin báo ✅/❌ sau mỗi lần deploy."
```

Expected: anh Thọ nhận tin.

---

## Ghi chú về khả năng verify

Đây là việc hạ tầng: không có unit test kiểu TDD cho GitHub Actions. "Test" thực chất là:
- Task 2: kiểm cú pháp YAML (tĩnh).
- Task 3 Step 3: chứng minh forced command chặn shell tự do (bảo mật).
- Task 5: E2E đường thành công (push thật → job xanh → pm2 reload → Telegram ✅).
- Task 6: E2E đường thất bại (job đỏ → Telegram ❌ → bot cũ vẫn sống).

Không mô phỏng được các bước hạ tầng bằng mock nên ta xác thực bằng quan sát thật (uptime pm2, tin Telegram, màu job) — đúng tinh thần "evidence before assertions".
