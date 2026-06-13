// Favourite teams are stored as a list of FIFA 3-letter codes (TLA) in
// localStorage so the choice persists across reloads.
const KEY = 'wc2026.favourites'

export function getFavourites() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function setFavourites(tlas) {
  localStorage.setItem(KEY, JSON.stringify([...new Set(tlas)]))
}
