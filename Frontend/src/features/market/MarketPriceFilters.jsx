import { useEffect } from 'react'
import { Filter, RefreshCw } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'

const PAGE_SIZES = [10, 20, 50]

export function MarketPriceFilters({ filters, commodities, onFiltersChange }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const urlFilters = {}
    for (const key of [
      'commodity', 'state', 'district', 'market', 'date_from', 'date_to',
      'page', 'page_size',
    ]) {
      const v = searchParams.get(key)
      if (v !== null && v !== '') urlFilters[key] = v
    }
    onFiltersChange(urlFilters)
  }, [])

  const handleChange = (key, value) => {
    const next = { ...filters, [key]: value }
    if (value === '' || value === null || value === undefined) {
      delete next[key]
    }
    onFiltersChange(next)
    const params = new URLSearchParams(searchParams)
    if (value === '' || value === null || value === undefined) {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
    navigate(`?${params.toString()}`, { replace: true })
  }

  const handleReset = () => {
    onFiltersChange({})
    navigate('?', { replace: true })
  }

  const activeCount = Object.keys(filters).filter(
    (k) => filters[k] !== '' && filters[k] !== null && filters[k] !== undefined
  ).length

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-ink-muted" aria-hidden="true" />
          <h2 className="text-base font-display font-semibold text-ink">Filter mandi prices</h2>
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-error hover:bg-red-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Commodity
          </label>
          <select
            value={filters.commodity || ''}
            onChange={(e) => handleChange('commodity', e.target.value)}
            className="field-select-base"
          >
            <option value="">All commodities</option>
            {(Array.isArray(commodities) ? commodities : []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            State
          </label>
          <input
            type="text"
            placeholder="e.g. Uttar Pradesh"
            value={filters.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            className="field-input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            District
          </label>
          <input
            type="text"
            placeholder="e.g. Moradabad"
            value={filters.district || ''}
            onChange={(e) => handleChange('district', e.target.value)}
            className="field-input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Market
          </label>
          <input
            type="text"
            placeholder="e.g. APMC"
            value={filters.market || ''}
            onChange={(e) => handleChange('market', e.target.value)}
            className="field-input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            From date
          </label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => handleChange('date_from', e.target.value)}
            className="field-input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            To date
          </label>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => handleChange('date_to', e.target.value)}
            className="field-input"
          />
        </div>
        <div className="space-y-2 flex flex-col sm:flex-row sm:items-end">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Page size
          </label>
          <select
            value={filters.page_size || '20'}
            onChange={(e) => handleChange('page_size', e.target.value)}
            className="field-select-base"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} per page
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
