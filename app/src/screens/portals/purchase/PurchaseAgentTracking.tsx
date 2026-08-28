import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface Shipment {
  poNumber: string
  supplier: string
  items: string
  origin: string
  destination: string
  carrier: string
  eta: string
  status: 'In Transit' | 'Customs' | 'Delivered' | 'Delayed'
}

const SHIPMENTS: Shipment[] = [
  { poNumber: 'PO-2026-0847', supplier: 'Al-Rajhi Auto Parts', items: 'Oil Filters (x200)', origin: 'Riyadh', destination: 'Jeddah Branch', carrier: 'SMSA Express', eta: 'Aug 19, 2026', status: 'In Transit' },
  { poNumber: 'PO-2026-0843', supplier: 'Gulf Motor Supply', items: 'Brake Pads (x50)', origin: 'Dammam', destination: 'Riyadh Central', carrier: 'Aramex', eta: 'Aug 18, 2026', status: 'Delivered' },
  { poNumber: 'PO-2026-0840', supplier: 'Eastern Parts Hub', items: 'Timing Belt Kits (x30)', origin: 'Dubai, UAE', destination: 'Dammam East', carrier: 'DHL', eta: 'Aug 22, 2026', status: 'Customs' },
  { poNumber: 'PO-2026-0838', supplier: 'Nada Electrical Co.', items: 'Alternators (x15)', origin: 'Makkah', destination: 'Riyadh Central', carrier: 'Saudi Post', eta: 'Aug 17, 2026', status: 'Delayed' },
  { poNumber: 'PO-2026-0835', supplier: 'Saudi Tire Distributors', items: 'Michelin Tires (x80)', origin: 'Jeddah Port', destination: 'Riyadh Central', carrier: 'Naqel', eta: 'Aug 20, 2026', status: 'In Transit' },
  { poNumber: 'PO-2026-0831', supplier: 'Al-Madinah Body Parts', items: 'Door Panels (x12)', origin: 'Madinah', destination: 'Jeddah Branch', carrier: 'Fetchr', eta: 'Aug 16, 2026', status: 'Delivered' },
  { poNumber: 'PO-2026-0828', supplier: 'Al-Rajhi Auto Parts', items: 'Cabin Filters (x300)', origin: 'Riyadh', destination: 'Dammam East', carrier: 'SMSA Express', eta: 'Aug 21, 2026', status: 'In Transit' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'In Transit': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Customs: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Delivered: { bg: 'var(--tint-neutral)', fg: 'rgb(107,114,128)' },
  Delayed: { bg: 'var(--tint-orange)', fg: '#F97316' },
}

export function PurchaseAgentTracking() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('In Transit'), value: '3', icon: 'Truck', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('At Customs'), value: '1', icon: 'ShieldAlert', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Delivered Today'), value: '2', icon: 'PackageCheck', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Delayed'), value: '1', icon: 'AlertTriangle', bg: 'var(--tint-orange)', fg: '#F97316' },
  ]

  const columns: Column<Shipment>[] = [
    { header: t('PO #'), cell: (s) => s.poNumber },
    { header: t('Supplier'), cell: (s) => s.supplier },
    { header: t('Items'), cell: (s) => s.items },
    { header: t('Origin'), cell: (s) => s.origin },
    { header: t('Destination'), cell: (s) => s.destination },
    { header: t('Carrier'), cell: (s) => s.carrier },
    { header: t('ETA'), cell: (s) => s.eta },
    { header: t('Status'), cell: (s) => <Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Truck" title={t('Shipment Tracking')} subtitle={t('Monitor purchase order deliveries')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Shipment tracking"
        columns={columns}
        rows={SHIPMENTS}
        rowKey={(s) => s.poNumber}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={s.poNumber} trailing={<Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>} />
            <MobileCardRow label={t('Supplier')}>{s.supplier}</MobileCardRow>
            <MobileCardRow label={t('Carrier')}>{s.carrier}</MobileCardRow>
            <MobileCardRow label={t('ETA')}>{s.eta}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
