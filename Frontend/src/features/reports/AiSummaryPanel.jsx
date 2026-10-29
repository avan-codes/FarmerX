import { useState } from 'react'
import { Sparkles, AlertTriangle } from 'lucide-react'
import { requestSummary } from '../../services/recommendations.js'

export default function AiSummaryPanel({
  recommendationId,
  initialStatus,
  initialSummary,
}) {
  const [status, setStatus] = useState(initialStatus)
  const [summary, setSummary] = useState(initialSummary)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function trigger() {
    setLoading(true)
    setError(null)
    try {
      const res = await requestSummary(recommendationId)
      setStatus(res.ai_status)
      setSummary(res.ai_summary)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'pending') {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-7 shadow-soft max-w-full">
        <Header />
        <p className="mt-3 text-sm text-ink-muted">
          The AI summary has not been generated yet. The fertilizer
          recommendation above is complete — the summary only restates and
          explains it.
        </p>
        <button
          type="button"
          onClick={trigger}
          disabled={loading}
          className="mt-5 rounded-[var(--radius-md)] border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface/50 disabled:opacity-60 transition-all duration-200 w-full sm:w-auto"
        >
          {loading ? 'Generating…' : 'Generate summary'}
        </button>
        {error && (
          <p className="mt-4 text-sm text-error">
            {error.message || 'Could not reach the summariser.'}
          </p>
        )}
      </section>
    )
  }

  if (status === 'unavailable' || !summary) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-7 shadow-soft max-w-full">
        <Header />
        <p className="mt-3 text-sm text-ink-muted">
          The AI summary service is not available right now. The recommendation
          itself is unaffected. You can retry later — the summary is cached
          when generated.
        </p>
        <button
          type="button"
          onClick={trigger}
          disabled={loading}
          className="mt-5 rounded-[var(--radius-md)] border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface/50 disabled:opacity-60 transition-all duration-200 w-full sm:w-auto"
        >
          {loading ? 'Retrying…' : 'Try again'}
        </button>
      </section>
    )
  }

  const guardrailOk = summary.guardrail?.passed !== false

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-7 shadow-soft max-w-full">
      <Header />
      {!guardrailOk && (
        <div className="mt-4 flex gap-2 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-3 shadow-soft max-w-full">
          <AlertTriangle className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-sm text-amber-900">
            The safety check removed{' '}
            {summary.guardrail?.redactions ?? 'some'} part(s) of the generated
            text. This happens when the model mentions a dose that does not
            appear in the recommendation above.
          </p>
        </div>
      )}
      <p className="mt-4 text-sm leading-relaxed text-ink break-words">
        {summary.text}
      </p>
      <details className="mt-4 text-xs text-ink-subtle max-w-full">
        <summary className="cursor-pointer hover:text-ink">Provider details</summary>
        <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
          <div className="overflow-hidden">
            <dt className="inline font-medium truncate">Provider: </dt>
            <dd className="inline font-mono truncate">{summary.provider}</dd>
          </div>
          <div className="overflow-hidden">
            <dt className="inline font-medium truncate">Model: </dt>
            <dd className="inline font-mono truncate">{summary.model}</dd>
          </div>
          <div className="overflow-hidden">
            <dt className="inline font-medium truncate">Prompt: </dt>
            <dd className="inline font-mono truncate">{summary.prompt_version}</dd>
          </div>
          <div className="overflow-hidden">
            <dt className="inline font-medium truncate">Cached: </dt>
            <dd className="inline truncate">{summary.cached ? 'yes' : 'no'}</dd>
          </div>
        </dl>
      </details>
    </section>
  )
}

function Header() {
  return (
    <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 w-full">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-ink-subtle" aria-hidden="true" />
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          AI summary
        </h2>
      </div>
      <p className="text-xs text-ink-subtle text-right sm:text-left">
        Explains the plan — does not change dosage
      </p>
    </div>
  )
}
