# Vỏ dashboard, bộ soạn thảo dùng chung, và Tin tức (Lát 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng vỏ điều hướng cho `/dashboard`, nâng cấp bộ soạn thảo dùng chung (toolbar đúng
hợp đồng định dạng + điều hướng form dài), và đưa Tin tức (`data/posts/*.md`) vào quản trị được
trong dashboard — dùng đúng pattern đã chứng minh ở Dự án.

**Architecture:** Backend (`scripts/tg-bot/api/`, chạy PM2 trên VPS) mirror `project-store.mjs`
thành `post-store.mjs`, thêm 2 route REST mới, tái dùng nguyên `github-commit.mjs`/`undo.mjs`.
Frontend (Next.js static export) thêm 2 route `/dashboard/tin-tuc/*`, mirror
`DashboardProjectEditor.tsx`/`ProjectForm.tsx` thành bản cho bài viết, và nâng cấp
`RichTextEditor.tsx` + thêm `FormNav.tsx` ở tầng dùng chung để cả Dự án lẫn Tin tức cùng hưởng.

**Tech Stack:** Next.js 16 App Router (static export), TypeScript, TipTap, Node.js `node:http`
(backend, không dùng Express), `node:test` + `node:assert/strict`.

**Spec:** `docs/superpowers/specs/2026-08-20-dashboard-shell-and-posts-design.md` (§8, §9, §10, §11)

## Global Constraints

- **Không thêm npm dependency mới** (frontend lẫn backend).
- **Hợp đồng định dạng đúng 10 cấu trúc** (spec §5): đoạn văn, `## `, `### `, `- `, `1. `, `> `,
  `![]()`, `**đậm**`, `_nghiêng_`, `[link](url)`. Toolbar không được có nút nào ngoài danh sách.
- **Một lần Lưu = một commit** (bất biến từ spec dashboard gốc `2026-07-22-dashboard-vps-api.md`).
  Backend không được gọi `putFiles` quá 1 lần cho mỗi request `/save`.
- **Không viết lại logic Git** — mọi thao tác ghi phải qua `getFile`/`putFiles`
  (`scripts/tg-bot/engine/github-commit.mjs`) và `recordUndo`/`takeUndo`
  (`scripts/tg-bot/engine/undo.mjs`), y hệt cách `project-store.mjs` đã làm.
- **Tiếng Việt** cho mọi chuỗi hiển thị người dùng và thông báo lỗi API (mirror style hiện có).
- Test backend: `node --test scripts/tg-bot/api/*.test.mjs`. Test frontend markdown: `node --test lib/*.test.mjs`.
- Build frontend: `pnpm build` (Next.js static export, `output: "export"`).
- **Hai pipeline deploy độc lập:** thay đổi trong `scripts/tg-bot/**` deploy qua
  `deploy-bot.yml` (SSH + PM2 restart trên VPS) khi push lên `main`; thay đổi trong
  `app/`, `components/`, `lib/` deploy qua `deploy.yml` (build + FTP DirectAdmin) khi push lên
  `main`. Không cần thao tác tay — cả hai tự chạy khi push, nhưng **tách task theo đúng ranh
  giới file để mỗi task có thể review độc lập theo đúng pipeline nó thuộc về.**

---

## File Structure

| File | Vai trò |
|---|---|
| `scripts/tg-bot/api/frontmatter.mjs` | Parse + serialize frontmatter Markdown (mirror `lib/loadData.ts` chiều đọc, thêm chiều ghi) |
| `scripts/tg-bot/api/post-store.mjs` | Load/save/undo cho bài viết — mirror `project-store.mjs` |
| `scripts/tg-bot/api/server.mjs` | Thêm route `GET /me`, `GET /posts/:slug`, `POST /posts/:slug/save` |
| `lib/dashboard-api.mjs` | Thêm `getDashboardPost`/`saveDashboardPost`, mở rộng error-gating sang `/posts/` |
| `components/dashboard/RichTextEditor.tsx` | Toolbar đúng 10 cấu trúc + nút trích dẫn, sticky, style khớp `MarkdownBlocks` |
| `components/dashboard/FormNav.tsx` | Thanh điều hướng section dùng chung — mirror `ProjectAnchorNav.tsx` |
| `components/dashboard/PostForm.tsx` | Form 8 field cho bài viết |
| `components/dashboard/DashboardPostEditor.tsx` | Load/save/undo/preview — mirror `DashboardProjectEditor.tsx` |
| `app/dashboard/tin-tuc/page.tsx` | Danh sách bài viết |
| `app/dashboard/tin-tuc/[slug]/page.tsx` | Trang sửa |
| `app/dashboard/layout.tsx` | Vỏ chung: sidebar + gate đăng nhập một chỗ |
| `app/dashboard/page.tsx` | Trang chủ dashboard |
| `components/dashboard/ProjectForm.tsx` | Bọc `FormNav`, chuyển 3 field text sang `RichTextEditor` |
| `lib/data.ts` | Xoá `Post.content`/`PostBlock` (di sản chết, đã xác minh ở lát 0) |

---

### Task 1: Frontmatter parse + serialize (backend)

**Files:**
- Create: `scripts/tg-bot/api/frontmatter.mjs`
- Test: `scripts/tg-bot/api/frontmatter.test.mjs`

**Interfaces:**
- Produces: `parseFrontmatter(raw: string): { meta: Record<string,string>, body: string }`,
  `serializeFrontmatter(meta: Record<string,string>, body: string): string`. Task 2 dùng cả hai.

Mirror `parseLine`/`parseFrontmatter` trong `lib/loadData.ts:16-34`, viết lại thành `.mjs` (backend
không có TypeScript), và thêm chiều ghi mà `lib/loadData.ts` không có.

Định dạng thật của file nguồn (`data/posts/dau-tu-bds-bien-vung-tau.md`):
```
---
slug: dau-tu-bds-bien-vung-tau
title: "Đầu tư BĐS biển Vũng Tàu: Những điều cần biết trước khi xuống tiền"
date: 2026-05-15
category: Đầu tư
readTime: "7 phút đọc"
excerpt: "BĐS biển Vũng Tàu đang thu hút nhiều nhà đầu tư..."
hero_image: "https://images.unsplash.com/..."
related_projects: "salacia-villas-phu-my, the-quay-phuoc-hai"
---

Nội dung...
```

- [ ] **Step 1: Viết test thất bại**

```js
// scripts/tg-bot/api/frontmatter.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter.mjs";

test("parseFrontmatter tách đúng meta và body", () => {
  const raw = [
    "---",
    "slug: hello-world",
    'title: "Xin chào"',
    "date: 2026-05-15",
    "---",
    "",
    "Nội dung dòng 1.",
    "",
    "## Tiêu đề",
  ].join("\n");
  const { meta, body } = parseFrontmatter(raw);
  assert.equal(meta.slug, "hello-world");
  assert.equal(meta.title, "Xin chào");
  assert.equal(meta.date, "2026-05-15");
  assert.equal(body, "Nội dung dòng 1.\n\n## Tiêu đề");
});

test("parseFrontmatter xử lý CRLF", () => {
  const raw = '---\r\nslug: x\r\ntitle: "Y"\r\n---\r\n\r\nBody CRLF.';
  const { meta, body } = parseFrontmatter(raw);
  assert.equal(meta.slug, "x");
  assert.equal(meta.title, "Y");
  assert.equal(body, "Body CRLF.");
});

test("parseFrontmatter — không có frontmatter thì meta rỗng, body là toàn bộ nội dung", () => {
  const { meta, body } = parseFrontmatter("Chỉ có nội dung, không có ---");
  assert.deepEqual(meta, {});
  assert.equal(body, "Chỉ có nội dung, không có ---");
});

test("serializeFrontmatter sinh đúng định dạng, key có khoảng trắng/dấu ngoặc kép thì bọc quote", () => {
  const out = serializeFrontmatter(
    { slug: "hello-world", title: "Xin chào", date: "2026-05-15", category: "Đầu tư" },
    "Nội dung dòng 1.\n\n## Tiêu đề"
  );
  assert.equal(
    out,
    [
      "---",
      "slug: hello-world",
      'title: "Xin chào"',
      "date: 2026-05-15",
      "category: Đầu tư",
      "---",
      "",
      "Nội dung dòng 1.",
      "",
      "## Tiêu đề",
    ].join("\n") + "\n"
  );
});

test("khứ hồi parse rồi serialize giữ nguyên nội dung", () => {
  const original = [
    "---",
    "slug: dau-tu-bds-bien-vung-tau",
    'title: "Đầu tư BĐS biển Vũng Tàu"',
    "date: 2026-05-15",
    "category: Đầu tư",
    'readTime: "7 phút đọc"',
    'excerpt: "Mô tả ngắn."',
    "---",
    "",
    "Cao tốc Biên Hòa — Vũng Tàu.",
    "",
    "## Tiềm năng",
    "",
    "> Trích dẫn.",
  ].join("\n") + "\n";
  const { meta, body } = parseFrontmatter(original);
  const roundtripped = serializeFrontmatter(meta, body);
  assert.equal(roundtripped, original);
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `node --test scripts/tg-bot/api/frontmatter.test.mjs`
Expected: FAIL — `Cannot find module './frontmatter.mjs'`.

- [ ] **Step 3: Viết `frontmatter.mjs`**

```js
// scripts/tg-bot/api/frontmatter.mjs
// Parse/serialize frontmatter Markdown cho bài viết. Chiều đọc mirror
// lib/loadData.ts (TypeScript, chạy ở build-time Next.js) — bản .mjs này
// chạy ở backend API (Node thuần, không TypeScript). Thêm chiều ghi.

// Key cần bọc "..." nếu giá trị có dấu hai chấm, dấu ngoặc kép, hoặc bắt đầu/kết
// thúc bằng khoảng trắng — để không phá cấu trúc dòng "key: value" khi đọc lại.
const NEEDS_QUOTE_RE = /:|"|^\s|\s$/;

function parseLine(line) {
  const idx = line.indexOf(": ");
  if (idx === -1) return null;
  const key = line.slice(0, idx).trim();
  const raw = line.slice(idx + 2).trim();
  const val = raw.replace(/^["']|["']$/g, "");
  return [key, val];
}

export function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: normalized.trim() };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const pair = parseLine(line);
    if (pair) meta[pair[0]] = pair[1];
  }
  return { meta, body: match[2].trim() };
}

export function serializeFrontmatter(meta, body) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === null || value === "") continue;
    const v = String(value);
    lines.push(NEEDS_QUOTE_RE.test(v) ? `${key}: "${v}"` : `${key}: ${v}`);
  }
  lines.push("---", "", body);
  return lines.join("\n") + "\n";
}
```

- [ ] **Step 4: Chạy lại test**

Run: `node --test scripts/tg-bot/api/frontmatter.test.mjs`
Expected: PASS toàn bộ 5 test.

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/api/frontmatter.mjs scripts/tg-bot/api/frontmatter.test.mjs
git commit -m "feat(dashboard-api): parse/serialize frontmatter Markdown cho bài viết"
```

---

### Task 2: `post-store.mjs` — load/save/undo cho bài viết

**Files:**
- Create: `scripts/tg-bot/api/post-store.mjs`
- Test: `scripts/tg-bot/api/post-store.test.mjs`

**Interfaces:**
- Consumes: `parseFrontmatter`/`serializeFrontmatter` (Task 1), `getFile`/`putFiles`
  (`scripts/tg-bot/engine/github-commit.mjs`, đã có), `recordUndo`/`takeUndo`/`toCommitFiles`
  (`scripts/tg-bot/engine/undo.mjs`, đã có).
- Produces: `loadPost(deps, slug): Promise<{meta, body}>`, `savePost(deps, slug, patch):
  Promise<{commitSha, undoKey}>`, `undoLastPostSave(deps, undoKey): Promise<{commitSha}>`.
  Task 3 gọi cả ba hàm này.

`patch` có shape: `{ fields?: Record<string,string>, body?: string }` — đơn giản hơn patch của
project vì bài viết không có ảnh gallery hay hidden_sections.

- [ ] **Step 1: Viết test thất bại**

```js
// scripts/tg-bot/api/post-store.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPost, savePost, undoLastPostSave } from "./post-store.mjs";

const SAMPLE_RAW = [
  "---",
  "slug: bai-mau",
  'title: "Tiêu đề gốc"',
  "date: 2026-05-15",
  "category: Đầu tư",
  "---",
  "",
  "Nội dung gốc.",
].join("\n") + "\n";

function fakeDeps({ putFilesCalls = [] } = {}) {
  return {
    repo: "owner/repo",
    branch: "main",
    pat: "fake-pat",
    getFile: async () => ({ content: SAMPLE_RAW, sha: "abc123" }),
    putFiles: async (repo, branch, files, message) => {
      putFilesCalls.push({ files, message });
      return { commitSha: "deadbeef" };
    },
  };
}

test("loadPost trả về meta + body đã parse", async () => {
  const post = await loadPost(fakeDeps(), "bai-mau");
  assert.equal(post.meta.title, "Tiêu đề gốc");
  assert.equal(post.body, "Nội dung gốc.");
});

test("loadPost — slug không hợp lệ ném lỗi VALIDATION", async () => {
  await assert.rejects(() => loadPost(fakeDeps(), "../etc/passwd"), (err) => err.code === "VALIDATION");
});

test("savePost — sửa field và body, gọi putFiles đúng 1 lần với nội dung đã merge", async () => {
  const calls = [];
  const deps = fakeDeps({ putFilesCalls: calls });
  const result = await savePost(deps, "bai-mau", {
    fields: { title: "Tiêu đề mới" },
    body: "Nội dung mới.",
  });
  assert.equal(calls.length, 1, "phải đúng 1 lần putFiles — một lần Lưu = một commit");
  assert.equal(calls[0].files.length, 1);
  assert.equal(calls[0].files[0].path, "data/posts/bai-mau.md");
  const savedRaw = calls[0].files[0].content;
  assert.ok(savedRaw.includes('title: "Tiêu đề mới"'));
  assert.ok(savedRaw.includes("Nội dung mới."));
  assert.ok(!savedRaw.includes("Tiêu đề gốc"));
  assert.equal(result.commitSha, "deadbeef");
  assert.equal(typeof result.undoKey, "string");
});

test("savePost — không được sửa slug", async () => {
  await assert.rejects(
    () => savePost(fakeDeps(), "bai-mau", { fields: { slug: "slug-khac" } }),
    (err) => err.code === "VALIDATION"
  );
});

test("savePost — không gửi field/body nào thì giữ nguyên nội dung cũ", async () => {
  const calls = [];
  const result = await savePost(fakeDeps({ putFilesCalls: calls }), "bai-mau", {});
  assert.ok(calls[0].files[0].content.includes("Tiêu đề gốc"));
  assert.ok(calls[0].files[0].content.includes("Nội dung gốc."));
});

test("undoLastPostSave — khôi phục đúng nội dung trước khi lưu", async () => {
  const calls = [];
  const deps = fakeDeps({ putFilesCalls: calls });
  const { undoKey } = await savePost(deps, "bai-mau", { fields: { title: "Mới" } });
  const undoResult = await undoLastPostSave(deps, undoKey);
  assert.equal(undoResult.commitSha, "deadbeef");
  assert.equal(calls.length, 2, "save + undo = 2 lần gọi putFiles, mỗi lần vẫn đúng 1 commit");
  assert.ok(calls[1].files[0].content.includes(SAMPLE_RAW.trim()) || calls[1].files[0].content === SAMPLE_RAW);
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `node --test scripts/tg-bot/api/post-store.test.mjs`
Expected: FAIL — `Cannot find module './post-store.mjs'`.

- [ ] **Step 3: Viết `post-store.mjs`**

```js
// scripts/tg-bot/api/post-store.mjs
// Kho dữ liệu bài viết cho dashboard: load / save (gộp 1 commit) / undo.
// Mirror project-store.mjs — dùng lại đúng getFile/putFiles + recordUndo/takeUndo,
// không viết lại logic Git.
import { getFile, putFiles } from "../engine/github-commit.mjs";
import { recordUndo, takeUndo, toCommitFiles } from "../engine/undo.mjs";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter.mjs";

const UNDO_CHAT_ID = "dashboard";
const SLUG_RE = /^[a-z0-9-]+$/;

function filePath(slug) {
  return `data/posts/${slug}.md`;
}

function assertValidSlug(slug) {
  if (!SLUG_RE.test(slug)) {
    const err = new Error("Slug không hợp lệ");
    err.code = "VALIDATION";
    throw err;
  }
}

export async function loadPost(deps, slug) {
  assertValidSlug(slug);
  const { content } = await (deps.getFile ?? getFile)(deps.repo, deps.branch, filePath(slug), deps.pat);
  return parseFrontmatter(content);
}

export async function savePost(deps, slug, patch) {
  assertValidSlug(slug);
  const { content } = await (deps.getFile ?? getFile)(deps.repo, deps.branch, filePath(slug), deps.pat);
  const { meta, body } = parseFrontmatter(content);

  if (patch.fields && "slug" in patch.fields) {
    const err = new Error("Không được sửa slug");
    err.code = "VALIDATION";
    throw err;
  }

  const nextMeta = patch.fields ? { ...meta, ...patch.fields } : meta;
  const nextBody = patch.body !== undefined ? patch.body : body;

  const files = [
    { path: filePath(slug), content: serializeFrontmatter(nextMeta, nextBody), binary: false },
  ];

  const { commitSha } = await (deps.putFiles ?? putFiles)(
    deps.repo, deps.branch, files, `content: dashboard save post ${slug}`, deps.pat
  );

  const undoKey = recordUndo(UNDO_CHAT_ID, `dashboard save post ${slug}`, [
    { path: filePath(slug), prevContent: content },
  ]);

  return { commitSha, undoKey };
}

export async function undoLastPostSave(deps, undoKey) {
  const entry = takeUndo(UNDO_CHAT_ID, undoKey);
  if (!entry) throw new Error("expired");

  const { commitSha } = await (deps.putFiles ?? putFiles)(
    deps.repo, deps.branch, toCommitFiles(entry), "content: undo dashboard save post", deps.pat
  );

  return { commitSha };
}
```

- [ ] **Step 4: Chạy lại test**

Run: `node --test scripts/tg-bot/api/post-store.test.mjs`
Expected: PASS toàn bộ 6 test.

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/api/post-store.mjs scripts/tg-bot/api/post-store.test.mjs
git commit -m "feat(dashboard-api): load/save/undo cho bài viết (post-store.mjs)"
```

---

### Task 3: Route backend — `GET /me`, `GET /posts/:slug`, `POST /posts/:slug/save`

**Files:**
- Modify: `scripts/tg-bot/api/server.mjs`

**Interfaces:**
- Consumes: `loadPost`/`savePost`/`undoLastPostSave` (Task 2).
- Produces: `GET /me` → `200 {ok:true}` nếu có session hợp lệ, `401` nếu không (dùng cho
  Task 9 — layout gate đăng nhập một chỗ). `GET /posts/:slug` → `200 {post:{meta,body}}` /
  `404`. `POST /posts/:slug/save` → `200 {commitSha, undoKey}` / `400` (VALIDATION) / `502`.
  `POST /undo` đã tổng quát theo `undoKey`, dùng chung cho cả project lẫn post, không cần sửa.

**Không có bước TDD riêng cho task này** — `server.mjs` là HTTP wiring thuần (route → gọi
hàm store), logic thật đã test ở Task 2. Verify bằng cách chạy server thật + `curl` (Step 4-5).

- [ ] **Step 1: Đọc lại đúng vị trí chèn**

Mở `scripts/tg-bot/api/server.mjs`. Các route hiện có nằm trong khối `try` của `http.createServer`,
sau dòng `if (!requireSession(req)) return json(res, 401, { error: "Chưa đăng nhập" });` (dòng 102)
và trước route `GET /projects/:slug` (dòng 104).

- [ ] **Step 2: Import `post-store.mjs`**

Sửa dòng import ở đầu file, từ:
```js
import { loadProject, saveProject, undoLastSave } from "./project-store.mjs";
```
thành:
```js
import { loadProject, saveProject, undoLastSave } from "./project-store.mjs";
import { loadPost, savePost, undoLastPostSave } from "./post-store.mjs";
```

- [ ] **Step 3: Thêm route `GET /me`**

Route này đặt **trước** dòng `requireSession` check (dòng 102) vì bản thân nó CHÍNH LÀ cách kiểm
tra session — không phải route cần bảo vệ bởi check đó. Chèn ngay sau route `contact-lead`
(kết thúc ở dòng 100, trước dòng 102):

```js
    if (req.method === "GET" && parts[0] === "me") {
      return requireSession(req) ? json(res, 200, { ok: true }) : json(res, 401, { error: "Chưa đăng nhập" });
    }

```

- [ ] **Step 4: Thêm route `GET /posts/:slug` và `POST /posts/:slug/save`**

Chèn ngay sau route `POST /projects/:slug/save` (kết thúc ở dòng 124, trước route `POST /undo`
ở dòng 126) — cùng cấu trúc, cùng mã lỗi:

```js
    if (req.method === "GET" && parts[0] === "posts" && parts.length === 2) {
      const slug = parts[1];
      try {
        const post = await loadPost(deps, slug);
        return json(res, 200, { post });
      } catch {
        return json(res, 404, { error: `Không tìm thấy: ${slug}` });
      }
    }

    if (req.method === "POST" && parts[0] === "posts" && parts.length === 3 && parts[2] === "save") {
      const slug = parts[1];
      const patch = await readJsonBody(req);
      try {
        const result = await savePost(deps, slug, patch);
        return json(res, 200, result);
      } catch (e) {
        const status = e.code === "VALIDATION" ? 400 : 502;
        return json(res, status, { error: e.message });
      }
    }

```

- [ ] **Step 5: `POST /undo` đã tổng quát — xác nhận không cần sửa**

Đọc route `POST /undo` hiện tại (dòng 126-134 trước khi chèn) — nó gọi `undoLastSave(deps,
undoKey)` từ `project-store.mjs`, không phân biệt loại nội dung theo tên hàm mà theo `undoKey`
đã được `recordUndo` gắn `chatId="dashboard"` từ trước. **Vấn đề:** route hiện tại hard-code gọi
`undoLastSave` (chỉ hiểu project), không phải `undoLastPostSave`. Vì `undoKey` không tự chứa
thông tin "đây là loại nội dung gì", route `/undo` cần thử cả hai và trả về kết quả của cái nào
thành công. Sửa route `POST /undo` (nguyên bản dòng 126-134) thành:

```js
    if (req.method === "POST" && parts[0] === "undo") {
      const { undoKey } = await readJsonBody(req);
      try {
        const result = await undoLastSave(deps, undoKey);
        return json(res, 200, result);
      } catch {
        try {
          const result = await undoLastPostSave(deps, undoKey);
          return json(res, 200, result);
        } catch {
          return json(res, 410, { error: "Hết hạn hoặc đã hoàn tác" });
        }
      }
    }
```

Lý do thử `undoLastSave` (project) trước: `takeUndo` xoá entry khỏi bộ nhớ ngay khi gọi thành
công (one-shot). Nếu gọi nhầm hàm, `takeUndo` bên trong hàm đó sẽ không tìm thấy key (vì key
được lưu chung một kho theo `chatId="dashboard"`, không phân loại) và ném lỗi `"expired"` — an
toàn để thử hàm còn lại, không có tác dụng phụ khi thử sai.

- [ ] **Step 6: Verify bằng curl (thủ công, không phải test tự động)**

Chạy server cục bộ với biến môi trường giả:
```bash
cd scripts/tg-bot
DASHBOARD_PASSWORD=test123 GITHUB_PAT=fake node api/server.mjs &
sleep 1
curl -s http://localhost:4001/me
# Expected: {"error":"Chưa đăng nhập"} với HTTP 401
curl -s -c /tmp/cookies.txt -X POST http://localhost:4001/login -H "Content-Type: application/json" -d '{"password":"test123"}'
curl -s -b /tmp/cookies.txt http://localhost:4001/me
# Expected: {"ok":true} với HTTP 200
kill %1
```
Expected: hai kết quả đúng như comment. `/posts/:slug` sẽ trả 502 (vì `GITHUB_PAT=fake` không
gọi được GitHub thật) — đó là hành vi đúng ở bước verify thủ công này, không phải lỗi; xác nhận
route được match đúng (không phải 404 "Không có route này") là đủ.

- [ ] **Step 7: Commit**

```bash
git add scripts/tg-bot/api/server.mjs
git commit -m "feat(dashboard-api): route GET /me, GET+POST /posts/:slug, undo dùng chung 2 loại nội dung"
```

---

### Task 4: `lib/dashboard-api.mjs` — client cho bài viết + `/me`

**Files:**
- Modify: `lib/dashboard-api.mjs`

**Interfaces:**
- Consumes: route từ Task 3.
- Produces: `checkDashboardSession(baseUrl): Promise<boolean>`, `getDashboardPost(baseUrl,
  slug): Promise<{post}>`, `saveDashboardPost(baseUrl, slug, patch): Promise<{commitSha,
  undoKey}>`. Task 7 và Task 9 dùng các hàm này.

- [ ] **Step 1: Mở rộng error-gating trong `request()`**

Hàm `request()` hiện tại (đầu file) chỉ map lỗi 401/404 cho path bắt đầu `/projects/`. Sửa 2
điều kiện đó để cùng áp dụng cho `/posts/`:

```js
    if ((path.startsWith("/projects/") || path.startsWith("/posts/")) && method === "GET" && res.status === 401) {
      throw new Error("unauthorized");
    }
    if ((path.startsWith("/projects/") || path.startsWith("/posts/")) && method === "GET" && res.status === 404) {
      throw new Error("not_found");
    }
```

- [ ] **Step 2: Thêm hàm cho bài viết + session check**

Thêm vào cuối file:

```js
export async function checkDashboardSession(baseUrl) {
  try {
    await request(baseUrl, "/me");
    return true;
  } catch {
    return false;
  }
}

export async function getDashboardPost(baseUrl, slug) {
  return request(baseUrl, `/posts/${slug}`);
}

export async function saveDashboardPost(baseUrl, slug, patch) {
  return request(baseUrl, `/posts/${slug}/save`, { method: "POST", body: patch });
}
```

`checkDashboardSession` nuốt lỗi thành `boolean` thay vì throw — vì Task 9 (layout) chỉ cần biết
có/không, không cần phân biệt loại lỗi như các trang editor.

- [ ] **Step 3: Kiểm tra không có test tự động cho file này**

`lib/dashboard-api.mjs` hiện không có file test riêng (xác nhận: không có
`lib/dashboard-api.test.mjs`... — **nếu có, đọc trước khi sửa, đừng giả định**). Nếu không có,
bước này không cần chạy test; xác nhận bằng `pnpm build` (không có lỗi TypeScript import) ở
Task 9 khi file này được dùng thật.

- [ ] **Step 4: Commit**

```bash
git add lib/dashboard-api.mjs
git commit -m "feat(dashboard): thêm client cho bài viết + kiểm tra session dùng chung"
```

---

### Task 5: Nâng cấp `RichTextEditor.tsx` — toolbar đúng hợp đồng, sticky, style khớp trang thật

**Files:**
- Modify: `components/dashboard/RichTextEditor.tsx`

**Interfaces:**
- Consumes: `markdownToHtml`/`htmlToMarkdown` (`lib/markdown-html.mjs`, đã hỗ trợ trích dẫn từ
  lát 0).
- Produces: giữ nguyên interface `{ value: string; onChange: (md: string) => void;
  onImageInsert?: (dataUrl: string) => void }` — không đổi, để `ProjectForm.tsx` (Task 10) và
  `PostForm.tsx` (Task 7) không phải sửa cách gọi.

- [ ] **Step 1: Thay toàn bộ nội dung file**

```tsx
// components/dashboard/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef } from "react";
import { markdownToHtml, htmlToMarkdown } from "@/lib/markdown-html.mjs";

type Props = {
  value: string;
  onChange: (md: string) => void;
  onImageInsert?: (dataUrl: string) => void;
};

function ToolbarButton({ onClick, active, label, children }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-navy-900 text-white" : "bg-surface text-navy-700 hover:bg-navy-50"
      } border border-border-soft`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, onImageInsert }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmittedMd = useRef(value);

  const editor = useEditor({
    extensions: [
      // Chỉ bật đúng 10 cấu trúc của hợp đồng định dạng (spec §5). StarterKit mặc định
      // còn có code, codeBlock, horizontalRule, strike, hardBreak — tắt hết, vì BLOCK_RE
      // (lib/markdown-html.mjs) không hiểu các thẻ đó và sẽ nuốt mất nội dung khi lưu.
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        hardBreak: false,
      }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: markdownToHtml(value),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const md = htmlToMarkdown(editor.getHTML());
      lastEmittedMd.current = md;
      onChange(md);
    },
  });

  useEffect(() => {
    if (!editor || value === lastEmittedMd.current) return;
    editor.commands.setContent(markdownToHtml(value));
    lastEmittedMd.current = value;
  }, [value, editor]);

  if (!editor) return null;

  function insertImage() {
    fileInputRef.current?.click();
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      editor.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
      onImageInsert?.(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function setLink() {
    const url = window.prompt("Đường dẫn liên kết:");
    if (!url || !editor) return;
    editor.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="rounded-xl border border-border-soft bg-surface">
      <div className="sticky top-0 z-10 flex flex-wrap gap-1.5 rounded-t-xl border-b border-border-soft bg-surface p-2">
        <ToolbarButton label="Đậm" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton label="Nghiêng" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarButton>
        <ToolbarButton label="Tiêu đề H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton label="Tiêu đề H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <ToolbarButton label="Danh sách gạch đầu dòng" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
        <ToolbarButton label="Danh sách đánh số" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
        <ToolbarButton label="Trích dẫn" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;&rdquo;</ToolbarButton>
        <ToolbarButton label="Chèn liên kết" onClick={setLink}>Link</ToolbarButton>
        <ToolbarButton label="Chèn ảnh" onClick={insertImage}>Ảnh</ToolbarButton>
        <ToolbarButton label="Xoá định dạng" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>Xoá định dạng</ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChosen} />
      </div>
      <EditorContent
        editor={editor}
        className="max-w-none p-4 text-[15px] leading-[1.85] text-ink [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-navy-900 [&_h3]:mt-5 [&_h3]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gold-500 [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:bg-gold-50 [&_blockquote]:rounded-r-xl [&_blockquote]:italic [&_blockquote]:font-medium [&_blockquote]:text-navy-800"
      />
    </div>
  );
}
```

Class Tailwind của `h2`/`h3`/`blockquote` sao chép từ `components/MarkdownBlocks.tsx` biến thể
`article` (đã build ở lát 0) — đây chính là điều spec §9.1 gọi là "vùng soạn thảo style giống
hệt trang thật".

- [ ] **Step 2: Build kiểm tra TypeScript**

Run: `pnpm build`
Expected: `✓ Compiled successfully`, không lỗi TypeScript (đặc biệt kiểm tra
`StarterKit.configure` chấp nhận các key `code`/`codeBlock`/`horizontalRule`/`strike`/
`hardBreak` — nếu TypeScript báo lỗi type cho key nào, đó là dấu hiệu bản TipTap cài đặt dùng
tên option khác, dừng lại tra `node_modules/@tiptap/starter-kit/dist/starter-kit.d.ts` thay vì
đoán).

- [ ] **Step 3: Kiểm tra thủ công qua `pnpm dev`**

Mở `/dashboard/du-an/<slug-bất-kỳ>`, gõ thử trong ô mô tả: bấm nút Trích dẫn, gõ chữ, xác nhận
hiện viền vàng bên trái đúng style. Cuộn dài để xác nhận toolbar dính (sticky) đúng vị trí.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/RichTextEditor.tsx
git commit -m "feat(dashboard): nâng cấp RichTextEditor — toolbar đúng hợp đồng định dạng, sticky, style khớp trang thật"
```

---

### Task 6: `FormNav.tsx` — điều hướng section dùng chung

**Files:**
- Create: `components/dashboard/FormNav.tsx`

**Interfaces:**
- Produces: `<FormNav sections={{id: string, label: string}[]} />`. Task 7 (PostForm) và Task 10
  (ProjectForm) đều dùng component này với `id` khớp với `id` của mỗi `<section>` field-group
  tương ứng trong form.

- [ ] **Step 1: Viết component**

```tsx
// components/dashboard/FormNav.tsx
"use client";

import { useState, useEffect } from "react";

type Section = { id: string; label: string };

export default function FormNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id); },
        { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
      );
      o.observe(el);
      observers.push(o);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  function go(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: "smooth" });
  }

  return (
    <nav className="sticky top-0 z-20 -mx-1 mb-4 flex gap-1 overflow-x-auto rounded-xl border border-border-soft bg-surface p-1.5">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => go(id)}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            active === id ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
```

Đơn giản hơn `ProjectAnchorNav.tsx` (không có dropdown mobile riêng, không có CTA điện thoại) —
vì đây là màn hình soạn thảo nội bộ, không phải trang public cần tối ưu UX khách hàng.
`rootMargin` co hẹp hơn `ProjectAnchorNav` (`-10%/-80%` thay vì `-20%/-70%`) vì các section
trong form thường ngắn hơn section trên trang public, cần nhạy hơn khi xác định section đang
active.

- [ ] **Step 2: Build kiểm tra**

Run: `pnpm build`
Expected: `✓ Compiled successfully`, không lỗi (chưa nơi nào import component này nên chỉ cần
xác nhận file tự nó compile được — Task 7/10 mới thực sự dùng).

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/FormNav.tsx
git commit -m "feat(dashboard): thêm FormNav — điều hướng section dùng chung cho form dài"
```

---

### Task 7: `PostForm.tsx` + `DashboardPostEditor.tsx`

**Files:**
- Create: `components/dashboard/PostForm.tsx`
- Create: `components/dashboard/DashboardPostEditor.tsx`

**Interfaces:**
- Consumes: `RichTextEditor` (Task 5), `FormNav` (Task 6), `ImageField` (đã có,
  `components/dashboard/ImageField.tsx`), `getDashboardPost`/`saveDashboardPost`/
  `checkDashboardSession` (Task 4), `PostDetailView` (đã có từ lát 0,
  `components/PostDetailView.tsx`).
- Produces: `<DashboardPostEditor slug={string} />`. Task 8 (route `[slug]/page.tsx`) dùng
  component này.

**Kiểu dữ liệu:** backend trả `{ post: { meta: Record<string,string>, body: string } }` (khác
với project — project trả thẳng object đã parse JSON, post trả `meta`/`body` tách rời vì nguồn
là Markdown+frontmatter, không phải JSON thuần). `meta` có các key: `slug`, `title`, `date`,
`category`, `readTime`, `excerpt`, `hero_image`, `related_projects` (chuỗi phân tách bằng dấu
phẩy — xem `lib/loadData.ts:54`, không parse thành mảng ở tầng dashboard, giữ nguyên chuỗi).

- [ ] **Step 1: Viết `PostForm.tsx`**

```tsx
// components/dashboard/PostForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import ImageField from "@/components/dashboard/ImageField";
import FormNav from "@/components/dashboard/FormNav";

export type PostDraft = { meta: Record<string, string>; body: string };
export type PendingPostImage = { filename: string; base64: string };

type Props = {
  draft: PostDraft;
  onChange: (next: PostDraft) => void;
  onPendingImage: (img: PendingPostImage) => void;
};

const SECTIONS = [
  { id: "thong-tin-chung", label: "Thông tin chung" },
  { id: "noi-dung", label: "Nội dung bài viết" },
];

function FieldGroup({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4 rounded-2xl border border-border-soft bg-surface p-6 scroll-mt-20">
      <h2 className="text-base font-bold text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function PostForm({ draft, onChange, onPendingImage }: Props) {
  function setMeta(key: string, value: string) {
    onChange({ ...draft, meta: { ...draft.meta, [key]: value } });
  }

  return (
    <div className="space-y-6">
      <FormNav sections={SECTIONS} />

      <FieldGroup id="thong-tin-chung" title="Thông tin chung">
        <TextField label="Tiêu đề" value={draft.meta.title} onChange={(v) => setMeta("title", v)} />
        <TextField label="Slug URL" value={draft.meta.slug} onChange={(v) => setMeta("slug", v)} />
        <TextField label="Ngày đăng (YYYY-MM-DD)" value={draft.meta.date} onChange={(v) => setMeta("date", v)} />
        <TextField label="Chuyên mục" value={draft.meta.category} onChange={(v) => setMeta("category", v)} />
        <TextField label="Thời gian đọc" value={draft.meta.readTime} onChange={(v) => setMeta("readTime", v)} />
        <TextField label="Mô tả ngắn (excerpt)" value={draft.meta.excerpt} onChange={(v) => setMeta("excerpt", v)} />
        <ImageField
          label="Ảnh bìa"
          currentSrc={draft.meta.hero_image}
          onPick={(f) => onPendingImage({ filename: f.filename, base64: f.base64 })}
        />
      </FieldGroup>

      <FieldGroup id="noi-dung" title="Nội dung bài viết">
        <RichTextEditor value={draft.body} onChange={(md) => onChange({ ...draft, body: md })} />
      </FieldGroup>
    </div>
  );
}
```

**Lưu ý về ảnh bìa:** không giống `ImageField` trong `ProjectForm.tsx` (upload lên
`public/images/projects/{slug}/`), bài viết dùng URL ảnh ngoài (Unsplash, xem file mẫu) — xem
lại tất cả 9 file `data/posts/*.md` để xác nhận trước khi build Step 3, `hero_image` có thể
KHÔNG bao giờ được upload qua dashboard trong thực tế hiện tại, chỉ sửa URL tay qua `TextField`
thay vì `ImageField`. Nếu xác nhận đúng vậy, thay `ImageField` ở trên bằng
`<TextField label="URL ảnh bìa" value={draft.meta.hero_image} onChange={(v) => setMeta("hero_image", v)} />`
và bỏ `onPendingImage`/`PendingPostImage` khỏi toàn bộ Task 7 (đơn giản hoá `DashboardPostEditor.tsx`
tương ứng — bỏ `pendingImages` state và phần build patch cho ảnh). Đây là quyết định xác minh
được bằng dữ liệu thật, không phải đoán — kiểm tra trước khi viết code, không viết cả hai
đường rồi chọn sau.

- [ ] **Step 2: Viết `DashboardPostEditor.tsx`**

```tsx
// components/dashboard/DashboardPostEditor.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPost, saveDashboardPost, undoDashboardSave } from "@/lib/dashboard-api.mjs";
import PostForm, { type PostDraft } from "@/components/dashboard/PostForm";
import PostDetailView from "@/components/PostDetailView";
import { Button } from "@/components/ui/button";
import type { Post } from "@/lib/data";

const API_BASE = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || "https://api.1992land.com";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; original: PostDraft; draft: PostDraft };

function toPreviewPost(draft: PostDraft): Post {
  return {
    slug: draft.meta.slug ?? "",
    title: draft.meta.title ?? "",
    excerpt: draft.meta.excerpt ?? "",
    date: draft.meta.date ?? "",
    category: draft.meta.category ?? "",
    readTime: draft.meta.readTime ?? "",
    hero_image: draft.meta.hero_image || undefined,
    body: draft.body,
  };
}

export default function DashboardPostEditor({ slug }: { slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [saving, setSaving] = useState(false);
  const [lastUndoKey, setLastUndoKey] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const { post } = await getDashboardPost(API_BASE, slug);
      setState({ status: "ready", original: post, draft: post });
    } catch (e) {
      if (e instanceof Error && e.message === "unauthorized") {
        router.push(`/dashboard/login/?next=/dashboard/tin-tuc/${slug}/`);
        return;
      }
      setState({ status: "error", message: e instanceof Error ? e.message : "Lỗi tải dữ liệu" });
    }
  }, [slug, router]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === "loading") return <div className="p-8 text-navy-600">Đang tải...</div>;
  if (state.status === "error") return <div className="p-8 text-red-600">Lỗi: {state.message}</div>;

  const { draft } = state;

  async function onSave() {
    setSaving(true);
    setBanner(null);
    try {
      const { undoKey } = await saveDashboardPost(API_BASE, slug, { fields: draft.meta, body: draft.body });
      setLastUndoKey(undoKey);
      setBanner("Đã lưu. Web cập nhật sau khoảng 8 phút.");
      await load();
    } catch (e) {
      setBanner(`Lỗi khi lưu: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  async function onUndo() {
    if (!lastUndoKey) return;
    setSaving(true);
    setBanner(null);
    try {
      await undoDashboardSave(API_BASE, lastUndoKey);
      setLastUndoKey(null);
      setBanner("Đã hoàn tác lần lưu gần nhất.");
      await load();
    } catch (e) {
      setBanner(`Không thể hoàn tác: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border-soft bg-surface px-6 py-3">
        <div>
          <h1 className="text-lg font-bold text-navy-900">{draft.meta.title}</h1>
          {banner && <p className="text-sm text-navy-600">{banner}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!lastUndoKey || saving} onClick={onUndo}>
            Hoàn tác lần lưu gần nhất
          </Button>
          <Button disabled={saving} onClick={onSave}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
          <PostForm
            draft={draft}
            onChange={(next) => setState({ status: "ready", original: state.original, draft: next })}
            onPendingImage={() => {}}
          />
        </div>
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto rounded-2xl border border-border-soft bg-surface">
          <PostDetailView post={toPreviewPost(draft)} relatedPosts={[]} />
        </div>
      </div>
    </div>
  );
}
```

Mirror `DashboardProjectEditor.tsx` gần như nguyên vẹn: cùng cấu trúc `LoadState`, cùng luồng
`load`/`onSave`/`onUndo`, cùng bố cục 2 cột (form trái, preview phải). Khác biệt: `patch` gửi đi
có shape `{fields, body}` (khớp `post-store.mjs` ở Task 2) thay vì `{fields, descriptions,
images}`; không có `extractInlineImages`/`buildPatch`/`pendingImages` phức tạp như project vì
bài viết không có ảnh gallery.

**Nếu Step 1 xác nhận `hero_image` không upload qua dashboard** (dùng `TextField` thay
`ImageField`): bỏ tham số `onPendingImage` khỏi `<PostForm>` và khỏi chữ ký `PostForm` luôn (xoá
`PendingPostImage`, `onPendingImage` khỏi Task 7 Step 1 và Step 2 — component đơn giản hơn còn
lại).

- [ ] **Step 3: Build kiểm tra**

Run: `pnpm build`
Expected: `✓ Compiled successfully` — nhưng thất bại nếu không có gì gọi tới 2 file này (component
chưa dùng bởi route nào là bình thường, không phải lỗi; `pnpm build` chỉ cần compile qua được).
Nếu build báo "unused" gì đó, đó là warning không chặn build, bỏ qua ở bước này (Task 8 sẽ dùng
thật).

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/PostForm.tsx components/dashboard/DashboardPostEditor.tsx
git commit -m "feat(dashboard): PostForm + DashboardPostEditor cho Tin tức"
```

---

### Task 8: Route `/dashboard/tin-tuc/*`

**Files:**
- Create: `app/dashboard/tin-tuc/page.tsx`
- Create: `app/dashboard/tin-tuc/[slug]/page.tsx`

**Interfaces:**
- Consumes: `DashboardPostEditor` (Task 7), `loadPosts` (`lib/loadData.ts`, đã có).

- [ ] **Step 1: Trang danh sách**

```tsx
// app/dashboard/tin-tuc/page.tsx
import Link from "next/link";
import { loadPosts } from "@/lib/loadData";

export default function DashboardPostListPage() {
  const posts = loadPosts();
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-xl font-bold text-navy-900">Chọn bài viết để sửa</h1>
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/dashboard/tin-tuc/${p.slug}/`} className="text-navy-700 underline hover:text-gold-600">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Mirror nguyên văn `app/dashboard/du-an/page.tsx`, chỉ đổi `loadProjects`→`loadPosts`,
`p.title` giữ nguyên (`Post` và `Project` đều có field `title`), đường dẫn
`/dashboard/du-an/`→`/dashboard/tin-tuc/`.

- [ ] **Step 2: Trang sửa**

```tsx
// app/dashboard/tin-tuc/[slug]/page.tsx
import { loadPosts } from "@/lib/loadData";
import DashboardPostEditor from "@/components/dashboard/DashboardPostEditor";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPosts().map((p) => ({ slug: p.slug }));
}

export default async function DashboardPostPage({ params }: Props) {
  const { slug } = await params;
  return <DashboardPostEditor slug={slug} />;
}
```

Mirror nguyên văn `app/dashboard/du-an/[slug]/page.tsx`.

- [ ] **Step 3: Build + kiểm tra route sinh ra**

Run: `pnpm build`
Expected: `✓ Compiled successfully`, log build liệt kê `/dashboard/tin-tuc` và
`/dashboard/tin-tuc/[slug]` với đủ 9 slug bài viết (`● /dashboard/tin-tuc/[slug]` kèm danh sách
path con, giống cách log hiện in cho `/dashboard/du-an/[slug]`).

- [ ] **Step 4: Kiểm tra thủ công qua `pnpm dev`**

Đăng nhập ở `/dashboard/login`, vào `/dashboard/tin-tuc/`, chọn 1 bài, xác nhận form load đúng
dữ liệu, khung preview bên phải hiển thị đúng như trang public.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/tin-tuc/
git commit -m "feat(dashboard): route quản trị Tin tức"
```

---

### Task 9: Vỏ dashboard — `layout.tsx` + `page.tsx`, gom auth một chỗ

**Files:**
- Create: `app/dashboard/layout.tsx`
- Create: `app/dashboard/page.tsx`
- Modify: `components/dashboard/DashboardProjectEditor.tsx:35-38`
- Modify: `components/dashboard/DashboardPostEditor.tsx` (file vừa tạo ở Task 7)

**Interfaces:**
- Consumes: `checkDashboardSession` (Task 4), `dashboardLogout` (đã có trong
  `lib/dashboard-api.mjs`), `loadProjects`/`loadPosts` (đã có).

**Vì sao gom auth ở layout nhưng KHÔNG xoá check trong từng editor:** `layout.tsx` chỉ chạy
được ở client sau khi hydrate — trong khoảnh khắc đầu (trước khi `useEffect` của layout kịp gọi
`/me`), trang con vẫn render. Editor vẫn cần tự bắt lỗi `unauthorized` từ chính request load dữ
liệu của nó làm lưới an toàn thứ hai — không phải thừa, mà là 2 lớp: layout chặn ĐIỀU HƯỚNG sớm
(trải nghiệm mượt hơn, không thấy nháy nội dung trước khi bị đá ra login), editor chặn DỮ LIỆU
(vẫn đúng dù layout race-condition). Task này chỉ **thêm** layout, không xoá check trong editor.

- [ ] **Step 1: `app/dashboard/layout.tsx`**

```tsx
// app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { checkDashboardSession, dashboardLogout } from "@/lib/dashboard-api.mjs";

const API_BASE = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || "https://api.1992land.com";

const NAV = [
  { href: "/dashboard/du-an/", label: "Dự án" },
  { href: "/dashboard/tin-tuc/", label: "Tin tức" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/dashboard/login/") {
      setChecked(true);
      return;
    }
    checkDashboardSession(API_BASE).then((ok) => {
      if (!ok) router.push(`/dashboard/login/?next=${encodeURIComponent(pathname)}`);
      else setChecked(true);
    });
  }, [pathname, router]);

  if (pathname === "/dashboard/login/") return <>{children}</>;
  if (!checked) return <div className="p-8 text-navy-600">Đang kiểm tra đăng nhập...</div>;

  return (
    <div className="min-h-screen bg-bg">
      <div className="sticky top-0 z-40 flex items-center gap-1 border-b border-border-soft bg-surface px-6 py-2">
        <Link href="/dashboard/" className="mr-4 text-sm font-bold text-navy-900">
          Dashboard
        </Link>
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname.startsWith(href) ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
            }`}
          >
            {label}
          </Link>
        ))}
        <button
          type="button"
          onClick={async () => {
            await dashboardLogout(API_BASE);
            router.push("/dashboard/login/");
          }}
          className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
        >
          Đăng xuất
        </button>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: `app/dashboard/page.tsx`**

```tsx
// app/dashboard/page.tsx
import Link from "next/link";
import { loadProjects, loadPosts } from "@/lib/loadData";

export default function DashboardHomePage() {
  const projects = loadProjects();
  const posts = loadPosts();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">Dashboard 1992 Land</h1>
        <p className="mt-1 text-sm text-muted">Quản trị nội dung dự án và tin tức</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">Dự án ({projects.length})</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/dashboard/du-an/${p.slug}/`}
                className="block rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm text-navy-700 hover:border-gold-500"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">Tin tức ({posts.length})</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/dashboard/tin-tuc/${p.slug}/`}
                className="block rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm text-navy-700 hover:border-gold-500"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

Không có ô tìm kiếm như spec §8 phác thảo ban đầu — với 12 dự án + 9 bài viết, danh sách lưới
2 cột đã đủ quét mắt, thêm ô tìm kiếm ở quy mô này là over-engineering. Nếu số lượng nội dung
tăng đáng kể sau này, thêm tìm kiếm là việc dễ, không cần thiết kế trước.

- [ ] **Step 3: Sửa `DashboardProjectEditor.tsx` — xoá gạch dưới bình luận cũ, giữ logic**

Đọc lại `components/dashboard/DashboardProjectEditor.tsx:35-38` hiện tại:
```tsx
      if (e instanceof Error && e.message === "unauthorized") {
        router.push(`/dashboard/du-an/${slug}/`);
        return;
      }
```
(Đường dẫn redirect chính xác trong file thật là `/dashboard/login/?next=/dashboard/du-an/${slug}/`
— đọc file thật trước khi sửa, đừng chép nhầm từ trí nhớ.) **Không cần sửa gì ở bước này** — xem
lại phần "Vì sao gom auth ở layout nhưng KHÔNG xoá check" phía trên. Bước này chỉ xác nhận bằng
mắt rằng logic cũ vẫn còn nguyên sau khi Task 7 tạo `DashboardPostEditor.tsx` với cùng pattern
try/catch — không có thay đổi code nào ở step này, chỉ là điểm kiểm tra.

- [ ] **Step 4: Build + kiểm tra**

Run: `pnpm build`
Expected: `✓ Compiled successfully`, `/dashboard` xuất hiện trong log build.

- [ ] **Step 5: Kiểm tra thủ công qua `pnpm dev`**

- Vào `/dashboard/du-an/<slug>/` khi CHƯA đăng nhập (xoá cookie session trước) → phải thấy dòng
  "Đang kiểm tra đăng nhập..." thoáng qua rồi bị đẩy về `/dashboard/login/`.
- Đăng nhập xong → vào `/dashboard/` → thấy đủ 2 khối Dự án/Tin tức, bấm vào 1 mục bất kỳ mỗi
  loại → load đúng editor tương ứng.
- Bấm "Đăng xuất" → bị đẩy về login, thử truy cập lại `/dashboard/du-an/` → bị chặn lại.

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/layout.tsx app/dashboard/page.tsx
git commit -m "feat(dashboard): vỏ điều hướng chung — layout, trang chủ, gate đăng nhập một chỗ"
```

---

### Task 10: Áp `FormNav` + `RichTextEditor` vào `ProjectForm.tsx`

**Files:**
- Modify: `components/dashboard/ProjectForm.tsx`

**Interfaces:**
- Consumes: `FormNav` (Task 6), `RichTextEditor` (Task 5, interface không đổi nên đã tương thích).

Đây là bước migrate Dự án sang cùng pattern đã chứng minh ở Tin tức — giải quyết đúng 2 trong 3
vấn đề bạn nêu ban đầu cho trang Dự án: "form quá dài" và "field text khác vẫn thô".

- [ ] **Step 1: Thêm `FormNav` vào đầu form**

Trong `components/dashboard/ProjectForm.tsx`, thêm import và chèn `<FormNav>` ngay đầu JSX trả
về, dùng lại đúng mảng `SECTIONS` đã có sẵn trong file (dòng 21-30) — mảng này vốn được dùng cho
phần "Ẩn/hiện mục trên trang" nên đã đúng `id` khớp với `id` các `<section>` trong form (kiểm
tra: `FieldGroup` hiện tại KHÔNG có prop `id` — phải thêm, xem Step 2):

```tsx
import FormNav from "@/components/dashboard/FormNav";
```

Thêm dòng đầu tiên trong `return (<div className="space-y-6">` (sau `return (` mở đầu, trước
`<FieldGroup title="Thông tin chung">` đầu tiên):

```tsx
      <FormNav sections={SECTIONS.map((s) => ({ id: s.id, label: s.label }))} />
```

- [ ] **Step 2: Thêm `id` cho từng `<section>` để `FormNav` cuộn đúng chỗ**

Hàm `FieldGroup` hiện tại (dòng 32-39):
```tsx
function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border-soft bg-surface p-6">
      <h2 className="text-base font-bold text-navy-900">{title}</h2>
      {children}
    </section>
  );
}
```
Sửa thành nhận thêm prop `id`:
```tsx
function FieldGroup({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4 rounded-2xl border border-border-soft bg-surface p-6 scroll-mt-20">
      <h2 className="text-base font-bold text-navy-900">{title}</h2>
      {children}
    </section>
  );
}
```

Sau đó thêm `id={...}` cho **mỗi** lần gọi `<FieldGroup title="...">` trong file, khớp với `id`
tương ứng trong `SECTIONS`:

| `FieldGroup title=` | `id=` cần thêm |
|---|---|
| `"Thông tin chung"` | không có trong `SECTIONS` — dùng `id="thong-tin-chung"` (thêm mới) |
| `"Tổng quan"` | `id="tong-quan"` |
| `"Vị trí"` | `id="vi-tri"` |
| `"Tiện ích"` | `id="tien-ich"` |
| `"Mặt bằng"` | `id="mat-bang"` |
| `"Giá bán"` | `id="gia-ban"` |
| `"Pháp lý"` | `id="phap-ly"` |
| `"Chính sách"` | `id="chinh-sach"` |
| `"Ẩn/hiện mục trên trang"` | không có trong `SECTIONS` — dùng `id="an-hien"` (thêm mới) |

Vì `"Thông tin chung"` và `"Ẩn/hiện mục trên trang"` không có trong `SECTIONS` gốc (mảng đó chỉ
liệt kê 8 mục nội dung public, không phải toàn bộ FieldGroup của form editor), `FormNav` ở
Step 1 cần thêm 2 mục này thủ công thay vì chỉ `.map()` thẳng từ `SECTIONS`:

```tsx
      <FormNav
        sections={[
          { id: "thong-tin-chung", label: "Thông tin chung" },
          ...SECTIONS.map((s) => ({ id: s.id, label: s.label })),
          { id: "an-hien", label: "Ẩn/hiện" },
        ]}
      />
```

(Sửa lại Step 1 theo bản này, không dùng bản `.map()` đơn giản ban đầu.)

- [ ] **Step 3: Chuyển 3 field text sang `RichTextEditor`**

Trong `FieldGroup title="Giá bán"`, tìm dòng:
```tsx
        <TextField label="Chiết khấu" value={draft.discount ?? ""} onChange={(v) => setField("discount", v)} />
        <TextField label="Hỗ trợ ngân hàng" value={draft.bank_support ?? ""} onChange={(v) => setField("bank_support", v)} />
```
Thay bằng:
```tsx
        <div className="space-y-1.5">
          <Label>Chiết khấu</Label>
          <RichTextEditor value={draft.discount ?? ""} onChange={(v) => setField("discount", v)} />
        </div>
        <div className="space-y-1.5">
          <Label>Hỗ trợ ngân hàng</Label>
          <RichTextEditor value={draft.bank_support ?? ""} onChange={(v) => setField("bank_support", v)} />
        </div>
```

Trong `FieldGroup title="Pháp lý"`, tìm dòng:
```tsx
        <TextField label="Trạng thái pháp lý" value={draft.legal_status ?? ""} onChange={(v) => setField("legal_status", v)} />
```
Thay bằng:
```tsx
        <div className="space-y-1.5">
          <Label>Trạng thái pháp lý</Label>
          <RichTextEditor value={draft.legal_status ?? ""} onChange={(v) => setField("legal_status", v)} />
        </div>
```

`handover_date` (cùng nhóm Pháp lý) **giữ nguyên** `TextField` — là ngày tháng ngắn, không cần
định dạng. Thêm import ở đầu file:
```tsx
import RichTextEditor from "@/components/dashboard/RichTextEditor";
```

- [ ] **Step 4: Build kiểm tra**

Run: `pnpm build`
Expected: `✓ Compiled successfully`, không lỗi TypeScript.

- [ ] **Step 5: Kiểm tra thủ công qua `pnpm dev`**

Vào `/dashboard/du-an/<slug>/`, xác nhận: thanh `FormNav` hiện đủ 10 mục, bấm mỗi mục cuộn đúng
tới section tương ứng và active state cập nhật đúng khi cuộn tay; 3 field Chiết khấu/Hỗ trợ ngân
hàng/Trạng thái pháp lý giờ có toolbar rich-text thay vì ô nhập trơn.

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/ProjectForm.tsx
git commit -m "feat(dashboard): áp FormNav + RichTextEditor cho ProjectForm — hết form quá dài, hết field text thô"
```

---

### Task 11: Dọn dẹp — xoá `Post.content`/`PostBlock` (di sản chết)

**Files:**
- Modify: `lib/data.ts`

**Interfaces:** không có — đây là dọn dẹp thuần, không task nào sau phụ thuộc.

Đã xác minh ở lát 0 (spec §10.1): `loadPosts()` không bao giờ gán `content`, và 0/9 file có khoá
`content:` trong frontmatter.

- [ ] **Step 1: Xoá 2 type khỏi `lib/data.ts`**

Xoá:
```ts
export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };
```
và dòng `content?: PostBlock[];` bên trong `export type Post = { ... }`.

- [ ] **Step 2: Grep xác nhận không còn nơi nào dùng**

```bash
grep -rn "PostBlock\|\.content\b" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

Expected: không có kết quả nào tham chiếu `PostBlock` hay `post.content`/`draft.content` (một
vài kết quả `.content` không liên quan — vd `className`, `getContent()` của editor — đọc kỹ
từng dòng, đừng xoá nhầm).

- [ ] **Step 3: Build kiểm tra**

Run: `pnpm build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add lib/data.ts
git commit -m "chore: xoá Post.content/PostBlock — di sản chết, đã xác minh ở lát 0"
```

---

## Self-Review

**Spec coverage (§8, §9, §10, §11):**

| Yêu cầu spec | Task |
|---|---|
| §8 `layout.tsx` sidebar, `page.tsx` trang chủ | Task 9 |
| §8 gom auth check một chỗ | Task 9 |
| §9.1 toolbar đúng 10 cấu trúc + trích dẫn, sticky, style khớp trang thật, tắt extension ngoài hợp đồng | Task 5 |
| §9.2 `FormNav.tsx` | Task 6 |
| §9.3 áp editor cho field text khác | Task 10 |
| §10.1 xoá `content`/`PostBlock` | Task 11 |
| §10.2 4 file mới cho Tin tức | Task 7, Task 8 |
| §11 `post-store.mjs`, route backend, `dashboard-api.mjs` | Task 1, 2, 3, 4 |
| Bất biến "một lần Lưu = một commit" | Test Task 2 kiểm tra trực tiếp (`calls.length === 1`) |

**Phát sinh so với spec, cần quyết định khi thực thi:** Task 3 phát hiện route `POST /undo` hiện
tại hard-code gọi `undoLastSave` (chỉ hiểu project) — spec không nhắc chi tiết này. Đã xử lý bằng
cách thử cả hai hàm undo tuần tự (Task 3 Step 5), dựa trên tính chất one-shot an toàn của
`takeUndo`. Task 7 có một điểm cần xác minh bằng dữ liệu thật trước khi code (ảnh bìa bài viết có
upload qua dashboard hay chỉ sửa URL) — đã ghi rõ cách xác minh và 2 nhánh code tương ứng, không
đoán.

**Placeholder scan:** không có TBD/TODO. Task 9 Step 3 không có code thay đổi (chỉ là điểm kiểm
tra bằng mắt) — đã ghi rõ lý do, không phải sót bước.

**Type consistency:** `PostDraft = { meta: Record<string,string>; body: string }` định nghĩa ở
Task 7 Step 1 (`PostForm.tsx`), dùng lại y hệt ở Task 7 Step 2 (`DashboardPostEditor.tsx`). Patch
shape `{ fields?, body? }` khớp giữa Task 2 (`post-store.mjs`), Task 3 (route nhận `readJsonBody`
rồi truyền thẳng), Task 4 (`saveDashboardPost` không ép kiểu, truyền thẳng object) và Task 7
(`onSave` gọi `saveDashboardPost(..., { fields: draft.meta, body: draft.body })`).
