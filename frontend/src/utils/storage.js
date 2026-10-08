/** Saved accommodations (student favourites) backed by localStorage. */
const KEY = 'reh_saved_acc';
const listeners = new Set();

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(ids) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  listeners.forEach((fn) => fn(ids));
}

export function getSavedAcc() {
  return read();
}

export function isSavedAcc(id) {
  return read().includes(String(id));
}

export function toggleSavedAcc(id) {
  const sid = String(id);
  const ids = read();
  const next = ids.includes(sid) ? ids.filter((x) => x !== sid) : [...ids, sid];
  write(next);
  return next.includes(sid);
}

export function subscribeSavedAcc(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
