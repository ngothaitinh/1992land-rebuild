// lib/markdown-html.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { markdownToHtml, htmlToMarkdown } from "./markdown-html.mjs";

test("markdownToHtml — đoạn văn thường + đậm/nghiêng/link", () => {
  const md = "Xem **giá tốt** tại _khu trung tâm_ và [liên hệ](https://zalo.me/0909474123) ngay.\n\nĐoạn hai.";
  const html = markdownToHtml(md);
  assert.match(html, /<p>Xem <strong>giá tốt<\/strong> tại <em>khu trung tâm<\/em> và <a href="https:\/\/zalo\.me\/0909474123">liên hệ<\/a> ngay\.<\/p>/);
  assert.match(html, /<p>Đoạn hai\.<\/p>/);
});

test("markdownToHtml — heading, list, ảnh", () => {
  const md = "## Tiêu đề\n\n- Mục 1\n- Mục 2\n\n1. Bước 1\n2. Bước 2\n\n![Ảnh](/images/x.jpg)";
  const html = markdownToHtml(md);
  assert.match(html, /<h2>Tiêu đề<\/h2>/);
  assert.match(html, /<ul><li>Mục 1<\/li><li>Mục 2<\/li><\/ul>/);
  assert.match(html, /<ol><li>Bước 1<\/li><li>Bước 2<\/li><\/ol>/);
  assert.match(html, /<img src="\/images\/x\.jpg" alt="Ảnh">/);
});

test("markdownToHtml — rỗng/null → chuỗi rỗng", () => {
  assert.equal(markdownToHtml(""), "");
  assert.equal(markdownToHtml(null), "");
  assert.equal(markdownToHtml(undefined), "");
});

test("htmlToMarkdown — đoạn văn + đậm/nghiêng/link, join bằng dòng trống", () => {
  const html = '<p>Xem <strong>giá tốt</strong> tại <em>khu trung tâm</em> và <a href="https://zalo.me/0909474123">liên hệ</a> ngay.</p><p>Đoạn hai.</p>';
  const md = htmlToMarkdown(html);
  assert.equal(
    md,
    "Xem **giá tốt** tại _khu trung tâm_ và [liên hệ](https://zalo.me/0909474123) ngay.\n\nĐoạn hai."
  );
});

test("htmlToMarkdown — heading + list (kể cả <li><p>...</p></li> Tiptap hay dùng)", () => {
  const html = "<h2>Tiêu đề</h2><ul><li><p>Mục 1</p></li><li><p>Mục 2</p></li></ul><ol><li><p>Bước 1</p></li></ol>";
  const md = htmlToMarkdown(html);
  assert.equal(md, "## Tiêu đề\n\n- Mục 1\n- Mục 2\n\n1. Bước 1");
});

test("htmlToMarkdown — ảnh inline", () => {
  const html = '<p>Trước.</p><img src="/images/x.jpg" alt="Ảnh"><p>Sau.</p>';
  const md = htmlToMarkdown(html);
  assert.equal(md, "Trước.\n\n![Ảnh](/images/x.jpg)\n\nSau.");
});

test("htmlToMarkdown — roundtrip qua markdownToHtml không đổi ý nghĩa (đa khối)", () => {
  const original = "## Tiêu đề\n\nĐoạn có **đậm** và _nghiêng_.\n\n- A\n- B";
  const roundtripped = htmlToMarkdown(markdownToHtml(original));
  assert.equal(roundtripped, original);
});

test("htmlToMarkdown — rỗng → chuỗi rỗng", () => {
  assert.equal(htmlToMarkdown(""), "");
  assert.equal(htmlToMarkdown("<p></p>"), "");
});
