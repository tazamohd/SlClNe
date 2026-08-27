/** Add Department modal — inline schema, no contract. */
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
import { NoWritesNotice, asPatch, serverFieldError } from '@/screens/registry/writes'

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
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('departments')

  const form = useZodForm({
    schema: departmentForm,
    initial: {
      name: '',
      code: '',
      manager: '',
    } satisfies DepartmentFormValues,
    async onSubmit(values) {
      try {
        await create.mutateAsync({ input: asPatch<Department>(values) })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t('Department added'),
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
      icon="Building2"
      title={t('Add Department')}
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Add Department')}
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
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Add Department')}
        </button>
      </Form>
    </Modal>
  )
}
