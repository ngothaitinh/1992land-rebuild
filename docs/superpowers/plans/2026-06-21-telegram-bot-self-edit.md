# Telegram Bot Tự Sửa Nội Dung 24/7 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây bot Telegram Node.js chạy PM2 24/7 trên VPS, tự commit sửa nội dung qua GitHub Contents API và báo khi deploy xong — không cần Claude bật máy.

**Architecture:** Engine/adapter pattern: engine (`scripts/tg-bot/engine/`) xử lý toàn bộ Telegram I/O, GitHub API, deploy-watch; adapter (`scripts/tg-bot/adapters/1992land/config.mjs`) khai báo schema site — sang site mới chỉ viết adapter mới, engine giữ nguyên.

**Tech Stack:** Node.js ≥ 18 ESM, zero npm deps (chỉ built-in `https`, `fs`, `path`), PM2, GitHub Contents API v3, Telegram Bot API.

## Global Constraints

- Node.js ESM (`import`/`export`), không dùng `require` trong engine files
- Zero npm dependencies — chỉ Node.js built-in modules
- Mọi secret trong `.env` trên VPS, KHÔNG commit vào git
- File `scripts/tg-bot/adapters/1992land/config.mjs` ĐƯỢC commit (chỉ khai báo schema, không chứa secret)
- `.tg-processed.json` ở `scripts/tg-bot/` — gitignore nó
- Không xóa hoặc sửa `scripts/tg-cms-template/` (giữ nguyên template cũ)
- Telegram chat IDs đọc từ env `TELEGRAM_ALLOWED_CHAT_IDS` (comma-separated)
- Commit message format: `content: {action} {slug} via telegram`
- `deleteFile` trả về `{ commitSha }` từ GitHub response để `watchDeployment` dùng

---

## File Map

| File | Tạo/Sửa | Vai trò |
|---|---|---|
| `scripts/tg-bot/engine/idempotency.mjs` | Tạo | Lưu message_id đã xử lý, FIFO 500 entries |
| `scripts/tg-bot/engine/parse-command.mjs` | Tạo | Parse `[TRIGGER]` + `Key: value` lines |
| `scripts/tg-bot/engine/github-commit.mjs` | Tạo | `getFile`, `putFile`, `deleteFile` via Contents API |
| `scripts/tg-bot/engine/deploy-watch.mjs` | Tạo | Poll Actions API theo commit SHA → callback |
| `scripts/tg-bot/engine/serve.mjs` | Tạo | Vòng long-poll chính, routing, action executors |
| `scripts/tg-bot/engine/register-commands.mjs` | Tạo | Đăng ký /slash commands (chạy 1 lần) |
| `scripts/tg-bot/adapters/1992land/config.mjs` | Tạo | Schema 1992land: content_types, commands, keyboard |
| `scripts/tg-bot/ecosystem.config.cjs` | Tạo | PM2 config (đọc .env + start engine/serve.mjs) |
| `scripts/tg-bot/.env.example` | Tạo | Template biến môi trường |
| `scripts/tg-bot/tests/parse-command.test.mjs` | Tạo | Unit tests parse-command |
| `scripts/tg-bot/tests/idempotency.test.mjs` | Tạo | Unit tests idempotency |
| `.gitignore` | Sửa | Thêm `scripts/tg-bot/.tg-processed.json` và `scripts/tg-bot/.env` |

---

## Task 1: Scaffold + idempotency.mjs

**Files:**
- Create: `scripts/tg-bot/engine/idempotency.mjs`
- Create: `scripts/tg-bot/tests/idempotency.test.mjs`
- Modify: `.gitignore`

**Interfaces:**
- Produces:
  - `isProcessed(messageId: number): boolean`
  - `markProcessed(messageId: number): void`
  - Data file: `scripts/tg-bot/.tg-processed.json` (array of numbers, max 500)

- [ ] **Step 1: Tạo thư mục**

```bash
mkdir -p scripts/tg-bot/engine scripts/tg-bot/adapters/1992land scripts/tg-bot/tests
```

- [ ] **Step 2: Thêm vào .gitignore**

Mở `.gitignore` (hoặc tạo nếu chưa có), thêm vào cuối:

```
# Telegram bot runtime files
scripts/tg-bot/.env
scripts/tg-bot/.tg-processed.json
```

- [ ] **Step 3: Viết failing test**

```js
// scripts/tg-bot/tests/idempotency.test.mjs
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", ".tg-processed.json");

// Backup và xóa file thật trước mỗi test suite
before(() => {
  if (fs.existsSync(DATA_FILE)) fs.renameSync(DATA_FILE, DATA_FILE + ".bak");
});
after(() => {
  if (fs.existsSync(DATA_FILE)) fs.rmSync(DATA_FILE);
  if (fs.existsSync(DATA_FILE + ".bak")) fs.renameSync(DATA_FILE + ".bak", DATA_FILE);
});

// Import SAU khi đã set __dirname trick
const { isProcessed, markProcessed } = await import("../engine/idempotency.mjs");

test("message chưa xử lý → isProcessed = false", () => {
  assert.equal(isProcessed(999), false);
});

test("sau markProcessed → isProcessed = true", () => {
  markProcessed(111);
  assert.equal(isProcessed(111), true);
});

test("markProcessed idempotent — gọi 2 lần không lỗi", () => {
  markProcessed(222);
  markProcessed(222);
  assert.equal(isProcessed(222), true);
});

test("giữ tối đa 500 entries, FIFO", () => {
  // Đánh dấu 501 message_id khác nhau
  for (let i = 1000; i < 1501; i++) markProcessed(i);
  // message_id đầu tiên đã bị đẩy ra
  assert.equal(isProcessed(1000), false);
  // message_id cuối còn đó
  assert.equal(isProcessed(1500), true);
});
```

- [ ] **Step 4: Chạy test — xác nhận FAIL**

```bash
node --test scripts/tg-bot/tests/idempotency.test.mjs
```

Expected: lỗi `Cannot find module '../engine/idempotency.mjs'`

- [ ] **Step 5: Viết idempotency.mjs**

```js
// scripts/tg-bot/engine/idempotency.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", ".tg-processed.json");
const MAX_ENTRIES = 500;

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}

function save(arr) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr));
}

export function isProcessed(messageId) {
  return load().includes(messageId);
}

export function markProcessed(messageId) {
  const arr = load();
  if (arr.includes(messageId)) return;
  arr.push(messageId);
  if (arr.length > MAX_ENTRIES) arr.splice(0, arr.length - MAX_ENTRIES);
  save(arr);
}
```

- [ ] **Step 6: Chạy test — xác nhận PASS**

```bash
node --test scripts/tg-bot/tests/idempotency.test.mjs
```

Expected: `✓ 4 tests passed`

- [ ] **Step 7: Commit**

```bash
git add scripts/tg-bot/engine/idempotency.mjs scripts/tg-bot/tests/idempotency.test.mjs .gitignore
git commit -m "feat(tg-bot): scaffold + idempotency module"
```

---

## Task 2: parse-command.mjs

**Files:**
- Create: `scripts/tg-bot/engine/parse-command.mjs`
- Create: `scripts/tg-bot/tests/parse-command.test.mjs`

**Interfaces:**
- Produces:
  ```js
  parseCommand(text: string): {
    trigger: string | null,  // "[SỬA DỰ ÁN]" — giữ nguyên casing gốc
    slug: string | null,     // dòng "Slug: ..."
    field: string | null,    // dòng "Trường: ..."
    value: string | null,    // dòng "Giá trị: ..."
    section: string | null,  // dòng "Phần: ..."
    raw: string,
  }
  ```

- [ ] **Step 1: Viết failing test**

```js
// scripts/tg-bot/tests/parse-command.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCommand } from "../engine/parse-command.mjs";

test("set_field đầy đủ", () => {
  const r = parseCommand("[SỬA DỰ ÁN]\nSlug: salacia-villas-phu-my\nTrường: priceRange\nGiá trị: Từ 5.2 tỷ");
  assert.equal(r.trigger, "[SỬA DỰ ÁN]");
  assert.equal(r.slug, "salacia-villas-phu-my");
  assert.equal(r.field, "priceRange");
  assert.equal(r.value, "Từ 5.2 tỷ");
  assert.equal(r.section, null);
});

test("ẩn phần", () => {
  const r = parseCommand("[ẨN PHẦN]\nSlug: lusso-sai-gon\nPhần: gia-ban");
  assert.equal(r.trigger, "[ẨN PHẦN]");
  assert.equal(r.slug, "lusso-sai-gon");
  assert.equal(r.section, "gia-ban");
  assert.equal(r.field, null);
});

test("xóa — chỉ cần slug", () => {
  const r = parseCommand("[XÓA DỰ ÁN]\nSlug: water-concept");
  assert.equal(r.trigger, "[XÓA DỰ ÁN]");
  assert.equal(r.slug, "water-concept");
});

test("không có trigger → null", () => {
  const r = parseCommand("hello bot ơi giúp tao với");
  assert.equal(r.trigger, null);
  assert.equal(r.slug, null);
});

test("text rỗng", () => {
  const r = parseCommand("");
  assert.equal(r.trigger, null);
});

test("trigger có khoảng trắng thừa", () => {
  const r = parseCommand("  [THÊM BÀI]  \nSlug: my-post");
  assert.equal(r.trigger, "[THÊM BÀI]");
  assert.equal(r.slug, "my-post");
});

test("Giá trị có dấu phẩy và chữ số", () => {
  const r = parseCommand("[SỬA DỰ ÁN]\nSlug: abc\nTrường: priceRange\nGiá trị: Từ 2.1 tỷ — 5 tỷ");
  assert.equal(r.value, "Từ 2.1 tỷ — 5 tỷ");
});

test("thêm bài — không có field/value", () => {
  const r = parseCommand("[THÊM BÀI]\nSlug: bai-moi\nTiêu đề: Test post");
  assert.equal(r.trigger, "[THÊM BÀI]");
  assert.equal(r.slug, "bai-moi");
  // các key không nhận dạng được thì bỏ qua
  assert.equal(r.field, null);
});
```

- [ ] **Step 2: Chạy test — xác nhận FAIL**

```bash
node --test scripts/tg-bot/tests/parse-command.test.mjs
```

Expected: `Cannot find module '../engine/parse-command.mjs'`

- [ ] **Step 3: Viết parse-command.mjs**

```js
// scripts/tg-bot/engine/parse-command.mjs

// Key aliases: tiếng Việt có dấu và không dấu, cả hai đều nhận
const KEY_MAP = {
  "slug":     "slug",
  "trường":   "field",
  "truong":   "field",
  "field":    "field",
  "giá trị":  "value",
  "gia tri":  "value",
  "value":    "value",
  "giá":      "value",
  "phần":     "section",
  "phan":     "section",
  "section":  "section",
};

export function parseCommand(text) {
  const result = { trigger: null, slug: null, field: null, value: null, section: null, raw: text };
  const lines = (text || "")
    .trim()
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (!lines.length) return result;

  // Dòng đầu: phải khớp [TÊN LỆNH]
  const firstMatch = lines[0].match(/^\[(.+)\]$/);
  if (!firstMatch) return result;
  result.trigger = `[${firstMatch[1]}]`;

  // Các dòng sau: Key: value
  for (let i = 1; i < lines.length; i++) {
    const colonIdx = lines[i].indexOf(":");
    if (colonIdx === -1) continue;
    const rawKey = lines[i].slice(0, colonIdx).trim().toLowerCase();
    const val    = lines[i].slice(colonIdx + 1).trim();
    const mapped = KEY_MAP[rawKey];
    if (mapped && val) result[mapped] = val;
  }

  return result;
}
```

- [ ] **Step 4: Chạy test — xác nhận PASS**

```bash
node --test scripts/tg-bot/tests/parse-command.test.mjs
```

Expected: `✓ 7 tests passed`

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/engine/parse-command.mjs scripts/tg-bot/tests/parse-command.test.mjs
git commit -m "feat(tg-bot): parse-command module"
```

---

## Task 3: github-commit.mjs

**Files:**
- Create: `scripts/tg-bot/engine/github-commit.mjs`

**Interfaces:**
- Consumes: Node built-in `https`
- Produces:
  ```js
  getFile(repo, branch, filePath, pat): Promise<{ content: string, sha: string }>
  putFile(repo, branch, filePath, content, sha, commitMsg, pat): Promise<{ commitSha: string }>
  deleteFile(repo, branch, filePath, sha, commitMsg, pat): Promise<{ commitSha: string }>
  ```
  - `repo`: `"owner/name"` e.g. `"ngothaitinh/1992land-rebuild"`
  - `content`: UTF-8 string (raw file content, không phải base64)
  - `commitSha`: SHA của commit mới tạo ra (dùng cho `watchDeployment`)

- [ ] **Step 1: Viết github-commit.mjs**

```js
// scripts/tg-bot/engine/github-commit.mjs
import https from "node:https";

function ghRequest(method, apiPath, body, pat) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: "api.github.com",
        path: apiPath,
        method,
        headers: {
          Authorization:  `Bearer ${pat}`,
          "User-Agent":   "tg-cms-bot/1.0",
          Accept:         "application/vnd.github+json",
          "Content-Type": "application/json",
          ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            const j = d ? JSON.parse(d) : {};
            if (res.statusCode >= 400)
              reject(new Error(`GitHub ${res.statusCode}: ${j.message || d.slice(0, 200)}`));
            else resolve(j);
          } catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

export async function getFile(repo, branch, filePath, pat) {
  const data = await ghRequest(
    "GET",
    `/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`,
    null,
    pat
  );
  return {
    content: Buffer.from(data.content, "base64").toString("utf8"),
    sha:     data.sha,
  };
}

export async function putFile(repo, branch, filePath, content, sha, commitMsg, pat) {
  const data = await ghRequest(
    "PUT",
    `/repos/${repo}/contents/${filePath}`,
    {
      message: commitMsg,
      content: Buffer.from(content).toString("base64"),
      sha,
      branch,
    },
    pat
  );
  return { commitSha: data.commit.sha };
}

export async function deleteFile(repo, branch, filePath, sha, commitMsg, pat) {
  const data = await ghRequest(
    "DELETE",
    `/repos/${repo}/contents/${filePath}`,
    { message: commitMsg, sha, branch },
    pat
  );
  return { commitSha: data.commit.sha };
}
```

- [ ] **Step 2: Kiểm tra exports**

```bash
node --input-type=module <<'EOF'
import { getFile, putFile, deleteFile } from "./scripts/tg-bot/engine/github-commit.mjs";
console.log(typeof getFile, typeof putFile, typeof deleteFile);
EOF
```

Expected: `function function function`

- [ ] **Step 3: Commit**

```bash
git add scripts/tg-bot/engine/github-commit.mjs
git commit -m "feat(tg-bot): github-commit module (Contents API)"
```

---

## Task 4: deploy-watch.mjs

**Files:**
- Create: `scripts/tg-bot/engine/deploy-watch.mjs`

**Interfaces:**
- Consumes: Node built-in `https`
- Produces:
  ```js
  watchDeployment(
    repo: string,
    commitSha: string,
    pat: string,
    onDone: (status: "success"|"failure"|"cancelled"|"timeout", runUrl: string) => void
  ): void
  ```
  - Non-blocking: dùng `setInterval`, không chặn poll loop chính
  - `onDone` gọi đúng 1 lần
  - Timeout sau 20 phút → status `"timeout"`, runUrl = `https://github.com/{repo}/actions`
  - Poll mỗi 30 giây

- [ ] **Step 1: Viết deploy-watch.mjs**

```js
// scripts/tg-bot/engine/deploy-watch.mjs
import https from "node:https";

function ghGet(apiPath, pat) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.github.com",
        path: apiPath,
        method: "GET",
        headers: {
          Authorization: `Bearer ${pat}`,
          "User-Agent":  "tg-cms-bot/1.0",
          Accept:        "application/vnd.github+json",
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try { resolve(JSON.parse(d)); }
          catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

export function watchDeployment(repo, commitSha, pat, onDone) {
  const INTERVAL_MS = 30_000;         // poll mỗi 30s
  const TIMEOUT_MS  = 20 * 60_000;   // bỏ cuộc sau 20 phút
  const startedAt   = Date.now();
  let   called      = false;
  let   intervalId;

  async function check() {
    if (called) return;

    if (Date.now() - startedAt > TIMEOUT_MS) {
      called = true;
      clearInterval(intervalId);
      onDone("timeout", `https://github.com/${repo}/actions`);
      return;
    }

    try {
      const data = await ghGet(
        `/repos/${repo}/actions/runs?head_sha=${commitSha}&per_page=5`,
        pat
      );
      const run = (data.workflow_runs || []).find((r) => r.head_sha === commitSha);
      if (!run) return; // Actions chưa kịp tạo run, thử lại

      if (run.status === "completed") {
        called = true;
        clearInterval(intervalId);
        // conclusion: "success" | "failure" | "cancelled" | "skipped" | "timed_out" | ...
        onDone(run.conclusion, run.html_url);
      }
    } catch (e) {
      console.error("[deploy-watch] poll error:", e.message, "— thử lại sau 30s");
      // Không clear interval — tự thử lại
    }
  }

  // Bắt đầu poll sau 30s (Actions cần thời gian pick up commit)
  intervalId = setInterval(check, INTERVAL_MS);
}
```

- [ ] **Step 2: Kiểm tra export**

```bash
node --input-type=module <<'EOF'
import { watchDeployment } from "./scripts/tg-bot/engine/deploy-watch.mjs";
console.log(typeof watchDeployment);
EOF
```

Expected: `function`

- [ ] **Step 3: Commit**

```bash
git add scripts/tg-bot/engine/deploy-watch.mjs
git commit -m "feat(tg-bot): deploy-watch module (Actions API polling)"
```

---

## Task 5: Adapter 1992land + .env.example + ecosystem.config.cjs

**Files:**
- Create: `scripts/tg-bot/adapters/1992land/config.mjs`
- Create: `scripts/tg-bot/.env.example`
- Create: `scripts/tg-bot/ecosystem.config.cjs`

**Interfaces:**
- Consumes: env vars `TELEGRAM_ALLOWED_CHAT_IDS`
- Produces: config object đọc bởi `serve.mjs`:
  ```js
  {
    repo, deploy_branch, bot_name, site_name,
    allowed_chat_ids: string[],
    content_types: { [name]: { dir, format, editable_fields } },
    commands: { trigger, action, content_type }[],
    keyboard_rows: string[][],
  }
  ```

- [ ] **Step 1: Viết adapter config**

```js
// scripts/tg-bot/adapters/1992land/config.mjs
export default {
  repo:          "ngothaitinh/1992land-rebuild",
  deploy_branch: "main",
  bot_name:      "Bot 1992 Land",
  site_name:     "1992land.com",

  // Điền chat IDs vào TELEGRAM_ALLOWED_CHAT_IDS trong .env (comma-separated)
  // Ví dụ: TELEGRAM_ALLOWED_CHAT_IDS=123456789,987654321
  allowed_chat_ids: (process.env.TELEGRAM_ALLOWED_CHAT_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  content_types: {
    project: {
      dir:             "data/projects",
      format:          "json",
      editable_fields: [
        "title", "location", "priceRange", "status", "type", "excerpt",
        "developer", "area", "district", "city",
      ],
    },
    post: {
      dir:             "data/posts",
      format:          "md-frontmatter",
      editable_fields: ["title", "excerpt", "category"],
    },
  },

  commands: [
    { trigger: "[SỬA DỰ ÁN]",  action: "set_field",    content_type: "project" },
    { trigger: "[ẨN PHẦN]",    action: "hide_section", content_type: "project" },
    { trigger: "[HIỆN PHẦN]",  action: "show_section", content_type: "project" },
    { trigger: "[XÓA DỰ ÁN]", action: "delete",       content_type: "project" },
    { trigger: "[SỬA BÀI]",   action: "set_field",    content_type: "post"    },
    { trigger: "[XÓA BÀI]",   action: "delete",       content_type: "post"    },
    { trigger: "[THÊM DỰ ÁN]",action: "inbox",        content_type: "project" },
    { trigger: "[THÊM BÀI]",  action: "inbox",        content_type: "post"    },
  ],

  keyboard_rows: [
    ["[SỬA DỰ ÁN]",  "[ẨN PHẦN]",    "[HIỆN PHẦN]"],
    ["[XÓA DỰ ÁN]",  "[SỬA BÀI]",    "[XÓA BÀI]"],
    ["[THÊM DỰ ÁN]", "[THÊM BÀI]"],
  ],
};
```

- [ ] **Step 2: Viết .env.example**

```bash
# scripts/tg-bot/.env.example
# Copy sang .env rồi điền giá trị thật

TELEGRAM_BOT_TOKEN=7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_ALLOWED_CHAT_IDS=123456789,987654321
GITHUB_PAT=github_pat_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=ngothaitinh/1992land-rebuild
ADAPTER=1992land
```

Tạo file:

```bash
cat > scripts/tg-bot/.env.example << 'EOF'
# Copy sang .env rồi điền giá trị thật

TELEGRAM_BOT_TOKEN=7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_ALLOWED_CHAT_IDS=123456789,987654321
GITHUB_PAT=github_pat_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=ngothaitinh/1992land-rebuild
ADAPTER=1992land
EOF
```

- [ ] **Step 3: Viết ecosystem.config.cjs**

```js
// scripts/tg-bot/ecosystem.config.cjs
const fs   = require("fs");
const path = require("path");

const ENV_FILE = path.join(__dirname, ".env");
const env = {};

try {
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf("=");
    if (idx === -1) continue;
    const k = t.slice(0, idx).trim();
    const v = t.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (k) env[k] = v;
  }
} catch (e) {
  if (e.code !== "ENOENT") console.error("Không đọc được .env:", e.message);
}

module.exports = {
  apps: [{
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
  }],
};
```

- [ ] **Step 4: Commit**

```bash
git add scripts/tg-bot/adapters/1992land/config.mjs scripts/tg-bot/.env.example scripts/tg-bot/ecosystem.config.cjs
git commit -m "feat(tg-bot): 1992land adapter + PM2 config + env example"
```

---

## Task 6: serve.mjs — main bot loop

**Files:**
- Create: `scripts/tg-bot/engine/serve.mjs`

**Interfaces:**
- Consumes:
  - `parseCommand` từ `./parse-command.mjs`
  - `isProcessed`, `markProcessed` từ `./idempotency.mjs`
  - `getFile`, `putFile`, `deleteFile` từ `./github-commit.mjs`
  - `watchDeployment` từ `./deploy-watch.mjs`
  - Adapter config tại `../adapters/${ADAPTER}/config.mjs`
  - Env: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_CHAT_IDS` (via adapter), `GITHUB_PAT`, `GITHUB_REPO`, `ADAPTER`
- Produces: process running 24/7, xử lý Telegram updates

**Luồng chính:**
1. Long-poll `getUpdates` (timeout=30s)
2. Mỗi message: whitelist check → idempotency check → parse → route → execute
3. Mỗi callback_query: route `tpl:`, `confirm_del:`, `cancel_del:`

- [ ] **Step 1: Viết serve.mjs**

```js
// scripts/tg-bot/engine/serve.mjs
import https from "node:https";
import fs   from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseCommand  } from "./parse-command.mjs";
import { isProcessed, markProcessed } from "./idempotency.mjs";
import { getFile, putFile, deleteFile } from "./github-commit.mjs";
import { watchDeployment } from "./deploy-watch.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "..", "..", "..");   // project root

// ─── Env ─────────────────────────────────────────────────────────────────────
const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const PAT     = process.env.GITHUB_PAT;
const REPO    = process.env.GITHUB_REPO;
const ADAPTER = process.env.ADAPTER || "1992land";

if (!TOKEN || !PAT || !REPO) {
  console.error("❌ Thiếu env: TELEGRAM_BOT_TOKEN, GITHUB_PAT, GITHUB_REPO");
  process.exit(1);
}

// ─── Load adapter ─────────────────────────────────────────────────────────────
const adapterPath = path.join(__dirname, "..", "adapters", ADAPTER, "config.mjs");
if (!fs.existsSync(adapterPath)) {
  console.error(`❌ Adapter không tồn tại: ${adapterPath}`);
  process.exit(1);
}
const { default: cfg } = await import(pathToFileURL(adapterPath).href);

// Map trigger (lowercase) → command object
const triggerMap = new Map(cfg.commands.map((c) => [c.trigger.toLowerCase(), c]));

// ─── Telegram helpers ─────────────────────────────────────────────────────────
function tgApi(method, params = {}) {
  const body = JSON.stringify(params);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path:     `/bot${TOKEN}/${method}`,
        method:   "POST",
        headers:  {
          "Content-Type":   "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            const j = JSON.parse(d);
            j.ok ? resolve(j.result) : reject(new Error(`${method}: ${j.description}`));
          } catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function send(chatId, text, extra = {}) {
  return tgApi("sendMessage", {
    chat_id: chatId, text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

// ─── Keyboard ─────────────────────────────────────────────────────────────────
const MAIN_KB = {
  inline_keyboard: cfg.keyboard_rows.map((row) =>
    row.map((trigger) => ({ text: trigger, callback_data: `tpl:${trigger}` }))
  ),
};

function buildTemplateText(trigger) {
  const cmd = triggerMap.get(trigger.toLowerCase());
  if (!cmd) return null;
  const ct    = cfg.content_types[cmd.content_type];
  const lines = [trigger, "Slug: "];
  if (cmd.action === "set_field") {
    lines.push("Trường: ");
    lines.push("Giá trị: ");
    if (ct?.editable_fields)
      lines.push(`\n<i>Trường được phép: ${ct.editable_fields.join(", ")}</i>`);
  } else if (cmd.action === "hide_section" || cmd.action === "show_section") {
    lines.push("Phần: ");
  }
  return lines.join("\n");
}

// ─── Pending deletes (in-memory, TTL 5 min) ───────────────────────────────────
// key: "del:{chatId}:{slug}:{contentType}"
// value: { sha, filePath, title, cmd }
const pendingDeletes = new Map();

// ─── Inbox ────────────────────────────────────────────────────────────────────
async function saveToInbox(msg, text) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir   = path.join(ROOT, "content-inbox", stamp);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "message.txt"), (text || "").trim() + "\n");

  const photos = msg.photo ? [msg.photo[msg.photo.length - 1]] : [];
  let imgN = 0;
  for (const p of photos) {
    try {
      const file = await tgApi("getFile", { file_id: p.file_id });
      const url  = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
      imgN++;
      const dest = path.join(dir, `img-${imgN}${path.extname(file.file_path) || ".jpg"}`);
      await new Promise((resolve, reject) => {
        const f = fs.createWriteStream(dest);
        https.get(url, (res) => { res.pipe(f); f.on("finish", () => f.close(resolve)); })
          .on("error", reject);
      });
    } catch (e) { console.error("[inbox] lỗi ảnh:", e.message); }
  }
  console.log(`[inbox] ${stamp} | "${(text || "").slice(0, 60)}" | ${imgN} ảnh`);
}

// ─── Action: set_field ────────────────────────────────────────────────────────
async function execSetField(chatId, cmd, parsed) {
  const ct = cfg.content_types[cmd.content_type];
  const { slug, field, value } = parsed;

  if (!slug)  return send(chatId, "❌ Thiếu <code>Slug:</code>");
  if (!field) return send(chatId, "❌ Thiếu <code>Trường:</code>");
  if (!value) return send(chatId, "❌ Thiếu <code>Giá trị:</code>");

  if (!ct.editable_fields.includes(field))
    return send(chatId,
      `❌ Trường <code>${field}</code> không cho sửa bằng bot.\n` +
      `Trường được phép: ${ct.editable_fields.join(", ")}`
    );

  const ext      = ct.format === "json" ? "json" : "md";
  const filePath = `${ct.dir}/${slug}.${ext}`;

  let sha, content;
  try { ({ sha, content } = await getFile(REPO, cfg.deploy_branch, filePath, PAT)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  let newContent;
  if (ct.format === "json") {
    const obj = JSON.parse(content);
    if (typeof obj[field] === "object" && obj[field] !== null)
      return send(chatId,
        `❌ Trường <code>${field}</code> là object — cần Claude soạn.\nGửi [THÊM DỰ ÁN] để inbox.`
      );
    obj[field]    = value;
    obj.updated_at = new Date().toISOString();
    newContent    = JSON.stringify(obj, null, 2) + "\n";
  } else {
    // md-frontmatter: thay thế dòng `field: ...` trong block ---
    const replaced = content.replace(
      new RegExp(`^(${field}:\\s*)(.*)$`, "m"),
      `$1${value}`
    );
    newContent = replaced === content
      ? content.replace(/^---\s*$/m, `${field}: ${value}\n---`)  // field chưa tồn tại
      : replaced;
  }

  let commitSha;
  try {
    ({ commitSha } = await putFile(
      REPO, cfg.deploy_branch, filePath, newContent, sha,
      `content: set ${field} on ${slug} via telegram`, PAT
    ));
  } catch (e) {
    return send(chatId, `⚠️ Lỗi GitHub API: ${e.message}`);
  }

  await send(chatId, `✏️ Đã cập nhật <b>${field}</b> → "<code>${value}</code>"\nĐang chờ build…`);

  watchDeployment(REPO, commitSha, PAT, async (status, runUrl) => {
    if (status === "success")
      await send(chatId, `✅ <b>${cfg.site_name}</b> đã cập nhật xong.`).catch(console.error);
    else if (status === "timeout")
      await send(chatId, `⏱ Build đang lâu bất thường. Kiểm tra: ${runUrl}`).catch(console.error);
    else
      await send(chatId, `⚠️ Build lỗi (${status}), web chưa cập nhật.\n${runUrl}`).catch(console.error);
  });
}

// ─── Action: hide_section / show_section ─────────────────────────────────────
async function execHideShow(chatId, cmd, parsed, isShow) {
  const ct = cfg.content_types[cmd.content_type];
  const { slug, section } = parsed;

  if (!slug)    return send(chatId, "❌ Thiếu <code>Slug:</code>");
  if (!section) return send(chatId, "❌ Thiếu <code>Phần:</code>");

  const filePath = `${ct.dir}/${slug}.json`;
  let sha, content;
  try { ({ sha, content } = await getFile(REPO, cfg.deploy_branch, filePath, PAT)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  const obj = JSON.parse(content);
  const cur = Array.isArray(obj.hidden_sections) ? [...obj.hidden_sections] : [];
  let next;
  if (isShow) {
    next = cur.filter((k) => k !== section);
    if (next.length === cur.length)
      return send(chatId, `ℹ️ Phần <code>${section}</code> vốn không bị ẩn.`);
  } else {
    if (cur.includes(section))
      return send(chatId, `ℹ️ Phần <code>${section}</code> đã ẩn sẵn.`);
    next = [...cur, section];
  }
  obj.hidden_sections = next;
  obj.updated_at      = new Date().toISOString();

  let commitSha;
  try {
    ({ commitSha } = await putFile(
      REPO, cfg.deploy_branch, filePath, JSON.stringify(obj, null, 2) + "\n", sha,
      `content: ${isShow ? "show" : "hide"} section ${section} on ${slug} via telegram`, PAT
    ));
  } catch (e) {
    return send(chatId, `⚠️ Lỗi GitHub API: ${e.message}`);
  }

  const icon = isShow ? "👁" : "🙈";
  const verb = isShow ? "Đã hiện" : "Đã ẩn";
  await send(chatId, `${icon} ${verb} phần <b>${section}</b> trên <code>${slug}</code>\nĐang chờ build…`);

  watchDeployment(REPO, commitSha, PAT, async (status, runUrl) => {
    if (status === "success")
      await send(chatId, `✅ <b>${cfg.site_name}</b> đã cập nhật xong.`).catch(console.error);
    else
      await send(chatId, `⚠️ Build lỗi (${status}).\n${runUrl}`).catch(console.error);
  });
}

// ─── Action: delete (confirm gate) ────────────────────────────────────────────
async function execDelete(chatId, cmd, parsed) {
  const ct  = cfg.content_types[cmd.content_type];
  const { slug } = parsed;
  if (!slug) return send(chatId, "❌ Thiếu <code>Slug:</code>");

  const ext      = ct.format === "json" ? "json" : "md";
  const filePath = `${ct.dir}/${slug}.${ext}`;

  let sha, content;
  try { ({ sha, content } = await getFile(REPO, cfg.deploy_branch, filePath, PAT)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  let title = slug;
  try { if (ct.format === "json") title = JSON.parse(content).title || slug; } catch {}

  const pendingKey = `del:${chatId}:${slug}:${cmd.content_type}`;
  pendingDeletes.set(pendingKey, { sha, filePath, title, cmd });
  setTimeout(() => pendingDeletes.delete(pendingKey), 5 * 60 * 1000);

  const label = cmd.content_type === "project" ? "dự án" : "bài viết";
  await send(
    chatId,
    `🗑 Xóa ${label}: <b>${title}</b> (<code>${slug}</code>)\n` +
    `File: <code>${filePath}</code>\n` +
    `⚠️ Thao tác không hoàn tác được qua bot (git vẫn khôi phục được).`,
    {
      reply_markup: { inline_keyboard: [[
        { text: "✅ Xác nhận xóa", callback_data: `confirm_del:${pendingKey}` },
        { text: "❌ Hủy",          callback_data: `cancel_del:${pendingKey}` },
      ]] },
    }
  );
}

// ─── Message handler ───────────────────────────────────────────────────────────
async function handleMessage(msg) {
  const chatIdStr = String(msg.chat.id);
  const allowed   = cfg.allowed_chat_ids.map(String);
  if (allowed.length && !allowed.includes(chatIdStr)) return; // người lạ

  const text  = (msg.text || msg.caption || "").trim();
  const lower = text.toLowerCase();

  // /start hoặc menu triggers
  if (["/start", "/menu", "menu", "mẫu", "help"].includes(lower)) {
    await send(msg.chat.id, `📋 <b>${cfg.bot_name}</b> — Chọn thao tác:`, { reply_markup: MAIN_KB });
    return;
  }

  // Idempotency
  if (isProcessed(msg.message_id)) return;

  const parsed = parseCommand(text);

  if (!parsed.trigger) {
    await send(msg.chat.id, "Không nhận ra lệnh. Chọn thao tác:", { reply_markup: MAIN_KB });
    return;
  }

  const cmd = triggerMap.get(parsed.trigger.toLowerCase());
  if (!cmd) {
    await send(msg.chat.id, `❌ Lệnh <code>${parsed.trigger}</code> không được cấu hình.`);
    markProcessed(msg.message_id);
    return;
  }

  markProcessed(msg.message_id);

  try {
    if      (cmd.action === "inbox")        { await saveToInbox(msg, text); await send(msg.chat.id, "📥 Đã nhận! Nội dung sẽ được Claude soạn và gửi bản xem trước để duyệt."); }
    else if (cmd.action === "set_field")    await execSetField(msg.chat.id, cmd, parsed);
    else if (cmd.action === "hide_section") await execHideShow(msg.chat.id, cmd, parsed, false);
    else if (cmd.action === "show_section") await execHideShow(msg.chat.id, cmd, parsed, true);
    else if (cmd.action === "delete")       await execDelete(msg.chat.id, cmd, parsed);
  } catch (e) {
    console.error("[handleMessage]", e.message);
    await send(msg.chat.id, `⚠️ Lỗi nội bộ: ${e.message}`).catch(() => {});
  }
}

// ─── Callback handler ─────────────────────────────────────────────────────────
async function handleCallbackQuery(cq) {
  const chatIdStr = String(cq.message?.chat?.id);
  const allowed   = cfg.allowed_chat_ids.map(String);
  if (allowed.length && !allowed.includes(chatIdStr)) return;

  await tgApi("answerCallbackQuery", { callback_query_id: cq.id }).catch(() => {});

  const data = cq.data || "";

  // Nút menu → gửi mẫu điền sẵn
  if (data.startsWith("tpl:")) {
    const trigger = data.slice(4);
    const tmpl    = buildTemplateText(trigger);
    if (tmpl) await send(cq.message.chat.id, tmpl, { reply_markup: MAIN_KB });
    return;
  }

  // Xác nhận xóa
  if (data.startsWith("confirm_del:")) {
    const key     = data.slice("confirm_del:".length);
    const pending = pendingDeletes.get(key);
    if (!pending) {
      await send(cq.message.chat.id, "⏱ Xác nhận đã hết hạn (5 phút). Gửi lại lệnh xóa nếu cần.");
      return;
    }
    pendingDeletes.delete(key);

    let commitSha;
    try {
      ({ commitSha } = await deleteFile(
        REPO, cfg.deploy_branch, pending.filePath, pending.sha,
        `content: delete ${pending.filePath} via telegram`, PAT
      ));
    } catch (e) {
      return send(cq.message.chat.id, `⚠️ Lỗi xóa: ${e.message}`);
    }

    await send(cq.message.chat.id, `🗑 Đã xóa <b>${pending.title}</b>. Đang chờ build…`);
    watchDeployment(REPO, commitSha, PAT, async (status, runUrl) => {
      if (status === "success")
        await send(cq.message.chat.id, `✅ <b>${cfg.site_name}</b> đã cập nhật xong.`).catch(console.error);
      else
        await send(cq.message.chat.id, `⚠️ Build lỗi (${status}).\n${runUrl}`).catch(console.error);
    });
    return;
  }

  // Hủy xóa
  if (data.startsWith("cancel_del:")) {
    pendingDeletes.delete(data.slice("cancel_del:".length));
    await send(cq.message.chat.id, "❌ Đã hủy, không xóa gì.");
  }
}

// ─── Poll loop ─────────────────────────────────────────────────────────────────
let offset = 0;

async function poll() {
  console.log(`🤖 ${cfg.bot_name} đang chạy (adapter: ${ADAPTER}). Ctrl+C để tắt.\n`);
  while (true) {
    try {
      const updates = await tgApi("getUpdates", {
        offset,
        timeout: 30,
        allowed_updates: ["message", "callback_query"],
      });
      for (const u of updates) {
        offset = u.update_id + 1;
        try {
          if (u.message)        await handleMessage(u.message);
          if (u.callback_query) await handleCallbackQuery(u.callback_query);
        } catch (e) {
          console.error(`[error] update ${u.update_id}:`, e.message);
        }
      }
    } catch (e) {
      console.error("[poll error]", e.message, "— thử lại sau 5 giây…");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

poll();
```

- [ ] **Step 2: Chạy syntax check (không cần token thật)**

```bash
node --check scripts/tg-bot/engine/serve.mjs
```

Expected: không có output (0 lỗi cú pháp)

- [ ] **Step 3: Commit**

```bash
git add scripts/tg-bot/engine/serve.mjs
git commit -m "feat(tg-bot): serve.mjs — main bot loop with all action executors"
```

---

## Task 7: register-commands.mjs + VPS Deploy + Smoke Test

**Files:**
- Create: `scripts/tg-bot/engine/register-commands.mjs`

- [ ] **Step 1: Viết register-commands.mjs**

```js
// scripts/tg-bot/engine/register-commands.mjs
// Chạy 1 lần để đăng ký /slash commands với Telegram BotFather
// Usage: TELEGRAM_BOT_TOKEN=... ADAPTER=1992land node engine/register-commands.mjs
import https from "node:https";
import path  from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const ADAPTER = process.env.ADAPTER || "1992land";

if (!TOKEN) { console.error("❌ Thiếu TELEGRAM_BOT_TOKEN"); process.exit(1); }

const adapterPath = path.join(__dirname, "..", "adapters", ADAPTER, "config.mjs");
const { default: cfg } = await import(pathToFileURL(adapterPath).href);

// Telegram command names: chỉ [a-z0-9_], max 32 ký tự
function toCommandName(trigger) {
  return trigger
    .replace(/^\[|\]$/g, "")          // bỏ []
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // bỏ dấu tiếng Việt
    .replace(/đ/g, "d")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);
}

const commands = [
  { command: "menu",  description: "Xem menu thao tác" },
  { command: "start", description: "Khởi động bot" },
  ...cfg.commands.map((c) => ({
    command:     toCommandName(c.trigger),
    description: c.trigger,
  })),
];

const body = JSON.stringify({ commands });
const req  = https.request(
  {
    hostname: "api.telegram.org",
    path:     `/bot${TOKEN}/setMyCommands`,
    method:   "POST",
    headers:  { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
  },
  (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      const j = JSON.parse(d);
      if (j.ok) console.log(`✅ Đã đăng ký ${commands.length} lệnh Telegram cho adapter "${ADAPTER}".`);
      else console.error("❌ Lỗi:", j.description);
    });
  }
);
req.write(body);
req.end();
```

- [ ] **Step 2: Commit**

```bash
git add scripts/tg-bot/engine/register-commands.mjs
git commit -m "feat(tg-bot): register-commands script"
git push origin main
```

- [ ] **Step 3: SSH vào VPS, clone/pull code**

```bash
# Trên VPS (SSH vào trước)
cd /home/<user>/   # hoặc thư mục bạn muốn đặt
git pull origin main
# Nếu lần đầu: git clone https://github.com/ngothaitinh/1992land-rebuild.git
```

- [ ] **Step 4: Tạo .env trên VPS**

```bash
cd /path/to/1992land-rebuild/scripts/tg-bot
cp .env.example .env
nano .env   # điền giá trị thật:
# TELEGRAM_BOT_TOKEN=<token từ BotFather>
# TELEGRAM_ALLOWED_CHAT_IDS=<chat_id anh Thọ>,<chat_id Jimmy>
# GITHUB_PAT=<personal access token, scope: repo>
# GITHUB_REPO=ngothaitinh/1992land-rebuild
# ADAPTER=1992land
```

Lấy chat ID: nhắn bot bất kỳ 1 tin, rồi:
```bash
curl "https://api.telegram.org/bot<TOKEN>/getUpdates" | grep -o '"id":[0-9]*' | head -1
```

- [ ] **Step 5: Cài PM2 (nếu chưa có) + khởi động bot**

```bash
npm install -g pm2
cd /path/to/1992land-rebuild/scripts/tg-bot
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # copy-paste lệnh hiện ra để tự start khi reboot
```

Kiểm tra đang chạy:
```bash
pm2 status
pm2 logs tg-bot-1992land --lines 20
```

Expected log: `🤖 Bot 1992 Land đang chạy (adapter: 1992land). Ctrl+C để tắt.`

- [ ] **Step 6: Đăng ký /slash commands (1 lần)**

```bash
cd /path/to/1992land-rebuild/scripts/tg-bot
node engine/register-commands.mjs
```

Expected: `✅ Đã đăng ký 10 lệnh Telegram cho adapter "1992land".`

- [ ] **Step 7: Smoke test — sửa 1 trường nhỏ**

Gửi vào bot Telegram:
```
[SỬA DỰ ÁN]
Slug: blanca-city-vung-tau
Trường: status
Giá trị: Đang mở bán (test bot)
```

Kiểm tra:
1. Bot reply ngay trong ≤ 35 giây: `✏️ Đã cập nhật status → "Đang mở bán (test bot)" Đang chờ build…`
2. Commit xuất hiện trên GitHub: `https://github.com/ngothaitinh/1992land-rebuild/commits/main`
3. GitHub Actions bắt đầu chạy (~30s sau commit)
4. Sau ~8 phút bot reply: `✅ 1992land.com đã cập nhật xong.`

- [ ] **Step 8: Revert test field**

Gửi vào bot:
```
[SỬA DỰ ÁN]
Slug: blanca-city-vung-tau
Trường: status
Giá trị: Đang mở bán
```

- [ ] **Step 9: Smoke test — xóa có duyệt**

Gửi vào bot:
```
[XÓA DỰ ÁN]
Slug: blanca-city-vung-tau
```

Bot gửi preview + nút ✅/❌. **Bấm ❌ Hủy** (đừng bấm ✅ vì đây chỉ là test).

Expected: bot reply `❌ Đã hủy, không xóa gì.`

- [ ] **Step 10: Smoke test — xóa timeout**

Gửi lại lệnh xóa, **đợi 5 phút không bấm gì**, rồi bấm ✅.

Expected: `⏱ Xác nhận đã hết hạn (5 phút). Gửi lại lệnh xóa nếu cần.`

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Chạy 24/7 không cần Claude | Task 7 (PM2 + VPS) |
| Tự thực thi set_field | Task 6 (`execSetField`) |
| Tự thực thi hide/show section | Task 6 (`execHideShow`) |
| Xóa cần duyệt ✅/❌, TTL 5 phút | Task 6 (`execDelete` + `pendingDeletes`) |
| Báo khi deploy xong | Task 4 (`watchDeployment`) + Task 6 (gọi trong mỗi executor) |
| Inbox cho nội dung giàu | Task 6 (`saveToInbox`) |
| Whitelist chat_id | Task 5 (adapter `allowed_chat_ids`) + Task 6 (check đầu handler) |
| Idempotency | Task 1 + Task 6 (`isProcessed`/`markProcessed`) |
| Validate slug/field/editable_fields | Task 6 (mỗi executor có check) |
| GitHub API 5xx retry | Task 3 (`ghRequest` reject với message rõ), Task 6 (try/catch → reply lỗi) |
| PM2 24/7 | Task 5 (`ecosystem.config.cjs`) |
| Tái sử dụng đa-website | Task 5 (adapter pattern) |
| register slash commands | Task 7 |

**Không có gap.**

**Type consistency:**
- `deleteFile` trả `{ commitSha }` — dùng tại Task 6 `const { commitSha } = await deleteFile(...)` ✅
- `putFile` trả `{ commitSha }` — dùng tại Task 6 `const { commitSha } = await putFile(...)` ✅
- `watchDeployment(repo, commitSha, pat, onDone)` — gọi đúng signature ở 3 nơi trong Task 6 ✅
- `parseCommand` trả `{ trigger, slug, field, value, section, raw }` — destructure đúng tại Task 6 ✅
