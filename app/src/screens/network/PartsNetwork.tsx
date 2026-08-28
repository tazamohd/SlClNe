import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
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
  const { t } = usePreferences()

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
                <Icon name="ArrowRight" size={14} />
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
        caption="Part requests"
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
                <Badge background="var(--tint-orange)" color="#F97316">
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
        caption="Part orders"
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

      <ChipGroup label={t('Type')}>
        {kinds.map((option) => (
          <Chip key={option} label={t(option === 'all' ? 'All' : option[0].toUpperCase() + option.slice(1))} selected={kind === option} onToggle={() => setKind(option)} />
        ))}
      </ChipGroup>

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
export function PartsNetworkIncoming() {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader
        icon="Inbox"
        title={t('Incoming Requests')}
        subtitle={t('Quotation requests other garages have sent you')}
      />
      <StatRow
        stats={[
          { label: 'Urgent Pending', value: 1, caption: 'Respond today', tone: 'warning' },
          { label: 'Awaiting Response', value: 2, caption: 'Not yet quoted', highlight: true },
          { label: 'Responded', value: 1, caption: 'Quote sent', tone: 'info' },
          { label: 'Win Rate', value: '0%', caption: 'Quotes accepted' },
        ]}
      />
      <Section
        title={t('Requests to You')}
        subtitle={t('Respond with a price and lead time to win the order')}
      >
        <EmptyState
          icon="Inbox"
          title={t('No incoming requests')}
          description={t('Requests from other network members appear here.')}
        />
      </Section>
    </>
  )
}
