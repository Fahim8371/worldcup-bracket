// Builds an .ics calendar file from a set of matches and triggers a download.
// Times are written in UTC (the API's utcDate), so the calendar app shows them
// correctly in the user's local Melbourne time automatically.

function pad(n) {
  return String(n).padStart(2, '0')
}

// Date -> ICS UTC timestamp, e.g. 20260614T080000Z
function toIcsUtc(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

function escapeText(s) {
  return String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
}

function matchToEvent(match, stamp) {
  const start = new Date(match.utcDate)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // 2h slot
  const title = `${match.home.name} vs ${match.away.name}`
  const meta = match.group
    ? match.group.replace('GROUP_', 'Group ')
    : (match.stage || '').replace(/_/g, ' ')
  return [
    'BEGIN:VEVENT',
    `UID:wc2026-${match.id}@worldcup-bracket`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeText('🏆 ' + title)}`,
    `DESCRIPTION:${escapeText(`World Cup 2026 — ${meta}`)}`,
    'END:VEVENT',
  ].join('\r\n')
}

export function buildIcs(matches) {
  const stamp = toIcsUtc(new Date())
  const events = matches.map((m) => matchToEvent(m, stamp)).join('\r\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//worldcup-bracket//WC2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:World Cup 2026 — My Games',
    events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadIcs(matches, filename = 'world-cup-2026-my-games.ics') {
  const blob = new Blob([buildIcs(matches)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
