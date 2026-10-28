import Container from '../../components/ui/Container.jsx'

const soilValues = [
  { label: 'Nitrogen (N)', value: '240 kg/ha' },
  { label: 'Phosphorus (P)', value: '22 kg/ha' },
  { label: 'Potassium (K)', value: '180 kg/ha' },
  { label: 'pH', value: '6.8' },
  { label: 'Organic carbon (OC)', value: '0.52%' },
]

const openQuestions = [
  'Which fertilizer to apply',
  'How much — and in what unit',
  'At what stage of crop growth',
  'Using which application method',
  'Why that quantity and not another',
]

export default function ProblemSection() {
  return (
    <section className="border-b border-border">
      <Container className="py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            The gap
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Your soil test has the numbers. It doesn&rsquo;t tell you what to do.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            A soil report usually gives measurements — not decisions. Between a
            lab result and a bag of fertilizer, most farmers are left to translate
            the numbers themselves.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              What your soil report gives you
            </h3>
            <dl className="mt-4 divide-y divide-border">
              {soilValues.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 py-2.5 text-sm"
                >
                  <dt className="text-ink-muted">{row.label}</dt>
                  <dd className="font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-ink-subtle">
              Example values — for illustration only.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface-muted p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              What it leaves you to figure out
            </h3>
            <ul className="mt-4 space-y-3">
              {openQuestions.map((question) => (
                <li
                  key={question}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}