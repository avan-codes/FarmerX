import { Link, useParams } from 'react-router-dom'
import RecommendationView from '../features/reports/RecommendationView.jsx'
import Container from '../components/ui/Container.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useRecommendation } from '../hooks/useRecommendation.js'

export default function ReportDetailPage() {
  const { reportId } = useParams()
  const { status, data, error, reload } = useRecommendation(reportId)

  if (status === 'loading') {
    return (
      <div className="page-transition bg-canvas relative z-10">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <Container className="py-10 md:py-14">
          <PageHeader eyebrow="Report" title="Loading…" description="" />
          <div className="mt-12 flex items-center justify-center">
            <LoadingState label="Loading report…" />
          </div>
        </Container>
      </div>
    )
  }

  if (status === 'error' || !data) {
    return (
      <div className="page-transition bg-canvas relative z-10">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <Container className="py-10 md:py-14">
          <PageHeader eyebrow="Report" title="Report not found" description="" />
          <div className="mt-12 flex justify-center">
            <ErrorState
              title="Couldn't load report"
              description={
                error?.message ||
                'This report doesn\'t exist or isn\'t linked to your profile.'
              }
              onRetry={reload}
              action={
                <Link
                  to="/reports"
                  className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-all duration-200"
                >
                  Back to reports
                </Link>
              }
            />
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="page-transition bg-canvas relative z-10">
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />

      <Container className="py-10 md:py-14 max-w-4xl">
        <PageHeader
          eyebrow="Report"
          title="Fertilizer plan"
          description={`Generated ${data.generated_at ? new Date(data.generated_at).toLocaleString() : '—'}`}
          actions={
            <Link
              to="/reports"
              className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted transition-all duration-200"
            >
              Back to reports
            </Link>
          }
        />
        <RecommendationView rec={data} />
      </Container>
    </div>
  )
}
