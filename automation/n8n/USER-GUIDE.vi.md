# Hướng dẫn sử dụng Bot Telegram 1992Land

> Bot quản lý nội dung website 1992land.com trực tiếp qua Telegram.  
> Không cần biết kỹ thuật — chỉ cần nhắn tin như bình thường.

---

## Các lệnh

| Lệnh | Tác dụng |
|------|----------|
| `/menu` | Về trang chính |
| `/them` | Thêm dự án hoặc bài viết |
| `/sua` | Sửa nội dung đã đăng |
| `/xoa` | Xoá nội dung đã đăng |
| `/huy` | Huỷ thao tác đang làm |
| `/help` | Xem hướng dẫn |

---

## 1. Thêm dự án

**Bước 1:** Gõ `/them`

```
Anh: /them
Bot: 📋 Anh muốn thêm gì?
     [📦 Dự án]  [📝 Bài viết]
```

**Bước 2:** Bấm **📦 Dự án**

```
Bot: Anh kể em nghe về dự án — cứ tự nhiên, không cần theo format.
     Có ảnh đại diện thì gửi luôn nhé.
```

**Bước 3:** Gửi thông tin (kèm ảnh nếu có)

```
Anh: Vinhomes Ocean Park 3 ở Gia Lâm Hà Nội, giá từ 2 tỷ,
     đang mở bán, chủ đầu tư Vinhomes, căn hộ cao cấp.
     [đính kèm ảnh phối cảnh]
```

**Bước 4:** Bot phân tích và hỏi xác nhận

```
Bot: 📋 Em hiểu thế này, anh xem giúp:
     • Tên: Vinhomes Ocean Park 3
     • Vị trí: Gia Lâm, Hà Nội
     • Chủ đầu tư: Vinhomes
     • Giá: Từ 2 tỷ/căn
     • Trạng thái: Đang mở bán
     • Loại: Căn hộ cao cấp
     • Ảnh: ✓

     [✅ Đăng lên web]  [✏️ Sửa]  [❌ Huỷ]
```

**Bước 5a:** Bấm **✅ Đăng lên web** nếu đúng

```
Bot: ✅ Đã đăng. Web cập nhật sau ~8 phút.
     🔗 https://1992land.com/du-an/vinhomes-ocean-park-3
```

**Bước 5b:** Bấm **✏️ Sửa** nếu muốn chỉnh

```
Bot: ✏️ Sửa field nào?
     [Tên][Vị trí][CĐT][Giá][Trạng thái][Loại][Khu vực][Mô tả]

Anh: [Giá]
Bot: Giá hiện tại: Từ 2 tỷ/căn
     Anh nhập giá mới:

Anh: Từ 2.5 tỷ/căn
Bot: 📋 Em hiểu thế này, anh xem giúp:
     ...
     • Giá: Từ 2.5 tỷ/căn  ← đã cập nhật
     [✅ Đăng lên web]  [✏️ Sửa]  [❌ Huỷ]
```

---

## 2. Thêm bài viết

Tương tự dự án, bấm **📝 Bài viết** ở bước 2.

```
Anh: /them → [📝 Bài viết]
Bot: Anh gửi nội dung bài viết — cứ viết tự nhiên.
     Nếu có ảnh bìa thì gửi kèm nhé.

Anh: [gửi nội dung bài viết + ảnh bìa]

Bot: 📋 Em hiểu thế này:
     • Tiêu đề: Có nên mua biệt thự nghỉ dưỡng năm 2026?
     • Đoạn mở: Biệt thự nghỉ dưỡng hấp dẫn vì cam kết...
     • Ảnh bìa: ✓
     [✅ Đăng]  [✏️ Sửa tiêu đề]  [✏️ Sửa nội dung]  [❌ Huỷ]
```

---

## 3. Sửa nội dung đã đăng

```
Anh: /sua
Bot: ✏️ Anh muốn sửa gì?
     [📦 Dự án]  [📝 Bài viết]

Anh: [📦 Dự án]
Bot: Chọn dự án muốn sửa:
     [📦 Vinhomes Ocean Park 3]
     [📦 Maia Resort Hồ Tràm]
     [📦 Blanca City Vũng Tàu]
     [📦 Izumi City Đồng Nai]
     [📦 Ansana by Kita]
     [🔍 Tìm khác]

Anh: [chọn dự án]
Bot: [hiện nội dung hiện tại + nút Sửa/Huỷ]
```

---

## 4. Xoá nội dung

```
Anh: /xoa → [📦 Dự án] → [chọn dự án]
Bot: ⚠️ Xác nhận xoá "Vinhomes Ocean Park 3"?
     Hành động không thể hoàn tác.
     [🗑️ Xoá]  [❌ Không]

Anh: [🗑️ Xoá]
Bot: ✅ Đã xoá. Web cập nhật sau ~8 phút.
```

> **Lưu ý:** Ảnh KHÔNG bị xoá theo — chỉ xoá file nội dung.

---

## 5. Huỷ bất kỳ lúc nào

Gõ `/huy` để huỷ thao tác đang làm:

```
Anh: /huy
Bot: ❌ Đã huỷ.
```

---

## FAQ

**Bot không trả lời?**
- Kiểm tra bot có đang chạy không (nhờ Jimmy kiểm tra n8n VPS).
- Đợi 30 giây rồi thử lại. Nếu vẫn không phản hồi, liên hệ Jimmy.

**Đăng sai phải làm sao?**
- Dùng `/sua` để sửa nội dung.
- Hoặc `/xoa` để xoá và đăng lại.

**Web chưa cập nhật sau 8 phút?**
- Kiểm tra GitHub Actions tại: `github.com/ngothaitinh/1992land-rebuild/actions`
- Nếu build fail, liên hệ Jimmy.

**Có thể dùng cả điện thoại không?**
- Được, bot hoạt động 100% trên Telegram mobile.

**Gửi ảnh thế nào?**
- Khi bot hỏi nội dung, anh chụp ảnh hoặc chọn từ thư viện rồi gửi trong cùng tin nhắn với nội dung.
- Hoặc gửi ảnh trước, kèm caption là nội dung dự án.

**Bot trả lời "Phiên đã hết hạn"?**
- Bot tự reset sau 30 phút không hoạt động. Gõ `/menu` để bắt đầu lại.
