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
import { RepositoryError, useCreate } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, serverFieldError } from './writes'

/** Add Technician modal.
 *
 *  Technicians live in the `technicians` collection and carry a name,
 *  specialization, phone and email. There is no contract schema for this
 *  entity yet, so the form uses an inline zod schema that mirrors the
 *  fields the registry table already displays. */

const technicianForm = z
  .object({
    name: z.string(),
    specialization: z.string(),
    phone: z.string(),
    email: z.string(),
  })
  .transform((values) => {
    const specialization = values.specialization.trim()
    const phone = values.phone.trim()
    const email = values.email.trim()
    return {
      name: values.name.trim(),
      ...(specialization ? { specialization } : {}),
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
    }
  })

type TechnicianFormValues = z.input<typeof technicianForm>

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
      specialization: '',
      phone: '',
      email: '',
    } satisfies TechnicianFormValues,
    async onSubmit(values) {
      try {
        await create.mutateAsync({ input: values as any })
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
      title="Add Technician"
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
        <Field name="specialization" label="Specialization" hint="Skill area, e.g. Engine, Electrical, Body." />
        <Field name="phone" label="Phone" kind="phone" placeholder="+966 55 210 4471" />
        <Field name="email" label="Email" kind="email" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Add Technician')}
        </button>
      </Form>
    </Modal>
  )
}
