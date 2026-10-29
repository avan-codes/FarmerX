import { Link } from 'react-router-dom'
import { ArrowRight, Sun, Leaf, Droplets } from 'lucide-react'
import Container from '../../components/ui/Container.jsx'
import Button from '../../components/ui/Button.jsx'


export default function LandingPage() {
  return (
    <div className="page-transition flex flex-col bg-canvas">
      {/* Hero background imagery */}
      <div className="bg-image-hero min-h-[560px] flex flex-col items-center justify-center text-center px-4 sm:px-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* <span className="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-white/70 backdrop-blur-sm border border-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-5 inline-block">
            FarmerX · v1.0
          </span> */}
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-ink mb-4 text-balance leading-[1.15]">
            Soil to action,<br />
            grounded in science.
          </h1>
          <p className="text-lg md:text-xl text-ink-muted mb-8 max-w-xl mx-auto leading-relaxed">
            Turn soil-test values into clear, crop-specific, stage-wise
            fertilizer plans. Every recommendation comes from validated
            agronomic rules — AI only explains them.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Button
              as="a"
              href="https://www.soilhealth.dac.gov.in/soilTestingLabs"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="md"
              className="text-base px-8 py-4"
            >
              Get Your SHC (Card)
            </Button>
            <Link
              to="/reports/new"
              className="btn-accent text-base px-8 py-4"
            >
              New soil report <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Link>
            <Link
              to="/dashboard"
              className="btn-ghost text-base px-8 py-4"
            >
              View dashboard
            </Link>
          </div>
        </div>
      </div>

      <Container className="py-16 md:py-20 relative z-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] mb-5">
              <Droplets className="h-7 w-7 text-ink-muted" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-ink mb-3">Soil test</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Enter N, P, K, pH, and organic carbon from your soil report.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary mb-5">
              <Leaf className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-ink mb-3">Validated rules</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Fertilizer doses come from ICAR-backed rule sets, never from AI.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary mb-5">
              <Sun className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-ink mb-3">Stage-wise plans</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Basal, vegetative, flowering — matched to your crop and region.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-[var(--radius-xl)] border border-border bg-surface p-10 md:p-16 text-center shadow-soft relative overflow-hidden">
          <div className="absolute inset-0 bg-image-section z-[-1]" />
          <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-3 text-balance">
            Ready to begin?
          </h2>
          <p className="text-sm text-ink-muted mb-8 max-w-md mx-auto">
            Create a soil report and get a fertilizer plan in under two minutes.
          </p>
          <Link
            to="/reports/new"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-8 py-4 text-sm font-medium text-white hover:bg-primary-hover hover:shadow-medium transition-all duration-200"
          >
            New soil report <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </div>
  )
}
