import { useMemo } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface TowRequest {
  id: string
  customer: string
  location: string
  status: string
  eta: string
  driver: string
}

function useRequests(t: (s: string) => string): TowRequest[] {
  return useMemo(
    () => [
      { id: 'TOW-001', customer: t('Abdullah Al-Rashid'), location: t('King Fahd Road, Riyadh'), status: t('En Route'), eta: '15 min', driver: t('Saeed Al-Otaibi') },
      { id: 'TOW-002', customer: t('Faisal Mohammed'), location: t('Tahlia Street, Jeddah'), status: t('Dispatched'), eta: '25 min', driver: t('Omar Hassan') },
      { id: 'TOW-003', customer: t('Nasser Al-Qahtani'), location: t('Corniche, Dammam'), status: t('Requested'), eta: '—', driver: '—' },
      { id: 'TOW-004', customer: t('Turki Al-Saud'), location: t('Exit 15, Riyadh'), status: t('Completed'), eta: '—', driver: t('Ali Mohammed') },
      { id: 'TOW-005', customer: t('Hassan Ibrahim'), location: t('Airport Road, Jeddah'), status: t('Completed'), eta: '—', driver: t('Khalid Ibrahim') },
    ],
    [t],
  )
}

export function TowingAssistance() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const requests = useRequests(t)

  const active = requests.filter((r) => r.status !== t('Completed')).length
  const completed = requests.filter((r) => r.status === t('Completed')).length

  const kpis = [
    { label: t('Active Requests'), value: String(active), icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Completed Today'), value: String(completed), icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Response'), value: '18 min', icon: 'Clock', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Dispatched'), value: String(requests.filter((r) => r.status === t('Dispatched') || r.status === t('En Route')).length), icon: 'Truck', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
  ]

  function statusBadge(status: string) {
    if (status === t('En Route')) return <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{status}</Badge>
    if (status === t('Dispatched')) return <Badge background="rgba(11,179,255,.1)" color="var(--salis-blue-bright, #0BB3FF)">{status}</Badge>
    if (status === t('Requested')) return <Badge background="rgba(249,115,22,.1)" color="var(--salis-orange)">{status}</Badge>
    return <Badge background="rgba(11,31,59,.1)" color="var(--text-heading)">{status}</Badge>
  }

  const columns: Column<TowRequest>[] = [
    { header: 'Request', cell: (r) => r.id, code: true },
    { header: 'Customer', cell: (r) => r.customer },
    { header: 'Location', cell: (r) => r.location },
    { header: 'Driver', cell: (r) => r.driver },
    { header: 'ETA', cell: (r) => r.eta, code: true },
    { header: 'Status', cell: (r) => statusBadge(r.status) },
  ]

  const table = (
    <DataTable
      caption="Towing requests"
      columns={columns}
      rows={requests}
      rowKey={(r) => r.id}
      mobileCard={(r) => (
        <>
          <MobileCardHeader title={r.customer} trailing={statusBadge(r.status)} />
          <MobileCardRow label={t('Location')}>{r.location}</MobileCardRow>
          <MobileCardRow label={t('ETA')}>{r.eta}</MobileCardRow>
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Truck" title={t('Towing Assistance')} subtitle={t('Operations')} />
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
      <PageHeader icon="Truck" title={t('Towing Assistance')} subtitle={t('Operations')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
