import { useCallback, useEffect, useState } from 'react'
import { listRecommendations } from '../services/recommendations.js'

export function useRecommendations(filters = {}) {
  const [state, setState] = useState({
    status: 'loading',
    data: [],
    total: 0,
    error: null,
  })
  const [version, setVersion] = useState(0)
  const [filtersState, setFiltersState] = useState(filters)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, status: 'loading' }))
    listRecommendations(filtersState)
      .then((data) => {
        if (!cancelled)
          setState({
            status: 'ready',
            data: data.items || [],
            total: data.total ?? 0,
            error: null,
          })
      })
      .catch((error) => {
        if (!cancelled)
          setState({ status: 'error', data: [], total: 0, error })
      })
    return () => {
      cancelled = true
    }
  }, [version, JSON.stringify(filtersState)]) // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const setFilters = useCallback((next) => {
    setFiltersState((prev) => ({ ...prev, ...next }))
    setVersion((v) => v + 1)
  }, [])

  return { ...state, reload, setFilters, filters: filtersState }
}
