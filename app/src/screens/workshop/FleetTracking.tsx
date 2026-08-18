import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

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
        {vehicles.map((v) => (
          <MobileCard key={v.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Truck" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{v.vehicle}</p>
                    <p className="font-mono text-xs text-muted" dir="ltr">{v.plate}</p>
                  </div>
                </div>
              }
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-muted">{v.lastLocation}</span>
              {statusBadge(v.status)}
            </div>
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
            <Icon name="Truck" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Fleet Tracking')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Operations')}</p>
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
        <h3 className="mb-4 text-base font-bold text-heading">{t('Fleet Vehicles')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Plate')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Driver')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Last Location')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{v.vehicle}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{v.plate}</td>
                  <td className="py-3 pe-4 text-body">{v.driver}</td>
                  <td className="py-3 pe-4 text-muted">{v.lastLocation}</td>
                  <td className="py-3">{statusBadge(v.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
