import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", ".tg-processed.json");
const MAX_ENTRIES = 500;

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}

function save(arr) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr));
}

export function isProcessed(messageId) {
  return load().includes(messageId);
}

export function markProcessed(messageId) {
  const arr = load();
  if (arr.includes(messageId)) return;
  arr.push(messageId);
  if (arr.length > MAX_ENTRIES) arr.splice(0, arr.length - MAX_ENTRIES);
  save(arr);
}
