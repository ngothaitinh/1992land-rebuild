# Slice 3 — Bot đổi ảnh bìa + thêm ảnh gallery — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Qua bot: đổi **ảnh bìa** (`hero_image`) và **thêm nhiều ảnh** vào thư viện (`gallery`, cộng dồn).

**Architecture:** Thêm nút `🖼 Ảnh bìa & thư viện` vào `buildItemMenu` (chỉ project). Nút mở `buildMediaMenu` → `🏞 Đổi ảnh bìa` (`ehero:<slug>`) và `➕ Thêm ảnh thư viện` (`egal:<slug>`). Ảnh bìa: nhận 1 ảnh → `execSetHero`. Gallery: mode nhận nhiều ảnh, gom vào buffer trong session, bấm `✅ Xong` (`galdone:<slug>`) → `execAddGallery` (1 commit gộp nối vào cuối `gallery`). Cùng khuôn `execSetSectionImage` của Slice 2 (ảnh mới không ghi đè, Hoàn tác trỏ JSON về cũ).

**Tech Stack:** Node.js ESM `.mjs`, `node:test`, Telegram Bot API, Git Trees API (`putFiles`), session store TTL 30 phút.

## Global Constraints

- ESM `.mjs`, không thêm dependency npm. `callback_data` ≤ 64 byte.
- Prefix mới: `emedia:` `ehero:` `egal:` `galdone:` — không prefix nào là tiền tố của prefix khác, và không đè prefix cũ (`m:*`, `wz_*`, `pub_*`, `undo:`, `esec:`/`edesc:`/`eimg:`/`evid:`). Kiểm: `em`/`eh`/`eg`/`ga` phân kỳ ngay ký tự thứ 2 với nhau và với `es`/`ed`/`ei`/`ev`.
- Chỉ project. Ảnh mới **không ghi đè**: `hero-<ts>.jpg`, `gallery-<ts>-<i>.jpg` trong `public/images/projects/<slug>/`.
- Gallery **nối** vào cuối mảng `gallery` (không mất ảnh cũ). Hoàn tác trỏ JSON về cũ (ảnh mới để lại repo).
- Mọi thao tác ghi tái dùng `putFiles` + `recordUndo` + `announce`. Không đụng commit/deploy/undo core.
- Giữ nguyên mọi luồng Slice 1/2 và trước đó.
- Copy tiếng Việt. Icon: `🖼` ảnh, `🏞` ảnh bìa, `➕` thêm, `✅` xong, `⬅️` quay lại, `❌` thoát.
- Test: `node --test "scripts/tg-bot/tests/*.test.mjs"` (glob). Phải xanh cuối mỗi task.

## File Structure

| File | Trách nhiệm sau thay đổi |
|------|--------------------------|
| `scripts/tg-bot/engine/menu.mjs` | `buildItemMenu` thêm nút `🖼 Ảnh bìa & thư viện` (chỉ project); thêm `buildMediaMenu`. |
| `scripts/tg-bot/engine/actions.mjs` | Thêm `execSetHero`, `execAddGallery`. |
| `scripts/tg-bot/engine/serve.mjs` | Dispatch `emedia`/`ehero`/`egal`/`galdone` + mode `await_hero_image`/`await_gallery_images` (buffer). |
| `scripts/tg-bot/tests/menu.test.mjs` | Test nút media + `buildMediaMenu`. |
| `scripts/tg-bot/tests/callback-routing.test.mjs` | Thêm keyboard media vào orphan-detector. |

---

## Task 1: Nút media + `buildMediaMenu` (thuần, có test)

**Files:**
- Modify: `scripts/tg-bot/engine/menu.mjs`
- Test: `scripts/tg-bot/tests/menu.test.mjs`

**Interfaces:**
- Produces:
  - `buildItemMenu(...)` — thêm nút `🖼 Ảnh bìa & thư viện` (`emedia:<slug>`) cho project (gate `ct.sections`), đặt sau "Sửa thông tin".
  - `buildMediaMenu(cfg, slug) → { inline_keyboard }` — `🏞 Đổi ảnh bìa` (`ehero:<slug>`), `➕ Thêm ảnh thư viện` (`egal:<slug>`), Quay lại (`m:item:project:<slug>`), Thoát (`wz_abort`).

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `scripts/tg-bot/tests/menu.test.mjs`:

```javascript
import { buildMediaMenu } from "../engine/menu.mjs";

test("buildItemMenu (dự án): có nút Ảnh bìa & thư viện", () => {
  const cb = buildItemMenu(cfg, "project", "maia-ho-tram", "Maia")
    .inline_keyboard.flat().map((b) => b.callback_data);
  assert.ok(cb.includes("emedia:maia-ho-tram"));
});

test("buildItemMenu (bài viết): KHÔNG có nút Ảnh bìa & thư viện", () => {
  const cb = buildItemMenu(cfg, "post", "bai-mau", "Bài")
    .inline_keyboard.flat().map((b) => b.callback_data);
  assert.equal(cb.some((c) => c.startsWith("emedia:")), false);
});

test("buildMediaMenu: đổi bìa + thêm gallery + quay lại", () => {
  const cb = buildMediaMenu(cfg, "maia-ho-tram")
    .inline_keyboard.flat().map((b) => b.callback_data);
  assert.ok(cb.includes("ehero:maia-ho-tram"));
  assert.ok(cb.includes("egal:maia-ho-tram"));
  assert.ok(cb.includes("m:item:project:maia-ho-tram"));
});

test("callback media ≤ 64 byte với slug dài nhất", () => {
  const slug = "quy-trinh-chuyen-nhuong-bds-tung-buoc";
  const kbs = [buildItemMenu(cfg, "project", slug, "X"), buildMediaMenu(cfg, slug)];
  for (const kb of kbs)
    for (const b of kb.inline_keyboard.flat())
      assert.ok(Buffer.byteLength(b.callback_data) <= 64, `dài quá: ${b.callback_data}`);
});
```

- [ ] **Step 2: Chạy test để chắc chắn fail**

Run: `node --test scripts/tg-bot/tests/menu.test.mjs`
Expected: FAIL — `buildMediaMenu` chưa export, `buildItemMenu` chưa có `emedia`.

- [ ] **Step 3: Sửa `buildItemMenu` + thêm `buildMediaMenu` trong `menu.mjs`**

Trong `scripts/tg-bot/engine/menu.mjs`, trong `buildItemMenu`, thêm **ngay sau** khối `if ((ct.editable_fields || []).length) ...` (trước khối `if (ct.sections) ...`):

```javascript
  if (ct.sections)
    rows.push([{ text: "🖼 Ảnh bìa & thư viện", callback_data: `emedia:${slug}` }]);
```

Thêm hàm mới (đặt ngay sau `buildItemMenu`):

```javascript
// Bảng ảnh của 1 dự án: đổi ảnh bìa, thêm ảnh vào thư viện.
export function buildMediaMenu(cfg, slug) {
  return {
    inline_keyboard: [
      [{ text: "🏞 Đổi ảnh bìa",        callback_data: `ehero:${slug}` }],
      [{ text: "➕ Thêm ảnh thư viện",  callback_data: `egal:${slug}` }],
      [
        { text: "⬅️ Quay lại", callback_data: `m:item:project:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ],
    ],
  };
}
```

- [ ] **Step 4: Chạy test để chắc chắn xanh**

Run: `node --test scripts/tg-bot/tests/menu.test.mjs`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add scripts/tg-bot/engine/menu.mjs scripts/tg-bot/tests/menu.test.mjs
git commit -m "feat(tg-bot): nút Ảnh bìa & thư viện + bảng media"
```

---

## Task 2: Actions `execSetHero` + `execAddGallery`

**Files:**
- Modify: `scripts/tg-bot/engine/actions.mjs`

**Interfaces:**
- Consumes: `filePathOf`, `getFile`, `putFiles`, `recordUndo`, `announce` (đã có trong actions.mjs).
- Produces:
  - `execSetHero(deps, chatId, slug, { imageBase64, ts }) → Promise`
  - `execAddGallery(deps, chatId, slug, images) → Promise` — `images = [{ base64, i }]`, dùng chung 1 `ts`.

- [ ] **Step 1: Thêm 2 hàm vào cuối `actions.mjs`**

```javascript
// ─── Đổi ảnh bìa (hero_image) — ảnh mới, không ghi đè ─────────────────────────
export async function execSetHero(deps, chatId, slug, { imageBase64, ts }) {
  const { cfg, repo, pat, send } = deps;
  const filePath = filePathOf(cfg, "project", slug);
  const repoImg  = `public/images/projects/${slug}/hero-${ts}.jpg`;
  const webImg   = `/images/projects/${slug}/hero-${ts}.jpg`;

  let content;
  try { ({ content } = await getFile(repo, cfg.deploy_branch, filePath, pat)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  const obj = JSON.parse(content);
  obj.hero_image = webImg;
  obj.updated_at = new Date().toISOString();

  const files = [
    { path: filePath, content: JSON.stringify(obj, null, 2) + "\n", binary: false },
    { path: repoImg,  content: imageBase64, binary: true },
  ];

  let commitSha;
  try {
    ({ commitSha } = await putFiles(repo, cfg.deploy_branch, files,
      `content: set hero on ${slug} via telegram`, pat));
  } catch (e) { return send(chatId, `⚠️ Lỗi đăng ảnh: ${e.message}`); }

  const key = recordUndo(chatId, `đổi ảnh bìa`, [{ path: filePath, prevContent: content }]);
  return announce(deps, chatId, `🏞 Đã đổi ảnh bìa <b>${slug}</b>`, key, commitSha);
}

// ─── Thêm nhiều ảnh vào thư viện (gallery) — nối vào cuối, không ghi đè ────────
export async function execAddGallery(deps, chatId, slug, images) {
  const { cfg, repo, pat, send } = deps;
  if (!images || !images.length) return send(chatId, "❌ Chưa có ảnh nào để thêm.");
  const filePath = filePathOf(cfg, "project", slug);
  const ts = Date.now().toString(36);

  let content;
  try { ({ content } = await getFile(repo, cfg.deploy_branch, filePath, pat)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  const obj = JSON.parse(content);
  const cur = Array.isArray(obj.gallery) ? obj.gallery : [];
  const webPaths = images.map((_, i) => `/images/projects/${slug}/gallery-${ts}-${i}.jpg`);
  obj.gallery = [...cur, ...webPaths];
  obj.updated_at = new Date().toISOString();

  const files = [
    { path: filePath, content: JSON.stringify(obj, null, 2) + "\n", binary: false },
    ...images.map((img, i) => ({
      path: `public/images/projects/${slug}/gallery-${ts}-${i}.jpg`,
      content: img.base64, binary: true,
    })),
  ];

  let commitSha;
  try {
    ({ commitSha } = await putFiles(repo, cfg.deploy_branch, files,
      `content: add ${images.length} gallery image(s) on ${slug} via telegram`, pat));
  } catch (e) { return send(chatId, `⚠️ Lỗi đăng ảnh: ${e.message}`); }

  const key = recordUndo(chatId, `thêm ${images.length} ảnh thư viện`, [{ path: filePath, prevContent: content }]);
  return announce(deps, chatId, `🖼 Đã thêm <b>${images.length}</b> ảnh vào thư viện <b>${slug}</b>`, key, commitSha);
}
```

- [ ] **Step 2: Kiểm tra cú pháp + export**

Run: `node --check scripts/tg-bot/engine/actions.mjs`
Expected: exit 0.
Run: `node -e "import('./scripts/tg-bot/engine/actions.mjs').then(m=>{for(const k of ['execSetHero','execAddGallery']) if(!m[k]) throw new Error('thiếu '+k); console.log('actions OK')})"`
Expected: in `actions OK`.

- [ ] **Step 3: Chạy test suite (không vỡ test cũ)**

Run: `node --test "scripts/tg-bot/tests/*.test.mjs"`
Expected: PASS toàn bộ.

- [ ] **Step 4: Commit**

```bash
git add scripts/tg-bot/engine/actions.mjs
git commit -m "feat(tg-bot): actions đổi ảnh bìa + thêm ảnh thư viện"
```

---

## Task 3: Dispatch serve.mjs + mode nhận ảnh (buffer gallery)

**Files:**
- Modify: `scripts/tg-bot/engine/serve.mjs`
- Modify: `scripts/tg-bot/tests/callback-routing.test.mjs`

**Interfaces:**
- Consumes: `buildMediaMenu` (Task 1); `execSetHero`, `execAddGallery` (Task 2); `downloadPhotoBase64` (đã import); `setWizard`/`getWizard` (đã import).

- [ ] **Step 1: Cập nhật routing test (fail)**

Trong `scripts/tg-bot/tests/callback-routing.test.mjs`:

(a) Thêm `buildMediaMenu` vào import từ `../engine/menu.mjs`:
```javascript
import { buildMainMenu, buildItemListMenu, buildItemMenu, buildMediaMenu } from "../engine/menu.mjs";
```

(b) Trong `allCallbacks()`, thêm vào mảng `kbs`:
```javascript
    buildMediaMenu(cfg, "du-an-mau"),
```

(c) Trong mảng `inline`, thêm:
```javascript
    "emedia:du-an-mau", "ehero:du-an-mau", "egal:du-an-mau", "galdone:du-an-mau",
```

- [ ] **Step 2: Chạy routing test để xác nhận fail**

Run: `node --test scripts/tg-bot/tests/callback-routing.test.mjs`
Expected: FAIL — `emedia:`/`ehero:`/`egal:`/`galdone:` orphan.

- [ ] **Step 3: Import `buildMediaMenu` + actions vào serve.mjs**

(a) Sửa import `./menu.mjs` (dòng 9):
```javascript
import { buildMainMenu, buildItemMenu, buildMediaMenu, mainMenuText, welcomeText, helpText } from "./menu.mjs";
```

(b) Thêm `execSetHero`, `execAddGallery` vào import `./actions.mjs`:
```javascript
import {
  execSetField, execToggleSection, execDelete, execPublish, execUndo, readCurrentField,
  readDescription, execSetDescription, execSetVideo, execSetSectionImage,
  execSetHero, execAddGallery,
} from "./actions.mjs";
```

- [ ] **Step 4: Thêm 4 nhánh callback**

Trong `handleCallbackQuery`, thêm **sau** nhánh `evid:` (trước `wz_abort`):

```javascript
  // ── Bảng ảnh: đổi bìa / thêm thư viện ────────────────────────────────────────
  if (data.startsWith("emedia:")) {
    const slug  = data.slice("emedia:".length);
    const title = localTitle(deps, "project", slug);
    return es.send(chatId, `🖼 <b>${title}</b> — ảnh bìa & thư viện:`, {
      reply_markup: buildMediaMenu(cfg, slug),
    });
  }

  if (data.startsWith("ehero:")) {
    const slug = data.slice("ehero:".length);
    setWizard(chatId, { action: "set_hero", content_type: "project", slug });
    setMode(chatId, "await_hero_image");
    return es.send(chatId, "🏞 Gửi 1 ảnh bìa mới vào đây.", {
      reply_markup: { inline_keyboard: [[
        { text: "⬅️ Quay lại", callback_data: `emedia:${slug}` },
        { text: "❌ Thoát",     callback_data: "wz_abort" },
      ]] },
    });
  }

  if (data.startsWith("egal:")) {
    const slug = data.slice("egal:".length);
    setWizard(chatId, { action: "add_gallery", content_type: "project", slug, buf: [] });
    setMode(chatId, "await_gallery_images");
    return es.send(chatId,
      "➕ Gửi các ảnh muốn thêm vào thư viện (gửi lần lượt bao nhiêu tấm cũng được). Xong bấm <b>✅ Xong</b>.",
      { reply_markup: { inline_keyboard: [[
        { text: "✅ Xong", callback_data: `galdone:${slug}` },
        { text: "❌ Thoát", callback_data: "wz_abort" },
      ]] } }
    );
  }

  if (data.startsWith("galdone:")) {
    const slug = data.slice("galdone:".length);
    const wz = getWizard(chatId);
    const buf = wz?.buf || [];
    clearSession(chatId);
    if (!buf.length) return send(chatId, "❌ Chưa nhận ảnh nào. Bấm /menu để làm lại.");
    return execAddGallery(deps, chatId, slug, buf);
  }
```

- [ ] **Step 5: Thêm 2 mode nhận ảnh vào `handleModeInput`**

Thêm **trước** dòng cuối `return showMenu(chatId, "Chọn việc cần làm:");`:

```javascript
  if (mode === "await_hero_image") {
    const wz = getWizard(chatId);
    if (!wz?.slug) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    if (!msg.photo) return send(chatId, "📷 Gửi 1 tấm ảnh (không phải chữ). Hoặc bấm /menu để thoát.");
    return downloadPhotoBase64(deps, msg).then((img) => {
      if (!img) return send(chatId, "❌ Không tải được ảnh. Thử lại.");
      clearSession(chatId);
      return execSetHero(deps, chatId, wz.slug, { imageBase64: img, ts: Date.now().toString(36) });
    });
  }

  if (mode === "await_gallery_images") {
    const wz = getWizard(chatId);
    if (!wz?.slug) { clearSession(chatId); return send(chatId, "⏱ Phiên đã hết hạn. Bấm /menu để làm lại."); }
    if (!msg.photo) return send(chatId, "📷 Gửi ảnh (không phải chữ), hoặc bấm ✅ Xong.");
    return downloadPhotoBase64(deps, msg).then((img) => {
      if (!img) return send(chatId, "❌ Không tải được 1 ảnh, bỏ qua tấm đó. Gửi tiếp hoặc bấm ✅ Xong.");
      const cur = getWizard(chatId);
      if (!cur?.slug || cur.action !== "add_gallery") return; // phiên đã đổi
      const buf = [...(cur.buf || []), { base64: img }];
      setWizard(chatId, { ...cur, buf });
      return send(chatId, `📸 Đã nhận <b>${buf.length}</b> ảnh. Gửi tiếp hoặc bấm ✅ Xong.`, {
        reply_markup: { inline_keyboard: [[
          { text: "✅ Xong", callback_data: `galdone:${cur.slug}` },
          { text: "❌ Thoát", callback_data: "wz_abort" },
        ]] },
      });
    });
  }
```

- [ ] **Step 6: Chạy routing test — xanh**

Run: `node --test scripts/tg-bot/tests/callback-routing.test.mjs`
Expected: PASS.

- [ ] **Step 7: Toàn bộ test + node --check**

Run: `node --test "scripts/tg-bot/tests/*.test.mjs"`
Expected: PASS toàn bộ.
Run: `node --check scripts/tg-bot/engine/serve.mjs`
Expected: exit 0.

- [ ] **Step 8: Commit**

```bash
git add scripts/tg-bot/engine/serve.mjs scripts/tg-bot/tests/callback-routing.test.mjs
git commit -m "feat(tg-bot): dispatch đổi ảnh bìa + thêm ảnh thư viện (buffer)"
```

---

## Task 4: Deploy VPS + verify sống

**Files:** không sửa code; push + kiểm tra.

- [ ] **Step 1: Push main**

```bash
git push origin main
```

- [ ] **Step 2: Theo dõi deploy-bot**

Run: `gh run list --workflow deploy-bot.yml --limit 1` → `gh run watch <run_id> --exit-status`.
Expected: `completed success`.

- [ ] **Step 3: Verify bot online**

Run: `ssh root@160.191.88.139 "pm2 describe tg-bot-1992land | grep -E 'status|restarts'; tail -3 /root/.pm2/logs/tg-bot-1992land-error.log"`
Expected: `status online`; không lỗi poll mới sau deploy.

- [ ] **Step 4: Nhờ anh Thọ smoke-test (controller xem log song song)**

1. `/menu` → 📂 Dự án → chọn dự án → thấy nút `🖼 Ảnh bìa & thư viện`.
2. Bấm → `🏞 Đổi ảnh bìa` → gửi 1 ảnh → báo đã đổi + Hoàn tác; web sau ~8 phút đổi ảnh bìa (slider đầu trang).
3. `➕ Thêm ảnh thư viện` → gửi 3-4 ảnh → mỗi ảnh báo "Đã nhận N ảnh" → bấm ✅ Xong → báo đã thêm N ảnh + Hoàn tác; web thêm ảnh vào slider (không mất ảnh cũ).
4. Bấm ↩️ Hoàn tác → gallery về như cũ.
5. Bài viết (post): bảng thao tác **không** có nút `🖼 Ảnh bìa & thư viện`.

Nếu lỗi → systematic-debugging, không tự báo xong.

- [ ] **Step 5: Cập nhật memory**

Ghi: Slice 3 (bot đổi ảnh bìa + thêm gallery) xong ngày 2026-07-18. Cả 3 slice dự án section-editing hoàn tất.

---

## Self-Review

**1. Spec coverage:**
- Nút `🖼 Ảnh bìa & thư viện` (chỉ project) → Task 1 (`buildItemMenu` gate `ct.sections`) + test post không có. ✓
- `buildMediaMenu` 2 việc + quay lại → Task 1. ✓
- Đổi ảnh bìa, ảnh mới không ghi đè, Hoàn tác → `execSetHero` (Task 2) + mode `await_hero_image` (Task 3). ✓
- Thêm gallery cộng dồn, nhiều ảnh 1 commit → `execAddGallery` nối `[...cur, ...webPaths]` + buffer mode `await_gallery_images` + `galdone` (Task 2, Task 3). ✓
- Hoàn tác mọi thao tác → `recordUndo` trong 2 exec. ✓
- 64 byte + orphan detector → Task 1 test + Task 3 routing test. ✓

**2. Placeholder scan:** Không có TBD/TODO; mọi step có mã/lệnh + kết quả mong đợi. ✓

**3. Type consistency:**
- `emedia:`/`ehero:`/`egal:`/`galdone:` — sinh ở `buildItemMenu`/`buildMediaMenu` (Task 1), giải ở serve `data.slice(...)` (Task 3) khớp. ✓
- `execSetHero(deps, chatId, slug, { imageBase64, ts })` — khớp lời gọi mode `await_hero_image`. ✓
- `execAddGallery(deps, chatId, slug, images)` với `images=[{base64}]` — khớp buffer `{ base64: img }` gom ở `await_gallery_images` và lời gọi `galdone`. ✓
- Buffer trong `wizard` slot (`{ action:"add_gallery", slug, buf }`) — set/get nhất quán; `galdone` đọc `wz.buf`. ✓

**Ghi chú rủi ro:**
- Album Telegram = nhiều update → mỗi ảnh 1 lần "Đã nhận N ảnh" (hơi nhiều tin với album lớn). Chấp nhận — rõ ràng cho người dùng, 1 người dùng duy nhất.
- Buffer base64 nhiều ảnh trong RAM session (1 user) — chấp nhận, TTL 30 phút tự dọn.
- `galdone` đọc buffer trước `clearSession`; nếu phiên hết hạn (30') giữa chừng → `wz` null → báo "chưa nhận ảnh". Chấp nhận.
