import { AlertTriangle } from 'lucide-react'
import RuleSourceDisclosure from './RuleSourceDisclosure.jsx'

function hasTbd(value) {
  return typeof value === 'string' && value.includes('<TBD>')
}

function Display({ value, fallback = '—' }) {
  if (value === null || value === undefined || value === '') return <span>{fallback}</span>
  if (hasTbd(value)) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-amber-800">
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        <span className="text-[11px]">Localized text not yet available</span>
      </span>
    )
  }
  return <span>{value}</span>
}

export default function RecommendationItemCard({ item, language }) {
  const fertName =
    item.fertilizer?.name_localized?.[language] ||
    item.fertilizer?.name ||
    item.fertilizer?.id

  const quantity = item.quantity || {}
  const breakdown = item.quantity_breakdown || {}

  return (
    <li className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-soft hover:shadow-medium transition-shadow duration-200 group">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">
            {fertName}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            <Display value={item.timing_label} fallback={item.timing} /> ·{' '}
            <Display value={item.method_label} fallback={item.method} />
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs uppercase tracking-[0.14em] text-ink-subtle">
            Quantity
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">
            <Display
              value={quantity.display}
              fallback={
                typeof quantity.value === 'number' && quantity.unit
                  ? `${quantity.value} ${quantity.unit}`
                  : '—'
              }
            />
          </p>
          <dl className="mt-3 space-y-1 text-xs text-ink-subtle">
            <div className="flex justify-end gap-3">
              <dt className="w-20">Dose per area:</dt>
              <dd className="text-right text-ink-muted">
                <Display value={breakdown.dose_per_area} />
              </dd>
            </div>
            <div className="flex justify-end gap-3">
              <dt className="w-20">Area factor:</dt>
              <dd className="text-right text-ink-muted">
                <Display value={breakdown.area_factor} />
              </dd>
            </div>
            <div className="flex justify-end gap-3">
              <dt className="w-20">Raw quantity:</dt>
              <dd className="text-right text-ink-muted">
                <Display value={breakdown.raw_quantity} />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          Why this action
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink">
          <Display value={item.reason} />
        </p>
      </div>

      {Array.isArray(item.cautions) && item.cautions.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            Cautions
          </p>
          <ul className="mt-1.5 space-y-1.5 text-sm text-ink">
            {item.cautions.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary">⚑</span>
                <span className="leading-relaxed">
                  <Display value={c} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RuleSourceDisclosure source={item.source} />
    </li>
  )
}
