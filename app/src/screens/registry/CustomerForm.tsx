import { z } from 'zod'
import { customerCreate } from '../../../../packages/contract/src/index'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  Field,
  Form,
  FormErrorSummary,
  useUnsavedChangesGuard,
  useZodForm,
} from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { RepositoryError, useCreate, useUpdate, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, asPatch, rowId, serverFieldError } from './writes'

/** Add / Edit Customer — the "Add New Customer" panel of
 *  `UI.Modals.CRUD.dc.html`, which carries exactly three fields: Full Name,
 *  Phone, Email. The contract's other customer columns (`type`, `fleetId`,
 *  `notes`) are optional with server defaults and have no designed control, so
 *  this form does not invent one.
 *
 *  The rules are not restated here. `customerCreate` in `packages/contract` is
 *  what the API validates against, so it is what this form validates against —
 *  a second copy would drift, and the drift would show as a form that accepts
 *  what the server refuses. The wrapper below does only the two things a form
 *  has to do that an API body does not: every control produces a string, and an
 *  untouched optional field produces an empty one that must be dropped rather
 *  than sent as `""`. */
type Customer = RowOf<'customers'>

/** Columns the API returns that the fixture-derived row type does not name. */
type CustomerFields = Customer & { email?: string | null }

const customerForm = z
  .object({
    name: z.string(),
    phone: z.string(),
    email: z.string(),
  })
  .transform((values) => {
    const email = values.email.trim()
    return {
      name: values.name.trim(),
      phone: values.phone.trim(),
      ...(email ? { email } : {}),
    }
  })
  .pipe(customerCreate)

type CustomerFormValues = z.input<typeof customerForm>

export function CustomerFormModal({
  open,
  onClose,
  /** Absent to create, present to edit. */
  customer,
}: {
  open: boolean
  onClose: () => void
  customer?: CustomerFields
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('customers')
  const update = useUpdate('customers')
  const editing = Boolean(customer)

  const form = useZodForm({
    schema: customerForm,
    initial: {
      name: customer?.name ?? '',
      phone: customer?.phone ?? '',
      email: customer?.email ?? '',
    } satisfies CustomerFormValues,
    async onSubmit(values) {
      try {
        if (customer) {
          const id = rowId(customer)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Customer>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Customer>(values) })
        }
      } catch (cause) {
        // A rejection the server attributed to a field belongs on that field,
        // not in a toast that vanishes while the user is still reading it.
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Customer updated' : 'Customer added'),
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
      icon={editing ? 'Pencil' : 'UserPlus'}
      title={editing ? 'Edit Customer' : 'Add New Customer'}
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Add Customer')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Full Name" required />
        <Field name="phone" label="Phone" kind="phone" required placeholder="+966 55 210 4471" />
        <Field name="email" label="Email" kind="email" hint="Optional. Used for service reminders." />
        {/* The visible actions are in the modal's footer bar, as the design
            draws them. This keeps Enter working from any field — a form with no
            submit control inside it does not submit from the keyboard. It is
            aria-hidden, which also takes it out of the dialog's focus trap. */}
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t(editing ? 'Save Changes' : 'Add Customer')}
        </button>
      </Form>
    </Modal>
  )
}
