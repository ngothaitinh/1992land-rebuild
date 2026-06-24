# Telegram AI Publishing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép anh Thọ đăng bài viết + dự án mới hoàn toàn qua Telegram (24/7, không mở máy) bằng cách bot tự gọi LLM biên tập nội dung, gửi bản nháp + nút duyệt, rồi commit gộp lên GitHub.

**Architecture:** Mở rộng bot pm2 hiện có (`scripts/tg-bot/`). Thêm 3 module thuần (`llm.mjs`, `compose.mjs`, `session.mjs`), thêm hàm commit gộp `putFiles` (Git Trees API) vào `github-commit.mjs`, mở rộng `config.mjs` (nút + schema), và nối tất cả vào `serve.mjs` (poll loop). Logic thuần được TDD; phần điều phối HTTP (LLM/GitHub/Telegram) verify bằng tay trên VPS — theo đúng văn hóa test sẵn có (chỉ unit-test module thuần).

**Tech Stack:** Node.js ESM (`.mjs`), `node:https`, `node:test` + `node:assert/strict`, không thêm dependency ngoài.

## Global Constraints

- Runtime: Node.js thuần, ESM `.mjs`, KHÔNG thêm npm package mới (bot chạy `node` trực tiếp trên VPS).
- Test runner: `node --test <file>` với `node:test` + `node:assert/strict`. Mirror style `scripts/tg-bot/tests/idempotency.test.mjs`.
- LLM cấu hình qua `.env`: `LLM_ENDPOINT`, `LLM_MODEL`, `LLM_API_KEY` — KHÔNG hard-code.
- Chống bịa (ưu tiên cao nhất, từ CLAUDE.md): prompt cấm bịa giá/diện tích/CĐT/pháp lý/tọa độ/ngày không có trong nguồn → trường thiếu để trống/null. AI tự liệt kê trường suy đoán vào `_review_fields`.
- Giọng brand: cấm caps-lock, cấm tone sales ("CỰC KỲ", "NHẤT THỊ TRƯỜNG"). Tiếng Việt.
- Commit nội dung mới = **1 commit GỘP** (Git Trees API), không commit lẻ.
- Whitelist `TELEGRAM_ALLOWED_CHAT_IDS` áp dụng cho mọi tương tác (đã có).
- Deploy branch: `main`. Repo: `ngothaitinh/1992land-rebuild`.
- Post → `data/posts/{slug}.md`, ảnh → `public/images/news/{slug}.jpg`.
- Project → `data/projects/{slug}.json`, ảnh → `public/images/projects/{slug}/hero.jpg`.

---

## File Structure

| File | Trách nhiệm | Trạng thái |
|---|---|---|
| `scripts/tg-bot/engine/llm.mjs` | Gọi LLM theo `.env` + parse JSON an toàn | Tạo mới |
| `scripts/tg-bot/engine/compose.mjs` | Dựng prompt, validate, biến output → file md/json | Tạo mới |
| `scripts/tg-bot/engine/session.mjs` | Trạng thái hội thoại + bản nháp (in-memory, TTL) | Tạo mới |
| `scripts/tg-bot/engine/github-commit.mjs` | Thêm `putFiles` + `buildTreeEntries` (commit gộp) | Sửa |
| `scripts/tg-bot/adapters/1992land/config.mjs` | Thêm nút publish + schema/required | Sửa |
| `scripts/tg-bot/engine/serve.mjs` | Nối: nút, mode, compose, preview, duyệt, commit | Sửa |
| `scripts/tg-bot/.env.example` | Thêm 3 biến LLM_* | Sửa |
| `scripts/tg-bot/tests/*.test.mjs` | Test các module thuần | Tạo mới |

---

## Task 1: LLM client + JSON parse (`engine/llm.mjs`)

**Files:**
- Create: `scripts/tg-bot/engine/llm.mjs`
- Test: `scripts/tg-bot/tests/llm.test.mjs`

**Interfaces:**
- Consumes: `process.env.LLM_ENDPOINT`, `process.env.LLM_MODEL`, `process.env.LLM_API_KEY`
- Produces:
  - `parseLLMJson(text: string) -> object` — strip ```` ```json ```` fence, `JSON.parse`; throw `Error` nếu hỏng.
  - `callLLM({ system: string, user: string }) -> Promise<string>` — POST tới `LLM_ENDPOINT` theo định dạng Anthropic Messages API, trả về text assistant.

- [ ] **Step 1: Write the failing test**

```js
// scripts/tg-bot/tests/llm.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLLMJson } from "../engine/llm.mjs";

test("parse JSON thuần", () => {
  assert.deepEqual(parseLLMJson('{"a":1}'), { a: 1 });
});

test("strip fence ```json", () => {
  const t = "```json\n{\"a\":2}\n```";
  assert.deepEqual(parseLLMJson(t), { a: 2 });
});

test("strip fence ``` không nhãn", () => {
  const t = "```\n{\"a\":3}\n```";
  assert.deepEqual(parseLLMJson(t), { a: 3 });
});

test("có text thừa quanh JSON → vẫn lấy được object", () => {
  const t = 'Đây là kết quả: {"a":4} xong.';
  assert.deepEqual(parseLLMJson(t), { a: 4 });
});

test("JSON hỏng → throw", () => {
  assert.throws(() => parseLLMJson("không phải json"), /JSON/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tg-bot/tests/llm.test.mjs`
Expected: FAIL — `Cannot find module '../engine/llm.mjs'` hoặc `parseLLMJson is not a function`.

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/tg-bot/engine/llm.mjs
import https from "node:https";

// Strip markdown fence nếu có, rồi lấy object JSON đầu tiên.
export function parseLLMJson(text) {
  let t = (text || "").trim();
  // bỏ fence ```json ... ``` hoặc ``` ... ```
  const fence = t.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/);
  if (fence) t = fence[1].trim();
  // thử parse trực tiếp
  try { return JSON.parse(t); } catch {}
  // fallback: cắt từ { đầu tiên tới } cuối cùng
  const first = t.indexOf("{");
  const last  = t.lastIndexOf("}");
  if (first !== -1 && last > first) {
    return JSON.parse(t.slice(first, last + 1)); // ném lỗi nếu vẫn hỏng
  }
  throw new Error("LLM không trả JSON hợp lệ");
}

export function callLLM({ system, user }) {
  const endpoint = process.env.LLM_ENDPOINT;
  const model    = process.env.LLM_MODEL;
  const apiKey   = process.env.LLM_API_KEY;
  if (!endpoint || !model || !apiKey)
    return Promise.reject(new Error("Thiếu LLM_ENDPOINT / LLM_MODEL / LLM_API_KEY trong .env"));

  const url = new URL(endpoint);
  const body = JSON.stringify({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        path:     url.pathname + url.search,
        method:   "POST",
        headers: {
          "Content-Type":      "application/json",
          "Content-Length":    Buffer.byteLength(body),
          "x-api-key":         apiKey,
          "anthropic-version": "2023-06-01",
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            const j = JSON.parse(d);
            if (res.statusCode >= 400)
              return reject(new Error(`LLM ${res.statusCode}: ${j.error?.message || d.slice(0, 200)}`));
            // Anthropic Messages API: { content: [{ type:"text", text:"..." }] }
            const txt = (j.content || []).map((c) => c.text || "").join("").trim();
            if (!txt) return reject(new Error("LLM trả nội dung rỗng"));
            resolve(txt);
          } catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/tg-bot/tests/llm.test.mjs`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/engine/llm.mjs scripts/tg-bot/tests/llm.test.mjs
git commit -m "feat(tg-bot): LLM client + safe JSON parse"
```

---

## Task 2: Content shaping helpers (`engine/compose.mjs` — phần thuần)

**Files:**
- Create: `scripts/tg-bot/engine/compose.mjs`
- Test: `scripts/tg-bot/tests/compose.test.mjs`

**Interfaces:**
- Consumes: nothing (pure)
- Produces:
  - `slugify(title: string) -> string` — kebab không dấu.
  - `toPostMarkdown(obj, { slug, date, heroImage }) -> string` — chuỗi `.md` có frontmatter.
  - `toProjectJson(obj, { slug, heroImage, now }) -> string` — chuỗi JSON (2-space) + `\n`.
  - `validateComposed(type: "post"|"project", obj) -> { ok: boolean, missing: string[] }`

- [ ] **Step 1: Write the failing test**

```js
// scripts/tg-bot/tests/compose.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, toPostMarkdown, toProjectJson, validateComposed } from "../engine/compose.mjs";

test("slugify bỏ dấu + kebab", () => {
  assert.equal(slugify("Dự Án The Quậy Complex!"), "du-an-the-quay-complex");
});

test("slugify gộp khoảng trắng & ký tự lạ", () => {
  assert.equal(slugify("  Giá  tốt — 2026  "), "gia-tot-2026");
});

test("toPostMarkdown sinh frontmatter đúng", () => {
  const md = toPostMarkdown(
    { title: 'Tựa "kép"', excerpt: "Mô tả", category: "Đầu tư", readTime: "5 phút đọc", body_markdown: "## H\n\nNội dung", related_projects: ["a-b"] },
    { slug: "tua-kep", date: "2026-06-24", heroImage: "/images/news/tua-kep.jpg" }
  );
  assert.match(md, /^---\n/);
  assert.match(md, /slug: tua-kep/);
  assert.match(md, /title: "Tựa 'kép'"/);          // quote kép trong title được đổi thành nháy đơn
  assert.match(md, /date: 2026-06-24/);
  assert.match(md, /hero_image: "\/images\/news\/tua-kep.jpg"/);
  assert.match(md, /related_projects: "a-b"/);
  assert.match(md, /\n---\n\n## H\n\nNội dung\n$/);  // body sau frontmatter
});

test("toPostMarkdown bỏ qua related_projects rỗng", () => {
  const md = toPostMarkdown(
    { title: "T", excerpt: "E", category: "C", readTime: "3 phút đọc", body_markdown: "B", related_projects: [] },
    { slug: "t", date: "2026-06-24", heroImage: "" }
  );
  assert.doesNotMatch(md, /related_projects/);
  assert.doesNotMatch(md, /hero_image/);            // heroImage rỗng → bỏ
});

test("toProjectJson gắn slug/hero/timestamps, parse lại được", () => {
  const s = toProjectJson(
    { title: "Dự án X", location: "Q1", excerpt: "E", descriptions: { "tong-quan": "..." }, _review_fields: ["priceRange"] },
    { slug: "du-an-x", heroImage: "/images/projects/du-an-x/hero.jpg", now: "2026-06-24T00:00:00Z" }
  );
  const o = JSON.parse(s);
  assert.equal(o.slug, "du-an-x");
  assert.equal(o.hero_image, "/images/projects/du-an-x/hero.jpg");
  assert.equal(o.created_at, "2026-06-24T00:00:00Z");
  assert.equal(o.updated_at, "2026-06-24T00:00:00Z");
  assert.ok(!("_review_fields" in o));              // field nội bộ bị loại khỏi file
  assert.ok(s.endsWith("\n"));
});

test("validateComposed: post thiếu title", () => {
  assert.deepEqual(validateComposed("post", { body_markdown: "x" }), { ok: false, missing: ["title"] });
});

test("validateComposed: post đủ", () => {
  assert.deepEqual(validateComposed("post", { title: "T", body_markdown: "x" }), { ok: true, missing: [] });
});

test("validateComposed: project thiếu location", () => {
  assert.deepEqual(validateComposed("project", { title: "T" }), { ok: false, missing: ["location"] });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tg-bot/tests/compose.test.mjs`
Expected: FAIL — `Cannot find module '../engine/compose.mjs'`.

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/tg-bot/engine/compose.mjs
export function slugify(title) {
  return (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// YAML-safe: bọc nháy kép, đổi " bên trong thành ' (parser frontmatter chỉ strip nháy ngoài)
function yamlStr(v) {
  return `"${String(v ?? "").replace(/"/g, "'")}"`;
}

export function toPostMarkdown(obj, { slug, date, heroImage }) {
  const lines = ["---"];
  lines.push(`slug: ${slug}`);
  lines.push(`title: ${yamlStr(obj.title)}`);
  lines.push(`date: ${date}`);
  lines.push(`category: ${yamlStr(obj.category)}`);
  lines.push(`readTime: ${yamlStr(obj.readTime)}`);
  lines.push(`excerpt: ${yamlStr(obj.excerpt)}`);
  if (heroImage) lines.push(`hero_image: ${yamlStr(heroImage)}`);
  if (Array.isArray(obj.related_projects) && obj.related_projects.length)
    lines.push(`related_projects: ${yamlStr(obj.related_projects.join(", "))}`);
  lines.push("---");
  return lines.join("\n") + "\n\n" + (obj.body_markdown || "").trim() + "\n";
}

export function toProjectJson(obj, { slug, heroImage, now }) {
  const out = { ...obj };
  // loại field nội bộ
  delete out._review_fields;
  out.slug = slug;
  out.id = out.id || `prj_${slug.replace(/-/g, "_")}`;
  if (heroImage) out.hero_image = heroImage;
  out.created_at = now;
  out.updated_at = now;
  return JSON.stringify(out, null, 2) + "\n";
}

const REQUIRED = {
  post:    ["title", "body_markdown"],
  project: ["title", "location"],
};

export function validateComposed(type, obj) {
  const missing = (REQUIRED[type] || []).filter((k) => !obj || !String(obj[k] || "").trim());
  return { ok: missing.length === 0, missing };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/tg-bot/tests/compose.test.mjs`
Expected: PASS — 8 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/engine/compose.mjs scripts/tg-bot/tests/compose.test.mjs
git commit -m "feat(tg-bot): content shaping helpers (slugify, md/json, validate)"
```

---

## Task 3: Prompt builder + compose orchestration (`engine/compose.mjs` — bổ sung)

**Files:**
- Modify: `scripts/tg-bot/engine/compose.mjs`
- Test: `scripts/tg-bot/tests/compose-prompt.test.mjs`

**Interfaces:**
- Consumes: `callLLM`, `parseLLMJson` từ `./llm.mjs` (Task 1)
- Produces:
  - `buildSystemPrompt(type: "post"|"project", ctx: { today, existingSlugs: string[], existingCategories: string[] }) -> string`
  - `composeContent(type, sourceText, ctx, editInstruction?) -> Promise<object>` — gọi LLM, parse, trả object thô (chưa thành file).

- [ ] **Step 1: Write the failing test**

```js
// scripts/tg-bot/tests/compose-prompt.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt } from "../engine/compose.mjs";

const ctx = { today: "2026-06-24", existingSlugs: ["ansana-by-kita"], existingCategories: ["Đầu tư"] };

test("prompt post chứa ràng buộc chống bịa", () => {
  const p = buildSystemPrompt("post", ctx);
  assert.match(p, /KHÔNG bịa/i);
  assert.match(p, /_review_fields/);
  assert.match(p, /body_markdown/);          // nêu schema post
});

test("prompt post cấm caps-lock / tone sales", () => {
  const p = buildSystemPrompt("post", ctx);
  assert.match(p, /CỰC KỲ|tone sales|caps/i);
});

test("prompt project nêu trường nhạy cảm + danh sách slug có thật", () => {
  const p = buildSystemPrompt("project", ctx);
  assert.match(p, /legal_status/);
  assert.match(p, /ansana-by-kita/);         // slug có thật để chống bịa liên kết
  assert.match(p, /descriptions/);
});

test("prompt nhúng ngày hôm nay", () => {
  assert.match(buildSystemPrompt("post", ctx), /2026-06-24/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tg-bot/tests/compose-prompt.test.mjs`
Expected: FAIL — `buildSystemPrompt is not a function`.

- [ ] **Step 3: Write minimal implementation (thêm vào cuối `compose.mjs`)**

```js
// === Thêm vào engine/compose.mjs ===
import { callLLM, parseLLMJson } from "./llm.mjs";

const COMMON_RULES = `
QUY TẮC BẮT BUỘC:
- CHỈ viết lại / rút gọn / cấu trúc lại từ VĂN BẢN NGUỒN người dùng cung cấp.
- KHÔNG bịa: giá, diện tích, tên chủ đầu tư, số quyết định, ngày tháng, pháp lý, tọa độ, khoảng cách — nếu nguồn không ghi thì để trống / null / bỏ field.
- Liệt kê mọi trường mà bạn suy đoán hoặc không chắc vào mảng "_review_fields".
- Tiếng Việt. KHÔNG viết hoa cả từ (caps-lock). KHÔNG dùng tone sales kiểu "CỰC KỲ", "NHẤT THỊ TRƯỜNG".
- Trả về DUY NHẤT một object JSON hợp lệ. KHÔNG bọc markdown fence. KHÔNG giải thích thêm.`;

export function buildSystemPrompt(type, ctx) {
  const today = ctx.today;
  if (type === "post") {
    return `Bạn là biên tập viên của 1992 Land (môi giới BĐS). Nhiệm vụ: biên tập văn bản nguồn thành 1 BÀI VIẾT.
Hôm nay: ${today}.
${COMMON_RULES}

Schema JSON cần trả:
{
  "title": "tiêu đề ngắn gọn",
  "excerpt": "1-2 câu tóm tắt",
  "category": "tự đặt, ưu tiên tái dùng nếu hợp: ${ctx.existingCategories.join(", ")}",
  "readTime": "X phút đọc",
  "body_markdown": "nội dung markdown, dùng ## cho tiêu đề phụ",
  "related_projects": [chỉ chọn slug CÓ THẬT từ: ${ctx.existingSlugs.join(", ")} — rỗng nếu không chắc],
  "_review_fields": ["tên trường bạn không chắc"]
}`;
  }
  // project
  return `Bạn là biên tập viên của 1992 Land. Nhiệm vụ: biên tập văn bản nguồn thành 1 DỰ ÁN BĐS.
Hôm nay: ${today}.
${COMMON_RULES}
LƯU Ý ĐẶC BIỆT: các trường số/pháp lý cực kỳ nhạy cảm — price_from, price_to, area_from, area_to, unit_count, priceRange, legal_status, handover_date, ownership, lat, lng, product_types, nearby. CHỈ điền khi nguồn ghi rõ; nếu không, để null/bỏ và thêm vào "_review_fields".

Schema JSON cần trả (điền những gì nguồn có):
{
  "title": "...", "location": "...", "area": "...", "district": "...", "city": "...",
  "developer": "...", "type": "...", "project_type": "...", "status": "...",
  "priceRange": "...", "excerpt": "...",
  "descriptions": { "tong-quan": "...", "vi-tri": "...", "tien-ich": "...", "gia-ban": "...", "chinh-sach": "...", "diem-noi-bat": "...", "phap-ly": "..." },
  "_review_fields": ["..."]
}
related_projects nếu dùng chỉ chọn slug CÓ THẬT từ: ${ctx.existingSlugs.join(", ")}.`;
}

export async function composeContent(type, sourceText, ctx, editInstruction) {
  const system = buildSystemPrompt(type, ctx);
  let user = `VĂN BẢN NGUỒN:\n${sourceText}`;
  if (editInstruction) user += `\n\nYÊU CẦU SỬA của người dùng (áp dụng lên kết quả trước): ${editInstruction}`;
  const raw = await callLLM({ system, user });
  return parseLLMJson(raw);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/tg-bot/tests/compose-prompt.test.mjs`
Expected: PASS — 4 tests. (Chạy lại `compose.test.mjs` để chắc không vỡ: PASS.)

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/engine/compose.mjs scripts/tg-bot/tests/compose-prompt.test.mjs
git commit -m "feat(tg-bot): anti-hallucination prompt builder + composeContent"
```

---

## Task 4: Commit gộp nhiều file (`github-commit.mjs` + Trees API)

**Files:**
- Modify: `scripts/tg-bot/engine/github-commit.mjs`
- Test: `scripts/tg-bot/tests/tree-entries.test.mjs`

**Interfaces:**
- Consumes: `process.env` PAT (truyền vào), `ghRequest` nội bộ (đã có).
- Produces:
  - `buildTreeEntries(textFiles: {path,content}[], binaryBlobs: {path,sha}[]) -> object[]` (pure).
  - `putFiles(repo, branch, files: {path, content, binary}[], commitMsg, pat) -> Promise<{commitSha}>` — `binary:true` thì `content` là base64; ngược lại `content` là utf8.

- [ ] **Step 1: Write the failing test**

```js
// scripts/tg-bot/tests/tree-entries.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTreeEntries } from "../engine/github-commit.mjs";

test("text file → entry có content", () => {
  const e = buildTreeEntries([{ path: "a.md", content: "hello" }], []);
  assert.deepEqual(e, [{ path: "a.md", mode: "100644", type: "blob", content: "hello" }]);
});

test("binary blob → entry có sha", () => {
  const e = buildTreeEntries([], [{ path: "img.jpg", sha: "abc123" }]);
  assert.deepEqual(e, [{ path: "img.jpg", mode: "100644", type: "blob", sha: "abc123" }]);
});

test("gộp text + binary", () => {
  const e = buildTreeEntries([{ path: "a.md", content: "x" }], [{ path: "b.jpg", sha: "s1" }]);
  assert.equal(e.length, 2);
  assert.equal(e[0].content, "x");
  assert.equal(e[1].sha, "s1");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tg-bot/tests/tree-entries.test.mjs`
Expected: FAIL — `buildTreeEntries is not a function`.

- [ ] **Step 3: Write minimal implementation (thêm vào cuối `github-commit.mjs`)**

```js
// === Thêm vào engine/github-commit.mjs ===

export function buildTreeEntries(textFiles, binaryBlobs) {
  return [
    ...textFiles.map((f) => ({ path: f.path, mode: "100644", type: "blob", content: f.content })),
    ...binaryBlobs.map((b) => ({ path: b.path, mode: "100644", type: "blob", sha: b.sha })),
  ];
}

// Commit gộp nhiều file trong 1 commit (Git Trees API).
// files: [{ path, content, binary }]  binary=true → content là base64.
export async function putFiles(repo, branch, files, commitMsg, pat) {
  // 1) ref hiện tại
  const ref = await ghRequest("GET", `/repos/${repo}/git/ref/heads/${branch}`, null, pat);
  const baseCommitSha = ref.object.sha;
  // 2) commit gốc → tree gốc
  const baseCommit = await ghRequest("GET", `/repos/${repo}/git/commits/${baseCommitSha}`, null, pat);
  const baseTreeSha = baseCommit.tree.sha;
  // 3) tạo blob cho file nhị phân
  const binaryBlobs = [];
  const textFiles = [];
  for (const f of files) {
    if (f.binary) {
      const blob = await ghRequest("POST", `/repos/${repo}/git/blobs`, { content: f.content, encoding: "base64" }, pat);
      binaryBlobs.push({ path: f.path, sha: blob.sha });
    } else {
      textFiles.push({ path: f.path, content: f.content });
    }
  }
  // 4) tạo tree mới
  const tree = await ghRequest("POST", `/repos/${repo}/git/trees`,
    { base_tree: baseTreeSha, tree: buildTreeEntries(textFiles, binaryBlobs) }, pat);
  // 5) tạo commit
  const commit = await ghRequest("POST", `/repos/${repo}/git/commits`,
    { message: commitMsg, tree: tree.sha, parents: [baseCommitSha] }, pat);
  // 6) cập nhật ref
  await ghRequest("PATCH", `/repos/${repo}/git/refs/heads/${branch}`, { sha: commit.sha }, pat);
  return { commitSha: commit.sha };
}
```

> Lưu ý: `ghRequest` đã định nghĩa ở đầu file (Task không tạo lại). `buildTreeEntries` được dùng lại bên trong `putFiles`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/tg-bot/tests/tree-entries.test.mjs`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/engine/github-commit.mjs scripts/tg-bot/tests/tree-entries.test.mjs
git commit -m "feat(tg-bot): putFiles — gộp nhiều file 1 commit qua Git Trees API"
```

---

## Task 5: Trạng thái hội thoại + bản nháp (`engine/session.mjs`)

**Files:**
- Create: `scripts/tg-bot/engine/session.mjs`
- Test: `scripts/tg-bot/tests/session.test.mjs`

**Interfaces:**
- Consumes: nothing
- Produces (state in-memory, TTL 30 phút):
  - `setMode(chatId, mode)` — mode: `"await_post" | "await_project" | "await_edit" | null`
  - `getMode(chatId) -> mode|null`
  - `setDraft(chatId, draft)` — draft: `{ type, obj, imageBase64, slug, sourceText }`
  - `getDraft(chatId) -> draft|null`
  - `clearSession(chatId)`

- [ ] **Step 1: Write the failing test**

```js
// scripts/tg-bot/tests/session.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { setMode, getMode, setDraft, getDraft, clearSession } from "../engine/session.mjs";

test("setMode/getMode", () => {
  setMode(1, "await_post");
  assert.equal(getMode(1), "await_post");
});

test("setDraft/getDraft giữ nguyên object", () => {
  setDraft(2, { type: "post", slug: "x", obj: { title: "T" } });
  assert.equal(getDraft(2).slug, "x");
  assert.equal(getDraft(2).obj.title, "T");
});

test("clearSession xóa cả mode lẫn draft", () => {
  setMode(3, "await_project");
  setDraft(3, { type: "project" });
  clearSession(3);
  assert.equal(getMode(3), null);
  assert.equal(getDraft(3), null);
});

test("chat khác nhau độc lập", () => {
  setMode(4, "await_post");
  assert.equal(getMode(5), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tg-bot/tests/session.test.mjs`
Expected: FAIL — `Cannot find module '../engine/session.mjs'`.

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/tg-bot/engine/session.mjs
const TTL_MS = 30 * 60_000;
const store = new Map(); // chatId -> { mode, draft, expiresAt }

function entry(chatId) {
  const now = Date.now();
  let e = store.get(chatId);
  if (e && e.expiresAt < now) { store.delete(chatId); e = null; }
  if (!e) { e = { mode: null, draft: null, expiresAt: now + TTL_MS }; store.set(chatId, e); }
  e.expiresAt = now + TTL_MS;
  return e;
}

export function setMode(chatId, mode)   { entry(chatId).mode = mode; }
export function getMode(chatId)         { const e = store.get(chatId); return e && e.expiresAt >= Date.now() ? e.mode : null; }
export function setDraft(chatId, draft) { entry(chatId).draft = draft; }
export function getDraft(chatId)        { const e = store.get(chatId); return e && e.expiresAt >= Date.now() ? e.draft : null; }
export function clearSession(chatId)    { store.delete(chatId); }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/tg-bot/tests/session.test.mjs`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/engine/session.mjs scripts/tg-bot/tests/session.test.mjs
git commit -m "feat(tg-bot): in-memory session + draft state (TTL 30m)"
```

---

## Task 6: Cấu hình adapter (nút publish + schema)

**Files:**
- Modify: `scripts/tg-bot/adapters/1992land/config.mjs`
- Test: `scripts/tg-bot/tests/config-publish.test.mjs`

**Interfaces:**
- Produces (thêm vào object export default):
  - `publish_buttons: [{ text, mode }]`
  - `publish: { post: { dir, image_path(slug)->string }, project: { dir, image_path(slug)->string } }`

- [ ] **Step 1: Write the failing test**

```js
// scripts/tg-bot/tests/config-publish.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const cfgUrl = pathToFileURL(path.resolve("scripts/tg-bot/adapters/1992land/config.mjs")).href;
const { default: cfg } = await import(cfgUrl);

test("có 2 nút publish với mode đúng", () => {
  const modes = cfg.publish_buttons.map((b) => b.mode);
  assert.ok(modes.includes("await_post"));
  assert.ok(modes.includes("await_project"));
});

test("publish.post/project có dir + image_path", () => {
  assert.equal(cfg.publish.post.dir, "data/posts");
  assert.equal(cfg.publish.post.image_path("abc"), "public/images/news/abc.jpg");
  assert.equal(cfg.publish.project.dir, "data/projects");
  assert.equal(cfg.publish.project.image_path("abc"), "public/images/projects/abc/hero.jpg");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tg-bot/tests/config-publish.test.mjs`
Expected: FAIL — `cfg.publish_buttons` undefined.

- [ ] **Step 3: Write minimal implementation (thêm 2 khóa vào `config.mjs`, trước dấu `}` đóng object)**

```js
  // === thêm vào object export default ===
  publish_buttons: [
    { text: "📝 Đăng tin",   mode: "await_post" },
    { text: "🏢 Thêm dự án", mode: "await_project" },
  ],

  publish: {
    post: {
      dir:        "data/posts",
      image_path: (slug) => `public/images/news/${slug}.jpg`,
      web_image:  (slug) => `/images/news/${slug}.jpg`,
    },
    project: {
      dir:        "data/projects",
      image_path: (slug) => `public/images/projects/${slug}/hero.jpg`,
      web_image:  (slug) => `/images/projects/${slug}/hero.jpg`,
    },
  },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/tg-bot/tests/config-publish.test.mjs`
Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/adapters/1992land/config.mjs scripts/tg-bot/tests/config-publish.test.mjs
git commit -m "feat(tg-bot): publish buttons + content path config"
```

---

## Task 7: Nối luồng publish vào `serve.mjs`

**Files:**
- Modify: `scripts/tg-bot/engine/serve.mjs`

**Interfaces:**
- Consumes: `composeContent`, `slugify`, `toPostMarkdown`, `toProjectJson`, `validateComposed` (compose.mjs); `putFiles` (github-commit.mjs); `setMode/getMode/setDraft/getDraft/clearSession` (session.mjs); `cfg.publish_buttons`, `cfg.publish` (config.mjs); `watchDeployment` (deploy-watch.mjs).
- Produces: hành vi bot (không export). Verify bằng tay trên VPS (theo văn hóa repo — serve.mjs không unit-test).

Đây là task tích hợp: nhiều bước sửa file, kết thúc bằng kiểm thử thủ công trên VPS.

- [ ] **Step 1: Thêm import**

Sửa đầu `serve.mjs`, sau các import hiện có (sau dòng `import { watchDeployment } from "./deploy-watch.mjs";`):

```js
import { composeContent, slugify, toPostMarkdown, toProjectJson, validateComposed } from "./compose.mjs";
import { putFiles } from "./github-commit.mjs";
import { setMode, getMode, setDraft, getDraft, clearSession } from "./session.mjs";
```

- [ ] **Step 2: Thêm nút publish vào menu chính**

Sửa khối `MAIN_KB` (hiện build từ `cfg.keyboard_rows`). Thêm 1 hàng nút publish lên đầu:

```js
const MAIN_KB = {
  inline_keyboard: [
    cfg.publish_buttons.map((b) => ({ text: b.text, callback_data: `pub_start:${b.mode}` })),
    ...cfg.keyboard_rows.map((row) =>
      row.map((trigger) => ({ text: trigger, callback_data: `tpl:${trigger}` }))
    ),
  ],
};
```

- [ ] **Step 3: Thêm helper tải ảnh Telegram → base64 (đặt gần `saveToInbox`)**

```js
async function downloadPhotoBase64(msg) {
  const photos = msg.photo ? [msg.photo[msg.photo.length - 1]] : [];
  if (!photos.length) return null;
  const file = await tgApi("getFile", { file_id: photos[0].file_id });
  const url  = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
  return await new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    }).on("error", reject);
  });
}
```

- [ ] **Step 4: Thêm hàm xử lý nội dung mới + preview (đặt trước `handleMessage`)**

```js
function reviewWarning(obj) {
  const rf = Array.isArray(obj._review_fields) ? obj._review_fields : [];
  return rf.length ? `⚠️ <b>Cần soi kỹ:</b> ${rf.join(", ")}\n\n` : "";
}

async function composeAndPreview(chatId, type, sourceText, imageBase64, editInstruction) {
  const projectFiles = fs.readdirSync(path.join(ROOT, "data/projects")).filter((f) => f.endsWith(".json"));
  const existingSlugs = projectFiles.map((f) => f.replace(".json", ""));
  const postFiles = fs.existsSync(path.join(ROOT, "data/posts"))
    ? fs.readdirSync(path.join(ROOT, "data/posts")).filter((f) => f.endsWith(".md")) : [];
  const existingCategories = [...new Set(postFiles.map((f) => {
    try { const m = fs.readFileSync(path.join(ROOT, "data/posts", f), "utf8").match(/^category:\s*(.+)$/m); return m ? m[1].replace(/["']/g, "").trim() : null; } catch { return null; }
  }).filter(Boolean))];
  const ctx = { today: new Date().toISOString().slice(0, 10), existingSlugs, existingCategories };

  await send(chatId, "🤖 Đang biên tập, chờ chút…");
  let obj;
  try {
    obj = await composeContent(type, sourceText, ctx, editInstruction);
  } catch (e) {
    clearSession(chatId);
    return send(chatId, `⚠️ AI lỗi: ${e.message}. Gửi lại nội dung giúp anh.`);
  }

  const v = validateComposed(type, obj);
  if (!v.ok) {
    clearSession(chatId);
    return send(chatId, `❌ Thiếu trường tối thiểu: ${v.missing.join(", ")}. Gửi nội dung đầy đủ hơn.`);
  }

  const slug = slugify(obj.title) + "-" + Date.now().toString(36).slice(-4);
  setDraft(chatId, { type, obj, imageBase64, slug, sourceText });
  setMode(chatId, null);

  const label = type === "post" ? "bài viết" : "dự án";
  const text =
    reviewWarning(obj) +
    `📄 <b>Bản nháp ${label}</b>\n` +
    `<b>${obj.title}</b>\n` +
    (obj.excerpt ? `${obj.excerpt}\n` : "") +
    `\nSlug: <code>${slug}</code>`;
  return send(chatId, text, {
    reply_markup: { inline_keyboard: [[
      { text: "✅ Duyệt", callback_data: "pub_approve" },
      { text: "✏️ Sửa",  callback_data: "pub_edit" },
      { text: "❌ Hủy",   callback_data: "pub_cancel" },
    ]] },
  });
}
```

- [ ] **Step 5: Trong `handleMessage`, chặn nội dung khi đang ở mode publish (đặt ngay sau khối xử lý `/menu`, trước `isProcessed`)**

```js
  const mode = getMode(msg.chat.id);
  if (mode === "await_post" || mode === "await_project") {
    if (isProcessed(msg.message_id)) return;
    markProcessed(msg.message_id);
    const type = mode === "await_post" ? "post" : "project";
    const img  = await downloadPhotoBase64(msg).catch(() => null);
    return composeAndPreview(msg.chat.id, type, text, img);
  }
  if (mode === "await_edit") {
    if (isProcessed(msg.message_id)) return;
    markProcessed(msg.message_id);
    const draft = getDraft(msg.chat.id);
    if (!draft) { clearSession(msg.chat.id); return send(msg.chat.id, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé."); }
    return composeAndPreview(msg.chat.id, draft.type, draft.sourceText, draft.imageBase64, text);
  }
```

- [ ] **Step 6: Trong `handleCallbackQuery`, thêm 4 nhánh `pub_*` (sau khối `tpl:`)**

```js
  if (data.startsWith("pub_start:")) {
    const mode = data.slice("pub_start:".length);
    setMode(cq.message.chat.id, mode);
    const what = mode === "await_post" ? "bài viết (có thể dán từ báo)" : "dự án";
    return send(cq.message.chat.id, `✍️ Dán nội dung ${what} vào đây, kèm 1 ảnh nếu có. Xong gửi là được.`);
  }

  if (data === "pub_cancel") {
    clearSession(cq.message.chat.id);
    return send(cq.message.chat.id, "❌ Đã hủy, không đăng gì.");
  }

  if (data === "pub_edit") {
    if (!getDraft(cq.message.chat.id)) return send(cq.message.chat.id, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé.");
    setMode(cq.message.chat.id, "await_edit");
    return send(cq.message.chat.id, "✏️ Anh muốn sửa gì? (vd: rút ngắn tiêu đề, bỏ đoạn cuối)");
  }

  if (data === "pub_approve") {
    const draft = getDraft(cq.message.chat.id);
    if (!draft) return send(cq.message.chat.id, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé.");
    clearSession(cq.message.chat.id);
    const pc   = cfg.publish[draft.type];
    const now  = new Date().toISOString();
    const heroWeb = draft.imageBase64 ? pc.web_image(draft.slug) : "";
    const contentFile = draft.type === "post"
      ? { path: `${pc.dir}/${draft.slug}.md`,   content: toPostMarkdown(draft.obj, { slug: draft.slug, date: now.slice(0, 10), heroImage: heroWeb }), binary: false }
      : { path: `${pc.dir}/${draft.slug}.json`, content: toProjectJson(draft.obj, { slug: draft.slug, heroImage: heroWeb, now }), binary: false };
    const files = [contentFile];
    if (draft.imageBase64) files.push({ path: pc.image_path(draft.slug), content: draft.imageBase64, binary: true });

    let commitSha;
    try {
      ({ commitSha } = await putFiles(REPO, cfg.deploy_branch, files,
        `content: add ${draft.type} ${draft.slug} via telegram`, PAT));
    } catch (e) {
      return send(cq.message.chat.id, `⚠️ Lỗi đăng: ${e.message}`);
    }
    await send(cq.message.chat.id, `✅ Đã đăng. Đang chờ build…`);
    watchDeployment(REPO, commitSha, PAT, async (status, runUrl) => {
      if (status === "success") await send(cq.message.chat.id, `✅ <b>${cfg.site_name}</b> đã lên web.`).catch(console.error);
      else await send(cq.message.chat.id, `⚠️ Build lỗi (${status}).\n${runUrl}`).catch(console.error);
    });
    return;
  }
```

- [ ] **Step 7: Chạy toàn bộ test thuần (đảm bảo không vỡ gì)**

Run:
```bash
node --test scripts/tg-bot/tests/
```
Expected: PASS tất cả (llm, compose, compose-prompt, tree-entries, session, config-publish, idempotency, parse-command).

- [ ] **Step 8: Smoke test cú pháp serve.mjs (không cần token)**

Run:
```bash
node --check scripts/tg-bot/engine/serve.mjs
```
Expected: không in lỗi (cú pháp hợp lệ).

- [ ] **Step 9: Commit**

```bash
git add scripts/tg-bot/engine/serve.mjs
git commit -m "feat(tg-bot): wire AI publish flow (buttons, compose, approve→commit)"
```

---

## Task 8: Cấu hình `.env` + tài liệu + deploy lên VPS

**Files:**
- Modify: `scripts/tg-bot/.env.example`
- Modify: `scripts/tg-bot/.env` (trên VPS — không commit)

**Interfaces:**
- Consumes: tất cả task trên.
- Produces: bot chạy thật với luồng publish.

- [ ] **Step 1: Cập nhật `.env.example`**

Thêm vào cuối `scripts/tg-bot/.env.example`:

```
# LLM để biên tập nội dung mới (Đăng tin / Thêm dự án)
LLM_ENDPOINT=https://api.anthropic.com/v1/messages
LLM_MODEL=claude-haiku-4-5-20251001
LLM_API_KEY=sk-ant-xxxxxxxx
```

- [ ] **Step 2: Commit + push**

```bash
git add scripts/tg-bot/.env.example
git commit -m "docs(tg-bot): thêm biến LLM_* vào .env.example"
git push origin main
```

- [ ] **Step 3: Deploy lên VPS (chạy từ máy local)**

Run:
```bash
ssh -p 2222 root@160.191.88.139 "cd /root/bot && bash scripts/tg-bot/deploy-vps.sh"
```
Expected: script pull code mới, pm2 reload `tg-bot-1992land`.

- [ ] **Step 4: Điền 3 biến LLM trên VPS**

Trên VPS, thêm vào `/root/bot/scripts/tg-bot/.env` (nối tiếp, giữ các biến cũ):
```bash
cat >> /root/bot/scripts/tg-bot/.env <<'EOF'
LLM_ENDPOINT=https://api.anthropic.com/v1/messages
LLM_MODEL=claude-haiku-4-5-20251001
LLM_API_KEY=sk-ant-THAY-KEY-THAT
EOF
pm2 restart tg-bot-1992land
```

- [ ] **Step 5: Đăng ký lại nút /menu (nếu cần) + verify thủ công**

Mở Telegram, kiểm tra theo tiêu chí thành công của spec:
1. `/menu` → thấy nút **📝 Đăng tin** + **🏢 Thêm dự án**.
2. Bấm "📝 Đăng tin" → dán 1 đoạn tin + gửi 1 ảnh → nhận bản nháp + nút duyệt.
3. Bấm ✅ Duyệt → bot báo "Đã đăng" → kiểm `data/posts/` trên GitHub có file mới (1 commit gộp) → ~8 phút web có bài.
4. Bấm "🏢 Thêm dự án" → dán thông tin thiếu giá → bản nháp có dòng `⚠️ Cần soi kỹ`.
5. ✏️ Sửa → nhắn "rút ngắn tiêu đề" → nháp cập nhật.

- [ ] **Step 6: Báo cáo anh Thọ (theo CLAUDE.md)**

```bash
node scripts/notify.mjs "✅ Xong: bot giờ đăng được bài viết + dự án mới qua nút Telegram, 24/7. Bấm Menu → 📝 Đăng tin → dán nội dung + ảnh → duyệt."
```

---

## Self-Review

**Spec coverage:**
- §2 Hướng A (bot gọi LLM) → Task 1, 3, 7 ✓
- §3 UX nút bấm → Task 6 (nút), Task 7 (mode/preview) ✓
- §4.1 cấu hình LLM → Task 1 (đọc env), Task 8 (.env) ✓
- §4.3 output schema post/project → Task 2 (md/json), Task 3 (prompt schema) ✓
- §4.4 chống bịa → Task 3 (prompt rules + _review_fields), Task 7 (reviewWarning) ✓
- §4.5 parse an toàn → Task 1 (parseLLMJson) ✓
- §5 cổng duyệt + vòng sửa → Task 5 (session), Task 7 (pub_edit/await_edit) ✓
- §6 commit gộp Trees API → Task 4 (putFiles), Task 7 (approve) ✓
- §7 chống lỗi → Task 7 (try/catch compose, validate, putFiles), idempotency (Task 7 Step 5) ✓
- §10 tiêu chí thành công → Task 8 Step 5 ✓

**Placeholder scan:** Không có TBD/TODO. `sk-ant-THAY-KEY-THAT` là chỗ điền key thật, có chú thích rõ. ✓

**Type consistency:**
- `composeContent(type, sourceText, ctx, editInstruction?)` — định nghĩa Task 3, dùng Task 7 ✓
- `toPostMarkdown(obj,{slug,date,heroImage})`, `toProjectJson(obj,{slug,heroImage,now})` — Task 2 ↔ Task 7 (key khớp: heroImage, now) ✓
- `putFiles(repo,branch,files,commitMsg,pat)`, files `{path,content,binary}` — Task 4 ↔ Task 7 ✓
- `setMode/getMode/setDraft/getDraft/clearSession`, draft `{type,obj,imageBase64,slug,sourceText}` — Task 5 ↔ Task 7 ✓
- `cfg.publish[type].{dir,image_path,web_image}`, `cfg.publish_buttons` — Task 6 ↔ Task 7 ✓
- `validateComposed(type,obj)->{ok,missing}` — Task 2 ↔ Task 7 ✓
