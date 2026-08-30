import { z } from 'zod'
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
import { NoWritesNotice, asPatch, rowId, serverFieldError } from './writes'

/** Add / Edit Technician modal.
 *
 *  Technicians live in the `technicians` collection and carry a name,
 *  specialization, phone and email. There is no contract schema for this
 *  entity yet, so the form uses an inline zod schema that mirrors the
 *  fields the registry table already displays. */
type Technician = RowOf<'technicians'>

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
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  existingRecord?: Technician
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('technicians')
  const update = useUpdate('technicians')
  const remove = useDelete('technicians')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: technicianForm,
    initial: {
      name: existingRecord?.name ?? '',
      specialty: existingRecord?.specialty ?? '',
      phone: '',
      email: '',
    } satisfies TechnicianFormValues,
    async onSubmit(values) {
      try {
        const input: Partial<RowOf<'technicians'>> = {
          name: values.name.trim(),
          ...(values.specialty.trim() ? { specialty: values.specialty.trim() } : {}),
        }
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Technician>(input) })
        } else {
          await create.mutateAsync({ input })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Technician updated' : 'Technician added'),
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
      title: t('Delete Technician?'),
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
    toast.show({ title: t('Technician deleted'), description: existingRecord?.name ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'Wrench'}
      title={t(editing ? 'Edit Technician' : 'Add Technician')}
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
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Add Technician')}
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
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Add Technician')}
        </button>
      </Form>
    </Modal>
  )
}
