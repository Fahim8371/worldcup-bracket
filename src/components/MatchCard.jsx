import { flagFor } from '../lib/teams.js'
import { formatLocalTime } from '../lib/time.js'

const LIVE = new Set(['IN_PLAY', 'PAUSED'])
const DONE = new Set(['FINISHED', 'AWARDED'])

function TeamRow({ team, score, isFav, isWinner, showScore }) {
  return (
    <div className={`team-row ${isFav ? 'fav' : ''} ${isWinner ? 'winner' : ''}`}>
      <span className="flag">{flagFor(team.tla)}</span>
      <span className="team-name">{team.name}</span>
      <span className="score">{showScore ? score : ''}</span>
    </div>
  )
}

// One fixture. When neither team is a favourite the card is greyed/desaturated,
// but the score stays readable — disliked games are de-emphasised, not hidden.
// The star toggle adds/removes the game from the watchlist (works on any game).
export default function MatchCard({ match, favourites, watched = false, onToggleWatch }) {
  const favHome = match.home.tla && favourites.has(match.home.tla)
  const favAway = match.away.tla && favourites.has(match.away.tla)
  const isFavGame = favHome || favAway

  const live = LIVE.has(match.status)
  const done = DONE.has(match.status)
  const showScore = live || done

  let statusEl
  if (live) statusEl = <span className="badge live">● LIVE</span>
  else if (done) statusEl = <span className="badge done">FT</span>
  else statusEl = <span className="kickoff">{formatLocalTime(match.utcDate)}</span>

  const meta = match.group
    ? match.group.replace('GROUP_', 'Group ')
    : match.stage?.replace(/_/g, ' ').toLowerCase()

  return (
    <div
      className={`match-card ${isFavGame ? 'is-fav' : 'muted-card'} ${live ? 'is-live' : ''} ${
        watched ? 'is-watched' : ''
      }`}
    >
      <div className="match-meta">
        <span className="meta-text">{meta}</span>
        <div className="meta-right">
          {statusEl}
          {onToggleWatch && (
            <button
              type="button"
              className={`watch-btn ${watched ? 'on' : ''}`}
              onClick={() => onToggleWatch(match.id)}
              title={watched ? 'Remove from my calendar' : 'Add to my calendar'}
              aria-pressed={watched}
            >
              {watched ? '★' : '☆'}
            </button>
          )}
        </div>
      </div>
      <div className="teams">
        <TeamRow
          team={match.home}
          score={match.score.home}
          isFav={favHome}
          isWinner={match.winner === 'HOME_TEAM'}
          showScore={showScore}
        />
        <TeamRow
          team={match.away}
          score={match.score.away}
          isFav={favAway}
          isWinner={match.winner === 'AWAY_TEAM'}
          showScore={showScore}
        />
      </div>
    </div>
  )
}
