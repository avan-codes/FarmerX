import { useCallback, useEffect, useRef, useState } from 'react'
import { getConversation, sendMessage } from '../services/assistant.js'

const MAX_MESSAGE_LENGTH = 2000

export function useAssistant(recommendationId) {
  const [state, setState] = useState({
    status: 'loading',
    data: null,
    error: null,
  })
  const [version, setVersion] = useState(0)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    if (!recommendationId) {
      setState({ status: 'error', data: null, error: { message: 'Missing recommendation id.' } })
      return undefined
    }
    setState((s) => ({ ...s, status: 'loading' }))
    getConversation(recommendationId)
      .then((data) => {
        if (!cancelledRef.current)
          setState({ status: 'ready', data, error: null })
      })
      .catch((error) => {
        if (!cancelledRef.current)
          setState({ status: 'error', data: null, error })
      })
    return () => {
      cancelledRef.current = true
    }
  }, [recommendationId, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const ask = useCallback(
    async ({ message, conversationId }) => {
      if (!message || !message.trim()) return
      if (message.length > MAX_MESSAGE_LENGTH) {
        setState((s) => ({
          ...s,
          error: {
            status: 422,
            message: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`,
          },
        }))
        return
      }
      const trimmed = message.trim()
      const previous = state.data

      setState((s) => ({
        ...s,
        status: 'sending',
        error: null,
      }))

      try {
        const updated = await sendMessage(recommendationId, {
          message: trimmed,
          conversationId,
        })
        if (!cancelledRef.current)
          setState({ status: 'ready', data: updated, error: null })
        return updated
      } catch (error) {
        if (!cancelledRef.current)
          setState((s) => ({ ...s, status: 'ready', data: previous, error }))
        throw error
      }
    },
    [recommendationId, state.data]
  )

  return { ...state, reload, ask }
}
