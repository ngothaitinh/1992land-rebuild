# Tinh gọn điều hướng bot Telegram — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đổi bot Telegram sang điều hướng "mục trước, việc sau", menu ☰ chỉ còn `/menu`, và mọi thao tác menu sửa tại chỗ trong 1 tin nhắn (Quay lại = thu gọn, không đẻ menu mới).

**Architecture:** Bot là 1 tiến trình Node ESM long-poll (`scripts/tg-bot/engine/serve.mjs`) điều phối các builder menu thuần (`menu.mjs`, `wizard-helpers.mjs`) và các hàm render/side-effect (`wizard.mjs`, `actions.mjs`). Giữ nguyên tách bạch: logic thuần testable ở `menu.mjs`/`wizard-helpers.mjs`, điều phối Telegram ở `serve.mjs`. Thay tầng điều hướng action-first bằng item-first; thêm cơ chế "editing send" để callback sửa chính tin nhắn đang có thay vì gửi tin mới.

**Tech Stack:** Node.js (ESM `.mjs`), `node:test` + `node:assert`, Telegram Bot API (getUpdates/sendMessage/editMessageText/editMessageReplyMarkup), pm2 trên VPS, GitHub Actions auto-deploy.

## Global Constraints

- Mọi file bot là ESM `.mjs`. Không thêm dependency npm mới.
- `callback_data` của mọi nút ≤ **64 byte** (giới hạn Telegram). Dùng action code 1 ký tự (`e`/`s`/`d`) cho `m:act`.
- Copy tiếng Việt, không caps-lock/tone sales. Icon nút giữ nhất quán: `📂` danh sách, `➕` thêm, `✏️` sửa, `🙈` ẩn/hiện, `🗑` xoá, `⬅️` quay lại, `❌` thoát, `💬` hỏi trợ lý, `❓` hướng dẫn.
- Id các phần dự án phải khớp `app/du-an/[slug]/page.tsx` — **không** đổi `sections` trong config.
- Deploy: push `main` → GitHub Actions chạy `scripts/tg-bot/deploy-vps.sh` (pull → pm2 reload → register-commands). Không SSH tay để ghi secret.
- Chạy test: `node --test scripts/tg-bot/tests/` từ gốc repo. Mỗi task kết thúc phải xanh toàn bộ.

---

## File Structure

| File | Trách nhiệm sau thay đổi |
|------|--------------------------|
| `scripts/tg-bot/engine/menu.mjs` | Builder menu thuần: `buildMainMenu` (item-first), `buildItemListMenu`, `buildItemMenu`, `mainMenuText`, `welcomeText`, `helpText`. Bỏ `buildTypeMenu`/`typeMenuPrompt`. |
| `scripts/tg-bot/engine/wizard-helpers.mjs` | Giữ nguyên helper thuần; chỉ đổi nút "Quay lại" của `buildFieldKeyboard`/`buildSectionKeyboard` trỏ về bảng 1 mục (`m:item:...`). `buildListKeyboard`/`filterItems`/`paginate`/`noAccent` giữ nguyên (tiện ích ngủ đông). |
| `scripts/tg-bot/engine/wizard.mjs` | Thêm `renderItemList`; bỏ `renderList`/`openAction`. Giữ `listContentItems`/`localTitle`/`renderSections`/`confirmEdit`/`confirmDelete`/`startAdd`/`takePending*`. |
| `scripts/tg-bot/engine/serve.mjs` | Dispatch callback item-first (`m:list`/`m:new`/`m:item`/`m:act`); `editingSend`/`withEditing` sửa tin tại chỗ; `/huy` route ngầm; bỏ nhánh action-first cũ. |
| `scripts/tg-bot/adapters/1992land/config.mjs` | `slash_commands` còn `/menu` + `/huy` (huy `hidden:true`). Giữ `commands[]` gõ tay. |
| `scripts/tg-bot/engine/register-commands.mjs` | Lọc `!hidden` trước khi `setMyCommands`. |
| `scripts/tg-bot/tests/menu.test.mjs` | Viết lại cho menu item-first. |
| `scripts/tg-bot/tests/callback-routing.test.mjs` | Cập nhật danh sách keyboard + assertion slash. |

---

## Task 1: Builder item-first thuần (bổ sung, không phá cũ)

Thêm 2 builder mới vào `menu.mjs` và test riêng cho chúng. Chỉ **thêm** — không đụng `buildMainMenu`/`buildTypeMenu` để mọi thứ hiện có vẫn xanh.

**Files:**
- Modify: `scripts/tg-bot/engine/menu.mjs`
- Test: `scripts/tg-bot/tests/menu.test.mjs`

**Interfaces:**
- Consumes: `cfg.content_types` (mỗi loại có `label`, `editable_fields?`, `sections?`), `actionCode` từ `wizard-helpers.mjs`.
- Produces:
  - `buildItemListMenu(cfg, contentType, items) → { inline_keyboard }` với items = `[{slug,title}]`. Nút: `➕ Thêm <label> mới` (`m:new:<ct>`), mỗi item (`m:item:<ct>:<slug>`), `⬅️ Quay lại` (`m:menu`).
  - `buildItemMenu(cfg, contentType, slug, title) → { inline_keyboard }`. Nút theo config: `✏️ Sửa thông tin` (`m:act:e:<ct>:<slug>`) nếu có `editable_fields`; `🙈 Ẩn / hiện phần` (`m:act:s:<ct>:<slug>`) nếu có `sections`; luôn có `🗑 Xoá` (`m:act:d:<ct>:<slug>`); `⬅️ Quay lại` (`m:list:<ct>`).

- [ ] **Step 1: Viết test thất bại cho 2 builder mới**

Thêm vào cuối `scripts/tg-bot/tests/menu.test.mjs`:

```javascript
import { buildItemListMenu, buildItemMenu } from "../engine/menu.mjs";

const cbOf = (kb) => kb.inline_keyboard.flat().map((b) => b.callback_data);

test("buildItemListMenu: có nút thêm mới ở đầu + 1 nút / mục + quay lại menu", () => {
  const items = [{ slug: "maia-ho-tram", title: "Maia Hồ Tràm" }, { slug: "blanca", title: "Blanca" }];
  const kb = buildItemListMenu(cfg, "project", items);
  const cb = cbOf(kb);
  assert.equal(kb.inline_keyboard[0][0].callback_data, "m:new:project"); // thêm mới đứng đầu
  assert.ok(cb.includes("m:item:project:maia-ho-tram"));
  assert.ok(cb.includes("m:item:project:blanca"));
  assert.equal(cb[cb.length - 1], "m:menu"); // quay lại đứng cuối
});

test("buildItemMenu (dự án): đủ Sửa / Ẩn-hiện / Xoá + quay lại danh sách", () => {
  const cb = cbOf(buildItemMenu(cfg, "project", "maia-ho-tram", "Maia Hồ Tràm"));
  assert.ok(cb.includes("m:act:e:project:maia-ho-tram"));
  assert.ok(cb.includes("m:act:s:project:maia-ho-tram"));
  assert.ok(cb.includes("m:act:d:project:maia-ho-tram"));
  assert.ok(cb.includes("m:list:project"));
});

test("buildItemMenu (bài viết): KHÔNG có nút Ẩn-hiện phần", () => {
  const cb = cbOf(buildItemMenu(cfg, "post", "bai-mau", "Bài mẫu"));
  assert.ok(cb.includes("m:act:e:post:bai-mau"));
  assert.ok(cb.includes("m:act:d:post:bai-mau"));
  assert.equal(cb.includes("m:act:s:post:bai-mau"), false);
});

test("callback_data của builder mới ≤ 64 byte kể cả slug dài nhất", () => {
  const slug = "quy-trinh-chuyen-nhuong-bds-tung-buoc";
  const kbs = [
    buildItemListMenu(cfg, "project", [{ slug, title: "X" }]),
    buildItemMenu(cfg, "project", slug, "X"),
  ];
  for (const kb of kbs)
    for (const b of kb.inline_keyboard.flat())
      assert.ok(Buffer.byteLength(b.callback_data) <= 64, `dài quá: ${b.callback_data}`);
});
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `node --test scripts/tg-bot/tests/menu.test.mjs`
Expected: FAIL — `buildItemListMenu`/`buildItemMenu` chưa export (`SyntaxError` hoặc `undefined is not a function`).

- [ ] **Step 3: Thêm 2 builder + import actionCode vào `menu.mjs`**

Ở đầu `scripts/tg-bot/engine/menu.mjs`, thêm import (sau dòng comment đầu file):

```javascript
import { actionCode } from "./wizard-helpers.mjs";
```

Thêm 2 hàm (đặt ngay trên `export function welcomeText`):

```javascript
// Danh sách 1 loại nội dung: nút thêm mới ở đầu, mỗi mục 1 nút, quay lại menu.
export function buildItemListMenu(cfg, contentType, items) {
  const ct = cfg.content_types[contentType];
  const rows = [[{ text: `➕ Thêm ${ct.label} mới`, callback_data: `m:new:${contentType}` }]];
  for (const it of items)
    rows.push([{ text: (it.title || it.slug).slice(0, 60), callback_data: `m:item:${contentType}:${it.slug}` }]);
  rows.push([{ text: "⬅️ Quay lại", callback_data: "m:menu" }]);
  return { inline_keyboard: rows };
}

// Bảng thao tác cho 1 mục. Nút hiện tùy loại nội dung hỗ trợ (đọc config).
export function buildItemMenu(cfg, contentType, slug, title) {
  const ct = cfg.content_types[contentType];
  const rows = [];
  if ((ct.editable_fields || []).length)
    rows.push([{ text: "✏️ Sửa thông tin", callback_data: `m:act:${actionCode("set_field")}:${contentType}:${slug}` }]);
  if (ct.sections)
    rows.push([{ text: "🙈 Ẩn / hiện phần", callback_data: `m:act:${actionCode("toggle_section")}:${contentType}:${slug}` }]);
  rows.push([{ text: "🗑 Xoá", callback_data: `m:act:${actionCode("delete")}:${contentType}:${slug}` }]);
  rows.push([{ text: "⬅️ Quay lại", callback_data: `m:list:${contentType}` }]);
  return { inline_keyboard: rows };
}
```

- [ ] **Step 4: Chạy test để chắc chắn xanh**

Run: `node --test scripts/tg-bot/tests/menu.test.mjs`
Expected: PASS toàn bộ (test cũ + 4 test mới).

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/engine/menu.mjs scripts/tg-bot/tests/menu.test.mjs
git commit -m "feat(tg-bot): builder menu item-first (danh sách + bảng 1 mục)"
```

---

## Task 2: Flip sang item-first + sửa tin tại chỗ + gọn slash-command

Task lớn nhất, atomic vì `serve.mjs`/`menu.mjs`/config/test khớp chặt: đổi menu chính, dispatch callback, back-button, config, và 2 test tích hợp cùng lúc. Kết thúc xanh.

**Files:**
- Modify: `scripts/tg-bot/engine/menu.mjs` (buildMainMenu, mainMenuText, welcomeText, helpText; bỏ buildTypeMenu/typeMenuPrompt)
- Modify: `scripts/tg-bot/engine/wizard-helpers.mjs:85` và `:100` (back button)
- Modify: `scripts/tg-bot/engine/wizard.mjs` (thêm renderItemList; bỏ renderList/openAction)
- Modify: `scripts/tg-bot/engine/serve.mjs` (dispatch + editingSend)
- Modify: `scripts/tg-bot/adapters/1992land/config.mjs` (slash_commands)
- Modify: `scripts/tg-bot/engine/register-commands.mjs` (lọc hidden)
- Test: `scripts/tg-bot/tests/menu.test.mjs`, `scripts/tg-bot/tests/callback-routing.test.mjs`

**Interfaces:**
- Consumes (từ Task 1): `buildItemListMenu`, `buildItemMenu`.
- Produces:
  - `buildMainMenu(cfg) → { inline_keyboard }` — 1 hàng `📂 <Label>` mỗi content_type (`m:list:<ct>`) + hàng `[💬 Hỏi trợ lý (wz_ask)] [❓ Hướng dẫn (m:help)]`.
  - `mainMenuText(cfg) → string`.
  - `renderItemList(deps, chatId, contentType) → Promise` — gọi `deps.send` 1 lần với `buildItemListMenu`.
  - Dispatch callback mới trong serve: `m:menu`, `m:help`, `m:list:<ct>`, `m:new:<ct>`, `m:item:<ct>:<slug>`, `m:act:<e|s|d>:<ct>:<slug>`, `wz_f:...`, `wz_s:...`, `wz_abort`, `wz_ask`, `wz_confirm/cancel/del/delno`, `pub_*`, `undo:*`.

- [ ] **Step 1: Viết lại `menu.test.mjs` cho menu chính item-first (test sẽ fail)**

Thay toàn bộ các test liên quan `buildMainMenu`/`buildTypeMenu`/slash trong `scripts/tg-bot/tests/menu.test.mjs`. File mới đầy đủ:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildMainMenu, buildItemListMenu, buildItemMenu, mainMenuText, welcomeText, helpText,
} from "../engine/menu.mjs";
import { default as cfg } from "../adapters/1992land/config.mjs";

const flat = (kb) => kb.inline_keyboard.flat();
const cbOf = (kb) => flat(kb).map((b) => b.callback_data);

test("menu chính: mỗi loại nội dung 1 nút mở danh sách", () => {
  const cb = cbOf(buildMainMenu(cfg));
  assert.ok(cb.includes("m:list:project"));
  assert.ok(cb.includes("m:list:post"));
});

test("menu chính: có nút trợ lý và hướng dẫn, không lộ nút Thêm/Sửa/Xoá", () => {
  const cb = cbOf(buildMainMenu(cfg));
  assert.ok(cb.includes("wz_ask"));
  assert.ok(cb.includes("m:help"));
  assert.equal(cb.some((c) => c.startsWith("m:add:")), false);
  assert.equal(cb.some((c) => c.startsWith("m:type:")), false);
});

test("menu chính: nhãn nút không chứa cú pháp máy [..]", () => {
  for (const b of flat(buildMainMenu(cfg)))
    assert.equal(/\[.+\]/.test(b.text), false, `nút còn cú pháp máy: ${b.text}`);
});

test("buildItemListMenu: nút thêm mới đầu danh sách + 1 nút/mục + quay lại menu", () => {
  const items = [{ slug: "maia-ho-tram", title: "Maia Hồ Tràm" }, { slug: "blanca", title: "Blanca" }];
  const kb = buildItemListMenu(cfg, "project", items);
  const cb = cbOf(kb);
  assert.equal(kb.inline_keyboard[0][0].callback_data, "m:new:project");
  assert.ok(cb.includes("m:item:project:maia-ho-tram"));
  assert.equal(cb[cb.length - 1], "m:menu");
});

test("buildItemMenu (dự án): Sửa / Ẩn-hiện / Xoá + quay lại danh sách", () => {
  const cb = cbOf(buildItemMenu(cfg, "project", "maia-ho-tram", "Maia Hồ Tràm"));
  assert.ok(cb.includes("m:act:e:project:maia-ho-tram"));
  assert.ok(cb.includes("m:act:s:project:maia-ho-tram"));
  assert.ok(cb.includes("m:act:d:project:maia-ho-tram"));
  assert.ok(cb.includes("m:list:project"));
});

test("buildItemMenu (bài viết): KHÔNG có Ẩn-hiện phần", () => {
  const cb = cbOf(buildItemMenu(cfg, "post", "bai-mau", "Bài mẫu"));
  assert.equal(cb.includes("m:act:s:post:bai-mau"), false);
});

test("callback_data ≤ 64 byte với slug dài nhất", () => {
  const slug = "quy-trinh-chuyen-nhuong-bds-tung-buoc";
  const kbs = [
    buildMainMenu(cfg),
    buildItemListMenu(cfg, "project", [{ slug, title: "X" }]),
    buildItemMenu(cfg, "project", slug, "X"),
  ];
  for (const kb of kbs)
    for (const b of flat(kb))
      assert.ok(Buffer.byteLength(b.callback_data) <= 64, `dài quá: ${b.callback_data}`);
});

test("lời chào + hướng dẫn nhắc đúng tên site và cách thoát", () => {
  assert.ok(mainMenuText(cfg).includes(cfg.bot_name));
  assert.ok(welcomeText(cfg).includes(cfg.site_name));
  assert.ok(helpText(cfg).includes("Hoàn tác"));
  assert.ok(helpText(cfg).includes("/huy"));
});

test("slash command chỉ còn /menu hiện ra (các lệnh khác ẩn)", () => {
  const visible = cfg.slash_commands.filter((s) => !s.hidden).map((s) => s.command);
  assert.deepEqual(visible, ["menu"]);
});

test("mọi slash command (kể cả ẩn) có route engine hiểu", () => {
  const known = new Set(["menu", "help", "cancel"]);
  for (const s of cfg.slash_commands) {
    if (known.has(s.route)) continue;
    const [kind, arg] = s.route.split(":");
    assert.ok(["add", "action"].includes(kind), `route lạ: ${s.route}`);
    if (kind === "add")    assert.ok(cfg.content_types[arg]?.add_mode, `add:${arg} không có add_mode`);
    if (kind === "action") assert.ok(Object.keys(cfg.content_types).length > 0, `action:${arg}`);
  }
});
```

- [ ] **Step 2: Chạy `menu.test.mjs` để xác nhận fail**

Run: `node --test scripts/tg-bot/tests/menu.test.mjs`
Expected: FAIL — `buildMainMenu` còn cấu trúc cũ, `mainMenuText` chưa có, `slash_commands` chưa đổi.

- [ ] **Step 3: Cập nhật `menu.mjs` — menu chính item-first + copy**

Trong `scripts/tg-bot/engine/menu.mjs`:

Xoá 2 hàm `buildTypeMenu` và `typeMenuPrompt` (không còn dùng).

Thay `buildMainMenu` bằng:

```javascript
export function buildMainMenu(cfg) {
  const listRow = Object.entries(cfg.content_types).map(([key, ct]) => ({
    text: `📂 ${capitalize(ct.label)}`,
    callback_data: `m:list:${key}`,
  }));
  return {
    inline_keyboard: [
      listRow,
      [
        { text: "💬 Hỏi trợ lý",   callback_data: "wz_ask" },
        { text: "❓ Hướng dẫn",     callback_data: "m:help" },
      ],
    ],
  };
}

export function mainMenuText(cfg) {
  return `📋 <b>${cfg.bot_name}</b> — chọn Dự án hoặc Bài viết:`;
}
```

Thay `welcomeText` và `helpText` bằng:

```javascript
export function welcomeText(cfg) {
  return (
    `👋 Đây là <b>${cfg.bot_name}</b> — quản lý web <b>${cfg.site_name}</b> ngay trong Telegram.\n\n` +
    `Chọn <b>📂 Dự án</b> hoặc <b>📂 Bài viết</b>, rồi bấm vào mục cần sửa. ` +
    `Mỗi thay đổi lên web sau <b>~8 phút</b>.\n\n` +
    `Anh chỉ cần bấm nút, không phải gõ lệnh. Chọn việc cần làm:`
  );
}

export function helpText(cfg) {
  return (
    `❓ <b>Hướng dẫn nhanh</b>\n\n` +
    `Bấm <b>📂 Dự án</b> hoặc <b>📂 Bài viết</b> → chọn 1 mục → hiện bảng thao tác:\n` +
    `• <b>✏️ Sửa thông tin</b> — chọn thông tin cần đổi, gõ giá trị mới, xác nhận.\n` +
    `• <b>🙈 Ẩn / hiện phần</b> — bấm phần muốn tắt (chỉ dự án). ✅ đang hiện · 🙈 đang ẩn.\n` +
    `• <b>🗑 Xoá</b> — bot hỏi lại trước khi xoá.\n\n` +
    `Thêm mới: bấm <b>➕ Thêm … mới</b> ở đầu danh sách, dán nội dung kèm 1 ảnh.\n\n` +
    `Sau mỗi thay đổi có nút <b>↩️ Hoàn tác</b> (30 phút).\n` +
    `Bấm <b>❌ Thoát</b> hoặc gõ <code>/huy</code> để dừng giữa chừng.\n` +
    `Ảnh, thư viện slide, lịch thanh toán… sửa ở <b>${cfg.site_name}/admin/</b>.`
  );
}
```

- [ ] **Step 4: Repoint nút "Quay lại" trong `wizard-helpers.mjs`**

Trong `scripts/tg-bot/engine/wizard-helpers.mjs`, sửa 2 dòng back button để trỏ về bảng 1 mục thay vì danh sách phân trang.

`buildFieldKeyboard` — đổi dòng `rows.push([backBtn(...), EXIT_BTN]);`:

```javascript
  rows.push([backBtn(`m:item:${content_type}:${slug}`), EXIT_BTN]);
```

`buildSectionKeyboard` — đổi dòng `rows.push([backBtn(...), EXIT_BTN]);`:

```javascript
  rows.push([backBtn(`m:item:${content_type}:${slug}`), EXIT_BTN]);
```

- [ ] **Step 5: `wizard.mjs` — thêm `renderItemList`, bỏ `renderList`/`openAction`**

Trong `scripts/tg-bot/engine/wizard.mjs`:

Sửa import từ `./menu.mjs` (dòng 11) — bỏ `typesFor, buildTypeMenu, typeMenuPrompt`, thêm `buildItemListMenu`:

```javascript
import { buildItemListMenu } from "./menu.mjs";
```

Sửa import từ `./wizard-helpers.mjs` (dòng 12-15) — bỏ `filterItems`, `buildListKeyboard`, `actionCode`, `WIZARD_PAGE_SIZE` (không còn dùng trong file này); giữ `fieldLabel`, `buildSectionKeyboard`:

```javascript
import { fieldLabel, buildSectionKeyboard } from "./wizard-helpers.mjs";
```

Xoá 3 hàm: `listPrompt` (dòng ~61), `renderList` (dòng ~68), `openAction` (dòng ~87). Xoá luôn hằng `ACTION_VERB` (dòng 17, chỉ `renderList`/`listPrompt` dùng).

Thêm hàm mới (đặt ngay sau `localTitle`):

```javascript
// Danh sách 1 loại nội dung (item-first): mọi mục, không phân trang.
export function renderItemList(deps, chatId, contentType) {
  const { cfg, send } = deps;
  const label = cfg.content_types[contentType].label;
  const items = listContentItems(deps, contentType);
  return send(chatId, `📂 <b>${label[0].toUpperCase() + label.slice(1)}</b> — chọn mục, hoặc thêm mới:`, {
    reply_markup: buildItemListMenu(cfg, contentType, items),
  });
}
```

Giữ nguyên `renderSections`, `confirmEdit`, `confirmDelete`, `startAdd`, `takePendingEdit`, `takePendingDelete`, `listContentItems`, `localTitle`, `readHiddenSections`.

- [ ] **Step 6: `serve.mjs` — editing-send + dispatch item-first**

Trong `scripts/tg-bot/engine/serve.mjs`:

(a) Sửa import `./menu.mjs` (dòng 9):

```javascript
import { buildMainMenu, mainMenuText, welcomeText, helpText } from "./menu.mjs";
```

(b) Sửa import `./wizard.mjs` (dòng 14-17) — bỏ `renderList`, `openAction`, thêm `renderItemList`:

```javascript
import {
  listContentItems, localTitle, renderItemList, renderSections, startAdd,
  confirmEdit, confirmDelete, takePendingEdit, takePendingDelete,
} from "./wizard.mjs";
```

(c) Thêm helper editing-send ngay sau hàm `send` (sau dòng 85):

```javascript
// Sửa chính tin nhắn đang bấm (menu biến hình tại chỗ). Lỗi (nội dung trùng /
// tin quá cũ) → fallback gửi tin mới để thao tác không chết.
function editingSend(cq) {
  let used = false;
  return (chatId, text, extra = {}) => {
    if (used) return send(chatId, text, extra);
    used = true;
    return tgApi("editMessageText", {
      chat_id: chatId,
      message_id: cq.message.message_id,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: extra.reply_markup,
    }).catch(() => send(chatId, text, extra));
  };
}

function withEditing(cq) {
  return { ...deps, send: editingSend(cq) };
}
```

(d) Sửa `showMenu` để dùng `mainMenuText`:

```javascript
function showMenu(chatId, text) {
  return send(chatId, text || mainMenuText(cfg), { reply_markup: MAIN_KB });
}
```

(e) Rút gọn `runRoute` (chỉ còn menu/help/cancel; bỏ add/action vì không slash nào dùng):

```javascript
function runRoute(chatId, route) {
  if (route === "help") return send(chatId, helpText(cfg), { reply_markup: MAIN_KB });
  if (route === "cancel") {
    clearSession(chatId);
    return showMenu(chatId, "Đã thoát thao tác đang làm. Chọn việc khác:");
  }
  return showMenu(chatId); // route === "menu" hoặc mặc định
}
```

(f) Trong `handleModeInput`, **xoá** nhánh `await_wz_search` (dòng ~187-191) — không còn tìm kiếm. Các nhánh khác giữ nguyên.

(g) Thay toàn bộ thân `handleCallbackQuery` (từ sau `answerCallbackQuery` tới hết hàm) bằng:

```javascript
  const chatId = cq.message.chat.id;
  const data   = cq.data || "";
  const es      = withEditing(cq);

  // ── Điều hướng menu (sửa tin tại chỗ) ────────────────────────────────────────
  if (data === "m:menu") return es.send(chatId, mainMenuText(cfg), { reply_markup: MAIN_KB });
  if (data === "m:help")
    return es.send(chatId, helpText(cfg), {
      reply_markup: { inline_keyboard: [[{ text: "⬅️ Quay lại", callback_data: "m:menu" }]] },
    });

  if (data.startsWith("m:list:")) return renderItemList(es, chatId, data.slice("m:list:".length));
  if (data.startsWith("m:new:"))  return startAdd(es, chatId, data.slice("m:new:".length));

  if (data.startsWith("m:item:")) {
    const [, , ct, ...rest] = data.split(":");
    const slug  = rest.join(":");
    const title = localTitle(deps, ct, slug);
    return es.send(chatId, `🗂 <b>${title}</b> — chọn thao tác:`, {
      reply_markup: buildItemMenu(cfg, ct, slug, title),
    });
  }

  if (data.startsWith("m:act:")) {
    const [, , code, ct, ...rest] = data.split(":");
    const slug   = rest.join(":");
    const action = codeAction(code);
    const title  = localTitle(deps, ct, slug);
    if (action === "toggle_section") return renderSections(es, chatId, ct, slug, title);
    if (action === "delete")         return confirmDelete(es, chatId, ct, slug, title);
    // set_field → bảng chọn trường
    setWizard(chatId, { step: "field", action: "set_field", content_type: ct, slug, title });
    return es.send(chatId, `Sửa <b>${title}</b> — chọn thông tin cần đổi:`, {
      reply_markup: buildFieldKeyboard(cfg, ct, slug),
    });
  }

  // ── Thoát / hỏi trợ lý ───────────────────────────────────────────────────────
  if (data === "wz_abort") {
    clearSession(chatId);
    return es.send(chatId, "Đã thoát. Chọn việc khác:", { reply_markup: MAIN_KB });
  }

  if (data === "wz_ask") {
    setMode(chatId, "await_freechat");
    return send(chatId, "💬 Anh cứ gõ điều anh muốn làm (vd \"đổi giá dự án\"), tôi sẽ chỉ cách bấm.");
  }

  // ── Chọn trường → hỏi giá trị mới (sửa tin tại chỗ) ──────────────────────────
  if (data.startsWith("wz_f:")) {
    const [, ct, slug, idx] = data.split(":");
    const field = fieldAt(cfg, ct, idx);
    if (!field) return send(chatId, "❌ Trường không hợp lệ. Bấm /menu để làm lại.");
    const title = getWizard(chatId)?.title || localTitle(deps, ct, slug);
    let current;
    try { current = await readCurrentField(deps, ct, slug, field); }
    catch { return send(chatId, `❌ Không đọc được <code>${slug}</code>. Bấm /menu để thử lại.`); }
    setWizard(chatId, { step: "value", action: "set_field", content_type: ct, slug, title, field });
    setMode(chatId, "await_field_value");
    return es.send(chatId,
      `Giá trị mới cho <b>${fieldLabel(cfg, field)}</b> là gì?\n` +
      `Hiện tại: <code>${current || "(trống)"}</code>\n\nGõ giá trị mới vào đây 👇`,
      { reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `m:act:${actionCode("set_field")}:${ct}:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] } }
    );
  }

  // ── Bật/tắt một phần → commit rồi cập nhật bảng tại chỗ ───────────────────────
  if (data.startsWith("wz_s:")) {
    const [, ct, slug, idx] = data.split(":");
    const sectionId = sectionAt(cfg, ct, idx);
    if (!sectionId) return send(chatId, "❌ Phần không hợp lệ. Bấm /menu để làm lại.");
    const result = await execToggleSection(deps, chatId, ct, slug, sectionId);
    if (!result) return;
    return tgApi("editMessageReplyMarkup", {
      chat_id:      chatId,
      message_id:   cq.message.message_id,
      reply_markup: buildSectionKeyboard(cfg, ct, slug, result.hidden),
    }).catch(() => {});
  }

  // ── Cổng xác nhận sửa / xoá (gửi tin riêng — là kết quả, không phải menu) ─────
  if (data.startsWith("wz_confirm:")) {
    const p = takePendingEdit(data.slice("wz_confirm:".length));
    if (!p) return send(chatId, "⏱ Xác nhận đã hết hạn (5 phút). Bấm /menu để làm lại.");
    clearSession(chatId);
    return execSetField(deps, chatId, p.content_type, { slug: p.slug, field: p.field, value: p.value });
  }

  if (data.startsWith("wz_cancel:")) {
    takePendingEdit(data.slice("wz_cancel:".length));
    clearSession(chatId);
    return send(chatId, "❌ Đã huỷ, không sửa gì.");
  }

  if (data.startsWith("wz_delno:")) {
    takePendingDelete(data.slice("wz_delno:".length));
    clearSession(chatId);
    return send(chatId, "❌ Đã huỷ, không xoá gì.");
  }

  if (data.startsWith("wz_del:")) {
    const p = takePendingDelete(data.slice("wz_del:".length));
    if (!p) return send(chatId, "⏱ Xác nhận đã hết hạn (5 phút). Bấm /menu để làm lại.");
    clearSession(chatId);
    return execDelete(deps, chatId, p.content_type, p.slug, p.title);
  }

  // ── Đăng nội dung mới ────────────────────────────────────────────────────────
  if (data === "pub_cancel") {
    clearSession(chatId);
    return send(chatId, "❌ Đã hủy, không đăng gì.");
  }
  if (data === "pub_edit") {
    if (!getDraft(chatId)) return send(chatId, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé.");
    setMode(chatId, "await_edit");
    return send(chatId, "✏️ Anh muốn sửa gì? (vd: rút ngắn tiêu đề, bỏ đoạn cuối)");
  }
  if (data === "pub_approve") {
    const draft = getDraft(chatId);
    if (!draft) return send(chatId, "⏱ Nháp đã hết hạn. Bắt đầu lại nhé.");
    clearSession(chatId);
    return execPublish(deps, chatId, draft);
  }

  // ── Hoàn tác ─────────────────────────────────────────────────────────────────
  if (data.startsWith("undo:")) return execUndo(deps, chatId, data.slice("undo:".length));
```

(h) Thêm `buildItemMenu` vào import `./menu.mjs` (bước a) — sửa lại thành:

```javascript
import { buildMainMenu, buildItemMenu, mainMenuText, welcomeText, helpText } from "./menu.mjs";
```

- [ ] **Step 7: `config.mjs` — slash_commands còn /menu (+/huy ẩn)**

Trong `scripts/tg-bot/adapters/1992land/config.mjs`, thay mảng `slash_commands` bằng:

```javascript
  // Menu ☰ chỉ hiện /menu. /huy giữ để gõ tay (hidden — không đăng ký hiển thị).
  slash_commands: [
    { command: "menu", description: "Mở menu thao tác",       route: "menu" },
    { command: "huy",  description: "Thoát thao tác đang làm", route: "cancel", hidden: true },
  ],
```

Giữ nguyên `commands[]` (cú pháp `[..]` gõ tay).

- [ ] **Step 8: `register-commands.mjs` — lọc lệnh ẩn**

Trong `scripts/tg-bot/engine/register-commands.mjs`, sửa khối `const commands = [...]`:

```javascript
const commands = [
  { command: "start", description: "Khởi động bot" },
  ...cfg.slash_commands
    .filter((s) => !s.hidden)
    .map(({ command, description }) => ({ command, description })),
];
```

- [ ] **Step 9: Cập nhật `callback-routing.test.mjs` cho keyboard + slash mới**

Thay `scripts/tg-bot/tests/callback-routing.test.mjs` bằng:

```javascript
// Mọi nút bấm phải có nhánh xử lý trong serve.mjs. Không có test này thì một nút
// chết chỉ lộ ra khi người dùng bấm vào nó và bot im lặng.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildMainMenu, buildItemListMenu, buildItemMenu } from "../engine/menu.mjs";
import { buildFieldKeyboard, buildSectionKeyboard } from "../engine/wizard-helpers.mjs";
import { default as cfg } from "../adapters/1992land/config.mjs";

const serveSrc = fs.readFileSync(
  path.join(import.meta.dirname, "..", "engine", "serve.mjs"), "utf8"
);

const exact    = [...serveSrc.matchAll(/data === "([^"]+)"/g)].map((m) => m[1]);
const prefixes = [...serveSrc.matchAll(/data\.startsWith\("([^"]+)"\)/g)].map((m) => m[1]);

function isHandled(cb) {
  return exact.includes(cb) || prefixes.some((p) => cb.startsWith(p));
}

function allCallbacks() {
  const items = [{ slug: "du-an-mau", title: "Dự án mẫu" }, { slug: "b", title: "B" }];
  const kbs = [
    buildMainMenu(cfg),
    buildItemListMenu(cfg, "project", items),
    buildItemListMenu(cfg, "post", items),
    buildItemMenu(cfg, "project", "du-an-mau", "Dự án mẫu"),
    buildItemMenu(cfg, "post", "bai-mau", "Bài mẫu"),
    buildFieldKeyboard(cfg, "project", "du-an-mau"),
    buildFieldKeyboard(cfg, "post", "bai-mau"),
    buildSectionKeyboard(cfg, "project", "du-an-mau", ["gia-ban"]),
  ];
  const fromKb = kbs.flatMap((kb) => kb.inline_keyboard.flat()).map((b) => b.callback_data);
  // Nút dựng thẳng trong serve.mjs (giá trị mới, nháp, xác nhận, hoàn tác).
  const inline = [
    "pub_approve", "pub_edit", "pub_cancel",
    "wz_confirm:abc123", "wz_cancel:abc123",
    "wz_del:abc123", "wz_delno:abc123",
    "wz_f:project:du-an-mau:0",
    "undo:u12ab",
  ];
  return [...new Set([...fromKb, ...inline])];
}

test("mọi callback_data sinh ra đều có nhánh xử lý trong serve.mjs", () => {
  const orphans = allCallbacks().filter((cb) => !isHandled(cb));
  assert.deepEqual(orphans, [], `nút không ai xử lý: ${orphans.join(", ")}`);
});

test("mọi callback_data nằm trong giới hạn 64 byte của Telegram", () => {
  for (const cb of allCallbacks())
    assert.ok(Buffer.byteLength(cb) <= 64, `dài quá (${Buffer.byteLength(cb)}B): ${cb}`);
});

test("wz_delno phải được xét trước wz_del, nếu không bấm Huỷ lại thành Xoá", () => {
  assert.equal("wz_delno:abc".startsWith("wz_del:"), false);
  assert.ok(
    serveSrc.indexOf('data.startsWith("wz_delno:")') < serveSrc.indexOf('data.startsWith("wz_del:")'),
    "nhánh wz_delno phải đứng trước wz_del"
  );
});

test("m:act định tuyến đủ 3 việc qua action code", () => {
  const cb = buildItemMenu(cfg, "project", "x", "X").inline_keyboard.flat().map((b) => b.callback_data);
  assert.ok(cb.includes("m:act:e:project:x"));
  assert.ok(cb.includes("m:act:s:project:x"));
  assert.ok(cb.includes("m:act:d:project:x"));
});

test("mọi slash command trong config đều được serve.mjs định tuyến", () => {
  assert.ok(serveSrc.includes("slashMap"), "serve.mjs phải dựng slashMap từ cfg.slash_commands");
  const routes = new Set(cfg.slash_commands.map((s) => s.route.split(":")[0]));
  for (const kind of routes)
    assert.ok(["menu", "help", "cancel", "add", "action"].includes(kind), `route lạ: ${kind}`);
});
```

- [ ] **Step 10: Chạy toàn bộ test suite**

Run: `node --test scripts/tg-bot/tests/`
Expected: PASS toàn bộ (menu, callback-routing, wizard-helpers, và các test khác không đổi).

- [ ] **Step 11: Kiểm tra tải module (không lỗi import/cú pháp)**

Run: `node --check scripts/tg-bot/engine/serve.mjs && node --check scripts/tg-bot/engine/menu.mjs && node --check scripts/tg-bot/engine/wizard.mjs && node --check scripts/tg-bot/engine/wizard-helpers.mjs`
Expected: không in gì, exit 0.

Run kiểm tra import vòng + export tồn tại:
`node -e "import('./scripts/tg-bot/engine/menu.mjs').then(m=>{for(const k of ['buildMainMenu','buildItemListMenu','buildItemMenu','mainMenuText','welcomeText','helpText']) if(!m[k]) throw new Error('thiếu '+k); console.log('menu exports OK')})"`
Expected: in `menu exports OK`.

- [ ] **Step 12: Commit**

```bash
git add scripts/tg-bot/engine/menu.mjs scripts/tg-bot/engine/wizard.mjs scripts/tg-bot/engine/wizard-helpers.mjs scripts/tg-bot/engine/serve.mjs scripts/tg-bot/adapters/1992land/config.mjs scripts/tg-bot/engine/register-commands.mjs scripts/tg-bot/tests/menu.test.mjs scripts/tg-bot/tests/callback-routing.test.mjs
git commit -m "feat(tg-bot): điều hướng item-first + menu sửa tại chỗ + gọn slash-command"
```

---

## Task 3: Deploy lên VPS + verify sống

Push kích hoạt auto-deploy (`deploy-vps.sh`: pull → pm2 reload → register-commands). Không SSH tay ghi secret.

**Files:** không sửa code; chỉ push + kiểm tra.

- [ ] **Step 1: Push main để kích hoạt auto-deploy**

```bash
git push origin main
```

- [ ] **Step 2: Theo dõi workflow deploy-bot cho tới khi xong**

Run: `gh run list --workflow deploy-bot.yml --limit 1`
Rồi: `gh run watch <run_id>` (hoặc poll tới `completed success`).
Expected: `completed success`.

- [ ] **Step 3: Verify bot online + không lỗi poll**

Run: `ssh root@160.191.88.139 "pm2 describe tg-bot-1992land | grep -E 'status|restarts'; tail -3 /root/.pm2/logs/tg-bot-1992land-error.log"`
Expected: `status online`; không có dòng `[poll error] ... Unauthorized/Conflict` mới sau thời điểm deploy.

- [ ] **Step 4: Verify menu ☰ chỉ còn /menu**

Chạy trên VPS (đọc `.env` để lấy token, KHÔNG in token):
`ssh root@160.191.88.139 "cd /root/bot/scripts/tg-bot && node -e \"const fs=require('fs');const t=fs.readFileSync('.env','utf8').match(/TELEGRAM_BOT_TOKEN=(.+)/)[1].trim();require('https').get('https://api.telegram.org/bot'+t+'/getMyCommands',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>console.log(d))})\""`
Expected: JSON `result` chỉ chứa `start` và `menu`.

> Nếu lệnh bị classifier chặn (thao tác gọi API bằng token trên VPS), đưa nguyên lệnh cho anh Thọ chạy qua `!`.

- [ ] **Step 5: Nhờ anh Thọ smoke-test trên Telegram**

Kịch bản anh Thọ bấm, controller xem log VPS song song:
1. `/menu` → hiện `[📂 Dự án] [📂 Bài viết]` + `[💬 Hỏi trợ lý] [❓ Hướng dẫn]`.
2. `[📂 Dự án]` → **cùng tin nhắn** đổi thành danh sách (Thêm mới ở đầu, 12 dự án, Quay lại). Không có menu mới bên dưới.
3. Chọn 1 dự án → cùng tin đổi thành bảng `[✏️ Sửa] [🙈 Ẩn/hiện] [🗑 Xoá] [⬅️ Quay lại]`.
4. `[⬅️ Quay lại]` → thu gọn về danh sách; Quay lại tiếp → về menu chính. Không kéo dài hội thoại.
5. Chọn 1 bài viết → bảng **không** có `🙈 Ẩn/hiện phần`.
6. `[✏️ Sửa] → chọn trường → gõ giá trị → ✅` → commit + `↩️ Hoàn tác`.
7. Bấm `↩️ Hoàn tác` trong 30 phút → hoàn tác OK.

Nếu có bước lỗi → quay lại systematic-debugging, không tự ý báo xong.

- [ ] **Step 6: Cập nhật memory tiến độ**

Ghi vào `project-tg-bot-deploy-status` (memory): đã chuyển UX sang item-first + sửa tin tại chỗ + ☰ chỉ /menu, ngày 2026-07-18.

---

## Self-Review

**1. Spec coverage:**
- A. Cấu trúc 3 tầng item-first → Task 1 (builder) + Task 2 (buildMainMenu, renderItemList, m:item/m:act). ✓
- Bảng theo config (bài không có Ẩn/hiện) → `buildItemMenu` dùng `ct.sections`; test phủ. ✓
- Thêm mới ở đầu danh sách → `buildItemListMenu` hàng đầu `m:new`. ✓
- B. ☰ chỉ /menu, /huy ẩn ngầm → config `hidden` + register filter (Task 2 Step 7-8). ✓
- Nút ❌ Thoát ở wizard → `EXIT_BTN` (wz_abort) đã có trong field/section keyboard + value prompt; wz_abort giờ sửa tin tại chỗ về menu. ✓
- D. Sửa tin tại chỗ + Quay lại thu gọn → `editingSend`/`withEditing`, mọi nhánh điều hướng dùng `es.send` (Task 2 Step 6g). ✓
- D. Nội dung gửi tin riêng → confirm/publish/undo/prompt dán/gõ dùng `send` gốc. ✓
- D. Fallback edit lỗi → `editingSend` `.catch(()=>send(...))`. ✓
- C. Giữ nguyên wizard sửa field, Hoàn tác, Hỏi trợ lý, cú pháp `[..]`, /huy → không đụng actions.mjs/compose; `commands[]` giữ; wz_ask/undo giữ. ✓
- Success criteria 1-9 → phủ bởi test (menu/callback-routing) + Task 3 smoke test. ✓

**2. Placeholder scan:** Không có TBD/TODO; mọi step có mã hoặc lệnh cụ thể + kết quả mong đợi. ✓

**3. Type consistency:**
- Action code `e`/`s`/`d` từ `actionCode()` dùng nhất quán ở `buildItemMenu` (sinh) và `codeAction()` ở serve `m:act` (giải). ✓
- `renderItemList(deps, chatId, contentType)` — chữ ký khớp giữa wizard.mjs (định nghĩa) và serve.mjs (`m:list`). ✓
- `buildItemMenu(cfg, contentType, slug, title)` — khớp giữa menu.mjs và serve `m:item`. ✓
- Back button `m:item:<ct>:<slug>` (wizard-helpers) khớp nhánh `m:item:` trong serve. ✓
- Value-prompt back `m:act:${actionCode("set_field")}:...` = `m:act:e:...` khớp nhánh `m:act:` serve. ✓
- `editingSend` chỉ set `reply_markup` từ `extra.reply_markup` — mọi hàm render gọi `send(chatId, text, { reply_markup })` đúng dạng. ✓

**Ghi chú rủi ro đã xử:** `buildListKeyboard`/`filterItems`/`paginate`/`noAccent` giữ nguyên (tiện ích ngủ đông) → `wizard-helpers.test.mjs` không đổi, vẫn xanh. Nhánh tìm-kiếm/phân trang cũ (`wz_page`/`wz_search`/`wz_pick`/`await_wz_search`) bị gỡ khỏi serve nên không còn keyboard nào sinh ra chúng — không mồ côi.
