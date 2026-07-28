# Landing page — thêm khung ảnh minh họa (Pháp lý + Gallery ảnh)

## Bối cảnh

Trang chi tiết dự án (`app/du-an/[slug]/page.tsx` → `components/ProjectDetailView.tsx`) thiếu ảnh minh họa ở một số section, khiến trang kém sinh động. Rà soát code hiện tại cho thấy:

- **Điểm nổi bật & lý do đầu tư**: đã có `ProjectImageCarousel` hiển thị `gallery.slice(0,4)` — đã đạt yêu cầu, không cần sửa.
- **Tiện ích dự án**: đã có `AmenitiesGallery` (grid + lightbox) gắn với field `amenities_images` — component đã có, nhưng 11/12 dự án chưa có dữ liệu ảnh (ngoài phạm vi spec này).
- **Tiến độ & Pháp lý**: **không có bất kỳ hỗ trợ ảnh nào** trong code — đây là khoảng trống thật sự.
- **Gallery ảnh tổng thể**: **chưa có section riêng nào** hiển thị toàn bộ ảnh dự án dưới dạng thư viện — cũng là khoảng trống thật sự. Component `ProjectGalleryGrid` đã được viết sẵn nhưng chưa từng được import/dùng ở đâu trong `app/` hay `components/`.

Kiểm tra dữ liệu thực tế 12 file `data/projects/*.json`: hầu hết dự án có `gallery` 4-5 ảnh (chỉ 1 dự án có 1 ảnh), nhưng `overview_image` = 0/12, `location_image` = 4/12, `amenities_images` = 1/12 (Salacia Villas, 8 ảnh).

## Phạm vi

Chỉ làm phần code/khung hiển thị. Việc tìm và gán ảnh thật cho từng dự án (construction_images, amenities_images cho 11 dự án còn thiếu, v.v.) là công việc tiếp theo, làm project-by-project, không nằm trong spec này.

## Thay đổi

### 1. Schema — `lib/data.ts`

Thêm 1 field mới vào type `Project`:

```ts
construction_images?: string[];   // ảnh tiến độ thi công thực tế, hiển thị trong "Tiến độ & Pháp lý"
```

Section Gallery ảnh tổng thể không cần field mới — dùng lại `gallery?: string[]` đã có.

### 2. `components/ProjectDetailView.tsx`

**a. Section "Tiến độ & Pháp lý" (`phap-ly`)** — thêm cụm ảnh tiến độ thi công ngay dưới `SecHead`/video, phía trên 2 card (Tiến độ xây dựng / Pháp lý):

```tsx
{project.construction_images && project.construction_images.length > 0 && (
  <AmenitiesGallery images={project.construction_images} title={`Tiến độ thi công ${project.title}`} />
)}
```

Tái sử dụng nguyên `AmenitiesGallery` (grid + lightbox) — cùng pattern hiển thị với Tiện ích, không cần component mới.

**b. Section mới "Thư viện ảnh" (`thu-vien-anh`)** — section độc lập, dùng lại component `ProjectGalleryGrid` (đang mồ côi, chưa dùng ở đâu):

```tsx
{show("thu-vien-anh") && project.gallery && project.gallery.length > 0 && (
  <>
    <Divider />
    <section className="py-14">
      <SecHead id="thu-vien-anh" title="Thư viện ảnh dự án" />
      <ProjectGalleryGrid images={project.gallery} title={project.title} />
    </section>
  </>
)}
```

Vị trí: đặt sau section "Điểm nổi bật", trước "Tiện ích" — vì lúc này người xem đã ở trạng thái khám phá hình ảnh, đặt gallery tiếp nối tự nhiên trước khi vào chi tiết tiện ích.

Cần thêm import `ProjectGalleryGrid` vào đầu file.

**c. `anchorSections`** — thêm điều kiện:
```ts
show("thu-vien-anh") && project.gallery?.length ? "thu-vien-anh" : null,
```
chèn vào đúng vị trí tương ứng thứ tự hiển thị (sau `diem-noi-bat`, trước `tien-ich`).

### 3. `components/ProjectAnchorNav.tsx`

Thêm vào `ALL_SECTIONS`:
```ts
{ id: "thu-vien-anh", label: "Thư viện ảnh" },
```
đặt đúng vị trí thứ tự khớp với thứ tự xuất hiện trên trang (nav tự lọc theo `sections` prop nên thứ tự khai báo trong `ALL_SECTIONS` cần khớp thứ tự hiển thị thật).

### 4. Tôn trọng `hidden_sections`

Cả 2 thay đổi đều dùng `show(id)` / kiểm tra `hidden_sections` như các section khác — anh Thọ vẫn có thể ẩn section nếu dự án không có ảnh phù hợp.

## Không nằm trong phạm vi
- Không sourcing/upload ảnh cho bất kỳ dự án nào.
- Không sửa `amenities_images` hiện có (vẫn thiếu ở 11/12 dự án).
- Không đổi hành vi `ProjectImageCarousel` ở "Điểm nổi bật" (đã đạt yêu cầu).

## Kiểm tra sau khi code xong
- Build thử (`pnpm build` hoặc `npm run build`) không lỗi TypeScript vì field mới optional.
- Kiểm tra 1 dự án có `gallery` (đa số) → section "Thư viện ảnh" hiển thị, anchor nav có mục mới, click chuyển đúng vị trí.
- Kiểm tra dự án chưa có `construction_images` (tất cả hiện tại) → phần ảnh trong Pháp lý không render gì, không lỗi.
- Test nhanh: gán tạm `construction_images` cho 1 dự án bất kỳ (local, không commit ảnh thật) để xác nhận UI hiển thị đúng, rồi revert.
