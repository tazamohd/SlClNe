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
  color: string
  mileage: number
  status: 'Active' | 'In Service' | 'Pending Pickup'
}

const VEHICLES: Vehicle[] = [
  { plate: 'RJD 4821', make: 'Toyota', model: 'Camry', year: 2022, vin: '1HGBH41JXMN109186', color: 'White', mileage: 34200, status: 'Active' },
  { plate: 'KSA 7193', make: 'Honda', model: 'Accord', year: 2021, vin: '2HGFC2F59MH512345', color: 'Silver', mileage: 48700, status: 'In Service' },
  { plate: 'DMM 2856', make: 'Hyundai', model: 'Tucson', year: 2023, vin: '5NMS3DAJ8PH123456', color: 'Black', mileage: 12100, status: 'Active' },
  { plate: 'JED 5034', make: 'Nissan', model: 'Altima', year: 2020, vin: '1N4BL4BV0LC123456', color: 'Blue', mileage: 67300, status: 'Pending Pickup' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  'In Service': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'Pending Pickup': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
}

export function ClientPortalVehicles() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Car" title={t('My Vehicles')} subtitle={t('Vehicle registry')} />
        {VEHICLES.map((v) => (
          <MobileCard key={v.plate}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Car" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{v.year} {v.make} {v.model}</p>
                    <p className="text-xs text-muted">{v.plate}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[v.status].bg} color={STATUS_STYLES[v.status].fg}>{t(v.status)}</Badge>}
            />
            <MobileCardRow label={t('Color')} value={v.color} />
            <MobileCardRow label={t('Mileage')} value={`${v.mileage.toLocaleString()} km`} />
            <MobileCardRow label={t('VIN')} value={v.vin} />
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('My Vehicles')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Registered vehicles and status')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Plate')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Color')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Mileage')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('VIN')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map((v) => (
                <tr key={v.plate} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{v.year} {v.make} {v.model}</td>
                  <td className="py-3 pe-4 font-mono text-body">{v.plate}</td>
                  <td className="py-3 pe-4 text-body">{v.color}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{v.mileage.toLocaleString()} km</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted">{v.vin}</td>
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
