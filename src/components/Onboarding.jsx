import { useState } from 'react'

// Team-picker grid shown on first run (and when "Edit teams" is clicked).
export default function Onboarding({ teams, initial = [], onDone, onCancel }) {
  const [selected, setSelected] = useState(new Set(initial))

  function toggle(tla) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(tla) ? next.delete(tla) : next.add(tla)
      return next
    })
  }

  return (
    <div className="onboarding">
      <div className="onboarding-card">
        <h1>Pick your teams</h1>
        <p className="muted">
          Choose the nations you care about. Their games get highlighted; every
          other game is still shown (greyed out) so you never miss a score.
        </p>

        <div className="team-grid">
          {teams.map((t) => {
            const on = selected.has(t.tla)
            return (
              <button
                key={t.tla}
                className={`team-chip ${on ? 'selected' : ''}`}
                onClick={() => toggle(t.tla)}
                type="button"
              >
                <span className="flag">{t.flag}</span>
                <span className="team-name">{t.name}</span>
              </button>
            )
          })}
        </div>

        <div className="onboarding-actions">
          <span className="muted">{selected.size} selected</span>
          <div className="spacer" />
          {onCancel && (
            <button className="btn ghost" type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            className="btn primary"
            type="button"
            disabled={selected.size === 0}
            onClick={() => onDone([...selected])}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
