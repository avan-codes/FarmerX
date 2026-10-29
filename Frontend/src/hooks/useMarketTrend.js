import { useCallback, useEffect, useState } from 'react'
import { getTrend } from '../services/marketPrices.js'

export function useMarketTrend({ commodity, market, days = 30 } = {}) {
  const [state, setState] = useState({
    status: 'idle',
    data: null,
    error: null,
  })

  const fetchTrend = useCallback(async () => {
    if (!commodity) {
      setState({ status: 'idle', data: null, error: null })
      return
    }
    setState({ status: 'loading', data: null, error: null })
    try {
      const data = await getTrend({ commodity, market, days })
      setState({ status: 'ready', data, error: null })
    } catch (error) {
      setState({ status: 'error', data: null, error })
    }
  }, [commodity, market, days])

  useEffect(() => {
    fetchTrend()
  }, [fetchTrend])

  return state
}
