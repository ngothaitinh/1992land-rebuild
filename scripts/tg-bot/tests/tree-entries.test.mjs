import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTreeEntries } from "../engine/github-commit.mjs";

test("text file → entry có content", () => {
  const e = buildTreeEntries([{ path: "a.md", content: "hello" }], []);
  assert.deepEqual(e, [{ path: "a.md", mode: "100644", type: "blob", content: "hello" }]);
});

test("binary blob → entry có sha", () => {
  const e = buildTreeEntries([], [{ path: "img.jpg", sha: "abc123" }]);
  assert.deepEqual(e, [{ path: "img.jpg", mode: "100644", type: "blob", sha: "abc123" }]);
});

test("gộp text + binary", () => {
  const e = buildTreeEntries([{ path: "a.md", content: "x" }], [{ path: "b.jpg", sha: "s1" }]);
  assert.equal(e.length, 2);
  assert.equal(e[0].content, "x");
  assert.equal(e[1].sha, "s1");
});

test("removal → entry có sha null (Git Trees API xoá file)", () => {
  const e = buildTreeEntries([], [], [{ path: "data/posts/x.md" }]);
  assert.deepEqual(e, [{ path: "data/posts/x.md", mode: "100644", type: "blob", sha: null }]);
});

test("hoàn tác bài vừa đăng: xoá cả file nội dung lẫn ảnh trong 1 tree", () => {
  const e = buildTreeEntries([], [], [
    { path: "data/posts/x.md" },
    { path: "public/images/news/x.jpg" },
  ]);
  assert.equal(e.length, 2);
  assert.ok(e.every((x) => x.sha === null));
});

test("removals mặc định rỗng — không phá lời gọi cũ", () => {
  const e = buildTreeEntries([{ path: "a.md", content: "x" }], []);
  assert.equal(e.length, 1);
});
