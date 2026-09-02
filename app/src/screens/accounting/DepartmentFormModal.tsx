/** Add / Edit Department modal — inline schema, no contract. */
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
import { NoWritesNotice, asPatch, rowId, serverFieldError } from '@/screens/registry/writes'

type Department = RowOf<'departments'>

const departmentForm = z.object({
  name: z.string().min(1),
  code: z.string(),
  manager: z.string(),
}).transform((v) => ({
  name: v.name.trim(),
  ...(v.code.trim() ? { code: v.code.trim() } : {}),
  ...(v.manager.trim() ? { manager: v.manager.trim() } : {}),
}))

type DepartmentFormValues = z.input<typeof departmentForm>

export function DepartmentFormModal({
  open,
  onClose,
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  existingRecord?: Department
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('departments')
  const update = useUpdate('departments')
  const remove = useDelete('departments')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: departmentForm,
    initial: {
      name: existingRecord?.name ?? '',
      code: '',
      manager: existingRecord?.head ?? '',
    } satisfies DepartmentFormValues,
    async onSubmit(values) {
      try {
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Department>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Department>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Department updated' : 'Department added'),
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
      title: t('Delete Department?'),
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
    toast.show({ title: t('Department deleted'), description: existingRecord?.name ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'Building2'}
      title={t(editing ? 'Edit Department' : 'Add Department')}
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
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Add Department')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Department Name" required placeholder={t('Operations')} />
        <Field name="code" label="Department Code" placeholder={t('OPS')} />
        <Field name="manager" label="Manager" placeholder={t('Ahmed Al-Rashid')} />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Add Department')}
        </button>
      </Form>
    </Modal>
  )
}
