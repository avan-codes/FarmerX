import { apiClient } from './apiClient.js'
import {
  getMockStages,
  isMockEnabled,
  mockConfig,
} from './mocks.js'

const CACHE_TTL_MS = 10 * 60 * 1000
let cached = null
let cachedAt = 0

async function safeGet(path) {
  if (isMockEnabled()) return null
  const res = await apiClient.get(path)
  return res.data
}

function readCollection(payload, path, key) {
  const candidates = [
    payload,
    payload?.[key],
    payload?.items,
    payload?.data,
    payload?.data?.[key],
    payload?.data?.items,
  ]
  const collection = candidates.find(Array.isArray)
  if (collection) return collection
  throw new Error(`Invalid response from ${path}: expected an array of ${key}.`)
}

export async function loadConfig(force = false) {
  if (!force && cached && Date.now() - cachedAt < CACHE_TTL_MS) return cached

  if (isMockEnabled()) {
    cached = mockConfig
    cachedAt = Date.now()
    return cached
  }

  const [cropsResponse, regionsResponse, unitsResponse, languagesResponse, fertilizersResponse, soilParametersResponse] =
    await Promise.all([
      safeGet('/config/crops'),
      safeGet('/config/regions'),
      safeGet('/config/units'),
      safeGet('/config/languages'),
      safeGet('/config/fertilizers'),
      safeGet('/config/soil-parameters'),
    ])

  const crops = readCollection(cropsResponse, '/config/crops', 'crops')
  const regions = readCollection(regionsResponse, '/config/regions', 'regions')
  const units = readCollection(unitsResponse, '/config/units', 'units')
  const languages = readCollection(languagesResponse, '/config/languages', 'languages')
  const fertilizers = readCollection(fertilizersResponse, '/config/fertilizers', 'fertilizers')
  const soilParameters = readCollection(
    soilParametersResponse,
    '/config/soil-parameters',
    'soilParameters'
  )

  cached = { crops, regions, units, languages, fertilizers, soilParameters }
  cachedAt = Date.now()
  return cached
}

export async function loadStages(cropId, regionId) {
  if (!cropId || !regionId) return []
  if (isMockEnabled()) return getMockStages(cropId, regionId)
  const res = await apiClient.get('/config/stages', {
    params: { crop_id: cropId, region_id: regionId },
  })
  // All config list endpoints respond with { items, total, ... } envelopes.
  return Array.isArray(res.data) ? res.data : res.data?.items || []
}