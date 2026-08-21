// lib/dashboard-api.test.mjs
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import {
  dashboardLogin, dashboardLogout, getDashboardProject,
  saveDashboardProject, undoDashboardSave,
  checkDashboardSession, getDashboardPost, saveDashboardPost,
} from "./dashboard-api.mjs";

function fakeFetch(status, body) {
  return mock.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
}

test("dashboardLogin — thành công không throw, gọi đúng URL/method/body", async (t) => {
  const fetchMock = fakeFetch(200, { ok: true });
  t.mock.method(globalThis, "fetch", fetchMock);
  await dashboardLogin("https://api.example.com", "matkhau123");
  assert.equal(fetchMock.mock.calls.length, 1);
  const [url, opts] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, "https://api.example.com/login");
  assert.equal(opts.method, "POST");
  assert.equal(opts.credentials, "include");
  assert.deepEqual(JSON.parse(opts.body), { password: "matkhau123" });
});

test("dashboardLogin — sai mật khẩu (401) throw đúng message", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(401, { error: "Sai mật khẩu" }));
  await assert.rejects(
    () => dashboardLogin("https://api.example.com", "sai"),
    /Sai mật khẩu/
  );
});

test("dashboardLogout — gọi POST /logout với credentials include", async (t) => {
  const fetchMock = fakeFetch(200, { ok: true });
  t.mock.method(globalThis, "fetch", fetchMock);
  await dashboardLogout("https://api.example.com");
  const [url, opts] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, "https://api.example.com/logout");
  assert.equal(opts.credentials, "include");
});

test("getDashboardProject — 200 trả về project", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(200, { project: { slug: "abc", title: "ABC" } }));
  const result = await getDashboardProject("https://api.example.com", "abc");
  assert.equal(result.project.slug, "abc");
});

test("getDashboardProject — 401 throw 'unauthorized'", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(401, { error: "Chưa đăng nhập" }));
  await assert.rejects(
    () => getDashboardProject("https://api.example.com", "abc"),
    /unauthorized/
  );
});

test("getDashboardProject — 404 throw 'not_found'", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(404, { error: "Không tìm thấy: abc" }));
  await assert.rejects(
    () => getDashboardProject("https://api.example.com", "abc"),
    /not_found/
  );
});

test("saveDashboardProject — gửi đúng patch, trả commitSha+undoKey", async (t) => {
  const fetchMock = fakeFetch(200, { commitSha: "deadbeef", undoKey: "u1" });
  t.mock.method(globalThis, "fetch", fetchMock);
  const patch = { fields: { title: "Mới" } };
  const result = await saveDashboardProject("https://api.example.com", "abc", patch);
  assert.equal(result.commitSha, "deadbeef");
  assert.equal(result.undoKey, "u1");
  const [url, opts] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, "https://api.example.com/projects/abc/save");
  assert.deepEqual(JSON.parse(opts.body), patch);
});

test("saveDashboardProject — lỗi 400 throw đúng message server trả về", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(400, { error: "Không được sửa slug/id" }));
  await assert.rejects(
    () => saveDashboardProject("https://api.example.com", "abc", {}),
    /Không được sửa slug\/id/
  );
});

test("undoDashboardSave — 200 trả commitSha", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(200, { commitSha: "cafebabe" }));
  const result = await undoDashboardSave("https://api.example.com", "u1");
  assert.equal(result.commitSha, "cafebabe");
});

test("undoDashboardSave — 410 throw 'expired'", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(410, { error: "Hết hạn hoặc đã hoàn tác" }));
  await assert.rejects(
    () => undoDashboardSave("https://api.example.com", "u1"),
    /expired/
  );
});

test("getDashboardPost — 200 trả về post", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(200, { post: { slug: "bai-1", title: "Bài 1" } }));
  const result = await getDashboardPost("https://api.example.com", "bai-1");
  assert.equal(result.post.slug, "bai-1");
});

test("getDashboardPost — 401 throw 'unauthorized'", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(401, { error: "Chưa đăng nhập" }));
  await assert.rejects(
    () => getDashboardPost("https://api.example.com", "bai-1"),
    /unauthorized/
  );
});

test("getDashboardPost — 404 throw 'not_found'", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(404, { error: "Không tìm thấy: bai-1" }));
  await assert.rejects(
    () => getDashboardPost("https://api.example.com", "bai-1"),
    /not_found/
  );
});

test("saveDashboardPost — gửi đúng patch, trả commitSha+undoKey", async (t) => {
  const fetchMock = fakeFetch(200, { commitSha: "abc12345", undoKey: "u2" });
  t.mock.method(globalThis, "fetch", fetchMock);
  const patch = { fields: { title: "Mới" } };
  const result = await saveDashboardPost("https://api.example.com", "bai-1", patch);
  assert.equal(result.commitSha, "abc12345");
  assert.equal(result.undoKey, "u2");
  const [url, opts] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, "https://api.example.com/posts/bai-1/save");
  assert.deepEqual(JSON.parse(opts.body), patch);
});

test("saveDashboardPost — lỗi 400 throw đúng message server trả về", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(400, { error: "Slug không hợp lệ" }));
  await assert.rejects(
    () => saveDashboardPost("https://api.example.com", "bai-1", {}),
    /Slug không hợp lệ/
  );
});

test("checkDashboardSession — /me trả 200 → true", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(200, { user: { id: 1, name: "Admin" } }));
  const result = await checkDashboardSession("https://api.example.com");
  assert.equal(result, true);
});

test("checkDashboardSession — /me trả 401 → false không throw", async (t) => {
  t.mock.method(globalThis, "fetch", fakeFetch(401, { error: "Chưa đăng nhập" }));
  const result = await checkDashboardSession("https://api.example.com");
  assert.equal(result, false);
});
