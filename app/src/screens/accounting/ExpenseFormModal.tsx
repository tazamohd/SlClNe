/** New / Edit Expense modal — inline schema, no contract. */
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
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  existingRecord?: Expense
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('expenses')
  const update = useUpdate('expenses')
  const remove = useDelete('expenses')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: expenseForm,
    initial: {
      description: '',
      amount: existingRecord?.amount ?? '',
      category: existingRecord?.category ?? '',
      date: existingRecord?.date ?? '',
      vendor: existingRecord?.vendor ?? '',
      reference: '',
    } satisfies ExpenseFormValues,
    async onSubmit(values) {
      try {
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Expense>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Expense>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Expense updated' : 'Expense recorded'),
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

  const handleDelete = async () => {
    const id = rowId(existingRecord)
    if (!id) return
    const agreed = await confirm({
      title: t('Delete Expense?'),
      description: `${existingRecord?.vendor ?? ''}`,
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
    toast.show({ title: t('Expense deleted'), description: existingRecord?.vendor ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'Receipt'}
      title={t(editing ? 'Edit Expense' : 'New Expense')}
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
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Add Expense')}
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
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Add Expense')}
        </button>
      </Form>
    </Modal>
  )
}
