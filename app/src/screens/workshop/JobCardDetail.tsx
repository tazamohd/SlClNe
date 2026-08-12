import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Panel } from '@/components/ui/FieldGrid'
import { Money } from '@/components/ui/Money'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { WORKSHOP_STAGES, WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { railIndexFor, railLabelFor, type JobRow } from './stages'

/** The job card as one record: who, what vehicle, which stage, what it costs.
 *
 *  `JobCardDetail.dc.html` and `JobCardDetail.Mobile.dc.html` are two different
 *  layouts, not one layout at two widths — the phone drops the sidebar for a
 *  56px bar, turns the six-step rail into a horizontally scrolling strip of
 *  16px dots, and stacks every panel into a single column. Both are here.
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
  const { fieldHidden } = useSession()
  const isMobile = useIsMobile()
  const [params] = useSearchParams()

  const jobs = useCollection('jobs')
  const requested = params.get('id')

  const rows = (jobs.data ?? []) as readonly JobRow[]
  const job = requested ? rows.find((row) => row.id === requested) : rows[0]

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

  if (jobs.isLoading) return <Loading label="Loading job card..." />

  if (jobs.isError) {
    return (
      <ErrorState
        title={t("Couldn't load this")}
        description={jobs.error?.message}
        onRetry={() => void jobs.refetch()}
      />
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
            <Link to="/job-cards" className="font-action text-[13px] font-medium">
              {t('Back to Job Cards')}
            </Link>
          }
        />
      </Card>
    )
  }

  const customer = (customers.data as readonly CustomerRow[] | undefined)?.find(
    (row) => row.name === job.cust
  )
  const vehicle = (vehicles.data as readonly VehicleRow[] | undefined)?.find(
    (row) => row.make === job.veh && row.owner === job.cust
  )
  const technician = job.assignedTechId
    ? (technicians.data as readonly TechnicianRow[] | undefined)?.find(
        (row) => row._id === job.assignedTechId
      )
    : undefined

  const hideContact = fieldHidden('Customer contact details')
  const stageLabel = railLabelFor(job.stage)

  const shared = {
    job,
    customer,
    vehicle,
    technician,
    invoice,
    lines: (lines.data ?? []) as readonly LineRow[],
    linesLoading: lines.isLoading,
    hideContact,
  }

  if (isMobile) return <MobileLayout {...shared} stageLabel={stageLabel} />

  return (
    <div className="flex max-w-[1200px] animate-fade-up flex-col gap-6">
      <div>
        <Link
          to="/job-cards"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={14} />
          {t('Back to Job Cards')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg"
              aria-hidden
            />
            <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="ClipboardList" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[26px] font-black text-heading" dir="ltr">
              {job.id}
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {t('Created')}: <CreatedAt value={job._createdAt} />
            </p>
          </div>
        </div>
        <span className="flex-1" />
        <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
        <PriorityBadge value={job.pr} label={`${t(job.pr)} ${t('Priority')}`} />
        <Button variant="subtle" size="md" onClick={() => window.print()}>
          <Icon name="Printer" size={14} />
          {t('Print')}
        </Button>
      </div>

      <WorkflowStepper current={stageLabel} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CustomerPanel
          job={job}
          customer={customer}
          vehicle={vehicle}
          hideContact={hideContact}
        />
        <AssignmentPanel job={job} technician={technician} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ServicesPanel job={job} />
        <PartsPanel lines={shared.lines} loading={shared.linesLoading} invoice={invoice} />
      </div>

      <div className="flex justify-end">
        <CostSummary invoice={invoice} className="w-full sm:w-[320px]" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ mobile */

/** `JobCardDetail.Mobile.dc.html`: a 56px bar with the code and both pills, a
 *  scrolling stage strip under it, then one column of cards at 16px padding. */
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
}: SharedProps & { stageLabel: string }) {
  const { t, rtl } = usePreferences()

  return (
    <div className="-mx-4 -my-4 flex flex-col">
      <div className="flex items-center gap-2.5 border-b border-border bg-sidebar px-4 py-3.5">
        <Link to="/job-cards" aria-label={t('Back to Job Cards')} className="flex text-muted">
          <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={20} />
        </Link>
        <h1
          className="min-w-0 flex-1 truncate font-display text-[17px] font-extrabold text-heading"
          dir="ltr"
        >
          {job.id}
        </h1>
        <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
        <PriorityBadge value={job.pr} label={t(job.pr)} />
      </div>

      <MobileStageStrip current={stageLabel} />

      <div className="flex animate-fade-up flex-col gap-3 p-4">
        <Card className="flex items-center gap-2.5 rounded-xl p-3.5">
          <Avatar name={job.cust} size={38} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-heading">{job.cust}</p>
            <p className="mt-px truncate text-[11px] text-muted">
              {job.veh}
              {vehicle ? ` · ${vehicle.plate}` : ''}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Stat label={t('Check-In')} value={<CreatedAt value={job._createdAt} short />} />
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
                <p className="mt-px text-[10px] text-muted">{t('Assigned Technician')}</p>
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
              className="font-mono text-[13px]"
            >
              {customer.phone}
            </a>
          </Card>
        )}
      </div>
    </div>
  )
}

/** The phone's stage rail: 16px dots, 9px labels, scrolls sideways rather than
 *  compressing six steps into 390px. */
function MobileStageStrip({ current }: { current: string }) {
  const { t } = usePreferences()
  const currentIndex = WORKSHOP_STAGES.indexOf(current as (typeof WORKSHOP_STAGES)[number])

  return (
    <ol className="flex list-none items-center overflow-x-auto border-b border-border bg-card px-4 py-2">
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
                {isDone ? <Icon name="Check" size={9} strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  'whitespace-nowrap font-action text-[9px] font-semibold',
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
        <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue">
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

function SummaryRow({ label, halalas: value }: { label: string; halalas?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-body">
      <span>{label}</span>
      <Money sar={halalas(value)} className="font-semibold" />
    </div>
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
      <span className="text-[10px] text-muted">{label}</span>
      <p className="mt-0.5 truncate text-xs font-semibold text-heading">{value}</p>
    </Card>
  )
}

function Avatar({ name, size }: { name: string; size: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.35) }}
      className="flex flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient font-bold text-white"
    >
      {name.trim()[0] ?? '?'}
    </span>
  )
}

/** An ISO stamp from the API, or an em dash when the row has none — which is
 *  every fixture row, because the design bundle has no timestamps. */
function CreatedAt({ value, short }: { value?: string; short?: boolean }) {
  if (!value) return <>{NOT_RECORDED}</>
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return <>{NOT_RECORDED}</>
  return (
    <span dir="ltr">{(short ? SHORT_STAMP : STAMP).format(date)}</span>
  )
}

/* Latin dates, pinned LTR, matching the server's own `dateUS` presentation so
 * one record does not read two ways depending on which endpoint served it. */
const STAMP = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const SHORT_STAMP = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

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
