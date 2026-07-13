# Hướng dẫn Quản lý Website 1992land.com

Trang quản lý cho phép **thêm – sửa – xoá dự án và bài viết** ngay trên trình duyệt,
không cần biết code. Mọi thay đổi tự động build lại và cập nhật web sau **~8 phút**.

> Địa chỉ quản lý: **https://1992land.com/admin/**

---

## PHẦN A — Cài đặt 1 lần (kỹ thuật, làm 1 lần duy nhất)

Chỉ cần làm **một lần**. Sau đó Anh Thọ dùng web bình thường, không đụng tới phần này nữa.

### 1. Tạo GitHub OAuth App
1. Đăng nhập GitHub (tài khoản `ngothaitinh`) → mở
   **https://github.com/settings/developers** → **OAuth Apps** → **New OAuth App**.
2. Điền:
   - **Application name:** `1992land CMS`
   - **Homepage URL:** `https://1992land.com`
   - **Authorization callback URL:** `https://1992land.com/auth/callback.php`  ← phải đúng từng ký tự
3. Bấm **Register application** → bấm **Generate a new client secret**.
4. Copy lại **Client ID** và **Client secret** (secret chỉ hiện 1 lần).

### 2. Lưu 2 khoá vào GitHub Secrets
Mở repo → **Settings → Secrets and variables → Actions → New repository secret**, tạo 2 cái:

| Name | Value |
|---|---|
| `OAUTH_CLIENT_ID` | Client ID vừa copy |
| `OAUTH_CLIENT_SECRET` | Client secret vừa copy |

### 3. Kích hoạt
Vào tab **Actions** của repo → chạy lại workflow **Build & Deploy** (nút *Run workflow*),
hoặc commit bất kỳ. CI sẽ tự sinh file `auth/config.php` trên server.

✅ Xong. Từ giờ vào `https://1992land.com/admin/` đăng nhập bằng GitHub là quản lý được.

---

## PHẦN B — Sử dụng hằng ngày (dành cho Anh Thọ)

### Đăng nhập
1. Mở **https://1992land.com/admin/** (lưu vào màn hình chính điện thoại cho tiện).
2. Bấm **Login with GitHub** → đăng nhập 1 lần, lần sau tự nhớ.

Màn hình có 2 mục: **Dự án** và **Tin tức**.

### Thêm một dự án mới
1. Vào **Dự án** → bấm **New Dự án** (góc trên phải).
2. Điền các ô. Quan trọng nhất:
   - **Tên dự án**, **Slug URL** (gõ không dấu, dùng dấu `-`, ví dụ `akari-city`).
   - **Trạng thái**, **Loại hình**, **Khu vực**, **Vị trí**, **Chủ đầu tư**, **Giá từ**.
   - **Mô tả ngắn** (2–3 dòng hiện ở danh sách).
   - **Đoạn mô tả từng mục** (mở ra để viết phần Tổng quan / Chính sách / Giá bán /
     Vị trí / Điểm nổi bật / Tiện ích / Pháp lý). **Viết ngắn gọn, không cần dài.**
     Bôi đậm bằng cách bọc `**chữ cần đậm**`.
3. **Ảnh** (kéo thả hoặc bấm chọn từ máy/điện thoại):
   - **Ảnh bìa** — ảnh đại diện dự án.
   - **Thư viện ảnh (slide)** — bấm `+` thêm nhiều ảnh; kéo để đổi thứ tự slide.
   - **Ảnh phối cảnh / vị trí / mặt bằng tổng thể**, **Ảnh tiện ích (slide)** — tuỳ chọn.
4. Bấm **Save** → khi ưng bấm **Publish → Publish now**.
5. Chờ **~8 phút**, web cập nhật.

> 💡 Mục nào **không có dữ liệu** thì để trống — web tự ẩn mục đó (không hiện ô trống).
> Muốn ẩn hẳn một mục dù có dữ liệu: thêm id mục vào **Ẩn section**
> (`chinh-sach`, `gia-ban`, `vi-tri`, `tien-ich`, `mat-bang`, `phap-ly`...).

### Sửa dự án / bài viết
Vào **Dự án** (hoặc **Tin tức**) → bấm vào mục cần sửa → chỉnh → **Publish**.
Sửa được mọi thứ: chữ, giá, ảnh bìa, thêm/bớt/đổi thứ tự slide, lịch thanh toán, FAQ...

### Xoá dự án / bài viết
Mở mục đó → menu **⋮ (ba chấm)** góc trên → **Delete entry** → **Publish**.

### Thêm bài viết
Vào **Tin tức** → **New Bài viết** → điền Tiêu đề, Slug, Ngày, Chuyên mục, Ảnh bìa,
và **Nội dung** (trình soạn thảo có in đậm, tiêu đề, danh sách). **Viết gọn, đủ ý.**

---

## Mẹo & xử lý nhanh

- **Quên không thấy thay đổi:** web cập nhật sau ~8 phút; thử tải lại trang (Ctrl+F5).
- **Ảnh nên < 1–2 MB** để web nhẹ; ảnh ngang đẹp hơn ảnh dọc cho ảnh bìa.
- **Đăng nhập lỗi "config":** nghĩa là PHẦN A chưa xong — kiểm tra 2 Secrets và chạy lại Actions.
- **Khôi phục:** mọi thay đổi đều lưu lịch sử trên GitHub, có thể xem lại / hoàn tác.

---

## Hai cách quản lý — dùng cái nào?

| Việc | Web admin (`/admin/`) | Telegram bot |
|---|---|---|
| Thêm dự án / bài viết | ✔ điền form đầy đủ | ✔✔ nhắn + gửi ảnh, bot soạn nháp cho duyệt |
| Sửa chữ (tiêu đề, giá, vị trí, mô tả ngắn…) | ✔ | ✔ bấm chọn từ danh sách, không cần nhớ slug |
| Ẩn / hiện một phần của trang dự án | ✔ | ✔ bảng bật-tắt, ✅ là đang hiện |
| Xoá | ✔ | ✔ có hỏi lại trước khi xoá |
| Hoàn tác thao tác vừa làm | ✘ (phải vào GitHub) | ✔ nút ↩️ trong 30 phút |
| Ảnh bìa, thư viện slide, lịch thanh toán, FAQ | ✔✔ chỉ làm được ở đây | ✘ |

➡️ **Telegram** cho việc hằng ngày, làm được ngay trên điện thoại.
**Web admin** khi cần đụng tới ảnh, slide và các mục có cấu trúc phức tạp.

### Dùng bot Telegram
Nhắn `/menu` cho bot, rồi bấm nút — không phải gõ lệnh hay nhớ slug.
Menu ☰ của Telegram cũng có lối tắt: `/themduan`, `/thembai`, `/sua`, `/anhien`, `/xoa`.
Kẹt giữa chừng thì gõ `/huy` để thoát, hoặc `/trogiup` để xem hướng dẫn.
