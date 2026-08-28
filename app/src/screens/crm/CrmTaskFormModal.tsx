import { z } from 'zod'
import { crmTaskCreate } from '@contract'
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
import { NoWritesNotice, asPatch, serverFieldError } from '../registry/writes'

/** New Task — the design's "New Task" affordance on `CRMCalendar`, backed by the
 *  now-writable `crmTasks` collection (F-027) through `useCreate('crmTasks')`.
 *
 *  `crmTaskCreate` in `packages/contract` is the server's guard, so it is the
 *  form's validator. The calendar opens this with the selected day already in
 *  the due-date field, so the task lands on the cell the user clicked. Against
 *  the fixtures the create refuses honestly with the "set VITE_API_URL" state. */
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
}: {
  open: boolean
  onClose: () => void
  defaultDueDate?: string
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('crmTasks')

  const form = useZodForm({
    schema: taskForm,
    initial: {
      title: '',
      assignedTo: '',
      dueDate: defaultDueDate,
      priority: 'medium',
      status: 'todo',
      type: 'call',
    } satisfies TaskFormValues,
    async onSubmit(values) {
      try {
        await create.mutateAsync({ input: asPatch<Task>(values) })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({ title: t('Task created'), description: values.title })
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
      icon="CalendarPlus"
      title={t('New Task')}
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Create Task')}
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
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Create Task')}
        </button>
      </Form>
    </Modal>
  )
}
