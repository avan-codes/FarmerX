import { useEffect, useMemo, useRef, useState } from 'react'
import { Home } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Container from '../../components/ui/Container.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import { useConfig } from '../../hooks/useConfig.js'
import { getFarm } from '../../services/farms.js'

export default function FarmForm({ farm, onSave, saving }) {
  const configState = useConfig()
  const config = configState.data
  const { farmId } = useParams()
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [localFarm, setLocalFarm] = useState(farm)

  const [form, setForm] = useState({
    farm_name: '',
    area_value: '',
    area_unit: '',
    state: '',
    district: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)

  const areaUnits = useMemo(
    () =>
      config?.units.filter(
        (u) => u.kind === 'area' && u.available === true
      ) || [],
    [config]
  )

  const initialRef = useRef(false)

  useEffect(() => {
    if (configState.status === 'error') {
      setStatus('error')
      setError(configState.error)
      return
    }
    if (!config) return

    const targetId = farmId || (farm?.farm_id || null)

    if (targetId && !localFarm) {
      setStatus('loading')
      getFarm(targetId)
        .then((doc) => {
          setLocalFarm(doc)
          setStatus('ready')
        })
        .catch((err) => {
          if (err.status === 404) {
            setStatus('notFound')
          } else {
            setStatus('error')
            setError(err)
          }
        })
    } else if (!initialRef.current && !targetId) {
      setLocalFarm({
        farm_name: '',
        area: { value: '', unit: areaUnits[0]?.id || '' },
        state: '',
        district: '',
      })
      setStatus('ready')
      initialRef.current = true
    } else if (farm && !localFarm) {
      setLocalFarm(farm)
      setStatus('ready')
    }
  }, [config, configState.status, configState.error, farmId, farm, localFarm, areaUnits])

  useEffect(() => {
    if (status === 'ready' && localFarm) {
      setForm({
        farm_name: localFarm.farm_name || '',
        area_value: String(localFarm.area?.value || ''),
        area_unit: localFarm.area?.unit || (areaUnits[0]?.id || ''),
        state: localFarm.state || '',
        district: localFarm.district || '',
      })
    }
  }, [status, localFarm, areaUnits])

  if (configState.status === 'loading') {
    return (
      <Container className="py-10 md:py-14 max-w-2xl">
        <PageHeader
          eyebrow="Farm"
          title="Loading…"
          description=""
        />
        <div className="mt-10 flex items-center justify-center gap-3 py-10 text-sm text-ink-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
          <span>Loading…</span>
        </div>
      </Container>
    )
  }

  if (status === 'error') {
    return (
      <Container className="py-10 md:py-14 max-w-2xl">
        <PageHeader
          eyebrow="Farm"
          title="Couldn't load farm"
          description=""
        />
        <ErrorState
          title="Couldn't load farm"
          description={error?.message || 'Please try again.'}
        />
      </Container>
    )
  }

  if (status === 'notFound') {
    return (
      <Container className="py-10 md:py-14 max-w-2xl">
        <PageHeader
          eyebrow="Farm"
          title="Farm not found"
          description="This farm doesn't exist or isn't linked to your profile."
        />
        <EmptyState
          icon={Home}
          title="Farm not found"
          description="The farm you're looking for doesn't exist or isn't linked to your profile."
          action={
            <Link
              to="/farms"
              className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-all duration-200"
            >
              Back to farms
            </Link>
          }
        />
      </Container>
    )
  }

  if (status !== 'ready') {
    return null
  }

  const current = localFarm || {
    farm_name: '',
    area: { value: '', unit: areaUnits[0]?.id || '' },
    state: '',
    district: '',
  }
  const isEdit = Boolean(current.farm_id)

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFieldErrors({})
    setSubmitError(null)

    const errors = {}
    if (!form.farm_name.trim()) errors.farm_name = 'Farm name is required'
    const areaValue = Number(form.area_value)
    if (!form.area_value || Number.isNaN(areaValue) || areaValue <= 0)
      errors.area_value = 'Area must be greater than 0'
    if (!form.area_unit) errors.area_unit = 'Select an area unit'

    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    const payload = {
      farm_name: form.farm_name.trim(),
      area_value: areaValue,
      area_unit: form.area_unit,
      state: form.state || null,
      district: form.district || null,
    }

    try {
      await onSave(current.farm_id || null, payload)
    } catch (err) {
      if (err.status === 422 && Array.isArray(err.errors)) {
        const mapped = {}
        for (const e of err.errors) {
          if (e.field) mapped[e.field] = e.message
        }
        setFieldErrors(mapped)
      }
      setSubmitError(err)
    }
  }

  return (
    <Container className="py-10 md:py-14 max-w-2xl">
      <PageHeader
        eyebrow={isEdit ? 'Edit farm' : 'Add farm'}
        title={isEdit ? 'Edit farm' : 'Add a farm'}
        description={
          isEdit
            ? "Update your farm's details."
            : 'Save a farm so you can re-run reports against it.'
        }
      />

      {submitError && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 mb-6 shadow-soft"
        >
          <p className="font-medium text-error">
            {submitError.title || 'Save failed'}
          </p>
          <p className="mt-1 text-ink">{submitError.message}</p>
          {submitError.requestId && (
            <p className="mt-1 text-xs text-ink-subtle">
              Request ID: <code>{submitError.requestId}</code>
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="farm_name" className="text-sm font-medium text-ink">
            Farm name <span className="text-error" aria-hidden="true">*</span>
          </label>
          <input
            id="farm_name"
            value={form.farm_name}
            onChange={(e) => handleChange('farm_name', e.target.value)}
            className={`field-input ${fieldErrors.farm_name ? 'border-red-500 text-error' : ''}`}
            aria-invalid={fieldErrors.farm_name ? 'true' : 'false'}
            aria-describedby={fieldErrors.farm_name ? 'farm_name-error' : undefined}
          />
          {fieldErrors.farm_name && (
            <p id="farm_name-error" className="text-xs text-error">
              {fieldErrors.farm_name}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="area_value" className="text-sm font-medium text-ink">
              Area value <span className="text-error" aria-hidden="true">*</span>
            </label>
            <input
              id="area_value"
              type="number"
              step="any"
              min="0"
              value={form.area_value}
              onChange={(e) => handleChange('area_value', e.target.value)}
              className="field-input"
            />
            {fieldErrors.area_value && (
              <p id="area_value-error" className="text-xs text-error">
                {fieldErrors.area_value}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="area_unit" className="text-sm font-medium text-ink">
              Unit <span className="text-error" aria-hidden="true">*</span>
            </label>
            <select
              id="area_unit"
              value={form.area_unit}
              onChange={(e) => handleChange('area_unit', e.target.value)}
              className="field-select-base"
            >
              <option value="">Select a unit</option>
              {areaUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.symbol || u.id}
                </option>
              ))}
            </select>
            {fieldErrors.area_unit && (
              <p id="area_unit-error" className="text-xs text-error">
                {fieldErrors.area_unit}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="state" className="text-sm font-medium text-ink">
              State
            </label>
            <input
              id="state"
              value={form.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className="field-input"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="district" className="text-sm font-medium text-ink">
              District
            </label>
            <input
              id="district"
              value={form.district}
              onChange={(e) => handleChange('district', e.target.value)}
              className="field-input"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-5 border-t border-border">
          <Link
            to="/farms"
            className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface/50 transition-all duration-200"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-all duration-200"
          >
            {saving ? 'Saving…' : isEdit ? 'Update farm' : 'Save farm'}
          </Button>
        </div>
      </form>
    </Container>
  )
}
