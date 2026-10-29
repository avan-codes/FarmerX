import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatDateTime } from '../../lib/datetime.js'

function hasTbd(value) {
  return typeof value === 'string' && value.includes('<TBD>')
}

function LocalizedName({ value, localized, lang }) {
  const display = localized?.[lang] || localized?.en || value
  if (hasTbd(display)) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-amber-800">
        <span className="text-[10px]">{localized?.en || value}</span>
        <span className="text-[9px]">not translated</span>
      </span>
    )
  }
  return <span>{display}</span>
}

function findById(collection, id) {
  if (!collection || !id) return null
  return collection.find((c) => c.id === id)
}

function StatusBadge({ status }) {
  const ok = status === 'ok'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
        ok
          ? 'bg-green-50 text-green-800'
          : 'bg-amber-50 text-amber-800'
      }`}
    >
      {ok ? 'Validated' : 'No validated rule'}
    </span>
  )
}

function SampleBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
      Sample
    </span>
  )
}

export default function ReportHistoryTable({ reports, config }) {
  const navigate = useNavigate()
  const safeReports = Array.isArray(reports) ? reports : []
  const lang = config?.languages?.[0]?.code || 'en'

  const handleRowClick = (id) => {
    navigate(`/reports/${id}`)
  }

  const cropFor = (id) => {
    if (!id) return '—'
    const c = findById(config?.crops, id)
    if (!c) return '—'
    return c.name_localized?.[lang] || c.name || '—'
  }
  const regionFor = (id) => {
    if (!id) return '—'
    const c = findById(config?.regions, id)
    return c ? c.name || '—' : '—'
  }
  const stageFor = (id) => {
    return id || '—'
  }
  const languageFor = (id) => {
    if (!id) return '—'
    const c = findById(config?.languages, id)
    return c ? c.native_name || c.name || c.code : id || '—'
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden shadow-soft">
      {/* Desktop table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr className="bg-surface-muted text-left">
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Generated
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Crop
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Region
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Stage
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Farm area
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Language
              </th>
              <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {safeReports.map((r) => {
              const area =
                r.context?.farm_area
                  ? `${r.context.farm_area.value} ${r.context.farm_area.unit}`
                  : '—'
              return (
                <tr
                  key={r.recommendation_id}
                  className="group hover:bg-surface/50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleRowClick(r.recommendation_id)}
                >
                  <td className="px-4 py-4 text-ink">
                    {formatDateTime(r.generated_at)}
                  </td>
                  <td className="px-4 py-4 text-ink-muted">
                    <LocalizedName
                      value={cropFor(r.context?.crop)}
                      localized={{
                        [lang]:
                          findById(config?.crops, r.context?.crop)
                            ?.name_localized?.[lang] || null,
                        en: findById(config?.crops, r.context?.crop)?.name,
                      }}
                      lang={r.context?.language || lang}
                    />
                  </td>
                  <td className="px-4 py-4 text-ink-muted">
                    {regionFor(r.context?.region)}
                  </td>
                  <td className="px-4 py-4 text-ink-muted">
                    {stageFor(r.context?.stage)}
                  </td>
                  <td className="px-4 py-4 text-ink-muted">{area}</td>
                  <td className="px-4 py-4 text-ink-muted">
                    {languageFor(r.context?.language)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <StatusBadge status={r.status || 'no_validated_rule'} />
                    {r.is_sample && <SampleBadge />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="hidden md:block space-y-3">
        <div className="px-4 py-3 text-right text-xs text-ink-subtle">
          Tap a row to open the report.
        </div>
        <div className="space-y-2">
          {safeReports.map((r) => (
            <div
              key={r.recommendation_id}
              className="rounded-[var(--radius-md)] border border-border bg-surface p-4 hover:bg-surface/50 cursor-pointer transition-colors duration-200"
              onClick={() => handleRowClick(r.recommendation_id)}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-sm font-semibold text-ink">
                  {formatDateTime(r.generated_at)}
                </h3>
                <div className="flex gap-1">
                  <StatusBadge status={r.status || 'no_validated_rule'} />
                  {r.is_sample && <SampleBadge />}
                </div>
              </div>
              <dl className="grid gap-x-4 gap-y-1 text-sm text-ink-muted">
                <dt className="font-semibold text-ink-subtle text-xs">Crop</dt>
                <dd className="text-ink">{cropFor(r.context?.crop)}</dd>
                <dt className="font-semibold text-ink-subtle text-xs">Region</dt>
                <dd className="text-ink">{regionFor(r.context?.region)}</dd>
                <dt className="font-semibold text-ink-subtle text-xs">Stage</dt>
                <dd className="text-ink">{stageFor(r.context?.stage)}</dd>
                <dt className="font-semibold text-ink-subtle text-xs">Area</dt>
                <dd className="text-ink">
                  {r.context?.farm_area
                    ? `${r.context.farm_area.value} ${r.context.farm_area.unit}`
                    : '—'}
                </dd>
                <dt className="font-semibold text-ink-subtle text-xs">Language</dt>
                <dd className="text-ink">
                  {languageFor(r.context?.language)}
                </dd>
              </dl>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                Open report <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="px-4 py-3 text-right text-xs text-ink-subtle">
              No reports to display.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
