/** New Journal Entry modal — inline schema, no contract. */
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
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('journalEntries')

  const form = useZodForm({
    schema: journalEntryForm,
    initial: {
      date: '',
      reference: '',
      description: '',
      debitAccountCode: '',
      creditAccountCode: '',
      amount: '',
    } satisfies JournalEntryFormValues,
    async onSubmit(values) {
      try {
        await create.mutateAsync({ input: asPatch<JournalEntry>(values) })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t('Journal entry added'),
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

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon="BookOpen"
      title="New Journal Entry"
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Add Entry')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="date" label="Date" kind="date" required />
        <Field name="reference" label="Reference" required placeholder="JV-0001" />
        <Field name="description" label="Description" kind="textarea" />
        <Field name="debitAccountCode" label="Debit Account Code" required placeholder="1100" />
        <Field name="creditAccountCode" label="Credit Account Code" required placeholder="2100" />
        <Field name="amount" label="Amount (SAR)" kind="currency" required placeholder="10,000" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Add Entry')}
        </button>
      </Form>
    </Modal>
  )
}
