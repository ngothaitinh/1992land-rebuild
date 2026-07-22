import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkPassword, createSession, verifySession, destroySession,
  parseCookies, sessionCookieHeader,
} from "./auth.mjs";

test("checkPassword đúng/sai", () => {
  process.env.DASHBOARD_PASSWORD = "matkhau-test-123";
  assert.equal(checkPassword("matkhau-test-123"), true);
  assert.equal(checkPassword("sai"), false);
  assert.equal(checkPassword(""), false);
  assert.equal(checkPassword(undefined), false);
});

test("createSession → verifySession true, token lạ → false", () => {
  const token = createSession();
  assert.equal(typeof token, "string");
  assert.ok(token.length >= 16);
  assert.equal(verifySession(token), true);
  assert.equal(verifySession("token-khong-ton-tai"), false);
  assert.equal(verifySession(null), false);
  assert.equal(verifySession(undefined), false);
});

test("destroySession → verifySession false sau đó", () => {
  const token = createSession();
  assert.equal(verifySession(token), true);
  destroySession(token);
  assert.equal(verifySession(token), false);
});

test("parseCookies tách đúng nhiều cookie", () => {
  const cookies = parseCookies("dash_session=abc123; other=xyz");
  assert.equal(cookies.dash_session, "abc123");
  assert.equal(cookies.other, "xyz");
  assert.deepEqual(parseCookies(undefined), {});
  assert.deepEqual(parseCookies(""), {});
});

test("sessionCookieHeader tạo Set-Cookie hợp lệ, clear=true xoá cookie", () => {
  const set = sessionCookieHeader("tok123", {});
  assert.match(set, /^dash_session=tok123/);
  assert.match(set, /HttpOnly/);
  assert.match(set, /SameSite=None/);
  assert.match(set, /Secure/);
  const cleared = sessionCookieHeader("", { clear: true });
  assert.match(cleared, /Max-Age=0/);
});
