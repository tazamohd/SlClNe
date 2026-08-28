import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { cn } from '@/lib/cn'

/** Everything waiting on the signed-in role's signature, in one queue.
 *
 *  The approval ceiling comes from the RBAC matrix (`canApprove` /
 *  `roleMeta.limit`), so this screen can never disagree with the permission
 *  engine about what the user may sign off. Items above the ceiling swap their
 *  Approve button for Escalate.
 *
 *  One deliberate fix over the prototype: its blocked button was `disabled`,
 *  which made the "Escalated" handler in its own source unreachable — you
 *  could neither approve nor move the item on. Here Escalate is a real action
 *  (matching `ProcurementRequisitions`), and the tooltip still explains why
 *  approval itself is locked.
 *
 *  The queue itself is design demo data: no repository collection carries
 *  pending approvals (`approvalLines` is the estimate line items for
 *  CustomerApproval — a different thing). When the approvals endpoint lands,
 *  QUEUE becomes a `useCollection` read and the mapping below stays. */

type FilterKey = 'all' | 'overLimit' | 'sod' | 'old'

interface ApprovalItem {
  ref: string
  /** English type label — also the `t()` key. */
  type: string
  icon: string
  subject: string
  arSubject: string
  by: string
  arBy: string
  amount: number
  /** Hours the request has been waiting. */
  hrs: number
  /** Raised by the same person who would approve it. */
  sod: boolean
}

// Demo queue, verbatim from ApprovalInbox.dc.html.
const QUEUE: readonly ApprovalItem[] = [
  { ref: 'EST-2026-0418', type: 'Estimate', icon: 'FileText', subject: 'Brake overhaul · Toyota Camry 2021', arSubject: 'صيانة فرامل شاملة · تويوتا كامري 2021', by: 'Noura Al-Qahtani', arBy: 'نورة القحطاني', amount: 8420, hrs: 3, sod: false },
  { ref: 'PO-2026-1142', type: 'Purchase Order', icon: 'ShoppingCart', subject: 'Genuine brake components · Al-Jazira', arSubject: 'قطع فرامل أصلية · الجزيرة', by: 'Yousef Al-Ghamdi', arBy: 'يوسف الغامدي', amount: 14600, hrs: 7, sod: true },
  { ref: 'EST-2026-0421', type: 'Estimate', icon: 'FileText', subject: 'Transmission service · Ford F-150', arSubject: 'خدمة ناقل الحركة · فورد F-150', by: 'Noura Al-Qahtani', arBy: 'نورة القحطاني', amount: 3180, hrs: 11, sod: false },
  { ref: 'JV-2026-0087', type: 'Journal Entry', icon: 'BookOpen', subject: 'Q2 depreciation · Riyadh Main', arSubject: 'إهلاك الربع الثاني · الرياض الرئيسي', by: 'Hessa Al-Mutairi', arBy: 'حصة المطيري', amount: 26400, hrs: 19, sod: true },
  { ref: 'DSC-2026-0034', type: 'Discount', icon: 'Percent', subject: '12% goodwill · repeat QC failure', arSubject: 'خصم 12% كحسن نية · تكرار فشل الجودة', by: 'Faisal Al-Harbi', arBy: 'فيصل الحربي', amount: 1260, hrs: 26, sod: false },
  { ref: 'PAY-2026-0455', type: 'Payroll', icon: 'Wallet', subject: 'July payroll run · 34 employees', arSubject: 'مسير رواتب يوليو · 34 موظفاً', by: 'Reem Al-Dossari', arBy: 'ريم الدوسري', amount: 412000, hrs: 41, sod: false },
]

const TABS: readonly { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'overLimit', label: 'Above my limit' },
  { key: 'sod', label: 'SoD flagged' },
  { key: 'old', label: 'Waiting over 24h' },
]

const OLD_AFTER_HOURS = 24

export function ApprovalInbox() {
  const { t, rtl } = usePreferences()
  const { roleMeta, canApprove } = useSession()
  const toast = useToast()

  const [filter, setFilter] = useState<FilterKey>('all')
  const [handled, setHandled] = useState<readonly string[]>([])
  const [delegating, setDelegating] = useState(false)

  const limit = roleMeta.limit
  const overLimit = (item: ApprovalItem) => !canApprove(item.amount)

  const live = useMemo(() => QUEUE.filter((q) => !handled.includes(q.ref)), [handled])
  const shown = useMemo(
    () =>
      live.filter(
        (q) =>
          filter === 'all' ||
          (filter === 'overLimit' && !canApprove(q.amount)) ||
          (filter === 'sod' && q.sod) ||
          (filter === 'old' && q.hrs > OLD_AFTER_HOURS)
      ),
    [live, filter, canApprove]
  )

  const sodCount = live.filter((q) => q.sod).length
  const delegDetail = `${t('Faisal Al-Harbi')} · ${t('until 2 Aug 2026')}`

  function approve(item: ApprovalItem) {
    setHandled((prev) => [...prev, item.ref])
    toast.show({ title: t('Approved'), description: `${item.ref} · ${formatSar(item.amount)}` })
  }

  function escalate() {
    toast.show({ title: t('Escalated'), description: t('Sent to your manager for approval.') })
  }

  function reject(item: ApprovalItem) {
    setHandled((prev) => [...prev, item.ref])
    toast.show({
      title: t('Rejected'),
      description: `${item.ref} — ${t('the raiser has been notified.')}`,
      error: true,
    })
  }

  function toggleDelegation() {
    const next = !delegating
    setDelegating(next)
    toast.show(
      next
        ? { title: t('Delegation active'), description: delegDetail }
        : { title: t('Delegation cancelled'), description: t('Approvals return to you.') }
    )
  }

  return (
    <div className="flex max-w-[1240px] flex-col gap-4">
      {/* Header — gradient inbox tile, then the role's identity and a shortcut
          to the RBAC rules the ceiling comes from. */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-salis-gradient p-2.5 text-white shadow-[0_10px_15px_-3px_rgba(10,94,215,.25)]">
          <Icon name="Inbox" size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-black text-heading">{t('Approval Inbox')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Everything waiting on your signature')}</p>
        </div>
        <span
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-action text-xs font-semibold"
          style={{
            background: `color-mix(in srgb, ${roleMeta.color} 12%, transparent)`,
            color: roleMeta.color,
          }}
        >
          <Icon name={roleMeta.icon} size={12} />
          {rtl ? roleMeta.ar : roleMeta.label}
        </span>
        <Link
          to="/rbacspec"
          className="inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 font-action text-xs font-semibold text-body no-underline transition-colors duration-150 hover:border-salis-blue hover:text-salis-blue hover:no-underline"
        >
          <Icon name="Shield" size={13} />
          {t('Access rules')}
        </Link>
      </div>

      {/* Queue health at a glance. */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon="Inbox" tone="blue" value={String(live.length)} label={t('Awaiting me')} />
        <StatTile
          icon="ArrowUp"
          tone="orange"
          value={String(live.filter(overLimit).length)}
          label={t('Above my limit')}
        />
        <StatTile icon="ShieldAlert" tone="orange" value={String(sodCount)} label={t('SoD conflicts')} />
        <StatTile
          icon="Gauge"
          tone="bright"
          value={limit === null ? t('Unlimited') : formatSar(limit).replace(/\.00$/, '')}
          label={t('My ceiling')}
          mono={limit !== null}
        />
      </div>

      {sodCount > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-[rgba(249,115,22,.28)] bg-[rgba(249,115,22,.07)] p-4">
          <span className="flex flex-shrink-0 rounded-lg bg-[rgba(249,115,22,.14)] p-2 text-salis-orange">
            <Icon name="ShieldAlert" size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-action text-[13.5px] font-bold text-heading">
              {t('Segregation of duties')}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-body">
              {sodCount}{' '}
              {t(
                'items were raised by the same person who would approve them. Approving here creates a segregation-of-duties conflict — reassign or escalate instead.'
              )}
            </p>
          </div>
        </div>
      ) : null}

      <div role="tablist" aria-label={t('Approval Inbox')} className="flex gap-2 overflow-x-auto pb-0.5">
        {TABS.map((tab) => {
          const on = filter === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'h-8 flex-shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5',
                'font-action text-xs font-semibold transition-all duration-150',
                on
                  ? 'border-none bg-salis-gradient text-white'
                  : 'border border-border bg-card text-body hover:border-border-strong'
              )}
            >
              {t(tab.label)}
            </button>
          )
        })}
      </div>

      {shown.length > 0 ? (
        <Card className="divide-y divide-border overflow-hidden">
          {shown.map((item) => {
            const blocked = overLimit(item)
            const old = item.hrs > OLD_AFTER_HOURS
            return (
              <div
                key={item.ref}
                className="flex flex-wrap items-start gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-[rgba(10,94,215,.04)] sm:px-5"
              >
                <span className="mt-px flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(10,94,215,.1)] text-salis-blue">
                  <Icon name={item.icon} size={16} />
                </span>
                <div className="min-w-0 flex-1 sm:min-w-[180px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span dir="ltr" className="font-mono text-[13px] font-bold text-heading">
                      {item.ref}
                    </span>
                    <span className="rounded-full bg-[rgba(11,179,255,.12)] px-2 py-px font-action text-[10px] font-semibold text-salis-bright">
                      {t(item.type)}
                    </span>
                    {blocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(249,115,22,.13)] px-2 py-px font-action text-[10px] font-bold text-salis-orange">
                        <Icon name="ArrowUp" size={9} />
                        {t('Above limit')}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-heading">
                    {rtl ? item.arSubject : item.subject}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {t('Raised by')} {rtl ? item.arBy : item.by}
                  </p>
                </div>
                <div className="ms-auto flex flex-shrink-0 items-center gap-3">
                  <div className="min-w-[90px] text-end">
                    <Money sar={item.amount} className="text-sm font-bold text-heading" />
                    <p className={cn('mt-0.5 text-[11px]', old ? 'text-salis-orange' : 'text-muted')}>
                      {item.hrs} {t('h waiting')}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {blocked ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-muted hover:bg-inset"
                        title={
                          limit !== null
                            ? `${t('Above your approval limit')} (${formatSar(limit)}) — ${t('escalate to a manager')}`
                            : undefined
                        }
                        onClick={escalate}
                      >
                        <Icon name="Lock" size={13} />
                        {t('Escalate')}
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => approve(item)}>
                        <Icon name="Check" size={13} />
                        {t('Approve')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[rgba(249,115,22,.4)] text-salis-orange hover:bg-[rgba(249,115,22,.07)]"
                      onClick={() => reject(item)}
                    >
                      {t('Reject')}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </Card>
      ) : (
        <Card className="px-5 py-11 text-center">
          <span className="inline-flex rounded-xl bg-[rgba(10,94,215,.09)] p-3 text-salis-blue">
            <Icon name="BadgeCheck" size={22} />
          </span>
          <p className="mt-3 text-[15px] font-bold text-heading">{t('Everything is handled')}</p>
          <p className="mt-1.5 text-[13px] text-muted">
            {t(
              'No pending approvals or overdue items. New requests will show up here as they arrive.'
            )}
          </p>
        </Card>
      )}

      <Card className="p-4 sm:p-5">
        <h3 className="font-display text-[13.5px] font-bold text-heading">
          {t('Delegate my approvals')}
        </h3>
        <p className="mb-3 mt-1 text-xs leading-normal text-muted">
          {t(
            'Hand your approval rights to another role for a fixed window. The delegation itself is written to the audit log, not just the approvals made under it.'
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {delegating ? (
            <Button
              size="sm"
              variant="outline"
              className="border-[rgba(249,115,22,.4)] text-salis-orange hover:bg-[rgba(249,115,22,.07)]"
              onClick={toggleDelegation}
            >
              <Icon name="RotateCcw" size={13} />
              {t('Cancel delegation')}
            </Button>
          ) : (
            <Button size="sm" onClick={toggleDelegation}>
              <Icon name="UserCheck" size={13} />
              {t('Delegate')}
            </Button>
          )}
          {delegating ? <span className="text-xs text-body">{delegDetail}</span> : null}
        </div>
      </Card>
    </div>
  )
}

function StatTile({
  icon,
  tone,
  value,
  label,
  mono,
}: {
  icon: string
  tone: 'blue' | 'orange' | 'bright'
  value: string
  label: string
  /** SAR ceilings render in the money face; counts use the display face. */
  mono?: boolean
}) {
  const chip =
    tone === 'orange'
      ? 'bg-[rgba(249,115,22,.12)] text-salis-orange'
      : tone === 'bright'
        ? 'bg-[rgba(11,179,255,.12)] text-salis-bright'
        : 'bg-[rgba(10,94,215,.12)] text-salis-blue'
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <span className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', chip)}>
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0">
        <p
          dir={mono ? 'ltr' : undefined}
          className={cn(
            'truncate text-[19px] font-black leading-tight text-heading [font-variant-numeric:tabular-nums]',
            mono ? 'font-mono text-[15px]' : 'font-display'
          )}
        >
          {value}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted">{label}</p>
      </div>
    </Card>
  )
}
