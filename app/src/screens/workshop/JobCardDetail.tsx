import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useDateFormat } from '@/lib/formatDate'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Panel } from '@/components/ui/FieldGrid'
import { Money, SummaryRow } from '@/components/ui/Money'
import { Avatar } from '@/components/ui/Avatar'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { EmptyState, Loading } from '@/components/ui/States'
import { useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, useUndoableDelete, type RowOf } from '@/data/useCollection'
import { MenuAction, StageActionBar, StageRail, WORKSHOP_CRUMBS } from './StageFrame'
import { StageNotice, stageBusy } from './StageNotice'
import { useJobStage } from './useJobStage'
import { STAGE_LABELS, nextStageOf, railIndexFor, railLabelFor, type JobRow } from './stages'

/** The job card as one record: who, what vehicle, which stage, what it costs.
 *
 *  The header is the one page header with the card's code as its title, its
 *  status and priority beside it, and a single primary action: advance the
 *  card to its next stage. That is the same `POST /jobs/:id/transition` the
 *  stage screens send, so the office can move a card from here without
 *  opening the stage screen — and leaving quality control or delivery asks
 *  first, because those two moves are the ones an audit reads. Print, a
 *  share link and cancelling the card sit behind "More actions".
 *
 *  `JobCardDetail.dc.html` and `JobCardDetail.Mobile.dc.html` are two different
 *  layouts, not one layout at two widths — the phone turns the six-step rail
 *  into a horizontally scrolling strip of 16px dots, stacks every panel into a
 *  single column and pins the primary action to the bottom edge. Both are here.
 *
 *  **Where this screen deviates from the design, and why.** The prototype fills
 *  its panels with figures that no column in `job_cards` holds — an estimated
 *  completion time, a service advisor, a bay, a fuel level, four invented part
 *  lines and a parts/labour split of the total. Rendering those from constants
 *  is the fake-completion this codebase gates against, and computing the money
 *  split in the browser is what Part 5b forbids outright ("the server computes,
 *  the client displays"). So each panel renders what the API actually returns
 *  and says plainly when there is nothing: an empty parts list is a fact about
 *  this job card, not a hole in the screen. The gaps are filed as requests
 *  rather than papered over.
 */
export function JobCardDetail() {
  const { t, rtl } = usePreferences()
  const { fieldHidden, can } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { confirm } = useModal()
  const toast = useToast()
  const { dateTime } = useDateFormat()

  const stage = useJobStage()
  const job = stage.job
  const cancel = useUndoableDelete('jobs', 'Job card')

  /* The links the API models: an invoice names its job card, a line names its
   * invoice. Both are server-side filters rather than a list fetched and sieved
   * in the browser. An empty id matches nothing, which is the right answer
   * while there is no job to ask about. */
  const invoices = useCollection('invoices', { filter: { jobCardId: job?._id ?? '' } })
  const invoice = invoices.data?.[0] as InvoiceRow | undefined
  const lines = useCollection('invoiceLines', { filter: { invoiceId: invoice?._id ?? '' } })

  const customers = useCollection('customers')
  const vehicles = useCollection('vehicles')
  const technicians = useCollection('technicians')

  const customer = (customers.data as readonly CustomerRow[] | undefined)?.find(
    (row) => row.name === job?.cust
  )
  const vehicle = (vehicles.data as readonly VehicleRow[] | undefined)?.find(
    (row) => row.make === job?.veh && row.owner === job?.cust
  )
  const technician = job?.assignedTechId
    ? (technicians.data as readonly TechnicianRow[] | undefined)?.find(
        (row) => row._id === job.assignedTechId
      )
    : undefined

  const hideContact = fieldHidden('Customer contact details')
  const stageLabel = railLabelFor(job?.stage)
  const next = job ? nextStageOf(job.stage) : null
  const mayEdit = can('jobcards', 'e')
  const mayCancel = can('jobcards', 'd')
  const showAdvance = Boolean(job) && mayEdit && next !== null

  async function advance() {
    if (!job || !next) return
    // Passing quality control and handing the vehicle back are the two moves
    // the audit trail is read for. Ask before either.
    if (job.stage === 'qc' || job.stage === 'delivery') {
      const agreed = await confirm({
        title: job.stage === 'qc' ? 'Pass quality control?' : 'Confirm delivery?',
        description:
          job.stage === 'qc'
            ? 'This records that the work passed its quality check and moves the card to delivery.'
            : 'This records the vehicle as handed back to the customer.',
        icon: 'ShieldCheck',
        confirmLabel: 'Advance',
      })
      if (!agreed) return
    }
    await stage.advance(next, { reason: `advanced from job card to ${next}` })
  }

  async function cancelJob() {
    if (!job) return
    const agreed = await confirm({
      title: 'Cancel this job card?',
      description: 'The card is removed from the queue. You can undo this from the notice that follows.',
      icon: 'Trash2',
      confirmLabel: 'Cancel job',
      cancelLabel: 'Keep it',
      destructive: true,
      variant: 'lifecycle',
    })
    if (!agreed) return
    try {
      await cancel.remove(job._id ?? job.id)
    } catch (cause) {
      toast.show({
        title: t('Cancel job'),
        description: cause instanceof Error ? cause.message : String(cause),
        error: true,
      })
      return
    }
    navigate('/job-cards')
  }

  function shareLink() {
    const url = window.location.href
    const copy = navigator.clipboard?.writeText(url)
    if (!copy) {
      toast.show({ title: t('Share link'), description: url, tone: 'info' })
      return
    }
    void copy.then(
      () => toast.show({ title: t('Link copied'), description: url }),
      () => toast.show({ title: t('Share link'), description: url, tone: 'info' })
    )
  }

  const advanceButton = showAdvance && next ? (
    <Button
      size={isMobile ? 'lg' : 'md'}
      loading={stage.status === 'saving'}
      loadingLabel="Saving..."
      disabled={stageBusy(stage)}
      onClick={() => void advance()}
    >
      {t('Advance')}
      <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={14} />
      {t(STAGE_LABELS[next])}
    </Button>
  ) : null

  const shared = {
    job: job as JobRow,
    customer,
    vehicle,
    technician,
    invoice,
    lines: (lines.data ?? []) as readonly LineRow[],
    linesLoading: lines.isLoading,
    hideContact,
  }

  return (
    <ScreenFrame
      icon="ClipboardList"
      title={job?.id ?? 'Job Card'}
      titleCode
      breadcrumbs={WORKSHOP_CRUMBS}
      back={{ to: '/job-cards', label: 'Back to Job Cards' }}
      status={
        job ? (
          <>
            <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
            <PriorityBadge value={job.pr} label={t(job.pr)} />
          </>
        ) : undefined
      }
      meta={
        job
          ? [
              { icon: 'Car', label: 'Vehicle', value: job.veh },
              { icon: 'Clock', label: 'Created', value: job._createdAt ? dateTime(job._createdAt) : NOT_RECORDED, code: true },
            ]
          : undefined
      }
      actions={!isMobile ? advanceButton : undefined}
      overflow={
        job ? (
          <>
            <MenuAction icon="Printer" label="Print" onClick={() => window.print()} />
            <MenuAction icon="Link" label="Share link" onClick={shareLink} />
            {mayCancel ? (
              <MenuAction icon="Trash2" label="Cancel job" destructive disabled={cancel.pending} onClick={() => void cancelJob()} />
            ) : null}
          </>
        ) : undefined
      }
      loading={stage.loading}
      error={stage.loadError ? { message: stage.loadError, onRetry: stage.reload } : null}
      notFound={
        !stage.loading && !job
          ? {
              icon: 'FileQuestion',
              title: 'Job card not found',
              description: 'It may have been deleted, or the link is out of date.',
              action: (
                <Link to="/job-cards" className="font-action text-[13px] font-medium">
                  {t('Back to Job Cards')}
                </Link>
              ),
            }
          : null
      }
      skeleton="detail"
    >
      {job ? (
        isMobile ? (
          <MobileLayout {...shared} stageLabel={stageLabel} notice={showAdvance ? <StageNotice stage={stage} /> : null}>
            {advanceButton ? <StageActionBar>{advanceButton}</StageActionBar> : null}
          </MobileLayout>
        ) : (
          <div className="grid max-w-[1200px] grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex min-w-0 flex-col gap-6">
              <StageRail job={job} current={stageLabel} />
              {showAdvance ? <StageNotice stage={stage} /> : null}

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <CustomerPanel job={job} customer={customer} vehicle={vehicle} hideContact={hideContact} />
                <AssignmentPanel job={job} technician={technician} />
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <ServicesPanel job={job} />
                <PartsPanel lines={shared.lines} loading={shared.linesLoading} invoice={invoice} />
              </div>
            </div>

            <aside className="self-start lg:sticky lg:top-6">
              <CostSummary invoice={invoice} />
            </aside>
          </div>
        )
      ) : null}
    </ScreenFrame>
  )
}

/* ------------------------------------------------------------------ mobile */

/** `JobCardDetail.Mobile.dc.html`: the compact header, a scrolling stage strip
 *  under it, then one column of cards at 16px padding, and the primary action
 *  pinned to the bottom. */
function MobileLayout({
  job,
  customer,
  vehicle,
  technician,
  invoice,
  lines,
  linesLoading,
  hideContact,
  stageLabel,
  notice,
  children,
}: SharedProps & { stageLabel: string; notice?: React.ReactNode; children?: React.ReactNode }) {
  const { t } = usePreferences()

  return (
    <div className="flex flex-col gap-3">
      <MobileStageStrip current={stageLabel} />
      {notice}

      <Card className="flex items-center gap-2.5 rounded-xl p-3.5">
        <Avatar name={job.cust} size={38} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-heading">{job.cust}</p>
          <p className="mt-px truncate text-[11px] text-muted">
            {job.veh}
            {vehicle ? <span dir="ltr" className="font-mono">{` · ${vehicle.plate}`}</span> : null}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('Check-In')} value={<CreatedAt value={job._createdAt} />} />
        <Stat
          label={t('Odometer Reading')}
          value={vehicle ? <span dir="ltr">{vehicle.mileage}</span> : NOT_RECORDED}
        />
      </div>

      <Card className="flex items-center gap-2.5 rounded-[10px] p-3">
        {technician ? (
          <>
            <Avatar name={technician.name} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-heading">{technician.name}</p>
              <p className="mt-px text-[11px] text-muted">{t('Assigned Technician')}</p>
            </div>
            {technician.rating ? (
              <span className="text-[11px] font-semibold text-salis-blue" dir="ltr">
                ★ {technician.rating}
              </span>
            ) : null}
          </>
        ) : (
          <p className="text-xs text-muted">{t('No technician assigned yet')}</p>
        )}
      </Card>

      <ServicesPanel job={job} />
      <PartsPanel lines={lines} loading={linesLoading} invoice={invoice} />
      <CostSummary invoice={invoice} />

      {hideContact || !customer ? null : (
        <Card className="flex flex-col gap-1 rounded-xl p-3.5">
          <span className="font-action text-[11px] font-medium text-muted">{t('Phone')}</span>
          <a
            href={`tel:${customer.phone.replace(/\s/g, '')}`}
            dir="ltr"
            className="inline-flex min-h-[44px] items-center font-mono text-[13px]"
          >
            {customer.phone}
          </a>
        </Card>
      )}

      {children}
    </div>
  )
}

/** The phone's stage rail: 16px dots, 11px labels, scrolls sideways rather than
 *  compressing six steps into 390px. */
function MobileStageStrip({ current }: { current: string }) {
  const { t } = usePreferences()
  const currentIndex = WORKSHOP_STAGES.indexOf(current as (typeof WORKSHOP_STAGES)[number])

  return (
    <ol
      aria-label={t('Workshop stages')}
      className="-mx-4 flex list-none items-center overflow-x-auto border-b border-border bg-card px-4 py-2 [scrollbar-width:none]"
    >
      {WORKSHOP_STAGES.map((stage, index) => {
        const isCurrent = index === currentIndex
        const isDone = index < currentIndex
        return (
          <li key={stage} className="flex flex-shrink-0 items-center">
            <span
              className="flex items-center gap-[3px]"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold',
                  isCurrent
                    ? 'bg-salis-gradient text-white'
                    : isDone
                      ? 'bg-salis-blue text-white'
                      : 'border border-border bg-inset text-muted'
                )}
              >
                {isDone ? <Icon name="Check" size={9} strokeWidth={3} aria-label={t('Completed')} /> : index + 1}
              </span>
              <span
                className={cn(
                  'whitespace-nowrap font-action text-[11px] font-semibold',
                  isCurrent ? 'text-salis-blue' : isDone ? 'text-heading' : 'text-muted'
                )}
              >
                {t(stage)}
              </span>
            </span>
            {index < WORKSHOP_STAGES.length - 1 ? (
              <span
                className={cn(
                  'mx-0.5 h-0.5 w-2.5 flex-shrink-0 rounded-sm',
                  isDone ? 'bg-salis-blue' : 'bg-border'
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------------------------------------------ panels */

function CustomerPanel({
  job,
  customer,
  vehicle,
  hideContact,
}: {
  job: JobRow
  customer?: CustomerRow
  vehicle?: VehicleRow
  hideContact: boolean
}) {
  const { t, rtl } = usePreferences()
  const contact = [customer?.phone, customer?.email].filter(Boolean).join(' · ')

  return (
    <Panel icon="User" title={rtl ? AR.customerVehicle : 'Customer & Vehicle'}>
      <div className="flex items-center gap-3 rounded-[10px] border border-border bg-inset p-3">
        <Avatar name={job.cust} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-heading">{job.cust}</p>
          {hideContact ? (
            <p className="mt-0.5 text-xs text-faint" title={t('Hidden for your role')}>
              —
            </p>
          ) : (
            <p className="mt-0.5 truncate text-xs text-muted" dir="ltr">
              {contact || '—'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Cell label={t('Vehicle')} value={job.veh} />
        <Cell label={t('Plate')} value={vehicle?.plate ?? NOT_RECORDED} code />
        <Cell label={t('Odometer Reading')} value={vehicle?.mileage ?? NOT_RECORDED} code />
        {/* The design's fourth cell is Fuel Level. Check-In captures it, no
            column stores it, and inventing "3/4" here would be exactly the
            fabricated data this rebuild exists to remove — so the cell carries
            the VIN, which the vehicle record really holds. */}
        <Cell label="VIN" value={vehicle?.vin ?? NOT_RECORDED} code />
      </div>
    </Panel>
  )
}

function AssignmentPanel({ job, technician }: { job: JobRow; technician?: TechnicianRow }) {
  const { t, rtl } = usePreferences()

  return (
    <Panel icon="Users" title={rtl ? AR.assignment : 'Assignment & Schedule'}>
      {technician ? (
        <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-inset p-3">
          <Avatar name={technician.name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-heading">{technician.name}</p>
            <p className="mt-px text-[11px] text-muted">
              {technician.specialty || (rtl ? AR.leadTechnician : 'Lead Technician')}
            </p>
          </div>
          {technician.rating ? (
            <span className="text-[11px] font-semibold text-salis-blue" dir="ltr">
              ★ {technician.rating}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="rounded-[10px] border border-border bg-inset p-3">
          <EmptyState
            icon="Users"
            title={t('No technician assigned yet')}
            description={t('Assign one from the technician schedule.')}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {/* Check-In Time is the record's own creation stamp. The design's other
            three cells — Est. Completion, Service Advisor, Bay — have no column
            in `job_cards`; service and priority are what the record does carry. */}
        <Cell label={rtl ? AR.checkInTime : 'Check-In Time'} value={<CreatedAt value={job._createdAt} />} />
        <Cell label={t('Last Updated')} value={<CreatedAt value={job._updatedAt} />} />
        <Cell
          label={t('Service')}
          value={<ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} />}
        />
        <Cell
          label={t('Priority')}
          value={<PriorityBadge value={job.pr} label={t(job.pr)} />}
        />
      </div>
    </Panel>
  )
}

/** The job's service line, with its position on the rail read as its state.
 *
 *  A job card carries exactly one service in this schema, so this is one row —
 *  the prototype's three were three different jobs' worth of work drawn onto
 *  one card. */
function ServicesPanel({ job }: { job: JobRow }) {
  const { t, rtl } = usePreferences()
  const index = railIndexFor(job.stage)
  const state = index >= 5 ? 'Completed' : index === 0 ? 'Pending' : 'In Progress'

  return (
    <Panel icon="Wrench" title={rtl ? AR.services : 'Services'}>
      <div className="flex items-center gap-2.5 py-2.5">
        <span className="flex flex-shrink-0 rounded-lg bg-salis-blue/[.08] p-1.5 text-salis-blue">
          <Icon name="Wrench" size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-body">
            {t(job.svc.replace(/_/g, ' '))}
          </p>
          <p className="mt-px text-[11px] text-muted">{t(railLabelFor(job.stage))}</p>
        </div>
        <StatusBadge value={index >= 5 ? 'completed' : index === 0 ? 'pending' : 'in_progress'} label={t(state)} />
      </div>
    </Panel>
  )
}

/** Parts consumed, read from the job's invoice lines — the only place the API
 *  records what a job actually used. */
function PartsPanel({
  lines,
  loading,
  invoice,
}: {
  lines: readonly LineRow[]
  loading: boolean
  invoice?: InvoiceRow
}) {
  const { t } = usePreferences()
  const parts = lines.filter((line) => line.kind === 'part')

  return (
    <Panel icon="Package" title={t('Parts')}>
      {loading ? (
        <Loading inline label="Loading parts..." />
      ) : parts.length === 0 ? (
        <EmptyState
          icon="Package"
          title={t('No parts recorded')}
          description={
            invoice
              ? t('This job card has an invoice, but no part lines on it yet.')
              : t('Parts appear here once they are billed to this job card.')
          }
        />
      ) : (
        <ul className="flex list-none flex-col p-0">
          {parts.map((line, index) => (
            <li
              key={line._id ?? `${line.part}-${index}`}
              className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-body">{line.desc}</p>
                {line.part ? (
                  <p className="mt-px font-mono text-[11px] text-muted" dir="ltr">
                    {line.part}
                  </p>
                ) : null}
              </div>
              <span className="flex-shrink-0 font-mono text-xs text-muted" dir="ltr">
                ×{line.qty}
              </span>
              <Money sar={line.unit} className="flex-shrink-0 text-[13px] font-semibold text-heading" />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/** The money, exactly as the server computed it.
 *
 *  The design splits the total into parts and labour. Deriving that split in
 *  the browser would be a frontend financial calculation, which Part 5b forbids
 *  — `invoices` exposes subtotal, tax and total, so those are the three rows. */
function CostSummary({ invoice, className }: { invoice?: InvoiceRow; className?: string }) {
  const { t } = usePreferences()

  if (!invoice) {
    return (
      <Card className={cn('p-5', className)}>
        <EmptyState
          icon="Receipt"
          title={t('Not invoiced yet')}
          description={t('Totals appear once this job card is invoiced.')}
        />
      </Card>
    )
  }

  return (
    <Card className={cn('flex flex-col gap-2 p-5', className)}>
      <SummaryRow label={t('Subtotal')} halalas={invoice.subtotalHalalas} />
      <SummaryRow label={t('VAT (15%)')} halalas={invoice.taxHalalas} />
      <div className="h-px bg-border" />
      <div className="flex items-center justify-between gap-3 text-xl font-extrabold text-heading">
        <span>{t('Grand Total')}</span>
        <Money sar={halalas(invoice.totalHalalas)} className="font-extrabold" />
      </div>
      <p className="text-[11px] text-muted">
        {t('Invoice')} <span dir="ltr" className="font-mono">{invoice.id}</span> ·{' '}
        {t(invoice.status)}
      </p>
    </Card>
  )
}

/* ------------------------------------------------------------------ pieces */

/** Halalas on the wire, SAR at the boundary — never the other way round. */
function halalas(value: number | undefined): number {
  return (value ?? 0) / 100
}

const NOT_RECORDED = '—'

function Cell({
  label,
  value,
  code,
}: {
  label: string
  value: React.ReactNode
  code?: boolean
}) {
  return (
    <div className="min-w-0">
      <span className="font-action text-[11px] text-muted">{label}</span>
      <p
        dir={code ? 'ltr' : undefined}
        className={cn(
          'mt-0.5 truncate font-semibold text-heading',
          code ? 'font-mono text-[13px]' : 'text-[13px]'
        )}
      >
        {value}
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="rounded-[10px] p-2.5">
      <span className="text-[11px] text-muted">{label}</span>
      <p className="mt-0.5 truncate text-xs font-semibold text-heading">{value}</p>
    </Card>
  )
}

/** An ISO stamp from the API in the session's locale, or an em dash when the
 *  row has none — which is every fixture row, because the design bundle has
 *  no timestamps. */
function CreatedAt({ value }: { value?: string }) {
  const { dateTime } = useDateFormat()
  if (!value) return <>{NOT_RECORDED}</>
  const formatted = dateTime(value)
  if (formatted === '—') return <>{NOT_RECORDED}</>
  return <span dir="ltr">{formatted}</span>
}

/** Five labels the design writes in Arabic that `data/generated/ar.ts` does not
 *  carry. That file belongs to the Arabic agent, so the strings live here, taken
 *  verbatim from `JobCardDetail.dc.html` rather than translated by guess — and
 *  they are a standing request to fold into the generated dictionary. */
const AR = {
  customerVehicle: 'العميل والمركبة',
  assignment: 'التعيين والجدول',
  leadTechnician: 'الفني الرئيسي',
  checkInTime: 'وقت الاستلام',
  services: 'الخدمات',
} as const

/* ------------------------------------------------------------------- types */

interface SharedProps {
  job: JobRow
  customer?: CustomerRow
  vehicle?: VehicleRow
  technician?: TechnicianRow
  invoice?: InvoiceRow
  lines: readonly LineRow[]
  linesLoading: boolean
  hideContact: boolean
}

/** The API adds columns the design fixtures never had (`email`, `vin`, entity
 *  metadata). Both shapes reach this screen, so the extras are optional. */
type CustomerRow = RowOf<'customers'> & { email?: string | null; _id?: string }
type VehicleRow = RowOf<'vehicles'> & { vin?: string | null; _id?: string }
type TechnicianRow = RowOf<'technicians'> & { _id?: string }
type InvoiceRow = RowOf<'invoices'> & {
  _id?: string
  jobCardId?: string | null
  subtotalHalalas?: number
  taxHalalas?: number
  totalHalalas?: number
}
type LineRow = RowOf<'invoiceLines'> & { _id?: string; invoiceId?: string }
