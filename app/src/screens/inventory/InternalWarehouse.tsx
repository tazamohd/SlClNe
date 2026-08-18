import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const ZONES = [
  { code: 'A1', name: 'Main Floor', capacity: 500, utilized: 78, itemCount: 390, status: 'Active' },
  { code: 'A2', name: 'Mezzanine', capacity: 200, utilized: 92, itemCount: 184, status: 'Active' },
  { code: 'A3', name: 'Cold Storage', capacity: 80, utilized: 100, itemCount: 80, status: 'Full' },
  { code: 'A4', name: 'Hazmat', capacity: 50, utilized: 44, itemCount: 22, status: 'Active' },
  { code: 'A5', name: 'Receiving', capacity: 150, utilized: 0, itemCount: 0, status: 'Maintenance' },
  { code: 'A6', name: 'Shipping', capacity: 120, utilized: 65, itemCount: 78, status: 'Active' },
] as const

function statusColor(status: string) {
  if (status === 'Full') return { background: 'rgba(245,158,11,.1)', color: '#F59E0B' }
  if (status === 'Maintenance') return { background: 'rgba(239,68,68,.1)', color: '#EF4444' }
  return { background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }
}

export function InternalWarehouse() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totalCapacity = ZONES.reduce((sum, z) => sum + z.capacity, 0)
  const totalItems = ZONES.reduce((sum, z) => sum + z.itemCount, 0)
  const avgUtilization = Math.round(totalItems / totalCapacity * 100)
  const activeZones = ZONES.filter((z) => z.status === 'Active').length

  const kpis = [
    { label: t('Total Zones'), value: String(ZONES.length), icon: 'LayoutGrid', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Capacity'), value: String(totalCapacity), icon: 'Warehouse', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Utilization'), value: `${avgUtilization}%`, icon: 'BarChart3', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active Zones'), value: String(activeZones), icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Warehouse" title={t('Warehouse')} subtitle={t('Zones & Locations')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-lg font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {ZONES.map((zone) => (
          <MobileCard key={zone.code}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Warehouse" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(zone.name)}</p>
                    <p className="text-xs text-muted" dir="ltr">{zone.code}</p>
                  </div>
                </div>
              }
              trailing={<Badge {...statusColor(zone.status)}>{t(zone.status)}</Badge>}
            />
            <MobileCardRow label={t('Capacity')} value={String(zone.capacity)} />
            <MobileCardRow label={t('Utilized')} value={`${zone.utilized}%`} />
            <MobileCardRow label={t('Items')} value={String(zone.itemCount)} />
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
            <Icon name="Warehouse" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Internal Warehouse')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Warehouse zones and locations')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Code')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Zone Name')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Capacity')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Utilized')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Items')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((zone) => (
                <tr key={zone.code} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{zone.code}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{t(zone.name)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{zone.capacity}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{zone.utilized}%</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{zone.itemCount}</td>
                  <td className="py-3">
                    <Badge {...statusColor(zone.status)}>{t(zone.status)}</Badge>
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
