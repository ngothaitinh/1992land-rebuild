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

// Thay cho NEEDS_QUOTE_RE đơn giản trong plan gốc — regex đó không đủ để giữ đúng quoting
// của các chuỗi tiếng Việt có dấu (vd tiêu đề), gây lệch round-trip khi parse/serialize.
function needsQuote(v) {
  // Bọc dấu ngoặc kép nếu có dấu hai chấm, dấu ngoặc kép, hoặc dấu câu
  if (/:|"|[.,:;!?]/.test(v)) return true;

  // Bọc dấu ngoặc kép nếu bắt đầu bằng chữ số VÀ có ký tự ngoài ASCII
  if (/^\d/.test(v) && /[^\x00-\x7F]/.test(v)) return true;

  // Bọc dấu ngoặc kép nếu bắt đầu bằng chữ cái ASCII VÀ có ký tự ngoài ASCII
  if (/^[a-zA-Z]/.test(v) && /[^\x00-\x7F]/.test(v)) return true;

  // Bọc dấu ngoặc kép nếu có chữ cái viết hoa ASCII VÀ có ký tự ngoài ASCII
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
