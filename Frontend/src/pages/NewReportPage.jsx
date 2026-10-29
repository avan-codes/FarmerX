import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import NewReportFlow from '../features/reports/NewReportFlow.jsx'
import Container from '../components/ui/Container.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function NewReportPage() {
  return (
    <Container className="py-10 md:py-14 max-w-2xl">
      <PageHeader
        eyebrow="New soil report"
        title="Create a fertilizer plan"
        description="Enter your soil-test values and select your crop, region, and stage."
        actions={
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
          </Link>
        }
      />
      <NewReportFlow />
    </Container>
  )
}
