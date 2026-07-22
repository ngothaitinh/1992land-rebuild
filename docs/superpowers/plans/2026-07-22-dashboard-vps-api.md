# VPS Dashboard API — Implementation Plan (Plan 2/3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a small HTTP API on the VPS (160.191.88.139, same box + PM2 as the Telegram bot) that a future browser-based `/dashboard` (Plan 3) can call to read a project's full JSON, save an edited draft as **one** GitHub commit, and undo the last save — reusing the bot's existing `github-commit.mjs` / `undo.mjs` primitives instead of re-implementing Git logic. Also stand up the HTTPS front door (subdomain + Caddy reverse proxy) the browser needs to call it, since the dashboard page is served from `https://1992land.com` and browsers block a `https://` page from fetching a plain `http://` origin.

**Architecture:**
- `scripts/tg-bot/api/` — new sibling to `scripts/tg-bot/engine/`, a plain Node `http` server (no new npm dependency — mirrors `github-commit.mjs`'s existing use of `node:https`). Runs as a second PM2 app (`dashboard-api`) in the same `ecosystem.config.cjs`, deployed by the existing `deploy-bot.yml` workflow (path filter `scripts/tg-bot/**` already covers it).
- Reuses `getFile`/`putFiles` (`../engine/github-commit.mjs`) and `recordUndo`/`takeUndo`/`toCommitFiles` (`../engine/undo.mjs`) directly — **does not** call the bot's `execSetField`/`execSetDescription`/etc. from `actions.mjs`, because those each self-commit individually (one `putFile` per call) and self-announce to Telegram. The dashboard's whole point is N field/image edits → 1 commit, so Task 2 writes one new orchestration function that loads the JSON once, applies every edit in memory, and calls `putFiles` once — the same *primitive* the bot uses, different *assembly*.
- Auth is a standalone password+cookie session layer (`api/auth.mjs`) — no OAuth, no relation to the existing Decap/Sveltia `public/admin` GitHub-OAuth flow (`public/auth/index.php`), which `/dashboard` replaces and this plan does not touch.
- Front door: Caddy on the VPS terminates TLS for `api.1992land.com` (Let's Encrypt, automatic) and reverse-proxies to the Node API on `127.0.0.1:4001`. Requires one **manual** DNS step (A record) that only anh Thọ/Jimmy can do via DirectAdmin — flagged explicitly in Task 4, not automatable from this session.

**Tech Stack:** Plain Node.js (`node:http`, `node:crypto`, `node:https` via existing `github-commit.mjs`) — no Express, no new npm dependency, matching the bot's existing style. `node:test` + `node:assert/strict` for the pure-logic module (`project-store.mjs`), same convention as `lib/markdown.test.mjs` / `scripts/tg-bot/tests/*.test.mjs`.

## Global Constraints

- **No new npm dependencies.** The bot already proves raw `node:https` is sufficient for the GitHub API; the dashboard API server itself needs nothing beyond `node:http`/`node:crypto`.
- **Reuse, don't fork, the commit primitive.** All writes go through `putFiles` from `scripts/tg-bot/engine/github-commit.mjs` (Task 1 of the markdown plan's sibling — already exists, unchanged). Do not add a second GitHub-commit implementation.
- **One save = one commit.** This is the reason this API exists (see spec `docs/superpowers/specs/2026-07-22-laptop-dashboard-design.md` § Data flow point 3). A task reviewer should treat multiple `putFile`/`putFiles` calls per `/save` request as a spec violation.
- **`data/projects/{slug}.json` is the only content type in v1** (matches spec § Phạm vi v1 — posts are a later phase). Do not build post-editing endpoints now.
- **Full `Project` shape is editable**, not the bot's narrow `editable_fields` allowlist (`scripts/tg-bot/adapters/1992land/config.mjs:46-49`, currently `title, location, priceRange, status, type, excerpt, developer, area, district, city`). That allowlist exists only to keep the Telegram wizard's one-field-at-a-time UI small; it is not a data-integrity rule. The dashboard's `/save` endpoint accepts any key present on the `Project` type (`lib/data.ts:1-54`) except the identity fields listed in Task 2.
- **Session/password auth only** — no OAuth, no per-user accounts (spec § Đăng nhập: one shared password for anh Thọ + Jimmy).
- **Vietnamese for any user-facing error strings** the API returns (mirrors bot's `send(...)` messages), matching project convention.
- Tiếng Việt là ngôn ngữ chính cho nội dung hiển thị; code/comments as usual can be Vietnamese or English matching surrounding file (bot files are Vietnamese-commented — follow that).

---

### Task 1: Session/auth module

**Files:**
- Create: `scripts/tg-bot/api/auth.mjs`
- Create: `scripts/tg-bot/api/auth.test.mjs`
- Modify: `scripts/tg-bot/.env.example` (add `DASHBOARD_PASSWORD`, `DASHBOARD_API_PORT`, `DASHBOARD_ALLOWED_ORIGIN`)

**Interfaces:**
- Produces: `checkPassword(input: string): boolean`, `createSession(): string` (returns opaque token), `verifySession(token: string | null): boolean`, `destroySession(token: string): void`, `parseCookies(header: string | undefined): Record<string,string>`, `sessionCookieHeader(token: string, opts: { clear?: boolean }): string`.
- Consumed by Task 3 (`server.mjs`) for the `/api/login`, `/api/logout` routes and as auth middleware on every other route.

- [ ] **Step 1: Write the failing test file**

Create `scripts/tg-bot/api/auth.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkPassword, createSession, verifySession, destroySession,
  parseCookies, sessionCookieHeader,
} from "./auth.mjs";

test("checkPassword đúng/sai", () => {
  process.env.DASHBOARD_PASSWORD = "matkhau-test-123";
  assert.equal(checkPassword("matkhau-test-123"), true);
  assert.equal(checkPassword("sai"), false);
  assert.equal(checkPassword(""), false);
  assert.equal(checkPassword(undefined), false);
});

test("createSession → verifySession true, token lạ → false", () => {
  const token = createSession();
  assert.equal(typeof token, "string");
  assert.ok(token.length >= 16);
  assert.equal(verifySession(token), true);
  assert.equal(verifySession("token-khong-ton-tai"), false);
  assert.equal(verifySession(null), false);
  assert.equal(verifySession(undefined), false);
});

test("destroySession → verifySession false sau đó", () => {
  const token = createSession();
  assert.equal(verifySession(token), true);
  destroySession(token);
  assert.equal(verifySession(token), false);
});

test("parseCookies tách đúng nhiều cookie", () => {
  const cookies = parseCookies("dash_session=abc123; other=xyz");
  assert.equal(cookies.dash_session, "abc123");
  assert.equal(cookies.other, "xyz");
  assert.deepEqual(parseCookies(undefined), {});
  assert.deepEqual(parseCookies(""), {});
});

test("sessionCookieHeader tạo Set-Cookie hợp lệ, clear=true xoá cookie", () => {
  const set = sessionCookieHeader("tok123", {});
  assert.match(set, /^dash_session=tok123/);
  assert.match(set, /HttpOnly/);
  assert.match(set, /SameSite=None/);
  assert.match(set, /Secure/);
  const cleared = sessionCookieHeader("", { clear: true });
  assert.match(cleared, /Max-Age=0/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/tg-bot/api/auth.test.mjs`
Expected: FAIL — `Cannot find module './auth.mjs'`.

- [ ] **Step 3: Write the implementation**

Create `scripts/tg-bot/api/auth.mjs`:

```js
// Đăng nhập mật khẩu chung + session cookie cho /dashboard. Không OAuth, không
// tài khoản riêng — chỉ anh Thọ + Jimmy dùng chung 1 mật khẩu (xem spec §Đăng nhập).
import crypto from "node:crypto";

const TTL_MS = 12 * 60 * 60_000; // 12 giờ
const sessions = new Map(); // token -> expiresAt
const COOKIE_NAME = "dash_session";

export function checkPassword(input) {
  const expected = process.env.DASHBOARD_PASSWORD || "";
  if (!expected || !input) return false;
  const a = Buffer.from(String(input));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSession() {
  const token = crypto.randomBytes(24).toString("base64url");
  sessions.set(token, Date.now() + TTL_MS);
  return token;
}

export function verifySession(token) {
  if (!token) return false;
  const exp = sessions.get(token);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(token); return false; }
  return true;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = v;
  }
  return out;
}

// SameSite=None + Secure vì dashboard (1992land.com) gọi API cross-origin
// (api.1992land.com) — cần cookie cross-site, nên bắt buộc HTTPS cả 2 phía.
export function sessionCookieHeader(token, { clear = false } = {}) {
  const base = `${COOKIE_NAME}=${clear ? "" : token}; Path=/; HttpOnly; Secure; SameSite=None`;
  return clear ? `${base}; Max-Age=0` : `${base}; Max-Age=${Math.floor(TTL_MS / 1000)}`;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/tg-bot/api/auth.test.mjs`
Expected: PASS — 5/5 tests green.

- [ ] **Step 5: Add env var placeholders**

Append to `scripts/tg-bot/.env.example` (do not touch existing lines):

```
# --- Dashboard API (/dashboard, xem docs/superpowers/plans/2026-07-22-dashboard-vps-api.md) ---
DASHBOARD_PASSWORD=doi-mat-khau-nay
DASHBOARD_API_PORT=4001
DASHBOARD_ALLOWED_ORIGIN=https://1992land.com
```

- [ ] **Step 6: Commit**

```bash
git add scripts/tg-bot/api/auth.mjs scripts/tg-bot/api/auth.test.mjs scripts/tg-bot/.env.example
git commit -m "feat(dashboard-api): add password+cookie session auth module"
```

---

### Task 2: Project store — load / save-as-one-commit / undo

**Files:**
- Create: `scripts/tg-bot/api/project-store.mjs`
- Create: `scripts/tg-bot/api/project-store.test.mjs`

**Interfaces:**
- Consumes: `getFile`, `putFiles` from `../engine/github-commit.mjs`; `recordUndo`, `takeUndo`, `toCommitFiles` from `../engine/undo.mjs`; `repo`/`deploy_branch`/`content_types.project.dir` from `../adapters/1992land/config.mjs` (default export, called `cfg` below).
- Produces:
  - `loadProject(deps, slug): Promise<object>` — returns the full parsed JSON object (throws if not found).
  - `saveProject(deps, slug, patch): Promise<{ commitSha: string, undoKey: string }>` — see patch shape below.
  - `undoLastSave(deps, undoKey): Promise<{ commitSha: string }>` — throws `Error("expired")` if the key is gone/expired.
- `deps = { repo, pat, branch }` (a slimmed-down version of the bot's `deps` — no `cfg`/`send`/Telegram concerns; the dashboard has no chat to announce to).
- Consumed by Task 3 (`server.mjs`) route handlers.

`patch` shape (all keys optional):
```js
{
  fields: { title: "...", priceRange: "...", highlights: [...], ... }, // any Project key except slug/id — shallow-merged into the JSON object, each value replaces the existing one wholesale (arrays/objects included)
  descriptions: { "tong-quan": "markdown...", "gia-ban": "" },          // merged into obj.descriptions; empty string deletes the key
  hiddenSections: ["mat-bang", "thiet-ke"],                             // if present, REPLACES obj.hidden_sections wholesale
  images: [
    { kind: "field", field: "hero_image", filename: "hero-<ts>.jpg", base64: "...", list: false },
    { kind: "field", field: "amenities_images", filename: "amenities-<ts>-0.jpg", base64: "...", list: true },
    { kind: "inline", filename: "inline-<ts>-1.jpg", base64: "..." },  // used only inside a `descriptions` markdown string already containing its final /images/... path — no JSON field to update
  ],
}
```

**Undo-key namespace note:** `recordUndo`/`takeUndo` in `undo.mjs` key their `Map` by `chatId` (bot semantics). The dashboard has no chat id — pass the fixed string `"dashboard"` as the `chatId` argument. This means dashboard save/undo is single-slot process-wide (one in-flight undo at a time across both anh Thọ and Jimmy), matching the spec's "Hoàn tác lần Lưu gần nhất" (undo the *last* save, singular) — acceptable for a 2-person internal tool. Do not build a per-user undo namespace; that's over-scoping v1.

- [ ] **Step 1: Write the failing test file**

Create `scripts/tg-bot/api/project-store.test.mjs`. Use dependency injection to fake `getFile`/`putFiles` — do not hit the real GitHub API in tests (mirrors how `scripts/tg-bot/tests/*.test.mjs` already fake `deps`, check one such file for the exact faking pattern used in this repo before writing these fakes, and match it).

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadProject, saveProject, undoLastSave } from "./project-store.mjs";

function makeProject(overrides = {}) {
  return {
    slug: "demo-project", title: "Demo", location: "Q9", priceRange: "10 tỷ",
    hidden_sections: [], descriptions: { "tong-quan": "Cũ." },
    ...overrides,
  };
}

test("loadProject trả về object JSON đầy đủ", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject())]]);
  const deps = fakeDeps(store);
  const project = await loadProject(deps, "demo-project");
  assert.equal(project.title, "Demo");
});

test("saveProject gộp fields + descriptions + hiddenSections + ảnh field thành 1 lần gọi putFiles", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject())]]);
  const deps = fakeDeps(store);
  const result = await saveProject(deps, "demo-project", {
    fields: { title: "Demo Mới" },
    descriptions: { "tong-quan": "Nội dung mới." },
    hiddenSections: ["gia-ban"],
    images: [{ kind: "field", field: "hero_image", filename: "hero-1.jpg", base64: "QUJD", list: false }],
  });
  assert.equal(deps._putFilesCalls, 1); // đúng 1 commit
  assert.ok(result.commitSha);
  assert.ok(result.undoKey);
  const saved = JSON.parse(store.get("data/projects/demo-project.json"));
  assert.equal(saved.title, "Demo Mới");
  assert.equal(saved.descriptions["tong-quan"], "Nội dung mới.");
  assert.deepEqual(saved.hidden_sections, ["gia-ban"]);
  assert.equal(saved.hero_image, "/images/projects/demo-project/hero-1.jpg");
  assert.ok(store.has("public/images/projects/demo-project/hero-1.jpg"));
});

test("saveProject: images list=true nối vào mảng, không ghi đè", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject({ amenities_images: ["/images/projects/demo-project/old.jpg"] }))]]);
  const deps = fakeDeps(store);
  await saveProject(deps, "demo-project", {
    images: [{ kind: "field", field: "amenities_images", filename: "new.jpg", base64: "QUJD", list: true }],
  });
  const saved = JSON.parse(store.get("data/projects/demo-project.json"));
  assert.deepEqual(saved.amenities_images, [
    "/images/projects/demo-project/old.jpg",
    "/images/projects/demo-project/new.jpg",
  ]);
});

test("saveProject: descriptions với giá trị rỗng thì xoá key đó", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject({ descriptions: { "gia-ban": "Cũ" } }))]]);
  const deps = fakeDeps(store);
  await saveProject(deps, "demo-project", { descriptions: { "gia-ban": "" } });
  const saved = JSON.parse(store.get("data/projects/demo-project.json"));
  assert.equal("gia-ban" in saved.descriptions, false);
});

test("saveProject rồi undoLastSave → khôi phục đúng nội dung trước đó", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject())]]);
  const deps = fakeDeps(store);
  const { undoKey } = await saveProject(deps, "demo-project", { fields: { title: "Đổi rồi" } });
  assert.equal(JSON.parse(store.get("data/projects/demo-project.json")).title, "Đổi rồi");
  await undoLastSave(deps, undoKey);
  assert.equal(JSON.parse(store.get("data/projects/demo-project.json")).title, "Demo");
});

test("undoLastSave với key sai/hết hạn → throw", async () => {
  const deps = fakeDeps(new Map());
  await assert.rejects(() => undoLastSave(deps, "key-khong-ton-tai"));
});

test("saveProject không cho sửa field slug", async () => {
  const store = new Map([["data/projects/demo-project.json", JSON.stringify(makeProject())]]);
  const deps = fakeDeps(store);
  await assert.rejects(() => saveProject(deps, "demo-project", { fields: { slug: "hack" } }));
});
```

Write `fakeDeps(store)` at the top of the test file: a helper returning `{ repo: "x/y", pat: "fake", branch: "main", _putFilesCalls: 0 }` plus whatever injection point Task 2's implementation actually needs (see Step 3 — the implementation should accept `getFile`/`putFiles` as overridable, e.g. via `deps.getFile ?? defaultGetFile` so tests can inject fakes without mocking modules). Increment `deps._putFilesCalls` inside the fake `putFiles`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/tg-bot/api/project-store.test.mjs`
Expected: FAIL — module doesn't exist yet.

- [ ] **Step 3: Write the implementation**

Create `scripts/tg-bot/api/project-store.mjs`. Key structural requirements (write full code, this is the spec, not paraphrase-and-improvise):

- `filePath(slug) => \`data/projects/${slug}.json\``, `imageDir(slug) => \`public/images/projects/${slug}\``.
- `loadProject(deps, slug)`: call `(deps.getFile ?? getFile)(deps.repo, deps.branch, filePath(slug), deps.pat)`, `JSON.parse(content)`.
- `saveProject(deps, slug, patch)`:
  1. Load current `{ content, sha: _ }` via `getFile` (sha unused — `putFiles` re-resolves the ref itself, same as `execPublish`/`execAddGallery` already do).
  2. `const obj = JSON.parse(content)`; keep `content` (the original string) for the undo record.
  3. Reject if `patch.fields` contains `slug` or `id` — `throw new Error("Không được sửa slug/id")`.
  4. Apply `patch.fields` via `Object.assign(obj, patch.fields)` (whole-value replace per key, matching the patch shape doc above).
  5. Apply `patch.descriptions`: `obj.descriptions = obj.descriptions || {}`; for each `[k, v]` — if `v === ""` delete `obj.descriptions[k]`, else set it. If `obj.descriptions` ends up `{}`, leave it as `{}` (do not delete the key — matches existing JSON shape, unlike `execSetVideo`'s videos-cleanup, deliberately different because `descriptions` is always present, `videos` is not).
  6. If `patch.hiddenSections` is present (even `[]`): `obj.hidden_sections = patch.hiddenSections`.
  7. Build the file list for `putFiles`, starting with the updated JSON: `const files = [{ path: filePath(slug), content: JSON.stringify(obj, null, 2) + "\n", binary: false }]`.
  8. For each entry in `patch.images ?? []`:
     - Sanitize `filename`: reject (throw) if it contains `/`, `\`, or `..`.
     - `const repoPath = \`${imageDir(slug)}/${filename}\``, `const webPath = \`/images/projects/${slug}/${filename}\``.
     - `files.push({ path: repoPath, content: img.base64, binary: true })`.
     - If `kind === "field"`: `if (img.list) obj[img.field] = [...(Array.isArray(obj[img.field]) ? obj[img.field] : []), webPath]; else obj[img.field] = webPath;` — **then re-serialize** `files[0].content` again since `obj` changed after the JSON file entry was already pushed (do the image-field mutations *before* building `files[0]`, not after — restructure so all `obj` mutations happen first, then `JSON.stringify` once, then append image blobs. Do not stringify twice).
  9. `obj.updated_at = new Date().toISOString()` before the single stringify.
  10. `const { commitSha } = await (deps.putFiles ?? putFiles)(deps.repo, deps.branch, files, \`content: dashboard save ${slug}\`, deps.pat);`
  11. `const undoKey = recordUndo("dashboard", \`dashboard save ${slug}\`, [{ path: filePath(slug), prevContent: content }]);` — note: only the JSON file is restored on undo, not the uploaded images (matches bot's existing `execSetHero`/`execSetSectionImage`/`execAddGallery` undo behavior — they only restore the JSON pointer too, orphaned image blobs are accepted debt, already true in production).
  12. Return `{ commitSha, undoKey }`.
- `undoLastSave(deps, undoKey)`:
  1. `const entry = takeUndo("dashboard", undoKey); if (!entry) throw new Error("expired");`
  2. `const { commitSha } = await (deps.putFiles ?? putFiles)(deps.repo, deps.branch, toCommitFiles(entry), \`content: undo dashboard save\`, deps.pat);`
  3. Return `{ commitSha }`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/tg-bot/api/project-store.test.mjs`
Expected: PASS — all 7 tests green. If the double-stringify ordering bug from Step 3.8 is present, the `hero_image`/`amenities_images` test will fail with the field missing from the committed JSON — fix ordering, don't add a workaround.

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/api/project-store.mjs scripts/tg-bot/api/project-store.test.mjs
git commit -m "feat(dashboard-api): add project-store (load/save-as-one-commit/undo)"
```

---

### Task 3: HTTP server — routes, CORS, PM2 wiring

**Files:**
- Create: `scripts/tg-bot/api/server.mjs`
- Modify: `scripts/tg-bot/ecosystem.config.cjs` (add second PM2 app)
- Modify: `scripts/tg-bot/deploy-vps.sh` (start-or-reload both apps)

**Interfaces:**
- Consumes: `checkPassword`, `createSession`, `verifySession`, `destroySession`, `parseCookies`, `sessionCookieHeader`, `SESSION_COOKIE_NAME` (Task 1); `loadProject`, `saveProject`, `undoLastSave` (Task 2); `cfg` default export from `../adapters/1992land/config.mjs` (for `repo`, `deploy_branch`).
- No automated test — this is I/O wiring (`node:http` request/response). Verification is Task 4's live curl checks against the deployed VPS instance, plus a local manual run in Step 4 below.

Routes (all under no path prefix — Caddy in Task 4 maps `api.1992land.com/*` straight through):

| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/login` | none | `{password}` → 200 `{ok:true}` + `Set-Cookie`, or 401 `{error:"Sai mật khẩu"}` |
| POST | `/logout` | cookie | → 200 `{ok:true}` + clearing `Set-Cookie` |
| GET | `/projects/:slug` | cookie | → 200 `{project:{...}}`, 404 if not found, 401 if no/bad session |
| POST | `/projects/:slug/save` | cookie | patch body (Task 2 shape) → 200 `{commitSha, undoKey}`, 400 on validation error (e.g. slug/id in fields), 502 on GitHub API failure with `{error: message}}` |
| POST | `/undo` | cookie | `{undoKey}` → 200 `{commitSha}`, 410 `{error:"Hết hạn hoặc đã hoàn tác"}` if expired/consumed |

- [ ] **Step 1: Write the server**

Create `scripts/tg-bot/api/server.mjs`:

```js
// API HTTP nhỏ cho /dashboard — bọc quanh project-store.mjs (dùng chung lõi
// github-commit.mjs/undo.mjs với bot Telegram). Chạy trên VPS qua PM2, đứng
// sau Caddy (xem docs/superpowers/plans/2026-07-22-dashboard-vps-api.md Task 4).
import http from "node:http";
import cfg from "../adapters/1992land/config.mjs";
import {
  checkPassword, createSession, verifySession, destroySession,
  parseCookies, sessionCookieHeader, SESSION_COOKIE_NAME,
} from "./auth.mjs";
import { loadProject, saveProject, undoLastSave } from "./project-store.mjs";

const PORT = Number(process.env.DASHBOARD_API_PORT || 4001);
const ALLOWED_ORIGIN = process.env.DASHBOARD_ALLOWED_ORIGIN || "https://1992land.com";
const deps = { repo: cfg.repo, pat: process.env.GITHUB_PAT, branch: cfg.deploy_branch };

function json(res, status, body, extraHeaders = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...extraHeaders });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  return JSON.parse(raw);
}

function requireSession(req) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE_NAME];
  return verifySession(token) ? token : null;
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split("/").filter(Boolean);

  try {
    if (req.method === "POST" && parts[0] === "login") {
      const { password } = await readJsonBody(req);
      if (!checkPassword(password)) return json(res, 401, { error: "Sai mật khẩu" });
      const token = createSession();
      return json(res, 200, { ok: true }, { "Set-Cookie": sessionCookieHeader(token) });
    }

    if (req.method === "POST" && parts[0] === "logout") {
      const token = parseCookies(req.headers.cookie)[SESSION_COOKIE_NAME];
      if (token) destroySession(token);
      return json(res, 200, { ok: true }, { "Set-Cookie": sessionCookieHeader("", { clear: true }) });
    }

    if (!requireSession(req)) return json(res, 401, { error: "Chưa đăng nhập" });

    if (req.method === "GET" && parts[0] === "projects" && parts.length === 2) {
      const slug = parts[1];
      try {
        const project = await loadProject(deps, slug);
        return json(res, 200, { project });
      } catch {
        return json(res, 404, { error: `Không tìm thấy: ${slug}` });
      }
    }

    if (req.method === "POST" && parts[0] === "projects" && parts.length === 3 && parts[2] === "save") {
      const slug = parts[1];
      const patch = await readJsonBody(req);
      try {
        const result = await saveProject(deps, slug, patch);
        return json(res, 200, result);
      } catch (e) {
        const status = /slug|id/i.test(e.message) ? 400 : 502;
        return json(res, status, { error: e.message });
      }
    }

    if (req.method === "POST" && parts[0] === "undo") {
      const { undoKey } = await readJsonBody(req);
      try {
        const result = await undoLastSave(deps, undoKey);
        return json(res, 200, result);
      } catch (e) {
        return json(res, 410, { error: "Hết hạn hoặc đã hoàn tác" });
      }
    }

    return json(res, 404, { error: "Không có route này" });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => console.log(`dashboard-api nghe cổng ${PORT}`));
```

- [ ] **Step 2: Syntax check**

Run: `node --check scripts/tg-bot/api/server.mjs`
Expected: no output (valid syntax).

- [ ] **Step 3: Add PM2 app entry**

Edit `scripts/tg-bot/ecosystem.config.cjs` — add a second entry to the `apps` array (keep the existing `tg-bot-1992land` entry unchanged, same `env` object reused so both processes read the same `scripts/tg-bot/.env`):

```js
module.exports = {
  apps: [
    {
      name:            "tg-bot-1992land",
      script:          "engine/serve.mjs",
      cwd:             __dirname,
      interpreter:     "node",
      env,
      watch:           false,
      autorestart:     true,
      max_restarts:    20,
      restart_delay:   5000,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
    {
      name:            "dashboard-api",
      script:          "api/server.mjs",
      cwd:             __dirname,
      interpreter:     "node",
      env,
      watch:           false,
      autorestart:     true,
      max_restarts:    20,
      restart_delay:   5000,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
```

- [ ] **Step 4: Manual local smoke test**

```bash
cd scripts/tg-bot
DASHBOARD_PASSWORD=test123 DASHBOARD_API_PORT=4099 GITHUB_PAT=dummy node api/server.mjs &
sleep 1
curl -s -i -X POST http://localhost:4099/login -H 'Content-Type: application/json' -d '{"password":"wrong"}'   # expect 401
curl -s -i -X POST http://localhost:4099/login -H 'Content-Type: application/json' -d '{"password":"test123"}' # expect 200 + Set-Cookie
kill %1
```

Expected: first call 401 `{"error":"Sai mật khẩu"}`; second call 200 `{"ok":true}` with a `Set-Cookie: dash_session=...` header present. (The `GET /projects/:slug` route will fail against the dummy PAT — that's expected here; Task 4 verifies it for real against the live VPS + real repo.)

- [ ] **Step 5: Update deploy-vps.sh to manage both PM2 apps**

In `scripts/tg-bot/deploy-vps.sh`, replace the `pm2` block (currently lines ~37-43) with a single command that handles both "not yet running" and "already running" for every app defined in the ecosystem file:

```bash
# --- [4] pm2: startOrReload quản lý cả 2 app (bot + dashboard-api) trong 1 lệnh ---
echo "==> [4/5] pm2 startOrReload"
pm2 startOrReload "$BOT_DIR/ecosystem.config.cjs"
pm2 save >/dev/null 2>&1 || true
```

- [ ] **Step 6: Commit**

```bash
git add scripts/tg-bot/api/server.mjs scripts/tg-bot/ecosystem.config.cjs scripts/tg-bot/deploy-vps.sh
git commit -m "feat(dashboard-api): add HTTP server + wire into PM2/deploy"
```

---

### Task 4: HTTPS front door (Caddy + subdomain) and live deploy verification

**Files:**
- Create: `scripts/tg-bot/Caddyfile` (checked into repo as the source of truth; copied/symlinked into place on the VPS)
- Modify: `.github/workflows/deploy-bot.yml` (add a step to reload Caddy config after deploy, if Caddy is present)

**Manual prerequisite (cannot be done from this session — flag to anh Thọ/Jimmy):**
Add a DNS **A record**: `api.1992land.com` → `160.191.88.139`, in whatever DNS zone manages `1992land.com` (DirectAdmin DNS management, or the registrar if DNS isn't delegated to DirectAdmin — confirm which before this task starts). Without this record, Caddy cannot obtain a Let's Encrypt certificate for the subdomain and the whole task blocks. **Stop and request this from anh Thọ/Jimmy before starting Task 4** if it isn't already in place; do not substitute a self-signed cert or an IP-based workaround — the dashboard's `fetch()` calls need a browser-trusted cert.

- [ ] **Step 1: Confirm DNS is live**

```bash
dig +short api.1992land.com
```

Expected: prints `160.191.88.139`. If empty, stop — this is the blocked-on-human-action case described above.

- [ ] **Step 2: Write the Caddyfile**

Create `scripts/tg-bot/Caddyfile`:

```
api.1992land.com {
	reverse_proxy 127.0.0.1:4001
}
```

- [ ] **Step 3: Install Caddy on the VPS (one-time, manual SSH — same access pattern as existing `deploy-vps.sh`)**

Document these commands (run once by whoever has VPS SSH access — anh Thọ/Jimmy/controller with authorization, matching the project's existing convention of "controller tự làm thao tác SSH/secrets nhạy cảm" for infra):

```bash
# Cài Caddy (Debian/Ubuntu — kiểm tra VPS OS trước khi chạy)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy

# Trỏ Caddy vào Caddyfile trong repo (không copy tay — symlink để lần sau tự cập nhật)
sudo ln -sf /root/bot/scripts/tg-bot/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

(Adjust `/root/bot` if the VPS checkout path differs — confirm the actual path used by `deploy-bot.yml`'s SSH step before running.)

- [ ] **Step 4: Add a Caddy-reload step to the deploy workflow**

In `.github/workflows/deploy-bot.yml`, after the existing `bash scripts/tg-bot/deploy-vps.sh` step (inside the same SSH session/script), add:

```bash
sudo systemctl reload caddy 2>/dev/null || true
```

(`|| true` — do not fail the whole deploy if Caddy isn't installed yet on a given box; this keeps the workflow safe to merge before Step 3 has been run.)

- [ ] **Step 5: End-to-end live verification**

After deploy runs (push to `main` triggers `deploy-bot.yml` since this touches `scripts/tg-bot/**`):

```bash
curl -s -i -X POST https://api.1992land.com/login -H 'Content-Type: application/json' -d '{"password":"WRONG"}'
# expect: HTTP/2 401, {"error":"Sai mật khẩu"}

curl -s -i -X POST https://api.1992land.com/login -H 'Content-Type: application/json' -d '{"password":"<real DASHBOARD_PASSWORD from VPS .env>"}'
# expect: HTTP/2 200, Set-Cookie: dash_session=...

# reuse the cookie from the response above:
curl -s -i https://api.1992land.com/projects/ansana-by-kita -H 'Cookie: dash_session=<token>'
# expect: HTTP/2 200, {"project": { ...full JSON of data/projects/ansana-by-kita.json... }}

curl -s -i https://api.1992land.com/projects/ansana-by-kita
# no cookie — expect: HTTP/2 401, {"error":"Chưa đăng nhập"}
```

Do not report this task complete without pasting actual output from these four commands — this is exactly the kind of "verify before reporting" step called out in the project's `CLAUDE.md`.

- [ ] **Step 6: Commit**

```bash
git add scripts/tg-bot/Caddyfile .github/workflows/deploy-bot.yml
git commit -m "infra(dashboard-api): add Caddy HTTPS front door for api.1992land.com"
```

---

## Explicitly out of scope for Plan 2

- The actual `/dashboard` browser UI, rich-text editor, and live preview — that's Plan 3, and it is the only consumer of the API built here. Nothing in Plan 2 should attempt to build UI.
- Posts (`data/posts/*.md`) editing — v1 is projects-only per spec.
- Per-user accounts / audit log of who saved what — out of scope, single shared password (spec § Đăng nhập).
- Rate limiting beyond the session/password gate — this is a 2-person internal tool behind a password; not internet-facing traffic at meaningful volume.
- Idempotency-key dedup for double-submit `/save` clicks — flagged as a known gap, not required for v1 (the bot itself only dedups Telegram message retries, a different failure mode than a double form-submit; Plan 3 should debounce/disable the Save button client-side instead, which covers the realistic case).
