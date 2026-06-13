// All kickoff times are shown in the user's local timezone. By default that's
// the device's own zone (auto-detected); the user can override it in Settings.
// Using Intl with an explicit timeZone handles daylight saving automatically.

export function detectTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

let currentTZ = detectTimeZone()

function buildFormatters(tz) {
  return {
    time: new Intl.DateTimeFormat('en-AU', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    day: new Intl.DateTimeFormat('en-AU', {
      timeZone: tz,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
    key: new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
  }
}

// Cached formatters, rebuilt whenever the timezone changes.
let fmts = buildFormatters(currentTZ)

export function getTimeZone() {
  return currentTZ
}

export function setTimeZone(tz) {
  if (!tz || tz === currentTZ) return
  currentTZ = tz
  fmts = buildFormatters(tz)
}

// Friendly label, e.g. "Australia/Melbourne" -> "Melbourne".
export function tzLabel(tz = currentTZ) {
  const tail = tz.split('/').pop() || tz
  return tail.replace(/_/g, ' ')
}

export function formatLocalTime(utcDate) {
  return fmts.time.format(new Date(utcDate))
}

export function formatLocalDay(utcDate) {
  return fmts.day.format(new Date(utcDate))
}

export function localDayKey(utcDate) {
  return fmts.key.format(new Date(utcDate))
}

// Group an array of matches by local calendar day, returning sorted sections.
export function groupByDay(matches) {
  const groups = new Map()
  for (const m of matches) {
    const key = localDayKey(m.utcDate)
    if (!groups.has(key)) {
      groups.set(key, { key, label: formatLocalDay(m.utcDate), matches: [] })
    }
    groups.get(key).matches.push(m)
  }
  const sections = [...groups.values()].sort((a, b) => a.key.localeCompare(b.key))
  for (const s of sections) {
    s.matches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
  }
  return sections
}
