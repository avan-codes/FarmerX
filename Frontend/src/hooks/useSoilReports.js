import { useCallback, useEffect, useState } from 'react'
import { listSoilReports, getSoilReport } from '../services/soilReports.js'

export function useSoilReports({ farmId, page, pageSize } = {}) {
  const [state, setState] = useState({
    status: 'loading',
    data: [],
    total: 0,
    error: null,
  })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, status: 'loading' }))
    listSoilReports({ farmId, page, pageSize })
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
  }, [version, farmId, page, pageSize])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const fetchOne = useCallback(async (id) => {
    const res = await getSoilReport(id)
    return res
  }, [])

  return { ...state, reload, fetchOne }
}
