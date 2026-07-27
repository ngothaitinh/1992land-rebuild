// API HTTP nhỏ cho /dashboard — bọc quanh project-store.mjs (dùng chung lõi
// github-commit.mjs/undo.mjs với bot Telegram). Chạy trên VPS qua PM2, đứng
// sau Caddy (xem docs/superpowers/plans/2026-07-22-dashboard-vps-api.md Task 4).
import http from "node:http";
import cfg from "../adapters/1992land/config.mjs";
import {
  checkPassword, createSession, verifySession, destroySession,
  parseCookies, sessionCookieHeader, SESSION_COOKIE_NAME,
} from "./auth.mjs";
import { loadProject, saveProject, undoLastSave } from "./project-store.mjs";

const PORT = Number(process.env.DASHBOARD_API_PORT || 4001);
const ALLOWED_ORIGIN = process.env.DASHBOARD_ALLOWED_ORIGIN || "https://1992land.com";
const deps = { repo: cfg.repo, pat: process.env.GITHUB_PAT, branch: cfg.deploy_branch };

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramLead(lead) {
  const lines = [
    "📩 <b>Lead mới từ form 1992land.com</b>",
    `👤 Họ tên: ${lead.ho_ten}`,
    `📞 SĐT: ${lead.so_dien_thoai}`,
    lead.email ? `✉️ Email: ${lead.email}` : null,
    lead.du_an_quan_tam ? `🏢 Dự án quan tâm: ${lead.du_an_quan_tam}` : null,
    lead.loi_nhan ? `💬 Lời nhắn: ${lead.loi_nhan}` : null,
    lead.subject ? `📌 Nguồn: ${lead.subject}` : null,
    lead.source_url ? `🔗 ${lead.source_url}` : null,
  ].filter(Boolean);

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: lines.join("\n"), parse_mode: "HTML" }),
  });
  const j = await res.json();
  if (!j.ok) throw new Error(j.description || "Telegram API error");
}

function json(res, status, body, extraHeaders = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...extraHeaders });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  return JSON.parse(raw);
}

function requireSession(req) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE_NAME];
  return verifySession(token) ? token : null;
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split("/").filter(Boolean);

  try {
    if (req.method === "POST" && parts[0] === "login") {
      const { password } = await readJsonBody(req);
      if (!checkPassword(password)) return json(res, 401, { error: "Sai mật khẩu" });
      const token = createSession();
      return json(res, 200, { ok: true }, { "Set-Cookie": sessionCookieHeader(token) });
    }

    if (req.method === "POST" && parts[0] === "logout") {
      const token = parseCookies(req.headers.cookie)[SESSION_COOKIE_NAME];
      if (token) destroySession(token);
      return json(res, 200, { ok: true }, { "Set-Cookie": sessionCookieHeader("", { clear: true }) });
    }

    if (req.method === "POST" && parts[0] === "contact-lead") {
      const body = await readJsonBody(req);
      const ho_ten = String(body.ho_ten || "").trim();
      const so_dien_thoai = String(body.so_dien_thoai || "").trim();
      if (!ho_ten || !so_dien_thoai) return json(res, 400, { error: "Thiếu họ tên hoặc số điện thoại" });
      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return json(res, 500, { error: "Thiếu cấu hình Telegram" });
      try {
        await sendTelegramLead({
          ho_ten, so_dien_thoai,
          email: String(body.email || "").trim(),
          du_an_quan_tam: String(body.du_an_quan_tam || "").trim(),
          loi_nhan: String(body.loi_nhan || "").trim(),
          subject: String(body.subject || "").trim(),
          source_url: String(body.source_url || "").trim(),
        });
        return json(res, 200, { ok: true });
      } catch (e) {
        return json(res, 502, { error: e.message });
      }
    }

    if (!requireSession(req)) return json(res, 401, { error: "Chưa đăng nhập" });

    if (req.method === "GET" && parts[0] === "projects" && parts.length === 2) {
      const slug = parts[1];
      try {
        const project = await loadProject(deps, slug);
        return json(res, 200, { project });
      } catch {
        return json(res, 404, { error: `Không tìm thấy: ${slug}` });
      }
    }

    if (req.method === "POST" && parts[0] === "projects" && parts.length === 3 && parts[2] === "save") {
      const slug = parts[1];
      const patch = await readJsonBody(req);
      try {
        const result = await saveProject(deps, slug, patch);
        return json(res, 200, result);
      } catch (e) {
        const status = e.code === "VALIDATION" ? 400 : 502;
        return json(res, status, { error: e.message });
      }
    }

    if (req.method === "POST" && parts[0] === "undo") {
      const { undoKey } = await readJsonBody(req);
      try {
        const result = await undoLastSave(deps, undoKey);
        return json(res, 200, result);
      } catch (e) {
        return json(res, 410, { error: "Hết hạn hoặc đã hoàn tác" });
      }
    }

    return json(res, 404, { error: "Không có route này" });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => console.log(`dashboard-api nghe cổng ${PORT}`));

if (!process.env.DASHBOARD_PASSWORD) {
  console.warn("⚠️  Thiếu biến môi trường DASHBOARD_PASSWORD — /login sẽ luôn trả 401.");
}
if (!process.env.GITHUB_PAT) {
  console.warn("⚠️  Thiếu biến môi trường GITHUB_PAT — mọi thao tác lưu/tải dự án sẽ lỗi 502.");
}
