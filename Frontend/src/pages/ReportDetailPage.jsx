import { FileText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function ReportDetailPage() {
  const { reportId } = useParams()
  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        eyebrow="Recommendation report"
        title={reportId ? `Report ${reportId}` : 'Report'}
        description="Soil values, fertilizer plan, application timing, method, reasons, and the rule-set source and version."
      />
      <div className="mt-8">
        <EmptyState
          icon={FileText}
          title="Report view arrives in Phase 2"
          description="The full recommendation report — including soil parameters, fertilizer rows, application method, cautions, and rule-set version — will be implemented in Phase 2."
          action={
            <Link
              to="/reports"
              className="rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
            >
              Back to report history
            </Link>
          }
        />
      </div>
    </Container>
  )
}