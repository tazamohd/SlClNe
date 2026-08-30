import { z } from 'zod'
import { leadCreate } from '@contract'
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

type Lead = RowOf<'leads'>

const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social' },
  { value: 'cold-call', label: 'Cold Call' },
  { value: 'other', label: 'Other' },
] as const

const STAGE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
] as const

const leadForm = z
  .object({
    name: z.string(),
    company: z.string(),
    source: z.string(),
    stage: z.string(),
    score: z.string(),
  })
  .transform((values) => {
    const company = values.company.trim()
    const source = values.source.trim()
    const score = values.score.trim()
    return {
      name: values.name.trim(),
      ...(company ? { company } : {}),
      ...(source ? { source } : {}),
      stage: values.stage || 'new',
      ...(score ? { score: Number(score) } : {}),
    }
  })
  .pipe(leadCreate)

type LeadFormValues = z.input<typeof leadForm>

export function LeadFormModal({
  open,
  onClose,
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  existingRecord?: Lead
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('leads')
  const update = useUpdate('leads')
  const remove = useDelete('leads')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: leadForm,
    initial: {
      name: existingRecord?.name ?? '',
      company: existingRecord?.company ?? '',
      source: existingRecord?.source ?? '',
      stage: existingRecord?.stage ?? 'new',
      score: existingRecord?.score != null ? String(existingRecord.score) : '',
    } satisfies LeadFormValues,
    async onSubmit(values) {
      try {
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Lead>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Lead>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Lead updated' : 'Lead added'),
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
      title: t('Delete Lead?'),
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
    toast.show({ title: t('Lead deleted'), description: existingRecord?.name ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'UserPlus'}
      title={t(editing ? 'Edit Lead' : 'New Lead')}
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
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Add Lead')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Name" required placeholder={t('Tariq Al-Dosari')} />
        <Field name="company" label="Company" placeholder={t('Al-Dosari Motors')} />
        <Field name="source" label="Source" kind="select" options={SOURCE_OPTIONS} />
        <Field name="stage" label="Stage" kind="select" options={STAGE_OPTIONS} />
        <Field name="score" label="Score" placeholder="0-100" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Add Lead')}
        </button>
      </Form>
    </Modal>
  )
}
