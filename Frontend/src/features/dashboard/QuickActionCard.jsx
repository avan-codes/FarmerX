import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

export default function QuickActionCard() {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h2 className="text-lg font-display font-semibold text-ink mb-1">
            Create a soil report
          </h2>
          <p className="text-sm text-ink-muted">
            Enter soil-test values and get a fertilizer recommendation.
          </p>
        </div>
        <Link
          to="/reports/new"
          className="rounded-[var(--radius-md)] bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-hover hover:shadow-medium transition-all duration-200"
          aria-label="Create a new soil report"
        >
          <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
          New report
        </Link>
      </div>
    </section>
  )
}
