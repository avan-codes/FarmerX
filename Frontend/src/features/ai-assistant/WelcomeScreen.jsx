import { useState } from 'react'

const SUGGESTED_QUESTIONS = [
  'What is FarmerX?',
  'How do I create a soil report?',
  'How are fertilizer recommendations calculated?',
  'What crops are supported?',
]

export default function WelcomeScreen({ onAskQuestion }) {
  const [typedQuestion, setTypedQuestion] = useState('')

  const handleSuggestedClick = (question) => {
    onAskQuestion(question)
  }

  const handleTypedSubmit = (e) => {
    e.preventDefault()
    const q = typedQuestion.trim()
    if (!q) return
    onAskQuestion(q)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col">
      {/* Welcome card centered */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface-muted p-8 md:p-12 max-w-md w-full shadow-soft">
          <h3 className="text-lg md:text-xl font-display font-semibold text-ink mb-6">
            Ask FarmerX AI
          </h3>

          <div className="space-y-3 mb-8">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSuggestedClick(q)}
                className="w-full text-left rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm text-ink hover:bg-primary-soft hover:text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {q}
              </button>
            ))}
          </div>

          <p className="text-xs text-ink-subtle mb-6">
            Or type your own question below:
          </p>

          {/* Free-text input */}
          <form onSubmit={handleTypedSubmit} className="flex gap-2 w-full">
            <input
              type="text"
              value={typedQuestion}
              onChange={(e) => setTypedQuestion(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!typedQuestion.trim()}
              className="rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-all duration-200"
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
