import { tzLabel } from '../lib/time.js'

export default function Header({ timezone, onOpenSettings }) {
  return (
    <header className="app-header">
      <div className="title-block">
        <h1>
          <span className="trophy">🏆</span> World Cup 2026
        </h1>
        <p className="muted small">{tzLabel(timezone)} time</p>
      </div>
      <div className="spacer" />
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
