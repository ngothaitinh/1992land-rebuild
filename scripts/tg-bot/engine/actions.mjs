// Mọi thao tác GHI lên repo. Mỗi hàm nhận deps = { cfg, repo, pat, send }.
// Sau khi commit thành công đều lưu một bản hoàn tác và theo dõi build.

import { getFile, putFile, deleteFile, putFiles } from "./github-commit.mjs";
import { watchDeployment } from "./deploy-watch.mjs";
import { recordUndo, takeUndo, toCommitFiles } from "./undo.mjs";
import { fieldLabel } from "./wizard-helpers.mjs";
import { toPostMarkdown, toProjectJson } from "./compose.mjs";

function filePathOf(cfg, contentType, slug) {
  const ct = cfg.content_types[contentType];
  return `${ct.dir}/${slug}.${ct.format === "json" ? "json" : "md"}`;
}

function undoKeyboard(key) {
  return { reply_markup: { inline_keyboard: [[{ text: "↩️ Hoàn tác", callback_data: `undo:${key}` }]] } };
}

// Báo đã commit + gắn nút hoàn tác, rồi bám theo GitHub Actions cho tới khi build xong.
async function announce(deps, chatId, text, undoKey, commitSha) {
  const { cfg, repo, pat, send } = deps;
  await send(chatId, `${text}\n\n⏳ Web sẽ cập nhật sau ~8 phút.`, undoKey ? undoKeyboard(undoKey) : {});
  watchDeployment(repo, commitSha, pat, async (status, runUrl) => {
    if (status === "success")      await send(chatId, `✅ <b>${cfg.site_name}</b> đã cập nhật xong.`).catch(console.error);
    else if (status === "timeout") await send(chatId, `⏱ Build đang lâu bất thường. Kiểm tra: ${runUrl}`).catch(console.error);
    else                           await send(chatId, `⚠️ Build lỗi (${status}), web chưa cập nhật.\n${runUrl}`).catch(console.error);
  });
}

// Đọc giá trị hiện tại của 1 field — cùng nguồn sự thật mà execSetField ghi lên.
export async function readCurrentField(deps, contentType, slug, field) {
  const { cfg, repo, pat } = deps;
  const ct = cfg.content_types[contentType];
  const { content } = await getFile(repo, cfg.deploy_branch, filePathOf(cfg, contentType, slug), pat);
  if (ct.format === "json") {
    const v = JSON.parse(content)[field];
    return (v === undefined || v === null) ? "" : (typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  const m = content.match(new RegExp(`^${field}:\\s*(.*)$`, "m"));
  return m ? m[1].replace(/^["']|["']$/g, "").trim() : "";
}

// ─── Sửa 1 trường ─────────────────────────────────────────────────────────────
export async function execSetField(deps, chatId, contentType, { slug, field, value }) {
  const { cfg, repo, pat, send } = deps;
  const ct = cfg.content_types[contentType];

  if (!slug)  return send(chatId, "❌ Thiếu <code>Slug:</code>");
  if (!field) return send(chatId, "❌ Thiếu <code>Trường:</code>");
  if (!value) return send(chatId, "❌ Thiếu <code>Giá trị:</code>");

  if (!ct.editable_fields.includes(field))
    return send(chatId,
      `❌ Trường <code>${field}</code> không cho sửa bằng bot.\n` +
      `Trường được phép: ${ct.editable_fields.join(", ")}`
    );

  const filePath = filePathOf(cfg, contentType, slug);
  let sha, content;
  try { ({ sha, content } = await getFile(repo, cfg.deploy_branch, filePath, pat)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  let newContent;
  if (ct.format === "json") {
    const obj = JSON.parse(content);
    if (typeof obj[field] === "object" && obj[field] !== null)
      return send(chatId, `❌ Trường <code>${field}</code> có cấu trúc phức tạp — sửa ở ${cfg.site_name}/admin/`);
    obj[field]     = value;
    obj.updated_at = new Date().toISOString();
    newContent     = JSON.stringify(obj, null, 2) + "\n";
  } else {
    const replaced = content.replace(new RegExp(`^(${field}:\\s*)(.*)$`, "m"), `$1${value}`);
    newContent = replaced === content
      ? content.replace(/^---\s*$/m, `${field}: ${value}\n---`)
      : replaced;
  }

  let commitSha;
  try {
    ({ commitSha } = await putFile(
      repo, cfg.deploy_branch, filePath, newContent, sha,
      `content: set ${field} on ${slug} via telegram`, pat
    ));
  } catch (e) {
    return send(chatId, `⚠️ Lỗi GitHub API: ${e.message}`);
  }

  const key = recordUndo(chatId, `sửa ${fieldLabel(cfg, field)}`, [{ path: filePath, prevContent: content }]);
  return announce(deps, chatId, `✏️ Đã đổi <b>${fieldLabel(cfg, field)}</b> thành "<code>${value}</code>"`, key, commitSha);
}

// ─── Bật/tắt một phần của dự án ───────────────────────────────────────────────
// Trả về { hidden } để gọi bên ngoài vẽ lại bảng bật/tắt.
export async function execToggleSection(deps, chatId, contentType, slug, sectionId) {
  const { cfg, repo, pat, send } = deps;
  const sections = cfg.content_types[contentType].sections || {};
  if (!sections[sectionId]) {
    await send(chatId, `❌ Không có phần <code>${sectionId}</code>.`);
    return null;
  }

  const filePath = filePathOf(cfg, contentType, slug);
  let sha, content;
  try { ({ sha, content } = await getFile(repo, cfg.deploy_branch, filePath, pat)); }
  catch { await send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); return null; }

  const obj = JSON.parse(content);
  const cur = Array.isArray(obj.hidden_sections) ? obj.hidden_sections : [];
  const wasHidden = cur.includes(sectionId);
  const next = wasHidden ? cur.filter((k) => k !== sectionId) : [...cur, sectionId];

  obj.hidden_sections = next;
  obj.updated_at      = new Date().toISOString();

  let commitSha;
  try {
    ({ commitSha } = await putFile(
      repo, cfg.deploy_branch, filePath, JSON.stringify(obj, null, 2) + "\n", sha,
      `content: ${wasHidden ? "show" : "hide"} section ${sectionId} on ${slug} via telegram`, pat
    ));
  } catch (e) {
    await send(chatId, `⚠️ Lỗi GitHub API: ${e.message}`);
    return null;
  }

  const label = sections[sectionId];
  const key = recordUndo(chatId, `${wasHidden ? "hiện" : "ẩn"} phần ${label}`, [{ path: filePath, prevContent: content }]);
  await announce(deps, chatId,
    `${wasHidden ? "👁 Đã hiện lại" : "🙈 Đã ẩn"} phần <b>${label}</b>`, key, commitSha);
  return { hidden: next };
}

// ─── Xoá ──────────────────────────────────────────────────────────────────────
export async function execDelete(deps, chatId, contentType, slug, title) {
  const { cfg, repo, pat, send } = deps;
  const filePath = filePathOf(cfg, contentType, slug);

  let sha, content;
  try { ({ sha, content } = await getFile(repo, cfg.deploy_branch, filePath, pat)); }
  catch { return send(chatId, `❌ Không tìm thấy: <code>${slug}</code>`); }

  let commitSha;
  try {
    ({ commitSha } = await deleteFile(
      repo, cfg.deploy_branch, filePath, sha,
      `content: delete ${filePath} via telegram`, pat
    ));
  } catch (e) {
    return send(chatId, `⚠️ Lỗi xoá: ${e.message}`);
  }

  const key = recordUndo(chatId, `xoá ${title || slug}`, [{ path: filePath, prevContent: content }]);
  return announce(deps, chatId, `🗑 Đã xoá <b>${title || slug}</b>`, key, commitSha);
}

// ─── Đăng bài/dự án mới (file nội dung + ảnh trong 1 commit) ───────────────────
export async function execPublish(deps, chatId, draft) {
  const { cfg, repo, pat, send } = deps;
  const pc      = cfg.publish[draft.type];
  const now     = new Date().toISOString();
  const heroWeb = draft.imageBase64 ? pc.web_image(draft.slug) : "";

  const contentPath = draft.type === "post" ? `${pc.dir}/${draft.slug}.md` : `${pc.dir}/${draft.slug}.json`;
  const contentBody = draft.type === "post"
    ? toPostMarkdown(draft.obj, { slug: draft.slug, date: now.slice(0, 10), heroImage: heroWeb })
    : toProjectJson(draft.obj, { slug: draft.slug, heroImage: heroWeb, now });

  const files = [{ path: contentPath, content: contentBody, binary: false }];
  if (draft.imageBase64) files.push({ path: pc.image_path(draft.slug), content: draft.imageBase64, binary: true });

  let commitSha;
  try {
    ({ commitSha } = await putFiles(repo, cfg.deploy_branch, files,
      `content: add ${draft.type} ${draft.slug} via telegram`, pat));
  } catch (e) {
    return send(chatId, `⚠️ Lỗi đăng: ${e.message}`);
  }

  // Trước thao tác các file này chưa tồn tại → hoàn tác nghĩa là xoá chúng.
  const key = recordUndo(chatId, `đăng ${draft.obj.title}`,
    files.map((f) => ({ path: f.path, prevContent: null })));
  return announce(deps, chatId, `✅ Đã đăng <b>${draft.obj.title}</b>`, key, commitSha);
}

// ─── Hoàn tác thao tác gần nhất ───────────────────────────────────────────────
export async function execUndo(deps, chatId, key) {
  const { cfg, repo, pat, send } = deps;
  const entry = takeUndo(chatId, key);
  if (!entry) return send(chatId, "⏱ Không hoàn tác được nữa (quá 30 phút hoặc đã hoàn tác rồi).");

  let commitSha;
  try {
    // Một commit Trees API cho mọi file → chỉ chạy build một lần.
    ({ commitSha } = await putFiles(repo, cfg.deploy_branch, toCommitFiles(entry),
      `content: undo (${entry.label}) via telegram`, pat));
  } catch (e) {
    return send(chatId, `⚠️ Hoàn tác lỗi: ${e.message}`);
  }

  return announce(deps, chatId, `↩️ Đã hoàn tác: <b>${entry.label}</b>`, null, commitSha);
}
