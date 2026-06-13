import { buildBracket, hasKnockoutData } from '../lib/bracket.js'
import { flagFor } from '../lib/teams.js'
import { formatLocalDay, formatLocalTime } from '../lib/time.js'

function Slot({ team, isFav, isWinner, showScore, score }) {
  const tbd = !team.tla
  return (
    <div className={`slot ${isFav ? 'fav' : ''} ${isWinner ? 'winner' : ''} ${tbd ? 'tbd' : ''}`}>
      <span className="flag">{tbd ? '❓' : flagFor(team.tla)}</span>
      <span className="team-name">{team.name}</span>
      {showScore && <span className="score">{score}</span>}
    </div>
  )
}

function BracketMatch({ match, favourites, watched, onToggleWatch }) {
  const favHome = match.home.tla && favourites.has(match.home.tla)
  const favAway = match.away.tla && favourites.has(match.away.tla)
  const isFav = favHome || favAway
  const done = match.status === 'FINISHED' || match.status === 'AWARDED'
  const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const showScore = done || live

  return (
    <div
      className={`bracket-match ${isFav ? 'is-fav' : 'muted-card'} ${live ? 'is-live' : ''} ${
        watched ? 'is-watched' : ''
      }`}
    >
      {onToggleWatch && (
        <button
          type="button"
          className={`watch-btn corner ${watched ? 'on' : ''}`}
          onClick={() => onToggleWatch(match.id)}
          title={watched ? 'Remove from my calendar' : 'Add to my calendar'}
          aria-pressed={watched}
        >
          {watched ? '★' : '☆'}
        </button>
      )}
      <Slot
        team={match.home}
        isFav={favHome}
        isWinner={match.winner === 'HOME_TEAM'}
        showScore={showScore}
        score={match.score.home}
      />
      <Slot
        team={match.away}
        isFav={favAway}
        isWinner={match.winner === 'AWAY_TEAM'}
        showScore={showScore}
        score={match.score.away}
      />
      <div className="bracket-match-meta">
        {live ? (
          <span className="badge live">● LIVE</span>
        ) : (
          `${formatLocalDay(match.utcDate)} · ${formatLocalTime(match.utcDate)}`
        )}
      </div>
    </div>
  )
}

export default function Bracket({ matches, favourites, watch, onToggleWatch }) {
  if (!hasKnockoutData(matches)) {
    return (
      <div className="bracket-empty muted">
        <p>🗓️ The knockout bracket appears once the group stage finishes.</p>
        <p className="small">
          Right now we're in the group stage — check the Fixtures tab for upcoming games.
        </p>
      </div>
    )
  }

  const rounds = buildBracket(matches)

  return (
    <div className="bracket-scroll">
      <div className="bracket">
        {rounds.map((round) => (
          <div key={round.stage} className="bracket-round">
            <h3 className="round-heading">{round.label}</h3>
            <div className="round-matches">
              {round.matches.map((m) => (
                <BracketMatch
                  key={m.id}
                  match={m}
                  favourites={favourites}
                  watched={watch?.has(m.id)}
                  onToggleWatch={onToggleWatch}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
