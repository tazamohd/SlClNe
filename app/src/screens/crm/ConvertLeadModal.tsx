import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { leadConvertBody } from '../../../../packages/contract/src/index'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Field, Form, FormErrorSummary, useZodForm } from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, serverFieldError } from '../registry/writes'
import { RepositoryError, actionFailureMessage, convertLead } from './api'

/** Convert to Opportunity — the design's promise on `LeadDetail`, made real
 *  against `POST /crm/leads/:id/convert` (F-027).
 *
 *  The action is not a field update: it creates an opportunity from the lead and
 *  moves the lead to `converted` in one server transaction, and it is idempotent
 *  server-side, so a double-submit yields the same opportunity rather than two.
 *  Everything the form collects is optional — the server derives a coherent
 *  opportunity from the lead's own fields when nothing extra is given — which is
 *  why the confirm reads as "convert" with optional refinements rather than a
 *  required intake. On success the caller is taken to the opportunities the new
 *  record now lives among. */
const convertForm = z
  .object({
    ownerName: z.string(),
    probabilityPct: z.string(),
    closeDate: z.string(),
  })
  .transform((values) => {
    const ownerName = values.ownerName.trim()
    const prob = values.probabilityPct.trim()
    const closeDate = values.closeDate.trim()
    return {
      ...(ownerName ? { ownerName } : {}),
      ...(prob ? { probabilityPct: Number(prob) } : {}),
      ...(closeDate ? { closeDate } : {}),
    }
  })
  .pipe(leadConvertBody)

type ConvertFormValues = z.input<typeof convertForm>

export function ConvertLeadModal({
  open,
  onClose,
  leadRef,
  leadName,
}: {
  open: boolean
  onClose: () => void
  /** The lead's ULID or its business id — the route accepts either. */
  leadRef: string
  leadName: string
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const client = useQueryClient()

  const form = useZodForm({
    schema: convertForm,
    initial: { ownerName: '', probabilityPct: '', closeDate: '' } satisfies ConvertFormValues,
    async onSubmit(values) {
      try {
        await convertLead(leadRef, values)
      } catch (cause) {
        // A rejection the server attributed to a field belongs on that field;
        // everything else — a role refusal, a version conflict, the fixture's
        // honest "no API" — becomes a form-level message in the server's words.
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw new Error(
          cause instanceof RepositoryError
            ? actionFailureMessage(cause, t('The lead could not be converted.'))
            : t('The lead could not be converted.'),
        )
      }
      // The opportunity was created outside the query cache and the lead's stage
      // changed; refresh both so the pipeline and the opportunities list reflect
      // the conversion rather than showing the pre-convert state.
      void client.invalidateQueries({ queryKey: ['leads'] })
      void client.invalidateQueries({ queryKey: ['opportunities'] })
      toast.show({ title: t('Lead converted'), description: leadName })
      onClose()
      navigate('/opportunities')
    },
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="crud"
      icon="GitBranch"
      title={t('Convert to Opportunity')}
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={onClose} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Converting...') : t('Convert')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <p className="m-0 text-[13px] text-muted">
        {t('This creates an opportunity from the lead and moves the lead to Converted.')}
      </p>
      <Form form={form}>
        <FormErrorSummary />
        <Field name="ownerName" label="Opportunity Owner" placeholder={t('Khalid Al-Amri')} />
        <Field name="probabilityPct" label="Probability %" hint="0–100. Defaults to the lead score." placeholder="60" />
        <Field name="closeDate" label="Expected Close" kind="date" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Convert')}
        </button>
      </Form>
    </Modal>
  )
}
