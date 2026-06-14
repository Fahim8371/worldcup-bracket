// Opens a Google search for the fixture, which surfaces Google's live score
// panel / match card for the two teams.
export function googleMatchUrl(home, away) {
  const q = `${home?.name ?? ''} vs ${away?.name ?? ''} world cup`.trim()
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`
}

export function openMatch(home, away) {
  window.open(googleMatchUrl(home, away), '_blank', 'noopener')
}
