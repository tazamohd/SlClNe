import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading, ReadOnlyNotice } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, queryKeys, type RowOf } from '@/data/useCollection'
import { isLive } from '@/data/repository'
import { sodRuleFor } from '@/data/rbac'
import {
  isRefusal,
  transitionFailureMessage,
  transitionJob,
} from '@/screens/workshop/api'
import { railIndexFor, type JobRow } from '@/screens/workshop/stages'

/** One job, from the technician's side — `TechnicianPortal.JobDetail.dc.html`.
 *
 *  What the design invents, this screen refuses to: the ticking elapsed-time
 *  counter, the photo strip and the per-task time estimates have no backing
 *  collection, so they are absent rather than simulated. The task list is the
 *  job's real stage rail — each workshop stage done, current or ahead — and the
 *  progress figure is derived from the record, not component state.
 *
 *  Stage moves go through `POST /jobs/:id/transition`, never a PATCH: the
 *  server runs the stage machine, re-checks `jobcards:e`, and on the move into
 *  `delivery` reads the audit trail for the segregation-of-duties check. The
 *  two moves a technician meets here are drawn honestly:
 *
 *  - `repair → qc` — the design's "Complete": offered to any role holding
 *    `jobcards:e`.
 *  - `qc → delivery` — passing quality. A technician may not pass their own
 *    QC. The button stays visible and disabled with the rule spelled out,
 *    because a control that silently vanishes teaches nobody why. The role
 *    check (`jobcards:a`, which technician does not hold) and the server's
 *    audit-trail check both stand behind it (§36).
 */
export function TechnicianPortalJobDetail() {
  const { t, rtl } = usePreferences()
  const { role, can } = useSession()
  const toast = useToast()
  const client = useQueryClient()
  const [params] = useSearchParams()

  const jobs = useCollection('jobs')
  const rows = (jobs.data ?? []) as readonly JobRow[]
  const requested = params.get('id')
  const job = requested ? rows.find((row) => row.id === requested) : rows[0]

  /* Billing is read inside `<BilledParts>`, mounted only for roles that hold
   * `invoices: v` — the technician role does not, and mounting the query anyway
   * would fire a guaranteed 403 on every visit. */
  const mayseeBilling = can('invoices', 'v')

  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<{ message: string; refused: boolean } | null>(null)

  const mayEdit = can('jobcards', 'e') && isLive
  const mayPassQc = can('jobcards', 'a')
  const sodRule = sodRuleFor('Pass quality check')
  /* A role proxy, and labelled as one (see the SOD note in `data/rbac.ts`): the
   * record-level check runs server-side over the audit trail. This only decides
   * what the screen *says* — the server decides what happens. */
  const sodConflict = role === 'technician'

  async function advance(to: 'qc' | 'delivery', reason: string) {
    if (!job) return
    setSaving(true)
    setFailure(null)
    try {
      await transitionJob(job._id ?? job.id, to, reason)
    } catch (cause) {
      const message = transitionFailureMessage(cause, t('The stage could not be changed.'))
      setFailure({ message, refused: isRefusal(cause) })
      toast.show({ title: t('Job Detail'), description: message, error: true })
      setSaving(false)
      return
    }
    await client.invalidateQueries({ queryKey: queryKeys.all('jobs') })
    setSaving(false)
    toast.show({ title: t('Job Detail'), description: job.id })
  }

  if (jobs.isLoading) return <Loading label="Loading job card..." />

  if (jobs.isError) {
    return (
      <ErrorState description={jobs.error?.message} onRetry={() => void jobs.refetch()} />
    )
  }

  if (!job) {
    return (
      <Card className="p-6">
        <EmptyState
          icon="FileQuestion"
          title={t('Job card not found')}
          description={t('It may have been deleted, or the link is out of date.')}
          action={
            <Link to="/technician-portal" className="font-action text-[13px] font-medium">
              {t('Back to Home')}
            </Link>
          }
        />
      </Card>
    )
  }

  const reached = railIndexFor(job.stage)
  const doneCount = reached + 1
  const total = WORKSHOP_STAGES.length

  const atRepair = job.stage === 'repair'
  const atQc = job.stage === 'qc'
  const finished = job.stage === 'delivery' || job.stage === 'invoiced' || job.stage === 'closed'

  return (
    <div className="flex max-w-[720px] animate-fade-up flex-col gap-3.5">
      {/* Header row — back, title + code, status. */}
      <div className="flex items-center gap-2.5">
        <Link
          to="/technician-portal"
          aria-label={t('Back to Home')}
          className="flex text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[17px] font-extrabold text-heading">
            {t('Job Detail')}
          </h1>
          <p className="font-mono text-[11px] text-muted" dir="ltr">
            {job.id}
          </p>
        </div>
        <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
      </div>

      {/* Customer & vehicle. */}
      <Card className="flex items-center gap-3 p-3.5">
        <Avatar name={job.cust} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-heading">{job.cust}</p>
          <p className="mt-0.5 truncate text-xs text-muted">{job.veh}</p>
        </div>
      </Card>

      {/* Stage checklist — the record's own rail as the design's task list. */}
      <Card className="flex flex-col gap-2.5 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Icon name="ClipboardCheck" size={14} className="text-salis-blue" />
            <h2 className="text-[13px] font-bold text-heading">{t('Tasks')}</h2>
          </div>
          <span className="font-mono text-[11px] text-muted" dir="ltr">
            {doneCount}/{total}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={t('Tasks')}
          className="h-1 rounded-sm bg-inset"
        >
          <div
            className="h-full rounded-sm bg-salis-gradient transition-[width] duration-300"
            style={{ width: `${Math.round((doneCount / total) * 100)}%` }}
          />
        </div>
        <ul className="m-0 flex list-none flex-col p-0">
          {WORKSHOP_STAGES.map((label, index) => {
            const done = index < reached
            const currentStep = index === reached
            return (
              <li
                key={label}
                className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0"
                aria-current={currentStep ? 'step' : undefined}
              >
                <span
                  aria-hidden
                  className={
                    done
                      ? 'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded bg-salis-gradient text-white'
                      : currentStep
                        ? 'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border-[1.5px] border-salis-blue bg-inset'
                        : 'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border-[1.5px] border-border bg-inset'
                  }
                >
                  {done ? <Icon name="Check" size={10} strokeWidth={3} /> : null}
                </span>
                {done ? <span className="sr-only">{t('Completed')}</span> : null}
                <span
                  className={
                    done
                      ? 'flex-1 text-xs text-muted line-through'
                      : currentStep
                        ? 'flex-1 text-xs font-semibold text-heading'
                        : 'flex-1 text-xs text-body'
                  }
                >
                  {t(label)}
                </span>
                {currentStep ? (
                  <span className="rounded-full bg-tint-blue px-2.5 py-0.5 text-[10px] font-semibold text-salis-blue">
                    {t('Current')}
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>
      </Card>

      {/* Parts billed to the job — or the honest reason there are none shown. */}
      <Card className="flex flex-col gap-2.5 p-3.5">
        <div className="flex items-center gap-1.5">
          <Icon name="Package" size={14} className="text-salis-blue" />
          <h2 className="text-[13px] font-bold text-heading">{t('Parts Used')}</h2>
        </div>
        {mayseeBilling ? (
          <BilledParts jobRef={job._id ?? ''} />
        ) : (
          <p className="text-xs text-muted">
            {t('Billed parts are visible to the office — your role cannot read invoices.')}
          </p>
        )}
      </Card>

      {/* What went wrong, when something did. */}
      {failure ? (
        <Card role="alert" className="flex items-start gap-3 border-salis-orange/40 p-3.5">
          <span className="flex flex-shrink-0 rounded bg-[rgba(249,115,22,.12)] p-2 text-salis-orange">
            <Icon name={failure.refused ? 'ShieldAlert' : 'CloudOff'} size={16} />
          </span>
          <div className="min-w-0">
            <p className="font-action text-[13px] font-semibold text-heading">
              {t(failure.refused ? 'The server refused this' : "Couldn't save this")}
            </p>
            <p className="mt-0.5 text-xs text-muted">{failure.message}</p>
          </div>
        </Card>
      ) : null}

      {/* Why the button below cannot be pressed, before it is pressed. */}
      {atQc && sodConflict ? (
        <Card className="flex items-start gap-3 border-salis-orange/40 p-3.5">
          <span className="flex flex-shrink-0 rounded bg-[rgba(249,115,22,.12)] p-2 text-salis-orange">
            <Icon name="AlertTriangle" size={16} />
          </span>
          <div className="min-w-0">
            <p className="font-action text-[13px] font-semibold text-heading">
              {t('Segregation of duties')}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {sodRule
                ? t('%a and %b must not be done by the same person.')
                    .replace('%a', t(sodRule.a))
                    .replace('%b', t(sodRule.b))
                : t('The technician who performed the repair cannot pass its quality check.')}{' '}
              {t('Ask a QC inspector or the branch manager to sign off.')}
            </p>
          </div>
        </Card>
      ) : null}

      {!mayEdit && (atRepair || atQc) ? (
        <ReadOnlyNotice
          message={t(
            'This stage cannot be saved from this build: your role does not hold edit on job cards, or no API is configured.'
          )}
        />
      ) : null}

      {/* The one stage action this job offers right now. */}
      {atRepair ? (
        <Button
          size="lg"
          className="w-full"
          disabled={!mayEdit || saving}
          onClick={() => void advance('qc', 'repair complete — handed to quality control')}
        >
          <Icon name="CheckCircle" size={16} />
          {t(saving ? 'Saving...' : 'Mark Repair Complete')}
        </Button>
      ) : atQc ? (
        <Button
          size="lg"
          className="w-full"
          disabled={sodConflict || !mayPassQc || !mayEdit || saving}
          onClick={() => void advance('delivery', 'quality check passed')}
        >
          <Icon name="ShieldCheck" size={16} />
          {t(saving ? 'Saving...' : 'Pass Quality Check')}
        </Button>
      ) : finished ? (
        <Card className="flex items-center gap-2.5 p-3.5">
          <Icon name="CheckCircle" size={16} className="flex-shrink-0 text-salis-blue" />
          <p className="text-xs text-muted">
            {t('This job is through quality control. Delivery and invoicing happen at the front desk.')}
          </p>
        </Card>
      ) : (
        <Card className="flex items-center gap-2.5 p-3.5">
          <Icon name="Clock" size={16} className="flex-shrink-0 text-muted" />
          <p className="text-xs text-muted">
            {t('This job has not reached the repair bay yet — check-in, inspection and the estimate move at the service desk.')}
          </p>
        </Card>
      )}
    </div>
  )
}

/** Parts billed to this job, through its invoice — the same two links the API
 *  models that `workshop/JobDetail` reads. A separate component so the queries
 *  exist only for roles allowed to make them. */
function BilledParts({ jobRef }: { jobRef: string }) {
  const { t } = usePreferences()
  const invoices = useCollection('invoices', { filter: { jobCardId: jobRef } })
  const invoice = invoices.data?.[0] as { _id?: string } | undefined
  const lines = useCollection('invoiceLines', { filter: { invoiceId: invoice?._id ?? '' } })
  const parts = ((lines.data ?? []) as readonly LineRow[]).filter((line) => line.kind === 'part')

  if (invoices.isLoading || lines.isLoading) return <Loading inline label="Loading parts..." />
  if (parts.length === 0) {
    return (
      <p className="text-xs text-muted">
        {t('Parts appear here once they are billed to this job card.')}
      </p>
    )
  }
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {parts.map((part, index) => (
        <li
          key={part._id ?? `${part.part}-${index}`}
          className="flex items-center gap-2 border-b border-border py-1.5 text-xs last:border-b-0"
        >
          <span className="min-w-0 flex-1 truncate text-body">{part.desc}</span>
          <span className="font-mono text-[10px] text-muted" dir="ltr">
            {part.part}
          </span>
          <Money sar={part.unit} className="font-semibold text-heading" />
        </li>
      ))}
    </ul>
  )
}

type LineRow = RowOf<'invoiceLines'> & { _id?: string }
