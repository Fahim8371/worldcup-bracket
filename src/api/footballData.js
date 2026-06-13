// Thin client over the football-data.org v4 API, reached through the Vite dev
// proxy at /api/fd (which injects the X-Auth-Token header). We normalise the raw
// match shape into a flat object the UI can use directly.

function normaliseMatch(m) {
  return {
    id: m.id,
    utcDate: m.utcDate,
    status: m.status, // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | ...
    stage: m.stage, // GROUP_STAGE | LAST_32 | LAST_16 | QUARTER_FINALS | ...
    group: m.group ?? null,
    matchday: m.matchday ?? null,
    home: {
      tla: m.homeTeam?.tla ?? null,
      name: m.homeTeam?.shortName || m.homeTeam?.name || 'TBD',
      crest: m.homeTeam?.crest ?? null,
    },
    away: {
      tla: m.awayTeam?.tla ?? null,
      name: m.awayTeam?.shortName || m.awayTeam?.name || 'TBD',
      crest: m.awayTeam?.crest ?? null,
    },
    score: {
      home: m.score?.fullTime?.home ?? null,
      away: m.score?.fullTime?.away ?? null,
    },
    winner: m.score?.winner ?? null, // HOME_TEAM | AWAY_TEAM | DRAW | null
  }
}

// In dev we hit the live API through the Vite proxy (key injected server-side).
// In the production build (GitHub Pages) there is no server, so we read a static
// matches.json that a scheduled GitHub Action refreshes every ~10 minutes.
const SOURCE = import.meta.env.DEV
  ? '/api/fd/competitions/WC/matches'
  : `${import.meta.env.BASE_URL}matches.json`

export async function fetchMatches() {
  const res = await fetch(SOURCE, { cache: 'no-store' })
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.message || ''
    } catch {
      /* ignore */
    }
    throw new Error(`Couldn't load matches (${res.status}${detail ? `: ${detail}` : ''}).`)
  }
  const data = await res.json()
  return (data.matches ?? []).map(normaliseMatch)
}
