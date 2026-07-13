import { test } from "node:test";
import assert from "node:assert/strict";
import { recordUndo, takeUndo, clearUndo, toCommitFiles } from "../engine/undo.mjs";

test("ghi rồi lấy được đúng bản ghi", () => {
  const key = recordUndo(1, "sửa Giá", [{ path: "a.json", prevContent: "{}" }]);
  const e = takeUndo(1, key);
  assert.equal(e.label, "sửa Giá");
  assert.equal(e.files[0].prevContent, "{}");
});

test("hoàn tác chỉ dùng được một lần", () => {
  const key = recordUndo(2, "xoá", [{ path: "a.md", prevContent: "x" }]);
  assert.ok(takeUndo(2, key));
  assert.equal(takeUndo(2, key), null);
});

test("key sai hoặc chat khác → không lấy được", () => {
  const key = recordUndo(3, "sửa", [{ path: "a.md", prevContent: "x" }]);
  assert.equal(takeUndo(3, "key-bay-ba"), null);
  assert.equal(takeUndo(999, key), null);
});

test("mỗi chat chỉ giữ bản ghi gần nhất", () => {
  const old = recordUndo(4, "cũ", [{ path: "a.md", prevContent: "1" }]);
  const now = recordUndo(4, "mới", [{ path: "a.md", prevContent: "2" }]);
  assert.equal(takeUndo(4, old), null);
  assert.equal(takeUndo(4, now).label, "mới");
});

test("clearUndo xoá bản ghi", () => {
  const key = recordUndo(5, "x", [{ path: "a.md", prevContent: "1" }]);
  clearUndo(5);
  assert.equal(takeUndo(5, key), null);
});

test("toCommitFiles: prevContent null → xoá file (hoàn tác một bài vừa đăng)", () => {
  const files = toCommitFiles({
    label: "đăng",
    files: [
      { path: "data/posts/x.md", prevContent: null },
      { path: "public/images/news/x.jpg", prevContent: null, binary: true },
    ],
  });
  assert.deepEqual(files, [
    { path: "data/posts/x.md", remove: true },
    { path: "public/images/news/x.jpg", remove: true },
  ]);
});

test("toCommitFiles: prevContent có nội dung → ghi lại y nguyên", () => {
  const files = toCommitFiles({ label: "sửa", files: [{ path: "a.json", prevContent: "{\"a\":1}" }] });
  assert.deepEqual(files, [{ path: "a.json", content: "{\"a\":1}", binary: false }]);
});

test("toCommitFiles: chuỗi rỗng vẫn là nội dung, không phải xoá", () => {
  const files = toCommitFiles({ label: "sửa", files: [{ path: "a.md", prevContent: "" }] });
  assert.deepEqual(files, [{ path: "a.md", content: "", binary: false }]);
});
