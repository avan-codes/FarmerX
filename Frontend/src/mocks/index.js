// Mock fixtures. Only used when VITE_APP_ENV !== 'production' and
// localStorage.farmerx_use_mocks === '1'. See README.

export const mockCrops = [
  { id: 'crop_wheat', name: 'Wheat', name_localized: { en: 'Wheat', hi: 'गेहूं' }, active: true },
  { id: 'crop_rice', name: 'Rice', name_localized: { en: 'Rice', hi: 'चावल' }, active: true },
]

export const mockRegions = [
  { id: 'reg_up', name: 'Uttar Pradesh', state: 'Uttar Pradesh', active: true },
  { id: 'reg_mh', name: 'Maharashtra', state: 'Maharashtra', active: true },
]

export const mockUnits = [
  { id: 'acre', symbol: 'acre', kind: 'area', factor_to_base: 4046.86, region_scoped: false, available: true },
  { id: 'hectare', symbol: 'ha', kind: 'area', factor_to_base: 10000, region_scoped: false, available: true },
  { id: 'bigha', symbol: 'bigha', kind: 'area', factor_to_base: null, region_scoped: true, available: false },
]

export const mockLanguages = [
  { code: 'en', name: 'English', native_name: 'English', rtl: false },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', rtl: false },
  { code: 'bn', name: 'Bengali', native_name: 'বাংলা', rtl: false },
  { code: 'mr', name: 'Marathi', native_name: 'मराठी', rtl: false },
  { code: 'pa', name: 'Punjabi', native_name: 'ਪੰਜਾਬੀ', rtl: false },
  { code: 'ta', name: 'Tamil', native_name: 'தமிழ்', rtl: false },
  { code: 'te', name: 'Telugu', native_name: 'తెలుగు', rtl: false },
]

export const mockFertilizers = [
  { id: 'fert_urea', name: 'Urea', name_localized: { en: 'Urea', hi: 'यूरिया' }, kind: 'nitrogenous' },
  { id: 'fert_dap', name: 'DAP', name_localized: { en: 'DAP' }, kind: 'complex' },
  { id: 'fert_mop', name: 'MOP', name_localized: { en: 'MOP' }, kind: 'potassic' },
]

export const mockSoilParameters = [
  { id: 'N', label: 'Nitrogen (N)', label_localized: { en: 'Nitrogen (N)' }, unit: 'kg/ha', min: 0, max: 1000, step: 1, helper_text: 'From your soil test report.' },
  { id: 'P', label: 'Phosphorus (P)', label_localized: { en: 'Phosphorus (P)' }, unit: 'kg/ha', min: 0, max: 1000, step: 1, helper_text: 'From your soil test report.' },
  { id: 'K', label: 'Potassium (K)', label_localized: { en: 'Potassium (K)' }, unit: 'kg/ha', min: 0, max: 1000, step: 1, helper_text: 'From your soil test report.' },
  { id: 'pH', label: 'Soil pH', label_localized: { en: 'Soil pH' }, unit: '', min: 0, max: 14, step: 0.1, helper_text: '0–14 scale.' },
  { id: 'OC', label: 'Organic Carbon (OC)', label_localized: { en: 'Organic Carbon (OC)' }, unit: '%', min: 0, max: 100, step: 0.01, helper_text: 'Percentage from your report.' },
]

export const mockStagesByKey = {
  'crop_wheat|reg_up': [
    { id: 'stage_basal', name: 'Basal / Pre-sowing', name_localized: { en: 'Basal / Pre-sowing' }, order: 1 },
    { id: 'stage_vegetative', name: 'Vegetative', name_localized: { en: 'Vegetative' }, order: 2 },
    { id: 'stage_flowering', name: 'Flowering', name_localized: { en: 'Flowering' }, order: 3 },
  ],
  'crop_rice|reg_up': [
    { id: 'stage_basal', name: 'Basal / Pre-sowing', name_localized: { en: 'Basal / Pre-sowing' }, order: 1 },
    { id: 'stage_vegetative', name: 'Vegetative', name_localized: { en: 'Vegetative' }, order: 2 },
  ],
}

const _now = () => new Date().toISOString()

export const mockSoilReport = {
  report_id: 'sr_mock_abc',
  farmer_id: 'farm_mock_dev',
  farm_id: null,
  values: [
    { param: 'N', value: 210, unit: 'kg/ha' },
    { param: 'P', value: 22, unit: 'kg/ha' },
    { param: 'K', value: 180, unit: 'kg/ha' },
    { param: 'pH', value: 7.4, unit: '' },
    { param: 'OC', value: 0.42, unit: '%' },
  ],
  source: 'manual',
  upload_ref: null,
  captured_at: _now(),
  created_at: _now(),
  is_sample: true,
}

const commonSoil = [
  { param: 'N', value: 210, unit: 'kg/ha', category: 'medium' },
  { param: 'P', value: 22, unit: 'kg/ha', category: 'low' },
  { param: 'K', value: 180, unit: 'kg/ha', category: 'medium' },
  { param: 'pH', value: 7.4, unit: '', category: 'medium' },
  { param: 'OC', value: 0.42, unit: '%', category: 'low' },
]

const commonDisclaimer =
  'Recommendations are calculated from validated agronomic rules. Always confirm with your local agronomist before application.'

export const mockRecommendationOk = {
  recommendation_id: 'rec_mock_ok',
  status: 'ok',
  generated_at: _now(),
  context: {
    crop: 'crop_wheat',
    region: 'reg_up',
    stage: 'stage_basal',
    farm_area: { value: 2, unit: 'acre' },
    language: 'en',
  },
  soil_parameters: commonSoil,
  items: [
    {
      action_id: 'act_1',
      fertilizer: {
        id: 'fert_urea',
        name: 'Urea',
        name_localized: { en: 'Urea', hi: 'यूरिया' },
      },
      quantity: { value: 90, unit: 'kg', display: '<TBD>' },
      quantity_breakdown: {
        dose_per_area: '<TBD>',
        area_factor: '<TBD>',
        rounded_to: '<TBD>',
      },
      timing: 'basal',
      timing_label: 'Basal / pre-sowing',
      method: 'drill',
      method_label: 'Drill placement',
      reason:
        'Nitrogen supports early establishment and tillering for wheat at this stage.',
      cautions: ['Apply after the soil is moist but not waterlogged.'],
      source: {
        rule_set_id: 'rs_wheat_up_v1',
        rule_set_version: '1.2.0',
        rule_id: 'rule_urea_basal',
        document: 'ICAR Wheat Fertilizer Guidelines',
        publisher: 'ICAR',
        url: 'https://example.org/icar-wheat',
      },
    },
  ],
  dose_generated: true,
  ai_summary: null,
  ai_status: 'pending',
  disclaimer: commonDisclaimer,
  input_hash: 'sha256:mock',
  engine_version: '1.0.0',
  is_sample: true,
}

export const mockRecommendationNoRule = {
  recommendation_id: 'rec_mock_norule',
  status: 'no_validated_rule',
  generated_at: _now(),
  context: {
    crop: 'crop_wheat',
    region: 'reg_up',
    stage: 'stage_flowering',
    farm_area: { value: 2, unit: 'acre' },
    language: 'en',
  },
  soil_parameters: commonSoil,
  items: [],
  dose_generated: false,
  message:
    'No validated recommendation is available for these inputs yet. No fertilizer dose has been generated.',
  missing: [{ crop: 'crop_wheat', region: 'reg_up', stage: 'stage_flowering' }],
  ai_summary: null,
  ai_status: 'unavailable',
  disclaimer: commonDisclaimer,
  input_hash: 'sha256:mock-norule',
  engine_version: '1.0.0',
  is_sample: true,
}