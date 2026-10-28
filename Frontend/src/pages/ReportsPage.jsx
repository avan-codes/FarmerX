import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function ReportsPage() {
  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        eyebrow="History"
        title="Report history"
        description="Search, reopen, download, and share past soil reports."
      />
      <div className="mt-8">
        <EmptyState
          icon={FileText}
          title="Report history arrives in Phase 3"
          description="Searchable report history with filters and download/share actions will be implemented in Phase 3. You will be able to revisit every past report here."
          action={
            <Link
              to="/reports/new"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Create your first report
            </Link>
          }
        />
      </div>
    </Container>
  )
}