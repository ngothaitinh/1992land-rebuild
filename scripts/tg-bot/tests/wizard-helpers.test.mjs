import { test } from "node:test";
import assert from "node:assert/strict";
import {
  noAccent, fieldLabel, filterItems, paginate,
  buildListKeyboard, buildFieldKeyboard, WIZARD_PAGE_SIZE,
} from "../engine/wizard-helpers.mjs";
import { default as cfg } from "../adapters/1992land/config.mjs";

const mkItems = (n) =>
  Array.from({ length: n }, (_, i) => ({ slug: `du-an-${i + 1}`, title: `Dự án ${i + 1}` }));

test("noAccent bỏ dấu + thường hóa", () => {
  assert.equal(noAccent("Dự Án Vũng Tàu"), "du an vung tau");
  assert.equal(noAccent("ĐẤT NỀN"), "dat nen");
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
  const kb = buildListKeyboard("project", mkItems(12), 0);
  const flat = kb.inline_keyboard.flat().map((b) => b.text);
  assert.equal(flat.includes("▶️ Xem thêm"), false);
  assert.equal(flat.includes("◀️ Quay lại"), false);
  assert.equal(flat.includes("🔍 Tìm theo tên"), true);
  assert.equal(flat.includes("💬 Hỏi AI"), true);
  // 12 nút dự án + 1 hàng tiện ích
  assert.equal(kb.inline_keyboard.length, 13);
});

test("buildListKeyboard: >15 mục trang đầu → có 'Xem thêm', không 'Quay lại'", () => {
  const kb = buildListKeyboard("project", mkItems(20), 0);
  const flat = kb.inline_keyboard.flat().map((b) => b.text);
  assert.equal(flat.includes("▶️ Xem thêm"), true);
  assert.equal(flat.includes("◀️ Quay lại"), false);
  // 15 nút + hàng nav + hàng tiện ích
  assert.equal(kb.inline_keyboard.length, 17);
});

test("buildListKeyboard: trang 2 → có cả 'Quay lại'; callback_data mang slug", () => {
  const kb = buildListKeyboard("project", mkItems(20), 15);
  const flat = kb.inline_keyboard.flat();
  const texts = flat.map((b) => b.text);
  assert.equal(texts.includes("◀️ Quay lại"), true);
  assert.equal(texts.includes("▶️ Xem thêm"), false);
  const pick = flat.find((b) => b.callback_data?.startsWith("wz_pick:"));
  assert.equal(pick.callback_data, "wz_pick:project:du-an-16");
});

test("callback_data luôn <= 64 byte (giới hạn Telegram)", () => {
  const kb = buildListKeyboard("project", mkItems(20), 0);
  for (const b of kb.inline_keyboard.flat())
    assert.ok(Buffer.byteLength(b.callback_data) <= 64, `dài quá: ${b.callback_data}`);
});

test("buildFieldKeyboard: 1 nút / field + nhãn tiếng Việt", () => {
  const kb = buildFieldKeyboard(cfg, "project", "blanca-city-vung-tau");
  const texts = kb.inline_keyboard.flat().map((b) => b.text);
  assert.equal(texts.includes("Giá"), true);
  assert.equal(texts.includes("Vị trí"), true);
  const fieldBtn = kb.inline_keyboard.flat().find((b) => b.callback_data?.startsWith("wz_field:"));
  assert.equal(fieldBtn.callback_data.startsWith("wz_field:project:blanca-city-vung-tau:"), true);
});

test("buildFieldKeyboard cho post dùng editable_fields của post", () => {
  const kb = buildFieldKeyboard(cfg, "post", "bai-viet-mau");
  const texts = kb.inline_keyboard.flat().map((b) => b.text);
  assert.equal(texts.includes("Chuyên mục"), true); // category
  assert.equal(texts.includes("Giá"), false);       // không có priceRange ở post
});
