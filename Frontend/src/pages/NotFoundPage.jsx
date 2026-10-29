import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Container from '../components/ui/Container.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function NotFoundPage() {
  return (
    <div className="page-transition bg-canvas relative z-10">
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <Container className="py-10 md:py-16 max-w-2xl">
        <PageHeader
          eyebrow="Not found"
          title="Page not found"
          description="The page you're looking for doesn't exist."
        />
        <div className="mt-12 rounded-[var(--radius-lg)] border border-border bg-surface p-10 sm:p-16 text-center shadow-soft">
          <h3 className="text-lg font-display font-semibold text-ink mb-2">
            Hmm, we cannot find that page.
          </h3>
          <p className="text-sm text-ink-muted mb-6">
            It may have been moved or the link may be outdated.
          </p>
          <Link
            to="/"
            className="rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover hover:shadow-medium transition-all duration-200"
          >
            Go home <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </div>
  )
}
