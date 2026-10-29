import { useEffect, useState } from 'react'
import { loadStages } from '../services/configService.js'

export function useStages(cropId, regionId) {
  const [state, setState] = useState({ status: 'idle', data: [], error: null })

  useEffect(() => {
    if (!cropId || !regionId) {
      setState({ status: 'idle', data: [], error: null })
      return undefined
    }
    let cancelled = false
    setState({ status: 'loading', data: [], error: null })
    loadStages(cropId, regionId)
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', data: [], error })
      })
    return () => {
      cancelled = true
    }
  }, [cropId, regionId])

  return state
}