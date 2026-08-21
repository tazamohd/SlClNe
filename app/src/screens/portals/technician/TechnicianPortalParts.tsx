import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface PartRequest {
  id: string
  partName: string
  partNumber: string
  workOrder: string
  quantity: number
  status: 'Approved' | 'Pending' | 'Delivered' | 'Out of Stock'
  requestDate: string
}

const PART_REQUESTS: PartRequest[] = [
  { id: 'PR-501', partName: 'Brake Pads (Front)', partNumber: 'BP-TOY-4821', workOrder: 'WO-8830', quantity: 2, status: 'Delivered', requestDate: '2025-08-17' },
  { id: 'PR-502', partName: 'Oil Filter', partNumber: 'OF-HON-2210', workOrder: 'WO-8831', quantity: 1, status: 'Approved', requestDate: '2025-08-18' },
  { id: 'PR-503', partName: 'AC Compressor', partNumber: 'AC-HYU-3301', workOrder: 'WO-8832', quantity: 1, status: 'Pending', requestDate: '2025-08-18' },
  { id: 'PR-504', partName: 'Transmission Fluid (4L)', partNumber: 'TF-NIS-5500', workOrder: 'WO-8833', quantity: 4, status: 'Out of Stock', requestDate: '2025-08-16' },
  { id: 'PR-505', partName: 'Shock Absorber (Rear)', partNumber: 'SA-TOY-7701', workOrder: 'WO-8834', quantity: 2, status: 'Pending', requestDate: '2025-08-18' },
  { id: 'PR-506', partName: 'Spark Plugs', partNumber: 'SP-TOY-1100', workOrder: 'WO-8831', quantity: 4, status: 'Delivered', requestDate: '2025-08-15' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Approved: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Delivered: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  'Out of Stock': { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function TechnicianPortalParts() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Requests'), value: String(PART_REQUESTS.length), icon: 'Package', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Pending'), value: '2', icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Delivered'), value: '2', icon: 'CheckCircle', bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
    { label: t('Out of Stock'), value: '1', icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Package" title={t('Parts Requests')} subtitle={t('Parts and inventory')} />
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
        {PART_REQUESTS.map((p) => (
          <MobileCard key={p.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Package" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{p.partName}</p>
                    <p className="text-xs text-muted">{p.partNumber}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>}
            />
            <MobileCardRow label={t('Work Order')} value={p.workOrder} />
            <MobileCardRow label={t('Quantity')} value={String(p.quantity)} />
            <MobileCardRow label={t('Requested')} value={p.requestDate} />
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
            <Icon name="Package" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Parts Requests')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Request and track parts')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Ref')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Part Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Part No.')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Work Order')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Qty')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Requested')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {PART_REQUESTS.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs text-muted">{p.id}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{p.partName}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-body">{p.partNumber}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-body">{p.workOrder}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{p.quantity}</td>
                  <td className="py-3 pe-4 text-body">{p.requestDate}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>
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
