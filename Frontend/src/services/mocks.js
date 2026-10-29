import {
  mockCrops,
  mockFertilizers,
  mockLanguages,
  mockRegions,
  mockRecommendationNoRule,
  mockRecommendationOk,
  mockSoilParameters,
  mockSoilReport,
  mockStagesByKey,
  mockUnits,
} from '../mocks/index.js'

export function isMockEnabled() {
  return (
    import.meta.env.VITE_APP_ENV !== 'production' &&
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('farmerx_use_mocks') === '1'
  )
}

export function getMockRecommendationVariant() {
  try {
    return localStorage.getItem('farmerx_mock_variant') || 'ok'
  } catch {
    return 'ok'
  }
}

export const mockConfig = {
  crops: mockCrops,
  regions: mockRegions,
  units: mockUnits,
  languages: mockLanguages,
  fertilizers: mockFertilizers,
  soilParameters: mockSoilParameters,
}

export function getMockStages(cropId, regionId) {
  return mockStagesByKey[`${cropId}|${regionId}`] || []
}

export function createMockSoilReport() {
  return { ...mockSoilReport, created_at: new Date().toISOString() }
}

export function createMockRecommendation(variant) {
  const base = variant === 'norule' ? mockRecommendationNoRule : mockRecommendationOk
  return { ...base, generated_at: new Date().toISOString() }
}

export function getMockRecommendationById(id) {
  if (id === mockRecommendationOk.recommendation_id) return { ...mockRecommendationOk }
  if (id === mockRecommendationNoRule.recommendation_id) return { ...mockRecommendationNoRule }
  return null
}