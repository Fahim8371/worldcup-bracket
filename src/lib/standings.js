// Compute group standings from finished group-stage matches.
// Note: uses the simplified ranking (points → goal difference → goals for),
// not the full FIFA head-to-head tiebreakers.
const DONE = new Set(['FINISHED', 'AWARDED'])

function emptyRow(team) {
  return {
    tla: team.tla,
    name: team.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
  }
}

export function buildStandings(matches) {
  const groups = new Map() // groupName -> Map(tla -> row)

  // First pass: seed every group with ALL its teams from the fixtures, so the
  // table shows all four nations from the start (0 played until games finish).
  for (const m of matches) {
    if (m.stage !== 'GROUP_STAGE' || !m.group) continue
    if (!groups.has(m.group)) groups.set(m.group, new Map())
    const table = groups.get(m.group)
    if (m.home.tla && !table.has(m.home.tla)) table.set(m.home.tla, emptyRow(m.home))
    if (m.away.tla && !table.has(m.away.tla)) table.set(m.away.tla, emptyRow(m.away))
  }

  // Second pass: tally stats from finished matches only.
  for (const m of matches) {
    if (m.stage !== 'GROUP_STAGE' || !m.group) continue
    if (!DONE.has(m.status)) continue
    if (!m.home.tla || !m.away.tla) continue
    const h = m.score.home
    const a = m.score.away
    if (h == null || a == null) continue

    const table = groups.get(m.group)
    const rh = table.get(m.home.tla)
    const ra = table.get(m.away.tla)
    rh.played++
    ra.played++
    rh.gf += h
    rh.ga += a
    ra.gf += a
    ra.ga += h
    if (h > a) {
      rh.won++
      rh.points += 3
      ra.lost++
    } else if (h < a) {
      ra.won++
      ra.points += 3
      rh.lost++
    } else {
      rh.drawn++
      ra.drawn++
      rh.points++
      ra.points++
    }
  }

  const result = [...groups.entries()]
    .map(([group, table]) => {
      const rows = [...table.values()]
      for (const r of rows) r.gd = r.gf - r.ga
      rows.sort((x, y) => y.points - x.points || y.gd - x.gd || y.gf - x.gf)
      return { group, label: group.replace('GROUP_', 'Group '), rows }
    })
    .sort((a, b) => a.label.localeCompare(b.label))

  return result
}
