import { useState, useEffect } from 'react'

const MAX_MESSAGE_LENGTH = 2000

export default function SimpleChatPanel({ onClose, initialQuestion }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  // Seed with initial question if provided
  useEffect(() => {
    if (initialQuestion) {
      setMessages([
        { role: 'user', content: initialQuestion, created_at: new Date().toISOString() },
      ])
      setInput('')
    }
  }, [initialQuestion])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || sending) return

    const userMsg = { role: 'user', content: trimmed, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    // Simulated AI response — no backend required for general app questions
    const reply = getAppReply(trimmed)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, created_at: new Date().toISOString() },
      ])
      setSending(false)
    }, 800)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
            AI assistant
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            General help
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close assistant"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="rounded-[var(--radius-md)] border border-border bg-surface-muted p-8 text-center text-sm text-ink-muted shadow-soft">
            Type a question to get started.
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === 'user'
          return (
            <div
              key={i}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3 mb-2`}
            >
              <div
                className={`max-w-[85%] rounded-[var(--radius-md)] px-4 py-3 text-sm ${
                  isUser
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-surface border border-border text-ink shadow-soft'
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p className="mt-1 text-[10px] text-ink-subtle">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={sending}
            className="flex-1 rounded-[var(--radius-md)] border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-all duration-200"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
        <p className="text-[10px] text-ink-subtle mt-1 sm:mt-2">
          AI explains general info about FarmerX — it does not change fertilizer dosage.
        </p>
      </div>
    </div>
  )
}

// Simple rule-based responses for general app questions (no backend needed)
function getAppReply(question) {
  const q = question.toLowerCase()

  if (q.includes('what is farmerx') || q.includes('who are you')) {
    return "FarmerX is an AI-powered agronomic decision platform for Indian farmers. It turns soil-test values into clear, crop-specific, stage-wise fertilizer plans. Every recommendation comes from validated ICAR-backed agronomic rules — AI only explains them, it never changes the dosage."
  }

  if (q.includes('soil report') || q.includes('create a report')) {
    return "Go to the Reports section and select 'New soil report'. Enter your N, P, K, pH, and organic carbon values from your Soil Health Card, choose your crop and region, and FarmerX will generate a validated fertilizer plan."
  }

  if (q.includes('fertilizer') || q.includes('recommendation') || q.includes('dosage')) {
    return "Fertilizer recommendations are calculated using ICAR-backed validated agronomic rules based on your soil test values (N, P, K, pH, organic carbon), crop type, region, and growth stage. The AI only explains the rules — it never alters the fertilizer dosage."
  }

  if (q.includes('crop') || q.includes('supported')) {
    return "FarmerX supports major Indian crops including wheat, rice, maize, sugarcane, cotton, and more. Recommendations are matched to your crop, region, and growth stage (basal, vegetative, flowering, etc.)."
  }

  if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
    return "Hello! I'm FarmerX AI. Ask me anything about the app, soil reports, fertilizer recommendations, or supported crops."
  }

  return "I can help with questions about FarmerX — how to create soil reports, how fertilizer recommendations work, what crops are supported, and more. Try asking: 'What is FarmerX?' or 'How do I create a soil report?'"
}
