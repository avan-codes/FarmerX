import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useRecommendations } from '../hooks/useRecommendations.js'
import Container from '../components/ui/Container.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { ReportFilters } from '../features/reports/ReportFilters.jsx'
import ReportHistoryTable from '../features/reports/ReportHistoryTable.jsx'
import { useConfig } from '../hooks/useConfig.js'

const PAGE_SIZES = [10, 20, 50]

export default function ReportsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const configState = useConfig()
  const config = configState.data

  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const {
    status,
    data,
    total,
    error,
    reload,
    setFilters: setRemoteFilters,
    filters: remoteFilters,
  } = useRecommendations(filters)

  const reports = status === 'ready' ? data : []
  const pageCount = Math.ceil(total / pageSize)

  const handleFiltersChange = (next) => {
    setFilters({ ...next, page: 1, page_size: pageSize })
    setRemoteFilters({ ...next, page: 1, page_size: pageSize })
    setPage(1)
    pushUrl({ ...next, page: 1, page_size: pageSize })
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    pushUrl({ ...remoteFilters, page: nextPage, page_size: pageSize })
    setRemoteFilters({ ...remoteFilters, page: nextPage, page_size: pageSize })
  }

  const handlePageSizeChange = (nextSize) => {
    setPageSize(nextSize)
    setPage(1)
    pushUrl({ ...remoteFilters, page: 1, page_size: nextSize })
    setRemoteFilters({ ...remoteFilters, page: 1, page_size: nextSize })
  }

  function pushUrl(next) {
    const params = new URLSearchParams(searchParams)
    for (const key of ['date_from', 'date_to', 'crop', 'region', 'stage', 'language', 'q', 'page', 'page_size']) {
      if (next[key] === '' || next[key] === null || next[key] === undefined) {
        params.delete(key)
      } else {
        params.set(key, String(next[key]))
      }
    }
    navigate(`?${params.toString()}`, { replace: true })
  }

  // NOTE: filters and remoteFilters are intentionally NOT dependencies.
  // setFilters(initFilters) creates a new object reference on every call,
  // which would feed back into this effect and cause an infinite reload loop.
  // The effect only needs to re-run when searchParams changes (URL navigation).
  useEffect(() => {
    const initFilters = {}
    for (const key of ['date_from', 'date_to', 'crop', 'region', 'stage', 'language', 'q', 'page', 'page_size']) {
      const v = searchParams.get(key)
      if (v !== null && v !== '') initFilters[key] = v
    }
    setPage(Number(initFilters.page) || 1)
    setPageSize(Number(initFilters.page_size) || 20)
    setFilters(initFilters)

    const differs =
      Object.keys(initFilters).some(
        (k) => String(initFilters[k]) !== String(filters[k] ?? '')
      ) ||
      Object.keys(filters).some((k) => !(k in initFilters))
    if (differs) {
      setRemoteFilters(initFilters)
    }
  }, [searchParams, setFilters, setRemoteFilters, setPage, setPageSize])

  if (status === 'loading') {
    return (
      <div className="page-transition bg-canvas relative z-10">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <Container className="py-10 md:py-14">
          <PageHeader
            eyebrow="Report history"
            title="Your reports"
            description="Browse and reopen past soil-test recommendations."
          />
          <div className="mt-12 flex items-center justify-center">
            <LoadingState label="Loading reports…" />
          </div>
        </Container>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="page-transition bg-canvas relative z-10">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <Container className="py-10 md:py-14">
          <PageHeader
            eyebrow="Report history"
            title="Your reports"
            description="Browse and reopen past soil-test recommendations."
          />
          <div className="mt-12 flex justify-center">
            <ErrorState
              title="Couldn't load reports"
              description={error?.message || 'Please try again.'}
              onRetry={reload}
            />
          </div>
        </Container>
      </div>
    )
  }

  const isEmpty = status === 'ready' && total === 0

  return (
    <div className="page-transition bg-canvas relative z-10">
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />

      <Container className="py-10 md:py-14">
        <PageHeader
          eyebrow="Report history"
          title="Your reports"
          description="Browse and reopen past soil-test recommendations."
        />

        <div className="mt-10">
          <ReportFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        <div className="mt-10">
          <ReportHistoryTable reports={reports} config={config} />
        </div>

        {total > 0 && pageCount > 1 && (
          <div className="mt-10 flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              Showing {reports.length} of {total} reports
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-50 disabled:pointer-events-none hover:bg-surface-muted transition-colors duration-200"
              >
                Prev
              </button>
              <span className="text-sm text-ink-muted">
                Page {page} of {pageCount}
              </span>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => handlePageChange(page + 1)}
                className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-50 disabled:pointer-events-none hover:bg-surface-muted transition-colors duration-200"
              >
                Next
              </button>
              <div className="ml-4 flex items-center gap-2">
                <span className="text-xs text-ink-subtle">Page size</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s} per page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {isEmpty && (
          <div className="mt-10 rounded-[var(--radius-lg)] border border-border bg-surface p-10 text-center shadow-soft">
            <EmptyState
              title="No reports yet"
              description="Your soil-test recommendations will appear here. Create your first report to get started."
              action={
                <a
                  href="/reports/new"
                  className="btn-primary px-5 py-3"
                >
                  Create your first report
                </a>
              }
            />
          </div>
        )}
      </Container>
    </div>
  )
}
