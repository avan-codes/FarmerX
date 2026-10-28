import { Link } from 'react-router-dom'

export default function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 text-ink ${className}`}
      aria-label="FarmerX home"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 text-primary" aria-hidden="true">
        <path d="M16 28 V16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 18 C 10 18 6 14 6 8 C 12 8 16 12 16 18 Z" fill="currentColor" />
        <path d="M16 14 C 22 14 26 10 26 4 C 20 4 16 8 16 14 Z" fill="currentColor" opacity="0.65" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight">
        FarmerX
      </span>
    </Link>
  )
}