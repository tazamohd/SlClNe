import { z } from 'zod'
import { crmTaskCreate } from '@contract'
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

type Task = RowOf<'crmTasks'>

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
] as const

const TYPE_OPTIONS = [
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'document', label: 'Document' },
  { value: 'email', label: 'Email' },
] as const

const taskForm = z
  .object({
    title: z.string(),
    assignedTo: z.string(),
    dueDate: z.string(),
    priority: z.string(),
    status: z.string(),
    type: z.string(),
  })
  .transform((values) => {
    const assignedTo = values.assignedTo.trim()
    const dueDate = values.dueDate.trim()
    const type = values.type.trim()
    return {
      title: values.title.trim(),
      ...(assignedTo ? { assignedTo } : {}),
      ...(dueDate ? { dueDate } : {}),
      priority: values.priority || 'medium',
      status: values.status || 'todo',
      ...(type ? { type } : {}),
    }
  })
  .pipe(crmTaskCreate)

type TaskFormValues = z.input<typeof taskForm>

export function CrmTaskFormModal({
  open,
  onClose,
  /** ISO `YYYY-MM-DD` for the day the calendar was on, pre-filled into due date. */
  defaultDueDate = '',
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  defaultDueDate?: string
  existingRecord?: Task
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('crmTasks')
  const update = useUpdate('crmTasks')
  const remove = useDelete('crmTasks')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: taskForm,
    initial: {
      title: existingRecord?.title ?? '',
      assignedTo: existingRecord?.assigned ?? '',
      dueDate: existingRecord?.due ?? defaultDueDate,
      priority: existingRecord?.priority ?? 'medium',
      status: existingRecord?.status ?? 'todo',
      type: existingRecord?.type ?? 'call',
    } satisfies TaskFormValues,
    async onSubmit(values) {
      try {
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Task>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Task>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Task updated' : 'Task created'),
        description: values.title,
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
      title: t('Delete Task?'),
      description: `${existingRecord?.title ?? ''}`,
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
    toast.show({ title: t('Task deleted'), description: existingRecord?.title ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'CalendarPlus'}
      title={t(editing ? 'Edit Task' : 'New Task')}
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
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Create Task')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="title" label="Task Title" required placeholder={t('Follow up with Tariq Al-Dosari')} />
        <Field name="assignedTo" label="Assigned To" placeholder={t('Khalid Al-Amri')} />
        <Field name="dueDate" label="Due Date" kind="date" />
        <Field name="type" label="Type" kind="select" options={TYPE_OPTIONS} />
        <Field name="priority" label="Priority" kind="select" options={PRIORITY_OPTIONS} required />
        <Field name="status" label="Status" kind="select" options={STATUS_OPTIONS} required />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Create Task')}
        </button>
      </Form>
    </Modal>
  )
}
