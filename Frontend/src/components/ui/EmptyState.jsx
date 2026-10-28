export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface px-6 py-10 text-center sm:px-10 sm:py-12 ${className}`}
    >
      {Icon && (
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}