import { z } from 'zod'
import { fleetCreate } from '@contract'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { DESTRUCTIVE_BUTTON, Modal, useModal } from '@/components/ui/Modal'
import {
  Field,
  Form,
  FormErrorSummary,
  useUnsavedChangesGuard,
  useZodForm,
  type FieldOption,
} from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { RepositoryError, useCreate, useUpdate, useDelete, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, asPatch, rowId, serverFieldError } from './writes'

/** Add / Edit Fleet Account modal.
 *
 *  Fleet accounts group vehicles under one service contract. The form
 *  collects the account name, contract type and contact details; the
 *  remaining contract fields (value, dates, status) default on the server.
 *  Validated by `fleetCreate` from `packages/contract`. */
type Fleet = RowOf<'fleets'>

const CONTRACT_TYPE_OPTIONS: readonly FieldOption[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'custom', label: 'Custom' },
]

const fleetAccountForm = z
  .object({
    name: z.string(),
    contractType: z.string(),
    contractPeriod: z.string(),
    contactName: z.string(),
    contactPhone: z.string(),
    contactEmail: z.string(),
  })
  .transform((values) => {
    const contractType = values.contractType.trim()
    const contactName = values.contactName.trim()
    const contactPhone = values.contactPhone.trim()
    const contactEmail = values.contactEmail.trim()
    const [contractStart, contractEnd] = values.contractPeriod.split('|')
    return {
      name: values.name.trim(),
      ...(contractType ? { contractType } : {}),
      ...(contractStart?.trim() ? { contractStartDate: contractStart.trim() } : {}),
      ...(contractEnd?.trim() ? { contractEndDate: contractEnd.trim() } : {}),
      ...(contactName ? { contactName } : {}),
      ...(contactPhone ? { contactPhone } : {}),
      ...(contactEmail ? { contactEmail } : {}),
    }
  })
  .pipe(fleetCreate)

type FleetAccountFormValues = z.input<typeof fleetAccountForm>

export function FleetAccountFormModal({
  open,
  onClose,
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  existingRecord?: Fleet
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('fleets')
  const update = useUpdate('fleets')
  const remove = useDelete('fleets')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: fleetAccountForm,
    initial: {
      name: existingRecord?.name ?? '',
      contractType: existingRecord?.contract ?? '',
      contractPeriod: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
    } satisfies FleetAccountFormValues,
    async onSubmit(values) {
      try {
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Fleet>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Fleet>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Fleet account updated' : 'Fleet account added'),
        description: values.name,
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
      title: t('Delete Fleet Account?'),
      description: `${existingRecord?.name ?? ''}`,
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
    toast.show({ title: t('Fleet account deleted'), description: existingRecord?.name ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'Truck'}
      title={t(editing ? 'Edit Fleet Account' : 'Add Fleet Account')}
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
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Add Fleet Account')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Fleet Account Name" required />
        <Field name="contractType" label="Contract Type" kind="select" options={CONTRACT_TYPE_OPTIONS} placeholder={t('Select contract type')} />
        <Field name="contractPeriod" label="Contract Period" kind="daterange" hint="Start and end dates for this contract." />
        <Field name="contactName" label="Contact Person" />
        <Field name="contactPhone" label="Contact Phone" kind="phone" placeholder="+966 55 210 4471" />
        <Field name="contactEmail" label="Contact Email" kind="email" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Add Fleet Account')}
        </button>
      </Form>
    </Modal>
  )
}
