import { useCallback, useEffect, useState } from 'react'
import { listNews } from '../services/news.js'

export function useNews({ category, page, pageSize } = {}) {
  const [state, setState] = useState({
    status: 'loading',
    data: null,
    error: null,
  })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, status: 'loading' }))
    listNews({ category, page, pageSize })
      .then((data) => {
        if (!cancelled)
          setState({
            status: 'ready',
            data,
            error: null,
          })
      })
      .catch((error) => {
        if (!cancelled)
          setState({ status: 'error', data: null, error })
      })
    return () => {
      cancelled = true
    }
  }, [version, category, page, pageSize])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const setPage = useCallback(() => setVersion((v) => v + 1), [])
  const setCategory = useCallback(() => setVersion((v) => v + 1), [])

  return { ...state, reload, setPage, setCategory }
}
