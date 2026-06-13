// Static fallback list of likely World Cup 2026 nations, keyed by FIFA 3-letter
// code (TLA). We match favourites by TLA because that is stable across the API,
// whereas numeric team ids are not known ahead of time.
//
// This list is only a seed for the onboarding grid + flag lookup. At runtime we
// also merge in any teams that actually appear in the fetched fixtures (see
// teamsFromMatches / mergeTeams below), so the grid is always accurate even if a
// nation here didn't qualify or one is missing.
export const TEAMS = [
  { tla: 'ALG', name: 'Algeria', flag: '🇩🇿' },
  { tla: 'ARG', name: 'Argentina', flag: '🇦🇷' },
  { tla: 'AUS', name: 'Australia', flag: '🇦🇺' },
  { tla: 'AUT', name: 'Austria', flag: '🇦🇹' },
  { tla: 'BEL', name: 'Belgium', flag: '🇧🇪' },
  { tla: 'BIH', name: 'Bosnia-Herzegovina', flag: '🇧🇦' },
  { tla: 'BRA', name: 'Brazil', flag: '🇧🇷' },
  { tla: 'CAN', name: 'Canada', flag: '🇨🇦' },
  { tla: 'CIV', name: 'Ivory Coast', flag: '🇨🇮' },
  { tla: 'COD', name: 'Congo DR', flag: '🇨🇩' },
  { tla: 'COL', name: 'Colombia', flag: '🇨🇴' },
  { tla: 'CPV', name: 'Cape Verde Islands', flag: '🇨🇻' },
  { tla: 'CRO', name: 'Croatia', flag: '🇭🇷' },
  { tla: 'CUW', name: 'Curaçao', flag: '🇨🇼' },
  { tla: 'CZE', name: 'Czechia', flag: '🇨🇿' },
  { tla: 'ECU', name: 'Ecuador', flag: '🇪🇨' },
  { tla: 'EGY', name: 'Egypt', flag: '🇪🇬' },
  { tla: 'ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { tla: 'ESP', name: 'Spain', flag: '🇪🇸' },
  { tla: 'FRA', name: 'France', flag: '🇫🇷' },
  { tla: 'GER', name: 'Germany', flag: '🇩🇪' },
  { tla: 'GHA', name: 'Ghana', flag: '🇬🇭' },
  { tla: 'HAI', name: 'Haiti', flag: '🇭🇹' },
  { tla: 'IRN', name: 'Iran', flag: '🇮🇷' },
  { tla: 'IRQ', name: 'Iraq', flag: '🇮🇶' },
  { tla: 'JOR', name: 'Jordan', flag: '🇯🇴' },
  { tla: 'JPN', name: 'Japan', flag: '🇯🇵' },
  { tla: 'KOR', name: 'South Korea', flag: '🇰🇷' },
  { tla: 'KSA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { tla: 'MAR', name: 'Morocco', flag: '🇲🇦' },
  { tla: 'MEX', name: 'Mexico', flag: '🇲🇽' },
  { tla: 'NED', name: 'Netherlands', flag: '🇳🇱' },
  { tla: 'NOR', name: 'Norway', flag: '🇳🇴' },
  { tla: 'NZL', name: 'New Zealand', flag: '🇳🇿' },
  { tla: 'PAN', name: 'Panama', flag: '🇵🇦' },
  { tla: 'PAR', name: 'Paraguay', flag: '🇵🇾' },
  { tla: 'POR', name: 'Portugal', flag: '🇵🇹' },
  { tla: 'QAT', name: 'Qatar', flag: '🇶🇦' },
  { tla: 'RSA', name: 'South Africa', flag: '🇿🇦' },
  { tla: 'SCO', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { tla: 'SEN', name: 'Senegal', flag: '🇸🇳' },
  { tla: 'SUI', name: 'Switzerland', flag: '🇨🇭' },
  { tla: 'SWE', name: 'Sweden', flag: '🇸🇪' },
  { tla: 'TUN', name: 'Tunisia', flag: '🇹🇳' },
  { tla: 'TUR', name: 'Turkey', flag: '🇹🇷' },
  { tla: 'URY', name: 'Uruguay', flag: '🇺🇾' },
  { tla: 'USA', name: 'United States', flag: '🇺🇸' },
  { tla: 'UZB', name: 'Uzbekistan', flag: '🇺🇿' },
]

const byTla = new Map(TEAMS.map((t) => [t.tla, t]))

export function flagFor(tla) {
  return byTla.get(tla)?.flag ?? '🏳️'
}

// Build {tla, name, flag} entries from teams that actually appear in fixtures.
export function teamsFromMatches(matches) {
  const seen = new Map()
  for (const m of matches) {
    for (const side of [m.home, m.away]) {
      if (side?.tla && !seen.has(side.tla)) {
        seen.set(side.tla, {
          tla: side.tla,
          name: side.name || side.tla,
          flag: flagFor(side.tla),
        })
      }
    }
  }
  return [...seen.values()]
}

// Merge the static seed with teams discovered in fixtures; fixtures win on name.
export function mergeTeams(staticTeams, fromMatches) {
  const map = new Map(staticTeams.map((t) => [t.tla, { ...t }]))
  for (const t of fromMatches) {
    map.set(t.tla, { ...map.get(t.tla), ...t })
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
}
