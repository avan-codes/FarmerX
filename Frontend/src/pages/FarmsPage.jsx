import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import Container from '../components/ui/Container.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import { useFarms } from '../hooks/useFarms.js'
import FarmForm from '../features/farms/FarmForm.jsx'
import SavedFarmCard from '../features/farms/SavedFarmCard.jsx'

export default function FarmsPage() {
  const { status, data, total, error, reload, create, update, remove } =
    useFarms()

  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const farms = status === 'ready' ? data : []

  const handleCreate = () => setCreating(true)
  const handleCancelCreate = () => setCreating(false)

  const handleEdit = (farm) => {
    setEditing(farm.farm_id)
  }
  const handleCancelEdit = () => setEditing(null)

  const handleSave = useCallback(
    async (id, payload) => {
      try {
        if (id) {
          await update(id, payload)
        } else {
          await create(payload)
        }
        setEditing(null)
        setCreating(false)
      } catch {
        // error already surfaced by FarmForm / useFarms
      }
    },
    [create, update]
  )

  const handleDeleteClick = (farm) => {
    setDeleteConfirm({ id: farm.farm_id, name: farm.farm_name })
  }
  const handleCancelDelete = () => setDeleteConfirm(null)
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(deleteConfirm.id)
    try {
      await remove(deleteConfirm.id)
      setDeleteConfirm(null)
    } catch {
      setDeleteConfirm(null)
    } finally {
      setDeleting(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="page-transition bg-canvas relative z-10">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <Container className="py-10 md:py-14">
          <PageHeader
            eyebrow="Farms"
            title="Your farms"
            description="Create, edit, and manage your saved farms."
          />
          <div className="mt-12 flex items-center justify-center">
            <LoadingState label="Loading farms…" />
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
          <PageHeader
            eyebrow="Farms"
            title="Your farms"
            description="Create, edit, and manage your saved farms."
          />
          <div className="mt-12 flex justify-center">
            <ErrorState
              title="Couldn't load farms"
              description={error?.message || 'Please try again.'}
              onRetry={reload}
            />
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="page-transition bg-canvas relative z-10">
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <Container className="py-10 md:py-14">
        <PageHeader
          eyebrow="Farms"
          title="Your farms"
          description="Create, edit, and manage your saved farms."
          actions={
            <Button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              {creating ? 'Adding…' : 'Add farm'}
            </Button>
          }
        />

        {creating && (
          <div className="mt-8 max-w-2xl">
            <FarmForm onSave={handleSave} saving={creating} />
            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                onClick={handleCancelCreate}
                variant="secondary"
                className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface/50 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {editing && (
          <div className="mt-8 max-w-2xl">
            <FarmForm
              farm={farms.find((f) => f.farm_id === editing) || undefined}
              onSave={handleSave}
            />
            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                onClick={handleCancelEdit}
                variant="secondary"
                className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface/50 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!creating && !editing && (
          <div className="mt-8">
            {farms.length === 0 && (
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-10 text-center shadow-soft">
                <EmptyState
                  icon={Plus}
                  title="No saved farms yet"
                  description="Create a farm to save your fields and re-run reports against them."
                  action={
                    <Button
                      type="button"
                      onClick={handleCreate}
                      variant="primary"
                      className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-all duration-200"
                    >
                      Add your first farm
                    </Button>
                  }
                />
              </div>
            )}

            {farms.length > 0 && (
              <>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <h2 className="text-lg font-semibold text-ink">
                    Saved farms ({total})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {farms.map((farm) => (
                    <SavedFarmCard
                      key={farm.farm_id}
                      farm={farm}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
              onClick={handleCancelDelete}
              aria-hidden="true"
            />
            <div className="relative z-10 bg-surface rounded-[var(--radius-lg)] border border-border p-6 max-w-md w-full mx-4 shadow-medium">
              <h2 className="text-lg font-semibold text-ink mb-2">
                Delete farm
              </h2>
              <p className="text-sm text-ink-muted mb-5">
                Are you sure you want to delete “{deleteConfirm.name}”? This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={handleCancelDelete}
                  variant="secondary"
                  disabled={deleting}
                  className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface/50 disabled:opacity-60 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmDelete}
                  variant="danger"
                  disabled={deleting}
                  className="rounded-[var(--radius-md)] bg-error px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60 transition-all duration-200"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}
