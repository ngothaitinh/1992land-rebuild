const TTL_MS = 30 * 60_000;
const store = new Map(); // chatId -> { mode, draft, expiresAt }

function entry(chatId) {
  const now = Date.now();
  let e = store.get(chatId);
  if (e && e.expiresAt < now) { store.delete(chatId); e = null; }
  if (!e) { e = { mode: null, draft: null, expiresAt: now + TTL_MS }; store.set(chatId, e); }
  e.expiresAt = now + TTL_MS;
  return e;
}

export function setMode(chatId, mode)   { entry(chatId).mode = mode; }
export function getMode(chatId)         { const e = store.get(chatId); return e && e.expiresAt >= Date.now() ? e.mode : null; }
export function setDraft(chatId, draft) { entry(chatId).draft = draft; }
export function getDraft(chatId)        { const e = store.get(chatId); return e && e.expiresAt >= Date.now() ? e.draft : null; }
// Trạng thái wizard sửa (slot riêng, không đụng mode/draft của luồng compose).
export function setWizard(chatId, wizard) { entry(chatId).wizard = wizard; }
export function getWizard(chatId)         { const e = store.get(chatId); return e && e.expiresAt >= Date.now() ? e.wizard : null; }
export function clearSession(chatId)    { store.delete(chatId); }
