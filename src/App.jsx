import { useCallback, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Tabs from './components/Tabs.jsx'
import Onboarding from './components/Onboarding.jsx'
import FixtureList from './components/FixtureList.jsx'
import Bracket from './components/Bracket.jsx'
import Calendar from './components/Calendar.jsx'
import { useMatches } from './hooks/useMatches.js'
import { getFavourites, setFavourites } from './lib/favourites.js'
import { getWatchlist, saveWatchlist } from './lib/watchlist.js'
import { TEAMS, teamsFromMatches, mergeTeams } from './lib/teams.js'

const TABS = [
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'bracket', label: 'Bracket' },
  { id: 'calendar', label: 'Calendar' },
]

export default function App() {
  const { matches, loading, error, lastUpdated } = useMatches()
  const [favList, setFavList] = useState(getFavourites)
  const [watchList, setWatchList] = useState(getWatchlist)
  const [tab, setTab] = useState('fixtures')
  // Show onboarding when no favourites chosen yet, or when the user opts to edit.
  const [editing, setEditing] = useState(getFavourites().length === 0)

  const favourites = useMemo(() => new Set(favList), [favList])
  const watch = useMemo(() => new Set(watchList), [watchList])

  // Merge the static team seed with teams actually present in the fixtures so the
  // picker is always accurate.
  const teams = useMemo(
    () => mergeTeams(TEAMS, teamsFromMatches(matches)),
    [matches]
  )

  function saveFavourites(tlas) {
    setFavourites(tlas)
    setFavList(tlas)
    setEditing(false)
  }

  const toggleWatch = useCallback((id) => {
    setWatchList((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      saveWatchlist(next)
      return next
    })
  }, [])

  if (editing) {
    return (
      <Onboarding
        teams={teams}
        initial={favList}
        onDone={saveFavourites}
        onCancel={favList.length > 0 ? () => setEditing(false) : undefined}
      />
    )
  }

  const watchCount = watch.size
  const tabs = TABS.map((t) =>
    t.id === 'calendar' && watchCount > 0
      ? { ...t, label: `Calendar (${watchCount})` }
      : t
  )

  return (
    <div className="app">
      <Header lastUpdated={lastUpdated} onEditTeams={() => setEditing(true)} />
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

        {!loading && matches.length === 0 && !error && (
          <p className="muted empty">No fixtures available yet.</p>
        )}

        {matches.length > 0 && tab === 'fixtures' && (
          <FixtureList
            matches={matches}
            favourites={favourites}
            watch={watch}
            onToggleWatch={toggleWatch}
          />
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
    </div>
  )
}
