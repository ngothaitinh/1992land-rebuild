# Kiểm soát thông tin landing page — chống bịa dữ liệu

Ngày: 2026-07-28
Trạng thái: Đã duyệt hướng tiếp cận (Approach C). Chưa thực hiện — tạm dừng theo yêu cầu anh Thọ, tiếp tục vào phiên sau.

## Bối cảnh

Trong phiên làm việc 2026-07-28, phát hiện bug: badge "Sổ đỏ lâu dài · BIM Land" bị hardcode cứng trong `components/ProjectDetailView.tsx` cho **mọi** dự án — "BIM Land" thực ra là CĐT của Thanh Phú Centre Point, bị hiển thị sai trên các dự án khác (gồm Maia Resort Hồ Tràm, CĐT thật là quỹ Warburg Pincus & VinaCapital). Đã sửa cho Maia. Cần rà soát có hệ thống hơn để tránh các bug tương tự và dữ liệu bịa/chưa xác nhận ở các trang còn lại.

Quy tắc nền đã có sẵn trong `CLAUDE.md`: không bịa giá/vị trí/pháp lý/CĐT, để trống hoặc "Liên hệ" nếu chưa xác định, verify trước khi báo cáo.

## Mục tiêu

Rà soát toàn bộ thông tin hiển thị trên các trang landing page (ưu tiên Blanca City Vũng Tàu và Thanh Phú Centre Point trước), phát hiện:
1. Nội dung hardcode trong component dùng chung nhưng mang tính đặc thù một dự án (như bug BIM Land).
2. Field dữ liệu JSON nêu sự kiện cụ thể (giá, CĐT, quy mô, pháp lý, tiến độ...) không có nguồn xác nhận rõ ràng.
3. Mâu thuẫn nội bộ hoặc trùng lặp y hệt giữa các dự án (dấu hiệu copy-paste nhầm).

Sau đó báo cáo cho anh Thọ qua Telegram, chờ duyệt từng ý trước khi sửa — không tự ý sửa JSON khi chưa xác nhận.

## Phạm vi

- **Ưu tiên ngay (phiên tiếp theo):** `data/projects/blanca-city-vung-tau.json`, `data/projects/thanh-phu-centre-point.json`.
- **Backlog (làm sau, không làm ngay):** 9 dự án còn lại (`ansana-by-kita`, `izumi-city-dong-nai`, `la-home-long-an`, `lusso-sai-gon`, `river-collection-an-gia`, `salacia-villas-phu-my`, `sun-group-cu-lao-pho`, `the-quay-phuoc-hai`, `water-concept`), và các trang/component dùng chung: trang chủ (`app/page.tsx`, số liệu "5+ năm kinh nghiệm", "500+ khách hàng", "500 gia đình"), `app/gioi-thieu`, `lib/data.ts` (4 testimonials), `app/tin-tuc/*`, `app/lien-he`, `app/tuyen-dung`, `app/chinh-sach-bao-mat`.
- Maia Resort Hồ Tràm: đã xử lý xong trong phiên này (commit `9034e4e`), không cần lặp lại.

## Quy trình (3 bước, cho mỗi dự án được audit)

### Bước 1 — Rà component dùng chung (làm một lần, áp dụng toàn site)
Grep toàn bộ `components/*.tsx` tìm chuỗi hardcode nghe như sự thật riêng của một dự án cụ thể (tên CĐT, con số %, thời hạn sở hữu, tên thương hiệu quản lý vận hành...) đang bị tái sử dụng cho mọi trang dự án. Với mỗi chỗ tìm thấy: sửa thành lấy động từ `project.*`, hoặc nếu không thể tổng quát hoá an toàn thì bỏ hẳn badge/copy đó thay vì để sai.

*Đã áp dụng 1 lần cho badge Pháp lý — cần rà thêm các phần khác của `ProjectDetailView.tsx` và các component dùng chung khác (`Testimonials.tsx`, `AmenitiesGallery.tsx`, `ProjectHeroSlider.tsx`...) xem còn hardcode nào tương tự không.

### Bước 2 — Audit field JSON của từng dự án
Đọc toàn bộ field trong file JSON của dự án (theo `Project` type ở `lib/data.ts`: `developer`, `priceRange`/`price_from`/`price_to`, `unit_count`, `area_from`/`area_to`, `legal_status`, `ownership`, `handover_date`, `scale`, `product_types[]`, `construction_update`, `payment_policy[]`, `discount`, `bank_support`, `grace_period`, `nearby[]`, `highlights[]`, `descriptions{}`, `faq[]`).

Gắn cờ field nào:
- Nêu con số/sự kiện cụ thể (không phải "Liên hệ"/"Đang cập nhật"/"Đang hoàn thiện") — cần xác nhận nguồn.
- Mâu thuẫn với field khác trong cùng file (vd legal_status nói "đang hoàn thiện" nhưng ownership nói "lâu dài").
- Trùng lặp gần như y hệt văn bản ở dự án khác trong `data/projects/*.json` — dấu hiệu copy-paste chưa sửa lại cho đúng dự án.

### Bước 3 — Báo cáo & chờ duyệt
Gửi Telegram (`node scripts/notify.mjs` hoặc `node --env-file=.env.local scripts/notify.mjs` — lưu ý cần `--env-file` vì biến môi trường không tự load) danh sách field bị gắn cờ theo từng dự án, dạng ngắn gọn: field → giá trị hiện tại → lý do nghi ngờ. Chờ anh Thọ trả lời xác nhận đúng/sai/để trống cho từng ý. Chỉ sửa JSON sau khi có xác nhận — không tự động bỏ trống hàng loạt trước khi hỏi.

## Việc không làm trong đợt audit này

- Không đổi cấu trúc `Project` type hay thêm field mới.
- Không viết script tự động hoá quét (YAGNI — khối lượng dự án nhỏ (12 file), đọc tay + grep là đủ, không cần công cụ riêng).
- Không đụng vào 9 dự án backlog và các trang dùng chung trong đợt đầu — chỉ liệt kê để làm sau.

## Việc lâu dài (áp dụng sau khi audit xong đợt đầu)

Bổ sung vào `CLAUDE.md` mục "Rules — Chống Hallucination" một dòng checklist cụ thể: **không hardcode chuỗi mang tính sự thật riêng một dự án (tên CĐT, % cam kết, thời hạn sở hữu...) trong component dùng chung** — luôn lấy từ `project.*`; nếu không thể tổng quát hoá thì không hiển thị badge/copy đó.

## Bước tiếp theo (phiên sau)

1. Audit Blanca City Vũng Tàu theo quy trình trên.
2. Audit Thanh Phú Centre Point theo quy trình trên.
3. Gửi báo cáo Telegram, chờ anh Thọ duyệt.
4. Sau khi có xác nhận, sửa JSON + rà thêm component dùng chung nếu phát hiện hardcode mới.
5. Cập nhật memory `project-pending-tasks` với danh sách 9 dự án + trang dùng chung còn lại trong backlog.
