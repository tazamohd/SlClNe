import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

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
        {requests.map((r) => (
          <MobileCard key={r.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(249,115,22,.1)] text-salis-orange" aria-hidden><Icon name="Truck" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.customer}</p>
                    <p className="text-xs text-muted">{r.location}</p>
                  </div>
                </div>
              }
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-muted">{r.eta !== '—' ? `ETA: ${r.eta}` : r.driver}</span>
              {statusBadge(r.status)}
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Towing Assistance')}</h1>
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
        <h3 className="mb-4 text-base font-bold text-heading">{t('Towing Requests')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Request')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Customer')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Location')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Driver')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('ETA')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{r.id}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{r.customer}</td>
                  <td className="py-3 pe-4 text-body">{r.location}</td>
                  <td className="py-3 pe-4 text-muted">{r.driver}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-heading" dir="ltr">{r.eta}</td>
                  <td className="py-3">{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
