// Kho dữ liệu bài viết cho dashboard: load / save (gộp 1 commit) / undo.
// Mirror project-store.mjs — dùng lại đúng getFile/putFiles + recordUndo/takeUndo,
// không viết lại logic Git.
import { getFile, putFiles } from "../engine/github-commit.mjs";
import { recordUndo, takeUndo, toCommitFiles } from "../engine/undo.mjs";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter.mjs";

const UNDO_CHAT_ID = "dashboard";
const SLUG_RE = /^[a-z0-9-]+$/;

function filePath(slug) {
  return `data/posts/${slug}.md`;
}

function assertValidSlug(slug) {
  if (!SLUG_RE.test(slug)) {
    const err = new Error("Slug không hợp lệ");
    err.code = "VALIDATION";
    throw err;
  }
}

export async function loadPost(deps, slug) {
  assertValidSlug(slug);
  const { content } = await (deps.getFile ?? getFile)(deps.repo, deps.branch, filePath(slug), deps.pat);
  return parseFrontmatter(content);
}

export async function savePost(deps, slug, patch) {
  assertValidSlug(slug);
  const { content } = await (deps.getFile ?? getFile)(deps.repo, deps.branch, filePath(slug), deps.pat);
  const { meta, body } = parseFrontmatter(content);

  if (patch.fields && "slug" in patch.fields) {
    const err = new Error("Không được sửa slug");
    err.code = "VALIDATION";
    throw err;
  }

  const nextMeta = patch.fields ? { ...meta, ...patch.fields } : meta;
  const nextBody = patch.body !== undefined ? patch.body : body;

  const files = [
    { path: filePath(slug), content: serializeFrontmatter(nextMeta, nextBody), binary: false },
  ];

  const { commitSha } = await (deps.putFiles ?? putFiles)(
    deps.repo, deps.branch, files, `content: dashboard save post ${slug}`, deps.pat
  );

  const undoKey = recordUndo(UNDO_CHAT_ID, `dashboard save post ${slug}`, [
    { path: filePath(slug), prevContent: content },
  ]);

  return { commitSha, undoKey };
}

export async function undoLastPostSave(deps, undoKey) {
  const entry = takeUndo(UNDO_CHAT_ID, undoKey);
  if (!entry) throw new Error("expired");

  const { commitSha } = await (deps.putFiles ?? putFiles)(
    deps.repo, deps.branch, toCommitFiles(entry), "content: undo dashboard save post", deps.pat
  );

  return { commitSha };
}
