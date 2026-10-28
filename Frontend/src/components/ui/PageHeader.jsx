export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1
          className={`text-3xl font-semibold tracking-tight text-ink sm:text-4xl ${
            eyebrow ? 'mt-2' : ''
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
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}