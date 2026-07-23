// Đăng nhập mật khẩu chung + session cookie cho /dashboard. Không OAuth, không
// tài khoản riêng — chỉ anh Thọ + Jimmy dùng chung 1 mật khẩu (xem spec §Đăng nhập).
import crypto from "node:crypto";

const TTL_MS = 12 * 60 * 60_000; // 12 giờ
const sessions = new Map(); // token -> expiresAt
const COOKIE_NAME = "dash_session";

export function checkPassword(input) {
  const expected = process.env.DASHBOARD_PASSWORD || "";
  if (!expected || !input) return false;
  const a = Buffer.from(String(input));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSession() {
  const token = crypto.randomBytes(24).toString("base64url");
  sessions.set(token, Date.now() + TTL_MS);
  return token;
}

export function verifySession(token) {
  if (!token) return false;
  const exp = sessions.get(token);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(token); return false; }
  return true;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = v;
  }
  return out;
}

// SameSite=Lax + Secure: dashboard (1992land.com) gọi api.1992land.com là
// cross-ORIGIN nhưng cùng SITE (cùng eTLD+1 1992land.com) — SameSite khoá theo
// site, không theo origin, nên cookie Lax vẫn được đính kèm ở các fetch same-site
// này. Dùng None sẽ đính kèm session cookie cho request từ BẤT KỲ site nào (kể cả
// site lạ), mở đường CSRF mù (POST /projects/:slug/save, /undo bằng simple
// request text/plain kèm credentials:'include', bỏ qua preflight CORS nhưng vẫn
// gửi cookie của nạn nhân đã đăng nhập). Chỉ cần None nếu dashboard được host ở
// một domain đăng ký khác thật sự (vd domain xem trước *.vercel.app) — hiện không
// phải trường hợp này.
export function sessionCookieHeader(token, { clear = false } = {}) {
  const base = `${COOKIE_NAME}=${clear ? "" : token}; Path=/; HttpOnly; Secure; SameSite=Lax`;
  return clear ? `${base}; Max-Age=0` : `${base}; Max-Age=${Math.floor(TTL_MS / 1000)}`;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
