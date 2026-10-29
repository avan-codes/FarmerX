import { useEffect, useState } from 'react'
import { useConfig } from '../hooks/useConfig.js'
import { useProfile } from '../hooks/useProfile.js'
import Container from '../components/ui/Container.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Button from '../components/ui/Button.jsx'
import { formatDateTime } from '../lib/datetime.js'

function hasTbd(value) {
  return typeof value === 'string' && value.includes('<TBD>')
}

function LocalizedOption({ item, labelKey, lang }) {
  const localized = item[labelKey]
  const display = localized?.[lang] || localized?.en || item.name || item.code || item.id
  if (hasTbd(display)) {
    return (
      <option value={item.code || item.id} key={item.code || item.id}>
        {localized?.en || item.name || item.id} <span className="text-[10px] text-ink-subtle">(not translated)</span>
      </option>
    )
  }
  return <option value={item.code || item.id} key={item.code || item.id}>{display}</option>
}

export default function ProfilePage() {
  const configState = useConfig()
  const config = configState.data
  const lang = config?.languages?.[0]?.code || 'en'
  const { status, data, error, update, reload } = useProfile()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    preferred_language: lang,
    state: '',
    district: '',
    commonly_grown_crops: [],
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [dirtyFields, setDirtyFields] = useState({})

  const languages = config?.languages || []
  const crops = config?.crops || []

  useEffect(() => {
    if (status === 'ready' && data) {
      const profile = data.profile || data
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        preferred_language: profile.preferred_language || lang,
        state: profile.state || '',
        district: profile.district || '',
        commonly_grown_crops: Array.isArray(profile.commonly_grown_crops)
          ? profile.commonly_grown_crops
          : [],
      })
      setDirtyFields({})
    }
  }, [status, data, lang])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setDirtyFields((prev) => ({ ...prev, [key]: true }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleCropToggle = (cropId) => {
    setForm((prev) => {
      const next = prev.commonly_grown_crops.includes(cropId)
        ? prev.commonly_grown_crops.filter((id) => id !== cropId)
        : [...prev.commonly_grown_crops, cropId]
      return { ...prev, commonly_grown_crops: next }
    })
    setDirtyFields((prev) => ({ ...prev, commonly_grown_crops: true }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.commonly_grown_crops
      return next
    })
  }

  const isChanged = (key) => {
    if (!data) return false
    const profile = data.profile || data
    switch (key) {
      case 'name': return form.name !== (profile.name || '')
      case 'phone': return form.phone !== (profile.phone || '')
      case 'preferred_language': return form.preferred_language !== (profile.preferred_language || lang)
      case 'state': return form.state !== (profile.state || '')
      case 'district': return form.district !== (profile.district || '')
      case 'commonly_grown_crops': {
        const a = (form.commonly_grown_crops || []).slice().sort()
        const b = (profile.commonly_grown_crops || []).slice().sort()
        return a.length !== b.length || a.some((v, i) => v !== b[i])
      }
      default: return false
    }
  }

  const changedFields = Object.keys(form).filter((k) => dirtyFields[k] && isChanged(k))

  async function handleSubmit(e) {
    e.preventDefault()
    setFieldErrors({})
    setSubmitError(null)

    const payload = {}
    for (const key of changedFields) {
      payload[key] = form[key]
    }

    if (Object.keys(payload).length === 0) {
      setSubmitError({
        title: 'No changes',
        message: 'Nothing to save.',
      })
      return
    }

    try {
      await update(payload)
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

  if (status === 'loading') {
    return (
      <div className="page-transition bg-canvas relative z-10">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <Container className="py-10 md:py-14">
          <PageHeader eyebrow="Profile" title="Farmer profile" description="" />
          <div className="mt-12 flex items-center justify-center">
            <LoadingState label="Loading profile…" />
          </div>
        </Container>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="page-transition bg-canvas relative z-10">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <Container className="py-10 md:py-14">
          <PageHeader eyebrow="Profile" title="Farmer profile" description="" />
          <div className="mt-12 flex justify-center">
            <ErrorState
              title="Couldn't load profile"
              description={error?.message || 'Please try again.'}
              onRetry={reload}
            />
          </div>
        </Container>
      </div>
    )
  }

  const profile = data ? (data.profile || data) : null

  return (
    <div className="page-transition bg-canvas relative z-10">
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <Container className="py-10 md:py-14 max-w-2xl">
        <PageHeader
          eyebrow="Profile"
          title="Farmer profile"
          description="Manage your personal details. Only changed fields are sent to the server."
        />

        {submitError && (
          <div
            role="alert"
            className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 mb-6 text-sm shadow-soft"
          >
            <p className="font-medium text-error">
              {submitError.title || 'Save failed'}
            </p>
            <p className="mt-1 text-ink">{submitError.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-ink">
              Name <span className="text-error" aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`field-input ${fieldErrors.name ? 'border-red-500 text-error' : ''}`}
              aria-invalid={fieldErrors.name ? 'true' : 'false'}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            {fieldErrors.name && <p id="name-error" className="text-xs text-error">{fieldErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-ink">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`field-input ${fieldErrors.phone ? 'border-red-500 text-error' : ''}`}
              aria-invalid={fieldErrors.phone ? 'true' : 'false'}
              aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
            />
            {fieldErrors.phone && <p id="phone-error" className="text-xs text-error">{fieldErrors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="preferred_language" className="text-sm font-medium text-ink">
              Preferred language
            </label>
            <select
              id="preferred_language"
              value={form.preferred_language}
              onChange={(e) => handleChange('preferred_language', e.target.value)}
              className={`field-select-base ${fieldErrors.preferred_language ? 'border-red-500 text-error' : ''}`}
            >
              {languages.map((l) => (
                <LocalizedOption
                  key={l.code}
                  item={l}
                  labelKey="name_localized"
                  lang={lang}
                />
              ))}
            </select>
            {fieldErrors.preferred_language && (
              <p id="preferred_language-error" className="text-xs text-error">
                {fieldErrors.preferred_language}
              </p>
            )}
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
              {fieldErrors.state && <p id="state-error" className="text-xs text-error">{fieldErrors.state}</p>}
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
              {fieldErrors.district && (
                <p id="district-error" className="text-xs text-error">{fieldErrors.district}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink block mb-2">
              Commonly grown crops
            </label>
            <div className="grid gap-2 md:grid-cols-3">
              {crops.map((c) => {
                const selected = form.commonly_grown_crops.includes(c.id)
                const label =
                  c.name_localized?.[lang] || c.name_localized?.en || c.name || c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    onClick={() => handleCropToggle(c.id)}
                    className={`flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-sm transition-colors duration-200 ${
                      selected
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border text-ink bg-surface hover:bg-surface/50'
                    }`}
                  >
                    {hasTbd(label) ? (
                      <>
                        <span className="line-through">{c.name_localized?.en || c.name}</span>{' '}
                        <span className="text-[10px] text-ink-subtle">(not translated)</span>
                      </>
                    ) : (
                      label
                    )}
                  </button>
                )
              })}
            </div>
            {fieldErrors.commonly_grown_crops && (
              <p className="text-xs text-error">{fieldErrors.commonly_grown_crops}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            {profile && (
              <div className="text-xs text-ink-subtle">
                <p>Farmer ID: {data.user_id || '—'}</p>
                {profile.created_at && (
                  <p>Created: {formatDateTime(profile.created_at)}</p>
                )}
                {profile.updated_at && (
                  <p>Last updated: {formatDateTime(profile.updated_at)}</p>
                )}
              </div>
            )}
            <Button
              type="submit"
              disabled={changedFields.length === 0}
              className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover hover:shadow-medium disabled:opacity-60 transition-all duration-200"
            >
              Save changes
            </Button>
          </div>

          <p className="text-xs text-ink-subtle mt-4">
            Your farmer ID is tied to your device and cannot be changed. Profile data is re-fetched from the server on every visit — nothing is stored locally.
          </p>
        </form>
      </Container>
    </div>
  )
}
