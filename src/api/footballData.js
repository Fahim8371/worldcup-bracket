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

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return (data.matches ?? []).map(normaliseMatch)
}

// Where match data comes from:
// - Dev: the live API via the Vite proxy (key injected server-side).
// - Prod: the static matches.json snapshot the GitHub Action bakes in. We add a
//   cache-busting query so the manual "Update scores" button always pulls the
//   freshest published snapshot rather than a cached copy.
const DEV = import.meta.env.DEV
const SNAPSHOT = `${import.meta.env.BASE_URL}matches.json`

export async function fetchMatches() {
  if (DEV) return fetchJson('/api/fd/competitions/WC/matches')
  try {
    return await fetchJson(`${SNAPSHOT}?t=${Date.now()}`)
  } catch (err) {
    throw new Error(`Couldn't load matches (${err.message}).`)
  }
}
