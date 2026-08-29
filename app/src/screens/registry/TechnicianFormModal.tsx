import { z } from 'zod'
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
import { RepositoryError, useCreate, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, serverFieldError } from './writes'

/** Add Technician modal.
 *
 *  Technicians live in the `technicians` collection and carry a name,
 *  specialization, phone and email. There is no contract schema for this
 *  entity yet, so the form uses an inline zod schema that mirrors the
 *  fields the registry table already displays. */

const technicianForm = z.object({
  name: z.string().min(1),
  specialty: z.string(),
  phone: z.string(),
  email: z.string(),
})

type TechnicianFormValues = z.infer<typeof technicianForm>

export function TechnicianFormModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('technicians')

  const form = useZodForm({
    schema: technicianForm,
    initial: {
      name: '',
      specialty: '',
      phone: '',
      email: '',
    } satisfies TechnicianFormValues,
    async onSubmit(values) {
      try {
        const input: Partial<RowOf<'technicians'>> = {
          name: values.name.trim(),
          ...(values.specialty.trim() ? { specialty: values.specialty.trim() } : {}),
        }
        await create.mutateAsync({ input })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t('Technician added'),
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
      icon="Wrench"
      title={t('Add Technician')}
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Add Technician')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Technician Name" required />
        <Field name="specialty" label="Specialization" hint="Skill area, e.g. Engine, Electrical, Body." />
        <Field name="phone" label="Phone" kind="phone" placeholder="+966 55 210 4471" />
        <Field name="email" label="Email" kind="email" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Add Technician')}
        </button>
      </Form>
    </Modal>
  )
}
