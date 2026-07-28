# Landing Page Gallery Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `construction_images` field surfaced inside the "Tiến độ & Pháp lý" section, and wire up a new standalone "Thư viện ảnh dự án" (gallery) section on the project detail page, reusing existing gallery components.

**Architecture:** Pure frontend change in the Next.js static-export app. One optional field added to the `Project` type (`lib/data.ts`). `ProjectDetailView.tsx` gets two additive JSX blocks (no existing markup removed) plus one new entry in the `anchorSections` array. `ProjectAnchorNav.tsx` gets one new entry in its static `ALL_SECTIONS` list. No new components are created — `AmenitiesGallery` and the currently-unused `ProjectGalleryGrid` are reused as-is.

**Tech Stack:** Next.js 16 App Router (static export), TypeScript, Tailwind v4, existing components `AmenitiesGallery` and `ProjectGalleryGrid`.

## Global Constraints

- No new npm dependencies.
- No test framework exists in this repo (`package.json` has no `test` script) — verification is `npm run build` (TypeScript/Next compile check) plus a manual dev-server visual check using temporary sample data that is reverted before commit.
- Follow existing code conventions in `lib/data.ts` and `ProjectDetailView.tsx` (Tailwind classes, `show()`/`hidden_sections` pattern, section structure with `Divider` + `SecHead` + `SectionIntro`).
- Do not touch `amenities_images` data, `ProjectImageCarousel` behavior, or any other existing section — out of scope per spec.
- Vietnamese-language labels/content only, matching existing copy style (see `CLAUDE.md`: no ALL CAPS, no sales-hype tone).
- Spec reference: `docs/superpowers/specs/2026-07-28-landing-page-gallery-images-design.md`.

---

## Task 1: Add `construction_images` field to `Project` type

**Files:**
- Modify: `lib/data.ts:41-44` (inside the `Project` type, next to the other image fields)

**Interfaces:**
- Produces: `Project.construction_images?: string[]` — an optional array of image URL strings, consumed by Task 2.

- [ ] **Step 1: Add the field**

In `lib/data.ts`, the `Project` type currently has this block (lines 41-44):

```ts
  amenities_images?: string[];
  overview_image?: string;
  location_image?: string;
  masterplan_image?: string;
```

Change it to:

```ts
  amenities_images?: string[];
  overview_image?: string;
  location_image?: string;
  masterplan_image?: string;
  construction_images?: string[];
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit -p .`
Expected: no new errors (the field is optional, so no existing project JSON files need changes).

- [ ] **Step 3: Commit**

```bash
git add lib/data.ts
git commit -m "feat(data): add construction_images field to Project type"
```

---

## Task 2: Render construction images inside "Tiến độ & Pháp lý"

**Files:**
- Modify: `components/ProjectDetailView.tsx` (Pháp lý section, currently lines 578-636)

**Interfaces:**
- Consumes: `Project.construction_images?: string[]` (Task 1), existing `AmenitiesGallery` component (`components/AmenitiesGallery.tsx`, props `{ images: string[]; title: string }`).

- [ ] **Step 1: Add the image block into the Pháp lý section**

Find this in `components/ProjectDetailView.tsx` (around line 583-587):

```tsx
              <SecHead id="phap-ly" title="Tiến độ & Pháp lý" />
              {project.videos?.["phap-ly"] && (
                <VideoEmbed url={project.videos["phap-ly"]} title={`Video pháp lý ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["phap-ly"]}>
```

Change it to:

```tsx
              <SecHead id="phap-ly" title="Tiến độ & Pháp lý" />
              {project.construction_images && project.construction_images.length > 0 && (
                <AmenitiesGallery images={project.construction_images} title={`Tiến độ thi công ${project.title}`} />
              )}
              {project.videos?.["phap-ly"] && (
                <VideoEmbed url={project.videos["phap-ly"]} title={`Video pháp lý ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["phap-ly"]}>
```

`AmenitiesGallery` is already imported at the top of the file (`import AmenitiesGallery from "@/components/AmenitiesGallery";`), so no import change is needed here.

- [ ] **Step 2: Manual verification with temporary sample data**

Temporarily edit `data/projects/salacia-villas-phu-my.json` (this project already has `amenities_images`, so it's a good visual reference point) and add a `construction_images` array using 2-3 of its existing `gallery` image paths, e.g.:

```json
"construction_images": [
  "/images/projects/salacia-villas-phu-my/gallery-1.jpg",
  "/images/projects/salacia-villas-phu-my/gallery-2.jpg"
]
```

(Use whatever exact paths already exist in that file's `gallery` or `amenities_images` array — do not invent new filenames.)

Run: `npm run dev`
Open `http://localhost:3001/du-an/salacia-villas-phu-my` in a browser, scroll/click to "Tiến độ & Pháp lý".
Expected: a grid of the sample images renders above the two info cards, clicking an image opens the lightbox with prev/next arrows working.

- [ ] **Step 3: Revert the temporary sample data**

```bash
git checkout -- data/projects/salacia-villas-phu-my.json
```

Confirm with `git status` that the JSON file shows no changes.

- [ ] **Step 4: Run build to confirm no compile errors**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/ProjectDetailView.tsx
git commit -m "feat: render construction progress images in Pháp lý section"
```

---

## Task 3: Add "Thư viện ảnh dự án" gallery section

**Files:**
- Modify: `components/ProjectDetailView.tsx` (imports, `anchorSections` array, new section JSX placed after "Điểm nổi bật" / before "Tiện ích")
- Modify: `components/ProjectAnchorNav.tsx:7-18` (`ALL_SECTIONS` array)

**Interfaces:**
- Consumes: `Project.gallery?: string[]` (already exists), existing `ProjectGalleryGrid` component (`components/ProjectGalleryGrid.tsx`, props `{ images: string[]; title: string }`), the file's existing `show(id: string)` helper and `Divider`/`SecHead` helper components (all defined in `ProjectDetailView.tsx`, no signature change).
- Produces: anchor id `"thu-vien-anh"`, consumed by `ProjectAnchorNav` via its `sections` prop.

- [ ] **Step 1: Import `ProjectGalleryGrid`**

In `components/ProjectDetailView.tsx`, find the import block (around line 14-20):

```tsx
import ProjectHeroSlider from "@/components/ProjectHeroSlider";
import ProjectImageCarousel from "@/components/ProjectImageCarousel";
import AmenitiesGallery from "@/components/AmenitiesGallery";
```

Change it to:

```tsx
import ProjectHeroSlider from "@/components/ProjectHeroSlider";
import ProjectImageCarousel from "@/components/ProjectImageCarousel";
import ProjectGalleryGrid from "@/components/ProjectGalleryGrid";
import AmenitiesGallery from "@/components/AmenitiesGallery";
```

- [ ] **Step 2: Add the anchor entry**

Find the `anchorSections` array (around line 64-73):

```tsx
  const anchorSections = [
    show("tong-quan") ? "tong-quan" : null,
    show("vi-tri") ? "vi-tri" : null,
    show("tien-ich") && (project.amenities_internal || project.amenities_external) ? "tien-ich" : null,
    show("mat-bang") && project.masterplan_image ? "mat-bang" : null,
    show("gia-ban") && project.product_types ? "gia-ban" : null,
    show("phap-ly") ? "phap-ly" : null,
    show("chinh-sach") ? "chinh-sach" : null,
    show("dang-ky") ? "dang-ky" : null,
  ].filter(Boolean) as string[];
```

Change it to (adding the `thu-vien-anh` line after `vi-tri`, matching where the section will sit on the page — right after "Điểm nổi bật" which itself follows "Vị trí" in the render order):

```tsx
  const anchorSections = [
    show("tong-quan") ? "tong-quan" : null,
    show("vi-tri") ? "vi-tri" : null,
    show("thu-vien-anh") && project.gallery?.length ? "thu-vien-anh" : null,
    show("tien-ich") && (project.amenities_internal || project.amenities_external) ? "tien-ich" : null,
    show("mat-bang") && project.masterplan_image ? "mat-bang" : null,
    show("gia-ban") && project.product_types ? "gia-ban" : null,
    show("phap-ly") ? "phap-ly" : null,
    show("chinh-sach") ? "chinh-sach" : null,
    show("dang-ky") ? "dang-ky" : null,
  ].filter(Boolean) as string[];
```

- [ ] **Step 3: Add the new section JSX after "Điểm nổi bật"**

Find the closing of the "ĐIỂM NỔI BẬT" section and the start of "TIỆN ÍCH" (around line 478-486):

```tsx
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── TIỆN ÍCH ── */}
        {show("tien-ich") && (project.amenities_internal || project.amenities_external || project.amenities_images) && (
```

Change it to (inserting the new section between them):

```tsx
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── THƯ VIỆN ẢNH ── */}
        {show("thu-vien-anh") && project.gallery && project.gallery.length > 0 && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="thu-vien-anh" title="Thư viện ảnh dự án" />
              <ProjectGalleryGrid images={project.gallery} title={project.title} />
            </section>
          </>
        )}

        {/* ── TIỆN ÍCH ── */}
        {show("tien-ich") && (project.amenities_internal || project.amenities_external || project.amenities_images) && (
```

- [ ] **Step 4: Add matching entry in `ProjectAnchorNav.tsx`**

In `components/ProjectAnchorNav.tsx`, the `ALL_SECTIONS` array (lines 7-18):

```ts
const ALL_SECTIONS = [
  { id: "tong-quan", label: "Tổng quan" },
  { id: "vi-tri", label: "Vị trí" },
  { id: "tien-ich", label: "Tiện ích" },
  { id: "mat-bang", label: "Mặt bằng" },
  { id: "thiet-ke", label: "Thiết kế" },
  { id: "gia-ban", label: "Giá bán" },
  { id: "phap-ly", label: "Pháp lý" },
  { id: "chinh-sach", label: "Chính sách" },
  { id: "diem-noi-bat", label: "Nổi bật" },
  { id: "dang-ky", label: "Đăng ký" },
];
```

Change it to (adding `thu-vien-anh` after `vi-tri`, matching the page render order):

```ts
const ALL_SECTIONS = [
  { id: "tong-quan", label: "Tổng quan" },
  { id: "vi-tri", label: "Vị trí" },
  { id: "thu-vien-anh", label: "Thư viện ảnh" },
  { id: "tien-ich", label: "Tiện ích" },
  { id: "mat-bang", label: "Mặt bằng" },
  { id: "thiet-ke", label: "Thiết kế" },
  { id: "gia-ban", label: "Giá bán" },
  { id: "phap-ly", label: "Pháp lý" },
  { id: "chinh-sach", label: "Chính sách" },
  { id: "diem-noi-bat", label: "Nổi bật" },
  { id: "dang-ky", label: "Đăng ký" },
];
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev`
Open `http://localhost:3001/du-an/blanca-city-vung-tau` (this project has `gallery: 4` per earlier data check).
Expected:
- A "Thư viện ảnh" tab appears in the sticky anchor nav (desktop tabs and mobile dropdown), positioned after "Vị trí".
- Clicking it scrolls to a new "Thư viện ảnh dự án" section showing the editorial grid (1 large + 2 stacked thumbnails, "+N ảnh" overlay if more than 3 images).
- Clicking any thumbnail opens the full-screen lightbox with working prev/next, thumbnail strip, swipe drag, and Escape/arrow-key navigation.
- On mobile viewport (or narrow browser), the grid switches to the single hero-image-with-count-badge layout.

- [ ] **Step 6: Run build to confirm no compile errors**

Run: `npm run build`
Expected: build succeeds, no TypeScript errors, static export completes for all 12 project pages.

- [ ] **Step 7: Commit**

```bash
git add components/ProjectDetailView.tsx components/ProjectAnchorNav.tsx
git commit -m "feat: add Thư viện ảnh gallery section to project detail page"
```

---

## Task 4: Final full-site verification and report

**Files:** none (verification only)

- [ ] **Step 1: Run full production build**

Run: `npm run build`
Expected: build succeeds with no errors or warnings related to the changed files.

- [ ] **Step 2: Spot-check 3 projects in dev server**

Run: `npm run dev`
Visit these three (chosen because they have different gallery lengths per the earlier data audit):
- `http://localhost:3001/du-an/water-concept` (`gallery: 1` — confirm the new gallery section is skipped or degrades gracefully; note `ProjectGalleryGrid` returns `null` if `images.length === 0`, and with exactly 1 image it will show the single hero image without the "+N ảnh" overlay — this is expected, not a bug)
- `http://localhost:3001/du-an/izumi-city-dong-nai` (`gallery: 4`)
- `http://localhost:3001/du-an/la-home-long-an` (`gallery: 5`)

Confirm on each: anchor nav shows "Thư viện ảnh", section renders, no console errors (check browser devtools console), no layout break in "Tiến độ & Pháp lý" (construction_images block correctly absent since no project has this field populated yet).

- [ ] **Step 3: Confirm git status is clean of unintended changes**

Run: `git status`
Expected: only the 2 commits from Tasks 1-3 are present; no stray edits to `data/projects/*.json` (the Task 2 temporary edit must have been reverted).

- [ ] **Step 4: Send Telegram report**

Per `CLAUDE.md` project convention, after finishing the work:

```bash
node scripts/notify.mjs "✅ Xong: Thêm khung ảnh minh họa cho landing page dự án\n- Field construction_images (Project type) để gắn ảnh tiến độ thi công trong section Pháp lý\n- Section mới 'Thư viện ảnh dự án' dùng lại component ProjectGalleryGrid có sẵn, hiển thị toàn bộ gallery ảnh\n- Đã build thành công, chưa gán ảnh thật cho dự án nào (việc gán ảnh làm ở bước sau)"
```
