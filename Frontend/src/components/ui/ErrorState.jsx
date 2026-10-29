import { AlertCircle } from 'lucide-react'

export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 sm:p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-error/10 text-error mb-5">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-7 btn-secondary px-5 py-3"
        >
          Try again
        </button>
      )}
    </div>
  )
}
