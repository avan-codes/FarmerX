import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, User, X } from 'lucide-react'
import Logo from './Logo.jsx'
import Button from '../ui/Button.jsx'
import Container from '../ui/Container.jsx'
import { allNav, mainNav, primaryCta } from '../../data/navigation.js'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Close the mobile drawer on route change.
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Lock body scroll and support Escape while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return undefined
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = original
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-7">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/profile"
            className="rounded-md p-2 text-ink-muted hover:bg-surface-muted hover:text-ink"
            aria-label="Farmer profile"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Button as="link" to={primaryCta.to} variant="primary" size="md">
            {primaryCta.label}
          </Button>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-ink-muted hover:bg-surface-muted hover:text-ink md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </Container>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-canvas shadow-xl md:hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 text-ink-muted hover:bg-surface-muted hover:text-ink"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile primary" className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {allNav.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-md px-3 py-2.5 text-base transition-colors ${
                          isActive
                            ? 'bg-primary-soft text-primary font-medium'
                            : 'text-ink hover:bg-surface-muted'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-border p-4">
              <Button as="link" to={primaryCta.to} variant="primary" className="w-full">
                {primaryCta.label}
              </Button>
            </div>
          </aside>
        </>
      )}
    </header>
  )
}