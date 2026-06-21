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

test("Giá trị có dấu gạch ngang và chữ số", () => {
  const r = parseCommand("[SỬA DỰ ÁN]\nSlug: abc\nTrường: priceRange\nGiá trị: Từ 2.1 tỷ — 5 tỷ");
  assert.equal(r.value, "Từ 2.1 tỷ — 5 tỷ");
});
