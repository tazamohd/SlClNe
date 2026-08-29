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
import { NoWritesNotice, asPatch, serverFieldError } from '../registry/writes'

type Segment = RowOf<'segments'>

const segmentForm = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  type: z.string().max(64).optional(),
})

type SegmentFormValues = z.input<typeof segmentForm>

const TYPE_OPTIONS = [
  { value: 'demographic', label: 'Demographic' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'geographic', label: 'Geographic' },
  { value: 'custom', label: 'Custom' },
] as const

export function SegmentFormModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('segments')

  const form = useZodForm({
    schema: segmentForm,
    initial: {
      name: '',
      description: '',
      type: 'demographic',
    } satisfies SegmentFormValues,
    async onSubmit(values) {
      try {
        await create.mutateAsync({ input: asPatch<Segment>(values) })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({ title: t('Segment created'), description: values.name })
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
      icon="Users"
      title={t('New Segment')}
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Create Segment')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Name" required placeholder={t('High-value fleet customers')} />
        <Field name="description" label="Description" kind="textarea" placeholder={t('Customers with 5+ vehicles and monthly spend over SAR 10,000')} />
        <Field name="type" label="Type" kind="select" options={TYPE_OPTIONS} />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Create Segment')}
        </button>
      </Form>
    </Modal>
  )
}
