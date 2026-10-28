import Container from '../../components/ui/Container.jsx'

const principles = [
  {
    title: 'Dosage comes from the rule engine',
    body:
      'Fertilizer quantities are calculated by a validated agronomic rule engine. Every report shows which rule set and version was used, and which source it came from.',
  },
  {
    title: 'AI explains — it does not decide',
    body:
      'The assistant can summarise a report, rephrase a reason, and answer follow-up questions. It cannot change a dose, add a fertilizer, or invent a recommendation.',
  },
  {
    title: 'No rule, no guess',
    body:
      'If no approved rule matches your inputs, FarmerX says so plainly. It will not display a fallback dose, and it will not invent an answer.',
  },
]

export default function TrustSection() {
  return (
    <section className="border-b border-border bg-surface-muted">
      <Container className="py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Trust
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Dosage comes from rules. AI explains them.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Agricultural recommendations need to be inspectable. FarmerX is
              designed so you can see where a number came from, and so the AI
              layer can never alter it.
            </p>
          </div>

          <div className="space-y-6">
            {principles.map((p) => (
              <div
                key={p.title}
                className="border-l-2 border-primary pl-5"
              >
                <h3 className="text-base font-semibold text-ink">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}