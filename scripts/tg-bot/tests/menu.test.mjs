import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMainMenu, buildTypeMenu, typesFor, welcomeText, helpText } from "../engine/menu.mjs";
import { default as cfg } from "../adapters/1992land/config.mjs";

const flat = (kb) => kb.inline_keyboard.flat();

test("typesFor: chỉ project có sections → toggle_section 1 loại", () => {
  assert.deepEqual(typesFor(cfg, "toggle_section").map((t) => t.key), ["project"]);
});

test("typesFor: sửa và xoá áp dụng cho cả 2 loại nội dung", () => {
  assert.deepEqual(typesFor(cfg, "set_field").map((t) => t.key), ["project", "post"]);
  assert.deepEqual(typesFor(cfg, "delete").map((t) => t.key), ["project", "post"]);
});

test("menu chính có đủ nút thêm cho mỗi loại nội dung", () => {
  const cb = flat(buildMainMenu(cfg)).map((b) => b.callback_data);
  assert.ok(cb.includes("m:add:project"));
  assert.ok(cb.includes("m:add:post"));
});

test("action nhiều loại → qua tầng 2; action 1 loại → vào thẳng wizard", () => {
  const cb = flat(buildMainMenu(cfg)).map((b) => b.callback_data);
  assert.ok(cb.includes("m:type:set_field"));       // project + post
  assert.ok(cb.includes("m:type:delete"));          // project + post
  assert.ok(cb.includes("m:go:toggle_section:project")); // chỉ project
  assert.equal(cb.includes("m:type:toggle_section"), false);
});

test("menu chính không còn lộ cú pháp [..] ra nút bấm", () => {
  for (const b of flat(buildMainMenu(cfg)))
    assert.equal(/\[.+\]/.test(b.text), false, `nút còn cú pháp máy: ${b.text}`);
});

test("menu chính có nút trợ lý và hướng dẫn", () => {
  const cb = flat(buildMainMenu(cfg)).map((b) => b.callback_data);
  assert.ok(cb.includes("wz_ask"));
  assert.ok(cb.includes("m:help"));
});

test("tầng 2 liệt kê từng loại + nút quay lại menu", () => {
  const kb = buildTypeMenu(cfg, "delete");
  const cb = flat(kb).map((b) => b.callback_data);
  assert.ok(cb.includes("m:go:delete:project"));
  assert.ok(cb.includes("m:go:delete:post"));
  assert.ok(cb.includes("m:menu"));
});

test("callback_data của menu <= 64 byte", () => {
  const all = [...flat(buildMainMenu(cfg)), ...flat(buildTypeMenu(cfg, "set_field"))];
  for (const b of all)
    assert.ok(Buffer.byteLength(b.callback_data) <= 64, `dài quá: ${b.callback_data}`);
});

test("lời chào và hướng dẫn nhắc đúng tên site", () => {
  assert.ok(welcomeText(cfg).includes(cfg.site_name));
  assert.ok(helpText(cfg).includes("Hoàn tác"));
  assert.ok(helpText(cfg).includes("/huy"));
});

test("mọi slash command đều có route mà engine hiểu", () => {
  const known = new Set(["menu", "help", "cancel"]);
  for (const s of cfg.slash_commands) {
    const [kind, arg] = s.route.split(":");
    if (known.has(s.route)) continue;
    assert.ok(["add", "action"].includes(kind), `route lạ: ${s.route}`);
    if (kind === "add")    assert.ok(cfg.content_types[arg]?.add_mode, `add:${arg} không có add_mode`);
    if (kind === "action") assert.ok(typesFor(cfg, arg).length > 0, `action:${arg} không loại nào hỗ trợ`);
  }
});

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
