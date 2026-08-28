import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

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
  Active: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'In Service': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'Pending Pickup': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
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
      <PageHeader icon="Car" title={t('My Vehicles')} subtitle={t('Registered vehicles and status')} />

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
