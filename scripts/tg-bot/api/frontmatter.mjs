// Parse/serialize frontmatter Markdown cho bài viết. Chiều đọc mirror
// lib/loadData.ts (TypeScript, chạy ở build-time Next.js) — bản .mjs này
// chạy ở backend API (Node thuần, không TypeScript). Thêm chiều ghi.

function parseLine(line) {
  const idx = line.indexOf(": ");
  if (idx === -1) return null;
  const key = line.slice(0, idx).trim();
  const raw = line.slice(idx + 2).trim();
  const val = raw.replace(/^["']|["']$/g, "");
  return [key, val];
}

function needsQuote(v) {
  // Quote if has colon, quote, or punctuation
  if (/:|"|[.,:;!?]/.test(v)) return true;

  // Quote if starts with digit AND has non-ASCII characters
  if (/^\d/.test(v) && /[^\x00-\x7F]/.test(v)) return true;

  // Quote if starts with ASCII letter AND has non-ASCII characters
  if (/^[a-zA-Z]/.test(v) && /[^\x00-\x7F]/.test(v)) return true;

  // Quote if has uppercase ASCII letter AND has non-ASCII characters
  if (/[A-Z]/.test(v) && /[^\x00-\x7F]/.test(v)) return true;

  return false;
}

export function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: normalized.trim() };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const pair = parseLine(line);
    if (pair) meta[pair[0]] = pair[1];
  }
  return { meta, body: match[2].trim() };
}

export function serializeFrontmatter(meta, body) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === null || value === "") continue;
    const v = String(value);
    lines.push(needsQuote(v) ? `${key}: "${v}"` : `${key}: ${v}`);
  }
  lines.push("---", "", body);
  return lines.join("\n") + "\n";
}
