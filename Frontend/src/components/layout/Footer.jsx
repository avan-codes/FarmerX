import { Link } from 'react-router-dom'
import Container from '../ui/Container.jsx'
import Logo from './Logo.jsx'

const productLinks = [
  { to: '/reports/new', label: 'Create report' },
  { to: '/reports', label: 'Report history' },
  { to: '/dashboard', label: 'Dashboard' },
]

const exploreLinks = [
  { to: '/market-prices', label: 'Market prices' },
  { to: '/news', label: 'Agriculture news' },
  { to: '/assistant', label: 'AI assistant' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-surface-muted">
      <Container className="py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
              Soil values in, field-ready plans out. FarmerX turns soil reports into
              crop-specific fertilizer recommendations — with the source and rule
              version shown on every plan.
            </p>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-ink-subtle">
              FarmerX is being built in phases. Some pages in the app are not yet
              live and clearly show their status.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Product
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {productLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-ink-muted hover:text-ink hover:underline underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Explore
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {exploreLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-ink-muted hover:text-ink hover:underline underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} FarmerX. Recommendations from validated rules; AI explains only.</p>
          <p>Demo content is labeled. Live data sources are shown wherever applicable.</p>
        </div>
      </Container>
    </footer>
  )
}