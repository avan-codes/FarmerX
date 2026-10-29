export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/favicon.svg"
        alt="FarmerX logo"
        className="h-6 w-6 rounded-md"
        draggable={false}
      />
      <span className="font-display font-semibold text-ink tracking-tight">FarmerX</span>
    </div>
  )
}
