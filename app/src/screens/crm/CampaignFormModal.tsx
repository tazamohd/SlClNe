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

type Campaign = RowOf<'campaigns'>

const campaignForm = z.object({
  name: z.string().min(1).max(200),
  type: z.string().max(64).optional(),
  status: z.string().max(32).default('draft'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.string().optional(),
})

type CampaignFormValues = z.input<typeof campaignForm>

const TYPE_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
] as const

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'running', label: 'Running' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
] as const

export function CampaignFormModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('campaigns')

  const form = useZodForm({
    schema: campaignForm,
    initial: {
      name: '',
      type: 'email',
      status: 'draft',
      startDate: '',
      endDate: '',
      budget: '',
    } satisfies CampaignFormValues,
    async onSubmit(values) {
      try {
        await create.mutateAsync({ input: asPatch<Campaign>(values) })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({ title: t('Campaign created'), description: values.name })
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
      icon="Megaphone"
      title="New Campaign"
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Create Campaign')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Name" required placeholder="Summer promotion 2026" />
        <Field name="type" label="Type" kind="select" options={TYPE_OPTIONS} />
        <Field name="status" label="Status" kind="select" options={STATUS_OPTIONS} />
        <Field name="startDate" label="Start Date" kind="date" />
        <Field name="endDate" label="End Date" kind="date" />
        <Field name="budget" label="Budget" placeholder="5000" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Create Campaign')}
        </button>
      </Form>
    </Modal>
  )
}
