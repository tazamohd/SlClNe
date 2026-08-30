import { z } from 'zod'
import { opportunityCreate } from '@contract'
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

type Opportunity = RowOf<'opportunities'>

const STAGE_OPTIONS = [
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' },
] as const

const opportunityForm = z
  .object({
    name: z.string(),
    company: z.string(),
    stage: z.string(),
    valueHalalas: z.string(),
    probabilityPct: z.string(),
    closeDate: z.string(),
    ownerName: z.string(),
  })
  .transform((values) => {
    const company = values.company.trim()
    const valueHalalas = values.valueHalalas.trim()
    const probabilityPct = values.probabilityPct.trim()
    const closeDate = values.closeDate.trim()
    const ownerName = values.ownerName.trim()
    return {
      name: values.name.trim(),
      ...(company ? { company } : {}),
      stage: values.stage || 'qualified',
      ...(valueHalalas ? { valueHalalas: Number(valueHalalas) } : {}),
      ...(probabilityPct ? { probabilityPct: Number(probabilityPct) } : {}),
      ...(closeDate ? { closeDate } : {}),
      ...(ownerName ? { ownerName } : {}),
    }
  })
  .pipe(opportunityCreate)

type OpportunityFormValues = z.input<typeof opportunityForm>

export function OpportunityFormModal({
  open,
  onClose,
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  existingRecord?: Opportunity
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('opportunities')
  const update = useUpdate('opportunities')
  const remove = useDelete('opportunities')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: opportunityForm,
    initial: {
      name: existingRecord?.name ?? '',
      company: existingRecord?.company ?? '',
      stage: existingRecord?.stage ?? 'qualified',
      valueHalalas: '',
      probabilityPct: existingRecord?.prob ?? '',
      closeDate: existingRecord?.close ?? '',
      ownerName: existingRecord?.owner ?? '',
    } satisfies OpportunityFormValues,
    async onSubmit(values) {
      try {
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Opportunity>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Opportunity>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Opportunity updated' : 'Opportunity added'),
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
      title: t('Delete Opportunity?'),
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
    toast.show({ title: t('Opportunity deleted'), description: existingRecord?.name ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'Target'}
      title={t(editing ? 'Edit Opportunity' : 'New Opportunity')}
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
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Add Opportunity')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Name" required placeholder={t('Fleet maintenance contract')} />
        <Field name="company" label="Company" placeholder={t('Al-Dosari Motors')} />
        <Field name="stage" label="Stage" kind="select" options={STAGE_OPTIONS} required />
        <Field name="valueHalalas" label="Value" kind="currency" />
        <Field name="probabilityPct" label="Probability %" placeholder="0-100" />
        <Field name="closeDate" label="Close Date" kind="date" />
        <Field name="ownerName" label="Owner" placeholder={t('Khalid Al-Amri')} />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Add Opportunity')}
        </button>
      </Form>
    </Modal>
  )
}
