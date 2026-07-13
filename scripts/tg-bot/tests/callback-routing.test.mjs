// Mọi nút bấm phải có nhánh xử lý trong serve.mjs. Không có test này thì một nút
// chết chỉ lộ ra khi người dùng bấm vào nó và bot im lặng.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildMainMenu, buildTypeMenu, typesFor } from "../engine/menu.mjs";
import { buildListKeyboard, buildFieldKeyboard, buildSectionKeyboard } from "../engine/wizard-helpers.mjs";
import { default as cfg } from "../adapters/1992land/config.mjs";

const serveSrc = fs.readFileSync(
  path.join(import.meta.dirname, "..", "engine", "serve.mjs"), "utf8"
);

// Rút các nhánh serve.mjs thực sự xử lý.
const exact   = [...serveSrc.matchAll(/data === "([^"]+)"/g)].map((m) => m[1]);
const prefixes = [...serveSrc.matchAll(/data\.startsWith\("([^"]+)"\)/g)].map((m) => m[1]);

function isHandled(cb) {
  return exact.includes(cb) || prefixes.some((p) => cb.startsWith(p));
}

// Mọi callback mà giao diện có thể sinh ra.
function allCallbacks() {
  const items = [{ slug: "du-an-mau", title: "Dự án mẫu" }, { slug: "b", title: "B" }];
  const kbs = [
    buildMainMenu(cfg),
    ...["set_field", "delete"].map((a) => buildTypeMenu(cfg, a)),
    ...["set_field", "toggle_section", "delete"].map((a) => buildListKeyboard(a, "project", items, 0)),
    buildFieldKeyboard(cfg, "project", "du-an-mau"),
    buildFieldKeyboard(cfg, "post", "bai-mau"),
    buildSectionKeyboard(cfg, "project", "du-an-mau", ["gia-ban"]),
  ];
  const fromKb = kbs.flatMap((kb) => kb.inline_keyboard.flat()).map((b) => b.callback_data);
  // Các nút dựng thẳng trong serve.mjs (nháp, xác nhận, hoàn tác).
  const inline = [
    "pub_approve", "pub_edit", "pub_cancel",
    "wz_confirm:abc123", "wz_cancel:abc123",
    "wz_del:abc123", "wz_delno:abc123",
    "undo:u12ab",
  ];
  return [...new Set([...fromKb, ...inline])];
}

test("mọi callback_data sinh ra đều có nhánh xử lý trong serve.mjs", () => {
  const orphans = allCallbacks().filter((cb) => !isHandled(cb));
  assert.deepEqual(orphans, [], `nút không ai xử lý: ${orphans.join(", ")}`);
});

test("mọi callback_data nằm trong giới hạn 64 byte của Telegram", () => {
  for (const cb of allCallbacks())
    assert.ok(Buffer.byteLength(cb) <= 64, `dài quá (${Buffer.byteLength(cb)}B): ${cb}`);
});

test("wz_search không bị nhánh wz_s bắt nhầm", () => {
  // "wz_search:e:project" không khớp prefix "wz_s:" — dấu hai chấm phân biệt.
  assert.equal("wz_search:e:project".startsWith("wz_s:"), false);
  assert.ok(prefixes.includes("wz_search:"));
  assert.ok(prefixes.includes("wz_s:"));
  // Thứ tự kiểm tra vẫn là chốt chặn nếu sau này ai đó bỏ dấu hai chấm.
  assert.ok(serveSrc.indexOf('data.startsWith("wz_search:")') < serveSrc.indexOf('data.startsWith("wz_s:")'));
});

test("wz_delno phải được xét trước wz_del, nếu không bấm Huỷ lại thành Xoá", () => {
  assert.equal("wz_delno:abc".startsWith("wz_del:"), false); // dấu hai chấm cứu
  assert.ok(
    serveSrc.indexOf('data.startsWith("wz_delno:")') < serveSrc.indexOf('data.startsWith("wz_del:")'),
    "nhánh wz_delno phải đứng trước wz_del"
  );
});

test("mọi slash command trong config đều được serve.mjs định tuyến", () => {
  for (const s of cfg.slash_commands)
    assert.ok(serveSrc.includes("slashMap"), "serve.mjs phải dựng slashMap từ cfg.slash_commands");
  // Các route mà runRoute biết xử lý.
  const routes = new Set(cfg.slash_commands.map((s) => s.route.split(":")[0]));
  for (const kind of routes)
    assert.ok(["menu", "help", "cancel", "add", "action"].includes(kind), `route lạ: ${kind}`);
});

test("action nào có nút menu thì cũng có ít nhất một loại nội dung hỗ trợ", () => {
  for (const b of buildMainMenu(cfg).inline_keyboard.flat()) {
    const m = /^m:(?:type|go):([a-z_]+)/.exec(b.callback_data || "");
    if (m) assert.ok(typesFor(cfg, m[1]).length > 0, `${m[1]} không loại nào hỗ trợ`);
  }
});
