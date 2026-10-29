import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/datetime.js'
import StaleBadge from '../../components/ui/StaleBadge.jsx'

export default function NewsCard({ item }) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-6 shadow-soft hover:shadow-medium transition-shadow duration-300 group">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1">
          <StaleBadge
            label={item.stale ? 'Stale' : 'Recent'}
            tone="stale"
            reason={
              item.stale
                ? 'Served from cache after a feed outage.'
                : 'Freshly ingested.'
            }
          />
          {item.is_sample && (
            <StaleBadge label="Sample" tone="sample" reason="Demo data" />
          )}
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
          {item.category || 'general'}
        </span>
      </div>
      <h3 className="text-base sm:text-lg font-display font-semibold text-ink mb-2.5 line-clamp-2 group-hover:text-primary transition-colors duration-200">
        <Link to={`/news/${item.news_id}`} className="text-ink hover:no-underline">
          {item.title}
        </Link>
      </h3>
      <p className="text-sm text-ink-muted mb-4 line-clamp-2">
        {item.summary || '—'}
      </p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
        <span>
          {item.publisher || '—'} · {formatDate(item.published_at)}
        </span>
        <Link
          to={`/news/${item.news_id}`}
          className="text-primary underline hover:text-primary-hover"
          aria-label={`Read ${item.title}`}
        >
          Read
        </Link>
      </div>
    </article>
  )
}
