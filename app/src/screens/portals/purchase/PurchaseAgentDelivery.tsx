import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Active Shipments'), value: '3', icon: 'Truck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Out for Delivery'), value: '1', icon: 'Package', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Delivered'), value: '2', icon: 'PackageCheck', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
    { label: t('Delayed'), value: '1', icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Truck" title={t('Deliveries')} subtitle={t('Shipment tracking')} />
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
        {DELIVERIES.map((d) => (
          <MobileCard key={d.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Truck" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{d.id}</p>
                    <p className="text-xs text-muted">{d.supplier}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[d.status].bg} color={STATUS_STYLES[d.status].fg}>{t(d.status)}</Badge>}
            />
            <MobileCardRow label={t('PO Ref')} value={d.poRef} />
            <MobileCardRow label={t('Carrier')} value={d.carrier} />
            <MobileCardRow label={t('Tracking')} value={d.trackingNo} />
            <MobileCardRow label={t('ETA')} value={d.eta} />
          </MobileCard>
        ))}
      </div>
    )
  }

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

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Shipments')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Delivery')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('PO Ref')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Supplier')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Items')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Carrier')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Tracking')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('ETA')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERIES.map((d) => (
                <tr key={d.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-medium text-heading">{d.id}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-body">{d.poRef}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{d.supplier}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{d.items}</td>
                  <td className="py-3 pe-4 text-body">{d.carrier}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-body">{d.trackingNo}</td>
                  <td className="py-3 pe-4 text-body">{d.eta}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[d.status].bg} color={STATUS_STYLES[d.status].fg}>{t(d.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
