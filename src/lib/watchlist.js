// The watchlist is a set of match ids the user wants to watch, stored in
// localStorage so it persists. Independent of "favourite teams" — you can add
// any game, including greyed-out ones.
const KEY = 'wc2026.watchlist'

export function getWatchlist() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function saveWatchlist(ids) {
  localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]))
}
