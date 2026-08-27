import { useMemo } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface FleetVehicle {
  id: string
  vehicle: string
  plate: string
  driver: string
  status: string
  lastLocation: string
}

function useVehicles(t: (s: string) => string): FleetVehicle[] {
  return useMemo(
    () => [
      { id: 'FV-001', vehicle: t('Toyota Hilux'), plate: 'FLT 1001', driver: t('Saeed Al-Otaibi'), status: t('Active'), lastLocation: t('Riyadh - Industrial Area') },
      { id: 'FV-002', vehicle: t('Nissan Patrol'), plate: 'FLT 1002', driver: t('Omar Hassan'), status: t('Active'), lastLocation: t('Jeddah - Port Area') },
      { id: 'FV-003', vehicle: t('Ford F-150'), plate: 'FLT 1003', driver: t('Ali Mohammed'), status: t('In Service'), lastLocation: t('Workshop Bay 2') },
      { id: 'FV-004', vehicle: t('Isuzu D-Max'), plate: 'FLT 1004', driver: '—', status: t('Available'), lastLocation: t('Fleet Yard') },
      { id: 'FV-005', vehicle: t('Toyota Land Cruiser'), plate: 'FLT 1005', driver: t('Khalid Ibrahim'), status: t('Active'), lastLocation: t('Dammam - Highway 40') },
    ],
    [t],
  )
}

export function FleetTracking() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const vehicles = useVehicles(t)

  const active = vehicles.filter((v) => v.status === t('Active')).length
  const inService = vehicles.filter((v) => v.status === t('In Service')).length
  const available = vehicles.filter((v) => v.status === t('Available')).length

  const kpis = [
    { label: t('Total Fleet'), value: String(vehicles.length), icon: 'Truck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(active), icon: 'Navigation', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('In Service'), value: String(inService), icon: 'Wrench', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Available'), value: String(available), icon: 'CheckCircle', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
  ]

  function statusBadge(status: string) {
    if (status === t('Active')) return <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{status}</Badge>
    if (status === t('In Service')) return <Badge background="rgba(249,115,22,.1)" color="var(--salis-orange)">{status}</Badge>
    return <Badge background="rgba(11,31,59,.1)" color="var(--text-heading)">{status}</Badge>
  }

  const columns: Column<FleetVehicle>[] = [
    { header: 'Vehicle', cell: (v) => v.vehicle },
    { header: 'Plate', cell: (v) => v.plate, code: true },
    { header: 'Driver', cell: (v) => v.driver },
    { header: 'Last Location', cell: (v) => v.lastLocation },
    { header: 'Status', cell: (v) => statusBadge(v.status) },
  ]

  const table = (
    <DataTable
      caption="Fleet vehicles"
      columns={columns}
      rows={vehicles}
      rowKey={(v) => v.id}
      mobileCard={(v) => (
        <>
          <MobileCardHeader title={v.vehicle} trailing={statusBadge(v.status)} />
          <MobileCardRow label={t('Plate')}>{v.plate}</MobileCardRow>
          <MobileCardRow label={t('Driver')}>{v.driver}</MobileCardRow>
          <MobileCardRow label={t('Location')}>{v.lastLocation}</MobileCardRow>
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Truck" title={t('Fleet Tracking')} subtitle={t('Operations')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
              <p className="mt-1.5 text-[11px] text-muted">{k.label}</p>
              <p className="font-mono text-sm font-bold text-heading">{k.value}</p>
            </MobileCard>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Truck" title={t('Fleet Tracking')} subtitle={t('Operations')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
