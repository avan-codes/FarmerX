import Button from '../components/ui/Button.jsx'
import Container from '../components/ui/Container.jsx'

export default function NotFoundPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-5xl font-semibold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. If you
          followed a link from somewhere, that page may not be built yet.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button as="link" to="/" variant="primary">
            Go home
          </Button>
          <Button as="link" to="/dashboard" variant="secondary">
            Open dashboard
          </Button>
        </div>
      </div>
    </Container>
  )
}