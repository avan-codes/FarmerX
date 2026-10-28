import { LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function DashboardPage() {
  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Quick actions, recent soil reports, saved farms, and summaries of market prices and agricultural news."
      />
      <div className="mt-8">
        <EmptyState
          icon={LayoutDashboard}
          title="Coming in Phase 3"
          description="The dashboard will bring together your recent reports, saved farms, and the latest market and news summaries — each clearly labelled with source and date. Until then, you can still start a new soil report."
          action={
            <Link
              to="/reports/new"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Create soil report
            </Link>
          }
        />
      </div>
    </Container>
  )
}