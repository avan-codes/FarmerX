import { RouterProvider } from 'react-router-dom'
import { router } from './app/router.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
