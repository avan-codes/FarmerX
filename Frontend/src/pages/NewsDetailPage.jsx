import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getNewsItem } from '../services/news.js'
import { formatDateTime } from '../lib/datetime.js'
import Container from '../components/ui/Container.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StaleBadge from '../components/ui/StaleBadge.jsx'

export default function NewsDetailPage() {
  const { newsId } = useParams()
  const [status, setStatus] = useState('loading')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!newsId) {
      setStatus('error')
      setError({ message: 'Missing news id.' })
      return
    }
    setStatus('loading')
    getNewsItem(newsId)
      .then((doc) => {
        setData(doc)
        setStatus(doc ? 'ready' : 'error')
      })
      .catch((err) => {
        setStatus('error')
        setError(err)
      })
  }, [newsId])

  if (status === 'loading') {
    return (
      <div className="page-transition bg-canvas relative z-10">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <Container className="py-10 md:py-14">
          <PageHeader eyebrow="News" title="Loading…" description="" />
          <div className="mt-12 flex items-center justify-center">
            <LoadingState label="Loading article…" />
          </div>
        </Container>
      </div>
    )
  }

  if (status === 'error' || !data) {
    return (
      <div className="page-transition bg-canvas relative z-10">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <Container className="py-10 md:py-14">
          <PageHeader eyebrow="News" title="Article not found" description="" />
          <div className="mt-12 flex justify-center">
            <ErrorState
              title="Couldn't load article"
              description={error?.message || 'The article you requested doesn\'t exist.'}
              onRetry={() => {
                setStatus('loading')
                getNewsItem(newsId)
                  .then((doc) => {
                    setData(doc)
                    setStatus(doc ? 'ready' : 'error')
                  })
                  .catch((err) => {
                    setStatus('error')
                    setError(err)
                  })
              }}
            />
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="page-transition bg-canvas relative z-10">
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />

      <Container className="py-10 md:py-14 max-w-3xl">
        <PageHeader
          eyebrow="Agriculture news"
          title={data.title || 'Untitled'}
          description={
            data.publisher && data.published_at
              ? `${data.publisher} · ${formatDateTime(data.published_at)}`
              : undefined
          }
        />

        <article className="mt-8 rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-soft">
          {data.stale && (
            <div className="mb-5 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-3 shadow-soft">
              <span className="flex items-center gap-1 text-xs text-amber-900">
                <StaleBadge label="Stale" tone="stale" reason="" />
                <span className="ml-1">Served from cache after a feed outage.</span>
              </span>
            </div>
          )}
          {data.is_sample && (
            <span className="mb-5 inline-block inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              Sample
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-ink mb-5 leading-[1.25]">
            {data.title || 'Untitled'}
          </h1>
          <div className="prose-sm text-ink leading-relaxed mb-8">
            <p className="text-base">{data.summary || 'No summary available.'}</p>
          </div>
          <div className="border-t border-border pt-7">
            <dl className="grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
              <dt className="font-medium uppercase tracking-[0.14em] text-ink-subtle text-xs">
                Publisher
              </dt>
              <dd className="text-ink">{data.publisher || '—'}</dd>
              <dt className="font-medium uppercase tracking-[0.14em] text-ink-subtle text-xs">
                Category
              </dt>
              <dd className="text-ink">{data.category || '—'}</dd>
              <dt className="font-medium uppercase tracking-[0.14em] text-ink-subtle text-xs">
                Published
              </dt>
              <dd className="text-ink">{formatDateTime(data.published_at)}</dd>
              {data.source && (
                <>
                  <dt className="font-medium uppercase tracking-[0.14em] text-ink-subtle text-xs">
                    Source
                  </dt>
                  <dd className="text-ink">{data.source}</dd>
                </>
              )}
            </dl>
          </div>
          {data.url && (
            <div className="mt-8">
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary underline hover:text-primary-hover text-sm font-medium transition-colors duration-200"
              >
                Read original article →
              </a>
            </div>
          )}
        </article>
      </Container>
    </div>
  )
}
