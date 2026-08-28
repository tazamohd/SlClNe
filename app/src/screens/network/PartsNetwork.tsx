import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FeatureHeader, Section, StatRow, SearchField, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  NETWORK_MEMBERS,
  NETWORK_STATUS,
  PART_ORDERS,
  PART_REQUESTS,
  PRIORITY_TONE,
  type NetworkMember,
  type PartOrder,
  type PartRequest,
} from '@/data/network'

/** The parts-network screens: a garage-to-garage marketplace for sourcing
 *  parts. Seven screens in the design, sharing one status vocabulary. */

function StatusPill({ value, label }: { value: string; label?: string }) {
  const { t } = usePreferences()
  const [bg, fg] = NETWORK_STATUS[value] ?? NETWORK_STATUS.open
  return (
    <Badge background={bg} color={fg}>
      {t(label ?? value[0].toUpperCase() + value.slice(1))}
    </Badge>
  )
}

function PriorityPill({ value }: { value: string }) {
  const { t } = usePreferences()
  const [bg, fg] = PRIORITY_TONE[value] ?? PRIORITY_TONE.normal
  return (
    <Badge background={bg} color={fg}>
      {t(value[0].toUpperCase() + value.slice(1))}
    </Badge>
  )
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export function PartsNetworkDashboard() {
  const { t, rtl } = usePreferences()

  const stats: Stat[] = [
    { label: 'Open Requests', value: 12, icon: 'Send', tone: 'info' },
    { label: 'Pending Quotes', value: 8, icon: 'Inbox', tone: 'info' },
    { label: 'Unread Messages', value: 5, icon: 'MessageSquare', tone: 'warning' },
    { label: 'Active Orders', value: 3, icon: 'ShoppingCart' },
    { label: 'Network Members', value: 156, icon: 'Building2' },
    { label: 'SAR Saved', value: '12,450', icon: 'Banknote', highlight: true },
  ]

  const actions = [
    {
      title: 'Request Quotation',
      desc: 'Send a new part price request to suppliers',
      cta: 'Send Request',
      to: '/parts-network/send-request',
      icon: 'Send',
    },
    {
      title: 'View Incoming Requests',
      desc: 'Respond to quotation requests from garages',
      cta: 'View Requests',
      to: '/parts-network/incoming',
      icon: 'Inbox',
    },
  ]

  return (
    <>
      <FeatureHeader
        icon="Network"
        title={t('Parts Network')}
        subtitle={t('Source parts from garages, dealers and suppliers across the network')}
      />

      {/* Six KPIs rather than the kit's four, so this lays out its own grid. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={
              'rounded-lg p-4 ' +
              (stat.highlight
                ? 'border-transparent bg-salis-gradient shadow-[0_12px_20px_-6px_rgba(10,94,215,.35)]'
                : '')
            }
          >
            <span
              className={
                'flex w-fit rounded-[10px] p-2 ' +
                (stat.highlight ? 'bg-white/20 text-white' : 'bg-[rgba(10,94,215,.09)] text-salis-blue')
              }
            >
              <Icon name={stat.icon ?? 'Circle'} size={18} />
            </span>
            <p
              className={
                'mt-2.5 font-display text-2xl font-black ' +
                (stat.highlight ? 'text-white' : 'text-heading')
              }
            >
              {stat.value}
            </p>
            <p className={'text-xs ' + (stat.highlight ? 'text-white/85' : 'text-muted')}>
              {t(stat.label)}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {actions.map((action) => (
          <Card key={action.title} className="flex items-start gap-4 rounded-lg p-5">
            <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(10,94,215,.09)] p-2.5 text-salis-blue">
              <Icon name={action.icon} size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-bold text-heading">{t(action.title)}</h3>
              <p className="mt-1 text-[13px] text-muted">{t(action.desc)}</p>
              <Link
                to={action.to}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded bg-salis-gradient px-3.5 font-action text-[13px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
              >
                {t(action.cta)}
                <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={14} />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

// ── My requests ─────────────────────────────────────────────────────────────
export function PartsNetworkRequests() {
  const { t } = usePreferences()
  const navigate = useNavigate()

  const columns: Column<PartRequest>[] = [
    { header: 'Part', cell: (r) => r.part },
    { header: 'Reference', cell: (r) => r.reference, code: true },
    { header: 'Vehicle', cell: (r) => r.vehicle },
    { header: 'Qty', cell: (r) => r.qty },
    { header: 'Quotes', cell: (r) => `${r.quotes} / ${r.reach}` },
    { header: 'Priority', cell: (r) => <PriorityPill value={r.priority} /> },
    { header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Send"
        title={t('My Requests')}
        subtitle={t('Quotation requests you have sent to the network')}
        actions={
          <Button size="md" onClick={() => navigate('/parts-network/send-request')}>
            <Icon name="Plus" size={16} />
            {t('Send Request')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={PART_REQUESTS}
        rowKey={(r) => r.reference}
        onRowClick={() => navigate('/parts-network/quotations')}
        mobileCard={(r) => (
          <>
            <MobileCardHeader title={r.part} trailing={<StatusPill value={r.status} />} />
            <MobileCardRow>{r.vehicle}</MobileCardRow>
            <MobileCardRow label={t('Quotes')}>
              {r.quotes} / {r.reach}
            </MobileCardRow>
            <div className="flex items-center gap-2">
              <PriorityPill value={r.priority} />
              {Number(r.unread) > 0 ? (
                <Badge background="rgba(249,115,22,.1)" color="#F97316">
                  {r.unread} {t('unread')}
                </Badge>
              ) : null}
            </div>
          </>
        )}
        empty={<EmptyState icon="Send" title={t('No requests sent yet')} />}
      />
    </>
  )
}

// ── Orders ──────────────────────────────────────────────────────────────────
export function PartsNetworkOrders() {
  const { t } = usePreferences()

  const columns: Column<PartOrder>[] = [
    { header: 'Part', cell: (o) => o.part },
    { header: 'Reference', cell: (o) => o.reference, code: true },
    { header: 'Supplier', cell: (o) => `${o.supplier} · ${t(o.city)}` },
    { header: 'Method', cell: (o) => t(o.method) },
    {
      header: 'Total',
      cell: (o) => <Money sar={Number(o.total)} className="font-semibold" />,
    },
    { header: 'Payment', cell: (o) => <StatusPill value={o.payment} /> },
    { header: 'Status', cell: (o) => <StatusPill value={o.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ShoppingCart"
        title={t('Orders')}
        subtitle={t('Parts ordered through the network')}
      />
      <DataTable
        columns={columns}
        rows={PART_ORDERS}
        rowKey={(o) => o.reference}
        mobileCard={(o) => (
          <>
            <MobileCardHeader title={o.part} trailing={<StatusPill value={o.status} />} />
            <MobileCardRow label={t('Supplier')}>{o.supplier}</MobileCardRow>
            <MobileCardRow label={t('Total')}>
              <Money sar={Number(o.total)} className="font-semibold text-heading" />
            </MobileCardRow>
            <MobileCardRow label={t('Method')}>
              {t(o.method)}
              {o.eta ? ` · ${o.eta}` : ''}
            </MobileCardRow>
            {o.tracking ? (
              <MobileCardRow label={t('Tracking')}>
                <span className="font-mono" dir="ltr">
                  {o.tracking}
                </span>
              </MobileCardRow>
            ) : null}
          </>
        )}
        empty={<EmptyState icon="ShoppingCart" title={t('No orders yet')} />}
      />
    </>
  )
}

// ── Members ─────────────────────────────────────────────────────────────────
export function PartsNetworkMembers() {
  const { t, rtl } = usePreferences()
  const [kind, setKind] = useState<string>('all')

  const kinds = ['all', 'supplier', 'dealer', 'store', 'garage'] as const
  const members = useMemo(
    () => (kind === 'all' ? NETWORK_MEMBERS : NETWORK_MEMBERS.filter((m) => m.kind === kind)),
    [kind]
  )

  return (
    <>
      <FeatureHeader
        icon="Building2"
        title={t('Network Members')}
        subtitle={t('Garages, dealers, stores and suppliers you can trade with')}
      />

      <div role="tablist" aria-label={t('Type')} className="flex flex-wrap gap-2">
        {kinds.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={kind === option}
            onClick={() => setKind(option)}
            className={
              'cursor-pointer rounded-full border px-3.5 py-1.5 font-action text-[13px] font-medium transition-all duration-150 ' +
              (kind === option
                ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                : 'border-border bg-card text-muted hover:border-border-strong')
            }
          >
            {t(option === 'all' ? 'All' : option[0].toUpperCase() + option.slice(1))}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <MemberCard key={member.name} member={member} rtl={rtl} />
        ))}
      </div>
      {members.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon="Building2" title={t('No members of this type')} />
        </Card>
      ) : null}
    </>
  )
}

function MemberCard({ member, rtl }: { member: NetworkMember; rtl: boolean }) {
  const { t } = usePreferences()
  return (
    <Card className="flex flex-col gap-3 rounded-lg p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-salis-gradient font-display text-sm font-bold text-white">
          {member.initials}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-bold text-heading">
            {rtl ? member.ar : member.name}
          </h3>
          <p className="text-xs text-muted">
            {t(member.kind[0].toUpperCase() + member.kind.slice(1))} · {t(member.city)}
          </p>
        </div>
        <span className="inline-flex flex-shrink-0 items-center gap-1 text-[13px]">
          <Icon name="Star" size={13} className="text-salis-orange" />
          <span className="font-mono" dir="ltr">
            {member.rating}
          </span>
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {member.brands.map((brand) => (
          <span
            key={brand}
            className="rounded-full bg-inset px-2 py-0.5 text-[11px] font-medium text-muted"
          >
            {brand}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
        <span>
          {member.deals} {t('deals')}
          {member.fulfilment ? ` · ${member.fulfilment} ${t('fulfilment')}` : ''}
        </span>
        <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="font-mono" dir="ltr">
          {member.phone}
        </a>
      </div>
    </Card>
  )
}

// ── Incoming requests ───────────────────────────────────────────────────────

/** A quotation request another garage has sent you. Design-only data — there
 *  is no `incoming` collection yet, so this is transcribed from
 *  PartsNetwork.Incoming.dc.html, same pattern as Procurement's `QUOTES`. */
interface IncomingRequest {
  part: string
  priority: 'urgent' | 'normal' | 'low'
  urgent: boolean
  responded: boolean
  /** RFQ reference · part number · brand — Latin, so pinned LTR. */
  meta: string
  vehicle: string
  mode: string
  modeIcon: string
  garage: string
  city: string
  age: string
  qty: number
  expires: string
  /** Icon-chip tint [bg, fg]. */
  tone: readonly [string, string]
}

const INCOMING_REQUESTS: readonly IncomingRequest[] = [
  {
    part: 'Front Brake Pads Set',
    priority: 'urgent',
    urgent: true,
    responded: false,
    meta: 'RFQ-2025-010 · 04465-33450 · Toyota',
    vehicle: 'Toyota Camry 2022',
    mode: 'Delivery Only',
    modeIcon: 'Truck',
    garage: 'Al-Madinah Auto Workshop',
    city: 'Riyadh',
    age: '12 months ago',
    qty: 4,
    expires: 'Jan 17, 08:00',
    tone: ['rgba(249,115,22,.1)', '#F97316'],
  },
  {
    part: 'Alternator 12V',
    priority: 'normal',
    urgent: false,
    responded: true,
    meta: 'RFQ-2025-011 · Honda',
    vehicle: 'Honda Civic 2021',
    mode: 'Delivery or Pickup',
    modeIcon: 'ArrowLeftRight',
    garage: 'Quick Fix Garage',
    city: 'Jeddah',
    age: '12 months ago',
    qty: 2,
    expires: 'Jan 21, 15:30',
    tone: ['rgba(10,94,215,.09)', '#0A5ED7'],
  },
  {
    part: 'Oil Filter Premium',
    priority: 'low',
    urgent: false,
    responded: false,
    meta: 'RFQ-2025-012 · 15400-RTA-003',
    vehicle: 'Honda Accord 2020',
    mode: 'Pickup Only',
    modeIcon: 'Store',
    garage: 'Premium Auto Services',
    city: 'Dammam',
    age: '12 months ago',
    qty: 10,
    expires: 'Jan 27, 10:00',
    tone: ['rgba(11,179,255,.09)', '#0BB3FF'],
  },
]

// Priority pills for this screen: urgent → warning orange, normal → bright
// blue, low → neutral slate (README §7 — never green/red/yellow).
const INCOMING_PRIORITY: Record<string, readonly [string, string]> = {
  urgent: ['rgba(249,115,22,.14)', '#F97316'],
  normal: ['rgba(11,179,255,.12)', '#0BB3FF'],
  low: ['rgba(100,116,139,.1)', '#64748B'],
}

const INCOMING_FILTERS = ['all', 'urgent', 'awaiting', 'responded'] as const

export function PartsNetworkIncoming() {
  const { t } = usePreferences()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const counts = useMemo(() => {
    const awaiting = INCOMING_REQUESTS.filter((r) => !r.responded)
    return {
      urgent: awaiting.filter((r) => r.urgent).length,
      awaiting: awaiting.length,
      responded: INCOMING_REQUESTS.filter((r) => r.responded).length,
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return INCOMING_REQUESTS.filter((r) => {
      if (filter === 'urgent' && !(r.urgent && !r.responded)) return false
      if (filter === 'awaiting' && r.responded) return false
      if (filter === 'responded' && !r.responded) return false
      if (!needle) return true
      return (
        r.part.toLowerCase().includes(needle) ||
        r.meta.toLowerCase().includes(needle) ||
        r.garage.toLowerCase().includes(needle) ||
        r.vehicle.toLowerCase().includes(needle)
      )
    })
  }, [query, filter])

  return (
    <>
      <FeatureHeader
        icon="Inbox"
        title={t('Incoming Quotation Requests')}
        subtitle={t('Quotation requests received from garages')}
      />

      <StatRow
        stats={[
          { label: 'Urgent Pending', value: counts.urgent, caption: 'Respond today', tone: 'warning' },
          { label: 'Awaiting Response', value: counts.awaiting, caption: 'Not yet quoted', highlight: true },
          { label: 'Responded', value: counts.responded, caption: 'Quote sent', tone: 'info' },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={t('Search by part, request ID, or garage name...')}
          className="w-full sm:flex-1"
        />
        <div role="tablist" aria-label={t('Filter')} className="flex flex-wrap gap-2">
          {INCOMING_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={filter === option}
              onClick={() => setFilter(option)}
              className={
                'cursor-pointer rounded-full border px-3.5 py-1.5 font-action text-[13px] font-medium capitalize transition-all duration-150 ' +
                (filter === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong')
              }
            >
              {t(
                option === 'all'
                  ? 'All'
                  : option === 'awaiting'
                    ? 'Awaiting Response'
                    : option[0].toUpperCase() + option.slice(1)
              )}
            </button>
          ))}
        </div>
      </div>

      <Section
        title={t('Requests to You')}
        subtitle={t('Respond with a price and lead time to win the order')}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="Inbox"
            title={t('No incoming requests')}
            description={t('Requests from other network members appear here.')}
          />
        ) : (
          <div className="flex flex-col gap-3.5">
            {filtered.map((request) => (
              <IncomingRequestCard
                key={request.meta}
                request={request}
                onQuote={() =>
                  toast.show({
                    title: t(request.responded ? 'Quote updated' : 'Quote sent'),
                    description: `${t(request.part)} · ${request.garage}`,
                  })
                }
              />
            ))}
          </div>
        )}
      </Section>
    </>
  )
}

function IncomingRequestCard({
  request,
  onQuote,
}: {
  request: IncomingRequest
  onQuote: () => void
}) {
  const { t } = usePreferences()
  const [priBg, priFg] = INCOMING_PRIORITY[request.priority] ?? INCOMING_PRIORITY.normal
  const [iconBg, iconFg] = request.tone

  return (
    <Card
      className={
        'rounded-2xl p-[18px] ' +
        (request.urgent
          ? 'border-[1.5px] border-[rgba(249,115,22,.28)] bg-[rgba(249,115,22,.04)]'
          : '')
      }
    >
      <div className="flex flex-wrap items-start gap-3.5">
        <span
          className="flex flex-shrink-0 rounded-[10px] p-2"
          style={{ background: iconBg, color: iconFg }}
        >
          <Icon name="Package" size={17} />
        </span>

        <div className="min-w-[220px] flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold text-heading">{t(request.part)}</h3>
            <Badge background={priBg} color={priFg} strong className="gap-1">
              {request.urgent ? <Icon name="AlertTriangle" size={10} /> : null}
              {t(request.priority)}
            </Badge>
            {request.responded ? (
              <Badge background="rgba(10,94,215,.12)" color="#0A5ED7" className="gap-1">
                <Icon name="CheckCircle" size={10} />
                {t('Responded')}
              </Badge>
            ) : null}
          </div>
          <p className="font-mono text-xs text-muted" dir="ltr">
            {request.meta}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-xs text-body">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="Car" size={13} className="text-muted" />
              <span dir="ltr">{request.vehicle}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name={request.modeIcon} size={13} className="text-muted" />
              {t(request.mode)}
            </span>
          </div>
        </div>

        <div className="min-w-[170px]">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Icon name="Building2" size={13} className="text-muted" />
            <span className="text-[13px] font-semibold text-heading">{request.garage}</span>
          </div>
          <div className="mb-1 flex items-center gap-1.5">
            <Icon name="MapPin" size={12} className="text-muted" />
            <span className="text-xs text-muted">{t(request.city)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="Clock" size={12} className="text-muted" />
            <span className="text-xs text-muted">{t(request.age)}</span>
          </div>
        </div>

        <div className="flex-shrink-0 text-center">
          <p className="font-display text-2xl font-black text-heading" dir="ltr">
            {request.qty}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">{t('Qty Needed')}</p>
        </div>

        <div className="flex min-w-[150px] flex-shrink-0 flex-col items-stretch gap-1.5">
          <Button size="md" variant={request.responded ? 'outline' : 'primary'} onClick={onQuote}>
            <Icon name="Send" size={14} />
            {t(request.responded ? 'Update Quote' : 'Send Quote')}
          </Button>
          <p className="text-center text-[11px] font-semibold text-salis-orange" dir="ltr">
            {t('Expires:')} {request.expires}
          </p>
        </div>
      </div>
    </Card>
  )
}
