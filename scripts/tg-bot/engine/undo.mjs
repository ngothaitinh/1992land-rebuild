// Kho hoàn tác: giữ đúng 1 bản ghi gần nhất cho mỗi chat, sống 30 phút.
// Bản ghi mô tả trạng thái TRƯỚC thao tác, nên hoàn tác = ghi lại trạng thái đó.

const TTL_MS = 30 * 60_000;
const store = new Map(); // chatId -> { key, label, files, expiresAt }

let seq = 0;
function newKey() {
  seq += 1;
  return `u${Date.now().toString(36)}${seq.toString(36)}`;
}

// files: [{ path, prevContent, binary }]
//   prevContent = null  → file chưa từng tồn tại ⇒ hoàn tác là xoá nó.
//   binary = true       → prevContent là base64.
export function recordUndo(chatId, label, files) {
  const key = newKey();
  store.set(chatId, { key, label, files, expiresAt: Date.now() + TTL_MS });
  return key;
}

// Lấy bản ghi theo key và tiêu thụ luôn (hoàn tác không lặp lại được).
export function takeUndo(chatId, key) {
  const e = store.get(chatId);
  if (!e || e.key !== key) return null;
  store.delete(chatId);
  return e.expiresAt < Date.now() ? null : e;
}

export function clearUndo(chatId) {
  store.delete(chatId);
}

// Chuyển bản ghi thành danh sách file cho putFiles().
export function toCommitFiles(entry) {
  return entry.files.map((f) =>
    f.prevContent === null || f.prevContent === undefined
      ? { path: f.path, remove: true }
      : { path: f.path, content: f.prevContent, binary: !!f.binary }
  );
}
