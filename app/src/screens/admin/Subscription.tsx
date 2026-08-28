import { useState, type ReactNode } from 'react'
// Not in the generated icon registry (it only ships names the design bundle
// referenced) — imported directly per the unregistered-icon convention.
import { AlertTriangle, ArrowUpCircle, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** Subscription (Subscription.dc.html / .Mobile.dc.html): the garage's plan,
 *  its usage against that plan's caps, and its billing history.
 *
 *  There is no `subscription` collection in `repository.ts` yet — the plan
 *  tiers, usage figures, payment method and billing history below are typed
 *  local consts marked as the future `GET /subscription` read, same pattern
 *  as `Backup.tsx` and `Branches.tsx`.
 *
 *  Departures from the prototype, which only ever rendered "PRO" and three
 *  flat "SAR 499" rows:
 *  - "Manage Plan" now does something — it reveals the plan tiers to upgrade
 *    into and the cancel action, both gated on `can('settings', …)` and
 *    acknowledged with a toast, since the mock repository can't persist a
 *    real plan change.
 *  - The current charge is derived from the plan's per-seat rate × seats in
 *    use, then VAT — not a hardcoded figure — the same reasoning the handoff
 *    README gives for `Payments` and `InvoiceCreate`.
 *  - Cancelling requires an explicit in-screen confirm step instead of firing
 *    on the first click, mirroring `LogoutConfirmation`.
 */

type PlanId = 'starter' | 'pro' | 'enterprise'

interface PlanTier {
  id: PlanId
  name: string
  /** SAR per active user, per month. */
  seatRate: number
  /** Included seats; null = unlimited. */
  seatCap: number | null
  storageGb: number
  /** Included vehicles; null = unlimited. */
  vehicleCap: number | null
}

const VAT_RATE = 0.15
const CURRENT_PLAN_ID: PlanId = 'pro'
const NEXT_BILLING_DATE = 'Aug 20, 2026'

const PLAN_TIERS: readonly PlanTier[] = [
  { id: 'starter', name: 'Starter', seatRate: 29, seatCap: 5, storageGb: 5, vehicleCap: 100 },
  { id: 'pro', name: 'Pro', seatRate: 49, seatCap: 15, storageGb: 20, vehicleCap: null },
  { id: 'enterprise', name: 'Enterprise', seatRate: 79, seatCap: null, storageGb: 100, vehicleCap: null },
]

/** The design's three usage tiles. No `usage` collection exists yet either. */
const USAGE = { seatsUsed: 8, storageUsedGb: 4.2 }

interface BillingRow {
  id: string
  date: string
  amountSar: number
}

/** The design's three flat SAR 499 rows, given invoice numbers per the
 *  billing-table idiom in `Invoices.tsx` — the prototype's rows carried none. */
const BILLING_HISTORY: readonly BillingRow[] = [
  { id: 'SUB-2026-07', date: 'Jul 20, 2026', amountSar: 499 },
  { id: 'SUB-2026-06', date: 'Jun 20, 2026', amountSar: 499 },
  { id: 'SUB-2026-05', date: 'May 20, 2026', amountSar: 499 },
]

const PAYMENT_METHOD = { brand: 'Visa', last4: '4242', expiry: '09/28' }

export function Subscription() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()

  const canUpgrade = can('settings', 'e')
  const canCancel = can('settings', 'x')

  const [managing, setManaging] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelPending, setCancelPending] = useState(false)

  const currentPlan = PLAN_TIERS.find((plan) => plan.id === CURRENT_PLAN_ID) ?? PLAN_TIERS[1]
  const currentRank = PLAN_TIERS.findIndex((plan) => plan.id === CURRENT_PLAN_ID)

  // Computed from parts rather than hardcoded: per-seat rate × seats in use,
  // then VAT. Won't match the prototype's flat "SAR 499" and doesn't need to —
  // that figure never accounted for seats either.
  const subtotal = currentPlan.seatRate * USAGE.seatsUsed
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat

  const upgrade = (plan: PlanTier) => {
    toast.show({
      title: t('Upgrade requested'),
      description: `${t('A request to switch to')} ${t(plan.name)} ${t('has been sent.')}`,
    })
    setManaging(false)
  }

  const confirmCancel = () => {
    setCancelPending(true)
    setConfirmingCancel(false)
    toast.show({
      title: t('Subscription cancelled'),
      description: `${t('Access continues until')} ${NEXT_BILLING_DATE}`,
    })
  }

  const updatePaymentMethod = () => {
    toast.show({
      title: t('Payment Method'),
      description: t('Payment method updates are not available in this demo.'),
    })
  }

  const columns: Column<BillingRow>[] = [
    { header: 'Invoice #', cell: (row) => row.id, code: true },
    { header: 'Date', cell: (row) => <span dir="ltr">{row.date}</span> },
    {
      header: 'Amount',
      cell: (row) => <Money sar={row.amountSar} className="font-semibold" />,
    },
    {
      header: 'Status',
      cell: () => (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Paid')}
        </Badge>
      ),
    },
  ]

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-5 md:gap-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-[12px]" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="CreditCard" size={28} />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-black text-heading md:text-[26px]">
            {t('Subscription')}
          </h1>
          <p className="mt-0.5 text-sm text-muted">{t('Billing & Subscription')}</p>
        </div>
      </div>

      {/* Current plan hero — the design's blue gradient card. */}
      <div className="flex flex-col gap-5 rounded-2xl bg-salis-gradient p-5 text-white shadow-[0_12px_24px_rgba(10,94,215,.25)] sm:flex-row sm:items-center sm:justify-between md:p-7">
        <div className="min-w-0">
          <p className="m-0 text-[13px] opacity-85">{t('Current Plan')}</p>
          <h2 className="m-0 mt-1.5 font-display text-2xl font-black md:text-[28px]">
            {t(currentPlan.name).toUpperCase()}
          </h2>
          <p className="m-0 mt-1.5 text-[13px] opacity-90">
            {cancelPending ? t('Cancels on') : t('Next Billing Date')}
            : <span dir="ltr">{NEXT_BILLING_DATE}</span>
          </p>
        </div>
        <Button
          size="md"
          className="self-start border-none bg-white text-salis-blue shadow-none hover:translate-y-0 hover:bg-white hover:text-salis-blue hover:shadow-none sm:self-auto"
          onClick={() => setManaging((value) => !value)}
          aria-expanded={managing}
        >
          {t('Manage Plan')}
          <Icon
            name="ChevronDown"
            size={14}
            className={cn('transition-transform duration-200', managing && 'rotate-180')}
          />
        </Button>
      </div>

      {/* Usage against the plan's caps — collapses to 2 columns under 860px,
          matching Subscription.Mobile.dc.html's grid. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
        <UsageTile
          label={t('Users')}
          value={`${USAGE.seatsUsed} / ${currentPlan.seatCap ?? '∞'}`}
          pct={currentPlan.seatCap ? (USAGE.seatsUsed / currentPlan.seatCap) * 100 : null}
        />
        <UsageTile
          label={t('Storage')}
          value={`${USAGE.storageUsedGb} / ${currentPlan.storageGb} GB`}
          pct={(USAGE.storageUsedGb / currentPlan.storageGb) * 100}
        />
        <UsageTile
          label={t('Vehicles')}
          value={currentPlan.vehicleCap ? String(currentPlan.vehicleCap) : t('Unlimited')}
          pct={null}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        {/* Estimated next charge — computed from the per-seat rate and seats
            in use rather than a hardcoded total. */}
        <Card className="flex flex-col gap-2.5 p-4 md:p-5">
          <h3 className="text-[15px] font-bold text-heading">
            {t('Estimated Next Charge')}
          </h3>
          <ChargeRow
            label={t('Per-seat rate')}
            value={<Money sar={currentPlan.seatRate} className="text-body" />}
          />
          <ChargeRow
            label={t('Seats in use')}
            value={<span dir="ltr">{USAGE.seatsUsed}</span>}
          />
          <ChargeRow label={t('Subtotal')} value={<Money sar={subtotal} className="text-body" />} />
          <ChargeRow
            label={`${t('VAT')} (${(VAT_RATE * 100).toFixed(0)}%)`}
            value={<Money sar={vat} className="text-body" />}
          />
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2.5">
            <span className="text-sm font-semibold text-heading">{t('Total')}</span>
            <Money sar={total} className="text-base font-bold text-salis-blue" />
          </div>
        </Card>

        {/* Payment method. */}
        <Card className="flex flex-col gap-3 p-4 md:p-5">
          <h3 className="text-[15px] font-bold text-heading">{t('Payment Method')}</h3>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-inset px-3.5 py-3">
            <span className="flex flex-shrink-0 rounded-md bg-[rgba(10,94,215,.1)] p-2 text-salis-blue">
              <Icon name="CreditCard" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-semibold text-heading" dir="ltr">
                {t(PAYMENT_METHOD.brand)} •••• {PAYMENT_METHOD.last4}
              </p>
              <p className="m-0 mt-0.5 text-xs text-muted" dir="ltr">
                {t('Expires')} {PAYMENT_METHOD.expiry}
              </p>
            </div>
          </div>
          {canUpgrade ? (
            <Button variant="outline" size="sm" className="self-start" onClick={updatePaymentMethod}>
              <Icon name="Pencil" size={13} />
              {t('Update payment method')}
            </Button>
          ) : null}
        </Card>
      </div>

      {/* Plan management — revealed by "Manage Plan". Hidden by default so the
          page matches the design at rest. */}
      {managing ? (
        <Card className="flex flex-col gap-4 p-4 md:p-5">
          <h3 className="text-[15px] font-bold text-heading">
            {t('Plan Tiers')}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PLAN_TIERS.map((plan, rank) => {
              const isCurrent = plan.id === currentPlan.id
              const isUpgrade = rank > currentRank
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'flex flex-col gap-2.5 rounded-xl border p-4',
                    isCurrent ? 'border-salis-blue bg-[rgba(10,94,215,.04)]' : 'border-border'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-heading">{t(plan.name)}</span>
                    {isCurrent ? (
                      <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
                        {t('Current Plan')}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="m-0 font-mono text-lg font-bold text-heading" dir="ltr">
                    {formatSar(plan.seatRate, { bare: true })}
                  </p>
                  <p className="-mt-2 text-xs text-muted">
                    {t('SAR / seat / month')}
                  </p>
                  <ul className="m-0 flex list-none flex-col gap-1 p-0 text-xs text-muted">
                    <li>
                      {plan.seatCap ? `${plan.seatCap} ${t('Users')}` : `${t('Unlimited')} ${t('Users')}`}
                    </li>
                    <li>
                      {plan.storageGb} GB {t('Storage')}
                    </li>
                    <li>
                      {plan.vehicleCap
                        ? `${plan.vehicleCap} ${t('Vehicles')}`
                        : `${t('Unlimited')} ${t('Vehicles')}`}
                    </li>
                  </ul>
                  {isUpgrade && canUpgrade ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 border-salis-orange text-salis-orange hover:bg-salis-orange hover:text-white"
                      onClick={() => upgrade(plan)}
                    >
                      <ArrowUpCircle size={14} aria-hidden />
                      {`${t('Upgrade to')} ${t(plan.name)}`}
                    </Button>
                  ) : null}
                </div>
              )
            })}
          </div>

          {canCancel ? (
            <div className="border-t border-border pt-4">
              {cancelPending ? (
                <p className="m-0 flex items-center gap-2 text-[13px] text-muted">
                  <CheckCircle size={15} className="text-salis-blue" aria-hidden />
                  {`${t('Cancellation scheduled — access continues until')} ${NEXT_BILLING_DATE}`}
                </p>
              ) : confirmingCancel ? (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-inset p-3.5">
                  <p className="m-0 flex items-start gap-2 text-[13px] text-body">
                    <AlertTriangle
                      size={16}
                      className="mt-0.5 flex-shrink-0 text-muted"
                      aria-hidden
                    />
                    {`${t('Auto-renewal will stop. You keep access until')} ${NEXT_BILLING_DATE}.`}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <Button size="sm" onClick={() => setConfirmingCancel(false)}>
                      {t('Keep Subscription')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={confirmCancel}>
                      {t('Confirm Cancellation')}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setConfirmingCancel(true)}>
                  <XCircle size={14} aria-hidden />
                  {t('Cancel Subscription')}
                </Button>
              )}
            </div>
          ) : null}
        </Card>
      ) : null}

      {/* Billing history — the billing-table idiom from Invoices.tsx. */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-heading">{t('Billing History')}</h3>
        <DataTable
          columns={columns}
          rows={BILLING_HISTORY}
          rowKey={(row) => row.id}
          mobileCard={(row) => (
            <>
              <MobileCardHeader
                title={row.id}
                code
                trailing={
                  <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
                    {t('Paid')}
                  </Badge>
                }
              />
              <MobileCardRow label={t('Date')}>
                <span dir="ltr">{row.date}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money sar={row.amountSar} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )}
        />
      </div>
    </div>
  )
}

/** One usage tile: label, current/cap value, and an optional meter. */
function UsageTile({
  label,
  value,
  pct,
  className,
}: {
  label: string
  value: string
  /** 0–100, or null to omit the meter (Vehicles, when unlimited). */
  pct: number | null
  className?: string
}) {
  return (
    <Card className={cn('flex flex-col gap-1.5 p-3.5 sm:p-4', className)}>
      <p className="m-0 text-xs text-muted">{label}</p>
      <p className="m-0 text-lg font-bold text-heading sm:text-[22px]" dir="ltr">
        {value}
      </p>
      {pct !== null ? (
        <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
          <div
            className="h-full rounded-full bg-salis-gradient-r"
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        </div>
      ) : null}
    </Card>
  )
}

/** One label/value line in the "Estimated Next Charge" breakdown. */
function ChargeRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-muted">{label}</span>
      {value}
    </div>
  )
}
