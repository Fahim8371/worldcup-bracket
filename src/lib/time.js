// All kickoff times are converted to the user's local Melbourne time.
// Using Intl with an explicit timeZone handles AEST/AEDT (daylight saving)
// automatically, so we never hand-roll a UTC offset.
const TZ = 'Australia/Melbourne'

const timeFmt = new Intl.DateTimeFormat('en-AU', {
  timeZone: TZ,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const dayFmt = new Intl.DateTimeFormat('en-AU', {
  timeZone: TZ,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

// A stable YYYY-MM-DD key in Melbourne local time, for grouping by calendar day.
const keyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatMelbourneTime(utcDate) {
  return timeFmt.format(new Date(utcDate))
}

export function formatMelbourneDay(utcDate) {
  return dayFmt.format(new Date(utcDate))
}

export function melbourneDayKey(utcDate) {
  return keyFmt.format(new Date(utcDate))
}

// Group an array of matches by Melbourne calendar day, returning sorted sections.
export function groupByDay(matches) {
  const groups = new Map()
  for (const m of matches) {
    const key = melbourneDayKey(m.utcDate)
    if (!groups.has(key)) {
      groups.set(key, { key, label: formatMelbourneDay(m.utcDate), matches: [] })
    }
    groups.get(key).matches.push(m)
  }
  const sections = [...groups.values()].sort((a, b) => a.key.localeCompare(b.key))
  for (const s of sections) {
    s.matches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
  }
  return sections
}
