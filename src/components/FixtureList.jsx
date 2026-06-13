import { useEffect, useMemo, useRef, useState } from 'react'
import MatchCard from './MatchCard.jsx'
import { groupByDay } from '../lib/time.js'
import { downloadIcs } from '../lib/ics.js'

const DONE = new Set(['FINISHED', 'AWARDED'])

// Date-grouped list of all matches. A toggle lets the user collapse to only
// their favourite teams' games, and an export button adds those games to a
// calendar (.ics). On first load the list auto-scrolls to the next upcoming day.
export default function FixtureList({ matches, favourites, watch, onToggleWatch }) {
  const [onlyFavs, setOnlyFavs] = useState(false)
  const scrollRef = useRef(null)
  const didScroll = useRef(false)

  const favMatches = useMemo(
    () =>
      matches.filter(
        (m) =>
          (m.home.tla && favourites.has(m.home.tla)) ||
          (m.away.tla && favourites.has(m.away.tla))
      ),
    [matches, favourites]
  )

  const sections = useMemo(
    () => groupByDay(onlyFavs ? favMatches : matches),
    [matches, favMatches, onlyFavs]
  )

  // Day key of the first section containing a not-yet-finished match — i.e. the
  // next upcoming (or live) day. Falls back to the last day if everything's done.
  const upcomingKey = useMemo(() => {
    for (const s of sections) {
      if (s.matches.some((m) => !DONE.has(m.status))) return s.key
    }
    return sections.at(-1)?.key ?? null
  }, [sections])

  // Auto-scroll once, after the first real data + layout, to the upcoming day.
  useEffect(() => {
    if (didScroll.current || onlyFavs || !upcomingKey) return
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-daykey="${upcomingKey}"]`)
      if (el) {
        didScroll.current = true
        el.scrollIntoView({ block: 'start' })
        window.scrollBy(0, -72) // clear the sticky day heading
      }
    }, 80)
    return () => clearTimeout(t)
  }, [upcomingKey, onlyFavs])

  return (
    <div className="fixtures" ref={scrollRef}>
      <div className="fixtures-toolbar">
        <button
          className="btn ghost small-btn"
          type="button"
          disabled={favMatches.length === 0}
          onClick={() => downloadIcs(favMatches)}
          title={
            favMatches.length === 0
              ? 'Pick some teams first'
              : `Export ${favMatches.length} games to your calendar`
          }
        >
          📅 Add my games to calendar
        </button>
        <div className="spacer" />
        <label className="toggle">
          <input
            type="checkbox"
            checked={onlyFavs}
            onChange={(e) => setOnlyFavs(e.target.checked)}
          />
          Only my teams
        </label>
      </div>

      {sections.length === 0 && <p className="muted empty">No games to show.</p>}

      {sections.map((section) => (
        <section key={section.key} data-daykey={section.key} className="day-section">
          <h2 className="day-heading">{section.label}</h2>
          <div className="day-matches">
            {section.matches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                favourites={favourites}
                watched={watch?.has(m.id)}
                onToggleWatch={onToggleWatch}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
