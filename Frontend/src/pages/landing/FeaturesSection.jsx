import {
  ClipboardList,
  FileText,
  Newspaper,
  ShieldCheck,
  Sprout,
  TrendingUp,
} from 'lucide-react'
import Container from '../../components/ui/Container.jsx'

const features = [
  {
    icon: ClipboardList,
    title: 'Soil-report management',
    description:
      'Store, review, and revisit every soil test in one place — no more digging through old PDFs.',
  },
  {
    icon: Sprout,
    title: 'Crop-specific plans',
    description:
      'Stage-wise fertilizer recommendations from validated agronomic rules, not general advisories.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent reasoning',
    description:
      'Every recommendation shows its rule-set version, source, and the reasoning behind the dose.',
  },
  {
    icon: FileText,
    title: 'Report history',
    description:
      'Search, reopen, and download past reports whenever you need to check what was applied.',
  },
  {
    icon: TrendingUp,
    title: 'Mandi market prices',
    description:
      'Recent prices from official sources, so you can check rates before buying inputs or selling produce.',
  },
  {
    icon: Newspaper,
    title: 'Agriculture news',
    description:
      'Crop, scheme, weather, and market updates from trusted publishers, with dates and source attribution.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="border-b border-border">
      <Container className="py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            What&rsquo;s inside
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Built around the decisions that matter.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            FarmerX focuses on the handful of things a farmer actually needs to
            turn soil data into action — without adding dashboards that don&rsquo;t
            help.
          </p>
        </div>

        <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-ink-subtle">
          FarmerX is being built in phases. Each page in the app shows its current
          status, and nothing is presented as available until it is.
        </p>
      </Container>
    </section>
  )
}