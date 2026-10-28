import { AlertCircle } from 'lucide-react'

export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-red-50 text-error">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
        >
          Try again
        </button>
      )}
    </div>
  )
}