import { useState } from 'react'
import { useMarketPrices, useCommodities } from '../hooks/useMarketPrices.js'
import { useMarketTrend } from '../hooks/useMarketTrend.js'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { MarketPriceFilters } from '../features/market/MarketPriceFilters.jsx'
import MarketPriceTable from '../features/market/MarketPriceTable.jsx'
import MarketPriceTrendChart from '../features/market/MarketPriceTrendChart.jsx'
import StaleBadge from '../components/ui/StaleBadge.jsx'

export default function MarketPricesPage() {
  const [chartSelection, setChartSelection] = useState({
    commodity: null,
    market: null,
  })

  const {
    status,
    data,
    error,
    reload,
    setFilters: setRemoteFilters,
    filters: remoteFilters,
  } = useMarketPrices({})
  const { status: commodityStatus, data: commodities } = useCommodities()
  const trend = useMarketTrend({
    commodity: chartSelection.commodity || undefined,
    market: chartSelection.market || undefined,
  })

  const items = status === 'ready' ? data?.items || [] : []
  const total = status === 'ready' ? data?.total ?? 0 : 0
  const page = data?.page || 1
  const pageSize = data?.page_size || 20

  const showChart =
    chartSelection.commodity &&
    chartSelection.market &&
    trend.status === 'ready'

  const handleSetFilters = (next) => {
    setRemoteFilters(next)
    if (next.commodity !== undefined) {
      setChartSelection({ commodity: next.commodity || null, market: null })
    }
  }

  if (commodityStatus === 'loading') {
    return (
      <Container className="py-10 md:py-14">
        <PageHeader
          eyebrow="Market prices"
          title="Mandi prices"
          description="Real mandi prices from government feeds. Every row shows its market, date, and source."
        />
        <div className="mt-12 flex items-center justify-center">
          <LoadingState label="Loading commodities…" />
        </div>
      </Container>
    )
  }

  if (status === 'error') {
    return (
      <Container className="py-10 md:py-14">
        <PageHeader
          eyebrow="Market prices"
          title="Mandi prices"
          description="Real mandi prices from government feeds. Every row shows its market, date, and source."
        />
        <div className="mt-12 flex justify-center">
          <ErrorState
            title="Couldn't load market prices"
            description={error?.message || 'Please try again.'}
            onRetry={reload}
          />
        </div>
      </Container>
    )
  }

  const isEmpty =
    status === 'ready' && total === 0 && commodityStatus === 'ready'

  return (
    <div className="page-transition bg-canvas relative z-10">
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />

      <Container className="py-4 sm:py-6 md:py-10">
        <PageHeader
          eyebrow="Market prices"
          title="Mandi prices"
          description="Real mandi prices from government feeds. Every row shows its market, date, and source."
        />

        <div className="mt-6">
          <MarketPriceFilters
            filters={remoteFilters}
            commodities={commodityStatus === 'ready' ? commodities : []}
            onFiltersChange={handleSetFilters}
          />
        </div>

        {data && data.stale && (
          <div className="mt-4 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-3 sm:p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <StaleBadge label="Stale" tone="stale" reason="" />
              <span className="ml-1 text-sm text-amber-900">
                Prices served from cache after a feed outage.
                {data.fetched_at && (
                  <> Fetched {new Date(data.fetched_at).toLocaleString()}.</>
                )}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <MarketPriceTable items={items} />
            {total > items.length && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-[10px] sm:text-sm text-ink-muted">
                  Showing {items.length} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setRemoteFilters({ ...remoteFilters, page: page - 1 })}
                    className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink disabled:opacity-50 disabled:pointer-events-none hover:bg-surface-muted sm:px-4 sm:py-2 sm:text-sm transition-colors duration-200"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={items.length < pageSize}
                    onClick={() => setRemoteFilters({ ...remoteFilters, page: page + 1 })}
                    className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink disabled:opacity-50 disabled:pointer-events-none hover:bg-surface-muted sm:px-4 sm:py-2 sm:text-sm transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
              <div className="flex items-center justify-between gap-2 mb-5">
                <h2 className="text-base sm:text-lg font-semibold text-ink">Price trend</h2>
              </div>
              {showChart && trend.data && trend.data.points && trend.data.points.length > 0 ? (
                <MarketPriceTrendChart points={trend.data.points} />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle mb-2">
                    Select commodity and market
                  </span>
                  <p className="text-sm text-ink-muted">
                    Choose exactly one commodity and one market to see the price trend.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {isEmpty && (
          <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-10 text-center shadow-soft">
            <EmptyState
              title="No prices match these filters"
              description="Try widening the date range or clearing the market."
              action={
                <button
                  type="button"
                  onClick={() => setRemoteFilters({})}
                  className="btn-primary px-5 py-3"
                >
                  Clear all filters
                </button>
              }
            />
          </div>
        )}
      </Container>
    </div>
  )
}
