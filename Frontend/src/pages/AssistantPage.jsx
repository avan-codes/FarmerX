import { MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function AssistantPage() {
  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        eyebrow="Assistant"
        title="AI assistant"
        description="Ask follow-up questions about a recommendation or about soil terms. The assistant explains; it does not change dosage."
      />
      <div className="mt-8">
        <EmptyState
          icon={MessageSquare}
          title="Assistant arrives in Phase 5"
          description="The AI assistant will explain soil terms and recommendation logic, and answer follow-up questions about a selected report. It cannot alter fertilizer quantities or invent agricultural advice."
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