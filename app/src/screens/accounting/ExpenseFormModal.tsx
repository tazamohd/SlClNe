/** New Expense modal — inline schema, no contract. */
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

type Expense = RowOf<'expenses'>

const CATEGORY_OPTIONS = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
] as const

const expenseForm = z.object({
  description: z.string().min(1),
  amount: z.string().min(1),
  category: z.string().min(1),
  date: z.string().min(1),
  vendor: z.string(),
  reference: z.string(),
}).transform((v) => ({
  description: v.description.trim(),
  amount: v.amount.trim(),
  category: v.category,
  date: v.date.trim(),
  ...(v.vendor.trim() ? { vendor: v.vendor.trim() } : {}),
  ...(v.reference.trim() ? { reference: v.reference.trim() } : {}),
}))

type ExpenseFormValues = z.input<typeof expenseForm>

export function ExpenseFormModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('expenses')

  const form = useZodForm({
    schema: expenseForm,
    initial: {
      description: '',
      amount: '',
      category: '',
      date: '',
      vendor: '',
      reference: '',
    } satisfies ExpenseFormValues,
    async onSubmit(values) {
      try {
        await create.mutateAsync({ input: asPatch<Expense>(values) })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t('Expense recorded'),
        description: values.description,
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
      icon="Receipt"
      title={t('New Expense')}
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Add Expense')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="description" label="Description" required placeholder={t('Office supplies')} />
        <Field name="amount" label="Amount (SAR)" kind="currency" required placeholder="1,500" />
        <Field name="category" label="Category" kind="select" required options={CATEGORY_OPTIONS} />
        <Field name="date" label="Date" kind="date" required />
        <Field name="vendor" label="Vendor" placeholder={t('Al-Faisal Trading')} />
        <Field name="reference" label="Reference" placeholder={t('INV-2024-001')} />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Add Expense')}
        </button>
      </Form>
    </Modal>
  )
}
