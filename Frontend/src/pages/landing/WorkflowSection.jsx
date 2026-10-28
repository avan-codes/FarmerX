import Container from '../../components/ui/Container.jsx'

const steps = [
  {
    title: 'Soil',
    body:
      'Enter or upload your soil-test values: N, P, K, pH, and organic carbon — with the units your lab uses.',
  },
  {
    title: 'Crop',
    body:
      'Choose your crop, state or region, farm area, current growth stage, and preferred language.',
  },
  {
    title: 'Stage',
    body:
      'FarmerX matches your inputs against a validated agronomic rule set for your crop and stage.',
  },
  {
    title: 'Recommendation',
    body:
      'Get a clear plan: what to apply, how much, when, why, and the rule-set version it came from.',
  },
]

export default function WorkflowSection() {
  return (
    <section className="border-b border-border bg-surface-muted">
      <Container className="py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Four inputs. One clear plan.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            The whole flow is designed around the question a farmer actually needs
            answered: what do I do next, with the soil I have?
          </p>
        </div>

        <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title}>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl font-semibold text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}