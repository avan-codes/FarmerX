export default function ContextStep({
  crops,
  regions,
  areaUnits,
  languages,
  cropId,
  regionId,
  district,
  stageId,
  areaValue,
  areaUnit,
  language,
  stagesState,
  errors,
  onChange,
  onBack,
  onContinue,
}) {
  const stageDisabled = !cropId || !regionId || stagesState.status === 'loading'

  return (
    <section aria-labelledby="context-step-heading" className="space-y-6">
      <div>
        <h2 id="context-step-heading" className="text-2xl font-display font-semibold text-ink">
          Farm & crop context
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          These details determine which validated rule set is applied and how the recommendation is expressed.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="crop" className="text-sm font-medium text-ink">Crop</label>
          <select
            id="crop"
            value={cropId}
            onChange={(e) => onChange.cropId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onContinue()}
            aria-invalid={errors.crop_id ? 'true' : undefined}
            className="field-select-base"
          >
            <option value="">Select crop…</option>
            {crops.filter((c) => c.active).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.crop_id && <p className="mt-1 text-xs text-error">{errors.crop_id}</p>}
        </div>

        <div>
          <label htmlFor="region" className="text-sm font-medium text-ink">State / region</label>
          <select
            id="region"
            value={regionId}
            onChange={(e) => onChange.regionId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onContinue()}
            aria-invalid={errors.region_id ? 'true' : undefined}
            className="field-select-base"
          >
            <option value="">Select state…</option>
            {regions.filter((r) => r.active).map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {errors.region_id && <p className="mt-1 text-xs text-error">{errors.region_id}</p>}
        </div>

        <div>
          <label htmlFor="district" className="text-sm font-medium text-ink">
            District <span className="font-normal text-ink-subtle">(optional)</span>
          </label>
          <input
            id="district"
            type="text"
            placeholder="e.g. Ludhiana (optional)"
            value={district}
            onChange={(e) => onChange.district(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onContinue()}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="stage" className="text-sm font-medium text-ink">Growth stage</label>
          <select
            id="stage"
            value={stageId}
            onChange={(e) => onChange.stageId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onContinue()}
            disabled={stageDisabled}
            aria-invalid={errors.stage_id ? 'true' : undefined}
            className="field-select-base disabled:opacity-60"
          >
            <option value="">
              {stageDisabled
                ? 'Select crop and region first'
                : stagesState.status === 'ready' && stagesState.data.length === 0
                ? 'No stages configured for this combination'
                : 'Select stage…'}
            </option>
            {(Array.isArray(stagesState.data) ? stagesState.data : []).map(
              (s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              )
            )}
          </select>
          {errors.stage_id && <p className="mt-1 text-xs text-error">{errors.stage_id}</p>}
          {stagesState.status === 'error' && (
            <p className="mt-1 text-xs text-error">
              Could not load stages. {stagesState.error?.message || ''}
            </p>
          )}
          {stagesState.status === 'ready' && stagesState.data.length === 0 && (
            <p className="mt-1 text-xs text-ink-subtle">
              No growth stages are configured for this crop and state yet. Try a different combination.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="area-value" className="text-sm font-medium text-ink">Farm area</label>
          <div className="mt-1 flex gap-2">
            <input
              id="area-value"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="e.g. 1"
              value={areaValue}
              onChange={(e) => onChange.areaValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onContinue()}
              className="field-input"
            />
            <select
              aria-label="Area unit"
              value={areaUnit}
              onChange={(e) => onChange.areaUnit(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onContinue()}
              className="field-select-base"
            >
              {areaUnits.map((u) => (
                <option key={u.id} value={u.id} disabled={!u.available}>
                  {u.symbol}
                  {!u.available ? ' (unavailable)' : ''}
                </option>
              ))}
            </select>
          </div>
          {errors.area_value && <p className="mt-1 text-xs text-error">{errors.area_value}</p>}
          {errors.area_unit && <p className="mt-1 text-xs text-error">{errors.area_unit}</p>}
        </div>

        <div>
          <label htmlFor="language" className="text-sm font-medium text-ink">Preferred language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => onChange.language(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onContinue()}
            aria-invalid={errors.language ? 'true' : undefined}
            className="field-select-base"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native_name} ({l.name})
              </option>
            ))}
          </select>
          {errors.language && <p className="mt-1 text-xs text-error">{errors.language}</p>}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface/50 transition-all duration-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover hover:shadow-medium transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </section>
  )
}
