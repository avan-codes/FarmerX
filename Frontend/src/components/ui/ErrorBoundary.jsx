import { Component } from 'react'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Button from './Button.jsx'
import Link from './Link.jsx'

/**
 * Single root-level error boundary. Catches unhandled render errors anywhere
 * in the app and offers "Reload" + "Go home". Every page still owns its own
 * per-request loading/empty/error states; this is the last line of defence.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('[FarmerX ErrorBoundary] Uncaught error:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-center"
        >
          <div className="rounded-lg border border-border bg-surface p-8 sm:p-10 max-w-md w-full">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-error mb-4">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-ink mb-2">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-ink-muted mb-6">
              {this.state.error?.message ||
                'An unexpected error occurred. Reload the page or go home.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                onClick={this.handleReload}
                variant="primary"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
              >
                <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
                Reload
              </Button>
              <Link
                to="/"
                variant="secondary"
                className="rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
              >
                <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                Go home
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
