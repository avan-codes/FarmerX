import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createFarm,
  deleteFarm,
  listFarms,
  updateFarm,
} from '../services/farms.js'

export function useFarms() {
  const [state, setState] = useState({
    status: 'loading',
    data: [],
    total: 0,
    error: null,
  })
  const [version, setVersion] = useState(0)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    setState((s) => ({ ...s, status: 'loading' }))
    listFarms()
      .then((data) => {
        if (!cancelledRef.current)
          setState({
            status: 'ready',
            data: data.items || [],
            total: data.total ?? 0,
            error: null,
          })
      })
      .catch((error) => {
        if (!cancelledRef.current) setState({ status: 'error', data: [], total: 0, error })
      })
    return () => {
      cancelledRef.current = true
    }
  }, [version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const create = useCallback(
    async (payload) => {
      const created = await createFarm(payload)
      setState((s) => ({
        ...s,
        data: [created, ...s.data],
        total: s.total + 1,
      }))
      return created
    },
    []
  )

  const update = useCallback(
    async (id, payload) => {
      const previous = [...state.data]
      setState((s) => ({
        ...s,
        data: s.data.map((f) => (f.farm_id === id ? { ...f, ...payload } : f)),
      }))
      try {
        const updated = await updateFarm(id, payload)
        setState((s) => ({
          ...s,
          data: s.data.map((f) =>
            f.farm_id === id ? { ...f, ...updated } : f
          ),
        }))
        return updated
      } catch (error) {
        setState((s) => ({ ...s, data: previous, error }))
        throw error
      }
    },
    [state.data]
  )

  const remove = useCallback(
    async (id) => {
      const previous = [...state.data]
      setState((s) => ({
        ...s,
        data: s.data.filter((f) => f.farm_id !== id),
        total: Math.max(0, s.total - 1),
      }))
      try {
        await deleteFarm(id)
        return id
      } catch (error) {
        setState((s) => ({
          ...s,
          data: previous,
          total: previous.length,
          error,
        }))
        throw error
      }
    },
    [state.data]
  )

  return { ...state, reload, create, update, remove }
}
