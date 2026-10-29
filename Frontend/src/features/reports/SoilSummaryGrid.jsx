const categoryClasses = {
  low: 'bg-red-50 text-error',
  medium: 'bg-amber-50 text-accent',
  high: 'bg-emerald-50 text-success',
  unknown: 'bg-surface-muted text-ink-subtle',
}

export default function SoilSummaryGrid({ parameters }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-7 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            Soil parameters
          </h2>
          <p className="mt-0.5 text-xs text-ink-subtle">
            Categories classified server-side against soil thresholds.
          </p>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {parameters.map((p) => (
          <div
            key={p.param}
            className="rounded-[var(--radius-md)] border border-border bg-canvas p-4 hover:bg-surface/50 transition-all duration-200"
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">
              {p.param}
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-ink">
              {p.value}
              {p.unit && (
                <span className="ml-1 text-xs font-normal text-ink-subtle">
                  {p.unit}
                </span>
              )}
            </p>
            <span
              className={`mt-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                categoryClasses[p.category] || categoryClasses.unknown
              }`}
            >
              {p.category || '—'}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
