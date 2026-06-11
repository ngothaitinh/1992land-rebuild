# Hướng dẫn quản lý website bằng Telegram

> Dành cho anh Thọ. Anh **chỉ cần nhắn tin cho bot** để thêm / sửa / xóa dự án và bài viết — không cần đụng tới code.

---

## 1. Cách hoạt động (đọc 1 lần cho hiểu)

1. Anh **gửi nội dung** (theo mẫu bên dưới) vào bot Telegram.
2. Em (trợ lý) đọc, soạn lại cho chuẩn, rồi gửi anh **bản xem trước** kèm 3 nút:
   **✅ Duyệt** · **✏️ Sửa** · **❌ Hủy**.
3. Anh bấm **✅ Duyệt** → nội dung tự lên web sau khoảng **8 phút**.

> ⚠️ **Quan trọng:** bot không tự trực 24/7. Nó trả lời khi trợ lý đang mở.
> Bình thường anh cứ gửi, lần sau mở trợ lý là xử lý. Cần gấp thì xem **mục 5**.

---

## 2. Mẹo dễ nhất: gửi chữ **menu**

Không cần nhớ mẫu. Cứ nhắn **`menu`** (hoặc `mẫu`) → bot gửi lại **toàn bộ mẫu** để anh chạm-giữ-copy, điền vào rồi gửi.

---

## 3. Bộ mẫu

Quy tắc: **dòng đầu là lệnh trong `[NGOẶC VUÔNG]`**, các dòng sau điền `Nhãn: nội dung`.
Trường nào không có thì **bỏ trống** — em sẽ không bịa số liệu.

### ➕ Thêm dự án mới
```
[THÊM DỰ ÁN]
Tên:
Chủ đầu tư:
Vị trí:
Loại hình: (căn hộ / biệt thự / đất nền / nhà phố / nghỉ dưỡng / phức hợp)
Tỉnh: (TP.HCM / Vũng Tàu / Bình Dương / Long An / Đồng Nai)
Giá:
Quy mô:
Pháp lý:
Bàn giao:
Tiện ích:
Điểm nổi bật:
(kèm 1 ảnh bìa + 3–5 ảnh trong cùng tin nhắn)
```

### ✏️ Sửa thông tin dự án
Chỉ ghi những dòng cần đổi:
```
[SỬA DỰ ÁN]
Dự án: <tên hoặc slug>
Giá: <giá mới>
Trạng thái: <vd: Đã bàn giao>
```

### 🗑️ Xóa dự án
```
[XÓA DỰ ÁN]
Dự án: <tên hoặc slug>
```

### 🙈 Ẩn / hiện một phần của trang dự án
```
[ẨN PHẦN]
Dự án: <tên>
Phần: giá bán
```
```
[HIỆN PHẦN]
Dự án: <tên>
Phần: giá bán
```
Các phần có thể ẩn/hiện: **tổng quan, giá bán, chính sách, vị trí, tiện ích, điểm nổi bật, pháp lý**.

### 📝 Thêm bài viết mới
```
[THÊM BÀI VIẾT]
Tiêu đề:
Chuyên mục: (Thị trường / Kinh nghiệm / Pháp lý / Đầu tư)
Mô tả ngắn:
Nội dung:
<thân bài, có thể nhiều đoạn>
(kèm ảnh bìa nếu có)
```

### ✏️ Sửa bài viết
```
[SỬA BÀI VIẾT]
Bài: <tiêu đề hoặc slug>
Tiêu đề: <mới>
Mô tả ngắn: <mới>
Nội dung: <mới>
```

### 🗑️ Xóa bài viết
```
[XÓA BÀI VIẾT]
Bài: <tiêu đề hoặc slug>
```

---

## 4. Ví dụ thật

**Đổi giá + trạng thái một dự án:**
```
[SỬA DỰ ÁN]
Dự án: Salacia Villas
Giá: Town Villa từ 5 – 5.5 tỷ
Trạng thái: Đang bàn giao
```

**Ẩn phần giá bán (khi chưa có giá chính thức):**
```
[ẨN PHẦN]
Dự án: Lusso Sài Gòn
Phần: giá bán
```

**Đăng bài viết mới:**
```
[THÊM BÀI VIẾT]
Tiêu đề: 3 lưu ý khi mua đất nền Long An 2026
Chuyên mục: Kinh nghiệm
Mô tả ngắn: Pháp lý, hạ tầng và thanh khoản — ba yếu tố quyết định.
Nội dung:
Thị trường đất nền Long An đang ấm dần...
(viết tiếp các đoạn)
```

---

## 5. Khi cần đăng GẤP

Bình thường nội dung sẽ được xử lý ở lần kế anh mở trợ lý. Nếu cần lên web ngay:

1. Anh gửi nội dung (theo mẫu) vào bot như thường.
2. Mở **Claude Code**, gõ đúng một câu:
   > **Xử lý Telegram ngay**
3. Trợ lý sẽ kéo tin → soạn → gửi xem trước → anh duyệt → deploy ngay.

> Nếu đăng nhiều tin liên tục: gõ `/loop 5 phút` để trợ lý tự kiểm tra hộp thư mỗi 5 phút.

---

## 6. Câu hỏi thường gặp

**Gửi ảnh thế nào?** Đính kèm ảnh ngay trong tin nhắn cùng phần chữ. Ảnh đầu = ảnh bìa.

**Lỡ điền sai thì sao?** Cứ bấm **✏️ Sửa** ở bản xem trước, hoặc gửi lại tin mới — bản cũ chưa lên web là chưa ảnh hưởng gì.

**Bot không trả lời?** Là do trợ lý chưa mở (xem mục 1 & 5), **không phải lỗi**. Nội dung anh gửi vẫn được lưu, không mất.

**Không nhớ tên/slug dự án?** Ghi gần đúng tên là được (vd "Salacia", "Lusso", "La Home") — em tự nhận ra.

**Em có tự bịa số liệu không?** Không. Thiếu dữ liệu thì để trống / ghi "Liên hệ" và hỏi lại anh.
