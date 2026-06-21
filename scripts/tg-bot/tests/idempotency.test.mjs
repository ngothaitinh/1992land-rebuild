import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", ".tg-processed.json");

before(() => {
  if (fs.existsSync(DATA_FILE)) fs.renameSync(DATA_FILE, DATA_FILE + ".bak");
});
after(() => {
  if (fs.existsSync(DATA_FILE)) fs.rmSync(DATA_FILE);
  if (fs.existsSync(DATA_FILE + ".bak")) fs.renameSync(DATA_FILE + ".bak", DATA_FILE);
});

const { isProcessed, markProcessed } = await import("../engine/idempotency.mjs");

test("message chưa xử lý → isProcessed = false", () => {
  assert.equal(isProcessed(999), false);
});

test("sau markProcessed → isProcessed = true", () => {
  markProcessed(111);
  assert.equal(isProcessed(111), true);
});

test("markProcessed idempotent — gọi 2 lần không lỗi", () => {
  markProcessed(222);
  markProcessed(222);
  assert.equal(isProcessed(222), true);
});

test("giữ tối đa 500 entries, FIFO", () => {
  for (let i = 1000; i < 1501; i++) markProcessed(i);
  assert.equal(isProcessed(1000), false);
  assert.equal(isProcessed(1500), true);
});
