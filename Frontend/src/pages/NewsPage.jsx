import { useState } from 'react'
import { useNews } from '../hooks/useNews.js'
import NewsCategoryTabs from '../features/news/NewsCategoryTabs.jsx'
import NewsCard from '../features/news/NewsCard.jsx'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

const PAGE_SIZES = [10, 20, 50]

export default function NewsPage() {
  const [category, setCategory] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { status, data, error, reload } = useNews({
    category,
    page,
    pageSize,
  })

  const items = status === 'ready' ? data?.items || [] : []
  const total = status === 'ready' ? data?.total ?? 0 : 0

  const pageCount = Math.ceil(total / pageSize)

  if (status === 'loading') {
    return (
      <div className="page-transition bg-canvas relative z-10">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <Container className="py-10 md:py-14">
          <PageHeader
            eyebrow="Agriculture news"
            title="Agriculture news"
            description="Real agriculture news from trusted publishers with full attribution."
          />
          <div className="mt-12 flex items-center justify-center">
            <LoadingState label="Loading news…" />
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
            eyebrow="Agriculture news"
            title="Agriculture news"
            description="Real agriculture news from trusted publishers with full attribution."
          />
          <div className="mt-12 flex justify-center">
            <ErrorState
              title="Couldn't load news"
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
          eyebrow="Agriculture news"
          title="Agriculture news"
          description="Real agriculture news from trusted publishers with full attribution."
        />

        <div className="mt-10">
          <NewsCategoryTabs
            activeCategory={category}
            onCategoryChange={setCategory}
          />
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.news_id} item={item} />
          ))}
          {items.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                title={isEmpty ? 'No news in this category yet.' : 'No news available yet.'}
                description="Check back later or try a different category."
              />
            </div>
          )}
        </div>

        {total > 0 && pageCount > 1 && (
          <div className="mt-10 flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              Showing {items.length} of {total} articles
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
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
                onClick={() => setPage(page + 1)}
                className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-50 disabled:pointer-events-none hover:bg-surface-muted transition-colors duration-200"
              >
                Next
              </button>
              <div className="ml-4 flex items-center gap-2">
                <span className="text-xs text-ink-subtle">Page size</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
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
      </Container>
    </div>
  )
}
