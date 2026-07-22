# Markdown Render Engine + ProjectDetailView Extraction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ad-hoc `**bold**`-only, auto-2-sentence-paragraph renderer in `app/du-an/[slug]/page.tsx` with a real Markdown block parser (headings, lists, links, inline images, real paragraph breaks) and extract the page's JSX into a reusable `ProjectDetailView` component, so the same component can later render both the live `/du-an/{slug}` page and the `/dashboard` live preview.

**Architecture:** A pure, dependency-free parser (`lib/markdown.mjs`) turns a Markdown string into a `MdBlock[]` array. A presentation component (`components/MarkdownBlocks.tsx`) turns `MdBlock[]` into JSX matching the site's existing typography. `components/ProjectDetailView.tsx` is extracted from the current page body and uses both. `app/du-an/[slug]/page.tsx` shrinks to a thin data-fetching wrapper.

**Tech Stack:** Next.js 16 App Router (TypeScript, React 19), Node's built-in `node:test` + `node:assert/strict` for pure-logic tests (matches existing convention in `lib/youtube.mjs` + `lib/youtube.test.mjs`).

## Global Constraints

- This is Plan 1 of 3 for the `/dashboard` feature (see `docs/superpowers/specs/2026-07-22-laptop-dashboard-design.md`). Plans 2 (VPS API) and 3 (dashboard UI) are written separately, after this one ships.
- **Backward compatibility is mandatory:** all 12 existing files in `data/projects/*.json` have `descriptions.*` fields with no blank lines (verified: 79 description fields checked, 0 contain any Markdown block syntax). Their rendered output on `/du-an/{slug}` must be pixel-identical after this change (same paragraph grouping, same `**bold**` handling).
- No new npm dependencies — this plan only touches parsing/rendering logic already achievable with plain TS/JS.
- Tiếng Việt là ngôn ngữ chính cho mọi nội dung hiển thị (không đổi ngôn ngữ UI hiện có).
- Follow existing code conventions: pure-logic modules that need both Node test runner and TypeScript types live as `<name>.mjs` + `<name>.d.ts` pairs (see `lib/youtube.mjs`), imported via `@/lib/<name>` with no extension (`tsconfig.json` has `"moduleResolution": "bundler"`, proven working for `lib/youtube.mjs`).

---

### Task 1: Markdown block parser (`lib/markdown.mjs`)

**Files:**
- Create: `lib/markdown.mjs`
- Create: `lib/markdown.d.ts`
- Test: `lib/markdown.test.mjs`

**Interfaces:**
- Produces: `parseMarkdownBlocks(text: string | null | undefined): MdBlock[]` — consumed by Task 2 (`components/MarkdownBlocks.tsx`) and Task 3 (`components/ProjectDetailView.tsx`).
- `MdInline = { type: "text"; text: string } | { type: "bold"; text: string } | { type: "italic"; text: string } | { type: "link"; text: string; href: string }`
- `MdBlock = { type: "p"; inline: MdInline[]; lead: boolean } | { type: "h2"; inline: MdInline[] } | { type: "h3"; inline: MdInline[] } | { type: "ul"; items: MdInline[][] } | { type: "ol"; items: MdInline[][] } | { type: "img"; src: string; alt: string }`
- `lead: true` marks the first paragraph block only (used by Task 2 to apply the existing "lead paragraph" emphasis style).

- [ ] **Step 1: Write the failing test file**

Create `lib/markdown.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarkdownBlocks } from "./markdown.mjs";

test("chuỗi rỗng / null / undefined → mảng rỗng", () => {
  assert.deepEqual(parseMarkdownBlocks(""), []);
  assert.deepEqual(parseMarkdownBlocks(null), []);
  assert.deepEqual(parseMarkdownBlocks(undefined), []);
});

test("không có dòng trống → chia đoạn theo mỗi 2 câu (tương thích ngược với data cũ)", () => {
  const text = "Câu một. Câu hai. Câu ba. Câu bốn.";
  const blocks = parseMarkdownBlocks(text);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, "p");
  assert.equal(blocks[0].lead, true);
  assert.equal(blocks[0].inline[0].text, "Câu một. Câu hai.");
  assert.equal(blocks[1].lead, false);
  assert.equal(blocks[1].inline[0].text, "Câu ba. Câu bốn.");
});

test("số lẻ câu → câu cuối đứng riêng 1 đoạn", () => {
  const text = "Câu một. Câu hai. Câu ba.";
  const blocks = parseMarkdownBlocks(text);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[1].inline[0].text, "Câu ba.");
});

test("có dòng trống → mỗi đoạn 1 block p, KHÔNG tự chia câu nữa", () => {
  const text = "Đoạn 1 có nhiều câu. Vẫn 1 đoạn.\n\nĐoạn 2 riêng.";
  const blocks = parseMarkdownBlocks(text);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, "p");
  assert.equal(blocks[0].lead, true);
  assert.equal(blocks[0].inline[0].text, "Đoạn 1 có nhiều câu. Vẫn 1 đoạn.");
  assert.equal(blocks[1].lead, false);
  assert.equal(blocks[1].inline[0].text, "Đoạn 2 riêng.");
});

test("đậm, nghiêng, link trong cùng 1 đoạn", () => {
  const text = "Xem **giá tốt** tại _khu trung tâm_ và [liên hệ](https://zalo.me/0909474123) ngay.";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "p");
  const types = block.inline.map((i) => i.type);
  assert.ok(types.includes("bold"));
  assert.ok(types.includes("italic"));
  assert.ok(types.includes("link"));
  const bold = block.inline.find((i) => i.type === "bold");
  assert.equal(bold.text, "giá tốt");
  const italic = block.inline.find((i) => i.type === "italic");
  assert.equal(italic.text, "khu trung tâm");
  const link = block.inline.find((i) => i.type === "link");
  assert.equal(link.text, "liên hệ");
  assert.equal(link.href, "https://zalo.me/0909474123");
});

test("heading H2 và H3", () => {
  const text = "## Tiêu đề lớn\n\n### Tiêu đề nhỏ\n\nNội dung.";
  const blocks = parseMarkdownBlocks(text);
  assert.equal(blocks[0].type, "h2");
  assert.equal(blocks[0].inline[0].text, "Tiêu đề lớn");
  assert.equal(blocks[1].type, "h3");
  assert.equal(blocks[1].inline[0].text, "Tiêu đề nhỏ");
  assert.equal(blocks[2].type, "p");
});

test("danh sách gạch đầu dòng", () => {
  const text = "- Mục 1\n- Mục 2\n- Mục 3";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "ul");
  assert.equal(block.items.length, 3);
  assert.equal(block.items[0][0].text, "Mục 1");
  assert.equal(block.items[2][0].text, "Mục 3");
});

test("danh sách đánh số", () => {
  const text = "1. Bước 1\n2. Bước 2";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "ol");
  assert.equal(block.items.length, 2);
  assert.equal(block.items[1][0].text, "Bước 2");
});

test("ảnh chèn giữa bài — đứng riêng 1 block giữa 2 đoạn văn", () => {
  const text = "Đoạn trước.\n\n![Ảnh minh hoạ](/images/projects/x/inline-1.jpg)\n\nĐoạn sau.";
  const blocks = parseMarkdownBlocks(text);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].type, "p");
  assert.equal(blocks[1].type, "img");
  assert.equal(blocks[1].src, "/images/projects/x/inline-1.jpg");
  assert.equal(blocks[1].alt, "Ảnh minh hoạ");
  assert.equal(blocks[2].type, "p");
});

test("heading nhiều dòng trong cùng 1 block vẫn gộp thành 1 tiêu đề", () => {
  const text = "## Tiêu đề\ncòn tiếp ở dòng sau";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "h2");
  assert.equal(block.inline[0].text, "Tiêu đề còn tiếp ở dòng sau");
});

test("danh sách KHÔNG có dòng trống bao quanh vẫn nhận diện đúng (không rơi vào legacy fallback)", () => {
  const text = "- Mục 1\n- Mục 2";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "ul");
  assert.equal(block.items.length, 2);
});

test("heading KHÔNG có dòng trống bao quanh vẫn nhận diện đúng (không rơi vào legacy fallback)", () => {
  const text = "## Chỉ 1 tiêu đề, không có đoạn văn nào khác";
  const [block] = parseMarkdownBlocks(text);
  assert.equal(block.type, "h2");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test lib/markdown.test.mjs`
Expected: FAIL — `Cannot find module './markdown.mjs'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `lib/markdown.mjs`:

```js
const INLINE_RE = /(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;

function parseInline(text) {
  return text
    .split(INLINE_RE)
    .filter((part) => part !== "")
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return { type: "bold", text: part.slice(2, -2) };
      }
      if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
        return { type: "italic", text: part.slice(1, -1) };
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return { type: "link", text: linkMatch[1], href: linkMatch[2] };
      }
      return { type: "text", text: part };
    });
}

// Legacy behavior from the old DescBlock in app/du-an/[slug]/page.tsx:
// split on ". " (period + space) — safe because Vietnamese thousands use "."
// without a trailing space — then group every 2 sentences into 1 paragraph.
function splitLegacyParagraphs(text) {
  const rawSentences = text.split(/\. (?=\S)/g);
  const sentences = rawSentences.map((s, i) =>
    i < rawSentences.length - 1 ? s + "." : s
  );
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push([sentences[i], sentences[i + 1]].filter(Boolean).join(" "));
  }
  return paragraphs;
}

// A field only takes the legacy sentence-split path when it has neither a
// blank line NOR any line that looks like Markdown block syntax — i.e. it's
// a single old-style blob of prose. A field that's e.g. just a bullet list
// with no blank line around it must still be parsed as a real list.
function looksLikeMarkdownStructure(norm) {
  return norm
    .split("\n")
    .map((l) => l.trim())
    .some(
      (l) =>
        /^#{2,3}\s+/.test(l) ||
        /^[-*]\s+/.test(l) ||
        /^\d+\.\s+/.test(l) ||
        /^!\[[^\]]*\]\([^)]+\)$/.test(l)
    );
}

export function parseMarkdownBlocks(text) {
  const norm = (text ?? "").replace(/\r\n/g, "\n").trim();
  if (!norm) return [];

  const hasBlankLine = /\n[ \t]*\n/.test(norm);
  const isLegacy = !hasBlankLine && !looksLikeMarkdownStructure(norm);
  const blocks = [];
  let firstParagraphSeen = false;

  if (isLegacy) {
    for (const p of splitLegacyParagraphs(norm)) {
      blocks.push({ type: "p", inline: parseInline(p), lead: !firstParagraphSeen });
      firstParagraphSeen = true;
    }
    return blocks;
  }

  const rawBlocks = norm
    .split(/\n[ \t]*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const raw of rawBlocks) {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    if (/^#{2,3}\s+/.test(lines[0])) {
      const level = lines[0].startsWith("### ") ? "h3" : "h2";
      const headingText = [lines[0].replace(/^#{2,3}\s+/, ""), ...lines.slice(1)].join(" ");
      blocks.push({ type: level, inline: parseInline(headingText) });
      continue;
    }

    if (lines.length === 1) {
      const imgMatch = lines[0].match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        blocks.push({ type: "img", alt: imgMatch[1], src: imgMatch[2] });
        continue;
      }
    }

    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      blocks.push({
        type: "ul",
        items: lines.map((l) => parseInline(l.replace(/^[-*]\s+/, ""))),
      });
      continue;
    }

    if (lines.every((l) => /^\d+\.\s+/.test(l))) {
      blocks.push({
        type: "ol",
        items: lines.map((l) => parseInline(l.replace(/^\d+\.\s+/, ""))),
      });
      continue;
    }

    blocks.push({ type: "p", inline: parseInline(lines.join(" ")), lead: !firstParagraphSeen });
    firstParagraphSeen = true;
  }

  return blocks;
}
```

- [ ] **Step 4: Write the type declarations**

Create `lib/markdown.d.ts`:

```ts
export type MdInline =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "italic"; text: string }
  | { type: "link"; text: string; href: string };

export type MdBlock =
  | { type: "p"; inline: MdInline[]; lead: boolean }
  | { type: "h2"; inline: MdInline[] }
  | { type: "h3"; inline: MdInline[] }
  | { type: "ul"; items: MdInline[][] }
  | { type: "ol"; items: MdInline[][] }
  | { type: "img"; src: string; alt: string };

export function parseMarkdownBlocks(text: string | null | undefined): MdBlock[];
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test lib/markdown.test.mjs`
Expected: PASS — all 12 tests green, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add lib/markdown.mjs lib/markdown.d.ts lib/markdown.test.mjs
git commit -m "feat: add Markdown block parser with legacy paragraph fallback"
```

---

### Task 2: Rendering component (`components/MarkdownBlocks.tsx`)

**Files:**
- Create: `components/MarkdownBlocks.tsx`

**Interfaces:**
- Consumes: `MdBlock`, `MdInline` types from `@/lib/markdown` (Task 1).
- Produces: `export default function MarkdownBlocks({ blocks }: { blocks: MdBlock[] })` — consumed by Task 3 (`components/ProjectDetailView.tsx`), and later by Plan 3's dashboard live preview.

No automated test for this step — the repo has no React component test harness (no jsdom/RTL configured anywhere). Verification is visual, done at the end of Task 3 once it's wired into a real page.

- [ ] **Step 1: Create the component**

Create `components/MarkdownBlocks.tsx`:

```tsx
import type { MdBlock, MdInline } from "@/lib/markdown";

function InlineNodes({ inline }: { inline: MdInline[] }) {
  return (
    <>
      {inline.map((node, i) => {
        if (node.type === "bold") {
          return (
            <strong key={i} className="font-bold text-navy-900">
              {node.text}
            </strong>
          );
        }
        if (node.type === "italic") {
          return (
            <em key={i} className="italic">
              {node.text}
            </em>
          );
        }
        if (node.type === "link") {
          return (
            <a
              key={i}
              href={node.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-600 underline underline-offset-2 hover:text-gold-500"
            >
              {node.text}
            </a>
          );
        }
        return <span key={i}>{node.text}</span>;
      })}
    </>
  );
}

// Headings here render as h3/h4 (not h2) — SecHead in ProjectDetailView already
// owns the section's h2, so content headings sit one level below it.
export default function MarkdownBlocks({ blocks }: { blocks: MdBlock[] }) {
  return (
    <div className="space-y-4 max-w-[72ch]">
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <p
              key={i}
              className={
                block.lead
                  ? "text-[15.5px] font-[450] text-navy-800 leading-[1.88]"
                  : "text-[14.5px] text-navy-600 leading-[1.88]"
              }
            >
              <InlineNodes inline={block.inline} />
            </p>
          );
        }
        if (block.type === "h2") {
          return (
            <h3 key={i} className="text-lg font-bold text-navy-900 pt-2">
              <InlineNodes inline={block.inline} />
            </h3>
          );
        }
        if (block.type === "h3") {
          return (
            <h4 key={i} className="text-base font-bold text-navy-900 pt-2">
              <InlineNodes inline={block.inline} />
            </h4>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1 text-[14.5px] text-navy-600 leading-[1.7]">
              {block.items.map((item, j) => (
                <li key={j}>
                  <InlineNodes inline={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={i} className="list-decimal pl-5 space-y-1 text-[14.5px] text-navy-600 leading-[1.7]">
              {block.items.map((item, j) => (
                <li key={j}>
                  <InlineNodes inline={item} />
                </li>
              ))}
            </ol>
          );
        }
        // block.type === "img" — user-uploaded, arbitrary aspect ratio, no
        // known intrinsic size at build time, so a plain <img> instead of
        // next/image (which requires width/height or a sized parent).
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={block.src}
            alt={block.alt}
            loading="lazy"
            className="w-full rounded-2xl border border-border-soft object-cover"
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors from `components/MarkdownBlocks.tsx` (it isn't imported anywhere yet, but this catches syntax/type mistakes in isolation since `tsconfig.json` includes all `**/*.tsx`).

- [ ] **Step 3: Commit**

```bash
git add components/MarkdownBlocks.tsx
git commit -m "feat: add MarkdownBlocks component to render parsed Markdown blocks"
```

---

### Task 3: Extract `ProjectDetailView` and shrink the page

**Files:**
- Create: `components/ProjectDetailView.tsx`
- Modify: `app/du-an/[slug]/page.tsx` (replace entirely — see Step 2)

**Interfaces:**
- Produces: `export default function ProjectDetailView({ project, relatedProjects, relatedPosts }: { project: Project; relatedProjects: Project[]; relatedPosts: Post[] })` — this is the exact component Plan 3's dashboard preview will import and render with a draft (unsaved) `Project` object.
- Consumes: `Project`, `Post` types from `@/lib/data`; `parseMarkdownBlocks` from `@/lib/markdown` (Task 1); `MarkdownBlocks` from `@/components/MarkdownBlocks` (Task 2); existing components `ContactForm`, `ProjectAnchorNav`, `ProjectHeroSlider`, `ProjectImageCarousel`, `AmenitiesGallery`, `ContactModal`, `ProjectSidebarForm`, `ZaloIcon`, `VideoEmbed` (all already in `components/`, untouched).

- [ ] **Step 1: Create `components/ProjectDetailView.tsx`**

```tsx
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Building2, CheckCircle, ChevronDown,
  Banknote, ShieldCheck, Calendar, Home, Zap,
  TreePine, Car, GraduationCap, HeartPulse, ShoppingBag, Phone, ArrowRight, Clock,
} from "lucide-react";
import type { Project, Post } from "@/lib/data";
import { parseMarkdownBlocks } from "@/lib/markdown";
import MarkdownBlocks from "@/components/MarkdownBlocks";
import ContactForm from "@/components/ContactForm";
import ProjectAnchorNav from "@/components/ProjectAnchorNav";
import ProjectHeroSlider from "@/components/ProjectHeroSlider";
import ProjectImageCarousel from "@/components/ProjectImageCarousel";
import AmenitiesGallery from "@/components/AmenitiesGallery";
import ContactModal from "@/components/ContactModal";
import ProjectSidebarForm from "@/components/ProjectSidebarForm";
import ZaloIcon from "@/components/ZaloIcon";
import VideoEmbed from "@/components/VideoEmbed";

type ProjectDetailViewProps = {
  project: Project;
  relatedProjects: Project[];
  relatedPosts: Post[];
};

const NEARBY_ICONS: Record<string, React.ElementType> = {
  school: GraduationCap, hospital: HeartPulse,
  mall: ShoppingBag, road: Car, other: MapPin,
};

function Divider() {
  return <div className="border-t border-border-soft" />;
}

function SecHead({ id, title }: { id?: string; title: string }) {
  return (
    <div id={id} className="scroll-mt-20 mb-8">
      <h2 className="text-2xl lg:text-[1.75rem] font-bold text-navy-900 tracking-tight leading-tight">{title}</h2>
      <div className="mt-3 w-12 h-[3px] bg-gold-500 rounded-full" />
    </div>
  );
}

function SectionIntro({ desc, children }: { desc?: string; children: React.ReactNode }) {
  if (!desc) return <>{children}</>;
  return (
    <div>
      <div className="mb-8 pb-8 border-b border-border-soft">
        <div className="pl-5 border-l-[3px] border-gold-400 rounded-sm">
          <MarkdownBlocks blocks={parseMarkdownBlocks(desc)} />
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ProjectDetailView({ project, relatedProjects, relatedPosts }: ProjectDetailViewProps) {
  const slug = project.slug;
  const hide = new Set(project.hidden_sections ?? []);
  const show = (id: string) => !hide.has(id);

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

  const productSchema = {
    "@context": "https://schema.org", "@type": "Product",
    name: project.title, description: project.excerpt,
    image: project.hero_image ? [`https://1992land.com${project.hero_image}`] : [],
    offers: project.price_from
      ? { "@type": "AggregateOffer", lowPrice: project.price_from, highPrice: project.price_to ?? project.price_from, priceCurrency: "VND" }
      : undefined,
  };
  const faqSchema = project.faq?.length
    ? {
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: project.faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }
    : null;

  return (
    <div className="pt-16 lg:pt-18 bg-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* ── BREADCRUMB ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-4 pb-3">
        <nav className="flex items-center gap-1.5 text-muted text-xs">
          <Link href="/" className="hover:text-navy-900 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/du-an" className="hover:text-navy-900 transition-colors">Dự án</Link>
          <span>/</span>
          <span className="text-navy-700 truncate">{project.title}</span>
        </nav>
      </div>

      {/* ── HERO SLIDER — full width, edge-to-edge ── */}
      <ProjectHeroSlider
        images={project.gallery?.length ? project.gallery : project.hero_image ? [project.hero_image] : []}
        title={project.title}
      />

      {/* ── COMPACT INFO BAR ── */}
      <div className="bg-white border-b border-border-soft shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Left: status + title + location */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  project.status === "Đang mở bán"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${project.status === "Đang mở bán" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  {project.status}
                </span>
                <span className="text-xs text-muted">{project.type}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-navy-900 leading-tight mb-1">
                {project.title}
              </h1>
              <div className="flex items-center gap-1.5 text-muted text-sm">
                <MapPin size={13} className="shrink-0 text-gold-500" />
                <span className="line-clamp-1">{project.address_full ?? project.location}</span>
              </div>
            </div>

            {/* Right: price + buttons — hidden */}
            <div className="hidden items-center flex-wrap gap-2.5 sm:gap-3 shrink-0">
              <div className="px-4 py-2 rounded-xl bg-gold-50 border border-gold-200">
                <div className="text-[10px] text-gold-700 uppercase tracking-wider font-medium leading-none mb-1">Giá từ</div>
                <div className="text-gold-600 font-bold text-lg sm:text-xl font-numeric leading-none">{project.priceRange}</div>
              </div>
              <a
                href="https://zalo.me/0909474123"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border-2 border-[#0068FF] text-[#0068FF] text-sm font-bold rounded-xl hover:bg-blue-50 active:scale-95 transition-all cursor-pointer min-h-[44px]"
              >
                <ZaloIcon size={17} /> Zalo
              </a>
              <ContactModal
                label="Nhận bảng giá"
                subject={`[Bảng giá] ${project.title}`}
                projectSlug={project.slug}
                icon="price"
                variant="gold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── ANCHOR NAV ── */}
      <ProjectAnchorNav sections={anchorSections} title={project.title} />

      {/* ── KEY STATS STRIP ── */}
      <div className="bg-navy-50 border-b border-border-soft">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-6 overflow-x-auto scrollbar-none">
          {project.scale && (
            <div className="flex items-center gap-2 shrink-0 text-xs text-navy-700">
              <Building2 size={13} className="text-gold-500 shrink-0" />
              <span>{project.scale}</span>
            </div>
          )}
          {project.discount && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-0.5 bg-gold-500 text-navy-950 text-[11px] font-bold rounded-full">{project.discount}</span>
            </div>
          )}
          {project.bank_support && (
            <div className="flex items-center gap-2 shrink-0 text-xs text-navy-700">
              <Banknote size={13} className="text-gold-500 shrink-0" />
              <span>{project.bank_support}</span>
            </div>
          )}
          {project.ownership && (
            <div className="flex items-center gap-2 shrink-0 text-xs text-emerald-700 font-semibold">
              <ShieldCheck size={13} className="shrink-0" />
              <span>{project.ownership}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK LEAD — CTA Google Ads ── */}
      <section className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 py-10">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[10px] font-bold tracking-[0.35em] uppercase px-3 py-1.5 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              Đang mở bán — Tư vấn miễn phí
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-3">
              Nhận báo giá &amp; chính sách<br className="hidden md:block" /> mới nhất ngay hôm nay
            </h2>
            <p className="text-navy-300 text-sm leading-relaxed mb-5">
              {[project.discount, project.bank_support].filter(Boolean).join(" · ") || "Liên hệ để nhận thông tin chi tiết"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {[
                { label: "Pháp lý đầy đủ", icon: ShieldCheck },
                { label: "Sổ đỏ lâu dài", icon: CheckCircle },
                { label: "BIM Land", icon: Building2 },
              ].map(({ label, icon: Icon }) => (
                <span key={label} className="flex items-center gap-1.5 bg-white/10 text-white/80 text-[11px] font-medium px-3 py-1.5 rounded-full border border-white/15">
                  <Icon size={11} className="text-gold-400" />{label}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full md:w-auto md:min-w-[380px] bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-navy-900 text-sm mb-0.5">Để lại thông tin tư vấn</h3>
            <p className="text-muted text-xs mb-4">Phản hồi trong 30 phút · Không spam</p>
            <ContactForm
              compact
              duAnQuanTam={project.title}
              subject={`[QuickLead] ${project.title} — 1992land.com`}
            />
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT + SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

        {/* ── CONTENT COLUMN ── */}
        <div className="flex-1 min-w-0 space-y-0">

        {/* ── 1. CHÍNH SÁCH ── */}
        {show("chinh-sach") && (
          <section className="pb-14">
            <SecHead id="chinh-sach" title="Chính sách bán hàng" />
            {project.videos?.["chinh-sach"] && (
              <VideoEmbed url={project.videos["chinh-sach"]} title={`Video chính sách ${project.title}`} />
            )}
            <SectionIntro desc={project.descriptions?.["chinh-sach"]}>
              {project.payment_policy && (
                <details className="group rounded-2xl border border-border-soft bg-white overflow-hidden mb-4" open>
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none bg-navy-900 text-white">
                    <span className="text-sm font-semibold">Lịch thanh toán</span>
                    <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180 text-white/70" />
                  </summary>
                  <div className="divide-y divide-border-soft">
                    {project.payment_policy.map((p, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-navy-50/40 transition-colors">
                        <div className="w-11 h-11 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                          <span className="text-gold-600 font-bold font-numeric text-sm">{p.percent}%</span>
                        </div>
                        <div>
                          <div className="font-semibold text-navy-900 text-sm">{p.installment}</div>
                          {p.note && <div className="text-muted text-xs mt-0.5">{p.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {project.discount && (
                  <div className="rounded-2xl border border-gold-200 bg-gradient-to-br from-gold-50 to-amber-50/60 p-5">
                    <Zap size={15} className="text-gold-500 mb-2" />
                    <div className="text-[10px] font-bold text-gold-700 uppercase tracking-wider mb-1.5">Chiết khấu & ưu đãi</div>
                    <p className="text-navy-900 text-sm leading-relaxed">{project.discount}</p>
                  </div>
                )}
                {project.bank_support && (
                  <div className="rounded-2xl border border-border-soft bg-white p-5">
                    <Banknote size={15} className="text-gold-500 mb-2" />
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Hỗ trợ vay</div>
                    <p className="text-navy-900 text-sm leading-relaxed">{project.bank_support}</p>
                  </div>
                )}
                {project.grace_period && (
                  <div className="rounded-2xl border border-border-soft bg-white p-5 sm:col-span-2">
                    <Calendar size={15} className="text-gold-500 mb-2" />
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Ân hạn gốc & lãi</div>
                    <p className="text-navy-900 text-sm">{project.grace_period}</p>
                  </div>
                )}
                {!project.payment_policy && !project.discount && !project.bank_support && (
                  <div className="rounded-2xl bg-white border border-border-soft p-5 text-sm text-muted sm:col-span-2">
                    Liên hệ để nhận thông tin chính sách mới nhất.
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <ContactModal label="Nhận bảng giá" subject={`[Bảng giá] ${project.title}`} projectSlug={project.slug} icon="price" variant="gold" />
                <ContactModal label="Nhận chính sách PDF" subject={`[Chính sách PDF] ${project.title}`} projectSlug={project.slug} icon="pdf" variant="outline" />
              </div>
            </SectionIntro>
          </section>
        )}

        {/* ── TỔNG QUAN ── */}
        {show("tong-quan") && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead title="Tổng quan dự án" />
              {/* Illustration image — above description */}
              {(project.overview_image ?? project.gallery?.[0] ?? project.hero_image) && (
                <div className="rounded-2xl overflow-hidden border border-border-soft mb-6">
                  <Image
                    src={(project.overview_image ?? project.gallery?.[0] ?? project.hero_image) as string}
                    alt={`Tổng quan ${project.title}`}
                    width={1200}
                    height={600}
                    className="w-full h-[220px] sm:h-[320px] lg:h-[400px] object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 65vw, 820px"
                  />
                </div>
              )}
              {project.videos?.["tong-quan"] && (
                <VideoEmbed url={project.videos["tong-quan"]} title={`Video tổng quan ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["tong-quan"]}>
                <div className="rounded-2xl border border-border-soft bg-white overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border-soft">
                      {[
                        ["Chủ đầu tư", project.developer],
                        ["Vị trí", project.address_full ?? project.location],
                        project.scale ? ["Quy mô", project.scale] : null,
                        ["Loại hình", project.type],
                        project.unit_count ? ["Số sản phẩm", `${project.unit_count} căn`] : null,
                        project.handover_date ? ["Bàn giao", project.handover_date] : null,
                        project.ownership ? ["Sở hữu", project.ownership] : null,
                      ]
                        .filter((r): r is [string, string] => r !== null)
                        .map(([label, value]) => (
                          <tr key={label} className="hover:bg-navy-50/40 transition-colors">
                            <td className="px-5 py-3 bg-navy-50/60 text-muted text-xs uppercase tracking-wide font-medium w-36 lg:w-44">{label}</td>
                            <td className="px-5 py-3 text-navy-900 font-semibold text-sm">{value}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── GIÁ BÁN ── */}
        {show("gia-ban") && project.product_types && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="gia-ban" title="Giá bán & giỏ hàng" />
              {project.videos?.["gia-ban"] && (
                <VideoEmbed url={project.videos["gia-ban"]} title={`Video giá bán ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["gia-ban"]}>
                <div className="rounded-2xl border border-border-soft bg-white overflow-hidden mb-5">
                  <div className="grid grid-cols-4 gap-2 bg-navy-900 px-5 py-3 text-white/70 text-[10px] font-bold uppercase tracking-wider">
                    <span>Loại căn</span><span>Diện tích</span><span>Mức giá</span><span className="text-right">Còn lại</span>
                  </div>
                  {project.product_types.map((p, i) => {
                    const scarce = p.available != null && p.total ? p.available / p.total < 0.2 : false;
                    return (
                      <div key={i} className={`grid grid-cols-4 gap-2 px-5 py-4 items-center hover:bg-navy-50/40 transition-colors ${i > 0 ? "border-t border-border-soft" : ""}`}>
                        <span className="font-bold text-navy-900 text-sm">{p.name}</span>
                        <span className="text-muted text-sm">{p.area}</span>
                        <span className="text-gold-600 font-bold text-sm font-numeric">{p.price_range}</span>
                        <div className="text-right">
                          {p.available != null
                            ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scarce ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                                {scarce ? `⚡ ${p.available}` : `${p.available} căn`}
                              </span>
                            : <span className="text-muted text-xs">Liên hệ</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ContactModal label="Nhận bảng hàng mới nhất" subject={`[Bảng hàng] ${project.title}`} projectSlug={project.slug} icon="price" variant="gold" />
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── VỊ TRÍ ── */}
        {show("vi-tri") && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="vi-tri" title="Vị trí dự án" />
              {/* Illustration image — above description, fallback to gallery */}
              {(project.location_image ?? project.gallery?.[1] ?? project.hero_image) && (
                <div className="rounded-2xl overflow-hidden border border-border-soft mb-6 w-full">
                  <Image
                    src={(project.location_image ?? project.gallery?.[1] ?? project.hero_image) as string}
                    alt={`Vị trí ${project.title}`}
                    width={1200}
                    height={600}
                    className="w-full h-[220px] sm:h-[320px] lg:h-[400px] object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 65vw, 820px"
                  />
                </div>
              )}
              {project.videos?.["vi-tri"] && (
                <VideoEmbed url={project.videos["vi-tri"]} title={`Video vị trí ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["vi-tri"]}>
                <div>
                  <div className="flex items-start gap-2 text-sm mb-4">
                    <MapPin size={15} className="text-gold-500 mt-0.5 shrink-0" />
                    <span className="text-navy-900 font-medium">{project.address_full ?? project.location}</span>
                  </div>
                  {project.nearby && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {project.nearby.map((n, i) => {
                        const Icon = NEARBY_ICONS[n.category] ?? MapPin;
                        return (
                          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-border-soft hover:border-navy-200 transition-colors">
                            <div className="w-7 h-7 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                              <Icon size={13} className="text-gold-500" />
                            </div>
                            <span className="flex-1 text-navy-900 text-sm truncate">{n.name}</span>
                            <span className="text-gold-600 text-xs font-bold font-numeric shrink-0">{n.distance}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── ĐIỂM NỔI BẬT ── */}
        {show("diem-noi-bat") && project.highlights && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead title="Điểm nổi bật & lý do đầu tư" />
              {project.gallery && project.gallery.length > 1 && (
                <div className="mb-6">
                  <ProjectImageCarousel images={project.gallery.slice(0, 4)} title={project.title} />
                </div>
              )}
              {project.videos?.["diem-noi-bat"] && (
                <VideoEmbed url={project.videos["diem-noi-bat"]} title={`Video điểm nổi bật ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["diem-noi-bat"]}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.highlights.map((h, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-xl bg-white border border-border-soft hover:border-gold-200 transition-all">
                      <CheckCircle size={15} className="text-gold-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-navy-900 text-sm mb-0.5">{h.title}</div>
                        <div className="text-muted text-xs leading-relaxed">{h.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── TIỆN ÍCH ── */}
        {show("tien-ich") && (project.amenities_internal || project.amenities_external || project.amenities_images) && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="tien-ich" title="Tiện ích dự án" />
              {project.amenities_images && project.amenities_images.length > 0 && (
                <AmenitiesGallery images={project.amenities_images} title={`Tiện ích ${project.title}`} />
              )}
              {project.videos?.["tien-ich"] && (
                <VideoEmbed url={project.videos["tien-ich"]} title={`Video tiện ích ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["tien-ich"]}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {project.amenities_internal && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TreePine size={14} className="text-gold-500" />
                        <span className="font-bold text-navy-900 text-sm">Nội khu</span>
                      </div>
                      <ul className="space-y-1.5">
                        {project.amenities_internal.map((a, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-sm text-navy-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.amenities_external && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className="text-gold-500" />
                        <span className="font-bold text-navy-900 text-sm">Ngoại khu</span>
                      </div>
                      <ul className="space-y-1.5">
                        {project.amenities_external.map((a, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-sm text-navy-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-navy-300 shrink-0" />{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── MẶT BẰNG ── */}
        {show("mat-bang") && project.masterplan_image && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="mat-bang" title="Mặt bằng tổng thể" />
              {project.videos?.["mat-bang"] && (
                <VideoEmbed url={project.videos["mat-bang"]} title={`Video mặt bằng ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["mat-bang"]}>
                <div>
                  <div className="rounded-2xl overflow-hidden border border-border-soft mb-4">
                    <Image src={project.masterplan_image} alt={`Mặt bằng ${project.title}`} width={900} height={500} className="w-full object-cover" />
                  </div>
                  <ContactModal label="Tải mặt bằng chi tiết" subject={`[Mặt bằng] ${project.title}`} projectSlug={project.slug} icon="plan" variant="outline" />
                </div>
              </SectionIntro>
            </section>
          </>
        )}

        {/* ── THIẾT KẾ ── */}
        {show("thiet-ke") && project.floor_plans && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead title="Thiết kế sản phẩm" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {project.floor_plans.map((fp, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white border border-border-soft hover:border-navy-200 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                      <Home size={16} className="text-navy-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-navy-900 text-sm">{fp.name}</div>
                      <div className="text-muted text-xs mt-0.5 truncate">{fp.layout}</div>
                    </div>
                    <div className="text-gold-600 font-bold text-sm font-numeric shrink-0">{fp.area}</div>
                  </div>
                ))}
              </div>
              <ContactModal label="Tải thiết kế chi tiết" subject={`[Thiết kế] ${project.title}`} projectSlug={project.slug} icon="plan" variant="outline" />
            </section>
          </>
        )}

        {/* ── PHÁP LÝ + FAQ ── */}
        {show("phap-ly") && (
          <>
            <Divider />
            <section className="py-14">
              <SecHead id="phap-ly" title="Tiến độ & Pháp lý" />
              {project.videos?.["phap-ly"] && (
                <VideoEmbed url={project.videos["phap-ly"]} title={`Video pháp lý ${project.title}`} />
              )}
              <SectionIntro desc={project.descriptions?.["phap-ly"]}>
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div className="rounded-2xl bg-white border border-border-soft p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={14} className="text-gold-500" />
                        <span className="font-bold text-navy-900 text-sm">Tiến độ xây dựng</span>
                      </div>
                      <p className="text-muted text-sm leading-relaxed">
                        {project.construction_update ?? "Liên hệ 1992 Land để cập nhật tiến độ mới nhất."}
                      </p>
                      {project.handover_date && (
                        <div className="mt-3 flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                          <Calendar size={12} /> Bàn giao: {project.handover_date}
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl bg-white border border-border-soft p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck size={14} className="text-gold-500" />
                        <span className="font-bold text-navy-900 text-sm">Pháp lý</span>
                      </div>
                      <p className="text-muted text-sm leading-relaxed">
                        {project.legal_status ?? "Đang hoàn thiện hồ sơ pháp lý. Liên hệ để xem trực tiếp."}
                      </p>
                      {project.ownership && (
                        <div className="mt-3 flex items-start gap-1.5 text-navy-700 text-xs">
                          <CheckCircle size={12} className="text-gold-500 mt-0.5 shrink-0" />{project.ownership}
                        </div>
                      )}
                    </div>
                  </div>
                  {project.faq && project.faq.length > 0 && (
                    <div className="space-y-2">
                      {project.faq.map(({ q, a }, i) => (
                        <details key={i} className="group rounded-xl border border-border-soft bg-white overflow-hidden">
                          <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer list-none font-semibold text-navy-900 text-sm hover:text-gold-500 transition-colors">
                            {q}
                            <ChevronDown size={14} className="text-muted shrink-0 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="px-5 pb-4 pt-3 text-muted text-sm leading-relaxed border-t border-border-soft">{a}</div>
                        </details>
                      ))}
                    </div>
                  )}
                </div>
              </SectionIntro>
            </section>
          </>
        )}
        </div>{/* ── END CONTENT COLUMN ── */}

        {/* ── STICKY SIDEBAR ── */}
        <div className="hidden lg:block w-80 xl:w-[340px] shrink-0 sticky top-24 self-start">
          <ProjectSidebarForm project={project} />
        </div>

        </div>{/* ── END FLEX ── */}
      </div>{/* ── END OUTER ── */}

      {/* ── ĐĂNG KÝ TƯ VẤN ── */}
      {show("dang-ky") && (
        <section id="dang-ky" className="scroll-mt-20 bg-navy-900 py-16 lg:py-20 px-6">
          {/* Gold accent top */}
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent -mt-16 lg:-mt-20" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: text + contacts */}
            <div className="text-surface">
              <p className="text-gold-400 text-xs tracking-[0.4em] uppercase mb-4">Tư vấn miễn phí</p>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Nhận thông tin <br className="hidden lg:block" />
                <span className="text-gold-400">{project.title}</span>
              </h2>
              <p className="text-surface/60 mb-8 leading-relaxed text-base">
                Điền thông tin để nhận <strong className="text-surface/90">bảng giá, chính sách mới nhất</strong> và
                được tư vấn 1-1 trong vòng 30 phút trong giờ làm việc.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+84909474123"
                  className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-surface font-medium rounded-full hover:border-white/40 hover:bg-white/5 transition-all text-sm"
                >
                  <Phone size={14} /> 0909 474 123
                </a>
                <a
                  href="https://zalo.me/0909474123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#0068FF] text-[#0068FF] font-semibold rounded-full hover:bg-blue-50 transition-colors text-sm"
                >
                  <ZaloIcon size={18} /> Chat Zalo
                </a>
              </div>
              <div className="mt-8 hidden lg:block">
                <div className="flex items-center gap-3 text-surface/30">
                  <Clock size={12} />
                  <span className="text-xs">Thứ 2 — Chủ nhật · 8:00 — 20:00</span>
                </div>
              </div>
            </div>
            {/* Right: form */}
            <div className="bg-white rounded-3xl p-7 shadow-2xl">
              <h3 className="font-bold text-navy-900 mb-0.5">Để lại thông tin</h3>
              <p className="text-muted text-xs mb-5">Phản hồi trong 30 phút · Không spam</p>
              <ContactForm subject={`[Lead] ${project.title} — 1992land.com`} duAnQuanTam={project.slug} />
            </div>
          </div>
        </section>
      )}

      {/* ── DỰ ÁN CÙNG PHÂN KHÚC ── */}
      {relatedProjects.length > 0 && (
        <div className="border-t border-border-soft bg-white py-14 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-gold-500 text-xs font-semibold tracking-[0.4em] uppercase mb-2">Khám phá thêm</p>
                <h2 className="text-xl font-bold text-navy-900">Dự án cùng phân khúc</h2>
              </div>
              <Link href="/du-an" className="text-sm text-navy-500 hover:text-navy-900 transition-colors flex items-center gap-1 group">
                Tất cả dự án <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProjects.map((rp) => (
                <Link key={rp.slug} href={`/du-an/${rp.slug}`}
                  className="group block rounded-2xl border border-border-soft bg-white hover:border-navy-200 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
                  <div className={`relative h-44 bg-gradient-to-br ${rp.gradient} overflow-hidden`}>
                    {rp.hero_image && (
                      <Image src={rp.hero_image} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 text-xs font-semibold rounded-full ${rp.status === "Đang mở bán" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {rp.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-navy-900 text-sm leading-snug mb-1.5 group-hover:text-gold-500 transition-colors line-clamp-2">{rp.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1"><MapPin size={11} />{rp.location}</span>
                      <span className="text-gold-600 font-bold">{rp.priceRange}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TIN TỨC LIÊN QUAN — ẩn ── */}
      {false && relatedPosts.length > 0 && (
        <div className="bg-navy-50 py-14 px-4 lg:px-8 border-t border-border-soft">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-gold-500 text-xs font-semibold tracking-[0.4em] uppercase mb-2">Kiến thức</p>
                <h2 className="text-xl font-bold text-navy-900">Tin tức liên quan</h2>
              </div>
              <Link href="/tin-tuc" className="text-sm text-navy-500 hover:text-navy-900 transition-colors flex items-center gap-1 group">
                Tất cả tin tức <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/tin-tuc/${rp.slug}`}
                  className="group block bg-white rounded-2xl border border-border-soft overflow-hidden hover:border-navy-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-navy-700 to-navy-900 overflow-hidden relative">
                    {rp.hero_image && (
                      <Image src={rp.hero_image} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
                    {rp.category && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/15 backdrop-blur-sm text-white text-[10px] font-medium rounded-full border border-white/20">
                        {rp.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-navy-900 text-sm leading-snug line-clamp-2 group-hover:text-gold-500 transition-colors mb-2">{rp.title}</h3>
                    <div className="flex items-center gap-1 text-muted text-xs">
                      <Clock size={10} />
                      <span>{rp.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/du-an/[slug]/page.tsx` with the thin wrapper**

Replace the entire file content with:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadProjects, loadPosts } from "@/lib/loadData";
import ProjectDetailView from "@/components/ProjectDetailView";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = loadProjects().find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const projects = loadProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const related = projects
    .filter((p) => p.slug !== slug && (p.area === project.area || p.project_type === project.project_type))
    .slice(0, 3);
  const relatedProjects = related.length >= 2 ? related : projects.filter((p) => p.slug !== slug).slice(0, 3);

  const allPosts = loadPosts();
  const relatedPosts = allPosts
    .filter((p) => p.related_projects?.includes(slug))
    .slice(0, 3);

  return (
    <ProjectDetailView
      project={project}
      relatedProjects={relatedProjects}
      relatedPosts={relatedPosts}
    />
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors (the `eslint-disable` comment in `MarkdownBlocks.tsx` already covers the one intentional `<img>` usage).

- [ ] **Step 5: Full build**

Run: `npm run build`
Expected: build succeeds, all 9 project pages under `/du-an/*` are statically generated with no errors.

- [ ] **Step 6: Commit**

```bash
git add components/ProjectDetailView.tsx "app/du-an/[slug]/page.tsx"
git commit -m "refactor: extract ProjectDetailView from app/du-an/[slug]/page.tsx"
```

---

### Task 4: Manual visual verification (all 9 existing projects unchanged)

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (serves on port 3001 per `package.json`)

- [ ] **Step 2: Compare each project's description sections before/after**

For each of the 12 slugs in `data/projects/*.json` (get the list with `Get-ChildItem data/projects -Filter *.json | % BaseName` or `ls data/projects/*.json`), open `http://localhost:3001/du-an/{slug}` and check the sections that have a `descriptions.*` entry (Tổng quan, Vị trí, Tiện ích, Giá bán, Pháp lý, Chính sách, Điểm nổi bật):
- Paragraph grouping looks the same as before (2-sentence pairs, same as production today — since none of the 9 files have blank lines yet, Task 1's legacy fallback must be the path taken).
- `**bold**` text still renders bold.
- No `##`, `**`, `_`, `[...]` raw Markdown syntax leaks into the visible text.

- [ ] **Step 3: Spot-check one project with a temporary blank-line edit (manual, do not commit)**

Pick one project file, e.g. `data/projects/ansana-by-kita.json`. Temporarily edit `descriptions["tong-quan"]` in a scratch copy (or via editor, without committing) to include a blank line, a `## ` heading, a `- ` list, and a `[text](url)` link. Reload the page and confirm each renders correctly (real paragraph break, heading, list, styled link opening in a new tab). **Revert this file change before moving on** — `git checkout -- data/projects/ansana-by-kita.json` if edited directly, or `git status` to confirm no unintended diff remains.

- [ ] **Step 4: Confirm no stray git diff from the manual spot-check**

Run: `git status`
Expected: only the files committed in Tasks 1–3 show as changed; `data/projects/*.json` shows no diff.

---

## What's next

Plan 1 ships a working, testable improvement on its own: `/du-an/{slug}` pages now support full Markdown (once content actually uses it) with zero behavior change for existing content, and `ProjectDetailView` is ready to be imported by the dashboard's live preview.

Plans 2 (VPS API wrapping `scripts/tg-bot/engine/actions.mjs`) and 3 (`/dashboard` UI with Tiptap, auth, save/undo) will be written as separate plan documents once this one is implemented and verified, per the spec's task breakdown.
