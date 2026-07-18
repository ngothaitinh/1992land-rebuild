# Slice 1 — Video dự án + web admin theo mục — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang dự án render video YouTube theo từng mục; web admin có ô dán link video mỗi mục. Không đụng bot.

**Architecture:** Thêm 1 field `videos` (object keyed theo id mục) vào project JSON. Helper thuần `youtubeId` (ESM `.mjs` dùng chung cho cả web và bot sau này) trích video id từ nhiều dạng URL. Component server `VideoEmbed` nhúng iframe `youtube-nocookie`. `page.tsx` chèn `VideoEmbed` vào mỗi mục khi có link. Decap `config.yml` thêm ô nhập video.

**Tech Stack:** Next.js 16 (static export, `output: "export"`), TypeScript, Tailwind v4, `node:test` cho helper `.mjs`, Decap CMS (`public/admin/config.yml`).

## Global Constraints

- Không đổi shape dữ liệu đang có. Chỉ **thêm** field `videos`. Không đổi tên/đường dẫn: `descriptions`, `overview_image`, `location_image`, `masterplan_image`, `amenities_images`, `gallery`, `hero_image`.
- Video = link YouTube (không upload mp4). URL không hợp lệ → không render, không vỡ trang.
- Helper `youtubeId` viết ở `lib/youtube.mjs` (ESM JS thuần) + `lib/youtube.d.ts` (kiểu) → dùng chung cho web (Slice 1) và bot (Slice 2), một nguồn sự thật.
- Component render là **server component** (không `"use client"`), chỉ iframe tĩnh.
- Tiếng Việt, không caps-lock/tone sales. Giữ phong cách khung ảnh hiện có: `rounded-2xl border border-border-soft`, `aspect-video`.
- Gate build: `npm run build` phải xanh (static export). Test helper: `node --test lib/youtube.test.mjs`.
- Id mục hợp lệ: `tong-quan`, `vi-tri`, `tien-ich`, `mat-bang`, `gia-ban`, `phap-ly`, `chinh-sach`, `diem-noi-bat`.

## File Structure

| File | Trách nhiệm |
|------|-------------|
| `lib/youtube.mjs` | Hàm thuần `youtubeId(url) → string|null`. Không phụ thuộc gì. |
| `lib/youtube.d.ts` | Khai báo kiểu cho `youtube.mjs` để TS/Next import có type. |
| `lib/youtube.test.mjs` | Test `node:test` cho `youtubeId` (6 dạng hợp lệ + rác). |
| `components/VideoEmbed.tsx` | Server component nhúng iframe YouTube từ URL; URL rác → `null`. |
| `lib/data.ts` | Thêm `videos?: Record<string, string>` vào type `Project`. |
| `app/du-an/[slug]/page.tsx` | Import + chèn `<VideoEmbed>` vào từng mục khi `project.videos?.[id]` có. |
| `public/admin/config.yml` | Thêm field `videos` (object 8 key); giữ nguyên field khác. |

---

## Task 1: Helper `youtubeId` (thuần, có test)

**Files:**
- Create: `lib/youtube.mjs`
- Create: `lib/youtube.d.ts`
- Test: `lib/youtube.test.mjs`

**Interfaces:**
- Produces: `youtubeId(url: string): string | null` — trả về video id 11 ký tự `[A-Za-z0-9_-]`, hoặc `null` nếu không phải URL/id YouTube hợp lệ.

- [ ] **Step 1: Viết test thất bại**

Tạo `lib/youtube.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { youtubeId } from "./youtube.mjs";

test("watch?v= — có query phụ vẫn lấy đúng id", () => {
  assert.equal(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s"), "dQw4w9WgXcQ");
});
test("youtu.be rút gọn", () => {
  assert.equal(youtubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});
test("embed", () => {
  assert.equal(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});
test("shorts", () => {
  assert.equal(youtubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});
test("id trần 11 ký tự", () => {
  assert.equal(youtubeId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});
test("watch?v= không có www", () => {
  assert.equal(youtubeId("https://youtube.com/watch?v=abc-DEF_123"), "abc-DEF_123");
});
test("chuỗi rỗng → null", () => {
  assert.equal(youtubeId(""), null);
});
test("URL không phải youtube → null", () => {
  assert.equal(youtubeId("https://vimeo.com/12345"), null);
});
test("null/undefined an toàn → null", () => {
  assert.equal(youtubeId(undefined), null);
  assert.equal(youtubeId(null), null);
});
```

- [ ] **Step 2: Chạy test để chắc chắn fail**

Run: `node --test lib/youtube.test.mjs`
Expected: FAIL — `youtube.mjs` chưa tồn tại / `youtubeId` chưa export.

- [ ] **Step 3: Viết `lib/youtube.mjs`**

```javascript
// Trích YouTube video id (11 ký tự) từ nhiều dạng URL, hoặc null nếu không hợp lệ.
// Dùng chung cho web (components/VideoEmbed) và bot Telegram (Slice 2).
const ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeId(url) {
  if (typeof url !== "string") return null;
  const s = url.trim();
  if (!s) return null;

  // id trần
  if (ID.test(s)) return s;

  let u;
  try { u = new URL(s); } catch { return null; }

  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return ID.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    if (u.pathname === "/watch") {
      const id = u.searchParams.get("v") || "";
      return ID.test(id) ? id : null;
    }
    const m = u.pathname.match(/^\/(embed|shorts|v)\/([^/?#]+)/);
    if (m && ID.test(m[2])) return m[2];
  }
  return null;
}
```

- [ ] **Step 4: Tạo `lib/youtube.d.ts`**

```typescript
export function youtubeId(url: string | null | undefined): string | null;
```

- [ ] **Step 5: Chạy test để chắc chắn xanh**

Run: `node --test lib/youtube.test.mjs`
Expected: PASS toàn bộ (9 test).

- [ ] **Step 6: Commit**

```bash
git add lib/youtube.mjs lib/youtube.d.ts lib/youtube.test.mjs
git commit -m "feat(web): helper youtubeId trích id từ URL YouTube (dùng chung web+bot)"
```

---

## Task 2: Component `VideoEmbed` + type + render trang + config admin

**Files:**
- Create: `components/VideoEmbed.tsx`
- Modify: `lib/data.ts` (type `Project`)
- Modify: `app/du-an/[slug]/page.tsx` (import + chèn vào 8 mục)
- Modify: `public/admin/config.yml` (thêm field `videos`)

**Interfaces:**
- Consumes: `youtubeId` từ `@/lib/youtube` (Task 1).
- Produces: `<VideoEmbed url title />` — render iframe hoặc `null`.

- [ ] **Step 1: Thêm `videos?` vào type `Project`**

Trong `lib/data.ts`, thêm dòng cuối type `Project` (trước dấu `}` đóng, sau `descriptions?`):

```typescript
  videos?: Record<string, string>;
```

- [ ] **Step 2: Tạo `components/VideoEmbed.tsx`**

```tsx
import { youtubeId } from "@/lib/youtube";

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

- [ ] **Step 3: Import `VideoEmbed` trong `page.tsx`**

Trong `app/du-an/[slug]/page.tsx`, thêm sau dòng import `ZaloIcon` (dòng 18):

```tsx
import VideoEmbed from "@/components/VideoEmbed";
```

- [ ] **Step 4: Chèn `VideoEmbed` vào từng mục**

Chèn đúng các vị trí sau (mỗi mục 1 khối; dùng đúng key mục). Đặt **ngay sau `SecHead`/khối ảnh minh hoạ, trước phần nội dung** như mô tả:

**Chính sách** — sau `<SecHead id="chinh-sach" title="Chính sách bán hàng" />` (trước `<SectionIntro desc={project.descriptions?.["chinh-sach"]}>`):
```tsx
{project.videos?.["chinh-sach"] && (
  <VideoEmbed url={project.videos["chinh-sach"]} title={`Video chính sách ${project.title}`} />
)}
```

**Tổng quan** — sau khối `overview_image` (đóng `)}` của block ảnh), trước `<SectionIntro desc={project.descriptions?.["tong-quan"]}>`:
```tsx
{project.videos?.["tong-quan"] && (
  <VideoEmbed url={project.videos["tong-quan"]} title={`Video tổng quan ${project.title}`} />
)}
```

**Giá bán** — sau `<SecHead id="gia-ban" title="Giá bán & giỏ hàng" />`, trước `<SectionIntro>`:
```tsx
{project.videos?.["gia-ban"] && (
  <VideoEmbed url={project.videos["gia-ban"]} title={`Video giá bán ${project.title}`} />
)}
```

**Vị trí** — sau khối `location_image`, trước `<SectionIntro desc={project.descriptions?.["vi-tri"]}>`:
```tsx
{project.videos?.["vi-tri"] && (
  <VideoEmbed url={project.videos["vi-tri"]} title={`Video vị trí ${project.title}`} />
)}
```

**Điểm nổi bật** — sau khối `ProjectImageCarousel` (đóng `)}`), trước `<SectionIntro desc={project.descriptions?.["diem-noi-bat"]}>`:
```tsx
{project.videos?.["diem-noi-bat"] && (
  <VideoEmbed url={project.videos["diem-noi-bat"]} title={`Video điểm nổi bật ${project.title}`} />
)}
```

**Tiện ích** — sau khối `AmenitiesGallery` (đóng `)}`), trước `<SectionIntro desc={project.descriptions?.["tien-ich"]}>`:
```tsx
{project.videos?.["tien-ich"] && (
  <VideoEmbed url={project.videos["tien-ich"]} title={`Video tiện ích ${project.title}`} />
)}
```

**Mặt bằng** — ngay sau `<SecHead id="mat-bang" title="Mặt bằng tổng thể" />`, trước `<SectionIntro desc={project.descriptions?.["mat-bang"]}>`:
```tsx
{project.videos?.["mat-bang"] && (
  <VideoEmbed url={project.videos["mat-bang"]} title={`Video mặt bằng ${project.title}`} />
)}
```

**Pháp lý** — sau `<SecHead id="phap-ly" title="Tiến độ & Pháp lý" />`, trước `<SectionIntro desc={project.descriptions?.["phap-ly"]}>`:
```tsx
{project.videos?.["phap-ly"] && (
  <VideoEmbed url={project.videos["phap-ly"]} title={`Video pháp lý ${project.title}`} />
)}
```

- [ ] **Step 5: Thêm field `videos` vào `public/admin/config.yml`**

Trong collection `projects`, thêm khối sau ngay **sau** field `hidden_sections` (trước các field `lat`/`lng`/`created_at`):

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

- [ ] **Step 6: Build kiểm tra**

Run: `npm run build`
Expected: build xanh (compiled successfully), không lỗi type. Nếu lỗi type ở `project.videos` → kiểm lại Step 1.

- [ ] **Step 7: Test thủ công render (1 dự án)**

Sửa tạm 1 file `data/projects/<slug>.json` thêm:
```json
"videos": { "tong-quan": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
```
Run: `npm run build` rồi mở `out/du-an/<slug>.html`, tìm chuỗi `youtube-nocookie.com/embed/dQw4w9WgXcQ` để xác nhận iframe được render trong HTML tĩnh.
Run kiểm nhanh: `grep -c "youtube-nocookie.com/embed/dQw4w9WgXcQ" out/du-an/<slug>.html` → kỳ vọng `1`.
Sau khi xác nhận, **hoàn nguyên** file JSON test (git checkout file đó) để không commit dữ liệu giả.

- [ ] **Step 8: Commit**

```bash
git add lib/data.ts components/VideoEmbed.tsx app/du-an/[slug]/page.tsx public/admin/config.yml
git commit -m "feat(web): render video YouTube theo mục dự án + ô nhập video ở admin"
```

---

## Task 3: Deploy + verify live

**Files:** không sửa code; chỉ push + kiểm tra.

- [ ] **Step 1: Push main kích hoạt build + FTP**

```bash
git push origin main
```

- [ ] **Step 2: Theo dõi GitHub Actions build/deploy web**

Run: `gh run list --limit 3` → tìm workflow build web (không phải deploy-bot.yml).
Rồi: `gh run watch <run_id>` tới `completed success`.
Expected: `completed success`.

- [ ] **Step 3: Verify live**

Anh Thọ (hoặc controller) vào `1992land.com/admin/` → mở 1 dự án → mục "Video YouTube từng mục" → dán 1 link thật vào 1 mục → Publish. Chờ ~8 phút. Mở trang dự án đó, xác nhận khung video hiện và phát được đúng mục.

Nếu lỗi → systematic-debugging, không tự báo xong.

- [ ] **Step 4: Cập nhật memory**

Ghi vào memory (`project-tg-bot-menu-tinh-gon` hoặc memory dự án): Slice 1 (video theo mục + admin) xong ngày 2026-07-18; còn Slice 2 (bot sửa theo mục), Slice 3 (ảnh bìa/gallery).

---

## Self-Review

**1. Spec coverage:**
- `videos` field + type → Task 2 Step 1. ✓
- `youtubeId` helper 6 dạng + rác → Task 1 (9 test). ✓
- `VideoEmbed` server component, nocookie, aspect-video, null-safe → Task 2 Step 2. ✓
- Render 8 mục trong page.tsx → Task 2 Step 4 (8 khối). ✓
- Decap `videos` object 8 key → Task 2 Step 5. ✓
- Build gate + verify live → Task 2 Step 6-7, Task 3. ✓
- "URL rác không vỡ trang" → `VideoEmbed` trả null + test rác trong Task 1. ✓

**2. Placeholder scan:** Không có TBD/TODO; mọi step có mã hoặc lệnh cụ thể + kết quả mong đợi. ✓

**3. Type consistency:**
- `youtubeId(url) → string|null` khớp giữa `youtube.mjs` (Task 1), `.d.ts` (Task 1 Step 4), và dùng trong `VideoEmbed` (Task 2). ✓
- `videos?: Record<string,string>` (Task 2 Step 1) khớp cách đọc `project.videos?.[id]` (Task 2 Step 4). ✓
- Key mục trong page.tsx (Task 2 Step 4) khớp key trong config.yml (Task 2 Step 5) và Global Constraints. ✓

**Ghi chú:** Sắp lại thứ tự field admin (mục "cosmetic" trong spec) lược bỏ khỏi plan — rủi ro đổi nhầm path cao hơn giá trị; `videos` đặt cạnh `hidden_sections` là đủ gom nhóm. Nếu anh Thọ muốn gom thêm, làm ở lần sau.
