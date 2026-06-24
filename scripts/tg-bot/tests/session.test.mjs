import { test } from "node:test";
import assert from "node:assert/strict";
import { setMode, getMode, setDraft, getDraft, clearSession } from "../engine/session.mjs";

test("setMode/getMode", () => {
  setMode(1, "await_post");
  assert.equal(getMode(1), "await_post");
});

test("setDraft/getDraft giữ nguyên object", () => {
  setDraft(2, { type: "post", slug: "x", obj: { title: "T" } });
  assert.equal(getDraft(2).slug, "x");
  assert.equal(getDraft(2).obj.title, "T");
});

test("clearSession xóa cả mode lẫn draft", () => {
  setMode(3, "await_project");
  setDraft(3, { type: "project" });
  clearSession(3);
  assert.equal(getMode(3), null);
  assert.equal(getDraft(3), null);
});

test("chat khác nhau độc lập", () => {
  setMode(4, "await_post");
  assert.equal(getMode(5), null);
});
