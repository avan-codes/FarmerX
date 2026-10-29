export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1
          className={`text-3xl font-bold tracking-tight text-ink sm:text-4xl ${
            eyebrow ? 'mt-1' : ''
          }`}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-3">{actions}</div>}
    </div>
  )
}
