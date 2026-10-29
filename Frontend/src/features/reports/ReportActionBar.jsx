import { useState } from 'react'
import { Download, Share2, Copy, Check } from 'lucide-react'
import { downloadPdf } from '../../services/recommendations.js'

export default function ReportActionBar({ recommendationId, language }) {
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  async function handleDownload() {
    setDownloading(true)
    setError(null)
    try {
      await downloadPdf(recommendationId, language)
    } catch (err) {
      setError(err?.message || 'Could not download PDF.')
    } finally {
      setDownloading(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy the link.')
    }
  }

  async function handleShare() {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'FarmerX fertilizer recommendation',
          url: window.location.href,
        })
      } catch {
        /* user cancelled */
      }
    } else {
      await copyLink()
    }
  }

  return (
    <div className="space-y-3 sm:text-right">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-all duration-200"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {downloading ? 'Preparing…' : 'Download PDF'}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-surface/50 transition-all duration-200"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-surface/50 transition-all duration-200"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" /> Copy link
            </>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
