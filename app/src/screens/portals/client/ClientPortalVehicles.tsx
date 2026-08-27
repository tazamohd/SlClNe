import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

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

  const columns: Column<Vehicle>[] = [
    { header: t('Vehicle'), cell: (v) => `${v.year} ${v.make} ${v.model}` },
    { header: t('Plate'), cell: (v) => v.plate },
    { header: t('Color'), cell: (v) => v.color },
    { header: t('Mileage'), cell: (v) => `${v.mileage.toLocaleString()} km` },
    { header: t('VIN'), cell: (v) => v.vin },
    { header: t('Status'), cell: (v) => <Badge background={STATUS_STYLES[v.status].bg} color={STATUS_STYLES[v.status].fg}>{t(v.status)}</Badge> },
  ]

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

      <DataTable
        caption="Client vehicle registry"
        columns={columns}
        rows={VEHICLES}
        rowKey={(v) => v.plate}
        mobileCard={(v) => (
          <>
            <MobileCardHeader title={`${v.year} ${v.make} ${v.model}`} trailing={<Badge background={STATUS_STYLES[v.status].bg} color={STATUS_STYLES[v.status].fg}>{t(v.status)}</Badge>} />
            <MobileCardRow label={t('Plate')}>{v.plate}</MobileCardRow>
            <MobileCardRow label={t('Mileage')}>{v.mileage.toLocaleString()} km</MobileCardRow>
            <MobileCardRow label={t('VIN')}>{v.vin}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
