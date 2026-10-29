import { useRef } from 'react'

const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_BYTES = 5 * 1024 * 1024

export default function SoilStep({
  soilParameters,
  values,
  onChange,
  file,
  fileError,
  onFileChange,
  errors,
  onContinue,
}) {
  const inputRef = useRef(null)

  function handleFile(f) {
    if (!f) {
      onFileChange(null, null)
      return
    }
    if (!ACCEPTED.includes(f.type)) {
      onFileChange(null, 'Only PDF, JPEG, or PNG files are accepted.')
      return
    }
    if (f.size > MAX_BYTES) {
      onFileChange(null, 'File is larger than 5 MB.')
      return
    }
    onFileChange(f, null)
  }

  return (
    <section aria-labelledby="soil-step-heading" className="space-y-6">
      <div>
        <h2 id="soil-step-heading" className="text-2xl font-display font-semibold text-ink">
          Soil test values
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Enter the values from your soil-test report. All five values are required.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {soilParameters.map((p) => {
          const id = `soil-${p.id}`
          const err = errors[p.id]
          return (
            <div key={p.id}>
              <label htmlFor={id} className="text-sm font-medium text-ink">
                {p.label}
              </label>
              <div className="mt-1 flex items-stretch rounded-[var(--radius-md)] border border-border-strong bg-surface focus-within:border-primary">
                <input
                  id={id}
                  type="number"
                  inputMode="decimal"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={values[p.id] ?? ''}
                  onChange={(e) => onChange(p.id, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onContinue()}
                  placeholder={`e.g. ${p.min} – ${p.max} ${p.unit || ''}`.trim()}
                  aria-invalid={err ? 'true' : undefined}
                  aria-describedby={err ? `${id}-error` : undefined}
                  className="w-full rounded-l-md bg-transparent px-3 py-2 text-sm outline-none"
                />
                {p.unit && (
                  <span className="flex items-center rounded-r-md border-l border-border bg-surface-muted px-2 text-xs text-ink-muted">
                    {p.unit}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-ink-subtle">{p.helper_text}</p>
              {err && (
                <p id={`${id}-error`} className="mt-1 text-xs text-error">
                  {err}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div>
        <h3 className="text-sm font-medium text-ink">Attach soil report (optional)</h3>
        <p className="mt-1 text-xs text-ink-muted">
          PDF, JPEG, or PNG up to 5 MB. The uploaded file is stored with the soil report for your records.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            id="soil-file"
            type="file"
            accept=".pdf,image/jpeg,image/png"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-1.5 text-sm text-ink hover:bg-surface/50 transition-all duration-200"
          >
            {file ? 'Replace file' : 'Choose file'}
          </button>
          {file && (
            <span className="text-sm text-ink-muted">
              {file.name}{' '}
              <button
                type="button"
                onClick={() => handleFile(null)}
                className="ml-1 text-xs text-error hover:underline"
              >
                Remove
              </button>
            </span>
          )}
        </div>
        {fileError && <p className="mt-1 text-xs text-error">{fileError}</p>}
      </div>

      <div className="flex justify-end">
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
