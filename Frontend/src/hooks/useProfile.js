import { useCallback, useEffect, useRef, useState } from 'react'
import { getProfile, updateProfile } from '../services/profile.js'

export function useProfile() {
  const [state, setState] = useState({
    status: 'loading',
    data: null,
    error: null,
  })
  const [version, setVersion] = useState(0)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    setState((s) => ({ ...s, status: 'loading' }))
    getProfile()
      .then((data) => {
        if (!cancelledRef.current)
          setState({ status: 'ready', data, error: null })
      })
      .catch((error) => {
        if (!cancelledRef.current) setState({ status: 'error', data: null, error })
      })
    return () => {
      cancelledRef.current = true
    }
  }, [version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const update = useCallback(
    async (changes) => {
      const previous = state.data
      setState((s) => ({
        ...s,
        data: previous ? { ...previous, ...changes } : null,
        error: null,
      }))
      try {
        const updated = await updateProfile(changes)
        if (!cancelledRef.current)
          setState({ status: 'ready', data: updated, error: null })
        return updated
      } catch (error) {
        if (!cancelledRef.current)
          setState((s) => ({
            ...s,
            status: 'error',
            data: previous,
            error,
          }))
        throw error
      }
    },
    [state.data]
  )

  return { ...state, reload, update }
}
