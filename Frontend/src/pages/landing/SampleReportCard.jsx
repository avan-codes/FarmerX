export default function SampleReportCard() {
  const params = [
    { label: 'N', value: '240', unit: 'kg/ha' },
    { label: 'P', value: '22', unit: 'kg/ha' },
    { label: 'K', value: '180', unit: 'kg/ha' },
    { label: 'pH', value: '6.8', unit: '' },
    { label: 'OC', value: '0.52', unit: '%' },
  ]

  return (
    <div className="relative" aria-label="Sample fertilizer recommendation card">
      <div
        className="absolute inset-0 translate-x-2 translate-y-2 rounded-lg border border-border bg-surface-muted"
        aria-hidden="true"
      />
      <div className="relative rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Recommendation
          </span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
            Sample
          </span>
        </div>

        <div className="mt-3">
          <div className="font-display text-lg font-semibold text-ink">
            Wheat · Tillering
          </div>
          <div className="mt-0.5 text-sm text-ink-muted">
            1.5 acres · Punjab · 15 Jan 2025
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {params.map((p) => (
            <span
              key={p.label}
              className="inline-flex items-baseline gap-1 rounded bg-canvas px-2 py-1 text-xs"
            >
              <span className="font-medium text-ink-subtle">{p.label}</span>
              <span className="font-semibold text-ink">{p.value}</span>
              {p.unit && (
                <span className="text-[10px] text-ink-subtle">{p.unit}</span>
              )}
            </span>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-border bg-canvas p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-ink">Urea</div>
              <div className="mt-0.5 text-xs text-ink-muted">
                45 kg/acre · drill placement
              </div>
            </div>
            <div className="text-right text-xs leading-snug text-ink-muted">
              <div className="font-medium text-ink">30 DAS</div>
              <div>tillering</div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-ink-subtle">
          <span>Rule set v1.2 (illustrative)</span>
          <span>Source: demo</span>
        </div>
      </div>
    </div>
  )
}