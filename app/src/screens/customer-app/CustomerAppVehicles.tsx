import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface CustomerVehicle {
  make: string
  model: string
  year: number
  plate: string
  color: string
  mileage: string
  lastService: string
  nextService: string
  insurance: string
  status: 'Active' | 'In Service' | 'Needs Attention'
}

const VEHICLES: CustomerVehicle[] = [
  { make: 'Toyota', model: 'Camry', year: 2022, plate: 'RUH 4821', color: 'Pearl White', mileage: '45,200 km', lastService: 'Aug 15, 2026', nextService: 'Nov 15, 2026', insurance: 'Tawuniya Comprehensive', status: 'Active' },
  { make: 'Hyundai', model: 'Tucson', year: 2024, plate: 'RUH 6633', color: 'Phantom Black', mileage: '8,400 km', lastService: 'Jul 20, 2026', nextService: 'Jan 20, 2027', insurance: 'Al-Rajhi Takaful', status: 'Active' },
  { make: 'Nissan', model: 'Patrol', year: 2023, plate: 'RUH 1155', color: 'Moonlight Silver', mileage: '28,400 km', lastService: 'Jul 28, 2026', nextService: 'Oct 28, 2026', insurance: 'Tawuniya Comprehensive', status: 'In Service' },
  { make: 'Toyota', model: 'Land Cruiser', year: 2021, plate: 'RUH 7790', color: 'Attitude Black', mileage: '62,100 km', lastService: 'May 10, 2026', nextService: 'Aug 10, 2026', insurance: 'Medgulf', status: 'Needs Attention' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'In Service': { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  'Needs Attention': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
}

export function CustomerAppVehicles() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('My Vehicles'), value: String(VEHICLES.length), icon: 'Car', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('In Service'), value: String(VEHICLES.filter((v) => v.status === 'In Service').length), icon: 'Wrench', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Needs Attention'), value: String(VEHICLES.filter((v) => v.status === 'Needs Attention').length), icon: 'AlertTriangle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Total Mileage'), value: '144K', icon: 'Gauge', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Car" title={t('My Vehicles')} subtitle={t('Vehicle management')} />
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
        {VEHICLES.map((v) => (
          <MobileCard key={v.plate}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[var(--tint-blue)] p-1.5 text-salis-blue" aria-hidden><Icon name="Car" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{v.make} {v.model} {v.year}</p>
                    <p className="text-xs text-muted" dir="ltr">{v.plate}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[v.status].bg} color={STATUS_STYLES[v.status].fg}>{t(v.status)}</Badge>}
            />
            <MobileCardRow label={t('Color')} value={t(v.color)} />
            <MobileCardRow label={t('Mileage')} value={v.mileage} />
            <MobileCardRow label={t('Last Service')} value={v.lastService} />
            <MobileCardRow label={t('Next Service')} value={v.nextService} />
            <MobileCardRow label={t('Insurance')} value={v.insurance} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Car" title={t('My Vehicles')} subtitle={t('View and manage your registered vehicles')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {VEHICLES.map((v) => (
          <Card key={v.plate} className="flex flex-col gap-4 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex rounded-xl bg-[var(--tint-blue)] p-2.5 text-salis-blue" aria-hidden><Icon name="Car" size={22} /></span>
                <div>
                  <h3 className="font-display text-base font-bold text-heading">{v.make} {v.model} {v.year}</h3>
                  <p className="font-mono text-xs text-muted" dir="ltr">{v.plate}</p>
                </div>
              </div>
              <Badge background={STATUS_STYLES[v.status].bg} color={STATUS_STYLES[v.status].fg}>{t(v.status)}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-[13px]">
              <div>
                <p className="text-xs text-muted">{t('Color')}</p>
                <p className="mt-0.5 font-medium text-heading">{t(v.color)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t('Mileage')}</p>
                <p className="mt-0.5 font-mono font-medium text-heading" dir="ltr">{v.mileage}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t('Last Service')}</p>
                <p className="mt-0.5 text-body">{v.lastService}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t('Next Service')}</p>
                <p className="mt-0.5 text-body">{v.nextService}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted">{t('Insurance')}</p>
                <p className="mt-0.5 text-body">{v.insurance}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
