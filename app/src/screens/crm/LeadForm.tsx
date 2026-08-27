import { z } from 'zod'
import { leadUpdate } from '../../../../packages/contract/src/index'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  Field,
  Form,
  FormErrorSummary,
  useUnsavedChangesGuard,
  useZodForm,
} from '@/components/ui/Form'
import { parseSar } from '@/components/ui/Money'
import { useToast } from '@/components/ui/Toast'
import { RepositoryError, useUpdate, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, asPatch, rowId, serverFieldError } from '../registry/writes'

/** Edit Lead — the design's "Edit" affordance on `LeadDetail`.
 *
 *  The lead row the API presents carries `name, company, value, source, stage,
 *  date, score`; `leadUpdate` in `packages/contract` is what the server accepts
 *  a patch against, and so it is what this form validates against — a second
 *  copy would drift. The only work the wrapper does that a raw body does not is
 *  the two things a form always has to: every control produces a string, and the
 *  display money (`"SAR 120,000"`) is turned back into the integer halalas the
 *  API stores, so the round-trip does not lose or invent riyals. */
type Lead = RowOf<'leads'>

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
    value: z.string(),
    source: z.string(),
    stage: z.string(),
    score: z.string(),
  })
  .transform((values) => {
    const company = values.company.trim()
    const source = values.source.trim()
    const score = values.score.trim()
    const value = values.value.trim()
    return {
      name: values.name.trim(),
      ...(company ? { company } : {}),
      ...(value ? { valueHalalas: Math.round(parseSar(value) * 100) } : {}),
      ...(source ? { source } : {}),
      stage: values.stage.trim() || 'new',
      ...(score ? { score: Number(score) } : {}),
    }
  })
  .pipe(leadUpdate)

type LeadFormValues = z.input<typeof leadForm>

export function LeadFormModal({
  open,
  onClose,
  lead,
}: {
  open: boolean
  onClose: () => void
  lead: Lead
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const update = useUpdate('leads')

  const form = useZodForm({
    schema: leadForm,
    initial: {
      name: lead.name ?? '',
      company: lead.company ?? '',
      value: lead.value ?? '',
      source: lead.source ?? '',
      stage: (lead.stage ?? 'new').toLowerCase(),
      score: lead.score != null ? String(lead.score) : '',
    } satisfies LeadFormValues,
    async onSubmit(values) {
      try {
        const id = rowId(lead)
        if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
        await update.mutateAsync({ id, patch: asPatch<Lead>(values) })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({ title: t('Lead updated'), description: values.name })
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
      icon="Pencil"
      title={t('Edit Lead')}
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Save Changes')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Full Name" required />
        <Field name="company" label="Company" />
        <Field name="value" label="Deal Value" kind="currency" placeholder="120,000" />
        <Field name="source" label="Lead Source" placeholder={t('Referral')} />
        <Field name="stage" label="Stage" kind="select" options={STAGE_OPTIONS} required />
        <Field name="score" label="Lead Score" hint="0–100." placeholder="82" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Save Changes')}
        </button>
      </Form>
    </Modal>
  )
}
