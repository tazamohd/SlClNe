import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const HOURS = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'] as const

const MOCK_HEATMAP_DATA = DAYS.map(day =>
  HOURS.map(hour => ({
    day,
    hour,
    value: Math.floor(Math.random() * 100),
  }))
).flat()

const MOCK_LOCATIONS = [
  { id: 'LOC-01', name: 'Main Branch', city: 'Riyadh', peakHour: '10AM', avgDemand: 87, status: 'High' },
  { id: 'LOC-02', name: 'North Branch', city: 'Riyadh', peakHour: '2PM', avgDemand: 65, status: 'Medium' },
  { id: 'LOC-03', name: 'Jeddah Center', city: 'Jeddah', peakHour: '11AM', avgDemand: 78, status: 'High' },
  { id: 'LOC-04', name: 'Dammam Hub', city: 'Dammam', peakHour: '9AM', avgDemand: 52, status: 'Medium' },
  { id: 'LOC-05', name: 'Al Khobar', city: 'Al Khobar', peakHour: '3PM', avgDemand: 34, status: 'Low' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  High: ['var(--tint-blue)', 'var(--salis-blue)'],
  Medium: ['var(--tint-orange)', 'var(--salis-orange)'],
  Low: ['rgba(100,116,139,.1)', '#64748B'],
}

function intensityColor(value: number): string {
  if (value >= 75) return 'rgba(10,94,215,.8)'
  if (value >= 50) return 'rgba(10,94,215,.5)'
  if (value >= 25) return 'rgba(10,94,215,.25)'
  return 'rgba(10,94,215,.08)'
}

type LocationRow = (typeof MOCK_LOCATIONS)[number]

export function BusinessHeatmaps() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [view, setView] = useState('demand')

  const kpis = [
    { label: t('Peak Hour'), value: '10AM', icon: 'Clock', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Peak Day'), value: t('Tuesday'), icon: 'Calendar', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Locations'), value: String(MOCK_LOCATIONS.length), icon: 'MapPin', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Avg Demand'), value: '63%', icon: 'TrendingUp', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const locationColumns: Column<LocationRow>[] = [
    { header: 'Location', cell: (loc) => loc.name },
    { header: 'City', cell: (loc) => loc.city },
    { header: 'Peak Hour', cell: (loc) => loc.peakHour },
    { header: 'Avg Demand', cell: (loc) => `${loc.avgDemand}%` },
    { header: 'Level', cell: (loc) => { const [bg, fg] = STATUS_COLORS[loc.status] ?? STATUS_COLORS.Low; return <Badge background={bg} color={fg}>{t(loc.status)}</Badge> } },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Grid3x3" title={t('Heatmaps')} subtitle={t('Business Intelligence')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_LOCATIONS.map(loc => {
          const [bg, fg] = STATUS_COLORS[loc.status] ?? STATUS_COLORS.Low
          return (
            <MobileCard key={loc.id}>
              <MobileCardHeader title={loc.name} trailing={<Badge background={bg} color={fg}>{t(loc.status)}</Badge>} />
              <MobileCardRow label={t('City')}>{loc.city}</MobileCardRow>
              <MobileCardRow label={t('Peak Hour')}>{loc.peakHour}</MobileCardRow>
              <MobileCardRow label={t('Avg Demand')}>{loc.avgDemand}%</MobileCardRow>
            </MobileCard>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Grid3x3" title={t('Business Heatmaps')} subtitle={t('Service demand patterns by time and location')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-heading">{t('Service Demand Heatmap')}</h3>
          <Select value={view} onChange={e => setView(e.target.value)} aria-label={t('Select view')}>
            <option value="demand">{t('Service Demand')}</option>
            <option value="revenue">{t('Revenue')}</option>
            <option value="wait">{t('Wait Time')}</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-2 pe-2 text-start text-xs font-medium text-muted" />
                {HOURS.map(h => (
                  <th key={h} className="pb-2 text-center text-[10px] font-medium text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td className="pe-2 text-xs font-medium text-muted">{t(day)}</td>
                  {HOURS.map(hour => {
                    const cell = MOCK_HEATMAP_DATA.find(c => c.day === day && c.hour === hour)
                    return (
                      <td key={hour} className="p-0.5">
                        <div
                          className="flex h-8 items-center justify-center rounded text-[10px] font-bold text-white"
                          style={{ background: intensityColor(cell?.value ?? 0) }}
                          title={`${t(day)} ${hour}: ${cell?.value ?? 0}%`}
                        >
                          {cell?.value ?? 0}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded" style={{ background: 'rgba(10,94,215,.08)' }} /> {t('Low')}</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded" style={{ background: 'rgba(10,94,215,.25)' }} /> {t('Medium')}</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded" style={{ background: 'rgba(10,94,215,.5)' }} /> {t('High')}</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded" style={{ background: 'rgba(10,94,215,.8)' }} /> {t('Very High')}</span>
        </div>
      </Card>

      <h3 className="text-[15px] font-bold text-heading">{t('Location Demand')}</h3>
      <DataTable
        caption="Location demand overview"
        columns={locationColumns}
        rows={[...MOCK_LOCATIONS]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Low
          return (
            <>
              <MobileCardHeader title={row.name} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('City')}>{row.city}</MobileCardRow>
              <MobileCardRow label={t('Peak Hour')}>{row.peakHour}</MobileCardRow>
              <MobileCardRow label={t('Avg Demand')}>{row.avgDemand}%</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
