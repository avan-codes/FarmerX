import { useState, useEffect } from 'react'
import { useAssistant } from '../../hooks/useAssistant.js'
import { formatDateTime } from '../../lib/datetime.js'
import Button from '../../components/ui/Button.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'

const MAX_MESSAGE_LENGTH = 2000

export default function AssistantChatPanel({
  recommendationId,
  open = true,
  onClose,
}) {
  const { status, data, error, ask, reload } = useAssistant(
    open ? recommendationId : null
  )
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [inputError, setInputError] = useState(null)

  const conversation = status === 'ready' ? data : null
  const messages = conversation?.messages || []
  const aiStatus = conversation?.ai_status

  useEffect(() => {
    if (recommendationId && status === 'idle') {
      reload()
    }
  }, [recommendationId, status, reload])

  const handleChange = (e) => {
    setMessage(e.target.value)
    setInputError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setInputError(null)
    const trimmed = message.trim()
    if (!trimmed) return
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setInputError(
        `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`
      )
      return
    }
    setSending(true)
    try {
      await ask({ message: trimmed, conversationId: conversation?.conversation_id })
      setMessage('')
    } catch {
      // error already surfaced by hook
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  const unavailable = aiStatus === 'unavailable'
  const blocked = aiStatus === 'guardrail_blocked' || aiStatus === 'blocked'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface p-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
            AI assistant
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Report {recommendationId?.slice(-8)}
          </span>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close assistant"
          >
            ✕
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-48">
            <LoadingState label="Loading conversation…" />
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 text-sm shadow-soft">
            <p className="text-error">{error?.message || 'Could not load conversation.'}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-3 text-xs text-primary underline hover:text-primary-hover transition-colors duration-200"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && messages.length === 0 && (
          <div className="rounded-[var(--radius-md)] border border-border bg-surface-muted p-8 text-center text-sm text-ink-muted shadow-soft">
            No conversation yet. Ask a question about this report below.
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === 'user' || msg.author === 'user'
          return (
            <div
              key={i}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}
            >
              <div
                className={`max-w-[85%] rounded-[var(--radius-md)] px-4 py-3 text-sm ${
                  isUser
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-surface border border-border text-ink shadow-soft'
                }`}
              >
                <p className="leading-relaxed">{msg.content || msg.text || ''}</p>
                {!isUser && msg.guardrail && !msg.guardrail.passed && (
                  <div className="mt-2 flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-900">
                    <span className="text-amber-800 font-semibold">Guardrail blocked</span>
                    {msg.guardrail.redactions > 0 && (
                      <span>{msg.guardrail.redactions} part(s) redacted</span>
                    )}
                  </div>
                )}
                <p className="mt-1 text-[10px] text-ink-subtle">
                  {formatDateTime(msg.created_at || msg.timestamp)}
                </p>
              </div>
            </div>
          )
        })}

        {unavailable && (
          <div className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-soft">
            The assistant is unavailable right now — your message was saved, no reply was generated.
          </div>
        )}

        {blocked && (
          <div className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-soft">
            The last reply was blocked by a safety guardrail. Some content was redacted.
          </div>
        )}

        {inputError && (
          <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-3 text-sm text-error shadow-soft">
            {inputError}
          </div>
        )}
      </div>

      <div className="border-t border-border bg-surface p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={message}
            onChange={handleChange}
            placeholder="Ask about this report…"
            rows={2}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={sending || status === 'sending'}
            className="flex-1 rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
          />
          <Button
            type="submit"
            disabled={sending || status === 'sending' || !message.trim()}
            className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-all duration-200"
          >
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </form>
        <p className="text-[10px] text-ink-subtle mt-1">
          AI explains the recommendation — it never changes fertilizer dosage.
        </p>
      </div>
    </div>
  )
}

