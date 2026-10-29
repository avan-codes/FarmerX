import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'

export default function SavedFarmsCard({ farms, status, error, reload }) {
  if (status === 'loading') {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-between gap-2 mb-5">
          <h2 className="text-lg font-display font-semibold text-ink">Saved farms</h2>
          <LoadingState label="" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-surface-muted" />
          ))}
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-between gap-2 mb-5">
          <h2 className="text-lg font-display font-semibold text-ink">Saved farms</h2>
          <button
            type="button"
            onClick={reload}
            className="text-sm text-primary underline hover:text-primary-hover transition-colors duration-200"
          >
            Try again
          </button>
        </div>
        <ErrorState
          title="Couldn't load saved farms"
          description={error?.message || 'Please try again.'}
          onRetry={reload}
        />
      </section>
    )
  }

  if (!farms || farms.length === 0) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-between gap-2 mb-5">
          <h2 className="text-lg font-display font-semibold text-ink">Saved farms</h2>
          <Link
            to="/farms"
            className="text-sm text-primary underline hover:text-primary-hover transition-colors duration-200"
            aria-label="Add a farm"
          >
            Add your first farm
          </Link>
        </div>
        <EmptyState
          icon={Home}
          title="No saved farms yet"
          description="Saved farms will appear here. Use the Farms page to create and manage your farms."
          action={
            <Link
              to="/farms"
              className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-all duration-200"
            >
              Add farm
            </Link>
          }
        />
      </section>
    )
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
      <div className="flex items-center justify-between gap-2 mb-5">
        <h2 className="text-lg font-display font-semibold text-ink">Saved farms</h2>
        <Link
          to="/farms"
          className="text-sm text-primary underline hover:text-primary-hover transition-colors duration-200"
          aria-label="View all farms"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {farms.map((farm) => (
          <div
            key={farm.farm_id}
            className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-3 hover:bg-surface/50 transition-all duration-200"
          >
            <div className="flex shrink-0 items-center justify-center w-9 h-9 rounded-full bg-primary-soft text-primary">
              <Home className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {farm.farm_name}
              </p>
              <p className="text-xs text-ink-muted truncate">
                {farm.state || ''} {farm.district || ''}
                {farm.area ? ` · ${farm.area.value} ${farm.area.unit}` : ''}
              </p>
            </div>
            {farm.is_sample && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                Sample
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
