import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { ReadOnlyNotice } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import {
  Field,
  Form,
  FormErrorSummary,
  ServerValidationError,
  useUnsavedChangesGuard,
  useZodForm,
} from '@/components/ui/Form'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCreate, useUpdate, type RowOf } from '@/data/useCollection'
import { RepositoryError, isLive } from '@/data/repository'
import type { JobRow } from './stages'

/** Opening a job card, for real.
 *
 *  "New Job Card" was one of the 23 inert CTAs — it routed to the check-in
 *  screen, which then held everything in component state and forgot it. This
 *  posts to `POST /jobs` and lands on the record it created.
 *
 *  The schema mirrors `jobCardCreate` in `packages/contract`, which is what the
 *  endpoint validates against. `status` and `stage` are deliberately absent: the
 *  server defaults them to `pending`/`checkin`, and a client that sent its own
 *  guess would be the client deciding a lifecycle the server owns.
 */
const jobCardForm = z.object({
  customerName: z.string().trim().min(1, 'Enter the customer name.').max(160),
  vehicleLabel: z.string().trim().min(1, 'Enter the vehicle.').max(120),
  service: z.enum([
    'maintenance',
    'repair',
    'diagnostic',
    'inspection',
    'tire_service',
    'body_paint',
    'ac_service',
    'oil_change',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  complaint: z.string().trim().max(4000).optional(),
})

type JobCardFormValues = z.input<typeof jobCardForm>

const SERVICE_OPTIONS = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'diagnostic', label: 'Diagnostics' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'tire_service', label: 'Tire Service' },
  { value: 'body_paint', label: 'Body & Paint' },
  { value: 'ac_service', label: 'AC Service' },
  { value: 'oil_change', label: 'Oil Change' },
] as const

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'low' },
  { value: 'medium', label: 'medium' },
  { value: 'high', label: 'high' },
  { value: 'urgent', label: 'urgent' },
] as const

export function JobCardForm({
  open,
  onClose,
  /** Present for an edit; absent opens a new card. */
  job,
}: {
  open: boolean
  onClose: () => void
  job?: JobRow
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const create = useCreate('jobs')
  const update = useUpdate('jobs')
  const editing = Boolean(job)

  const form = useZodForm({
    schema: jobCardForm,
    initial: {
      customerName: job?.cust ?? '',
      vehicleLabel: job?.veh ?? '',
      service: (job?.svc ?? 'maintenance') as JobCardFormValues['service'],
      priority: (job?.pr ?? 'medium') as JobCardFormValues['priority'],
      complaint: '',
    } satisfies JobCardFormValues,
    async onSubmit(values) {
      const input = values as unknown as Partial<RowOf<'jobs'>>
      let saved: RowOf<'jobs'>
      try {
        saved = job
          ? await update.mutateAsync({
              id: job._id ?? job.id,
              patch: input,
              // The version the form was opened against, so a second editor
              // gets a 409 rather than silently overwriting the first.
              options: job._version === undefined ? undefined : { version: job._version },
            })
          : await create.mutateAsync({ input })
      } catch (cause) {
        /* A rejection the server attributed to a field belongs on that field.
         * Everything else — a permission refusal, a rule violation, the fixture
         * repository refusing writes — becomes the form-level message, because
         * a failure with nowhere to attach still has to be visible. */
        if (cause instanceof RepositoryError) {
          if (cause.field) throw new ServerValidationError({ [cause.field]: cause.message })
          throw new Error(cause.message)
        }
        throw cause
      }
      toast.show({
        title: t(editing ? 'Job card updated' : 'New Job Card'),
        description: saved.id,
      })
      onClose()
      form.reset()
      if (!editing) navigate(`/job-card-detail?id=${encodeURIComponent(saved.id)}`)
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(open && form.dirty)

  const close = async () => {
    if (form.pending) return
    if (!(await confirmDiscard())) return
    form.reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'ClipboardList'}
      title={editing ? 'Edit Job Card' : 'New Job Card'}
      description={
        editing
          ? 'Stage and status are not editable here — they move through the workflow.'
          : 'Opens the card at Check-In. The stage moves as the work does.'
      }
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending || !isLive}>
            {form.pending ? (
              t('Saving...')
            ) : (
              <>
                <Icon name={editing ? 'Check' : 'Plus'} size={16} />
                {t(editing ? 'Save Changes' : 'New Job Card')}
              </>
            )}
          </Button>
        </>
      }
    >
      {isLive ? null : (
        <ReadOnlyNotice
          message={t(
            'This build reads the design fixtures, which cannot be written to. Point VITE_API_URL at the API to save a job card.'
          )}
        />
      )}
      <Form form={form}>
        <FormErrorSummary />
        <Field name="customerName" label="Customer" required placeholder={t('Ahmed Al-Rashid')} />
        <Field name="vehicleLabel" label="Vehicle" required placeholder={t('Toyota Camry 2022')} />
        <Field name="service" label="Service" kind="select" options={SERVICE_OPTIONS} required />
        <Field name="priority" label="Priority" kind="select" options={PRIORITY_OPTIONS} required />
        <Field
          name="complaint"
          label="Reported Issues"
          kind="textarea"
          placeholder={t('Describe reported issues...')}
        />
        {/* The footer carries the visible buttons; this keeps Enter working
            from any field, which is what a keyboard user expects. */}
        <button type="submit" className="sr-only" tabIndex={-1}>
          {t(editing ? 'Save Changes' : 'New Job Card')}
        </button>
      </Form>
    </Modal>
  )
}
