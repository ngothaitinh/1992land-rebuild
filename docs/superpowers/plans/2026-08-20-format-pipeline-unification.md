# Thống nhất pipeline định dạng (Lát 0) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thống nhất ba bộ xử lý định dạng đang tồn tại song song về đúng một hợp đồng 10 cấu trúc, để trang bài viết hiển thị đúng markdown inline và để bấm Lưu không còn xoá trích dẫn khỏi bài.

**Architecture:** Thêm `quote` vào lớp parse dùng chung (`lib/markdown.mjs`) và lớp chuyển đổi HTML↔Markdown (`lib/markdown-html.mjs`), rồi cho `MarkdownBlocks.tsx` một prop `variant` để cùng một component phục vụ hai bối cảnh typography khác nhau (mục dự án vs thân bài viết). Cuối cùng tách `PostDetailView.tsx` và thay bộ render riêng của trang bài viết bằng pipeline dùng chung.

**Tech Stack:** Next.js 16 App Router (static export), TypeScript, Tailwind v4, `node:test` + `node:assert/strict`.

**Spec:** `docs/superpowers/specs/2026-08-20-dashboard-shell-and-posts-design.md` (§4, §5, §7)

## Global Constraints

- **Không thêm npm dependency mới.**
- **Hợp đồng định dạng đúng 10 cấu trúc** (spec §5): đoạn văn, `## `, `### `, `- `, `1. `, `> `, `![]()`, `**đậm**`, `_nghiêng_`, `[link](url)`. Không thêm gì ngoài danh sách.
- **Tiếng Việt** cho mọi chuỗi hiển thị và tên test.
- Chạy test: `node --test lib/*.test.mjs` (không có script `test` trong `package.json`).
- Build: `pnpm build`. Node v24, pnpm 11.
- **Thứ tự bắt buộc:** Task 2→3 (parser + converter) phải xong **trước** Task 5 (đổi bộ render trang bài viết). Làm ngược lại sẽ hỏng trích dẫn của cả 9 bài.
- `MarkdownBlocks` hiện chỉ được `ProjectDetailView.tsx:53` dùng. Mọi thay đổi phải **mặc định giữ nguyên hành vi cũ** để trang dự án không đổi.

---

### Task 1: Chụp ảnh nền 9 bài viết trước khi sửa

Không có thay đổi code. Mục đích: có mốc so sánh cho Task 6.

**Files:**
- Create: `.regression-baseline/` (thư mục tạm, không commit)

- [ ] **Step 1: Build bản hiện tại**

```bash
pnpm build
```

Expected: `✓ Generating static pages ... (52/52)`, không lỗi.

- [ ] **Step 2: Lưu HTML làm mốc**

Chụp cả `tin-tuc` (nơi sẽ thay đổi) lẫn `du-an` (nơi **phải không** thay đổi — `MarkdownBlocks` dùng chung cho cả hai):

```bash
mkdir -p .regression-baseline
cp -r out/tin-tuc .regression-baseline/tin-tuc
cp -r out/du-an .regression-baseline/du-an
ls .regression-baseline/tin-tuc
```

Expected: thấy 9 thư mục slug + `index.html`.

- [ ] **Step 3: Chặn thư mục mốc lọt vào git**

Thêm vào cuối `.gitignore`:

```
.regression-baseline/
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: bỏ qua thư mục mốc hồi quy"
```

---

### Task 2: Thêm trích dẫn vào bộ parse dùng chung

**Files:**
- Modify: `lib/markdown.mjs` (hàm `looksLikeMarkdownStructure` dòng 41-55, hàm `parseMarkdownBlocks` dòng 57-122)
- Modify: `lib/markdown.d.ts` (type `MdBlock` dòng 7-13)
- Test: `lib/markdown.test.mjs`

**Interfaces:**
- Produces: block mới `{ type: "quote"; inline: MdInline[] }` trong mảng trả về của `parseMarkdownBlocks`. Task 3 và Task 4 đều dựa vào tên `"quote"` và trường `inline` này.

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `lib/markdown.test.mjs`:

```js
test("trích dẫn một dòng → block quote", () => {
  const blocks = parseMarkdownBlocks("> Đây là câu trích dẫn.");
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, "quote");
  assert.deepEqual(blocks[0].inline, [{ type: "text", text: "Đây là câu trích dẫn." }]);
});

test("trích dẫn nhiều dòng gộp thành một block", () => {
  const blocks = parseMarkdownBlocks("> Dòng một\n> dòng hai");
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, "quote");
  assert.deepEqual(blocks[0].inline, [{ type: "text", text: "Dòng một dòng hai" }]);
});

test("trích dẫn giữ được định dạng inline bên trong", () => {
  const blocks = parseMarkdownBlocks("> Giá **2,9 tỷ** cho căn góc");
  assert.equal(blocks[0].type, "quote");
  assert.deepEqual(blocks[0].inline, [
    { type: "text", text: "Giá " },
    { type: "bold", text: "2,9 tỷ" },
    { type: "text", text: " cho căn góc" },
  ]);
});

test("trích dẫn đứng cạnh đoạn văn khác vẫn tách đúng", () => {
  const blocks = parseMarkdownBlocks("Mở đầu.\n\n> Trích dẫn\n\nKết thúc.");
  assert.deepEqual(blocks.map((b) => b.type), ["p", "quote", "p"]);
});
```

- [ ] **Step 2: Chạy test để xác nhận nó thất bại**

Run: `node --test lib/markdown.test.mjs`
Expected: FAIL — nhận `"p"` thay vì `"quote"`.

- [ ] **Step 3: Cho `looksLikeMarkdownStructure` nhận biết `> `**

Trong `lib/markdown.mjs`, sửa hàm `looksLikeMarkdownStructure` (dòng 41-55). Thêm biến `isQuote` và đưa vào điều kiện `return` đầu tiên:

```js
function looksLikeMarkdownStructure(norm) {
  const lines = norm.split("\n").map((l) => l.trim());
  const isHeading = (l) => /^#{2,3}\s+/.test(l);
  const isImage = (l) => /^!\[[^\]]*\]\([^)]+\)$/.test(l);
  const isQuote = (l) => /^>\s/.test(l);
  const isListItem = (l) => /^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l);

  if (lines.some(isHeading) || lines.some(isImage) || lines.some(isQuote)) return true;
  return lines.length >= 2 && lines.some(isListItem);
}
```

Vì sao cần bước này: không có nó, một field chỉ gồm đúng một dòng trích dẫn (không có dòng trống) sẽ rơi vào nhánh legacy và bị cắt câu theo `". "` thay vì thành block quote.

- [ ] **Step 4: Thêm nhánh nhận trích dẫn trong `parseMarkdownBlocks`**

Trong vòng lặp `for (const raw of rawBlocks)`, chèn khối sau **ngay sau** nhánh heading (sau dòng `continue;` kết thúc khối `if (/^#{2,3}\s+/...)`, tức sau dòng 88) và **trước** nhánh ảnh:

```js
    if (lines.every((l) => /^>\s?/.test(l))) {
      const quoteText = lines.map((l) => l.replace(/^>\s?/, "")).join(" ");
      blocks.push({ type: "quote", inline: parseInline(quoteText) });
      continue;
    }
```

Khác với `- ` và `1. `, dấu `>` đầu dòng không trùng với dấu câu tiếng Việt thông thường, nên **không** cần điều kiện `lines.length >= 2`.

- [ ] **Step 5: Cập nhật kiểu**

Trong `lib/markdown.d.ts`, thêm một nhánh vào union `MdBlock`, đặt sau `h3`:

```ts
  | { type: "quote"; inline: MdInline[] }
```

- [ ] **Step 6: Chạy lại toàn bộ test**

Run: `node --test lib/*.test.mjs`
Expected: PASS toàn bộ — 56 test cũ vẫn xanh, cộng 4 test mới.

- [ ] **Step 7: Commit**

```bash
git add lib/markdown.mjs lib/markdown.d.ts lib/markdown.test.mjs
git commit -m "feat(markdown): parse trích dẫn > thành block quote"
```

---

### Task 3: Thêm trích dẫn vào bộ chuyển đổi HTML↔Markdown

**Files:**
- Modify: `lib/markdown-html.mjs` (hàm `markdownToHtml` dòng 18-30, hằng `BLOCK_RE` dòng 58, hàm `htmlToMarkdown` dòng 61-88)
- Test: `lib/markdown-html.test.mjs`

**Interfaces:**
- Consumes: block `{ type: "quote", inline }` từ Task 2.
- Produces: `markdownToHtml` sinh `<blockquote><p>…</p></blockquote>`; `htmlToMarkdown` đọc ngược thẻ đó về `> …`. Task 5 dựa vào việc khứ hồi này không mất chữ.

**Vì sao `<p>` lồng bên trong:** extension Blockquote của TipTap có content model `block+`, nên nội dung luôn nằm trong `<p>`. Sinh đúng dạng đó để editor ở lát 1 không phải chuẩn hoá lại.

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `lib/markdown-html.test.mjs`:

```js
test("markdownToHtml — trích dẫn", () => {
  assert.equal(
    markdownToHtml("> Câu trích dẫn"),
    "<blockquote><p>Câu trích dẫn</p></blockquote>"
  );
});

test("htmlToMarkdown — trích dẫn", () => {
  assert.equal(
    htmlToMarkdown("<blockquote><p>Câu trích dẫn</p></blockquote>"),
    "> Câu trích dẫn"
  );
});

test("khứ hồi trích dẫn không mất chữ", () => {
  const original = "> Giá **2,9 tỷ** cho căn góc";
  assert.equal(htmlToMarkdown(markdownToHtml(original)), original);
});

test("khứ hồi trích dẫn xen giữa các block khác", () => {
  const original = "Mở đầu.\n\n> Trích dẫn\n\n## Tiêu đề\n\nKết thúc.";
  assert.equal(htmlToMarkdown(markdownToHtml(original)), original);
});

// Ghi nhận có chủ đích: bộ chuyển đổi chỉ hiểu đúng 10 cấu trúc trong hợp đồng
// định dạng (spec §5). Thẻ ngoài hợp đồng bị bỏ — đây là hành vi ĐÃ BIẾT, không
// phải sơ suất. Test này khoá danh sách lại: muốn thêm nút vào toolbar thì phải
// sửa cả markdownToHtml, BLOCK_RE, htmlToMarkdown, MarkdownBlocks VÀ test này.
test("thẻ ngoài hợp đồng định dạng bị bỏ — hành vi có chủ đích", () => {
  assert.equal(htmlToMarkdown("<table><tr><td>ô</td></tr></table>"), "");
  assert.equal(htmlToMarkdown("<h4>tiêu đề cấp 4</h4>"), "");
  assert.equal(htmlToMarkdown("<hr>"), "");
});

test("thẻ trong hợp đồng đều được giữ", () => {
  const html =
    "<p>đoạn</p><h2>h2</h2><h3>h3</h3><ul><li>a</li></ul>" +
    "<ol><li>b</li></ol><blockquote><p>q</p></blockquote>" +
    '<img src="/a.jpg" alt="x">';
  const md = htmlToMarkdown(html);
  assert.ok(md.includes("đoạn"));
  assert.ok(md.includes("## h2"));
  assert.ok(md.includes("### h3"));
  assert.ok(md.includes("- a"));
  assert.ok(md.includes("1. b"));
  assert.ok(md.includes("> q"));
  assert.ok(md.includes("![x](/a.jpg)"));
});
```

- [ ] **Step 2: Chạy test để xác nhận nó thất bại**

Run: `node --test lib/markdown-html.test.mjs`
Expected: FAIL — `markdownToHtml("> …")` hiện trả về `<p>&gt; …</p>` hoặc rỗng, và `htmlToMarkdown` trả `""` cho blockquote.

- [ ] **Step 3: Sinh HTML cho block quote**

Trong `lib/markdown-html.mjs`, hàm `markdownToHtml`, thêm dòng sau nhánh `h3` (sau dòng 24):

```js
      if (block.type === "quote") return `<blockquote><p>${inlineToHtml(block.inline)}</p></blockquote>`;
```

- [ ] **Step 4: Cho `BLOCK_RE` nhận thẻ blockquote**

Thay dòng 58:

```js
const BLOCK_RE = /<(p|h2|h3|ul|ol|blockquote)>([\s\S]*?)<\/\1>|<img\s+([^>]*?)>/g;
```

- [ ] **Step 5: Đọc ngược blockquote về markdown**

Trong hàm `htmlToMarkdown`, thêm nhánh sau khối xử lý `h2`/`h3` (sau dòng 80):

```js
    if (tag === "blockquote") {
      out.push(`> ${inlineFromHtml(stripInnerParagraph(inner))}`);
      continue;
    }
```

`stripInnerParagraph` (đã có sẵn ở dòng 35) bóc đúng một lớp `<p>` bên trong.

- [ ] **Step 6: Chạy lại toàn bộ test**

Run: `node --test lib/*.test.mjs`
Expected: PASS toàn bộ.

- [ ] **Step 7: Commit**

```bash
git add lib/markdown-html.mjs lib/markdown-html.test.mjs
git commit -m "feat(markdown): giữ trích dẫn khi chuyển đổi HTML<->Markdown"
```

---

### Task 4: Cho `MarkdownBlocks` hai biến thể typography + render trích dẫn

**Files:**
- Modify: `components/MarkdownBlocks.tsx` (toàn bộ hàm export, dòng 42-112)

**Interfaces:**
- Consumes: block `quote` từ Task 2.
- Produces: `<MarkdownBlocks blocks={…} variant="section" | "article" />`. Mặc định `"section"` — giữ nguyên hành vi hiện tại, nên `ProjectDetailView.tsx:53` **không cần sửa**. Task 5 dùng `variant="article"`.

**Vì sao cần biến thể:** component hiện render block `h2` thành thẻ `<h3>` và `h3` thành `<h4>`, vì trong `ProjectDetailView` thì `SecHead` đã chiếm `<h2>` của mục. Thân bài viết thì ngược lại — `## ` phải ra `<h2>` thật, cỡ `text-2xl`, nếu không sẽ tụt cấp heading (hại SEO) và đổi toàn bộ typography của 9 bài.

- [ ] **Step 1: Thay phần thân component**

Thay toàn bộ từ dòng 40 (comment `// Headings here render as h3/h4…`) đến hết file bằng:

```tsx
type Variant = "section" | "article";

// Hai bối cảnh typography khác nhau dùng chung một bộ render:
// - "section": nằm trong ProjectDetailView, nơi SecHead đã chiếm <h2> của mục,
//   nên heading nội dung tụt một cấp thành h3/h4.
// - "article": thân bài viết, "## " phải ra <h2> thật để đúng cấu trúc tài liệu.
export default function MarkdownBlocks({
  blocks,
  variant = "section",
}: {
  blocks: MdBlock[];
  variant?: Variant;
}) {
  const article = variant === "article";

  return (
    <div className={article ? "space-y-5 text-[15px]" : "space-y-4 max-w-[72ch]"}>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          if (article) {
            return (
              <p key={i} className="leading-[1.85] text-ink">
                <InlineNodes inline={block.inline} />
              </p>
            );
          }
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
          if (article) {
            return (
              <h2 key={i} className="font-display text-2xl font-bold text-navy-900 mt-10 mb-4 tracking-tight">
                <InlineNodes inline={block.inline} />
              </h2>
            );
          }
          return (
            <h3 key={i} className="font-display text-lg font-bold text-navy-900 pt-2">
              <InlineNodes inline={block.inline} />
            </h3>
          );
        }

        if (block.type === "h3") {
          if (article) {
            return (
              <h3 key={i} className="font-display text-xl font-bold text-navy-900 mt-8 mb-3 tracking-tight">
                <InlineNodes inline={block.inline} />
              </h3>
            );
          }
          return (
            <h4 key={i} className="font-display text-base font-bold text-navy-900 pt-2">
              <InlineNodes inline={block.inline} />
            </h4>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={i} className="border-l-4 border-gold-500 pl-6 py-2 my-6 bg-gold-50 rounded-r-xl">
              <p className="text-navy-800 font-medium italic leading-relaxed">
                <InlineNodes inline={block.inline} />
              </p>
            </blockquote>
          );
        }

        if (block.type === "ul") {
          if (article) {
            return (
              <ul key={i} className="space-y-3 my-4">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 items-start">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
                    <span className="leading-relaxed">
                      <InlineNodes inline={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          }
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
            <ol
              key={i}
              className={
                article
                  ? "list-decimal pl-5 space-y-3 my-4 leading-relaxed marker:text-gold-500 marker:font-semibold"
                  : "list-decimal pl-5 space-y-1 text-[14.5px] text-navy-600 leading-[1.7]"
              }
            >
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

Class của `blockquote` sao chép nguyên từ `app/tin-tuc/[slug]/page.tsx:49-51`, class của `ul` biến thể article sao chép nguyên từ dòng 57-62 cùng file — để 9 bài viết hiển thị **không đổi**.

- [ ] **Step 2: Kiểm tra kiểu và build**

Run: `pnpm build`
Expected: `✓ Compiled successfully`, không lỗi TypeScript.

- [ ] **Step 3: Xác nhận chưa có gì đổi**

```bash
diff -r .regression-baseline/tin-tuc out/tin-tuc; echo "tin-tuc exit=$?"
diff -r .regression-baseline/du-an out/du-an; echo "du-an exit=$?"
```

Expected: cả hai `exit=0`. Task 4 chỉ thêm biến thể mới và block `quote`; chưa nơi nào gọi `variant="article"`, và chưa nội dung nào có `> ` đi qua `MarkdownBlocks`, nên output phải y hệt.

- [ ] **Step 4: Commit**

```bash
git add components/MarkdownBlocks.tsx
git commit -m "feat(markdown): thêm biến thể article và render trích dẫn cho MarkdownBlocks"
```

---

### Task 5: Tách `PostDetailView` và thay bộ render riêng của trang bài viết

**Files:**
- Create: `components/PostDetailView.tsx`
- Modify: `app/tin-tuc/[slug]/page.tsx` (298 dòng → còn phần metadata + wrapper)

**Interfaces:**
- Consumes: `MarkdownBlocks` với `variant="article"` (Task 4), `parseMarkdownBlocks` (Task 2).
- Produces: `<PostDetailView post={post} relatedPosts={related} />` — khung xem trước của editor ở lát 1 dùng lại đúng component này, nên trang public và preview không thể lệch nhau. Ký hiệu đặt theo đúng mẫu `ProjectDetailView` hiện có (`components/ProjectDetailView.tsx`).

- [ ] **Step 1: Tạo component, chuyển phần thân trang sang**

Tạo `components/PostDetailView.tsx`. Chuyển **nguyên văn** phần JSX đang nằm trong `PostDetailPage` (từ `<div className="pt-20">` ở dòng 84 tới thẻ đóng tương ứng ở cuối hàm, dòng 297) sang component mới, kèm các import mà phần đó dùng (`Link`, `Image`, `Calendar`, `Clock`, `ArrowLeft`, `ArrowRight`, `Phone`, `ZaloIcon`, `MessengerIcon`) và hàm `formatDate` (dòng 29-35).

Khung file:

```tsx
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowLeft, ArrowRight, Phone } from "lucide-react";
import type { Post } from "@/lib/data";
import { parseMarkdownBlocks } from "@/lib/markdown";
import MarkdownBlocks from "@/components/MarkdownBlocks";
import ZaloIcon from "@/components/ZaloIcon";
import MessengerIcon from "@/components/MessengerIcon";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function PostDetailView({
  post,
  relatedPosts,
}: {
  post: Post;
  relatedPosts: Post[];
}) {
  return (
    <div className="pt-20">
      {/* … phần JSX chuyển nguyên văn từ app/tin-tuc/[slug]/page.tsx:84-297,
          thay biến `related` thành `relatedPosts` … */}
    </div>
  );
}
```

- [ ] **Step 2: Thay chỗ gọi `renderBody` bằng pipeline dùng chung**

Trong `PostDetailView.tsx`, tìm khối đang bọc nội dung bài (nguyên bản là `app/tin-tuc/[slug]/page.tsx:151-152`):

```tsx
            <div className="space-y-5 text-[15px]">
              {post.body ? renderBody(post.body) : (
```

Thay bằng:

```tsx
            {post.body ? (
              <MarkdownBlocks blocks={parseMarkdownBlocks(post.body)} variant="article" />
            ) : (
```

Lưu ý: bỏ luôn thẻ `<div className="space-y-5 text-[15px]">` bọc ngoài, vì biến thể `article` của `MarkdownBlocks` đã tự sinh đúng div đó (Task 4, Step 1). Sửa thẻ đóng `</div>` tương ứng cho khớp.

- [ ] **Step 3: Xoá hàm `renderBody`**

Không chuyển hàm `renderBody` (`app/tin-tuc/[slug]/page.tsx:36-73`) sang component mới — xoá hẳn. Đây là bộ render trùng lặp mà cả lát 0 sinh ra để loại bỏ.

- [ ] **Step 4: Rút gọn trang thành wrapper mỏng**

Thay toàn bộ `app/tin-tuc/[slug]/page.tsx` bằng:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPosts } from "@/lib/loadData";
import PostDetailView from "@/components/PostDetailView";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = loadPosts().find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.hero_image
      ? { images: [{ url: post.hero_image }] }
      : undefined,
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const allPosts = loadPosts();
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return <PostDetailView post={post} relatedPosts={related} />;
}
```

- [ ] **Step 5: Build**

Run: `pnpm build`
Expected: `✓ Compiled successfully`, 52 trang, không lỗi TypeScript, không cảnh báo eslint mới.

- [ ] **Step 6: Commit**

```bash
git add components/PostDetailView.tsx app/tin-tuc/
git commit -m "refactor(tin-tuc): tách PostDetailView, dùng pipeline markdown dùng chung"
```

---

### Task 6: Đối chiếu hồi quy 9 bài viết

**Files:** không sửa code. Đây là cổng chất lượng của cả lát 0.

**Tiêu chí đạt (spec §7.3):** khác biệt duy nhất được phép là chỗ `**đậm**` / `_nghiêng_` / `[link]()` trước đây hiện ra dấu thô thì nay hiện đúng định dạng. **Trích dẫn, tiêu đề, danh sách phải giống hệt.**

- [ ] **Step 1: Sinh bản mới và so với mốc**

```bash
pnpm build
diff -r .regression-baseline/tin-tuc out/tin-tuc > /tmp/tin-tuc.diff; echo "exit=$?"
wc -l < /tmp/tin-tuc.diff
```

- [ ] **Step 2: Đọc từng khác biệt**

```bash
head -100 /tmp/tin-tuc.diff
```

Với **mỗi** khác biệt, phân loại vào một trong hai nhóm:

- **Được phép:** `**x**` → `<strong class="font-bold text-navy-900">x</strong>`, `_x_` → `<em class="italic">x</em>`, `[x](url)` → thẻ `<a>` có `target="_blank"`.
- **Không được phép:** cấp thẻ heading đổi (`<h2>` → `<h3>`), class typography đổi, `<blockquote>` biến mất hoặc đổi class, danh sách đổi cấu trúc.

Gặp bất kỳ khác biệt nhóm hai → dừng, sửa Task 4 hoặc Task 5, làm lại từ Step 1.

- [ ] **Step 3: Xác nhận trích dẫn còn nguyên trên cả 9 bài**

```bash
grep -c "blockquote" .regression-baseline/tin-tuc/*/index.html | sort
grep -c "blockquote" out/tin-tuc/*/index.html | sort
```

Expected: hai danh sách **giống hệt nhau**. Đây là bằng chứng trực tiếp cho lỗi nêu ở spec §4(b).

- [ ] **Step 4: Xác nhận lỗi dấu sao đã hết**

```bash
grep -o "\*\*[^*]*\*\*" out/tin-tuc/*/index.html | head
```

Expected: **không có kết quả** — không còn dấu `**` lọt ra HTML.

- [ ] **Step 5: Xác nhận trang dự án không đổi**

```bash
diff -r .regression-baseline/du-an out/du-an; echo "exit=$?"
```

Expected: `exit=0`, **không một khác biệt nào**. `MarkdownBlocks` dùng chung cho cả hai trang, nên đây là bằng chứng prop `variant` mặc định thật sự giữ nguyên hành vi cũ.

- [ ] **Step 6: Kiểm tra mắt thường**

```bash
pnpm dev
```

Mở `http://localhost:3001/tin-tuc/dau-tu-bds-bien-vung-tau` và một trang dự án bất kỳ. Xác nhận: trích dẫn có viền vàng bên trái, tiêu đề trong bài đúng cỡ lớn, danh sách có chấm tròn vàng, chữ đậm hiện đậm chứ không hiện dấu sao.

- [ ] **Step 7: Chạy toàn bộ test lần cuối**

Run: `node --test lib/*.test.mjs`
Expected: PASS toàn bộ.

- [ ] **Step 8: Dọn thư mục mốc**

```bash
rm -rf .regression-baseline
```

---

## Self-Review

**Spec coverage (§7 của spec):**

| Yêu cầu spec | Task |
|---|---|
| §7.1 thêm quote vào `lib/markdown.mjs` | Task 2 |
| §7.1 thêm quote vào `MarkdownBlocks.tsx`, giữ nguyên class Tailwind cũ | Task 4 |
| §7.1 thêm blockquote vào `BLOCK_RE` và cả hai chiều chuyển đổi | Task 3 |
| §7.2 tạo `components/PostDetailView.tsx` | Task 5 |
| §7.2 thay `renderBody()` bằng `parseMarkdownBlocks()` + `MarkdownBlocks` | Task 5 Step 2-3 |
| §7.3 hồi quy 9 bài, chỉ cho phép khác ở inline formatting | Task 6 |
| §13 test khứ hồi hợp đồng định dạng | Task 3 Step 1 |
| §13 test chống nuốt thẻ ngoài hợp đồng | Task 3 Step 1 |
| Thứ tự bắt buộc 7.1 → 7.2 | Task 2,3,4 đứng trước Task 5 |

**Phát sinh so với spec:** spec §7.2 giả định thay thẳng `renderBody` bằng `MarkdownBlocks` là đủ. Thực tế `MarkdownBlocks` hạ cấp `h2`→`<h3>` (vì phục vụ `ProjectDetailView`), nên thay thẳng sẽ tụt cấp heading và đổi typography của 9 bài. Plan giải quyết bằng prop `variant` (Task 4) — **cần cập nhật lại spec §7.2 sau khi lát 0 xong.**

**Type consistency:** `{ type: "quote"; inline: MdInline[] }` dùng thống nhất ở Task 2 (parser + d.ts), Task 3 (`markdownToHtml`), Task 4 (render). `variant?: "section" | "article"` khai báo ở Task 4, dùng ở Task 5. `PostDetailView({ post, relatedPosts })` khai báo ở Task 5 Step 1, dùng ở Step 4.

**Placeholder scan:** không có TBD/TODO. Chỗ duy nhất không chép code đầy đủ là Task 5 Step 1 (chuyển ~210 dòng JSX nguyên văn) — đã chỉ rõ dải dòng nguồn (84-297), tên biến phải đổi (`related` → `relatedPosts`), và danh sách import cần mang theo.
