import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface Vehicle {
  plate: string
  make: string
  model: string
  year: number
  vin: string
  owner: string
  mileage: string
  lastService: string
  status: 'Active' | 'In Service' | 'Awaiting Pickup' | 'Inactive'
}

const VEHICLES: Vehicle[] = [
  { plate: 'RUH 4821', make: 'Toyota', model: 'Camry', year: 2022, vin: 'JTDKN3DU5N0..', owner: 'Ahmed Al-Rashid', mileage: '45,200 km', lastService: 'Aug 15, 2026', status: 'Active' },
  { plate: 'JED 7732', make: 'Hyundai', model: 'Sonata', year: 2024, vin: '5NPE34AF5R0..', owner: 'Khalid Mohammed', mileage: '12,800 km', lastService: 'Aug 10, 2026', status: 'In Service' },
  { plate: 'RUH 1155', make: 'Nissan', model: 'Patrol', year: 2023, vin: 'JN1TBNT32Z0..', owner: 'Fatima Al-Saud', mileage: '28,400 km', lastService: 'Jul 28, 2026', status: 'In Service' },
  { plate: 'DMM 3349', make: 'Toyota', model: 'Hilux', year: 2021, vin: 'MR0HZ29G5M0..', owner: 'Omar Hassan', mileage: '72,100 km', lastService: 'Aug 05, 2026', status: 'Awaiting Pickup' },
  { plate: 'RUH 9081', make: 'Kia', model: 'Sportage', year: 2023, vin: 'KNAPH81A5P0..', owner: 'Nora Al-Fahd', mileage: '18,600 km', lastService: 'Jul 20, 2026', status: 'Active' },
  { plate: 'JED 5567', make: 'GMC', model: 'Sierra', year: 2020, vin: '1GTP9EEL5L0..', owner: 'Yusuf Ibrahim', mileage: '95,300 km', lastService: 'Aug 12, 2026', status: 'Active' },
  { plate: 'RUH 2240', make: 'Chevrolet', model: 'Tahoe', year: 2022, vin: '1GNSKBKD3N0..', owner: 'Sara Al-Mutairi', mileage: '38,700 km', lastService: 'Jun 15, 2026', status: 'Inactive' },
  { plate: 'MKH 8814', make: 'Lexus', model: 'ES350', year: 2024, vin: 'JTHBA1D20R0..', owner: 'Tariq Al-Dosari', mileage: '8,200 km', lastService: 'Aug 14, 2026', status: 'Active' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'In Service': { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  'Awaiting Pickup': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Inactive: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function PortalVehicles() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Vehicles'), value: '1,842', icon: 'Car', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('In Service'), value: '18', icon: 'Wrench', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Awaiting Pickup'), value: '6', icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('New This Month'), value: '34', icon: 'Plus', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Car" title={t('Vehicles')} subtitle={t('Vehicle registry')} />
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
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Car" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{v.make} {v.model} {v.year}</p>
                    <p className="text-xs text-muted" dir="ltr">{v.plate}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[v.status].bg} color={STATUS_STYLES[v.status].fg}>{t(v.status)}</Badge>}
            />
            <MobileCardRow label={t('Owner')} value={v.owner} />
            <MobileCardRow label={t('Mileage')} value={v.mileage} />
            <MobileCardRow label={t('Last Service')} value={v.lastService} />
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
            <Icon name="Car" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Vehicles')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Registered vehicles and service status')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Plate')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Owner')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('VIN')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Mileage')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Last Service')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map((v) => (
                <tr key={v.plate} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono font-semibold text-heading" dir="ltr">{v.plate}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{v.make} {v.model} {v.year}</td>
                  <td className="py-3 pe-4 text-body">{v.owner}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{v.vin}</td>
                  <td className="py-3 pe-4 text-end text-body" dir="ltr">{v.mileage}</td>
                  <td className="py-3 pe-4 text-muted">{v.lastService}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[v.status].bg} color={STATUS_STYLES[v.status].fg}>{t(v.status)}</Badge>
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
