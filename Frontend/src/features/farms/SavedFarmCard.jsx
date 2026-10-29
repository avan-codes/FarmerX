import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'

export default function SavedFarmCard({ farm, onEdit, onDelete }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-soft hover:shadow-medium transition-shadow duration-300 group">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center justify-center w-9 h-9 rounded-full bg-primary-soft text-primary">
            <Home className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <Link
              to={`/farms/${farm.farm_id}`}
              className="text-sm font-semibold text-ink hover:text-primary transition-colors duration-200"
            >
              {farm.farm_name}
            </Link>
            <p className="text-xs text-ink-muted truncate">
              {farm.state || ''} {farm.district || ''}{' '}
              {farm.area ? `· ${farm.area.value} ${farm.area.unit}` : ''}
            </p>
          </div>
        </div>

        {farm.is_sample && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
            Sample
          </span>
        )}

        <div className="flex items-center gap-2 md:ml-auto">
          <Button
            as="link"
            to={`/farms/${farm.farm_id}`}
            variant="ghost"
            size="sm"
            aria-label={`View ${farm.farm_name}`}
          >
            View
          </Button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onEdit(farm)
            }}
            className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface/50 transition-all duration-200"
            aria-label={`Edit ${farm.farm_name}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onDelete(farm)
            }}
            className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface/50 hover:text-error transition-all duration-200"
            aria-label={`Delete ${farm.farm_name}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
