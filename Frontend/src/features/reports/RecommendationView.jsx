import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, MessageSquare, FlaskConical } from 'lucide-react'
import { useConfig } from '../../hooks/useConfig.js'
import { useStages } from '../../hooks/useStages.js'
import { formatDateTime } from '../../lib/datetime.js'
import SoilSummaryGrid from './SoilSummaryGrid.jsx'
import RecommendationItemCard from './RecommendationItemCard.jsx'
import AiSummaryPanel from './AiSummaryPanel.jsx'
import ReportActionBar from './ReportActionBar.jsx'
import AssistantChatPanel from '../assistant/AssistantChatPanel.jsx'

export default function RecommendationView({ rec }) {
  const configState = useConfig()
  const config = configState.data
  const lang = rec.context.language || 'en'
  const [assistantOpen, setAssistantOpen] = useState(false)

  const crop = config?.crops.find((c) => c.id === rec.context.crop)
  const region = config?.regions.find((r) => r.id === rec.context.region)
  const language = config?.languages.find((l) => l.code === lang)
  const stagesState = useStages(rec.context.crop, rec.context.region)
  const stage = stagesState.data.find((s) => s.id === rec.context.stage)

  const cropLabel =
    crop?.name_localized?.[lang] || crop?.name || rec.context.crop
  const regionLabel = region?.name || rec.context.region
  const stageLabel =
    stage?.name_localized?.[lang] || stage?.name || rec.context.stage
  const languageLabel = language?.native_name || lang

  return (
    <article className="space-y-6 relative">
      <header className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {rec.is_sample && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                Sample
              </span>
            )}
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Recommendation report
            </p>
            <h1 className="mt-1 text-3xl font-display font-bold tracking-tight text-ink sm:text-4xl">
              Fertilizer plan
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Generated {formatDateTime(rec.generated_at)}
            </p>
          </div>
          <ReportActionBar
            recommendationId={rec.recommendation_id}
            language={lang}
          />
        </div>
      </header>

      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-7 shadow-soft">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle mb-4">
          Context
        </h2>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <Ctx label="Crop" value={cropLabel} />
          <Ctx label="Region" value={regionLabel} />
          <Ctx label="Stage" value={stageLabel} />
          <Ctx
            label="Farm area"
            value={`${rec.context.farm_area.value} ${rec.context.farm_area.unit}`}
          />
          <Ctx label="Language" value={languageLabel} />
        </dl>
      </section>

      <SoilSummaryGrid parameters={rec.soil_parameters} />

      {rec.status === 'no_validated_rule' ? (
        <section
          role="status"
          className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-6 sm:p-8 shadow-soft relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-image-card z-[-1]" />
          <div className="relative z-10 flex gap-3">
            <ShieldAlert className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-display font-semibold text-ink">
                No validated recommendation available
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {rec.message ||
                  'No validated recommendation is available for these inputs yet. No fertilizer dose has been generated.'}
              </p>
              {Array.isArray(rec.missing) && rec.missing.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                    Missing rule coverage
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {rec.missing.map((m, i) => (
                      <li key={`${m.crop}-${m.region}-${m.stage}-${i}`}>
                        Crop <code>{m.crop}</code>, region{' '}
                        <code>{m.region}</code>, stage <code>{m.stage}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <>
          <section>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-display font-semibold tracking-tight text-ink">
                Fertilizer recommendations
              </h2>
              <p className="text-xs text-ink-subtle">
                {rec.items.length}{' '}
                {rec.items.length === 1 ? 'action' : 'actions'}
              </p>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              Every quantity below comes from the validated rule engine. AI does
              not modify dosage.
            </p>
            <ol className="mt-5 space-y-4">
              {rec.items.map((item) => (
                <RecommendationItemCard
                  key={item.action_id}
                  item={item}
                  language={lang}
                />
              ))}
            </ol>
          </section>

          <AiSummaryPanel
            recommendationId={rec.recommendation_id}
            initialStatus={rec.ai_status}
            initialSummary={rec.ai_summary}
          />
        </>
      )}

      <section className="mt-8 rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-7 shadow-soft">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              Ask about this report
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setAssistantOpen(true)}
            className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface/50 hover:text-primary transition-all duration-200"
          >
            Open assistant
          </button>
        </div>
        <p className="text-xs text-ink-muted mb-0">
          Ask questions about this specific fertilizer recommendation. The
          assistant can only see this report — it is not a general Q&A tool.
        </p>
        <AssistantChatPanel
          recommendationId={rec.recommendation_id}
          open={assistantOpen}
          onClose={() => setAssistantOpen(false)}
        />
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border bg-surface-muted p-5 sm:p-7 shadow-soft">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-ink-subtle" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            Provenance
          </h2>
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
          <Ctx label="Engine version" value={rec.engine_version} mono />
          <Ctx label="Input hash" value={rec.input_hash} mono />
          <Ctx
            label="Recommendation ID"
            value={rec.recommendation_id}
            mono
          />
        </dl>
      </section>

      <p className="text-xs leading-relaxed text-ink-subtle">{rec.disclaimer}</p>
    </article>
  )
}

function Ctx({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm text-ink ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value || '—'}
      </dd>
    </div>
  )
}
