import { FilePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function NewReportPage() {
  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        eyebrow="New soil report"
        title="Create a soil report"
        description="Enter your soil test values and farm context. Recommendations will be calculated by the validated agronomic rule engine."
      />
      <div className="mt-8">
        <EmptyState
          icon={FilePlus}
          title="Coming in Phase 2"
          description="The soil-input form, farm and crop context, and the recommendation view will be available in Phase 2. No fertilizer dose is generated yet."
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