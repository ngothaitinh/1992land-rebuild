import { test } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const cfgUrl = pathToFileURL(path.resolve("scripts/tg-bot/adapters/1992land/config.mjs")).href;
const { default: cfg } = await import(cfgUrl);

test("mỗi loại nội dung có add_mode để mở luồng soạn bằng AI", () => {
  assert.equal(cfg.content_types.post.add_mode, "await_post");
  assert.equal(cfg.content_types.project.add_mode, "await_project");
});

test("publish.post/project có dir + image_path", () => {
  assert.equal(cfg.publish.post.dir, "data/posts");
  assert.equal(cfg.publish.post.image_path("abc"), "public/images/news/abc.jpg");
  assert.equal(cfg.publish.project.dir, "data/projects");
  assert.equal(cfg.publish.project.image_path("abc"), "public/images/projects/abc/hero.jpg");
});

test("không còn action 'inbox' — nó từng là ngõ cụt không ai xử lý", () => {
  assert.equal(cfg.commands.some((c) => c.action === "inbox"), false);
});

test("hide_section/show_section đã gộp thành toggle_section", () => {
  const actions = new Set(cfg.commands.map((c) => c.action));
  assert.equal(actions.has("hide_section"), false);
  assert.equal(actions.has("show_section"), false);
  assert.ok(actions.has("toggle_section"));
});

test("mọi action trong commands đều có nhãn menu", () => {
  for (const c of cfg.commands)
    assert.ok(cfg.action_labels[c.action], `thiếu action_labels.${c.action}`);
});

test("deploy_branch mặc định main, ghi đè được để kiểm thử", () => {
  assert.equal(cfg.deploy_branch, process.env.DEPLOY_BRANCH || "main");
});
