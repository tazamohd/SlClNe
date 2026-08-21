import { z } from 'zod'
import { fleetCreate } from '../../../../packages/contract/src/index'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  Field,
  Form,
  FormErrorSummary,
  useUnsavedChangesGuard,
  useZodForm,
  type FieldOption,
} from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { RepositoryError, useCreate, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, asPatch, serverFieldError } from './writes'

/** Add Fleet Account modal.
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
    contactName: z.string(),
    contactPhone: z.string(),
    contactEmail: z.string(),
  })
  .transform((values) => {
    const contractType = values.contractType.trim()
    const contactName = values.contactName.trim()
    const contactPhone = values.contactPhone.trim()
    const contactEmail = values.contactEmail.trim()
    return {
      name: values.name.trim(),
      ...(contractType ? { contractType } : {}),
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
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('fleets')

  const form = useZodForm({
    schema: fleetAccountForm,
    initial: {
      name: '',
      contractType: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
    } satisfies FleetAccountFormValues,
    async onSubmit(values) {
      try {
        await create.mutateAsync({ input: asPatch<Fleet>(values) })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t('Fleet account added'),
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

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon="Truck"
      title="Add Fleet Account"
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Add Fleet Account')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Fleet Account Name" required />
        <Field name="contractType" label="Contract Type" kind="select" options={CONTRACT_TYPE_OPTIONS} placeholder="Select contract type" />
        <Field name="contactName" label="Contact Person" />
        <Field name="contactPhone" label="Contact Phone" kind="phone" placeholder="+966 55 210 4471" />
        <Field name="contactEmail" label="Contact Email" kind="email" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Add Fleet Account')}
        </button>
      </Form>
    </Modal>
  )
}
