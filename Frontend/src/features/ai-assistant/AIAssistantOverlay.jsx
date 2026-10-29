import { useState, useEffect } from 'react'
import WelcomeScreen from './WelcomeScreen.jsx'
import SimpleChatPanel from './SimpleChatPanel.jsx'

export default function AIAssistantOverlay({ isOpen, onClose }) {
  const [showWelcome, setShowWelcome] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [initialQuestion, setInitialQuestion] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      setShowWelcome(true)
      setInitialQuestion(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAskQuestion = (question) => {
    setInitialQuestion(question)
    setShowWelcome(false)
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="AI Assistant"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: independent chat drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full sm:w-[560px] bg-surface border-l border-border shadow-glass flex flex-col transform transition-transform duration-300 ease-out ${mounted ? 'translate-x-0' : 'translate-x-full'} z-[70]`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
              role="img"
              aria-label="AI Assistant"
              aria-hidden="true"
            >
              <path d="M12 5V3.5" />
              <circle cx="12" cy="2.5" r="1" />
              <rect x="4.5" y="6" width="15" height="13" rx="4" />
              <path d="M4.5 10H3" />
              <path d="M19.5 10H21" />
              <circle cx="9" cy="11.5" r="1" fill="currentColor" stroke="none" />
              <circle cx="15" cy="11.5" r="1" fill="currentColor" stroke="none" />
              <path d="M9 15h6" />
            </svg>
            <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
              AI assistant
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              FarmerX
            </span>
          </div>
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
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {showWelcome ? (
            <WelcomeScreen onAskQuestion={handleAskQuestion} />
          ) : (
            <SimpleChatPanel
              onClose={() => setShowWelcome(true)}
              initialQuestion={initialQuestion}
            />
          )}
        </div>
      </div>

      {/* Close on Escape */}
      <button type="button" onClick={onClose} className="sr-only" />
    </div>
  )
}
