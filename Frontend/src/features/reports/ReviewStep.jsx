export default function ReviewStep({
  soilParameters,
  values,
  crops,
  regions,
  stages,
  languages,
  areaUnits,
  file,
  cropId,
  regionId,
  stageId,
  areaValue,
  areaUnit,
  language,
  submitting,
  submitError,
  onBack,
  onSubmit,
  onEditStep,
}) {
  const crop = crops.find((c) => c.id === cropId)
  const region = regions.find((r) => r.id === regionId)
  const stage = stages.find((s) => s.id === stageId)
  const unit = areaUnits.find((u) => u.id === areaUnit)
  const lang = languages.find((l) => l.code === language)

  return (
    <section aria-labelledby="review-step-heading" className="space-y-6">
      <div>
        <h2 id="review-step-heading" className="text-2xl font-display font-semibold text-ink">
          Review and generate
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Confirm what will be submitted. Quantities will be calculated by the validated rule engine — not here.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Soil values</h3>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs text-primary hover:underline transition-colors duration-200"
            >
              Edit
            </button>
          </div>
          <dl className="mt-3 divide-y divide-border">
            {soilParameters.map((p) => (
              <div key={p.id} className="flex justify-between py-1.5 text-sm">
                <dt className="text-ink-muted">{p.label}</dt>
                <dd className="font-medium text-ink">
                  {values[p.id]} {p.unit}
                </dd>
              </div>
            ))}
          </dl>
          {file && (
            <p className="mt-3 text-xs text-ink-subtle">
              Attached: <span className="text-ink">{file.name}</span>
            </p>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Farm & crop</h3>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs text-primary hover:underline transition-colors duration-200"
            >
              Edit
            </button>
          </div>
          <dl className="mt-3 divide-y divide-border">
            <Row label="Crop" value={crop?.name} />
            <Row label="State" value={region?.name} />
            <Row label="Stage" value={stage?.name} />
            <Row label="Area" value={`${areaValue} ${unit?.symbol || ''}`} />
            <Row label="Language" value={lang ? `${lang.native_name} (${lang.name})` : ''} />
          </dl>
        </div>
      </div>

      {submitError && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-error shadow-soft"
        >
          <p className="font-medium">{submitError.title || 'Submission failed'}</p>
          <p className="mt-1">{submitError.message}</p>
          {submitError.requestId && (
            <p className="mt-1 text-xs text-ink-subtle">
              Request ID: <code>{submitError.requestId}</code>
            </p>
          )}
          {Array.isArray(submitError.errors) && submitError.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs">
              {submitError.errors.map((e, i) => (
                <li key={`${e.field}-${i}`}>
                  {e.field}: {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface/50 disabled:opacity-60 transition-all duration-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover hover:shadow-medium disabled:opacity-60 transition-all duration-200"
        >
          {submitting ? 'Generating…' : 'Generate recommendation'}
        </button>
      </div>
    </section>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value || '—'}</dd>
    </div>
  )
}
