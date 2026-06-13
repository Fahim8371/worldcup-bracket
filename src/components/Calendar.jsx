import { useMemo, useRef } from 'react'
import MatchCard from './MatchCard.jsx'
import { localDayKey, formatLocalDay } from '../lib/time.js'
import { flagFor } from '../lib/teams.js'
import { downloadIcs } from '../lib/ics.js'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function pad(n) {
  return String(n).padStart(2, '0')
}

// Monday-based weekday index (0 = Mon … 6 = Sun) for a calendar date.
function mondayIndex(y, m, d) {
  const wd = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay() // 0 = Sun
  return (wd + 6) % 7
}

function daysInMonth(y, m) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

// Build the list of {year, month} to show, spanning all watched (or all) matches.
function monthsSpanning(matches) {
  if (matches.length === 0) return [{ y: 2026, m: 6 }]
  const keys = matches.map((x) => localDayKey(x.utcDate)).sort()
  const [y1, m1] = keys[0].split('-').map(Number)
  const [y2, m2] = keys.at(-1).split('-').map(Number)
  const out = []
  let y = y1
  let m = m1
  while (y < y2 || (y === y2 && m <= m2)) {
    out.push({ y, m })
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return out
}

function MonthGrid({ y, m, byDay, todayKey, onPickDay }) {
  const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const lead = mondayIndex(y, m, 1)
  const total = daysInMonth(y, m)
  const cells = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= total; d++) cells.push(d)

  return (
    <div className="cal-month">
      <h3 className="cal-month-label">{label}</h3>
      <div className="cal-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal-weekday">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`b${i}`} className="cal-cell empty" />
          const key = `${y}-${pad(m)}-${pad(d)}`
          const games = byDay.get(key) || []
          const isToday = key === todayKey
          return (
            <div
              key={key}
              className={`cal-cell ${games.length ? 'has-games' : ''} ${
                isToday ? 'today' : ''
              }`}
              onClick={games.length ? () => onPickDay(key) : undefined}
              title={games.length ? `${games.length} game(s) — click to view` : ''}
            >
              <span className="cal-daynum">{d}</span>
              {games.length > 0 && (
                <div className="cal-flags">
                  {games.slice(0, 3).map((g) => (
                    <span key={g.id} className="cal-flag">
                      {flagFor(g.home.tla)}
                      {flagFor(g.away.tla)}
                    </span>
                  ))}
                  {games.length > 3 && <span className="cal-more">+{games.length - 3}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// The watchlist "calendar" tab: a month grid of games you've added, plus an
// "Up Next" agenda highlighting the next game you're watching.
export default function Calendar({ matches, favourites, watch, onToggleWatch }) {
  const agendaRef = useRef(null)

  const watched = useMemo(
    () =>
      matches
        .filter((m) => watch.has(m.id))
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)),
    [matches, watch]
  )

  const byDay = useMemo(() => {
    const map = new Map()
    for (const m of watched) {
      const k = localDayKey(m.utcDate)
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(m)
    }
    return map
  }, [watched])

  const months = useMemo(() => monthsSpanning(watched), [watched])
  const todayKey = localDayKey(new Date())

  // Index of the next game still to come (first not in the past).
  const now = Date.now()
  const nextId = watched.find((m) => new Date(m.utcDate).getTime() >= now)?.id

  function pickDay(key) {
    const el = agendaRef.current?.querySelector(`[data-agenda-day="${key}"]`)
    if (el) {
      el.scrollIntoView({ block: 'start' })
      window.scrollBy(0, -80)
    }
  }

  if (watched.length === 0) {
    return (
      <div className="cal-empty muted">
        <p>⭐ Your watch calendar is empty.</p>
        <p className="small">
          Tap the ☆ star on any game in <strong>Fixtures</strong> or <strong>Bracket</strong>{' '}
          to add it here — even greyed-out games.
        </p>
      </div>
    )
  }

  return (
    <div className="calendar">
      <div className="cal-toolbar">
        <span className="muted small">
          {watched.length} game{watched.length === 1 ? '' : 's'} on your watchlist
        </span>
        <div className="spacer" />
        <button
          className="btn ghost small-btn"
          type="button"
          onClick={() => downloadIcs(watched, 'world-cup-watchlist.ics')}
        >
          📅 Export to calendar app
        </button>
      </div>

      <div className="cal-months">
        {months.map(({ y, m }) => (
          <MonthGrid
            key={`${y}-${m}`}
            y={y}
            m={m}
            byDay={byDay}
            todayKey={todayKey}
            onPickDay={pickDay}
          />
        ))}
      </div>

      <h2 className="day-heading">Up Next</h2>
      <div className="agenda" ref={agendaRef}>
        {watched.map((m) => (
          <div
            key={m.id}
            data-agenda-day={localDayKey(m.utcDate)}
            className={m.id === nextId ? 'agenda-next' : ''}
          >
            <div className="agenda-date">
              {formatLocalDay(m.utcDate)}
              {m.id === nextId && <span className="next-pill">NEXT UP</span>}
            </div>
            <MatchCard
              match={m}
              favourites={favourites}
              watched={watch.has(m.id)}
              onToggleWatch={onToggleWatch}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
