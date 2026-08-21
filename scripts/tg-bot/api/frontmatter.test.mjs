import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter.mjs";

test("parseFrontmatter tách đúng meta và body", () => {
  const raw = [
    "---",
    "slug: hello-world",
    'title: "Xin chào"',
    "date: 2026-05-15",
    "---",
    "",
    "Nội dung dòng 1.",
    "",
    "## Tiêu đề",
  ].join("\n");
  const { meta, body } = parseFrontmatter(raw);
  assert.equal(meta.slug, "hello-world");
  assert.equal(meta.title, "Xin chào");
  assert.equal(meta.date, "2026-05-15");
  assert.equal(body, "Nội dung dòng 1.\n\n## Tiêu đề");
});

test("parseFrontmatter xử lý CRLF", () => {
  const raw = '---\r\nslug: x\r\ntitle: "Y"\r\n---\r\n\r\nBody CRLF.';
  const { meta, body } = parseFrontmatter(raw);
  assert.equal(meta.slug, "x");
  assert.equal(meta.title, "Y");
  assert.equal(body, "Body CRLF.");
});

test("parseFrontmatter — không có frontmatter thì meta rỗng, body là toàn bộ nội dung", () => {
  const { meta, body } = parseFrontmatter("Chỉ có nội dung, không có ---");
  assert.deepEqual(meta, {});
  assert.equal(body, "Chỉ có nội dung, không có ---");
});

test("serializeFrontmatter sinh đúng định dạng, key có khoảng trắng/dấu ngoặc kép thì bọc quote", () => {
  const out = serializeFrontmatter(
    { slug: "hello-world", title: "Xin chào", date: "2026-05-15", category: "Đầu tư" },
    "Nội dung dòng 1.\n\n## Tiêu đề"
  );
  assert.equal(
    out,
    [
      "---",
      "slug: hello-world",
      'title: "Xin chào"',
      "date: 2026-05-15",
      "category: Đầu tư",
      "---",
      "",
      "Nội dung dòng 1.",
      "",
      "## Tiêu đề",
    ].join("\n") + "\n"
  );
});

test("khứ hồi parse rồi serialize giữ nguyên nội dung", () => {
  const original = [
    "---",
    "slug: dau-tu-bds-bien-vung-tau",
    'title: "Đầu tư BĐS biển Vũng Tàu"',
    "date: 2026-05-15",
    "category: Đầu tư",
    'readTime: "7 phút đọc"',
    'excerpt: "Mô tả ngắn."',
    "---",
    "",
    "Cao tốc Biên Hòa — Vũng Tàu.",
    "",
    "## Tiềm năng",
    "",
    "> Trích dẫn.",
  ].join("\n") + "\n";
  const { meta, body } = parseFrontmatter(original);
  const roundtripped = serializeFrontmatter(meta, body);
  assert.equal(roundtripped, original);
});
