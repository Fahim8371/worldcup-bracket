import { tzLabel, relativeTime } from '../lib/time.js'

export default function Header({ timezone, lastUpdated, refreshing, onRefresh, onOpenSettings }) {
  return (
    <header className="app-header">
      <div className="title-block">
        <h1>
          <span className="trophy">🏆</span> World Cup 2026
        </h1>
        <p className="muted small">
          {tzLabel(timezone)} time
          {lastUpdated && <> · updated {relativeTime(lastUpdated)}</>}
        </p>
      </div>
      <div className="spacer" />
      <button
        className={`icon-btn refresh-btn ${refreshing ? 'spinning' : ''}`}
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        aria-label="Update scores"
        title="Update scores"
      >
        ↻
      </button>
      <button
        className="icon-btn settings-btn"
        type="button"
        onClick={onOpenSettings}
        aria-label="Settings"
        title="Settings"
      >
        ⚙️
      </button>
    </header>
  )
}
