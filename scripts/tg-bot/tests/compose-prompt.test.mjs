import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt } from "../engine/compose.mjs";

const ctx = { today: "2026-06-24", existingSlugs: ["ansana-by-kita"], existingCategories: ["Đầu tư"] };

test("prompt post chứa ràng buộc chống bịa", () => {
  const p = buildSystemPrompt("post", ctx);
  assert.match(p, /KHÔNG bịa/i);
  assert.match(p, /_review_fields/);
  assert.match(p, /body_markdown/);          // nêu schema post
});

test("prompt post cấm caps-lock / tone sales", () => {
  const p = buildSystemPrompt("post", ctx);
  assert.match(p, /CỰC KỲ|tone sales|caps/i);
});

test("prompt project nêu trường nhạy cảm + danh sách slug có thật", () => {
  const p = buildSystemPrompt("project", ctx);
  assert.match(p, /legal_status/);
  assert.match(p, /ansana-by-kita/);         // slug có thật để chống bịa liên kết
  assert.match(p, /descriptions/);
});

test("prompt nhúng ngày hôm nay", () => {
  assert.match(buildSystemPrompt("post", ctx), /2026-06-24/);
});
