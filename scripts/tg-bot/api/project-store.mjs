// Kho dữ liệu dự án cho dashboard: load / save (gộp 1 commit) / undo.
// Không dùng execSetField/execSetDescription/... của engine/actions.mjs — các hàm đó
// tự commit riêng lẻ (phá vỡ yêu cầu 1 lần Lưu = 1 commit) và tự gửi Telegram
// (dashboard không có chat để báo).
import { getFile, putFiles } from "../engine/github-commit.mjs";
import { recordUndo, takeUndo, toCommitFiles } from "../engine/undo.mjs";

const UNDO_CHAT_ID = "dashboard";
const SLUG_RE = /^[a-z0-9-]+$/;

function filePath(slug) {
  return `data/projects/${slug}.json`;
}

function imageDir(slug) {
  return `public/images/projects/${slug}`;
}

function assertValidSlug(slug) {
  if (!SLUG_RE.test(slug)) {
    const err = new Error("Slug không hợp lệ");
    err.code = "VALIDATION";
    throw err;
  }
}

export async function loadProject(deps, slug) {
  assertValidSlug(slug);
  const { content } = await (deps.getFile ?? getFile)(deps.repo, deps.branch, filePath(slug), deps.pat);
  return JSON.parse(content);
}

export async function saveProject(deps, slug, patch) {
  assertValidSlug(slug);
  const { content } = await (deps.getFile ?? getFile)(deps.repo, deps.branch, filePath(slug), deps.pat);
  const obj = JSON.parse(content);

  if (patch.fields && ("slug" in patch.fields || "id" in patch.fields)) {
    const err = new Error("Không được sửa slug/id");
    err.code = "VALIDATION";
    throw err;
  }

  if (patch.fields) Object.assign(obj, patch.fields);

  if (patch.descriptions) {
    obj.descriptions = obj.descriptions || {};
    for (const [k, v] of Object.entries(patch.descriptions)) {
      if (v === "") delete obj.descriptions[k];
      else obj.descriptions[k] = v;
    }
  }

  if (patch.hiddenSections !== undefined) obj.hidden_sections = patch.hiddenSections;

  const imageFiles = [];
  for (const img of patch.images ?? []) {
    const { filename } = img;
    if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
      const err = new Error(`Tên file ảnh không hợp lệ: ${filename}`);
      err.code = "VALIDATION";
      throw err;
    }

    const repoPath = `${imageDir(slug)}/${filename}`;
    const webPath = `/images/projects/${slug}/${filename}`;
    imageFiles.push({ path: repoPath, content: img.base64, binary: true });

    if (img.kind === "field") {
      if (img.list) obj[img.field] = [...(Array.isArray(obj[img.field]) ? obj[img.field] : []), webPath];
      else obj[img.field] = webPath;
    }
  }

  obj.updated_at = new Date().toISOString();

  // Tất cả thay đổi lên `obj` phải xong trước khi stringify — nếu không sẽ mất
  // các thay đổi field ảnh do stringify trước khi gán webPath vào obj.
  const files = [
    { path: filePath(slug), content: JSON.stringify(obj, null, 2) + "\n", binary: false },
    ...imageFiles,
  ];

  const { commitSha } = await (deps.putFiles ?? putFiles)(
    deps.repo, deps.branch, files, `content: dashboard save ${slug}`, deps.pat
  );

  const undoKey = recordUndo(UNDO_CHAT_ID, `dashboard save ${slug}`, [
    { path: filePath(slug), prevContent: content },
  ]);

  return { commitSha, undoKey };
}

export async function undoLastSave(deps, undoKey) {
  const entry = takeUndo(UNDO_CHAT_ID, undoKey);
  if (!entry) throw new Error("expired");

  const { commitSha } = await (deps.putFiles ?? putFiles)(
    deps.repo, deps.branch, toCommitFiles(entry), "content: undo dashboard save", deps.pat
  );

  return { commitSha };
}
