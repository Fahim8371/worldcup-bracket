import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchMatches } from '../api/footballData.js'

// Fetches WC matches and re-polls on an interval so live scores stay fresh.
// The free tier allows 10 req/min, so 60s polling is comfortably within budget.
export function useMatches(pollMs = 60_000) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const timer = useRef(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchMatches()
      setMatches(data)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    timer.current = setInterval(load, pollMs)
    return () => clearInterval(timer.current)
  }, [load, pollMs])

  return { matches, loading, error, lastUpdated, refresh: load }
}
