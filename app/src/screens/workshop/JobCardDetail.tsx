import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import { FieldGrid, Panel, ReadField } from '@/components/ui/FieldGrid'
import { Money, parseSar } from '@/components/ui/Money'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'

/** JobCard-Detail — the print-oriented, single-page view of one job card:
 *  header pills, stage rail, customer & vehicle, assignment & schedule,
 *  service lines, parts and the cost summary.
 *
 *  Separate from `JobDetail` (the timeline deep-dive) — this design fronts the
 *  workshop paperwork instead. Costs follow the same FIELD_RULES redaction:
 *  part prices render an em dash and the totals card is dropped entirely for
 *  roles that may not see cost/margin. */
export function JobCardDetail() {
  const { t, rtl } = usePreferences()
  const { fieldHidden } = useSession()
  const [params] = useSearchParams()

  const jobsQuery = useCollection('jobs')
  const { data: jobs = [] } = jobsQuery
  const { data: vehicles = [] } = useCollection('vehicles')
  const { data: customers = [] } = useCollection('customers')
  const { data: technicians = [] } = useCollection('technicians')
  const { data: parts = [] } = useCollection('parts')

  const jobId = params.get('id')
  const job = jobId ? jobs.find((row) => row.id === jobId) : jobs[0]

  if (jobsQuery.isLoading) {
    return <p className="text-sm text-muted">{t('Loading...')}</p>
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

  const vehicle = vehicles.find((row) => row.make === job.veh)
  const customer = customers.find((row) => row.name === job.cust)
  // The design's lead tech is the first technician on the roster; the job rows
  // don't carry an assignment yet, so that stays the display rule here too.
  const technician = technicians.find((row) => row.name === LEAD_TECH) ?? technicians[0]

  const status = STATUS_PILLS[job.st] ?? STATUS_PILLS.pending
  const priority = PRIORITY_PILLS[job.pr] ?? PRIORITY_PILLS.medium
  const stage = STAGE_BY_STATUS[job.st] ?? 'Check-In'

  const hideCosts = fieldHidden('Part cost / margin')

  // Totals fall out of the arithmetic instead of being restated — the design's
  // figures (590 / 755 / 201.75 / 1,546.75) reproduce exactly.
  const partsTotal = parts.reduce((sum, part) => sum + parseSar(part.price), 0)
  const vat = (partsTotal + LABOR_TOTAL) * 0.15
  const grandTotal = partsTotal + LABOR_TOTAL + vat

  // Contact e-mail isn't in the customer table; the design derives it from the
  // first name ("ahmed@email.com"), so this reproduces that display rule.
  const email = customer ? `${customer.name.split(' ')[0]?.toLowerCase()}@email.com` : null

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <div>
        <Link
          to="/job-cards"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={14} />
          {t('Back to Job Cards')}
        </Link>
      </div>

      {/* Header — gradient chip, job number, status/priority pills, print. */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="ClipboardList" size={28} />
            </div>
          </div>
          <div>
            <h1 className="m-0 font-display text-[26px] font-black text-heading" dir="ltr">
              JC-{job.id}
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {t('Created')}: <span dir="ltr">{CREATED_AT}</span>
            </p>
          </div>
        </div>
        <div className="flex-1" />
        <HeaderPill background={status.bg} color={status.fg}>
          <Icon name={status.icon} size={14} />
          {t(status.label)}
        </HeaderPill>
        <HeaderPill background={priority.bg} color={priority.fg}>
          {priority.warn ? (
            <TriangleAlert size={14} aria-hidden />
          ) : (
            <Icon name="CircleDot" size={14} />
          )}
          {t(priority.label)}
        </HeaderPill>
        <Button variant="subtle" size="md" onClick={() => window.print()}>
          <Icon name="Printer" size={14} />
          {t('Print')}
        </Button>
      </div>

      <WorkflowStepper current={stage} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Customer & Vehicle */}
        <Panel icon="User" title={t('Customer & Vehicle')}>
          <div className="flex items-center gap-3 rounded-[10px] border border-border bg-inset p-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-sm font-bold text-white">
              {job.cust.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold text-heading">{job.cust}</p>
              {customer ? (
                <p className="mt-0.5 truncate text-xs text-muted" dir="ltr">
                  {customer.phone} · {email}
                </p>
              ) : null}
            </div>
          </div>
          <FieldGrid>
            <ReadField label={t('Vehicle')} value={job.veh} emphasis />
            <ReadField label={t('Plate')} value={vehicle?.plate ?? '—'} code emphasis />
            <ReadField label={t('Odometer Reading')} value={vehicle?.mileage ?? '—'} code emphasis />
            <ReadField label={t('Fuel Level')} value={FUEL_LEVEL} emphasis />
          </FieldGrid>
        </Panel>

        {/* Assignment & Schedule */}
        <Panel icon="Users" title={t('Assignment & Schedule')}>
          <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-inset p-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[13px] font-bold text-white">
              {technician ? technician.name.charAt(0) : '—'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[13px] font-semibold text-heading">
                {technician?.name ?? '—'}
              </p>
              <p className="mt-px text-[11px] text-muted">{t('Lead Technician')}</p>
            </div>
            {technician ? (
              <span className="text-[11px] font-semibold text-salis-blue" dir="ltr">
                ★ {technician.rating}
              </span>
            ) : null}
          </div>
          <FieldGrid>
            <ReadField label={t('Check-In Time')} value={<span dir="ltr">{SCHEDULE.checkIn}</span>} />
            <div>
              <span className="font-action text-[11px] font-medium text-muted">
                {t('Est. Completion')}
              </span>
              <p className="mt-1 text-sm font-semibold text-salis-blue" dir="ltr">
                {SCHEDULE.estCompletion}
              </p>
            </div>
            <ReadField label={t('Service Advisor')} value={SCHEDULE.advisor} />
            <ReadField label={t('Bay')} value={<span dir="ltr">{SCHEDULE.bay}</span>} />
          </FieldGrid>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Services */}
        <Panel icon="Wrench" title={t('Services')} className="gap-3">
          <div className="flex flex-col">
            {SERVICE_LINES.map((line) => {
              const tone = SERVICE_TONES[line.tone]
              return (
                <div key={line.label} className="flex items-center gap-2.5 border-b border-border py-2.5">
                  <span
                    className="flex flex-shrink-0 rounded-lg p-1.5"
                    style={{ background: tone.iconBg, color: tone.iconFg }}
                  >
                    <Icon name={line.icon} size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[13px] font-medium text-body">
                      {t(line.label)}
                      {line.kind ? ` — ${t(line.kind)}` : ''}
                    </p>
                    <p className="mt-px text-[11px] text-muted">{t(line.detail)}</p>
                  </div>
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: tone.pillBg, color: tone.pillFg }}
                  >
                    {t(line.status)}
                  </span>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Parts */}
        <Panel icon="Package" title={t('Parts')} className="gap-3">
          <div className="flex flex-col">
            {parts.map((part) => (
              <div key={part.sku} className="flex items-center gap-2.5 border-b border-border py-2">
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[13px] font-medium text-body">{t(part.name)}</p>
                  <p className="mt-px text-[11px] text-muted" dir="ltr">
                    {part.sku}
                  </p>
                </div>
                <span className="font-mono text-xs text-muted" dir="ltr">
                  ×1
                </span>
                {hideCosts ? (
                  <span className="text-[13px] text-faint" title={t('Hidden for your role')}>
                    —
                  </span>
                ) : (
                  <Money sar={parseSar(part.price)} className="text-[13px] font-semibold text-heading" />
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Cost summary — dropped, not blanked, for cost-redacted roles. */}
      {hideCosts ? null : (
        <Card className="flex w-full flex-col gap-2 p-5 sm:ms-auto sm:w-80">
          <SummaryRow label={t('Parts')} sar={partsTotal} />
          <SummaryRow label={t('Labor')} sar={LABOR_TOTAL} />
          <SummaryRow label={t('VAT (15%)')} sar={vat} />
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-xl font-extrabold text-heading">
            <span>{t('Grand Total')}</span>
            <Money sar={grandTotal} />
          </div>
        </Card>
      )}
    </div>
  )
}

function HeaderPill({
  background,
  color,
  children,
}: {
  background: string
  color: string
  children: ReactNode
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-action text-xs font-semibold"
      style={{ background, color }}
    >
      {children}
    </span>
  )
}

function SummaryRow({ label, sar }: { label: string; sar: number }) {
  return (
    <div className="flex items-center justify-between text-sm text-body">
      <span>{label}</span>
      <Money sar={sar} className="font-semibold" />
    </div>
  )
}

/** Header pill per job status — the design's palette (cyan = in progress,
 *  orange = pending/cancelled), icons limited to the generated registry. */
const STATUS_PILLS: Record<string, { icon: string; bg: string; fg: string; label: string }> = {
  pending: { icon: 'Clock', bg: 'rgba(249,115,22,.1)', fg: '#F97316', label: 'Pending' },
  assigned: { icon: 'User', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF', label: 'Assigned' },
  in_progress: { icon: 'Clock', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF', label: 'In Progress' },
  completed: { icon: 'Check', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7', label: 'Completed' },
  delivered: { icon: 'Car', bg: 'rgba(11,31,59,.1)', fg: '#0B1F3B', label: 'Delivered' },
  cancelled: { icon: 'CalendarX', bg: 'rgba(249,115,22,.1)', fg: '#F97316', label: 'Cancelled' },
}

/** Priority pill — orange + warning triangle for high/urgent (the design's
 *  "High Priority" treatment), calmer blues below that per the badge tables. */
const PRIORITY_PILLS: Record<
  string,
  { bg: string; fg: string; label: string; warn: boolean }
> = {
  urgent: { bg: 'rgba(249,115,22,.1)', fg: '#F97316', label: 'Urgent Priority', warn: true },
  high: { bg: 'rgba(249,115,22,.1)', fg: '#F97316', label: 'High Priority', warn: true },
  medium: { bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF', label: 'Medium Priority', warn: false },
  low: { bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7', label: 'Low Priority', warn: false },
}

/** Where each job status sits on the six-stage rail. The seeded in-progress
 *  job lands on Repair, matching the design's stepper. */
const STAGE_BY_STATUS: Record<string, string> = {
  pending: 'Check-In',
  assigned: 'Check-In',
  in_progress: 'Repair',
  completed: 'Delivery',
  delivered: 'Delivery',
  cancelled: 'Check-In',
}

type ServiceTone = 'done' | 'active' | 'pending'

const SERVICE_TONES: Record<
  ServiceTone,
  { iconBg: string; iconFg: string; pillBg: string; pillFg: string }
> = {
  done: {
    iconBg: 'rgba(10,94,215,.08)',
    iconFg: 'var(--salis-blue)',
    pillBg: 'rgba(10,94,215,.1)',
    pillFg: '#0A5ED7',
  },
  active: {
    iconBg: 'rgba(11,179,255,.08)',
    iconFg: '#0BB3FF',
    pillBg: 'rgba(11,179,255,.1)',
    pillFg: '#0BB3FF',
  },
  pending: {
    iconBg: 'rgba(100,116,139,.06)',
    iconFg: '#64748B',
    pillBg: 'rgba(100,116,139,.1)',
    pillFg: '#64748B',
  },
}

/** The design's three service lines on this job card. */
const SERVICE_LINES: {
  icon: string
  label: string
  kind: string | null
  detail: string
  status: string
  tone: ServiceTone
}[] = [
  {
    icon: 'Cog',
    label: 'Oil Change',
    kind: null,
    detail: 'Scheduled maintenance — 1h',
    status: 'Completed',
    tone: 'done',
  },
  {
    icon: 'Disc',
    label: 'Brake Pads (Front)',
    kind: 'Replace',
    detail: 'Repair — 1.5h',
    status: 'In Progress',
    tone: 'active',
  },
  {
    icon: 'SearchCheck',
    label: 'Multi-Point Inspection',
    kind: null,
    detail: 'Full inspection — 1h',
    status: 'Pending',
    tone: 'pending',
  },
]

const LEAD_TECH = 'Yousef Al-Otaibi'
const LABOR_TOTAL = 755
const CREATED_AT = 'Jul 22, 2026, 8:30 AM'
const FUEL_LEVEL = '3/4'
const SCHEDULE = {
  checkIn: 'Jul 22, 8:30 AM',
  estCompletion: 'Jul 22, 5:00 PM',
  advisor: 'Khalid Al-Amri',
  bay: 'Bay 3',
}
