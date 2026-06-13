import { useState } from 'react'
import Guide from './Guide.jsx'
import { tzLabel } from '../lib/time.js'

// First-run flow: Welcome → Pick teams → Guide slides → Done.
// (The "Edit teams" path reuses just the team-grid step via TeamPicker below.)
export default function Onboarding({ teams, initial = [], onDone }) {
  const [step, setStep] = useState('welcome') // welcome | teams | guide
  const [selected, setSelected] = useState(new Set(initial))

  if (step === 'welcome') {
    return (
      <div className="onboarding">
        <div className="onboarding-card welcome">
          <div className="guide-icon">🏆</div>
          <h1>World Cup 2026</h1>
          <p className="muted">
            Your personal guide to every game — kickoff times in{' '}
            <strong>{tzLabel()}</strong> time, your teams highlighted, and a watch
            calendar for the matches you don't want to miss.
          </p>
          <p className="muted small">
            Everything you pick is saved privately on this device.
          </p>
          <div className="onboarding-actions">
            <div className="spacer" />
            <button className="btn primary" type="button" onClick={() => setStep('teams')}>
              Get started
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'teams') {
    return (
      <TeamPicker
        teams={teams}
        selected={selected}
        setSelected={setSelected}
        primaryLabel="Next"
        onPrimary={() => setStep('guide')}
      />
    )
  }

  // guide
  return <Guide doneLabel="Start watching" onDone={() => onDone([...selected])} />
}

// Reusable team grid. Used in onboarding and (standalone) for "Edit teams".
export function TeamPicker({
  teams,
  selected,
  setSelected,
  onPrimary,
  primaryLabel = 'Done',
  onCancel,
}) {
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
          Choose the nations you care about. Their games get highlighted; every other
          game is still shown (greyed out) so you never miss a score.
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
            onClick={onPrimary}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
