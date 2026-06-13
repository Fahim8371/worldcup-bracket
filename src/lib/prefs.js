// Small localStorage-backed preferences (per-device, no backend).
// Same pattern as favourites.js / watchlist.js.
function read(key, fallback = null) {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

// --- Onboarding ---
export function isOnboarded() {
  return read('wc2026.onboarded') === '1'
}
export function setOnboarded() {
  write('wc2026.onboarded', '1')
}

// --- Install hint ---
export function installHintDismissed() {
  return read('wc2026.installHintDismissed') === '1'
}
export function dismissInstallHint() {
  write('wc2026.installHintDismissed', '1')
}

// --- Theme: 'dark' | 'light' | 'system' ---
export function getTheme() {
  return read('wc2026.theme', 'system')
}
export function setTheme(theme) {
  write('wc2026.theme', theme)
}

// Resolve a theme preference ('system'|'dark'|'light') to a concrete theme.
export function resolveTheme(pref) {
  if (pref === 'dark' || pref === 'light') return pref
  const dark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return dark ? 'dark' : 'light'
}

// Apply a theme preference to the document (and the iOS status-bar colour).
export function applyTheme(pref) {
  const theme = resolveTheme(pref)
  document.documentElement.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1220' : '#f4f6fb')
  return theme
}

// --- Timezone override (IANA string, or null to follow the device) ---
export function getSavedTimeZone() {
  return read('wc2026.timezone', null)
}
export function setSavedTimeZone(tz) {
  write('wc2026.timezone', tz)
}
