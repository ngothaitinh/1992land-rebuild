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
