export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <img
              src="/favicon.svg"
              alt="FarmerX logo"
              className="h-5 w-5 rounded-md"
              draggable={false}
            />
            <span className="font-display font-semibold text-ink tracking-tight">FarmerX</span>
          </div>
          <div className="flex flex-col items-start sm:items-center gap-2 sm:flex-row sm:gap-4 text-center sm:text-left">
            <p className="text-xs text-ink-subtle">
              Soil-to-plan decisions, backed by validated agronomic rules.
            </p>
            <div className="flex items-center gap-4 text-xs text-ink-subtle">
              <span>Made for Indian farmers</span>
              <span>·</span>
              <span>AI explains, rules decide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
