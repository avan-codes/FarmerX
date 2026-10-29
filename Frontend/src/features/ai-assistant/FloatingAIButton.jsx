import { useState } from 'react'

export default function FloatingAIButton({ onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="fixed right-6 bottom-6 z-[60] sm:right-8 sm:bottom-8">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label="Open AI Assistant"
        title="Ask FarmerX AI"
        className={`w-16 h-16 min-w-[60px] min-h-[60px] rounded-full bg-primary text-white border border-white/20 shadow-medium flex items-center justify-center transition-all duration-200 ${hovered ? 'scale-110 shadow-glass' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
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
      </button>
    </div>
  )
}
