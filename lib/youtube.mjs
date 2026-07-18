// Trích YouTube video id (11 ký tự) từ nhiều dạng URL, hoặc null nếu không hợp lệ.
// Dùng chung cho web (components/VideoEmbed) và bot Telegram (Slice 2).
const ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeId(url) {
  if (typeof url !== "string") return null;
  const s = url.trim();
  if (!s) return null;

  // id trần
  if (ID.test(s)) return s;

  let u;
  try { u = new URL(s); } catch { return null; }

  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return ID.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    if (u.pathname === "/watch") {
      const id = u.searchParams.get("v") || "";
      return ID.test(id) ? id : null;
    }
    const m = u.pathname.match(/^\/(embed|shorts|v)\/([^/?#]+)/);
    if (m && ID.test(m[2])) return m[2];
  }
  return null;
}
