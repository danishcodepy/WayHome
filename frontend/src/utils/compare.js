/** Compare tray: up to 3 property ids, backed by localStorage. */
const KEY = 'reh_compare';
const MAX = 3;
const listeners = new Set();

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function write(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  listeners.forEach((fn) => fn(ids));
}

export const COMPARE_MAX = MAX;

export function getCompareList() {
  return read();
}

export function isCompared(id) {
  return read().includes(String(id));
}

/** Toggle; returns { ids, added } — added=false when the tray is already full. */
export function toggleCompare(id) {
  const sid = String(id);
  const ids = read();
  if (ids.includes(sid)) {
    const next = ids.filter((x) => x !== sid);
    write(next);
    return { ids: next, added: true };
  }
  if (ids.length >= MAX) return { ids, added: false };
  const next = [...ids, sid];
  write(next);
  return { ids: next, added: true };
}

export function clearCompare() {
  write([]);
}

export function subscribeCompare(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
