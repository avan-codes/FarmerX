/**
 * Shared badge for `stale` (served from cache after a feed outage) and
 * `is_sample` (demo data) flags. Used consistently across market prices
 * and news.
 *
 * @param {string} label - e.g. "Stale" or "Sample"
 * @param {string} reason - tooltip / helper text shown on hover
 * @param {'stale'|'sample'} tone - colour tone
 */
export default function StaleBadge({ label, reason, tone = 'stale' }) {
  const styles = {
    stale:
      'badge badge-warning border-transparent',
    sample:
      'badge badge-accent',
  }

  return (
    <span
      className={`${styles[tone]} max-w-fit`}
      title={reason || undefined}
    >
      {label}
    </span>
  )
}
