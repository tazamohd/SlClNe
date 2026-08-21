import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  'In Transit': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Customs: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Delivered: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Delayed: { bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
}

export function PurchaseAgentTracking() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('In Transit'), value: '3', icon: 'Truck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('At Customs'), value: '1', icon: 'ShieldAlert', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Delivered Today'), value: '2', icon: 'PackageCheck', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Delayed'), value: '1', icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Truck" title={t('Shipment Tracking')} subtitle={t('Track deliveries')} />
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
        {SHIPMENTS.map((s) => (
          <MobileCard key={s.poNumber}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Truck" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{s.poNumber}</p>
                    <p className="text-xs text-muted">{s.supplier}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>}
            />
            <MobileCardRow label={t('Items')} value={s.items} />
            <MobileCardRow label={t('Route')} value={`${s.origin} → ${s.destination}`} />
            <MobileCardRow label={t('Carrier')} value={s.carrier} />
            <MobileCardRow label={t('ETA')} value={s.eta} />
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Shipment Tracking')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Monitor purchase order deliveries')}</p>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('PO #')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Supplier')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Items')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Origin')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Destination')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Carrier')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('ETA')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {SHIPMENTS.map((s) => (
                <tr key={s.poNumber} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono font-semibold text-heading" dir="ltr">{s.poNumber}</td>
                  <td className="py-3 pe-4 text-body">{s.supplier}</td>
                  <td className="py-3 pe-4 text-body">{s.items}</td>
                  <td className="py-3 pe-4 text-body">{s.origin}</td>
                  <td className="py-3 pe-4 text-body">{s.destination}</td>
                  <td className="py-3 pe-4 text-body">{s.carrier}</td>
                  <td className="py-3 pe-4 text-muted">{s.eta}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>
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
