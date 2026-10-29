import { useCallback, useEffect, useState } from 'react'
import { getRecommendation } from '../services/recommendations.js'

export function useRecommendation(id) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!id) {
      setState({ status: 'error', data: null, error: { status: 404, message: 'Missing id.' } })
      return undefined
    }
    let cancelled = false
    setState({ status: 'loading', data: null, error: null })
    getRecommendation(id)
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', data: null, error })
      })
    return () => {
      cancelled = true
    }
  }, [id, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { ...state, reload }
}