# Tối ưu chuyển đổi trang chi tiết dự án (`/du-an/[slug]`)

**Ngày:** 2026-07-24
**Trạng thái:** Chờ anh Thọ duyệt.

## Bối cảnh

Trang chi tiết dự án là landing page chính cho traffic quảng cáo trả phí (Google Ads / Facebook Ads). Trang đã có một đợt tối ưu chuyển đổi trước đó (sticky sidebar form, key stats strip, QuickLead CTA, floating CTA desktop + sticky bar mobile, GTM/GA4/Google Ads conversion tracking đã nối dây). Chưa có dữ liệu chuyển đổi thật để tối ưu theo số liệu — đợt này là một vòng sửa theo kinh nghiệm ngành BĐS (heuristic), không gắn thêm đo lường mới.

## Phạm vi

Chỉ sửa `components/ProjectDetailView.tsx` (dùng chung cho mọi trang `/du-an/[slug]` thật và khung preview trong `/dashboard`) + 1 dòng trong `app/layout.tsx`. Không đổi trang chủ, không đổi cấu trúc `data/projects/*.json`. Mọi số liệu hiển thị phải lấy từ field có sẵn trong data — không bịa giá, số căn còn lại, hay testimonial không có thật.

## Thay đổi

### 1. Thanh thông tin đầu trang (info bar)

Hiện tại: khối giá + nút Zalo + nút "Nhận bảng giá" ở bên phải info bar đang bị `hidden` hoàn toàn (kể cả desktop) — quyết định cũ từ commit "hide price/zalo/banggia buttons below hero slider".

Thay đổi: bỏ `hidden`.
- **Desktop:** hiện lại y như cấu trúc cũ (giá + 2 nút hành động).
- **Mobile:** gộp thành 1 dòng gọn dưới địa chỉ, không làm info bar cao thêm đáng kể — vì mobile đã có sticky bar 3 nút (Zalo/Form/Gọi) cố định ở đáy màn hình rồi, mục tiêu ở đây chỉ là *khách thấy giá ngay trong màn hình đầu tiên*, không phải thêm điểm bấm.

Lý do: traffic chính là quảng cáo trả phí — khách chưa biết 1992 Land, cần thấy giá trị (giá) và cách liên hệ ngay, không phải cuộn xuống QuickLead section mới thấy.

### 2. Key Stats Strip — chỉ báo khan hiếm thật

Logic khan hiếm (`available / total < 20%` → hiện "⚡ còn X căn") đã tồn tại sẵn trong bảng "Giá bán" (`components/ProjectDetailView.tsx`, khoảng dòng 370), nhưng nằm sâu giữa trang.

Thay đổi: tính lại đúng logic đó ở Key Stats Strip (đầu trang, ngay dưới anchor nav). Nếu có ≥1 loại sản phẩm trong `project.product_types` thoả điều kiện khan hiếm, hiện 1 chip nhỏ dạng "⚡ Chỉ còn X căn {tên loại}" — chọn loại khan hiếm nhất nếu có nhiều loại đều thoả. Nếu dự án không có `product_types` hoặc không loại nào khan hiếm → không hiện gì thêm, giữ nguyên strip như hiện tại.

### 3. QuickLead section — trust chip

QuickLead (section navy gradient có form, ngay dưới Key Stats Strip) hiện có 3 badge tĩnh ("Pháp lý đầy đủ", "Sổ đỏ lâu dài", "BIM Land") nhưng không có yếu tố xã hội chứng thực (social proof) nào.

Thay đổi: thêm 1 quote khách hàng nhỏ gọn ngay dưới hàng badge đó — dùng lại đúng data `testimonials` trong `lib/data.ts` (đã có sẵn 4 testimonial thật, gắn tên dự án cụ thể), hiển thị dạng compact (chữ cái đầu + tên + vai trò + tên dự án của testimonial đó — không phải carousel đầy đủ như `components/Testimonials.tsx` ở trang chủ).

Quy tắc chọn testimonial:
- Ưu tiên testimonial có `project` khớp đúng `project.title` đang xem.
- Nếu không có testimonial khớp, lấy testimonial đầu tiên trong danh sách — **nhưng vẫn hiển thị đúng tên dự án gốc của nó** (vd "Chị Vân · Nhà đầu tư · Ansana by Kita"). Không bao giờ hiển thị mập mờ khiến người đọc tưởng nhầm là khách của dự án đang xem nếu thực tế không phải.

### 4. Kỹ thuật tốc độ tải

Thêm `<link rel="preconnect" href="https://www.googletagmanager.com">` vào `<head>` của `app/layout.tsx` — rút ngắn thời gian thiết lập kết nối tới GTM, có lợi cho Core Web Vitals / Quality Score quảng cáo trả phí. Thay đổi nhỏ, không rủi ro.

**Ghi chú riêng (không thuộc phạm vi code đợt này):** một số ảnh hero khá nặng (vd `public/images/projects/izumi-city-dong-nai/hero.jpg` ~600KB) — nên nén lại để cải thiện tốc độ tải, nhưng cần xem chất lượng ảnh bằng mắt trước khi nén nên để anh Thọ/Jimmy xử lý riêng, không tự động hoá trong đợt này.

## Không đổi (đã đủ tốt, ngoài phạm vi)

Sticky bar mobile 3 nút, Floating CTA desktop, form liên hệ 2 trường bắt buộc (tên + SĐT), GTM/GA4/Google Ads conversion tracking hiện có, anchor nav, sticky sidebar form desktop, QuickLead section (giữ nguyên cấu trúc, chỉ thêm trust chip).

## Testing / tiêu chí thành công

1. Mở 1 dự án có testimonial khớp tên (`ansana-by-kita`) → QuickLead hiện đúng quote của Chị Vân, đúng vai trò "Nhà đầu tư · Ansana by Kita".
2. Mở 1 dự án không có testimonial khớp (vd 1 trong các dự án còn lại) → vẫn hiện 1 quote, nhưng ghi đúng tên dự án thật của quote đó (không phải dự án đang xem).
3. Mở 1 dự án có `product_types` với ít nhất 1 loại khan hiếm (<20% còn lại) → thấy chip "⚡" ở Key Stats Strip đầu trang, đúng số liệu khớp với bảng Giá bán giữa trang.
4. Mở 1 dự án không có `product_types` → Key Stats Strip không đổi so với hiện tại, không lỗi.
5. Trên mobile, info bar hiện giá + nút không làm vỡ layout, không che sticky bar 3 nút ở đáy màn hình.
6. `npm run build` chạy sạch, tạo đủ trang tĩnh cho toàn bộ 12 dự án hiện có.
7. Preview trong `/dashboard/du-an/{slug}` (dùng chung `ProjectDetailView`) phản ánh đúng các thay đổi trên — không cần sửa gì thêm ở dashboard vì component dùng chung.

## Việc để sau (ngoài phạm vi v1)

- Gắn tracking micro-conversion (click gọi/Zalo, form-start vs form-submit, scroll depth) để có dữ liệu thật cho vòng tối ưu tiếp theo.
- Nén lại các ảnh hero quá nặng.
- Áp dụng các cải thiện tương tự cho trang chủ nếu cần.
