# Slice 1 — Video dự án + web admin gọn theo mục

**Ngày:** 2026-07-18
**Thuộc:** `2026-07-18-project-section-editing-overview.md` (Slice 1/3)
**Mục tiêu:** Trang dự án render được **video YouTube** theo từng mục; web admin (`/admin/`) có ô dán link video cho mỗi mục và form sắp theo cụm mục. Không đụng bot.

## Kết quả cuối
- Anh Thọ vào `/admin/` → mở 1 dự án → mỗi mục (Tổng quan/Vị trí/…) có ô **"Video YouTube (dán link)"** → dán link → Publish → trang dự án hiện khung video nhúng trong mục đó.
- Chữ + ảnh từng mục vẫn sửa như cũ (không đổi).

## Mô hình dữ liệu

Thêm **1 field mới duy nhất** vào project JSON:

```jsonc
"videos": {
  "tong-quan": "https://www.youtube.com/watch?v=XXXX",
  "vi-tri": "https://youtu.be/YYYY"
}
```

- Key = id mục (`tong-quan`, `vi-tri`, `tien-ich`, `mat-bang`, `gia-ban`, `phap-ly`, `chinh-sach`, `diem-noi-bat`).
- Value = URL YouTube (bất kỳ dạng: `watch?v=`, `youtu.be/`, `shorts/`, `embed/`).
- Optional; mục nào không có video thì thiếu key đó (hoặc chuỗi rỗng → không render).

`lib/data.ts` type `Project`: thêm
```ts
videos?: Record<string, string>;
```

## Trích YouTube ID (helper thuần, có test)

File mới `lib/youtube.ts`:
```ts
// Trả về YouTube video id từ nhiều dạng URL, hoặc null nếu không hợp lệ.
export function youtubeId(url: string): string | null;
```
Xử lý các dạng:
- `https://www.youtube.com/watch?v=ID` (kèm query khác như `&t=30s`)
- `https://youtu.be/ID`
- `https://www.youtube.com/embed/ID`
- `https://www.youtube.com/shorts/ID`
- ID trần (11 ký tự `[A-Za-z0-9_-]`) → trả về chính nó
- URL rác / rỗng / không phải YouTube → `null`

Regex trọng tâm: id YouTube là 11 ký tự `[A-Za-z0-9_-]`. Test đơn vị (`node:test`) phủ đủ 6 ca trên + 2 ca rác.

## Component `VideoEmbed` (server component)

File mới `components/VideoEmbed.tsx` (không `"use client"` — chỉ render iframe tĩnh):
```tsx
export default function VideoEmbed({ url, title }: { url: string; title: string }) {
  const id = youtubeId(url);
  if (!id) return null;
  return (
    <div className="rounded-2xl overflow-hidden border border-border-soft mb-6 aspect-video">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
```
- Dùng `youtube-nocookie.com` (đỡ tracking, hợp landing page).
- `aspect-video` khớp phong cách ảnh minh hoạ hiện có (các khối ảnh dùng `aspect-video`/khung bo góc `rounded-2xl border`).
- URL không hợp lệ → render `null` (không vỡ trang).

## Render trong `page.tsx`

Thêm `<VideoEmbed>` vào từng mục, **ngay dưới ảnh minh hoạ / trên phần nội dung** của mục, gói trong `SectionIntro` hoặc ngay sau `SecHead`. Vị trí cho mỗi mục (đặt sau khối ảnh minh hoạ hiện có, trước bảng/list nội dung):
- `tong-quan`: sau khối `overview_image`, trước `<SectionIntro>`.
- `vi-tri`: sau khối `location_image`.
- `tien-ich`: sau `AmenitiesGallery`.
- `mat-bang`: trong `SectionIntro`, trên ảnh `masterplan_image` hoặc dưới — đặt trên.
- `gia-ban`, `phap-ly`, `chinh-sach`, `diem-noi-bat`: ngay sau `SecHead`, trước nội dung.

Mẫu chèn (ví dụ mục Tổng quan):
```tsx
{project.videos?.["tong-quan"] && (
  <VideoEmbed url={project.videos["tong-quan"]} title={`Video ${project.title}`} />
)}
```
Import `VideoEmbed` ở đầu file. Không đổi logic `anchorSections` (video không tự thêm mục vào nav — mục vẫn hiện theo điều kiện dữ liệu cũ; video chỉ là nội dung phụ bên trong mục đã hiện).

> Lưu ý: nếu một mục hiện chỉ hiện khi có dữ liệu khác (vd `gia-ban` cần `product_types`), thì video-only **không** làm mục đó xuất hiện. Chấp nhận — Slice 1 chỉ thêm video vào mục đang hiển thị. (Trường hợp muốn mục hiện chỉ nhờ video sẽ xét ở slice sau nếu anh Thọ cần.)

## Decap `config.yml` (`public/admin/config.yml`)

1. **Thêm field `videos`** — 1 object collapsed, các key theo mục, mỗi key là 1 string URL, `required: false`, có `hint` "Dán link YouTube. Để trống nếu không có.":
```yaml
- name: videos
  label: "Video YouTube từng mục"
  widget: object
  required: false
  collapsed: true
  hint: "Dán link YouTube cho từng mục. Để trống mục không có video."
  fields:
    - { name: tong-quan,    label: "Video — Tổng quan",    widget: string, required: false }
    - { name: vi-tri,       label: "Video — Vị trí",       widget: string, required: false }
    - { name: tien-ich,     label: "Video — Tiện ích",     widget: string, required: false }
    - { name: mat-bang,     label: "Video — Mặt bằng",     widget: string, required: false }
    - { name: gia-ban,      label: "Video — Giá bán",      widget: string, required: false }
    - { name: phap-ly,      label: "Video — Pháp lý",      widget: string, required: false }
    - { name: chinh-sach,   label: "Video — Chính sách",   widget: string, required: false }
    - { name: diem-noi-bat, label: "Video — Điểm nổi bật", widget: string, required: false }
```

2. **Sắp lại thứ tự field theo cụm mục** *(cosmetic, không đổi data path)* — nhóm các field cùng mục cạnh nhau để anh Thọ dễ tìm, ví dụ cụm Tổng quan: `descriptions` → `overview_image` → `videos`; cụm Vị trí: `location_image` + nearby… Vì `descriptions`/`videos` là object gộp, không thể tách vật lý theo mục, nên chỉ cần đảm bảo `overview_image`, `location_image`, `masterplan_image`, `amenities_images` đứng gần block `descriptions`/`videos`, và giữ nhóm ảnh/nội dung tách khỏi nhóm metadata (slug/id/giá…). **Không đổi tên field, không lồng thêm object mới** → JSON shape không đổi.

> Quan trọng: KHÔNG bọc `overview_image`/`location_image`/… vào object group mới trong Decap — sẽ đổi path (`group.overview_image`) và làm `page.tsx` đọc sai. Chỉ đổi thứ tự dòng.

Cập nhật đồng bộ `out/admin/config.yml` không cần (CI build lại từ `public/`).

## Test & verify

**Unit test** (`node:test`): `lib/youtube.ts` — file test `lib/youtube.test.ts` hoặc `.mjs` chạy được với `node --test`. Nếu repo chưa có runner cho `.ts`, viết test dạng `.mjs` import bản build, HOẶC viết `youtubeId` thuần JS trong `lib/youtube.ts` và test qua `tsx`/`node --test` tuỳ toolchain hiện có (kiểm tra `package.json` trước; nếu không có, test bằng cách import trong 1 script node nhỏ và assert).

**Build check:** `npm run build` (static export) phải xanh — xác nhận `page.tsx` + component mới compile, không lỗi type.

**Verify live sau deploy:** thêm 1 link video thật vào 1 dự án qua admin (hoặc sửa tay 1 file JSON để test), build, mở trang dự án, xác nhận khung video hiện và phát được.

## Files đụng tới
- Sửa: `lib/data.ts` (thêm `videos?`)
- Thêm: `lib/youtube.ts`, `lib/youtube.test.*`, `components/VideoEmbed.tsx`
- Sửa: `app/du-an/[slug]/page.tsx` (import + chèn `VideoEmbed` vào các mục)
- Sửa: `public/admin/config.yml` (thêm `videos`, sắp thứ tự)

## Ngoài phạm vi Slice 1
- Bot (Slice 2).
- Upload file video, video ngoài YouTube.
- Làm mục xuất hiện chỉ nhờ có video.
