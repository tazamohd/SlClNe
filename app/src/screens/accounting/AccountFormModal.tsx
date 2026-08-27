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

type Account = RowOf<'chartOfAccounts'>

const accountForm = z
  .object({
    code: z.string().min(1).max(20),
    name: z.string().min(1).max(200),
    type: z.string().min(1).max(64),
    parentCode: z.string().max(20).optional(),
  })
  .transform((v) => ({
    code: v.code.trim(),
    name: v.name.trim(),
    type: v.type,
    ...(v.parentCode?.trim() ? { parentCode: v.parentCode.trim() } : {}),
  }))

type AccountFormValues = z.input<typeof accountForm>

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' },
] as const

export function AccountFormModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('chartOfAccounts')

  const form = useZodForm({
    schema: accountForm,
    initial: {
      code: '',
      name: '',
      type: '',
      parentCode: '',
    } satisfies AccountFormValues,
    async onSubmit(values) {
      try {
        await create.mutateAsync({ input: asPatch<Account>(values) })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t('Account added'),
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
      icon="BookOpen"
      title={t('Add Account')}
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Add Account')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="code" label="Account Code" required placeholder="1100" />
        <Field name="name" label="Account Name" required placeholder={t('Cash on Hand')} />
        <Field
          name="type"
          label="Account Type"
          kind="select"
          required
          options={ACCOUNT_TYPES}
        />
        <Field name="parentCode" label="Parent Code" hint="Parent account code" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Add Account')}
        </button>
      </Form>
    </Modal>
  )
}
