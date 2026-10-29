import { Filter, RefreshCw } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'

const PAGE_SIZES = [10, 20, 50]

export function ReportFilters({ filters, onFiltersChange }) {
  const handleChange = (key, value) => {
    const next = { ...filters, [key]: value }
    if (value === '' || value === null || value === undefined) {
      delete next[key]
    }
    onFiltersChange(next)
  }

  const handleReset = () => {
    onFiltersChange({})
  }

  const activeCount = Object.keys(filters).filter(
    (k) => filters[k] !== '' && filters[k] !== null && filters[k] !== undefined
  ).length

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-7 shadow-soft">
      <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-ink-muted" aria-hidden="true" />
          <h2 className="text-base font-semibold text-ink">Filter reports</h2>
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

      <div className="grid gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
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
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Crop
          </label>
          <input
            type="text"
            placeholder="e.g. Wheat"
            value={filters.crop || ''}
            onChange={(e) => handleChange('crop', e.target.value)}
            className="field-input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Region
          </label>
          <input
            type="text"
            placeholder="e.g. Punjab"
            value={filters.region || ''}
            onChange={(e) => handleChange('region', e.target.value)}
            className="field-input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Stage
          </label>
          <input
            type="text"
            placeholder="e.g. Basal"
            value={filters.stage || ''}
            onChange={(e) => handleChange('stage', e.target.value)}
            className="field-input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Language
          </label>
          <input
            type="text"
            placeholder="e.g. en"
            value={filters.language || ''}
            onChange={(e) => handleChange('language', e.target.value)}
            className="field-input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Search
          </label>
          <input
            type="text"
            placeholder="Keyword"
            value={filters.q || ''}
            onChange={(e) => handleChange('q', e.target.value)}
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
