# Slice 2 — Bot sửa dự án theo mục — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nút "✏️ Sửa thông tin" của bot chuyển sang danh sách mục giống trang dự án; mỗi mục sửa được đoạn giới thiệu (chữ), ảnh, và link video.

**Architecture:** Thêm `edit_sections` vào config project (map mục → desc_key/image_field/video). `m:act:e:project:<slug>` mở bảng chọn mục (`buildEditSectionMenu`); chọn mục → bảng thao tác (`buildSectionActionMenu`) với các nút `edesc`/`eimg`/`evid`. Mỗi thao tác đi qua mode nhập tương ứng → exec ghi repo (`execSetDescription`/`execSetVideo`/`execSetSectionImage`) tái dùng `putFile`/`putFiles` + `recordUndo` + `announce`. Mục "Thông tin cơ bản" (`basic`) mở lại `buildFieldKeyboard` cũ. Post không có mục → giữ nguyên field keyboard.

**Tech Stack:** Node.js ESM `.mjs`, `node:test`, Telegram Bot API, Git Trees API (`putFiles`), `lib/youtube.mjs` (validate link YouTube — dùng chung với web, đã có từ Slice 1).

## Global Constraints

- Mọi file bot ESM `.mjs`. Không thêm dependency npm.
- `callback_data` ≤ **64 byte**. Prefix mới: `esec:` `edesc:` `eimg:` `evid:` — không prefix nào là tiền tố của prefix khác, và không đè các prefix cũ (`m:*`, `wz_*`, `pub_*`, `undo:`).
- Chỉ áp cho `content_type: "project"` (JSON). Post giữ nguyên luồng field cũ.
- Ảnh mới **không ghi đè** file cũ: tên `public/images/projects/<slug>/<sid>-<ts>.jpg` (ts = `Date.now().toString(36)`). `image_list` (tiện ích) = **nối** vào cuối mảng.
- Mọi thao tác ghi tái dùng `recordUndo` (Hoàn tác 30 phút) + `announce` (theo dõi build). Không đụng logic commit/deploy/idempotency/undo core.
- Video = link YouTube; validate bằng `youtubeId` từ `lib/youtube.mjs`. Link không hợp lệ → không commit, báo lỗi.
- Copy tiếng Việt, không caps-lock/tone sales. Icon: `📝` sửa chữ, `🖼` ảnh, `🎬` video, `⬅️` quay lại, `❌` thoát.
- Giữ nguyên: luồng field `basic`, ẩn/hiện phần, xoá, thêm mới, Hỏi trợ lý, cú pháp `[..]` gõ tay.
- Chạy test: `node --test "scripts/tg-bot/tests/*.test.mjs"` (dạng glob — dạng thư mục trần lỗi MODULE_NOT_FOUND trên Windows/Node 24, đã biết). Phải xanh toàn bộ cuối mỗi task.
- Id mục dùng trong `edit_sections`: `basic`, `tong-quan`, `vi-tri`, `tien-ich`, `gia-ban`, `phap-ly`, `chinh-sach`.

## File Structure

| File | Trách nhiệm sau thay đổi |
|------|--------------------------|
| `scripts/tg-bot/adapters/1992land/config.mjs` | Thêm `edit_sections` vào `content_types.project`. |
| `scripts/tg-bot/engine/wizard-helpers.mjs` | Thêm `buildEditSectionMenu`, `buildSectionActionMenu`, `editSectionCfg` (thuần). |
| `scripts/tg-bot/engine/wizard.mjs` | Thêm `confirmDesc` (cổng xác nhận sửa đoạn giới thiệu). |
| `scripts/tg-bot/engine/actions.mjs` | Thêm `readDescription`, `readVideo`, `execSetDescription`, `execSetVideo`, `execSetSectionImage`. |
| `scripts/tg-bot/engine/serve.mjs` | Dispatch `esec/edesc/eimg/evid` + 3 mode nhập mới; `m:act:e` phân nhánh project→section menu; `wz_confirm` phân nhánh desc. Import `youtubeId`. |
| `scripts/tg-bot/tests/menu.test.mjs` | Test 2 builder mục mới. |
| `scripts/tg-bot/tests/callback-routing.test.mjs` | Thêm keyboard mới vào orphan-detector + inline callbacks. |

---

## Task 1: Config `edit_sections` + builder mục (thuần, có test)

**Files:**
- Modify: `scripts/tg-bot/adapters/1992land/config.mjs`
- Modify: `scripts/tg-bot/engine/wizard-helpers.mjs`
- Test: `scripts/tg-bot/tests/menu.test.mjs`

**Interfaces:**
- Consumes: `cfg.content_types.project.edit_sections`, `actionCode`, `backBtn`, `EXIT_BTN` (đã có trong wizard-helpers.mjs).
- Produces:
  - `buildEditSectionMenu(cfg, content_type, slug) → { inline_keyboard }` — 1 nút / mục (`esec:<sid>:<slug>`) + Quay lại (`m:item:<ct>:<slug>`) + Thoát.
  - `buildSectionActionMenu(cfg, content_type, slug, sid) → { inline_keyboard }` — nút theo cấu hình mục: `📝` (nếu `desc_key`), `🖼` (nếu `image_field`), `🎬` (nếu `video`) + Quay lại (`m:act:e:<ct>:<slug>`) + Thoát.
  - `editSectionCfg(cfg, content_type, sid) → section|null`.

- [ ] **Step 1: Thêm `edit_sections` vào config**

Trong `scripts/tg-bot/adapters/1992land/config.mjs`, bên trong `content_types.project` (sau khối `sections: {...}`, trước dấu `}` đóng của `project`), thêm:

```javascript
      // Mục sửa nội dung — khớp thanh menu trang dự án (app/du-an/[slug]/page.tsx).
      // basic = luồng field cũ. Các mục khác: desc_key (đoạn giới thiệu), image_field (ảnh), video.
      edit_sections: [
        { id: "basic",      label: "ℹ️ Thông tin cơ bản" },
        { id: "tong-quan",  label: "📄 Tổng quan",  desc_key: "tong-quan",  image_field: "overview_image",   video: true },
        { id: "vi-tri",     label: "📍 Vị trí",     desc_key: "vi-tri",     image_field: "location_image",   video: true },
        { id: "tien-ich",   label: "🌳 Tiện ích",   desc_key: "tien-ich",   image_field: "amenities_images", image_list: true, video: true },
        { id: "gia-ban",    label: "💰 Giá bán",    desc_key: "gia-ban",    video: true },
        { id: "phap-ly",    label: "⚖️ Pháp lý",    desc_key: "phap-ly",    video: true },
        { id: "chinh-sach", label: "📋 Chính sách", desc_key: "chinh-sach", video: true },
      ],
```

- [ ] **Step 2: Viết test thất bại**

Thêm vào cuối `scripts/tg-bot/tests/menu.test.mjs`:

```javascript
import {
  buildEditSectionMenu, buildSectionActionMenu, editSectionCfg,
} from "../engine/wizard-helpers.mjs";

const cbList = (kb) => kb.inline_keyboard.flat().map((b) => b.callback_data);

test("buildEditSectionMenu: 1 nút / mục edit_sections + quay lại item", () => {
  const kb = buildEditSectionMenu(cfg, "project", "maia-ho-tram");
  const cb = cbList(kb);
  assert.ok(cb.includes("esec:basic:maia-ho-tram"));
  assert.ok(cb.includes("esec:tong-quan:maia-ho-tram"));
  assert.ok(cb.includes("esec:chinh-sach:maia-ho-tram"));
  assert.ok(cb.includes("m:item:project:maia-ho-tram")); // quay lại
});

test("buildSectionActionMenu (tổng quan): đủ chữ / ảnh / video", () => {
  const cb = cbList(buildSectionActionMenu(cfg, "project", "maia-ho-tram", "tong-quan"));
  assert.ok(cb.includes("edesc:tong-quan:maia-ho-tram"));
  assert.ok(cb.includes("eimg:tong-quan:maia-ho-tram"));
  assert.ok(cb.includes("evid:tong-quan:maia-ho-tram"));
  assert.ok(cb.includes("m:act:e:project:maia-ho-tram")); // quay lại bảng mục
});

test("buildSectionActionMenu (giá bán): có chữ + video, KHÔNG có ảnh", () => {
  const cb = cbList(buildSectionActionMenu(cfg, "project", "x", "gia-ban"));
  assert.ok(cb.includes("edesc:gia-ban:x"));
  assert.ok(cb.includes("evid:gia-ban:x"));
  assert.equal(cb.some((c) => c.startsWith("eimg:")), false);
});

test("editSectionCfg trả đúng mục / null", () => {
  assert.equal(editSectionCfg(cfg, "project", "vi-tri").image_field, "location_image");
  assert.equal(editSectionCfg(cfg, "project", "khong-co"), null);
});

test("callback mục ≤ 64 byte với slug dài nhất", () => {
  const slug = "quy-trinh-chuyen-nhuong-bds-tung-buoc";
  const kbs = [
    buildEditSectionMenu(cfg, "project", slug),
    buildSectionActionMenu(cfg, "project", slug, "chinh-sach"),
    buildSectionActionMenu(cfg, "project", slug, "tien-ich"),
  ];
  for (const kb of kbs)
    for (const b of kb.inline_keyboard.flat())
      assert.ok(Buffer.byteLength(b.callback_data) <= 64, `dài quá: ${b.callback_data}`);
});
```

- [ ] **Step 3: Chạy test để chắc chắn fail**

Run: `node --test scripts/tg-bot/tests/menu.test.mjs`
Expected: FAIL — 3 builder chưa export.

- [ ] **Step 4: Thêm 3 hàm vào `wizard-helpers.mjs`**

Thêm vào cuối `scripts/tg-bot/engine/wizard-helpers.mjs`:

```javascript
// Tra cấu hình 1 mục sửa (edit_sections) theo id.
export function editSectionCfg(cfg, content_type, sid) {
  return (cfg.content_types[content_type].edit_sections || []).find((s) => s.id === sid) || null;
}

// Bảng chọn mục để sửa — khớp thanh menu trang dự án. Mỗi mục 1 nút.
export function buildEditSectionMenu(cfg, content_type, slug) {
  const secs = cfg.content_types[content_type].edit_sections || [];
  const rows = secs.map((s) => [{ text: s.label, callback_data: `esec:${s.id}:${slug}` }]);
  rows.push([backBtn(`m:item:${content_type}:${slug}`), EXIT_BTN]);
  return { inline_keyboard: rows };
}

// Bảng thao tác trong 1 mục: sửa chữ / đổi ảnh / dán video (tùy cấu hình mục).
export function buildSectionActionMenu(cfg, content_type, slug, sid) {
  const sec = editSectionCfg(cfg, content_type, sid);
  const rows = [];
  if (sec?.desc_key)    rows.push([{ text: "📝 Sửa đoạn giới thiệu", callback_data: `edesc:${sid}:${slug}` }]);
  if (sec?.image_field) rows.push([{ text: "🖼 Đổi ảnh",             callback_data: `eimg:${sid}:${slug}` }]);
  if (sec?.video)       rows.push([{ text: "🎬 Dán link video",      callback_data: `evid:${sid}:${slug}` }]);
  rows.push([backBtn(`m:act:${actionCode("set_field")}:${content_type}:${slug}`), EXIT_BTN]);
  return { inline_keyboard: rows };
}
```

- [ ] **Step 5: Chạy test để chắc chắn xanh**

Run: `node --test scripts/tg-bot/tests/menu.test.mjs`
Expected: PASS toàn bộ.

- [ ] **Step 6: Commit**

```bash
git add scripts/tg-bot/adapters/1992land/config.mjs scripts/tg-bot/engine/wizard-helpers.mjs scripts/tg-bot/tests/menu.test.mjs
git commit -m "feat(tg-bot): config edit_sections + builder bảng mục / thao tác mục"
```

---

## Task 2: Actions ghi repo (đoạn giới thiệu / video / ảnh mục)

**Files:**
- Modify: `scripts/tg-bot/engine/actions.mjs`
- Modify: `scripts/tg-bot/engine/wizard.mjs` (thêm `confirmDesc`)

**Interfaces:**
- Consumes: `getFile`, `putFile`, `putFiles` (github-commit.mjs), `recordUndo` (undo.mjs), `announce`/`filePathOf` (nội bộ actions.mjs).
- Produces:
  - `readDescription(deps, contentType, slug, descKey) → Promise<string>`
  - `readVideo(deps, contentType, slug, sid) → Promise<string>`
  - `execSetDescription(deps, chatId, slug, { descKey, value, remove }) → Promise`
  - `execSetVideo(deps, chatId, slug, { sid, url }) → Promise` (url=null để xoá)
  - `execSetSectionImage(deps, chatId, slug, { sid, imageField, imageList, imageBase64, ts }) → Promise`
  - `confirmDesc(deps, chatId, wz, value) → Promise` (wizard.mjs) — stash pendingEdit `{ kind:"desc", content_type, slug, desc_key, value, label }`.

- [ ] **Step 1: Thêm read + 3 exec vào `actions.mjs`**

Thêm vào cuối `scripts/tg-bot/engine/actions.mjs` (sau `execUndo`). `filePathOf`, `getFile`, `putFile`, `putFiles`, `recordUndo`, `announce` đã có sẵn trong file:

```javascript
// ─── Đọc đoạn giới thiệu / video hiện tại của 1 mục (project JSON) ─────────────
export async function readDescription(deps, contentType, slug, descKey) {
  const { cfg, repo, pat } = deps;
  const { content } = await getFile(repo, cfg.deploy_branch, filePathOf(cfg, contentType, slug), pat);
  const obj = JSON.parse(content);
  return (obj.descriptions && obj.descriptions[descKey]) || "";
}

export async function readVideo(deps, contentType, slug, sid) {
  const { cfg, repo, pat } = deps;
  const { content } = await getFile(repo, cfg.deploy_branch, filePathOf(cfg, contentType, slug), pat);
  const obj = JSON.parse(content);
  return (obj.videos && obj.videos[sid]) || "";
}

// ─── Sửa đoạn giới thiệu 1 mục (descriptions[descKey]) ─────────────────────────
export async function execSetDescription(deps, chatId, slug, { descKey, value, remove }) {
  const { cfg, repo, pat, send } = deps;
  const filePath = filePathOf(cfg, "project", slug);
  let sha, content;
  try { ({ sha, content } = await getFile(repo, cfg.deploy_branch, filePath, pat)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  const obj = JSON.parse(content);
  obj.descriptions = obj.descriptions || {};
  if (remove) delete obj.descriptions[descKey];
  else obj.descriptions[descKey] = value;
  obj.updated_at = new Date().toISOString();

  let commitSha;
  try {
    ({ commitSha } = await putFile(repo, cfg.deploy_branch, filePath, JSON.stringify(obj, null, 2) + "\n", sha,
      `content: set description ${descKey} on ${slug} via telegram`, pat));
  } catch (e) { return send(chatId, `⚠️ Lỗi GitHub API: ${e.message}`); }

  const key = recordUndo(chatId, `sửa đoạn giới thiệu`, [{ path: filePath, prevContent: content }]);
  return announce(deps, chatId,
    remove ? `🗑 Đã bỏ đoạn giới thiệu mục <b>${descKey}</b>` : `📝 Đã cập nhật đoạn giới thiệu mục <b>${descKey}</b>`,
    key, commitSha);
}

// ─── Đặt / bỏ link video 1 mục (videos[sid]) ──────────────────────────────────
export async function execSetVideo(deps, chatId, slug, { sid, url }) {
  const { cfg, repo, pat, send } = deps;
  const filePath = filePathOf(cfg, "project", slug);
  let sha, content;
  try { ({ sha, content } = await getFile(repo, cfg.deploy_branch, filePath, pat)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  const obj = JSON.parse(content);
  obj.videos = obj.videos || {};
  if (url) obj.videos[sid] = url; else delete obj.videos[sid];
  if (Object.keys(obj.videos).length === 0) delete obj.videos;
  obj.updated_at = new Date().toISOString();

  let commitSha;
  try {
    ({ commitSha } = await putFile(repo, cfg.deploy_branch, filePath, JSON.stringify(obj, null, 2) + "\n", sha,
      `content: set video ${sid} on ${slug} via telegram`, pat));
  } catch (e) { return send(chatId, `⚠️ Lỗi GitHub API: ${e.message}`); }

  const key = recordUndo(chatId, `${url ? "đặt" : "bỏ"} video mục`, [{ path: filePath, prevContent: content }]);
  return announce(deps, chatId,
    url ? `🎬 Đã đặt video mục <b>${sid}</b>` : `🗑 Đã bỏ video mục <b>${sid}</b>`, key, commitSha);
}

// ─── Đổi / thêm ảnh 1 mục (ảnh mới, không ghi đè; image_list = nối vào cuối) ────
export async function execSetSectionImage(deps, chatId, slug, { sid, imageField, imageList, imageBase64, ts }) {
  const { cfg, repo, pat, send } = deps;
  const filePath = filePathOf(cfg, "project", slug);
  const repoImg  = `public/images/projects/${slug}/${sid}-${ts}.jpg`;
  const webImg   = `/images/projects/${slug}/${sid}-${ts}.jpg`;

  let content;
  try { ({ content } = await getFile(repo, cfg.deploy_branch, filePath, pat)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  const obj = JSON.parse(content);
  if (imageList) obj[imageField] = [...(Array.isArray(obj[imageField]) ? obj[imageField] : []), webImg];
  else           obj[imageField] = webImg;
  obj.updated_at = new Date().toISOString();

  const files = [
    { path: filePath, content: JSON.stringify(obj, null, 2) + "\n", binary: false },
    { path: repoImg,  content: imageBase64, binary: true },
  ];

  let commitSha;
  try {
    ({ commitSha } = await putFiles(repo, cfg.deploy_branch, files,
      `content: set image ${sid} on ${slug} via telegram`, pat));
  } catch (e) { return send(chatId, `⚠️ Lỗi đăng ảnh: ${e.message}`); }

  const key = recordUndo(chatId, `đổi ảnh mục`, [{ path: filePath, prevContent: content }]);
  return announce(deps, chatId, `🖼 Đã cập nhật ảnh mục <b>${sid}</b>`, key, commitSha);
}
```

- [ ] **Step 2: Thêm `confirmDesc` vào `wizard.mjs`**

Trong `scripts/tg-bot/engine/wizard.mjs`, ngay sau hàm `confirmEdit` (dùng `stash`/`pendingEdits` đã có trong file):

```javascript
// Cổng xác nhận sửa đoạn giới thiệu 1 mục. Đánh dấu kind:"desc" để serve gọi đúng exec.
export function confirmDesc(deps, chatId, wz, value) {
  const { send } = deps;
  const key = stash(pendingEdits, { kind: "desc", content_type: wz.content_type, slug: wz.slug, desc_key: wz.desc_key, value, label: wz.label });
  const preview = value.length > 180 ? value.slice(0, 180) + "…" : value;
  return send(chatId,
    `📝 Cập nhật đoạn giới thiệu <b>${wz.label || wz.desc_key}</b> của <b>${wz.title || wz.slug}</b>\n` +
    `Thành:\n<code>${preview}</code>\n— đúng không?`,
    { reply_markup: { inline_keyboard: [[
      { text: "✅ Đồng ý", callback_data: `wz_confirm:${key}` },
      { text: "❌ Huỷ",    callback_data: `wz_cancel:${key}` },
    ]] } }
  );
}
```

- [ ] **Step 3: Kiểm tra tải module (không lỗi cú pháp / import)**

Run: `node --check scripts/tg-bot/engine/actions.mjs && node --check scripts/tg-bot/engine/wizard.mjs`
Expected: không in gì, exit 0.

Run kiểm export tồn tại:
`node -e "import('./scripts/tg-bot/engine/actions.mjs').then(m=>{for(const k of ['readDescription','readVideo','execSetDescription','execSetVideo','execSetSectionImage']) if(!m[k]) throw new Error('thiếu '+k); console.log('actions OK')})"`
Expected: in `actions OK`.
`node -e "import('./scripts/tg-bot/engine/wizard.mjs').then(m=>{if(!m.confirmDesc) throw new Error('thiếu confirmDesc'); console.log('wizard OK')})"`
Expected: in `wizard OK`.

- [ ] **Step 4: Chạy test suite (không được vỡ test cũ)**

Run: `node --test "scripts/tg-bot/tests/*.test.mjs"`
Expected: PASS toàn bộ (test cũ + test Task 1).

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/engine/actions.mjs scripts/tg-bot/engine/wizard.mjs
git commit -m "feat(tg-bot): actions sửa đoạn giới thiệu / video / ảnh theo mục"
```

---

## Task 3: Dispatch serve.mjs + mode nhập + routing test

**Files:**
- Modify: `scripts/tg-bot/engine/serve.mjs`
- Modify: `scripts/tg-bot/tests/callback-routing.test.mjs`

**Interfaces:**
- Consumes: `buildEditSectionMenu`, `buildSectionActionMenu`, `editSectionCfg` (Task 1); `readDescription`, `execSetDescription`, `execSetVideo`, `execSetSectionImage` (Task 2); `confirmDesc` (Task 2); `youtubeId` (`lib/youtube.mjs`, Slice 1); `downloadPhotoBase64` (đã import).

- [ ] **Step 1: Cập nhật callback-routing.test.mjs (test sẽ fail)**

Trong `scripts/tg-bot/tests/callback-routing.test.mjs`:

(a) Thêm import builder mục — sửa dòng import từ `wizard-helpers.mjs`:
```javascript
import {
  buildFieldKeyboard, buildSectionKeyboard, buildEditSectionMenu, buildSectionActionMenu,
} from "../engine/wizard-helpers.mjs";
```

(b) Trong hàm `allCallbacks()`, thêm các keyboard mới vào mảng `kbs`:
```javascript
    buildEditSectionMenu(cfg, "project", "du-an-mau"),
    buildSectionActionMenu(cfg, "project", "du-an-mau", "tong-quan"),
    buildSectionActionMenu(cfg, "project", "du-an-mau", "gia-ban"),
```

(c) Trong mảng `inline` (nút dựng thẳng trong serve), thêm:
```javascript
    "esec:basic:du-an-mau", "edesc:tong-quan:du-an-mau",
    "eimg:tong-quan:du-an-mau", "evid:tong-quan:du-an-mau",
```

- [ ] **Step 2: Chạy routing test để xác nhận fail**

Run: `node --test scripts/tg-bot/tests/callback-routing.test.mjs`
Expected: FAIL — `esec:`/`edesc:`/`eimg:`/`evid:` chưa có nhánh trong serve.mjs (orphan).

- [ ] **Step 3: Import mới trong serve.mjs**

(a) Sửa import `./wizard-helpers.mjs` (dòng 10-13) — thêm 3 builder:
```javascript
import {
  fieldLabel, actionCode, codeAction, fieldAt, sectionAt,
  buildFieldKeyboard, buildSectionKeyboard,
  buildEditSectionMenu, buildSectionActionMenu, editSectionCfg,
} from "./wizard-helpers.mjs";
```

(b) Sửa import `./wizard.mjs` (dòng 14-17) — thêm `confirmDesc`:
```javascript
import {
  listContentItems, localTitle, renderItemList, renderSections, startAdd,
  confirmEdit, confirmDesc, confirmDelete, takePendingEdit, takePendingDelete,
} from "./wizard.mjs";
```

(c) Sửa import `./actions.mjs` (dòng 19-21) — thêm 4 hàm:
```javascript
import {
  execSetField, execToggleSection, execDelete, execPublish, execUndo, readCurrentField,
  readDescription, execSetDescription, execSetVideo, execSetSectionImage,
} from "./actions.mjs";
```

(d) Thêm import `youtubeId` (sau dòng import actions.mjs):
```javascript
import { youtubeId } from "../../../lib/youtube.mjs";
```

- [ ] **Step 4: Phân nhánh `m:act:` set_field theo content_type**

Trong `handleCallbackQuery`, thay khối `m:act:` (đoạn `if (data.startsWith("m:act:")) { ... }`) bằng:

```javascript
  if (data.startsWith("m:act:")) {
    const [, , code, ct, ...rest] = data.split(":");
    const slug   = rest.join(":");
    const action = codeAction(code);
    const title  = localTitle(deps, ct, slug);
    if (action === "toggle_section") return renderSections(es, chatId, ct, slug, title);
    if (action === "delete")         return confirmDelete(es, chatId, ct, slug, title);
    // set_field: project → bảng chọn mục (khớp thanh menu trang); post → field keyboard.
    if (ct === "project" && (cfg.content_types.project.edit_sections || []).length) {
      return es.send(chatId, `✏️ Sửa <b>${title}</b> — chọn mục:`, {
        reply_markup: buildEditSectionMenu(cfg, ct, slug),
      });
    }
    setWizard(chatId, { step: "field", action: "set_field", content_type: ct, slug, title });
    return es.send(chatId, `Sửa <b>${title}</b> — chọn thông tin cần đổi:`, {
      reply_markup: buildFieldKeyboard(cfg, ct, slug),
    });
  }
```

- [ ] **Step 5: Thêm nhánh `esec:` / `edesc:` / `eimg:` / `evid:`**

Ngay **sau** khối `m:act:` vừa sửa, thêm 4 khối:

```javascript
  // ── Chọn 1 mục để sửa ────────────────────────────────────────────────────────
  if (data.startsWith("esec:")) {
    const [, sid, ...rest] = data.split(":");
    const slug  = rest.join(":");
    const title = localTitle(deps, "project", slug);
    if (sid === "basic") {
      setWizard(chatId, { step: "field", action: "set_field", content_type: "project", slug, title });
      return es.send(chatId, `Sửa <b>${title}</b> — chọn thông tin cần đổi:`, {
        reply_markup: buildFieldKeyboard(cfg, "project", slug),
      });
    }
    const sec = editSectionCfg(cfg, "project", sid);
    if (!sec) return send(chatId, "❌ Mục không hợp lệ. Bấm /menu để làm lại.");
    return es.send(chatId, `<b>${sec.label}</b> — chọn việc:`, {
      reply_markup: buildSectionActionMenu(cfg, "project", slug, sid),
    });
  }

  // ── Sửa đoạn giới thiệu 1 mục ────────────────────────────────────────────────
  if (data.startsWith("edesc:")) {
    const [, sid, ...rest] = data.split(":");
    const slug = rest.join(":");
    const sec  = editSectionCfg(cfg, "project", sid);
    if (!sec?.desc_key) return send(chatId, "❌ Mục không hợp lệ. Bấm /menu.");
    const title = localTitle(deps, "project", slug);
    let current;
    try { current = await readDescription(deps, "project", slug, sec.desc_key); }
    catch { return send(chatId, `❌ Không đọc được <code>${slug}</code>. Bấm /menu.`); }
    setWizard(chatId, { action: "set_desc", content_type: "project", slug, sid, desc_key: sec.desc_key, title, label: sec.label });
    setMode(chatId, "await_desc_value");
    return es.send(chatId,
      `📝 Đoạn giới thiệu <b>${sec.label}</b>\nHiện tại: <code>${current || "(trống)"}</code>\n\n` +
      `Gõ đoạn mới vào đây 👇 (gõ <code>xoá</code> để bỏ đoạn này)`,
      { reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `esec:${sid}:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] } }
    );
  }

  // ── Đổi / thêm ảnh 1 mục ─────────────────────────────────────────────────────
  if (data.startsWith("eimg:")) {
    const [, sid, ...rest] = data.split(":");
    const slug = rest.join(":");
    const sec  = editSectionCfg(cfg, "project", sid);
    if (!sec?.image_field) return send(chatId, "❌ Mục không hợp lệ. Bấm /menu.");
    setWizard(chatId, { action: "set_image", content_type: "project", slug, sid, image_field: sec.image_field, image_list: !!sec.image_list, label: sec.label });
    setMode(chatId, "await_section_image");
    return es.send(chatId,
      `🖼 Gửi 1 ảnh mới cho mục <b>${sec.label}</b> vào đây.\n` +
      (sec.image_list ? "Ảnh sẽ được thêm vào bộ ảnh của mục." : "Ảnh mới sẽ thay ảnh minh hoạ của mục."),
      { reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `esec:${sid}:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] } }
    );
  }

  // ── Dán link video 1 mục ─────────────────────────────────────────────────────
  if (data.startsWith("evid:")) {
    const [, sid, ...rest] = data.split(":");
    const slug = rest.join(":");
    const sec  = editSectionCfg(cfg, "project", sid);
    if (!sec?.video) return send(chatId, "❌ Mục không hợp lệ. Bấm /menu.");
    setWizard(chatId, { action: "set_video", content_type: "project", slug, sid, label: sec.label });
    setMode(chatId, "await_video_url");
    return es.send(chatId,
      `🎬 Video <b>${sec.label}</b>\n\nDán link YouTube vào đây 👇 (gõ <code>xoá</code> để bỏ video)`,
      { reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `esec:${sid}:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] } }
    );
  }
```

- [ ] **Step 6: Phân nhánh `wz_confirm:` cho đoạn giới thiệu**

Thay khối `wz_confirm:` bằng:

```javascript
  if (data.startsWith("wz_confirm:")) {
    const p = takePendingEdit(data.slice("wz_confirm:".length));
    if (!p) return send(chatId, "⏱ Xác nhận đã hết hạn (5 phút). Bấm /menu để làm lại.");
    clearSession(chatId);
    if (p.kind === "desc")
      return execSetDescription(deps, chatId, p.slug, { descKey: p.desc_key, value: p.value, remove: false });
    return execSetField(deps, chatId, p.content_type, { slug: p.slug, field: p.field, value: p.value });
  }
```

- [ ] **Step 7: Thêm 3 mode nhập vào `handleModeInput`**

Trong `handleModeInput`, thêm **trước** dòng cuối `return showMenu(chatId, "Chọn việc cần làm:");`:

```javascript
  if (mode === "await_desc_value") {
    const wz = getWizard(chatId);
    if (!wz?.slug || !wz?.desc_key) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    setMode(chatId, null);
    if (/^xo[aá]$/i.test(text.trim())) {
      clearSession(chatId);
      return execSetDescription(deps, chatId, wz.slug, { descKey: wz.desc_key, value: "", remove: true });
    }
    return confirmDesc(deps, chatId, wz, text);
  }

  if (mode === "await_video_url") {
    const wz = getWizard(chatId);
    if (!wz?.slug || !wz?.sid) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    const t = text.trim();
    setMode(chatId, null);
    if (/^xo[aá]$/i.test(t)) { clearSession(chatId); return execSetVideo(deps, chatId, wz.slug, { sid: wz.sid, url: null }); }
    if (!youtubeId(t)) { setMode(chatId, "await_video_url"); return send(chatId, "❌ Link không phải YouTube hợp lệ. Dán lại link, hoặc bấm /menu để thoát."); }
    clearSession(chatId);
    return execSetVideo(deps, chatId, wz.slug, { sid: wz.sid, url: t });
  }

  if (mode === "await_section_image") {
    const wz = getWizard(chatId);
    if (!wz?.slug || !wz?.image_field) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    if (!msg.photo) return send(chatId, "📷 Gửi 1 tấm ảnh (không phải chữ). Hoặc bấm /menu để thoát.");
    return downloadPhotoBase64(deps, msg).then((img) => {
      if (!img) return send(chatId, "❌ Không tải được ảnh. Thử lại.");
      clearSession(chatId);
      const ts = Date.now().toString(36);
      return execSetSectionImage(deps, chatId, wz.slug, {
        sid: wz.sid, imageField: wz.image_field, imageList: wz.image_list, imageBase64: img, ts,
      });
    });
  }
```

- [ ] **Step 8: Chạy routing test — xanh**

Run: `node --test scripts/tg-bot/tests/callback-routing.test.mjs`
Expected: PASS (mọi callback mới có nhánh, ≤ 64 byte).

- [ ] **Step 9: Chạy toàn bộ test + node --check**

Run: `node --test "scripts/tg-bot/tests/*.test.mjs"`
Expected: PASS toàn bộ.
Run: `node --check scripts/tg-bot/engine/serve.mjs`
Expected: exit 0.
Run kiểm import lib/youtube từ vị trí bot (đường dẫn tương đối đúng):
`node -e "import('./scripts/tg-bot/engine/serve.mjs').catch(e=>{if(String(e).includes('lib/youtube')){console.error('SAI đường dẫn youtube');process.exit(1)} console.log('serve nạp (lỗi env là bình thường):', e.message)})"`
Expected: KHÔNG in "SAI đường dẫn youtube" (in lỗi thiếu env TELEGRAM… là bình thường vì chạy ngoài môi trường bot).

- [ ] **Step 10: Commit**

```bash
git add scripts/tg-bot/engine/serve.mjs scripts/tg-bot/tests/callback-routing.test.mjs
git commit -m "feat(tg-bot): dispatch sửa theo mục (chữ/ảnh/video) + mode nhập"
```

---

## Task 4: Deploy VPS + verify sống

**Files:** không sửa code; push + kiểm tra.

- [ ] **Step 1: Push main (kích hoạt auto-deploy bot)**

```bash
git push origin main
```

- [ ] **Step 2: Theo dõi workflow deploy-bot**

Run: `gh run list --workflow deploy-bot.yml --limit 1` → lấy run_id → `gh run watch <run_id> --exit-status`.
Expected: `completed success`.

- [ ] **Step 3: Verify bot online + không lỗi poll mới**

Run: `ssh root@160.191.88.139 "pm2 describe tg-bot-1992land | grep -E 'status|restarts'; tail -3 /root/.pm2/logs/tg-bot-1992land-error.log"`
Expected: `status online`; không có `[poll error] ... Unauthorized/Conflict` mới sau thời điểm deploy.

- [ ] **Step 4: Nhờ anh Thọ smoke-test trên Telegram (controller xem log song song)**

Kịch bản:
1. `/menu` → 📂 Dự án → chọn 1 dự án → `✏️ Sửa thông tin` → hiện **danh sách mục** (ℹ️ Thông tin cơ bản, 📄 Tổng quan, 📍 Vị trí, …).
2. Chọn `📄 Tổng quan` → bảng `📝 Sửa đoạn giới thiệu` · `🖼 Đổi ảnh` · `🎬 Dán link video` · Quay lại.
3. `📝 Sửa đoạn giới thiệu` → gõ đoạn mới → ✅ Đồng ý → commit + `↩️ Hoàn tác`.
4. `🎬 Dán link video` → dán link YouTube → báo đã đặt + Hoàn tác; mở web sau ~8 phút thấy video.
5. `🖼 Đổi ảnh` → gửi 1 ảnh → báo đã cập nhật + Hoàn tác.
6. Chọn `💰 Giá bán` → bảng **không** có nút `🖼 Đổi ảnh` (mục này không có ảnh).
7. Chọn `ℹ️ Thông tin cơ bản` → về đúng danh sách field cũ (Tiêu đề, Giá, …).
8. Thử dán link video sai (vd `https://google.com`) → bot báo link không hợp lệ, không commit.

Nếu bước nào lỗi → systematic-debugging, không tự báo xong.

- [ ] **Step 5: Cập nhật memory**

Ghi: Slice 2 (bot sửa theo mục — chữ/ảnh/video) xong ngày 2026-07-18; còn Slice 3 (ảnh bìa + gallery).

---

## Self-Review

**1. Spec coverage:**
- Nút "Sửa thông tin" → danh sách mục khớp trang → Task 1 (`buildEditSectionMenu`) + Task 3 Step 4 (project→section menu). ✓
- Bảng con chữ/ảnh/video theo cấu hình mục → `buildSectionActionMenu` (Task 1) + nhánh serve (Task 3 Step 5). ✓
- `basic` giữ luồng field cũ → Task 3 Step 5 (`esec:basic`). ✓
- Sửa đoạn giới thiệu (có xác nhận, có xoá) → `confirmDesc` + `execSetDescription` + mode `await_desc_value` (Task 2, Task 3 Step 6-7). ✓
- Đặt/bỏ video, validate YouTube → `execSetVideo` + mode `await_video_url` + `youtubeId` (Task 2, Task 3 Step 7). ✓
- Đổi/thêm ảnh mục, không ghi đè, image_list nối cuối → `execSetSectionImage` + mode `await_section_image` (Task 2, Task 3 Step 7). ✓
- Post giữ field keyboard → Task 3 Step 4 (nhánh `ct === "project"`). ✓
- Hoàn tác mọi thao tác → `recordUndo` trong 3 exec. ✓
- 64 byte + orphan detector → Task 1 test + Task 3 routing test. ✓

**2. Placeholder scan:** Không có TBD/TODO; mọi step có mã hoặc lệnh cụ thể + kết quả mong đợi. ✓

**3. Type consistency:**
- `esec:<sid>:<slug>`, `edesc/eimg/evid:<sid>:<slug>` — sinh ở `buildEditSectionMenu`/`buildSectionActionMenu` (Task 1), giải ở serve `data.split(":")` (Task 3) khớp. ✓
- `editSectionCfg` trả `{ id, label, desc_key?, image_field?, image_list?, video? }` — dùng nhất quán giữa builder (Task 1) và serve nhánh (Task 3). ✓
- `execSetDescription(deps, chatId, slug, { descKey, value, remove })` — chữ ký khớp giữa actions (Task 2), `wz_confirm` (Task 3 Step 6), mode xoá (Task 3 Step 7). ✓
- `confirmDesc` stash `kind:"desc"` + `desc_key` — khớp nhánh `wz_confirm` đọc `p.kind`/`p.desc_key`. ✓
- `execSetVideo(...,{ sid, url })`, `execSetSectionImage(...,{ sid, imageField, imageList, imageBase64, ts })` — khớp giữa Task 2 và lời gọi Task 3 Step 7. ✓
- `youtubeId` import `../../../lib/youtube.mjs` — đường dẫn từ `scripts/tg-bot/engine` tới `lib` (3 cấp) đúng; kiểm ở Task 3 Step 9. ✓

**Ghi chú rủi ro:**
- `m:act:e:project` giờ mở bảng mục thay vì field keyboard → nút "Quay lại" của value-prompt (`m:act:e:...`) sẽ về bảng mục, không về field keyboard trực tiếp (thêm 1 lần bấm để vào lại Thông tin cơ bản). Chấp nhận — đúng cấu trúc mục-trước.
- `buildFieldKeyboard` giữ back → `m:item:` (không đổi) → cho post vẫn đúng; cho project basic, back về item menu (bỏ qua bảng mục). Chấp nhận, không phá test.
- Ảnh mục lưu tên `<sid>-<ts>.jpg` → không đè ảnh cũ; Hoàn tác trỏ JSON về cũ, ảnh mới để lại repo (vô hại). Khớp Global Constraints.
