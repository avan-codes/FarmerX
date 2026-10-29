import {
  FileText,
  Droplets,
  Home,
} from 'lucide-react'

const METRICS = [
  {
    label: 'Reports generated',
    icon: FileText,
    color: 'text-primary',
    bg: 'bg-primary-soft',
  },
  {
    label: 'Soil tests saved',
    icon: Droplets,
    color: 'text-accent',
    bg: 'bg-accent-soft',
  },
  {
    label: 'Farms saved',
    icon: Home,
    color: 'text-primary',
    bg: 'bg-primary-soft',
  },
]

export default function MetricsRow({
  reportsTotal,
  soilTestsTotal,
  farmsTotal,
  reportsError,
  soilTestsError,
  farmsError,
}) {
  const values = [
    reportsError ? '—' : reportsTotal,
    soilTestsError ? '—' : soilTestsTotal,
    farmsError ? '—' : farmsTotal,
  ]

  return (
    <div className="grid gap-4 md:gap-5 md:grid-cols-3">
      {METRICS.map((m, i) => (
        <div
          key={m.label}
          className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-soft hover:shadow-medium transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-white border border-border shadow-soft">
              <m.icon className="h-5 w-5 text-ink" aria-hidden="true" />
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              {reportsError || soilTestsError || farmsError ? (
                <span className="animate-pulse rounded-full bg-surface-muted w-3 h-3" />
              ) : null}
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle mb-2">
            {m.label}
          </p>
          <p className="text-3xl font-display font-bold text-ink">
            {values[i]}
          </p>
        </div>
      ))}
    </div>
  )
}
