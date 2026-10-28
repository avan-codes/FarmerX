import { ShieldCheck } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Container from '../../components/ui/Container.jsx'
import SampleReportCard from './SampleReportCard.jsx'

export default function HeroSection() {
  return (
    <section className="border-b border-border">
      <Container className="py-12 md:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Soil → Crop → Stage → Recommendation
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Know your soil.
              <br className="hidden sm:inline" />{' '}
              Plan your next step.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              Turn soil-test results into a clear, crop-specific fertilizer plan —
              what to apply, how much, when, and why.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as="link" to="/reports/new" variant="primary" size="lg">
                Create soil report
              </Button>
              <Button as="link" to="/reports" variant="secondary" size="lg">
                View past reports
              </Button>
            </div>
            <p className="mt-8 flex max-w-xl items-start gap-2 text-sm leading-relaxed text-ink-muted">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>
                Recommendations are calculated from validated agronomic rules. AI
                helps explain them.
              </span>
            </p>
          </div>
          <div className="lg:col-span-5">
            <SampleReportCard />
          </div>
        </div>
      </Container>
    </section>
  )
}