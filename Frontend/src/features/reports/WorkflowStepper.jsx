const labels = ['Soil test', 'Farm & crop', 'Review']

export default function WorkflowStepper({ current, onStepClick }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      {labels.map((label, i) => {
        const n = i + 1
        const isCurrent = n === current
        const isDone = n < current
        const clickable = n < current
        return (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <span className="text-ink-subtle">/</span>}
            <button
              type="button"
              onClick={() => clickable && onStepClick(n)}
              disabled={!clickable}
              aria-current={isCurrent ? 'step' : undefined}
              className={`inline-flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1 transition-all duration-200 ${
                isCurrent
                  ? 'bg-primary-soft text-primary font-medium border border-primary/30'
                  : isDone
                  ? 'text-ink hover:bg-surface/50'
                  : 'text-ink-subtle'
              } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                  isCurrent
                    ? 'bg-primary text-white'
                    : isDone
                    ? 'bg-primary-soft text-primary'
                    : 'bg-surface-muted text-ink-subtle'
                }`}
              >
                {n}
              </span>
              {label}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
