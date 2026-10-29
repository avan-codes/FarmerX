import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import LoadingState from '../ui/LoadingState.jsx'
import FloatingAIButton from '../../features/ai-assistant/FloatingAIButton.jsx'
import AIAssistantOverlay from '../../features/ai-assistant/AIAssistantOverlay.jsx'

export default function AppShell() {
  const [assistantOpen, setAssistantOpen] = useState(false)

  return (
    <div className="h-full flex-1 flex flex-col bg-canvas relative">
      {/* Cinematic animated background layer */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="leaf leaf-1" aria-hidden="true" />
      <div className="leaf leaf-2" aria-hidden="true" />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <main id="main" className="flex-1 min-h-0 relative">
        <Suspense fallback={<LoadingState label="Loading page…" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />

      {/* Global floating AI assistant button — visible on every route */}
      <FloatingAIButton onClick={() => setAssistantOpen(true)} />

      {/* Assistant overlay panel */}
      <AIAssistantOverlay
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  )
}
