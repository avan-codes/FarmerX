import { Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NewsSummaryCard({
  news,
  status = 'ready',
  error,
  onRefresh,
}) {
  const hasData = news && news.total > 0
  const isEmpty = news && news.total === 0

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="text-lg font-display font-semibold text-ink">Agriculture news</h2>
        </div>
        {status === 'loading' ? (
          <span className="text-xs text-ink-muted">Loading…</span>
        ) : (
          <Link
            to="/news"
            className="text-sm text-primary underline hover:text-primary-hover transition-colors duration-200"
            aria-label="View all news"
          >
            View all
          </Link>
        )}
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-3 py-2 text-sm text-ink-muted">
          <span className="animate-pulse rounded-full bg-surface-muted w-3 h-3" />
          Fetching latest agriculture news…
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 shadow-soft">
          <p className="text-sm text-error">{error?.message || 'Could not load news.'}</p>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="mt-3 text-xs text-primary underline hover:text-primary-hover transition-colors duration-200"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {status === 'ready' && hasData && (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            Latest from{' '}
            <span className="font-medium text-ink">{news.source || 'trusted publishers'}</span>
          </p>
          <p className="text-sm font-medium text-ink">
            {news.total} article{news.total === 1 ? '' : 's'} available
          </p>
        </div>
      )}

      {status === 'ready' && !hasData && !isEmpty && (
        <div className="rounded-[var(--radius-md)] border border-border-strong bg-surface-muted p-4 shadow-soft">
          <p className="text-sm text-ink-muted">
            Agriculture news arrives in Phase 4.{' '}
            <Link to="/news" className="text-primary underline hover:text-primary-hover transition-colors duration-200">
              View agriculture news
            </Link>
          </p>
        </div>
      )}

      {status === 'ready' && isEmpty && (
        <div className="rounded-[var(--radius-md)] border border-border-strong bg-surface-muted p-4 shadow-soft">
          <p className="text-sm text-ink-muted">
            No news in this category yet.{' '}
            <Link to="/news" className="text-primary underline hover:text-primary-hover transition-colors duration-200">
              View agriculture news
            </Link>
          </p>
        </div>
      )}
    </section>
  )
}
