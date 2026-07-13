import { test } from "node:test";
import assert from "node:assert/strict";
import {
  noAccent, fieldLabel, filterItems, paginate, actionCode, codeAction, fieldAt, sectionAt,
  buildListKeyboard, buildFieldKeyboard, buildSectionKeyboard, WIZARD_PAGE_SIZE,
} from "../engine/wizard-helpers.mjs";
import { default as cfg } from "../adapters/1992land/config.mjs";

const mkItems = (n) =>
  Array.from({ length: n }, (_, i) => ({ slug: `du-an-${i + 1}`, title: `Dự án ${i + 1}` }));

test("noAccent bỏ dấu + thường hóa", () => {
  assert.equal(noAccent("Dự Án Vũng Tàu"), "du an vung tau");
  assert.equal(noAccent("ĐẤT NỀN"), "dat nen");
});

test("actionCode/codeAction đi vòng tròn", () => {
  for (const a of ["set_field", "toggle_section", "delete"])
    assert.equal(codeAction(actionCode(a)), a);
  assert.equal(actionCode("set_field").length, 1);
});

test("fieldLabel lấy nhãn tiếng Việt từ config, fallback tên field", () => {
  assert.equal(fieldLabel(cfg, "priceRange"), "Giá");
  assert.equal(fieldLabel(cfg, "location"), "Vị trí");
  assert.equal(fieldLabel(cfg, "khong_co_trong_map"), "khong_co_trong_map");
});

test("filterItems khớp không phân biệt dấu, theo title hoặc slug", () => {
  const items = [
    { slug: "vinhomes-grand-park", title: "Vinhomes Grand Park" },
    { slug: "blanca-city-vung-tau", title: "Blanca City Vũng Tàu" },
  ];
  assert.equal(filterItems(items, "vung tau").length, 1);
  assert.equal(filterItems(items, "VŨNG").length, 1);
  assert.equal(filterItems(items, "grand").length, 1);
  assert.equal(filterItems(items, "vinhomes-grand").length, 1); // theo slug
  assert.equal(filterItems(items, "").length, 2);               // rỗng = giữ nguyên
});

test("paginate: trang đầu của >15 mục có hasNext, không hasPrev", () => {
  const p = paginate(mkItems(20), 0, WIZARD_PAGE_SIZE);
  assert.equal(p.page.length, 15);
  assert.equal(p.hasPrev, false);
  assert.equal(p.hasNext, true);
  assert.equal(p.total, 20);
});

test("paginate: trang cuối có hasPrev, không hasNext", () => {
  const p = paginate(mkItems(20), 15, WIZARD_PAGE_SIZE);
  assert.equal(p.page.length, 5);
  assert.equal(p.hasPrev, true);
  assert.equal(p.hasNext, false);
});

test("buildListKeyboard: <=15 mục → không có nút phân trang", () => {
  const kb = buildListKeyboard("set_field", "project", mkItems(12), 0);
  const flat = kb.inline_keyboard.flat().map((b) => b.text);
  assert.equal(flat.includes("▶️ Trang sau"), false);
  assert.equal(flat.includes("◀️ Trang trước"), false);
  assert.equal(flat.includes("🔍 Tìm theo tên"), true);
  assert.equal(flat.includes("⬅️ Quay lại"), true);
  // 12 nút dự án + hàng tìm + hàng điều hướng
  assert.equal(kb.inline_keyboard.length, 14);
});

test("buildListKeyboard: >15 mục trang đầu → có 'Trang sau', không 'Trang trước'", () => {
  const kb = buildListKeyboard("set_field", "project", mkItems(20), 0);
  const flat = kb.inline_keyboard.flat().map((b) => b.text);
  assert.equal(flat.includes("▶️ Trang sau"), true);
  assert.equal(flat.includes("◀️ Trang trước"), false);
});

test("buildListKeyboard: trang 2 → có 'Trang trước'; callback_data mang action + slug", () => {
  const kb = buildListKeyboard("delete", "project", mkItems(20), 15);
  const flat = kb.inline_keyboard.flat();
  assert.equal(flat.map((b) => b.text).includes("◀️ Trang trước"), true);
  const pick = flat.find((b) => b.callback_data?.startsWith("wz_pick:"));
  assert.equal(pick.callback_data, `wz_pick:${actionCode("delete")}:project:du-an-16`);
});

test("callback_data luôn <= 64 byte kể cả với slug dài nhất trong repo", () => {
  const longSlug = "quy-trinh-chuyen-nhuong-bds-tung-buoc"; // 36 ký tự
  const items = [{ slug: longSlug, title: "Quy trình chuyển nhượng BĐS từng bước" }];
  for (const action of ["set_field", "toggle_section", "delete"]) {
    const kb = buildListKeyboard(action, "project", items, 0);
    for (const b of kb.inline_keyboard.flat())
      assert.ok(Buffer.byteLength(b.callback_data) <= 64, `dài quá: ${b.callback_data}`);
  }
  const fkb = buildFieldKeyboard(cfg, "project", longSlug);
  for (const b of fkb.inline_keyboard.flat())
    assert.ok(Buffer.byteLength(b.callback_data) <= 64, `dài quá: ${b.callback_data}`);
  const skb = buildSectionKeyboard(cfg, "project", longSlug, []);
  for (const b of skb.inline_keyboard.flat())
    assert.ok(Buffer.byteLength(b.callback_data) <= 64, `dài quá: ${b.callback_data}`);
});

test("buildFieldKeyboard: 1 nút / field + nhãn tiếng Việt", () => {
  const kb = buildFieldKeyboard(cfg, "project", "blanca-city-vung-tau");
  const texts = kb.inline_keyboard.flat().map((b) => b.text);
  assert.equal(texts.includes("Giá"), true);
  assert.equal(texts.includes("Vị trí"), true);
  const btn = kb.inline_keyboard.flat().find((b) => b.text === "Giá");
  assert.equal(btn.callback_data, `wz_f:project:blanca-city-vung-tau:${cfg.content_types.project.editable_fields.indexOf("priceRange")}`);
});

test("chỉ số field/section giải mã ngược về đúng tên", () => {
  assert.equal(fieldAt(cfg, "project", 2), "priceRange");
  assert.equal(fieldAt(cfg, "post", 0), "title");
  assert.equal(fieldAt(cfg, "project", 99), undefined);
  assert.equal(sectionAt(cfg, "project", 0), "tong-quan");
  assert.equal(sectionAt(cfg, "project", 4), "gia-ban");
  assert.equal(sectionAt(cfg, "project", 99), undefined);
});

test("buildFieldKeyboard cho post dùng editable_fields của post", () => {
  const kb = buildFieldKeyboard(cfg, "post", "bai-viet-mau");
  const texts = kb.inline_keyboard.flat().map((b) => b.text);
  assert.equal(texts.includes("Chuyên mục"), true); // category
  assert.equal(texts.includes("Giá"), false);       // không có priceRange ở post
});

test("buildSectionKeyboard: ✅ cho phần đang hiện, 🙈 cho phần đang ẩn", () => {
  const kb = buildSectionKeyboard(cfg, "project", "lusso-sai-gon", ["gia-ban", "mat-bang"]);
  const texts = kb.inline_keyboard.flat().map((b) => b.text);
  assert.equal(texts.includes("🙈 Giá bán"), true);
  assert.equal(texts.includes("🙈 Mặt bằng"), true);
  assert.equal(texts.includes("✅ Tổng quan"), true);
  assert.equal(texts.includes("✅ Vị trí"), true);
});

test("buildSectionKeyboard: callback mang chỉ số giải mã về đúng id phần", () => {
  const kb = buildSectionKeyboard(cfg, "project", "abc", []);
  const btn = kb.inline_keyboard.flat().find((b) => b.text === "✅ Pháp lý");
  const [, ct, slug, idx] = btn.callback_data.split(":");
  assert.equal(ct, "project");
  assert.equal(slug, "abc");
  assert.equal(sectionAt(cfg, ct, idx), "phap-ly");
});

test("id các phần khớp anchorSections trong app/du-an/[slug]/page.tsx", () => {
  const ids = Object.keys(cfg.content_types.project.sections);
  assert.deepEqual(ids, [
    "tong-quan", "vi-tri", "tien-ich", "mat-bang",
    "gia-ban", "phap-ly", "chinh-sach", "dang-ky",
  ]);
});
