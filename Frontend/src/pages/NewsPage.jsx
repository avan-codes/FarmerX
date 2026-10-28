import { Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function NewsPage() {
  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        eyebrow="Updates"
        title="Agriculture news"
        description="Crops, government schemes, weather, agri-tech, and markets — sourced from trusted publishers with dates and source attribution."
      />
      <div className="mt-8">
        <EmptyState
          icon={Newspaper}
          title="News arrives in Phase 4"
          description="Verified agriculture news, with category tabs and source attribution, will be implemented in Phase 4. No fabricated articles or unattributed content will be shown."
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