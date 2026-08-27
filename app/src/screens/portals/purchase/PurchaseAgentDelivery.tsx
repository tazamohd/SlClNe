import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

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
  'Out for Delivery': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Delivered: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Delayed: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function PurchaseAgentDelivery() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Active Shipments'), value: '3', icon: 'Truck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Out for Delivery'), value: '1', icon: 'Package', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Delivered'), value: '2', icon: 'PackageCheck', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
    { label: t('Delayed'), value: '1', icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Truck" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Deliveries')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Track incoming shipments and deliveries')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
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
