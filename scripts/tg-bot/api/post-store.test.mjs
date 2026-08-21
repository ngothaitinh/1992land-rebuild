import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPost, savePost, undoLastPostSave } from "./post-store.mjs";

const SAMPLE_RAW = [
  "---",
  "slug: bai-mau",
  'title: "Tiêu đề gốc"',
  "date: 2026-05-15",
  "category: Đầu tư",
  "---",
  "",
  "Nội dung gốc.",
].join("\n") + "\n";

function fakeDeps({ putFilesCalls = [] } = {}) {
  return {
    repo: "owner/repo",
    branch: "main",
    pat: "fake-pat",
    getFile: async () => ({ content: SAMPLE_RAW, sha: "abc123" }),
    putFiles: async (repo, branch, files, message) => {
      putFilesCalls.push({ files, message });
      return { commitSha: "deadbeef" };
    },
  };
}

test("loadPost trả về meta + body đã parse", async () => {
  const post = await loadPost(fakeDeps(), "bai-mau");
  assert.equal(post.meta.title, "Tiêu đề gốc");
  assert.equal(post.body, "Nội dung gốc.");
});

test("loadPost — slug không hợp lệ ném lỗi VALIDATION", async () => {
  await assert.rejects(() => loadPost(fakeDeps(), "../etc/passwd"), (err) => err.code === "VALIDATION");
});

test("savePost — sửa field và body, gọi putFiles đúng 1 lần với nội dung đã merge", async () => {
  const calls = [];
  const deps = fakeDeps({ putFilesCalls: calls });
  const result = await savePost(deps, "bai-mau", {
    fields: { title: "Tiêu đề mới" },
    body: "Nội dung mới.",
  });
  assert.equal(calls.length, 1, "phải đúng 1 lần putFiles — một lần Lưu = một commit");
  assert.equal(calls[0].files.length, 1);
  assert.equal(calls[0].files[0].path, "data/posts/bai-mau.md");
  const savedRaw = calls[0].files[0].content;
  assert.ok(savedRaw.includes('title: "Tiêu đề mới"'));
  assert.ok(savedRaw.includes("Nội dung mới."));
  assert.ok(!savedRaw.includes("Tiêu đề gốc"));
  assert.equal(result.commitSha, "deadbeef");
  assert.equal(typeof result.undoKey, "string");
});

test("savePost — không được sửa slug", async () => {
  await assert.rejects(
    () => savePost(fakeDeps(), "bai-mau", { fields: { slug: "slug-khac" } }),
    (err) => err.code === "VALIDATION"
  );
});

test("savePost — không gửi field/body nào thì giữ nguyên nội dung cũ", async () => {
  const calls = [];
  const result = await savePost(fakeDeps({ putFilesCalls: calls }), "bai-mau", {});
  assert.ok(calls[0].files[0].content.includes("Tiêu đề gốc"));
  assert.ok(calls[0].files[0].content.includes("Nội dung gốc."));
});

test("undoLastPostSave — khôi phục đúng nội dung trước khi lưu", async () => {
  const calls = [];
  const deps = fakeDeps({ putFilesCalls: calls });
  const { undoKey } = await savePost(deps, "bai-mau", { fields: { title: "Mới" } });
  const undoResult = await undoLastPostSave(deps, undoKey);
  assert.equal(undoResult.commitSha, "deadbeef");
  assert.equal(calls.length, 2, "save + undo = 2 lần gọi putFiles, mỗi lần vẫn đúng 1 commit");
  assert.ok(calls[1].files[0].content.includes(SAMPLE_RAW.trim()) || calls[1].files[0].content === SAMPLE_RAW);
});
