export default function RuleSourceDisclosure({ source }) {
  if (!source) return null
  return (
    <details className="mt-4 border-t border-border pt-4 text-xs text-ink-muted">
      <summary className="cursor-pointer font-medium text-ink-subtle hover:text-ink transition-colors duration-200">
        Rule source & version
      </summary>
      <dl className="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-ink-subtle">Rule set: </dt>
          <dd className="inline font-mono">
            {source.rule_set_id} v{source.rule_set_version}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium text-ink-subtle">Rule: </dt>
          <dd className="inline font-mono">{source.rule_id}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="inline font-medium text-ink-subtle">Document: </dt>
          <dd className="inline">{source.document}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="inline font-medium text-ink-subtle">Publisher: </dt>
          <dd className="inline">{source.publisher}</dd>
        </div>
        {source.url && (
          <div className="sm:col-span-2">
            <dt className="inline font-medium text-ink-subtle">Reference: </dt>
            <dd className="inline">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary-hover transition-colors duration-200"
              >
                {source.url}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </details>
  )
}
