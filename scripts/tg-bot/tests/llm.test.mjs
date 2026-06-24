import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLLMJson } from "../engine/llm.mjs";

test("parse JSON thuần", () => {
  assert.deepEqual(parseLLMJson('{"a":1}'), { a: 1 });
});

test("strip fence ```json", () => {
  const t = "```json\n{\"a\":2}\n```";
  assert.deepEqual(parseLLMJson(t), { a: 2 });
});

test("strip fence ``` không nhãn", () => {
  const t = "```\n{\"a\":3}\n```";
  assert.deepEqual(parseLLMJson(t), { a: 3 });
});

test("có text thừa quanh JSON → vẫn lấy được object", () => {
  const t = 'Đây là kết quả: {"a":4} xong.';
  assert.deepEqual(parseLLMJson(t), { a: 4 });
});

test("JSON hỏng → throw", () => {
  assert.throws(() => parseLLMJson("không phải json"), /JSON/);
});
