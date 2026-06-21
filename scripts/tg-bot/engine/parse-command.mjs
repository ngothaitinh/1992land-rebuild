const KEY_MAP = {
  "slug":     "slug",
  "trường":   "field",
  "truong":   "field",
  "field":    "field",
  "giá trị":  "value",
  "gia tri":  "value",
  "value":    "value",
  "giá":      "value",
  "phần":     "section",
  "phan":     "section",
  "section":  "section",
};

export function parseCommand(text) {
  const result = { trigger: null, slug: null, field: null, value: null, section: null, raw: text };
  const lines = (text || "")
    .trim()
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (!lines.length) return result;

  const firstMatch = lines[0].match(/^\[(.+)\]$/);
  if (!firstMatch) return result;
  result.trigger = `[${firstMatch[1]}]`;

  for (let i = 1; i < lines.length; i++) {
    const colonIdx = lines[i].indexOf(":");
    if (colonIdx === -1) continue;
    const rawKey = lines[i].slice(0, colonIdx).trim().toLowerCase();
    const val    = lines[i].slice(colonIdx + 1).trim();
    const mapped = KEY_MAP[rawKey];
    if (mapped && val) result[mapped] = val;
  }

  return result;
}
