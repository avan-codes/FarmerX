import { useCallback, useEffect, useState } from 'react'
import { listPrices, listCommodities } from '../services/marketPrices.js'

export function useMarketPrices(filters = {}) {
  const [state, setState] = useState({
    status: 'loading',
    data: null,
    error: null,
  })
  const [version, setVersion] = useState(0)
  const [filtersState, setFiltersState] = useState(filters)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, status: 'loading' }))
    listPrices(filtersState)
      .then((data) => {
        if (!cancelled)
          setState({ status: 'ready', data, error: null })
      })
      .catch((error) => {
        if (!cancelled)
          setState({ status: 'error', data: null, error })
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

export function useCommodities() {
  const [state, setState] = useState({
    status: 'loading',
    data: [],
    error: null,
  })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, status: 'loading' }))
    listCommodities()
      .then((data) => {
        if (!cancelled)
          setState({ status: 'ready', data: data || [], error: null })
      })
      .catch((error) => {
        if (!cancelled)
          setState({ status: 'error', data: [], error })
      })
    return () => {
      cancelled = true
    }
  }, [version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { ...state, reload }
}
