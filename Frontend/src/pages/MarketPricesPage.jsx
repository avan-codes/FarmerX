import { TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function MarketPricesPage() {
  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        eyebrow="Mandi"
        title="Market prices"
        description="Filter by commodity, state, district, and market. Minimum, maximum, and modal prices with the source and price date shown."
      />
      <div className="mt-8">
        <EmptyState
          icon={TrendingUp}
          title="Market prices arrive in Phase 4"
          description="Live mandi prices will be integrated in Phase 4, sourced from official open-data feeds. Sample or stale prices will never be presented as current — every row will show its source and price date."
          action={
            <Link
              to="/"
              className="rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
            >
              Back to home
            </Link>
          }
        />
      </div>
    </Container>
  )
}