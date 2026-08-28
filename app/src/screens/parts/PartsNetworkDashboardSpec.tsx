import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface NetworkNode {
  name: string
  type: 'Warehouse' | 'Hub' | 'Branch' | 'Supplier'
  city: string
  skus: number
  unitsStored: number
  fillRate: number
  status: 'Online' | 'Maintenance' | 'Offline'
}

interface TransferRequest {
  id: string
  from: string
  to: string
  parts: string
  qty: number
  urgency: 'Urgent' | 'Standard' | 'Low'
  eta: string
}

const NODES: NetworkNode[] = [
  { name: 'Riyadh Central Warehouse', type: 'Warehouse', city: 'Riyadh', skus: 2840, unitsStored: 45200, fillRate: 94.2, status: 'Online' },
  { name: 'Jeddah Distribution Hub', type: 'Hub', city: 'Jeddah', skus: 1920, unitsStored: 28600, fillRate: 91.5, status: 'Online' },
  { name: 'Dammam Parts Center', type: 'Hub', city: 'Dammam', skus: 1340, unitsStored: 18400, fillRate: 88.7, status: 'Online' },
  { name: 'Riyadh North Branch', type: 'Branch', city: 'Riyadh', skus: 620, unitsStored: 4800, fillRate: 82.1, status: 'Online' },
  { name: 'Jeddah South Branch', type: 'Branch', city: 'Jeddah', skus: 480, unitsStored: 3200, fillRate: 79.4, status: 'Maintenance' },
  { name: 'Makkah Service Point', type: 'Branch', city: 'Makkah', skus: 310, unitsStored: 2100, fillRate: 85.6, status: 'Online' },
  { name: 'Al-Rajhi Auto Parts', type: 'Supplier', city: 'Riyadh', skus: 1450, unitsStored: 32000, fillRate: 97.8, status: 'Online' },
  { name: 'Gulf Motor Supply', type: 'Supplier', city: 'Jeddah', skus: 890, unitsStored: 18500, fillRate: 95.2, status: 'Offline' },
]

const TRANSFERS: TransferRequest[] = [
  { id: 'TRF-0284', from: 'Riyadh Central', to: 'Riyadh North Branch', parts: 'Oil Filters (x50)', qty: 50, urgency: 'Standard', eta: 'Aug 19, 2026' },
  { id: 'TRF-0283', from: 'Jeddah Hub', to: 'Makkah Service Point', parts: 'Brake Pads (x20)', qty: 20, urgency: 'Urgent', eta: 'Aug 18, 2026' },
  { id: 'TRF-0282', from: 'Al-Rajhi Auto Parts', to: 'Dammam Center', parts: 'Cabin Filters (x100)', qty: 100, urgency: 'Standard', eta: 'Aug 20, 2026' },
  { id: 'TRF-0281', from: 'Riyadh Central', to: 'Jeddah Hub', parts: 'Alternators (x10)', qty: 10, urgency: 'Low', eta: 'Aug 22, 2026' },
  { id: 'TRF-0280', from: 'Gulf Motor Supply', to: 'Riyadh Central', parts: 'Spark Plug Sets (x200)', qty: 200, urgency: 'Urgent', eta: 'Aug 18, 2026' },
]

const NODE_TYPE_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  Warehouse: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', icon: 'Warehouse' },
  Hub: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)', icon: 'GitBranch' },
  Branch: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)', icon: 'Building' },
  Supplier: { bg: 'rgba(107,114,128,.15)', fg: 'rgb(107,114,128)', icon: 'Factory' },
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Online: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Maintenance: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Offline: { bg: 'var(--tint-orange)', fg: '#F97316' },
}

const URGENCY_STYLES: Record<string, { bg: string; fg: string }> = {
  Urgent: { bg: 'var(--tint-orange)', fg: '#F97316' },
  Standard: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Low: { bg: 'var(--tint-neutral)', fg: 'rgb(107,114,128)' },
}

export function PartsNetworkDashboardSpec() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totalSKUs = NODES.reduce((sum, n) => sum + n.skus, 0)
  const totalUnits = NODES.reduce((sum, n) => sum + n.unitsStored, 0)
  const avgFillRate = (NODES.reduce((sum, n) => sum + n.fillRate, 0) / NODES.length).toFixed(1)

  const kpis = [
    { label: t('Network Nodes'), value: String(NODES.length), icon: 'Network', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total SKUs'), value: totalSKUs.toLocaleString(), icon: 'Package', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Total Units'), value: `${(totalUnits / 1000).toFixed(0)}K`, icon: 'Boxes', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Avg Fill Rate'), value: `${avgFillRate}%`, icon: 'BarChart3', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const nodeColumns: Column<NetworkNode>[] = [
    { header: 'Node', cell: (n) => <span className="font-medium text-heading">{n.name}</span> },
    { header: 'Type', cell: (n) => <Badge background={NODE_TYPE_STYLES[n.type].bg} color={NODE_TYPE_STYLES[n.type].fg}>{t(n.type)}</Badge> },
    { header: 'City', cell: (n) => n.city },
    { header: 'SKUs', cell: (n) => <span className="font-mono text-heading">{n.skus.toLocaleString()}</span> },
    { header: 'Units', cell: (n) => <span className="font-mono text-heading">{n.unitsStored.toLocaleString()}</span> },
    { header: 'Fill Rate', cell: (n) => <span className="font-mono text-heading" dir="ltr">{n.fillRate}%</span> },
    { header: 'Status', cell: (n) => <Badge background={STATUS_STYLES[n.status].bg} color={STATUS_STYLES[n.status].fg}>{t(n.status)}</Badge> },
  ]

  const transferColumns: Column<TransferRequest>[] = [
    { header: 'Transfer #', cell: (tr) => tr.id, code: true },
    { header: 'From', cell: (tr) => tr.from },
    { header: 'To', cell: (tr) => tr.to },
    { header: 'Parts', cell: (tr) => tr.parts },
    { header: 'Qty', cell: (tr) => <span className="font-mono text-heading">{tr.qty}</span> },
    { header: 'Urgency', cell: (tr) => <Badge background={URGENCY_STYLES[tr.urgency].bg} color={URGENCY_STYLES[tr.urgency].fg}>{t(tr.urgency)}</Badge> },
    { header: 'ETA', cell: (tr) => <span className="text-muted">{tr.eta}</span> },
  ]

  const nodesTable = (
    <DataTable
      caption="Network Nodes"
      columns={nodeColumns}
      rows={NODES}
      rowKey={(n) => n.name}
      mobileCard={(n) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: NODE_TYPE_STYLES[n.type].bg, color: NODE_TYPE_STYLES[n.type].fg }} aria-hidden>
                  <Icon name={NODE_TYPE_STYLES[n.type].icon} size={14} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{n.name}</p>
                  <p className="text-xs text-muted">{n.city}</p>
                </div>
              </div>
            }
            trailing={<Badge background={STATUS_STYLES[n.status].bg} color={STATUS_STYLES[n.status].fg}>{t(n.status)}</Badge>}
          />
          <MobileCardRow label={t('Type')} value={t(n.type)} />
          <MobileCardRow label={t('SKUs')} value={n.skus.toLocaleString()} />
          <MobileCardRow label={t('Units')} value={n.unitsStored.toLocaleString()} />
          <MobileCardRow label={t('Fill Rate')} value={`${n.fillRate}%`} />
        </>
      )}
    />
  )

  const transfersTable = (
    <DataTable
      caption="Active Transfers"
      columns={transferColumns}
      rows={TRANSFERS}
      rowKey={(tr) => tr.id}
      mobileCard={(tr) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg bg-[var(--tint-blue)] p-1.5 text-salis-blue" aria-hidden><Icon name="ArrowRightLeft" size={14} /></span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{tr.id}</p>
                  <p className="text-xs text-muted">{tr.parts}</p>
                </div>
              </div>
            }
            trailing={<Badge background={URGENCY_STYLES[tr.urgency].bg} color={URGENCY_STYLES[tr.urgency].fg}>{t(tr.urgency)}</Badge>}
          />
          <MobileCardRow label={t('From')} value={tr.from} />
          <MobileCardRow label={t('To')} value={tr.to} />
          <MobileCardRow label={t('Qty')} value={String(tr.qty)} />
          <MobileCardRow label={t('ETA')} value={tr.eta} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Network" title={t('Parts Network')} subtitle={t('Network overview')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>

        <p className="text-[13px] font-bold text-heading">{t('Network Nodes')}</p>
        {nodesTable}

        <p className="text-[13px] font-bold text-heading">{t('Active Transfers')}</p>
        {transfersTable}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Network" title={t('Parts Network')} subtitle={t('Network nodes, inventory, and transfers')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {nodesTable}
      {transfersTable}
    </div>
  )
}
