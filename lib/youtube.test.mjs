import { test } from "node:test";
import assert from "node:assert/strict";
import { youtubeId } from "./youtube.mjs";

test("watch?v= — có query phụ vẫn lấy đúng id", () => {
  assert.equal(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s"), "dQw4w9WgXcQ");
});
test("youtu.be rút gọn", () => {
  assert.equal(youtubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});
test("embed", () => {
  assert.equal(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});
test("shorts", () => {
  assert.equal(youtubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});
test("id trần 11 ký tự", () => {
  assert.equal(youtubeId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});
test("watch?v= không có www", () => {
  assert.equal(youtubeId("https://youtube.com/watch?v=abc-DEF_123"), "abc-DEF_123");
});
test("chuỗi rỗng → null", () => {
  assert.equal(youtubeId(""), null);
});
test("URL không phải youtube → null", () => {
  assert.equal(youtubeId("https://vimeo.com/12345"), null);
});
test("null/undefined an toàn → null", () => {
  assert.equal(youtubeId(undefined), null);
  assert.equal(youtubeId(null), null);
});
