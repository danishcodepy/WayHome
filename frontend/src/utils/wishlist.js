/** Wishlist (saved properties) backed by localStorage. Key shared with TenantDashboard. */
const KEY = 'reh_saved';
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

export function getWishlist() {
  return read();
}

export function isWishlisted(id) {
  return read().includes(String(id));
}

export function toggleWishlist(id) {
  const sid = String(id);
  const ids = read();
  const next = ids.includes(sid) ? ids.filter((x) => x !== sid) : [...ids, sid];
  write(next);
  return next;
}

export function subscribeWishlist(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
