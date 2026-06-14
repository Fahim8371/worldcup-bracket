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
// - Prod: the Vercel live proxy (fresh, polled ~60s) if configured, falling back
//   to the static matches.json snapshot the GitHub Action bakes in.
const DEV = import.meta.env.DEV
const PROXY = import.meta.env.VITE_LIVE_PROXY || ''
const SNAPSHOT = `${import.meta.env.BASE_URL}matches.json`

export async function fetchMatches() {
  if (DEV) return fetchJson('/api/fd/competitions/WC/matches')

  // Prefer the live proxy; fall back to the snapshot if it's unreachable.
  if (PROXY) {
    try {
      return await fetchJson(PROXY)
    } catch {
      /* fall through to snapshot */
    }
  }
  try {
    return await fetchJson(SNAPSHOT)
  } catch (err) {
    throw new Error(`Couldn't load matches (${err.message}).`)
  }
}
