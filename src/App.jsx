import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Tabs from './components/Tabs.jsx'
import Onboarding, { TeamPicker } from './components/Onboarding.jsx'
import FixtureList from './components/FixtureList.jsx'
import Bracket from './components/Bracket.jsx'
import Calendar from './components/Calendar.jsx'
import Standings from './components/Standings.jsx'
import Guide from './components/Guide.jsx'
import Settings from './components/Settings.jsx'
import LiveStrip from './components/LiveStrip.jsx'
import InstallHint from './components/InstallHint.jsx'
import { useMatches } from './hooks/useMatches.js'
import { getFavourites, setFavourites } from './lib/favourites.js'
import { getWatchlist, saveWatchlist } from './lib/watchlist.js'
import { TEAMS, teamsFromMatches, mergeTeams } from './lib/teams.js'
import { getTimeZone, setTimeZone, detectTimeZone } from './lib/time.js'
import {
  isOnboarded,
  setOnboarded,
  getTheme,
  setTheme as savePrefTheme,
  applyTheme,
  getSavedTimeZone,
  setSavedTimeZone,
} from './lib/prefs.js'

const TABS = [
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'groups', label: 'Groups' },
  { id: 'bracket', label: 'Bracket' },
  { id: 'calendar', label: 'Calendar' },
]

export default function App() {
  const { matches, loading, error } = useMatches()
  const [favList, setFavList] = useState(getFavourites)
  const [watchList, setWatchList] = useState(getWatchlist)
  const [tab, setTab] = useState('fixtures')

  // First-run flow + overlays
  const [onboarded, setOnboardedState] = useState(isOnboarded)
  const [editing, setEditing] = useState(false) // standalone team picker
  const [showGuide, setShowGuide] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Preferences
  const [theme, setThemeState] = useState(getTheme)
  const [tz, setTzState] = useState(() => getSavedTimeZone() || detectTimeZone())

  // Keep the time module + DOM theme in sync with prefs.
  useEffect(() => {
    setTimeZone(tz)
  }, [tz])
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const favourites = useMemo(() => new Set(favList), [favList])
  const watch = useMemo(() => new Set(watchList), [watchList])
  const teams = useMemo(() => mergeTeams(TEAMS, teamsFromMatches(matches)), [matches])

  const toggleWatch = useCallback((id) => {
    setWatchList((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      saveWatchlist(next)
      return next
    })
  }, [])

  function finishOnboarding(tlas) {
    setFavourites(tlas)
    setFavList(tlas)
    setOnboarded()
    setOnboardedState(true)
  }

  function changeTheme(next) {
    savePrefTheme(next)
    setThemeState(next)
  }
  function changeTimezone(next) {
    setSavedTimeZone(next)
    setTimeZone(next)
    setTzState(next)
  }

  // First run: full onboarding flow.
  if (!onboarded) {
    return <Onboarding teams={teams} initial={favList} onDone={finishOnboarding} />
  }

  const watchCount = watch.size
  const tabs = TABS.map((t) =>
    t.id === 'calendar' && watchCount > 0 ? { ...t, label: `Calendar (${watchCount})` } : t
  )

  return (
    <div className="app">
      <Header timezone={tz} onOpenSettings={() => setShowSettings(true)} />
      <InstallHint />
      {matches.length > 0 && (
        <LiveStrip matches={matches} favourites={favourites} watch={watch} />
      )}
      <Tabs active={tab} onChange={setTab} tabs={tabs} />

      <main className="content">
        {error && (
          <div className="error-banner">
            <strong>Couldn't load matches.</strong>
            <span>{error.message}</span>
          </div>
        )}

        {loading && matches.length === 0 && !error && (
          <p className="muted loading">Loading fixtures…</p>
        )}

        {matches.length > 0 && tab === 'fixtures' && (
          <FixtureList
            matches={matches}
            favourites={favourites}
            watch={watch}
            onToggleWatch={toggleWatch}
          />
        )}
        {matches.length > 0 && tab === 'groups' && (
          <Standings matches={matches} favourites={favourites} />
        )}
        {matches.length > 0 && tab === 'bracket' && (
          <Bracket
            matches={matches}
            favourites={favourites}
            watch={watch}
            onToggleWatch={toggleWatch}
          />
        )}
        {tab === 'calendar' && (
          <Calendar
            matches={matches}
            favourites={favourites}
            watch={watch}
            onToggleWatch={toggleWatch}
          />
        )}
      </main>

      {showSettings && (
        <Settings
          theme={theme}
          onThemeChange={changeTheme}
          timezone={tz}
          onTimezoneChange={changeTimezone}
          onEditTeams={() => {
            setShowSettings(false)
            setEditing(true)
          }}
          onReplayGuide={() => {
            setShowSettings(false)
            setShowGuide(true)
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showGuide && <Guide doneLabel="Got it" onDone={() => setShowGuide(false)} />}

      {editing && (
        <EditTeams
          teams={teams}
          initial={favList}
          onSave={(tlas) => {
            setFavourites(tlas)
            setFavList(tlas)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  )
}

// Standalone team-grid wrapper for the "Edit teams" path.
function EditTeams({ teams, initial, onSave, onCancel }) {
  const [selected, setSelected] = useState(() => new Set(initial))
  return (
    <TeamPicker
      teams={teams}
      selected={selected}
      setSelected={setSelected}
      primaryLabel="Save"
      onPrimary={() => onSave([...selected])}
      onCancel={onCancel}
    />
  )
}
