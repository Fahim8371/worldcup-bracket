import { useEffect, useMemo, useState } from 'react'
import Flag from './Flag.jsx'
import { openMatch } from '../lib/matchLink.js'

const LIVE = new Set(['IN_PLAY', 'PAUSED'])
const DONE = new Set(['FINISHED', 'AWARDED'])

function formatCountdown(ms) {
  if (ms <= 0) return 'now'
  const totalMin = Math.floor(ms / 60000)
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// Top strip: any in-play games + a ticking countdown to the next game on the
// watchlist (or the next favourite-team game if the watchlist is empty).
export default function LiveStrip({ matches, favourites, watch }) {
  const [now, setNow] = useState(Date.now())

  const live = useMemo(() => matches.filter((m) => LIVE.has(m.status)), [matches])

  const nextGame = useMemo(() => {
    const upcoming = matches
      .filter((m) => !DONE.has(m.status) && !LIVE.has(m.status))
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
    const onWatch = upcoming.find((m) => watch.has(m.id))
    if (onWatch) return { match: onWatch, reason: 'watchlist' }
    const fav = upcoming.find(
      (m) =>
        (m.home.tla && favourites.has(m.home.tla)) ||
        (m.away.tla && favourites.has(m.away.tla))
    )
    if (fav) return { match: fav, reason: 'favourite' }
    return null
  }, [matches, favourites, watch])

  // Only tick every second when there's a countdown to show.
  useEffect(() => {
    if (!nextGame) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [nextGame])

  if (live.length === 0 && !nextGame) return null

  return (
    <div className="live-strip">
      {live.map((m) => (
        <div
          key={m.id}
          className="live-chip"
          onClick={() => openMatch(m.home, m.away)}
          title="Open live score on Google"
        >
          <span className="badge live">● LIVE</span>
          <span className="lc-team">
            <Flag tla={m.home.tla} size={18} /> {m.home.name}
          </span>
          <span className="lc-score">
            {m.score.home}–{m.score.away}
          </span>
          <span className="lc-team">
            <Flag tla={m.away.tla} size={18} /> {m.away.name}
          </span>
        </div>
      ))}

      {nextGame && (
        <div
          className="next-chip"
          onClick={() => openMatch(nextGame.match.home, nextGame.match.away)}
          title="Open live score on Google"
          style={{ cursor: 'pointer' }}
        >
          <span className="next-label">
            {nextGame.reason === 'watchlist' ? '⭐ Next on your list' : 'Your next game'}
          </span>
          <span className="nc-teams">
            <Flag tla={nextGame.match.home.tla} size={18} /> {nextGame.match.home.name} v{' '}
            {nextGame.match.away.name} <Flag tla={nextGame.match.away.tla} size={18} />
          </span>
          <span className="nc-count">
            kicks off in {formatCountdown(new Date(nextGame.match.utcDate).getTime() - now)}
          </span>
        </div>
      )}
    </div>
  )
}
