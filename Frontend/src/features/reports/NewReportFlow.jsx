import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfig } from '../../hooks/useConfig.js'
import { useStages } from '../../hooks/useStages.js'
import { createSoilReport } from '../../services/soilReports.js'
import { createRecommendation } from '../../services/recommendations.js'
import { uuid } from '../../lib/uuid.js'
import LoadingState from '../../components/ui/LoadingState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import WorkflowStepper from './WorkflowStepper.jsx'
import SoilStep from './SoilStep.jsx'
import ContextStep from './ContextStep.jsx'
import ReviewStep from './ReviewStep.jsx'

function emptyValues(soilParameters) {
  const obj = {}
  for (const p of soilParameters) obj[p.id] = ''
  return obj
}

export default function NewReportFlow() {
  const configState = useConfig()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [values, setValues] = useState({})
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [cropId, setCropId] = useState('')
  const [regionId, setRegionId] = useState('')
  const [district, setDistrict] = useState('')
  const [stageId, setStageId] = useState('')
  const [areaValue, setAreaValue] = useState('')
  const [areaUnit, setAreaUnit] = useState('')
  const [language, setLanguage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [soilReportId, setSoilReportId] = useState(null)
  const [idempotencyKey, setIdempotencyKey] = useState(null)

  const config = configState.data

  useEffect(() => {
    if (!config) return
    setValues((prev) => {
      const base = emptyValues(config.soilParameters)
      for (const k of Object.keys(base)) if (prev[k] !== undefined) base[k] = prev[k]
      return base
    })
    setAreaUnit((prev) => prev || config.units.find((u) => u.kind === 'area' && u.available)?.id || '')
    setLanguage((prev) => prev || config.languages[0]?.code || '')
  }, [config])

  useEffect(() => {
    setStageId('')
  }, [cropId, regionId])

  const stagesState = useStages(cropId, regionId)

  const soilSignature = useMemo(() => {
    const fileSig = file ? `${file.name}:${file.size}` : ''
    return `${JSON.stringify(values)}|${fileSig}`
  }, [values, file])

  useEffect(() => {
    setSoilReportId(null)
    setIdempotencyKey(null)
  }, [soilSignature])

  useEffect(() => {
    setIdempotencyKey(null)
  }, [cropId, regionId, stageId, areaValue, areaUnit, language, district])

  function validateSoil() {
    if (!config) return {}
    const errors = {}
    for (const p of config.soilParameters) {
      const raw = values[p.id]
      if (raw === '' || raw === null || raw === undefined) {
        errors[p.id] = 'Required'
        continue
      }
      const n = Number(raw)
      if (Number.isNaN(n)) {
        errors[p.id] = 'Must be a number'
      } else if (n < p.min || n > p.max) {
        errors[p.id] = `Must be between ${p.min} and ${p.max}`
      }
    }
    if (fileError) errors.file = fileError
    return errors
  }

  function validateContext() {
    const errors = {}
    if (!cropId) errors.crop_id = 'Select a crop'
    if (!regionId) errors.region_id = 'Select a state'
    if (!stageId) errors.stage_id = 'Select a growth stage'
    if (!areaUnit) errors.area_unit = 'Select a unit'
    if (areaValue === '' || Number(areaValue) <= 0)
      errors.area_value = 'Must be greater than 0'
    if (!language) errors.language = 'Select a language'
    return errors
  }

  function goNext() {
    if (step === 1) {
      const errs = validateSoil()
      if (Object.keys(errs).length) {
        setFieldErrors(errs)
        return
      }
      setFieldErrors({})
      setStep(2)
    } else if (step === 2) {
      const errs = validateContext()
      if (Object.keys(errs).length) {
        setFieldErrors(errs)
        return
      }
      setFieldErrors({})
      setStep(3)
    }
  }

  function goBack() {
    if (step > 1) {
      setFieldErrors({})
      setSubmitError(null)
      setStep(step - 1)
    }
  }

  function jumpToStep(target) {
    if (target < step) {
      setFieldErrors({})
      setSubmitError(null)
      setStep(target)
    }
  }

  function mapServerFieldErrors(serverErrors) {
    const mapped = {}
    const soilPattern = /^values\.(.+)$/
    for (const fe of serverErrors) {
      const soilMatch = fe.field.match(soilPattern)
      if (soilMatch) {
        mapped[soilMatch[1]] = fe.message
        continue
      }
      if (fe.field === 'crop_id') mapped.crop_id = fe.message
      else if (fe.field === 'region_id') mapped.region_id = fe.message
      else if (fe.field === 'stage_id') mapped.stage_id = fe.message
      else if (fe.field === 'area.value') mapped.area_value = fe.message
      else if (fe.field === 'area.unit') mapped.area_unit = fe.message
      else if (fe.field === 'language') mapped.language = fe.message
      else mapped._general = [...(mapped._general || []), fe.message]
    }
    return mapped
  }

  async function handleSubmit() {
    if (submitting) return
    if (!config) {
      setSubmitError({
        title: 'Form not ready',
        message: 'The report form is still loading. Please wait and try again.',
      })
      return
    }
    setSubmitError(null)
    setSubmitting(true)

    try {
      let reportId = soilReportId
      if (!reportId) {
        const soilValues = {}
        for (const p of config.soilParameters) {
          soilValues[p.id] = values[p.id]
        }
        const soilReport = await createSoilReport({
          values: soilValues,
          file,
          farmId: null,
        })
        reportId = soilReport.report_id
        setSoilReportId(reportId)
      }

      const key = idempotencyKey || uuid()
      setIdempotencyKey(key)

      const recommendation = await createRecommendation(
        {
          report_id: reportId,
          crop_id: cropId,
          region_id: regionId,
          district: district || null,
          area: { value: Number(areaValue), unit: areaUnit },
          stage_id: stageId,
          language,
          farm_id: null,
        },
        key
      )

      navigate(`/reports/${recommendation.recommendation_id}`)
    } catch (err) {
      if (Array.isArray(err.errors) && err.errors.length) {
        const mapped = mapServerFieldErrors(err.errors)
        setFieldErrors(mapped)
        const contextKeys = ['crop_id', 'region_id', 'stage_id', 'area_value', 'area_unit', 'language']
        const soilKeys = config.soilParameters.map((p) => p.id)
        if (contextKeys.some((k) => mapped[k])) setStep(2)
        else if (soilKeys.some((k) => mapped[k])) setStep(1)
      }
      setSubmitError(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (configState.status === 'loading') {
    return <LoadingState label="Loading form…" />
  }
  if (configState.status === 'error') {
    return (
      <ErrorState
        title="Couldn't load the soil report form"
        description={configState.error?.message || 'Please try again.'}
        onRetry={configState.reload}
      />
    )
  }

  const areaUnits = config.units.filter((u) => u.kind === 'area')

  return (
    <div className="space-y-8">
      <WorkflowStepper current={step} onStepClick={jumpToStep} />

      {step === 1 && (
        <SoilStep
          soilParameters={config.soilParameters}
          values={values}
          onChange={(id, v) => setValues((prev) => ({ ...prev, [id]: v }))}
          file={file}
          fileError={fileError}
          onFileChange={(f, err) => {
            setFile(f)
            setFileError(err || null)
          }}
          errors={fieldErrors}
          onContinue={goNext}
        />
      )}

      {step === 2 && (
        <ContextStep
          crops={config.crops}
          regions={config.regions}
          areaUnits={areaUnits}
          languages={config.languages}
          cropId={cropId}
          regionId={regionId}
          district={district}
          stageId={stageId}
          areaValue={areaValue}
          areaUnit={areaUnit}
          language={language}
          stagesState={stagesState}
          errors={fieldErrors}
          onChange={{
            cropId: setCropId,
            regionId: setRegionId,
            district: setDistrict,
            stageId: setStageId,
            areaValue: setAreaValue,
            areaUnit: setAreaUnit,
            language: setLanguage,
          }}
          onBack={goBack}
          onContinue={goNext}
        />
      )}

      {step === 3 && (
        <ReviewStep
          soilParameters={config.soilParameters}
          values={values}
          crops={config.crops}
          regions={config.regions}
          stages={stagesState.data}
          languages={config.languages}
          areaUnits={areaUnits}
          file={file}
          cropId={cropId}
          regionId={regionId}
          stageId={stageId}
          areaValue={areaValue}
          areaUnit={areaUnit}
          language={language}
          submitting={submitting}
          submitError={submitError}
          onBack={goBack}
          onSubmit={handleSubmit}
          onEditStep={jumpToStep}
        />
      )}
    </div>
  )
}
