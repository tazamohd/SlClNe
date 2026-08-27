import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  High: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Medium: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Low: ['rgba(100,116,139,.1)', '#64748B'],
}

function intensityColor(value: number): string {
  if (value >= 75) return 'rgba(10,94,215,.8)'
  if (value >= 50) return 'rgba(10,94,215,.5)'
  if (value >= 25) return 'rgba(10,94,215,.25)'
  return 'rgba(10,94,215,.08)'
}

export function BusinessHeatmaps() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [view, setView] = useState('demand')

  const kpis = [
    { label: t('Peak Hour'), value: '10AM', icon: 'Clock', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Peak Day'), value: t('Tuesday'), icon: 'Calendar', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Locations'), value: String(MOCK_LOCATIONS.length), icon: 'MapPin', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Demand'), value: '63%', icon: 'TrendingUp', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Grid3x3" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Business Heatmaps')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Service demand patterns by time and location')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
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

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Location Demand')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Location')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('City')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Peak Hour')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Avg Demand')}</th>
                <th className="pb-3 text-start font-medium">{t('Level')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LOCATIONS.map(loc => {
                const [bg, fg] = STATUS_COLORS[loc.status] ?? STATUS_COLORS.Low
                return (
                  <tr key={loc.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{loc.name}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{loc.city}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{loc.peakHour}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{loc.avgDemand}%</td>
                    <td className="py-3"><Badge background={bg} color={fg}>{t(loc.status)}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
