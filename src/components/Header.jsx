export default function Header({ lastUpdated, onEditTeams }) {
  return (
    <header className="app-header">
      <div className="title-block">
        <h1>
          <span className="trophy">🏆</span> World Cup 2026
        </h1>
        <p className="muted small">Melbourne time · your bracket</p>
      </div>
      <div className="spacer" />
      {lastUpdated && (
        <span className="muted small updated">
          Updated{' '}
          {lastUpdated.toLocaleTimeString('en-AU', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
      )}
      <button className="btn ghost" type="button" onClick={onEditTeams}>
        ✎ Edit teams
      </button>
    </header>
  )
}
