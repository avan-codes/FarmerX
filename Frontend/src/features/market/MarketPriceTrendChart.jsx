import { useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { formatDate } from '../../lib/datetime.js'

export default function MarketPriceTrendChart({ points }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(() => {
      containerRef.current.style.height = Math.max(
        300,
        containerRef.current.clientWidth * 0.6
      ).toString() + 'px'
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  if (!points || points.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-border bg-surface-muted p-8 sm:p-10 text-center text-sm text-ink-muted shadow-soft">
        No trend data for this selection.
      </div>
    )
  }

  const data = points.map((p) => ({
    date: p.price_date,
    modal_price: Number(p.modal_price),
  }))

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-6 shadow-soft">
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-display font-semibold text-ink">
          Price trend
        </h2>
      </div>
      <div ref={containerRef} className="h-[240px] sm:h-[300px] md:h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b45309" stopOpacity="0.8" />
                <stop offset="95%" stopColor="#b45309" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e0d0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#78716c' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#78716c' }}
              formatter={(v) => `₹${v}`}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload
                  return (
                    <div className="bg-surface p-3 rounded-[var(--radius-md)] border border-border shadow-medium">
                      <p className="text-xs text-ink-muted">{formatDate(p.date)}</p>
                      <p className="text-sm font-display font-semibold text-ink">
                        ₹{p.modal_price}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="modal_price"
              stroke="#b45309"
              strokeWidth={2}
              dot={false}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
