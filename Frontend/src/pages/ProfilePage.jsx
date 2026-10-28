import { User } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function ProfilePage() {
  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        eyebrow="Farmer profile"
        title="Your profile"
        description="Manage your preferred language, location, crops, farms and fields, and soil records."
      />
      <div className="mt-8">
        <EmptyState
          icon={User}
          title="Profile management arrives in Phase 3"
          description="Language preference, saved farms, and soil records will be managed here in Phase 3. Data persisted to your account will sync across devices — browser-local demo data will be clearly labelled."
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