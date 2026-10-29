import { formatDate } from '../../lib/datetime.js'
import StaleBadge from '../../components/ui/StaleBadge.jsx'

function formatMoney(value, unit) {
  if (value === null || value === undefined) return '—'
  return (
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value)) + (unit ? ` ${unit}` : '')
  )
}

export default function MarketPriceTable({ items }) {
  if (items.length === 0) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead>
              <tr className="bg-surface-muted text-left">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                  Commodity
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                  Market
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                  Min
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                  Max
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                  Modal
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                  Price date
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                  Source
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                  Flags
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-ink-muted sm:px-6 sm:py-10">
                  No prices match these filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden shadow-soft">
      {/* Desktop: full table */}
      <div className="overflow-x-auto sm:hidden">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr className="bg-surface-muted text-left">
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                Commodity
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                Market
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                Min
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                Max
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                Modal
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                Price date
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                Source
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle sm:px-6 sm:py-4">
                Flags
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((row) => {
              const unit = row.unit || ''
              const marketLabel = `${row.state || ''} ${row.district || ''} ${row.market || ''}`.trim() || '—'
              return (
                <tr
                  key={`${row.price_date}-${row.commodity}-${row.market || ''}-${row.min_price}-${row.max_price}-${row.modal_price}`}
                  className="group hover:bg-surface/50 transition-colors duration-200"
                >
                  <td className="px-4 py-3.5 text-ink font-medium sm:px-6 sm:py-5">
                    {row.commodity || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted sm:px-6 sm:py-5">
                    {marketLabel}
                  </td>
                  <td className="px-4 py-3.5 text-right text-ink-muted sm:px-6 sm:py-5">
                    {formatMoney(row.min_price, unit)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-ink-muted sm:px-6 sm:py-5">
                    {formatMoney(row.max_price, unit)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-ink font-medium sm:px-6 sm:py-5">
                    {formatMoney(row.modal_price, unit)}
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted sm:px-6 sm:py-5">
                    {formatDate(row.price_date)}
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted text-[10px] truncate sm:px-6 sm:py-5 sm:text-xs">
                    {row.source || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right sm:px-6 sm:py-5">
                    <div className="flex items-center justify-end gap-2">
                      {row.stale && (
                        <StaleBadge
                          label="Stale"
                          tone="stale"
                          reason={
                            row.fetched_at
                              ? `Served from cache after a feed outage — fetched ${new Date(row.fetched_at).toLocaleString()}.`
                              : 'Served from cache after a feed outage.'
                          }
                        />
                      )}
                      {row.is_sample && (
                        <StaleBadge label="Sample" tone="sample" reason="Demo data" />
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: card view */}
      <div className="hidden sm:block divide-y divide-border">
        {items.map((row) => {
          const unit = row.unit || ''
          const marketLabel = `${row.state || ''} ${row.district || ''} ${row.market || ''}`.trim() || '—'
          return (
            <div
              key={`${row.price_date}-${row.commodity}-${row.market || ''}-${row.min_price}-${row.max_price}-${row.modal_price}`}
              className="px-4 py-4 group hover:bg-surface/50 transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{row.commodity || '—'}</p>
                  <p className="text-xs text-ink-muted truncate">{marketLabel}</p>
                </div>
                <p className="text-right text-xs font-medium text-ink whitespace-nowrap">
                  {formatMoney(row.modal_price, unit)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted">
                <div className="flex flex-col gap-0.5">
                  <span className="text-ink-subtle">Min</span>
                  <span className="text-ink">{formatMoney(row.min_price, unit)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-ink-subtle">Max</span>
                  <span className="text-ink">{formatMoney(row.max_price, unit)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-ink-subtle">Date</span>
                  <span className="text-ink">{formatDate(row.price_date)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-ink-subtle">Source</span>
                  <span className="text-ink truncate">{row.source || '—'}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {row.stale && (
                  <StaleBadge
                    label="Stale"
                    tone="stale"
                    reason={
                      row.fetched_at
                        ? `Served from cache after a feed outage — fetched ${new Date(row.fetched_at).toLocaleString()}.`
                        : 'Served from cache after a feed outage.'
                    }
                  />
                )}
                {row.is_sample && (
                  <StaleBadge label="Sample" tone="sample" reason="Demo data" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
