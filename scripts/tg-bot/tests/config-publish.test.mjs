import { test } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const cfgUrl = pathToFileURL(path.resolve("scripts/tg-bot/adapters/1992land/config.mjs")).href;
const { default: cfg } = await import(cfgUrl);

test("có 2 nút publish với mode đúng", () => {
  const modes = cfg.publish_buttons.map((b) => b.mode);
  assert.ok(modes.includes("await_post"));
  assert.ok(modes.includes("await_project"));
});

test("publish.post/project có dir + image_path", () => {
  assert.equal(cfg.publish.post.dir, "data/posts");
  assert.equal(cfg.publish.post.image_path("abc"), "public/images/news/abc.jpg");
  assert.equal(cfg.publish.project.dir, "data/projects");
  assert.equal(cfg.publish.project.image_path("abc"), "public/images/projects/abc/hero.jpg");
});
