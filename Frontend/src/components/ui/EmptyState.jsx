export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border bg-surface p-8 sm:p-12 text-center ${className}`}
    >
      {Icon && (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary mb-5">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  )
}
