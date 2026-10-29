import { apiClient } from './apiClient.js'
import { createMockSoilReport, isMockEnabled } from './mocks.js'

export async function createSoilReport({ values, file, farmId }) {
  if (isMockEnabled()) return createMockSoilReport()

  // Backend expects the 'values' form field holding a JSON object:
  // { farm_id: string|null, values: { [param_id]: string } }
  const soilValues = {}
  for (const [paramId, raw] of Object.entries(values)) {
    soilValues[paramId] = String(raw ?? '')
  }

  const formData = new FormData()
  formData.append('values', JSON.stringify({ farm_id: farmId || null, values: soilValues }))
  if (file) formData.append('file', file)

  const res = await apiClient.post('/soil-reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function listSoilReports({ farmId, page, pageSize } = {}) {
  const res = await apiClient.get('/soil-reports', {
    params: { farm_id: farmId, page, page_size: pageSize },
  })
  return res.data
}

export async function getSoilReport(id) {
  const res = await apiClient.get(`/soil-reports/${id}`)
  return res.data
}