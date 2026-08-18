import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const INCIDENTS = [
  { id: 'INC-001', date: '2026-08-15', type: 'Injury', severity: 'High', location: 'Workshop A', status: 'Investigating', description: 'Technician sustained minor burn during welding' },
  { id: 'INC-002', date: '2026-08-10', type: 'Near Miss', severity: 'Medium', location: 'Paint Bay', status: 'Resolved', description: 'Loose scaffolding detected before use' },
  { id: 'INC-003', date: '2026-08-05', type: 'Property Damage', severity: 'Low', location: 'Parking Area', status: 'Closed', description: 'Minor dent to customer vehicle during wash' },
  { id: 'INC-004', date: '2026-07-28', type: 'Environmental', severity: 'Medium', location: 'Storage Room', status: 'Resolved', description: 'Oil spill contained in designated area' },
  { id: 'INC-005', date: '2026-08-17', type: 'Near Miss', severity: 'Critical', location: 'Lift Bay 3', status: 'Open', description: 'Hydraulic lift pressure drop during operation' },
  { id: 'INC-006', date: '2026-08-12', type: 'Injury', severity: 'Low', location: 'Workshop B', status: 'Investigating', description: 'Slip on wet floor near drainage area' },
] as const

const SEVERITY_PALETTE: Record<string, { bg: string; fg: string }> = {
  Low: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Medium: { bg: 'rgba(245,158,11,.12)', fg: '#B45309' },
  High: { bg: 'rgba(220,38,38,.1)', fg: '#DC2626' },
  Critical: { bg: 'rgba(220,38,38,.15)', fg: '#991B1B' },
}

const STATUS_PALETTE: Record<string, { bg: string; fg: string }> = {
  Open: { bg: 'rgba(220,38,38,.1)', fg: '#DC2626' },
  Investigating: { bg: 'rgba(245,158,11,.12)', fg: '#B45309' },
  Resolved: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Closed: { bg: 'rgba(100,116,139,.1)', fg: '#64748B' },
}

export function SafetyIncidents() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const openCount = INCIDENTS.filter((i) => i.status === 'Open' || i.status === 'Investigating').length
  const thisMonth = INCIDENTS.filter((i) => i.date >= '2026-08-01').length

  const kpis = [
    { label: t('Total Incidents'), value: String(INCIDENTS.length), icon: 'AlertTriangle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Open'), value: String(openCount), icon: 'AlertCircle', bg: 'rgba(220,38,38,.1)', fg: '#DC2626' },
    { label: t('This Month'), value: String(thisMonth), icon: 'Calendar', bg: 'rgba(245,158,11,.12)', fg: '#B45309' },
    { label: t('Avg Resolution Days'), value: '4.2', icon: 'Clock', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="AlertTriangle" title={t('Safety Incidents')} subtitle={t('Incident log')} />
        {INCIDENTS.map((inc, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="AlertTriangle" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{inc.id}</p>
                    <p className="text-xs text-muted">{inc.type}</p>
                  </div>
                </div>
              }
            />
            <MobileCardRow label={t('Date')} value={inc.date} />
            <MobileCardRow label={t('Location')} value={inc.location} />
            <MobileCardRow label={t('Severity')}>
              <Badge background={SEVERITY_PALETTE[inc.severity].bg} color={SEVERITY_PALETTE[inc.severity].fg}>{t(inc.severity)}</Badge>
            </MobileCardRow>
            <MobileCardRow label={t('Status')}>
              <Badge background={STATUS_PALETTE[inc.status].bg} color={STATUS_PALETTE[inc.status].fg}>{t(inc.status)}</Badge>
            </MobileCardRow>
            <p className="mt-1 text-xs text-muted">{inc.description}</p>
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
            <Icon name="AlertTriangle" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Safety Incidents')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Incident log')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('ID')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Severity')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Location')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 text-start font-medium">{t('Description')}</th>
              </tr>
            </thead>
            <tbody>
              {INCIDENTS.map((inc, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-medium text-heading">{inc.id}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{inc.date}</td>
                  <td className="py-3 pe-4 text-body">{t(inc.type)}</td>
                  <td className="py-3 pe-4">
                    <Badge background={SEVERITY_PALETTE[inc.severity].bg} color={SEVERITY_PALETTE[inc.severity].fg}>{t(inc.severity)}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-body">{inc.location}</td>
                  <td className="py-3 pe-4">
                    <Badge background={STATUS_PALETTE[inc.status].bg} color={STATUS_PALETTE[inc.status].fg}>{t(inc.status)}</Badge>
                  </td>
                  <td className="py-3 text-xs text-muted">{inc.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
