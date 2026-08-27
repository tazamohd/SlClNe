import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const ZONES = [
  { code: 'A1', name: 'Main Floor', capacity: 500, utilized: 78, itemCount: 390, status: 'Active' },
  { code: 'A2', name: 'Mezzanine', capacity: 200, utilized: 92, itemCount: 184, status: 'Active' },
  { code: 'A3', name: 'Cold Storage', capacity: 80, utilized: 100, itemCount: 80, status: 'Full' },
  { code: 'A4', name: 'Hazmat', capacity: 50, utilized: 44, itemCount: 22, status: 'Active' },
  { code: 'A5', name: 'Receiving', capacity: 150, utilized: 0, itemCount: 0, status: 'Maintenance' },
  { code: 'A6', name: 'Shipping', capacity: 120, utilized: 65, itemCount: 78, status: 'Active' },
] as const

type Zone = (typeof ZONES)[number]

function statusColor(status: string) {
  if (status === 'Full') return { background: 'rgba(245,158,11,.1)', color: '#F59E0B' }
  if (status === 'Maintenance') return { background: 'rgba(249,115,22,.1)', color: '#F97316' }
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

  const columns: Column<Zone>[] = [
    { header: 'Code', cell: (zone) => <span className="font-mono text-xs text-muted" dir="ltr">{zone.code}</span> },
    { header: 'Zone Name', cell: (zone) => <span className="font-medium text-heading">{t(zone.name)}</span> },
    { header: 'Capacity', cell: (zone) => <span className="font-mono text-heading" dir="ltr">{zone.capacity}</span> },
    { header: 'Utilized', cell: (zone) => <span className="font-mono text-heading" dir="ltr">{zone.utilized}%</span> },
    { header: 'Items', cell: (zone) => <span className="font-mono text-heading" dir="ltr">{zone.itemCount}</span> },
    { header: 'Status', cell: (zone) => <Badge {...statusColor(zone.status)}>{t(zone.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Warehouse" title={t('Internal Warehouse')} subtitle={t('Warehouse zones and locations')} />

      <div className={isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'}>
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Warehouse zones"
        columns={columns}
        rows={[...ZONES] as unknown as Zone[]}
        rowKey={(zone) => zone.code}
        empty={t('No warehouse zones found')}
        mobileCard={(zone) => (
          <>
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
          </>
        )}
      />
    </div>
  )
}
