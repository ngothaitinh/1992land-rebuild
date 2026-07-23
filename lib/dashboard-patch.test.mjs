// lib/dashboard-patch.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPatch, extractInlineImages } from "./dashboard-patch.mjs";

const base = {
  slug: "abc", id: "1", title: "Cũ", priceRange: "5-7 tỷ",
  descriptions: { "tong-quan": "Mô tả cũ.", "gia-ban": "Giá cũ." },
  hidden_sections: ["mat-bang"],
  amenities_images: ["/images/projects/abc/a.jpg"],
};

test("không đổi gì -> null", () => {
  const draft = JSON.parse(JSON.stringify(base));
  assert.equal(buildPatch(base, draft, []), null);
});

test("đổi field thường -> fields chỉ chứa field đó", () => {
  const draft = { ...base, title: "Mới" };
  const patch = buildPatch(base, draft, []);
  assert.deepEqual(patch.fields, { title: "Mới" });
  assert.equal(patch.descriptions, undefined);
});

test("đổi description -> chỉ key đổi nằm trong descriptions", () => {
  const draft = { ...base, descriptions: { ...base.descriptions, "tong-quan": "Mô tả mới." } };
  const patch = buildPatch(base, draft, []);
  assert.deepEqual(patch.descriptions, { "tong-quan": "Mô tả mới." });
  assert.equal(patch.fields, undefined);
});

test("xoá description có sẵn -> gửi chuỗi rỗng", () => {
  const draft = { ...base, descriptions: { "gia-ban": "Giá cũ." } }; // tong-quan removed
  const patch = buildPatch(base, draft, []);
  assert.deepEqual(patch.descriptions, { "tong-quan": "" });
});

test("thêm description mới (key chưa từng có) -> gửi nguyên văn", () => {
  const draft = { ...base, descriptions: { ...base.descriptions, "phap-ly": "Nội dung mới." } };
  const patch = buildPatch(base, draft, []);
  assert.deepEqual(patch.descriptions, { "phap-ly": "Nội dung mới." });
});

test("đổi hidden_sections -> hiddenSections trong patch", () => {
  const draft = { ...base, hidden_sections: ["mat-bang", "chinh-sach"] };
  const patch = buildPatch(base, draft, []);
  assert.deepEqual(patch.hiddenSections, ["mat-bang", "chinh-sach"]);
});

test("hidden_sections rỗng vẫn được gửi (khác original) - server cần phân biệt undefined vs [])", () => {
  const draft = { ...base, hidden_sections: [] };
  const patch = buildPatch(base, draft, []);
  assert.deepEqual(patch.hiddenSections, []);
});

test("có pendingImages -> images trong patch, field/list giữ nguyên từ pending", () => {
  const pending = [{ field: "hero_image", filename: "hero-123.jpg", base64: "AAAA", list: false }];
  const patch = buildPatch(base, base, pending);
  assert.deepEqual(patch.images, [{ kind: "field", field: "hero_image", filename: "hero-123.jpg", base64: "AAAA", list: false }]);
});

test("nhiều thay đổi cùng lúc -> patch gộp đủ", () => {
  const draft = {
    ...base,
    title: "Mới",
    descriptions: { ...base.descriptions, "tong-quan": "Đã sửa." },
    hidden_sections: [],
  };
  const pending = [{ field: "amenities_images", filename: "am-1.jpg", base64: "BBBB", list: true }];
  const patch = buildPatch(base, draft, pending);
  assert.deepEqual(patch.fields, { title: "Mới" });
  assert.deepEqual(patch.descriptions, { "tong-quan": "Đã sửa." });
  assert.deepEqual(patch.hiddenSections, []);
  assert.deepEqual(patch.images, [{ kind: "field", field: "amenities_images", filename: "am-1.jpg", base64: "BBBB", list: true }]);
});

test("extractInlineImages: không có ảnh data-URL -> descriptions giữ nguyên, images rỗng", () => {
  const descriptions = { "tong-quan": "Mô tả không có ảnh.", "gia-ban": "![existing](/images/projects/foo/inline-1.jpg)" };
  const result = extractInlineImages(descriptions, "foo");
  assert.deepEqual(result.descriptions, descriptions);
  assert.deepEqual(result.images, []);
});

test("extractInlineImages: 1 ảnh inline -> tạo filename, trích base64, viết lại markdown", () => {
  const descriptions = { "tong-quan": "Text ![alt text](data:image/png;base64,QUJDRA==) sau ảnh." };
  const result = extractInlineImages(descriptions, "foo");
  assert.equal(result.images.length, 1);
  const img = result.images[0];
  assert.equal(img.base64, "QUJDRA==");
  assert.match(img.filename, /^inline-\d+-1\.png$/);
  assert.equal(result.descriptions["tong-quan"], `Text ![alt text](/images/projects/foo/${img.filename}) sau ảnh.`);
});

test("extractInlineImages: nhiều ảnh nhiều key -> filename không trùng nhau", () => {
  const descriptions = {
    "tong-quan": "![a](data:image/jpeg;base64,AAAA) và ![b](data:image/jpeg;base64,BBBB)",
    "vi-tri": "![c](data:image/webp;base64,CCCC)",
  };
  const result = extractInlineImages(descriptions, "foo");
  assert.equal(result.images.length, 3);
  const filenames = result.images.map((i) => i.filename);
  assert.equal(new Set(filenames).size, 3);
  assert.match(filenames[0], /inline-\d+-1\.jpg$/);
  assert.match(filenames[1], /inline-\d+-2\.jpg$/);
  assert.match(filenames[2], /inline-\d+-3\.webp$/);
});

test("extractInlineImages: ảnh đã lưu (path thường, không phải data:) -> không đụng tới", () => {
  const descriptions = { "tong-quan": "![x](/images/projects/foo/inline-1.jpg)" };
  const result = extractInlineImages(descriptions, "foo");
  assert.equal(result.descriptions["tong-quan"], descriptions["tong-quan"]);
  assert.equal(result.images.length, 0);
});
