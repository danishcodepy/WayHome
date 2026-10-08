/** Search intelligence helpers: recent searches + popular searches (localStorage, no backend). */

const RECENT_KEY = 'reh_recent_searches';
const MAX_RECENT = 6;

export function getRecentSearches() {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

export function addRecentSearch(query) {
  const q = (query || '').trim();
  if (!q) return;
  const list = getRecentSearches().filter((x) => x.toLowerCase() !== q.toLowerCase());
  list.unshift(q);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT))); } catch {}
}

export function clearRecentSearches() {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
}

/** Popular demo searches shown under the search box. */
export const POPULAR_SEARCHES = [
  'PG near IIT Delhi',
  'Hostel near VIT Vellore',
  'Flat near Amity University Noida',
  'PG near Delhi University',
  'Hostel near SRM Chennai',
];
