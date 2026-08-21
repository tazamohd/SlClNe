import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface PartsRequest {
  id: string
  partName: string
  partNumber: string
  quantity: number
  urgency: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'Quoted' | 'Ordered' | 'Fulfilled' | 'Cancelled'
  responses: number
  createdAt: string
  vehicle: string
}

const MY_REQUESTS: PartsRequest[] = [
  { id: 'PR-1201', partName: 'Brake Disc Set - Front', partNumber: '43512-06140', quantity: 2, urgency: 'High', status: 'Quoted', responses: 3, createdAt: 'Aug 18, 2026', vehicle: 'Toyota Camry 2024' },
  { id: 'PR-1200', partName: 'Air Filter', partNumber: '17801-21060', quantity: 5, urgency: 'Low', status: 'Open', responses: 1, createdAt: 'Aug 17, 2026', vehicle: 'Toyota Corolla 2023' },
  { id: 'PR-1199', partName: 'Radiator Assembly', partNumber: '25310-D3500', quantity: 1, urgency: 'Critical', status: 'Ordered', responses: 4, createdAt: 'Aug 16, 2026', vehicle: 'Hyundai Tucson 2025' },
  { id: 'PR-1198', partName: 'Timing Belt Kit', partNumber: '24312-23002', quantity: 1, urgency: 'Medium', status: 'Fulfilled', responses: 2, createdAt: 'Aug 15, 2026', vehicle: 'Hyundai Sonata 2023' },
  { id: 'PR-1197', partName: 'Alternator', partNumber: '31100-RNA-A01', quantity: 1, urgency: 'High', status: 'Quoted', responses: 5, createdAt: 'Aug 14, 2026', vehicle: 'Honda Accord 2024' },
  { id: 'PR-1196', partName: 'Headlight Assembly - Left', partNumber: '26060-JM00A', quantity: 1, urgency: 'Medium', status: 'Cancelled', responses: 0, createdAt: 'Aug 13, 2026', vehicle: 'Nissan Altima 2023' },
]

const URGENCY_STYLES: Record<string, { bg: string; fg: string }> = {
  Low: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Medium: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  High: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Critical: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Open: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Quoted: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Ordered: { bg: 'rgba(10,94,215,.15)', fg: 'var(--salis-blue)' },
  Fulfilled: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Cancelled: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function PartsNetworkMyRequests() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="PackageSearch" title={t('My Requests')} subtitle={t('Parts network requests')} />
        {MY_REQUESTS.map((req) => (
          <MobileCard key={req.id}>
            <MobileCardHeader
              title={req.id}
              code
              trailing={<Badge background={STATUS_STYLES[req.status].bg} color={STATUS_STYLES[req.status].fg}>{t(req.status)}</Badge>}
            />
            <MobileCardRow label={t('Part')} value={req.partName} />
            <MobileCardRow label={t('Vehicle')} value={req.vehicle} />
            <MobileCardRow label={t('Qty')} value={req.quantity} />
            <MobileCardRow label={t('Urgency')}>
              <Badge background={URGENCY_STYLES[req.urgency].bg} color={URGENCY_STYLES[req.urgency].fg}>{t(req.urgency)}</Badge>
            </MobileCardRow>
            <MobileCardRow label={t('Responses')} value={req.responses} />
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
            <Icon name="PackageSearch" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('My Parts Requests')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Track your parts network requests and quotes')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-heading">{t('All Requests')}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-3 font-medium">{t('ID')}</th>
                <th className="pb-3 font-medium">{t('Part')}</th>
                <th className="pb-3 font-medium">{t('Part Number')}</th>
                <th className="pb-3 font-medium">{t('Vehicle')}</th>
                <th className="pb-3 font-medium">{t('Qty')}</th>
                <th className="pb-3 font-medium">{t('Urgency')}</th>
                <th className="pb-3 font-medium">{t('Responses')}</th>
                <th className="pb-3 font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {MY_REQUESTS.map((req) => (
                <tr key={req.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-mono text-xs font-semibold text-heading">{req.id}</td>
                  <td className="py-3 text-body">{req.partName}</td>
                  <td className="py-3 font-mono text-xs text-muted">{req.partNumber}</td>
                  <td className="py-3 text-body">{req.vehicle}</td>
                  <td className="py-3 text-body">{req.quantity}</td>
                  <td className="py-3">
                    <Badge background={URGENCY_STYLES[req.urgency].bg} color={URGENCY_STYLES[req.urgency].fg}>{t(req.urgency)}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Icon name="MessagesSquare" size={14} className="text-muted" />
                      <span className="text-body">{req.responses}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[req.status].bg} color={STATUS_STYLES[req.status].fg}>{t(req.status)}</Badge>
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
