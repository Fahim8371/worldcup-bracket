import { useMemo } from 'react'
import { buildStandings } from '../lib/standings.js'
import Flag from './Flag.jsx'

export default function Standings({ matches, favourites }) {
  const groups = useMemo(() => buildStandings(matches), [matches])

  if (groups.length === 0) {
    return (
      <div className="cal-empty muted">
        <p>📊 Standings appear as group games are played.</p>
        <p className="small">Check back once the first results are in.</p>
      </div>
    )
  }

  return (
    <div className="standings">
      {groups.map((g) => (
        <section key={g.group} className="standings-group">
          <h3 className="round-heading">{g.label}</h3>
          <table className="standings-table">
            <thead>
              <tr>
                <th className="st-team">Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GD</th>
                <th className="st-pts">Pts</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((r, i) => {
                const fav = favourites.has(r.tla)
                return (
                  <tr key={r.tla} className={`${fav ? 'fav' : ''} ${i < 2 ? 'qualifying' : ''}`}>
                    <td className="st-team">
                      <Flag tla={r.tla} size={22} />
                      <span className="team-name">{r.name}</span>
                    </td>
                    <td>{r.played}</td>
                    <td>{r.won}</td>
                    <td>{r.drawn}</td>
                    <td>{r.lost}</td>
                    <td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                    <td className="st-pts">{r.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}
