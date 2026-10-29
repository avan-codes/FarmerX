import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReportPickerList from '../features/assistant/ReportPickerList.jsx'
import AssistantChatPanel from '../features/assistant/AssistantChatPanel.jsx'
import Container from '../components/ui/Container.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function AssistantPage() {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <div className="page-transition bg-canvas relative z-10">
      <Container className="py-10 md:py-14">
        <PageHeader
          eyebrow="AI assistant"
          title="Assistant"
          description="The assistant is scoped to a single report. Pick a report below to start a conversation about it."
        />

        {!selectedId && (
          <ReportPickerList onSelect={setSelectedId} />
        )}

        {selectedId && (
          <div className="mt-8">
            <div className="flex items-center justify-between gap-3 mb-5">
              <Link
                to="/assistant"
                className="inline-flex items-center gap-1 text-sm text-primary underline hover:text-primary-hover transition-colors duration-200"
              >
                ← Back to reports
              </Link>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-sm text-ink-muted hover:text-ink transition-colors duration-200"
              >
                Pick a different report
              </button>
            </div>
            <AssistantChatPanel
              recommendationId={selectedId}
              open
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </Container>
    </div>
  )
}
