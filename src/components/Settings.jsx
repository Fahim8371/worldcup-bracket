import { useMemo } from 'react'
import { tzLabel } from '../lib/time.js'

// Curated fallback list in case Intl.supportedValuesOf isn't available.
const FALLBACK_ZONES = [
  'Australia/Melbourne', 'Australia/Sydney', 'Australia/Perth', 'Pacific/Auckland',
  'Asia/Tokyo', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Kolkata',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Africa/Johannesburg',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'America/Mexico_City', 'UTC',
]

function allZones(current) {
  let zones = FALLBACK_ZONES
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      zones = Intl.supportedValuesOf('timeZone')
    }
  } catch {
    /* use fallback */
  }
  // Make sure the detected/current zone is selectable even if not in the list.
  return current && !zones.includes(current) ? [current, ...zones] : zones
}

const THEMES = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

export default function Settings({
  theme,
  onThemeChange,
  timezone,
  onTimezoneChange,
  onEditTeams,
  onReplayGuide,
  onClose,
}) {
  const zones = useMemo(() => allZones(timezone), [timezone])

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Settings</h2>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="setting-row">
          <label className="setting-label">Appearance</label>
          <div className="segmented">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`seg ${theme === t.id ? 'active' : ''}`}
                onClick={() => onThemeChange(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <label className="setting-label" htmlFor="tz-select">
            Timezone
          </label>
          <select
            id="tz-select"
            className="tz-select"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <p className="muted small">Match times show in {tzLabel(timezone)} time.</p>
        </div>

        <div className="setting-row">
          <label className="setting-label">App</label>
          <button className="btn ghost wide" type="button" onClick={onEditTeams}>
            ✎ Edit favourite teams
          </button>
          <button className="btn ghost wide" type="button" onClick={onReplayGuide}>
            ❔ Show the guide again
          </button>
        </div>

        <p className="muted small about">
          World Cup 2026 · saved privately on this device, no account needed.
        </p>
      </div>
    </div>
  )
}
