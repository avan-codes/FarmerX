import { Link } from 'react-router-dom'
import { useRecommendations } from '../../hooks/useRecommendations.js'
import { formatDateTime } from '../../lib/datetime.js'
import { useConfig } from '../../hooks/useConfig.js'

function StatusBadge({ status }) {
  const ok = status === 'ok'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
        ok
          ? 'bg-green-50 text-green-800'
          : 'bg-amber-50 text-amber-800'
      }`}
    >
      {ok ? 'Validated' : 'No validated rule'}
    </span>
  )
}

export default function ReportPickerList({ onSelect }) {
  const configState = useConfig()
  const config = configState.data
  const lang = config?.languages?.[0]?.code || 'en'

  const { status, data, error, reload } = useRecommendations({
    page_size: 10,
  })

  const reports = status === 'ready' ? data : []

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
        <span className="text-sm text-ink-muted">Loading reports…</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 text-sm text-error shadow-soft">
        {error?.message || 'Could not load reports.'}
        <button
          type="button"
          onClick={reload}
          className="mt-2 text-xs text-primary underline hover:text-primary-hover transition-colors duration-200"
        >
          Try again
        </button>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center shadow-soft">
        <h3 className="text-lg font-display font-semibold text-ink mb-2">
          You do not have any reports yet
        </h3>
        <p className="text-sm text-ink-muted mb-4">
          Create a soil-test report to use the AI assistant.
        </p>
        <Link
          to="/reports/new"
          className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-all duration-200"
        >
          Create your first report
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {reports.map((r) => {
        const crop = config?.crops.find((c) => c.id === r.context?.crop)
        const region = config?.regions.find((c) => c.id === r.context?.region)
        const cropLabel =
          crop?.name_localized?.[lang] || crop?.name || r.context?.crop || '—'
        const regionLabel = region?.name || r.context?.region || '—'
        const stageLabel = r.context?.stage || '—'
        return (
          <button
            key={r.recommendation_id}
            type="button"
            onClick={() => onSelect(r.recommendation_id)}
            className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-3 hover:bg-surface/50 transition-all duration-200"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">
                {cropLabel} · {stageLabel}
              </p>
              <p className="text-xs text-ink-muted truncate">
                {regionLabel} · {formatDateTime(r.generated_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={r.status || 'no_validated_rule'} />
              {r.is_sample && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                  Sample
                </span>
              )}
            </div>
          </button>
        )
      }
    )}
      </div>
  )
}
