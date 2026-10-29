import { Loader2 } from 'lucide-react'

export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-ink-muted">
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
