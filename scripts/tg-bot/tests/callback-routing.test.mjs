// Mọi nút bấm phải có nhánh xử lý trong serve.mjs. Không có test này thì một nút
// chết chỉ lộ ra khi người dùng bấm vào nó và bot im lặng.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildMainMenu, buildItemListMenu, buildItemMenu } from "../engine/menu.mjs";
import {
  buildFieldKeyboard, buildSectionKeyboard, buildEditSectionMenu, buildSectionActionMenu,
} from "../engine/wizard-helpers.mjs";
import { default as cfg } from "../adapters/1992land/config.mjs";

const serveSrc = fs.readFileSync(
  path.join(import.meta.dirname, "..", "engine", "serve.mjs"), "utf8"
);

const exact    = [...serveSrc.matchAll(/data === "([^"]+)"/g)].map((m) => m[1]);
const prefixes = [...serveSrc.matchAll(/data\.startsWith\("([^"]+)"\)/g)].map((m) => m[1]);

function isHandled(cb) {
  return exact.includes(cb) || prefixes.some((p) => cb.startsWith(p));
}

function allCallbacks() {
  const items = [{ slug: "du-an-mau", title: "Dự án mẫu" }, { slug: "b", title: "B" }];
  const kbs = [
    buildMainMenu(cfg),
    buildItemListMenu(cfg, "project", items),
    buildItemListMenu(cfg, "post", items),
    buildItemMenu(cfg, "project", "du-an-mau", "Dự án mẫu"),
    buildItemMenu(cfg, "post", "bai-mau", "Bài mẫu"),
    buildFieldKeyboard(cfg, "project", "du-an-mau"),
    buildFieldKeyboard(cfg, "post", "bai-mau"),
    buildSectionKeyboard(cfg, "project", "du-an-mau", ["gia-ban"]),
    buildEditSectionMenu(cfg, "project", "du-an-mau"),
    buildSectionActionMenu(cfg, "project", "du-an-mau", "tong-quan"),
    buildSectionActionMenu(cfg, "project", "du-an-mau", "gia-ban"),
  ];
  const fromKb = kbs.flatMap((kb) => kb.inline_keyboard.flat()).map((b) => b.callback_data);
  // Nút dựng thẳng trong serve.mjs (giá trị mới, nháp, xác nhận, hoàn tác).
  const inline = [
    "pub_approve", "pub_edit", "pub_cancel",
    "wz_confirm:abc123", "wz_cancel:abc123",
    "wz_del:abc123", "wz_delno:abc123",
    "wz_f:project:du-an-mau:0",
    "undo:u12ab",
    "esec:basic:du-an-mau", "edesc:tong-quan:du-an-mau",
    "eimg:tong-quan:du-an-mau", "evid:tong-quan:du-an-mau",
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

test("wz_delno phải được xét trước wz_del, nếu không bấm Huỷ lại thành Xoá", () => {
  assert.equal("wz_delno:abc".startsWith("wz_del:"), false);
  assert.ok(
    serveSrc.indexOf('data.startsWith("wz_delno:")') < serveSrc.indexOf('data.startsWith("wz_del:")'),
    "nhánh wz_delno phải đứng trước wz_del"
  );
});

test("m:act định tuyến đủ 3 việc qua action code", () => {
  const cb = buildItemMenu(cfg, "project", "x", "X").inline_keyboard.flat().map((b) => b.callback_data);
  assert.ok(cb.includes("m:act:e:project:x"));
  assert.ok(cb.includes("m:act:s:project:x"));
  assert.ok(cb.includes("m:act:d:project:x"));
});

test("mọi slash command trong config đều được serve.mjs định tuyến", () => {
  assert.ok(serveSrc.includes("slashMap"), "serve.mjs phải dựng slashMap từ cfg.slash_commands");
  const routes = new Set(cfg.slash_commands.map((s) => s.route.split(":")[0]));
  for (const kind of routes)
    assert.ok(["menu", "help", "cancel", "add", "action"].includes(kind), `route lạ: ${kind}`);
});
