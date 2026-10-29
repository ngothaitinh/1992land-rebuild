# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Người mua để ở thực và nhà đầu tư cá nhân (cả lướt sóng lẫn dòng tiền) quan tâm bất động sản khu vực HCMC và lân cận (Vũng Tàu, Long An, Đồng Nai, Bình Dương...). Họ xem dự án, so sánh, rồi gọi/Zalo/Messenger hoặc để lại form cho anh Thọ. Nhiều khách vào từ link bài đăng Facebook/Zalo trên điện thoại (suy từ code, chưa xác nhận).

## Product Purpose
Website môi giới BĐS của 1992 Land: giới thiệu các dự án đang phân phối, bài viết thị trường, pháp lý, và dẫn khách tới tư vấn trực tiếp với anh Nguyễn Hữu Thọ. Thành công = khách để lại liên hệ hoặc nhắn Zalo/Messenger.

## Positioning
Cá nhân anh Thọ tư vấn trực tiếp, đứng tên và chịu trách nhiệm. Tagline: "Giá Trị Kiến Tạo Lòng Tin".

## Operating Context
Static export (Next.js), deploy qua GitHub Actions lên DirectAdmin bằng FTP. Nội dung dự án nằm trong `data/projects/*.json`, bài viết trong `data/posts/*.md`; anh Thọ gửi nội dung qua pipeline Telegram. Có trang dashboard nội bộ, trang pháp lý, tuyển dụng, và landing riêng (Maia Resort Hồ Tràm, Thanh Phú Centre Point).

## Capabilities and Constraints
- Tiếng Việt là ngôn ngữ chính; không tone sales, không caps lock.
- Không bịa dữ liệu dự án (giá, diện tích, CĐT, pháp lý, tiến độ): thiếu thì ghi "Liên hệ" hoặc ẩn section.
- Link ngoài có `target="_blank" rel="noopener"`.
- Component client chỉ khi cần state/effect; component dưới 150 dòng.

## Brand Commitments
1992 Land, môi giới BĐS HCMC, chủ sở hữu Nguyễn Hữu Thọ, 0909474123, Thủ Đức. Zalo zalo.me/0909474123, Messenger m.me/165126330021000. Font Be Vietnam Pro (sans), Inter (số). Màu navy-* và gold-* trong `app/globals.css`.

## Evidence on Hand
12 file dự án trong `data/projects/`, bài viết trong `data/posts/`, ảnh dự án trong `public/`. Không tự thêm testimonial, số liệu hay claim chưa có trong dữ liệu.

## Product Principles
1. Thật thà trước hấp dẫn: dữ liệu chưa xác thực thì để trống, không điền cho đẹp.
2. Người thật đứng sau: anh Thọ là điểm tựa niềm tin, liên hệ trực tiếp luôn trong tầm tay.
3. Mobile trước: khách đến từ mạng xã hội, xem trên điện thoại.
4. Giọng điềm đạm, rõ ràng, không thổi phồng.
