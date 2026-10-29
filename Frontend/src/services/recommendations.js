import { apiClient } from './apiClient.js'
import {
  createMockRecommendation,
  getMockRecommendationById,
  getMockRecommendationVariant,
  isMockEnabled,
} from './mocks.js'

export async function createRecommendation(payload, idempotencyKey) {
  if (isMockEnabled()) {
    return createMockRecommendation(getMockRecommendationVariant())
  }
  const res = await apiClient.post('/recommendations', payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return res.data
}

export async function listRecommendations(filters = {}) {
  const res = await apiClient.get('/recommendations', { params: filters })
  return res.data
}

export async function getRecommendation(id) {
  if (isMockEnabled()) {
    const rec = getMockRecommendationById(id)
    if (!rec) {
      throw {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Recommendation not found.',
      }
    }
    return rec
  }
  const res = await apiClient.get(`/recommendations/${id}`)
  return res.data
}

export async function requestSummary(id) {
  if (isMockEnabled()) {
    throw {
      status: 0,
      code: 'MOCK',
      message: 'AI summary is not available in mock mode.',
    }
  }
  const res = await apiClient.post(`/recommendations/${id}/summary`)
  return res.data
}

export async function downloadPdf(id, language) {
  if (isMockEnabled()) {
    throw {
      status: 0,
      code: 'MOCK',
      message: 'PDF download is not available in mock mode.',
    }
  }
  const res = await apiClient.get(`/recommendations/${id}/pdf`, {
    params: language ? { language } : undefined,
    responseType: 'blob',
  })
  const blob = res.data
  const disposition = res.headers['content-disposition'] || ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match ? match[1] : `farmerx-${id}.pdf`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}