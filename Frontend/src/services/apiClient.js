import axios from 'axios'
import { config } from '../lib/config.js'
import { uuid } from '../lib/uuid.js'

const FARMER_ID_KEY = 'farmerx_farmer_id'

function readFarmerId() {
  try {
    return localStorage.getItem(FARMER_ID_KEY)
  } catch {
    return null
  }
}

function writeFarmerId(id) {
  try {
    localStorage.setItem(FARMER_ID_KEY, id)
  } catch {
    /* storage may be disabled */
  }
}

export function getStoredFarmerId() {
  return readFarmerId()
}

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl || undefined,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((req) => {
  if (!req.headers['X-Request-Id']) req.headers['X-Request-Id'] = uuid()
  const farmerId = readFarmerId()
  if (farmerId) req.headers['X-Farmer-Id'] = farmerId
  return req
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const response = error.response

    // Blob responses (e.g. PDF) may hide a JSON error inside the body.
    if (response?.data instanceof Blob) {
      try {
        const text = await response.data.text()
        const data = JSON.parse(text)
        return Promise.reject({
          status: response.status,
          code: data.code || 'UNKNOWN',
          title: data.title || 'Request failed',
          message: data.detail || 'Request failed',
          errors: data.errors || [],
          requestId: data.request_id || response.headers['x-request-id'] || null,
          original: error,
        })
      } catch {
        /* fall through to generic handling */
      }
    }

    if (response?.data && typeof response.data === 'object') {
      const data = response.data
      return Promise.reject({
        status: response.status,
        code: data.code || 'UNKNOWN',
        title: data.title || 'Request failed',
        message: data.detail || 'Request failed',
        errors: Array.isArray(data.errors) ? data.errors : [],
        requestId: data.request_id || response.headers?.['x-request-id'] || null,
        original: error,
      })
    }

    if (!response) {
      return Promise.reject({
        status: 0,
        code: 'NETWORK_ERROR',
        title: 'Network error',
        message:
          'Could not reach the server. Check your connection and try again.',
        errors: [],
        requestId: null,
        original: error,
      })
    }

    return Promise.reject({
      status: response.status,
      code: 'UNKNOWN',
      title: 'Request failed',
      message: `Request failed (${response.status}).`,
      errors: [],
      requestId: response.headers?.['x-request-id'] || null,
      original: error,
    })
  }
)

export async function ensureFarmerId(force = false) {
  if (!force) {
    const existing = readFarmerId()
    if (existing) return existing
  }
  const res = await apiClient.post('/auth/device')
  const id = res.data?.farmer_id
  if (id) writeFarmerId(id)
  return id
}
