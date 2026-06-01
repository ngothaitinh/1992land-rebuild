// scripts/tg-poll-decision.mjs
// Lắng nghe quyết định của anh Thọ (nút Duyệt / Sửa / Hủy) qua callback_query.
// Dùng long-poll getUpdates tới khi nhận được quyết định hoặc hết thời gian chờ.
//
//   node scripts/tg-poll-decision.mjs [timeoutGiây]   (mặc định 120s)
//
// In ra: DECISION=approve | edit | cancel | timeout
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OFFSET_FILE = path.join(__dirname, ".tg-offset.json");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const maxSeconds = Number(process.argv[2] || 120);

if (!TOKEN) {
  console.error("Thiếu TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

function api(method, params = {}) {
  const body = JSON.stringify(params);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${TOKEN}/${method}`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            const j = JSON.parse(d);
            j.ok ? resolve(j.result) : reject(new Error(j.description));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function readOffset() {
  try {
    return JSON.parse(fs.readFileSync(OFFSET_FILE, "utf8")).offset || 0;
  } catch {
    return 0;
  }
}
function writeOffset(o) {
  let cur = {};
  try {
    cur = JSON.parse(fs.readFileSync(OFFSET_FILE, "utf8"));
  } catch {}
  cur.offset = o;
  fs.writeFileSync(OFFSET_FILE, JSON.stringify(cur, null, 2));
}

async function main() {
  const deadline = Date.now() + maxSeconds * 1000;

  while (Date.now() < deadline) {
    const remaining = Math.max(1, Math.min(30, Math.round((deadline - Date.now()) / 1000)));
    const updates = await api("getUpdates", {
      offset: readOffset(),
      timeout: remaining,
      allowed_updates: ["callback_query"],
    });

    for (const u of updates) {
      writeOffset(u.update_id + 1);
      const cq = u.callback_query;
      if (!cq) continue;
      if (CHAT_ID && String(cq.message?.chat?.id) !== String(CHAT_ID)) continue;

      const decision = cq.data; // approve | edit | cancel
      const labels = { approve: "✅ Đã duyệt — đang đăng", edit: "✏️ Chờ chỉnh sửa", cancel: "❌ Đã hủy" };
      await api("answerCallbackQuery", { callback_query_id: cq.id, text: labels[decision] || "Đã nhận" });

      console.log(`DECISION=${decision}`);
      return;
    }
  }

  console.log("DECISION=timeout");
}

main().catch((e) => {
  console.error("Lỗi:", e.message);
  process.exit(1);
});
