import { useMemo } from 'react'
import { FileText, Home, Droplets } from 'lucide-react'
import RecentReportsCard from '../features/dashboard/RecentReportsCard.jsx'
import SavedFarmsCard from '../features/dashboard/SavedFarmsCard.jsx'
import MarketSummaryCard from '../features/dashboard/MarketSummaryCard.jsx'
import NewsSummaryCard from '../features/dashboard/NewsSummaryCard.jsx'
import QuickActionCard from '../features/dashboard/QuickActionCard.jsx'
import Container from '../components/ui/Container.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useRecommendations } from '../hooks/useRecommendations.js'
import { useSoilReports } from '../hooks/useSoilReports.js'
import { useFarms } from '../hooks/useFarms.js'
import { useMarketPrices } from '../hooks/useMarketPrices.js'
import { useNews } from '../hooks/useNews.js'

export default function DashboardPage() {
  const {
    status: recStatus,
    data: recData,
    total: recTotal,
    error: recError,
    reload: reloadRecs,
  } = useRecommendations({ page_size: 5 })

  const {
    status: soilStatus,
    total: soilTotal,
  } = useSoilReports({ page: 1, pageSize: 5 })

  const {
    status: farmStatus,
    data: farmData,
    total: farmTotal,
    error: farmError,
    reload: reloadFarms,
  } = useFarms()

  const {
    status: marketStatus,
    data: marketData,
    error: marketError,
    reload: reloadMarket,
  } = useMarketPrices({ page: 1, page_size: 5 })

  const {
    status: newsStatus,
    data: newsData,
    error: newsError,
    reload: reloadNews,
  } = useNews({ page: 1, pageSize: 5 })

  const recs = recStatus === 'ready' ? recData : []
  const farms = farmStatus === 'ready' ? farmData : []

  const metrics = useMemo(() => [
    {
      label: 'Reports generated',
      value: recStatus === 'error' ? '—' : recTotal,
      icon: <FileText className="h-5 w-5" aria-hidden="true" />,
      color: 'text-primary',
      bg: 'bg-primary-soft',
    },
    {
      label: 'Soil tests saved',
      value: soilStatus === 'error' ? '—' : soilTotal,
      icon: <Droplets className="h-5 w-5" aria-hidden="true" />,
      color: 'text-accent',
      bg: 'bg-accent-soft',
    },
    {
      label: 'Farms saved',
      value: farmStatus === 'error' ? '—' : farmTotal,
      icon: <Home className="h-5 w-5" aria-hidden="true" />,
      color: 'text-primary',
      bg: 'bg-primary-soft',
    },
  ], [recStatus, recTotal, soilStatus, soilTotal, farmStatus, farmError, farmTotal])

  return (
    <div className="page-transition bg-canvas relative z-10">
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />

      <Container className="py-10 md:py-14">
        <PageHeader
          eyebrow="Dashboard"
          title="Your farm at a glance"
          description="Real records from your profile, farms, and reports. Nothing here is a placeholder."
        />

        <div className="mt-10 grid gap-4 md:gap-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-soft hover:shadow-medium transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-white border border-border shadow-soft">
                  {m.icon}
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                  {recStatus === 'loading' || soilStatus === 'loading' || farmStatus === 'loading' ? (
                    <span className="animate-pulse rounded-full bg-surface-muted w-3 h-3" />
                  ) : null}
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle mb-2">
                {m.label}
              </p>
              <p className="text-3xl font-display font-bold text-ink">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <QuickActionCard />
            <RecentReportsCard
              reports={recs}
              status={recStatus}
              error={recError}
              reload={reloadRecs}
            />
          </div>
          <div className="lg:col-span-1">
            <SavedFarmsCard
              farms={farms}
              status={farmStatus}
              error={farmError}
              reload={reloadFarms}
            />
            <MarketSummaryCard
              prices={marketData}
              status={marketStatus}
              error={marketError}
              onRefresh={reloadMarket}
            />
            <NewsSummaryCard
              news={newsData}
              status={newsStatus}
              error={newsError}
              onRefresh={reloadNews}
            />
          </div>
        </div>

        <div className="mt-12 rounded-[var(--radius-lg)] border border-border bg-surface p-8 sm:p-10 shadow-soft">
          <h2 className="text-lg font-semibold text-ink mb-4">
            All activity
          </h2>
          <p className="text-sm text-ink-muted mb-4">
            Open{' '}
            <a href="/reports" className="text-primary underline hover:text-primary-hover">
              report history
            </a>{' '}
            to browse every recommendation, or{' '}
            <a href="/farms" className="text-primary underline hover:text-primary-hover">
              manage your farms
            </a>
            .
          </p>
        </div>
      </Container>
    </div>
  )
}
