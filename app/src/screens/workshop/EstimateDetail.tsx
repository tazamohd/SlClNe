import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/DataTable'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'

/** VAT rate for KSA (ZATCA). */
const VAT_RATE = 0.15

/** The priced lines behind the estimate — the same lines WorkshopEstimate
 *  itemises. The design's breakdown (Parts 590, Labor 755, subtotal 1,345,
 *  VAT 201.75, total 1,546.75) falls out of this arithmetic rather than being
 *  hardcoded, so an edited line can't leave the footer disagreeing. */
const PARTS = [
  { desc: 'Oil Filter (Toyota)', qty: 1, unit: 45 },
  { desc: 'Brake Pads (Front)', qty: 1, unit: 310 },
  { desc: 'Air Filter (Universal)', qty: 1, unit: 95 },
  { desc: 'Spark Plug Set', qty: 1, unit: 140 },
] as const

const LABOUR = [
  { desc: 'Maintenance: Diagnostics', hours: 1.5, rate: 150 },
  { desc: 'Repair: Brakes & Suspension', hours: 2.0, rate: 180 },
  { desc: 'Inspection: Multi-Point Inspection', hours: 1.0, rate: 170 },
] as const

type Urgency = 'urgent' | 'required' | 'suggested'

/** [pill bg, pill fg, icon-chip classes, row wash classes] — orange is urgency,
 *  blue is required work, slate is a mere suggestion. Never green/red (§7). */
const URGENCY: Record<Urgency, { label: string; bg: string; fg: string; chip: string; row: string }> = {
  urgent: {
    label: 'Urgent',
    bg: 'rgba(249,115,22,.1)',
    fg: '#F97316',
    chip: 'bg-[rgba(249,115,22,.08)] text-salis-orange',
    row: 'bg-[rgba(249,115,22,.02)]',
  },
  required: {
    label: 'Required',
    bg: 'rgba(10,94,215,.1)',
    fg: '#0A5ED7',
    chip: 'bg-[rgba(10,94,215,.08)] text-salis-blue',
    row: '',
  },
  suggested: {
    label: 'Suggested',
    bg: 'rgba(100,116,139,.1)',
    fg: '#64748B',
    chip: 'bg-[rgba(100,116,139,.06)] text-[#64748B]',
    row: '',
  },
}

const RECOMMENDED: readonly {
  icon: string
  title: string
  action: string
  reason: string
  sar: number
  urgency: Urgency
}[] = [
  {
    icon: 'Disc',
    title: 'Brake Pads (Front)',
    action: 'Replace',
    reason: '85% worn — immediate replacement recommended',
    sar: 535,
    urgency: 'urgent',
  },
  {
    icon: 'Cog',
    title: 'Oil Change',
    action: 'Full Service',
    reason: '10,000 km since last change',
    sar: 590,
    urgency: 'required',
  },
  {
    icon: 'Zap',
    title: 'Air Filter (Universal)',
    action: 'Replace',
    reason: 'Dirty — affecting performance',
    sar: 95,
    urgency: 'suggested',
  },
]

/** Inspection results the estimate was built from. Fail is orange, pass is
 *  brand blue — the design system has no green. */
const FINDINGS: readonly { label: string; pass: boolean }[] = [
  { label: 'Oil Level', pass: false },
  { label: 'Brake Pads', pass: false },
  { label: 'Coolant', pass: true },
  { label: 'Battery', pass: true },
  { label: 'Tire Tread', pass: true },
  { label: 'Headlights', pass: true },
]

/** Header pill derived from the row's status instead of the design's fixed
 *  "Awaiting Approval" — a draft or already-approved estimate shouldn't claim
 *  to be waiting on anyone. */
const STATUS_PILL: Record<string, { icon: string; label: string; bg: string; fg: string }> = {
  draft: { icon: 'FileText', label: 'Draft', bg: 'rgba(100,116,139,.1)', fg: '#64748B' },
  sent: { icon: 'Clock', label: 'Awaiting Approval', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
  approved: { icon: 'CheckCircle', label: 'Approved', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
}

/** A single estimate: recommended services, the inspection findings behind
 *  them, and a cost breakdown computed from the priced lines.
 *
 *  Approve is bounded by the signed-in role's SAR ceiling (README §4) — the
 *  screen says so up front rather than letting the button fail. The figures
 *  shown are the customer-facing quote, not part cost/margin, so no
 *  field-level redaction applies here. */
export function EstimateDetail() {
  const { t, rtl } = usePreferences()
  const { can, canApprove, roleMeta } = useSession()
  const toast = useToast()
  const [params] = useSearchParams()
  const { data: estimates = [], isLoading } = useCollection('estimates')

  const estimateId = params.get('id')
  const estimate = estimateId ? estimates.find((row) => row.id === estimateId) : estimates[0]

  if (isLoading) {
    return <p className="text-sm text-muted">{t('Loading...')}</p>
  }

  if (!estimate) {
    return (
      <Card className="p-6">
        <EmptyState
          icon="SearchX"
          title={t('Estimate not found')}
          description={t('It may have been deleted, or the link is out of date.')}
          action={
            <Link to="/estimates" className="font-action text-[13px] font-medium">
              {t('Estimates')}
            </Link>
          }
        />
      </Card>
    )
  }

  const partsTotal = PARTS.reduce((sum, row) => sum + row.qty * row.unit, 0)
  const labourTotal = LABOUR.reduce((sum, row) => sum + row.hours * row.rate, 0)
  const subtotal = partsTotal + labourTotal
  const vat = subtotal * VAT_RATE
  const grandTotal = subtotal + vat

  const mayApprove = canApprove(grandTotal)
  const limit = roleMeta.limit
  const status = STATUS_PILL[estimate.status] ?? STATUS_PILL.draft

  function approve() {
    if (!mayApprove) {
      toast.show({
        title: t('Above your approval limit'),
        description: t('Sent to the approval inbox for sign-off.'),
      })
      return
    }
    toast.show({ title: t('Approved'), description: t('Estimate approved') })
  }

  function decline() {
    toast.show({ title: t('Declined'), description: t('The estimate was declined.') })
  }

  function sendToCustomer() {
    toast.show({
      title: t('Send to Customer'),
      description: t('Estimate sent to the customer for approval.'),
    })
  }

  return (
    <div className="flex max-w-[1100px] flex-col gap-6">
      <div>
        <Link
          to="/estimates"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Estimates')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-lg"
              aria-hidden
            />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="FileCheck" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[26px] font-black text-heading" dir="ltr">
              {estimate.id}
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {estimate.cust} · {estimate.veh}
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5">
          <Badge
            background={status.bg}
            color={status.fg}
            className="gap-1.5 px-3.5 py-1.5 font-action font-semibold"
          >
            <Icon name={status.icon} size={14} />
            {t(status.label)}
          </Badge>
          {/* Sending the quote is an edit on the estimate; view-only roles
              shouldn't be messaging customers. */}
          {can('estimates', 'e') ? (
            <Button variant="subtle" size="md" onClick={sendToCustomer}>
              <Icon name="Send" size={14} />
              {t('Send to Customer')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-3.5 p-5">
            <div className="flex items-center gap-2">
              <Icon name="Wrench" size={16} className="text-salis-blue" />
              <h3 className="text-sm font-bold text-heading">{t('Recommended Services')}</h3>
            </div>
            {RECOMMENDED.map((service) => {
              const urgency = URGENCY[service.urgency]
              return (
                <div
                  key={service.title}
                  className={cn(
                    'flex items-start gap-3 rounded-[10px] border border-border p-3',
                    urgency.row
                  )}
                >
                  <span className={cn('flex flex-shrink-0 rounded-lg p-1.5', urgency.chip)}>
                    <Icon name={service.icon} size={14} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-heading">
                      {t(service.title)} — {t(service.action)}
                    </p>
                    <p className="mt-1 text-xs leading-[1.4] text-muted">{t(service.reason)}</p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <Badge
                      background={urgency.bg}
                      color={urgency.fg}
                      className="text-[10px] font-semibold"
                    >
                      {t(urgency.label)}
                    </Badge>
                    <Money sar={service.sar} className="mt-1 block text-[13px] font-bold text-heading" />
                  </div>
                </div>
              )
            })}
          </Card>

          <Card className="flex flex-col gap-1 p-5">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="SearchCheck" size={16} className="text-salis-blue" />
              <h3 className="text-sm font-bold text-heading">{t('Inspection Findings')}</h3>
            </div>
            {FINDINGS.map((finding) => (
              <div
                key={finding.label}
                className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0"
              >
                <span
                  aria-hidden
                  className={cn(
                    'h-2 w-2 flex-shrink-0 rounded-full',
                    finding.pass ? 'bg-salis-blue' : 'bg-salis-orange'
                  )}
                />
                <span className="flex-1 text-[13px] text-body">{t(finding.label)}</span>
                <Badge
                  background={finding.pass ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'}
                  color={finding.pass ? '#0A5ED7' : '#F97316'}
                  className="text-[10px] font-semibold"
                >
                  {finding.pass ? t('Pass') : t('Fail')}
                </Badge>
              </div>
            ))}
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-2.5 p-5 lg:sticky lg:top-6">
            <h3 className="text-sm font-bold text-heading">{t('Cost Breakdown')}</h3>
            <CostRow label={t('Parts')} sar={partsTotal} />
            <CostRow label={t('Labor')} sar={labourTotal} />
            <div className="h-px bg-border" aria-hidden />
            <CostRow label={t('Subtotal')} sar={subtotal} />
            <CostRow label={t('VAT (15%)')} sar={vat} />
            <div className="h-px bg-border" aria-hidden />
            <div className="flex items-center justify-between text-lg font-extrabold text-heading">
              <span>{t('Grand Total')}</span>
              <Money sar={grandTotal} className="font-extrabold" />
            </div>
            <div className="mt-2 flex gap-2">
              {/* Decline is the destructive path — orange, per §7. */}
              <Button
                variant="outline"
                onClick={decline}
                className="h-12 flex-1 border-salis-orange text-salis-orange hover:bg-[rgba(249,115,22,.08)] md:h-[42px]"
              >
                {t('Decline')}
              </Button>
              <Button onClick={approve} className="h-12 flex-1 md:h-[42px]">
                {t('Approve')}
              </Button>
            </div>
            {/* Say up front where Approve will actually land, instead of
                letting the ceiling be discovered by pressing the button. */}
            {!mayApprove ? (
              <p className="flex items-start gap-1.5 text-xs text-muted">
                <Icon name="Info" size={14} className="mt-px flex-shrink-0 text-salis-blue" />
                {limit === 0
                  ? t('Your role cannot approve estimates — this will be sent for sign-off.')
                  : `${t('Above your approval limit')} (${t('Limit')}: SAR ${limit?.toLocaleString('en-US')})`}
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  )
}

function CostRow({ label, sar }: { label: string; sar: number }) {
  return (
    <div className="flex items-center justify-between text-[13px] text-body">
      <span>{label}</span>
      <Money sar={sar} className="font-semibold" />
    </div>
  )
}
