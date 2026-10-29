import { apiClient } from '../services/apiClient.js'

export async function listPrices(filters = {}) {
  const res = await apiClient.get('/market-prices', { params: filters })
  return res.data
}

export async function listCommodities() {
  const res = await apiClient.get('/market-prices/commodities')
  // Endpoint responds with { items, ... } envelope.
  return Array.isArray(res.data) ? res.data : res.data?.items || []
}

export async function getTrend({ commodity, market, days = 30 } = {}) {
  const res = await apiClient.get('/market-prices/trend', {
    params: { commodity, market, days },
  })
  return res.data
}
