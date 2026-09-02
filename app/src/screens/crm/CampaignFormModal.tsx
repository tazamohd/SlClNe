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
import { NoWritesNotice, asPatch, rowId, serverFieldError } from '../registry/writes'

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
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  existingRecord?: Campaign
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('campaigns')
  const update = useUpdate('campaigns')
  const remove = useDelete('campaigns')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: campaignForm,
    initial: {
      name: existingRecord?.name ?? '',
      type: existingRecord?.type ?? 'email',
      status: existingRecord?.status ?? 'draft',
      startDate: '',
      endDate: '',
      budget: existingRecord?.budget != null ? String(existingRecord.budget) : '',
    } satisfies CampaignFormValues,
    async onSubmit(values) {
      try {
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Campaign>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Campaign>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Campaign updated' : 'Campaign created'),
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

  const handleDelete = async () => {
    const id = rowId(existingRecord)
    if (!id) return
    const agreed = await confirm({
      title: t('Delete Campaign?'),
      description: `${existingRecord?.name ?? ''}`,
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
    toast.show({ title: t('Campaign deleted'), description: existingRecord?.name ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'Megaphone'}
      title={t(editing ? 'Edit Campaign' : 'New Campaign')}
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
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Create Campaign')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Name" required placeholder={t('Summer promotion 2026')} />
        <Field name="type" label="Type" kind="select" options={TYPE_OPTIONS} />
        <Field name="status" label="Status" kind="select" options={STATUS_OPTIONS} />
        <Field name="startDate" label="Start Date" kind="date" />
        <Field name="endDate" label="End Date" kind="date" />
        <Field name="budget" label="Budget" placeholder="5000" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Create Campaign')}
        </button>
      </Form>
    </Modal>
  )
}
