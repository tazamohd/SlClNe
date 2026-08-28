import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface Delivery {
  id: string
  poRef: string
  supplier: string
  items: number
  carrier: string
  trackingNo: string
  eta: string
  status: 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Delayed'
}

const DELIVERIES: Delivery[] = [
  { id: 'DEL-501', poRef: 'PO-2401', supplier: 'Al-Futtaim Parts', items: 15, carrier: 'Aramex', trackingNo: 'ARX-8842901', eta: '2025-08-20', status: 'In Transit' },
  { id: 'DEL-498', poRef: 'PO-2398', supplier: 'Brembo KSA', items: 8, carrier: 'SMSA Express', trackingNo: 'SMS-6619042', eta: '2025-08-18', status: 'Out for Delivery' },
  { id: 'DEL-495', poRef: 'PO-2395', supplier: 'NGK Middle East', items: 24, carrier: 'DHL', trackingNo: 'DHL-3371850', eta: '2025-08-14', status: 'Delivered' },
  { id: 'DEL-492', poRef: 'PO-2390', supplier: 'Gates Automotive', items: 5, carrier: 'Aramex', trackingNo: 'ARX-8840122', eta: '2025-08-22', status: 'Delayed' },
  { id: 'DEL-489', poRef: 'PO-2385', supplier: 'Denso Gulf', items: 12, carrier: 'SMSA Express', trackingNo: 'SMS-6615430', eta: '2025-08-10', status: 'Delivered' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'In Transit': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'Out for Delivery': { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Delivered: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Delayed: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
}

export function PurchaseAgentDelivery() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Active Shipments'), value: '3', icon: 'Truck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Out for Delivery'), value: '1', icon: 'Package', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Delivered'), value: '2', icon: 'PackageCheck', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
    { label: t('Delayed'), value: '1', icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  ]

  const columns: Column<Delivery>[] = [
    { header: t('Delivery'), cell: (d) => d.id },
    { header: t('PO Ref'), cell: (d) => d.poRef },
    { header: t('Supplier'), cell: (d) => d.supplier },
    { header: t('Items'), cell: (d) => d.items },
    { header: t('Carrier'), cell: (d) => d.carrier },
    { header: t('Tracking'), cell: (d) => d.trackingNo },
    { header: t('ETA'), cell: (d) => d.eta },
    { header: t('Status'), cell: (d) => <Badge background={STATUS_STYLES[d.status].bg} color={STATUS_STYLES[d.status].fg}>{t(d.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Truck" title={t('Deliveries')} subtitle={t('Track incoming shipments and deliveries')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Delivery shipments"
        columns={columns}
        rows={DELIVERIES}
        rowKey={(d) => d.id}
        mobileCard={(d) => (
          <>
            <MobileCardHeader title={d.id} trailing={<Badge background={STATUS_STYLES[d.status].bg} color={STATUS_STYLES[d.status].fg}>{t(d.status)}</Badge>} />
            <MobileCardRow label={t('Supplier')}>{d.supplier}</MobileCardRow>
            <MobileCardRow label={t('Carrier')}>{d.carrier}</MobileCardRow>
            <MobileCardRow label={t('ETA')}>{d.eta}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
