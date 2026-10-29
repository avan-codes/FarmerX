import { FileText } from 'lucide-react'
import { formatDateTime } from '../../lib/datetime.js'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'
import { Link } from 'react-router-dom'

export default function RecentReportsCard({ reports, status, error, reload }) {
  if (status === 'loading') {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-between gap-2 mb-5">
          <h2 className="text-lg font-display font-semibold text-ink">Recent soil reports</h2>
          <LoadingState label="" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-surface-muted" />
          ))}
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-between gap-2 mb-5">
          <h2 className="text-lg font-display font-semibold text-ink">Recent soil reports</h2>
          <button
            type="button"
            onClick={reload}
            className="text-sm text-primary underline hover:text-primary-hover transition-colors duration-200"
          >
            Try again
          </button>
        </div>
        <ErrorState
          title="Couldn't load recent reports"
          description={error?.message || 'Please try again.'}
          onRetry={reload}
        />
      </section>
    )
  }

  if (!reports || reports.length === 0) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-between gap-2 mb-5">
          <h2 className="text-lg font-display font-semibold text-ink">Recent soil reports</h2>
          <Link
            to="/reports/new"
            className="text-sm text-primary underline hover:text-primary-hover transition-colors duration-200"
            aria-label="Create a new soil report"
          >
            Create your first report
          </Link>
        </div>
        <EmptyState
          icon={FileText}
          title="No soil reports yet"
          description="Your recent soil tests will appear here once you generate a recommendation."
          action={
            <Link
              to="/reports/new"
              className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-all duration-200"
            >
              New report
            </Link>
          }
        />
      </section>
    )
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
      <div className="flex items-center justify-between gap-2 mb-5">
        <h2 className="text-lg font-display font-semibold text-ink">Recent soil reports</h2>
        <Link
          to="/reports"
          className="text-sm text-primary underline hover:text-primary-hover transition-colors duration-200"
          aria-label="View all reports"
        >
          View all
        </Link>
      </div>
      <div className="overflow-x-auto border border-border rounded-[var(--radius-md)]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Generated
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Crop / stage
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Status
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Area
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((r) => (
              <tr
                key={r.recommendation_id}
                className="group hover:bg-surface/50 transition-colors duration-200"
              >
                <td className="py-3 text-ink">
                  {formatDateTime(r.generated_at)}
                </td>
                <td className="py-3 text-ink-muted">
                  {r.context?.crop || '—'} ·{' '}
                  {r.context?.stage || '—'}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      r.status === 'ok'
                        ? 'bg-green-50 text-green-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {r.status === 'ok' ? 'Validated' : 'No rule'}
                  </span>
                </td>
                <td className="py-3 text-right text-ink-muted">
                  {r.context?.farm_area
                    ? `${r.context.farm_area.value} ${r.context.farm_area.unit}`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
