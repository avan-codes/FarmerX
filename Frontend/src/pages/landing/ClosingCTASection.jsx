import Button from '../../components/ui/Button.jsx'
import Container from '../../components/ui/Container.jsx'

export default function ClosingCTASection() {
  return (
    <section>
      <Container className="py-14 md:py-20">
        <div className="grid gap-6 rounded-lg border border-border bg-surface p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-10 md:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Start with your soil test.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              Enter your values, choose your crop and stage, and get a plan you
              can act on — with the source and rule version shown clearly.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Button as="link" to="/reports/new" variant="primary" size="lg">
              Create soil report
            </Button>
            <Button as="link" to="/reports" variant="secondary" size="lg">
              View past reports
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}