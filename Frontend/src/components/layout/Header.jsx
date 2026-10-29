import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Download, Menu, User, X } from 'lucide-react'
import Logo from './Logo.jsx'
import Button from '../ui/Button.jsx'
import Container from '../ui/Container.jsx'
import { allNav, mainNav, primaryCta } from '../../data/navigation.js'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

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

  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    })
    setMobileOpen(false)
  }

  return (
    <header className="header z-50">
      <Container className="flex h-[72px] items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 z-[1]">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-5 z-[1]">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link transition-colors ${isActive ? 'nav-link-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex z-[1]">
          <Link
            to="/profile"
            className="glass-panel-strong rounded-[var(--radius-md)] p-2 text-ink-muted hover:text-ink hover:shadow-medium transition-all duration-200"
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
          className="rounded-[var(--radius-md)] p-2 text-ink-muted hover:bg-surface/60 hover:text-ink md:hidden transition-colors duration-200 z-[1]"
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
            className="fixed inset-0 z-50 bg-ink/50 md:hidden backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 right-0 z-60 flex w-full max-w-sm flex-col glass-panel-strong border-l border-border shadow-xl md:hidden"
          >
            <div className="flex items-center justify-between border-b border-white/60 px-5 py-4 bg-white/60 backdrop-blur-sm">
              <Logo className="z-[1]" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-[var(--radius-md)] p-2 text-ink-muted hover:bg-white/40 hover:text-ink transition-colors duration-200 z-[1]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile primary" className="flex-1 overflow-y-auto px-3 py-4 bg-white/40 backdrop-blur-sm">
              <ul className="space-y-1">
                {allNav.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-base transition-all duration-200 border-transparent z-[1] ${
                          isActive
                            ? 'bg-primary-soft text-primary font-medium border border-primary/30'
                            : 'text-ink hover:bg-white/30 hover:text-primary border-transparent'
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
            <div className="border-t border-white/60 p-4 bg-white/40 backdrop-blur-sm">
              <Button
                as="link"
                to={primaryCta.to}
                variant="primary"
                className="w-full z-[1]"
              >
                {primaryCta.label}
              </Button>
            </div>
            {deferredPrompt && (
              <div className="border-t border-white/60 p-4 bg-white/40 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={handleInstall}
                  className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-primary/30 bg-primary-soft px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download App
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </header>
  )
}
