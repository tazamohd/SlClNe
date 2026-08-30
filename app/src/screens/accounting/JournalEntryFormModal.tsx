/** New / Edit Journal Entry modal — inline schema, no contract. */
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

type JournalEntry = RowOf<'journalEntries'>

const journalEntryForm = z.object({
  date: z.string().min(1),
  reference: z.string().min(1),
  description: z.string(),
  debitAccountCode: z.string().min(1),
  creditAccountCode: z.string().min(1),
  amount: z.string().min(1),
}).transform((v) => ({
  date: v.date.trim(),
  reference: v.reference.trim(),
  ...(v.description.trim() ? { description: v.description.trim() } : {}),
  debitAccountCode: v.debitAccountCode.trim(),
  creditAccountCode: v.creditAccountCode.trim(),
  amount: v.amount.trim(),
}))

type JournalEntryFormValues = z.input<typeof journalEntryForm>

export function JournalEntryFormModal({
  open,
  onClose,
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  existingRecord?: JournalEntry
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('journalEntries')
  const update = useUpdate('journalEntries')
  const remove = useDelete('journalEntries')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: journalEntryForm,
    initial: {
      date: existingRecord?.date ?? '',
      reference: existingRecord?.ref ?? '',
      description: existingRecord?.narration ?? '',
      debitAccountCode: existingRecord?.debit ?? '',
      creditAccountCode: existingRecord?.credit ?? '',
      amount: '',
    } satisfies JournalEntryFormValues,
    async onSubmit(values) {
      try {
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<JournalEntry>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<JournalEntry>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Journal entry updated' : 'Journal entry added'),
        description: values.reference,
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
      title: t('Delete Journal Entry?'),
      description: `${existingRecord?.ref ?? ''}`,
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
    toast.show({ title: t('Journal entry deleted'), description: existingRecord?.ref ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'BookOpen'}
      title={t(editing ? 'Edit Journal Entry' : 'New Journal Entry')}
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
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Add Entry')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="date" label="Date" kind="date" required />
        <Field name="reference" label="Reference" required placeholder={t('JV-0001')} />
        <Field name="description" label="Description" kind="textarea" />
        <Field name="debitAccountCode" label="Debit Account Code" required placeholder="1100" />
        <Field name="creditAccountCode" label="Credit Account Code" required placeholder="2100" />
        <Field name="amount" label="Amount (SAR)" kind="currency" required placeholder="10,000" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Add Entry')}
        </button>
      </Form>
    </Modal>
  )
}
