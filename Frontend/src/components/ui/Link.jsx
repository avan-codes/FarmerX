import { NavLink } from 'react-router-dom'

/**
 * Anchor-styled link button used inside ErrorBoundary so we keep the
 * ErrorBoundary import surface small (no react-router-dom import needed
 * there beyond what's already used).
 */
export default function Link({ to, variant = 'secondary', className = '', children }) {
  return (
    <NavLink
      to={to}
      className={() =>
        `inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none ${variant === 'primary' ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-surface text-ink border border-border-strong hover:bg-surface-muted'} ${className}`
      }
    >
      {children}
    </NavLink>
  )
}
