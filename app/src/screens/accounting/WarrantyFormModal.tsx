import { z } from 'zod'
import { warrantyCreate } from '@contract'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { DESTRUCTIVE_BUTTON, Modal, useModal } from '@/components/ui/Modal'
import {
  Field,
  Form,
  FormErrorSummary,
  useUnsavedChangesGuard,
  useZodForm,
} from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { RepositoryError, useCreate, useUpdate, useDelete, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, asPatch, rowId, serverFieldError } from '../registry/writes'

type Warranty = RowOf<'equipmentWarranties'>

const warrantyForm = z
  .object({
    itemName: z.string(),
    provider: z.string(),
    coverage: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    status: z.string(),
    claimNotes: z.string(),
    notes: z.string(),
  })
  .transform((values) => {
    const claimNotes = values.claimNotes.trim()
    const notes = values.notes.trim()
    return {
      itemName: values.itemName.trim(),
      provider: values.provider.trim(),
      coverage: values.coverage || 'full',
      startDate: values.startDate,
      endDate: values.endDate,
      status: values.status || 'active',
      ...(claimNotes ? { claimNotes } : {}),
      ...(notes ? { notes } : {}),
    }
  })
  .pipe(warrantyCreate)

type WarrantyFormValues = z.input<typeof warrantyForm>

const COVERAGE_OPTIONS = [
  { value: 'full', label: 'Full' },
  { value: 'limited', label: 'Limited' },
  { value: 'extended', label: 'Extended' },
] as const

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'expired', label: 'Expired' },
] as const

export function WarrantyFormModal({
  open,
  onClose,
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  existingRecord?: Warranty
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('equipmentWarranties')
  const update = useUpdate('equipmentWarranties')
  const remove = useDelete('equipmentWarranties')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: warrantyForm,
    initial: {
      itemName: existingRecord?.itemName ?? '',
      provider: existingRecord?.provider ?? '',
      coverage: existingRecord?.coverage ?? 'full',
      startDate: existingRecord?.start ?? '',
      endDate: existingRecord?.end ?? '',
      status: existingRecord?.status ?? 'active',
      claimNotes: existingRecord?.claimNotes ?? '',
      notes: existingRecord?.notes ?? '',
    } satisfies WarrantyFormValues,
    async onSubmit(values) {
      try {
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Warranty>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Warranty>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Warranty updated' : 'Warranty created'),
        description: values.itemName,
      })
      onClose()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)

  const close = async () => {
    if (form.pending) return
    if (!(await confirmDiscard())) return
    onClose()
  }

  const handleDelete = async () => {
    const id = rowId(existingRecord)
    if (!id) return
    const agreed = await confirm({
      title: t('Delete Warranty?'),
      description: `${existingRecord?.itemName ?? ''}`,
      icon: 'Trash2',
      confirmLabel: t('Delete'),
      destructive: true,
      variant: 'lifecycle',
    })
    if (!agreed) return
    try {
      await remove.mutateAsync({ id })
    } catch (cause) {
      toast.show({
        title: t('Delete failed'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
      return
    }
    toast.show({ title: t('Warranty deleted'), description: existingRecord?.itemName ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'Shield'}
      title={t(editing ? 'Edit Warranty' : 'New Warranty')}
      dismissible={!busy}
      footer={
        <>
          {editing && rowId(existingRecord) ? (
            <Button
              variant="subtle"
              size="lg"
              onClick={() => void handleDelete()}
              disabled={busy}
              className={DESTRUCTIVE_BUTTON}
            >
              <Icon name="Trash2" size={14} />
              {t('Delete')}
            </Button>
          ) : null}
          <div className="flex-1" />
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={busy}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={busy}>
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Create Warranty')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="itemName" label="Item" required placeholder={t('Hydraulic Lift #1')} />
        <Field name="provider" label="Provider" required placeholder={t('LiftMaster Co')} />
        <Field name="coverage" label="Coverage" kind="select" options={COVERAGE_OPTIONS} />
        <Field name="startDate" label="Start Date" kind="date" required />
        <Field name="endDate" label="End Date" kind="date" required />
        <Field name="status" label="Status" kind="select" options={STATUS_OPTIONS} />
        <Field name="claimNotes" label="Claim Notes" kind="textarea" hint={t('Only used once the status is Claimed.')} />
        <Field name="notes" label="Notes" kind="textarea" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Create Warranty')}
        </button>
      </Form>
    </Modal>
  )
}
