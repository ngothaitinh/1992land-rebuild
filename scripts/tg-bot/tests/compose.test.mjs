import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, toPostMarkdown, toProjectJson, validateComposed } from "../engine/compose.mjs";

test("slugify bỏ dấu + kebab", () => {
  assert.equal(slugify("Dự Án The Quậy Complex!"), "du-an-the-quay-complex");
});

test("slugify gộp khoảng trắng & ký tự lạ", () => {
  assert.equal(slugify("  Giá  tốt — 2026  "), "gia-tot-2026");
});

test("toPostMarkdown sinh frontmatter đúng", () => {
  const md = toPostMarkdown(
    { title: 'Tựa "kép"', excerpt: "Mô tả", category: "Đầu tư", readTime: "5 phút đọc", body_markdown: "## H\n\nNội dung", related_projects: ["a-b"] },
    { slug: "tua-kep", date: "2026-06-24", heroImage: "/images/news/tua-kep.jpg" }
  );
  assert.match(md, /^---\n/);
  assert.match(md, /slug: tua-kep/);
  assert.match(md, /title: "Tựa 'kép'"/);          // quote kép trong title được đổi thành nháy đơn
  assert.match(md, /date: 2026-06-24/);
  assert.match(md, /hero_image: "\/images\/news\/tua-kep.jpg"/);
  assert.match(md, /related_projects: "a-b"/);
  assert.match(md, /\n---\n\n## H\n\nNội dung\n$/);  // body sau frontmatter
});

test("toPostMarkdown bỏ qua related_projects rỗng", () => {
  const md = toPostMarkdown(
    { title: "T", excerpt: "E", category: "C", readTime: "3 phút đọc", body_markdown: "B", related_projects: [] },
    { slug: "t", date: "2026-06-24", heroImage: "" }
  );
  assert.doesNotMatch(md, /related_projects/);
  assert.doesNotMatch(md, /hero_image/);            // heroImage rỗng → bỏ
});

test("toProjectJson gắn slug/hero/timestamps, parse lại được", () => {
  const s = toProjectJson(
    { title: "Dự án X", location: "Q1", excerpt: "E", descriptions: { "tong-quan": "..." }, _review_fields: ["priceRange"] },
    { slug: "du-an-x", heroImage: "/images/projects/du-an-x/hero.jpg", now: "2026-06-24T00:00:00Z" }
  );
  const o = JSON.parse(s);
  assert.equal(o.slug, "du-an-x");
  assert.equal(o.hero_image, "/images/projects/du-an-x/hero.jpg");
  assert.equal(o.created_at, "2026-06-24T00:00:00Z");
  assert.equal(o.updated_at, "2026-06-24T00:00:00Z");
  assert.ok(!("_review_fields" in o));              // field nội bộ bị loại khỏi file
  assert.ok(s.endsWith("\n"));
});

test("validateComposed: post thiếu title", () => {
  assert.deepEqual(validateComposed("post", { body_markdown: "x" }), { ok: false, missing: ["title"] });
});

test("validateComposed: post đủ", () => {
  assert.deepEqual(validateComposed("post", { title: "T", body_markdown: "x" }), { ok: true, missing: [] });
});

test("validateComposed: project thiếu location", () => {
  assert.deepEqual(validateComposed("project", { title: "T" }), { ok: false, missing: ["location"] });
});
